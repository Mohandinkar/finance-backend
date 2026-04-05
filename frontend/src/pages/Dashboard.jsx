import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ArrowRight, AlertCircle, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LedgerAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, amount, trend, isPositive }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className="flex justify-between mb-4">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      {trend && (
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend}
        </div>
      )}
    </div>
    <div className="text-3xl font-bold tracking-tight text-slate-900">
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)}
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        // Fetch the JSON from the backend
        const response = await LedgerAPI.getDashboardSummary();

        // Axios puts your JSON inside a '.data' property. 
        // So response.data is the { success: true, data: { ... } } object you pasted.
        const payload = response.data?.data || response.data || response;

        setData({
          // Map to the 'overview' object
          totalIncome: payload.overview?.totalIncome || 0,
          totalExpenses: payload.overview?.totalExpense || 0,
          netBalance: payload.overview?.netBalance || 0,

          // Map to the 'recentActivity' array
          recentTransactions: payload.recentActivity || [],

          // --- UPDATE THIS LINE ---
          chartData: payload.chartData || []
        });

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to connect to the server. Please ensure your backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const response = await LedgerAPI.getRecords({ limit: 1000 });
      let records = Array.isArray(response) ? response : (response.records || response.data || []);
      
      if (records.length === 0) {
        alert("No records to export.");
        setIsGenerating(false);
        return;
      }

      // Convert to CSV
      const headers = ['Date', 'Category', 'Type', 'Amount', 'Notes'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      records.forEach(row => {
        // Enforce YYYY-MM-DD string format and wrap in explicit string tokens so Excel doesn't misinterpret the width
        const dateString = new Date(row.date).toISOString().split('T')[0];
        const date = `="${dateString}"`;
        const category = `"${(row.category || '').replace(/"/g, '""')}"`;
        const type = row.type;
        const amount = Math.abs(row.amount);
        const notes = `"${(row.notes || '').replace(/"/g, '""')}"`;
        
        csvRows.push(`${date},${category},${type},${amount},${notes}`);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error generating CSV report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-medium">
        <div className="animate-pulse">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-xl border border-rose-200 flex items-center max-w-lg">
          <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Overview</h1>
          <p className="text-slate-500 mt-2">Real-time fiscal monitoring for the current period.</p>
        </div>
        <button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition-all"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Compiling...</>
          ) : (
            <><Download className="w-4 h-4 mr-2" /> Generate Report</>
          )}
        </button>
      </div>

      {/* Top Row - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" amount={data.totalIncome} isPositive={true} />
        <StatCard title="Total Expenses" amount={data.totalExpenses} isPositive={false} />
        <StatCard title="Net Balance" amount={data.netBalance} isPositive={data.netBalance >= 0} />
      </div>

      {/* Middle Row - Monthly Performance Bar Chart */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-96 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Monthly Performance</h2>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>Income</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>Expenses</div>
          </div>
        </div>

        {data.chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
            No chart data available yet.
          </div>
        )}
      </div>

      {/* Bottom Row - Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <button onClick={() => navigate('/records')} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors">
            View All <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>

        <div className="p-2">
          {data.recentTransactions.length > 0 ? (
            data.recentTransactions.map((tx, index) => (
              <div key={tx._id || index} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {tx.category ? tx.category.charAt(0).toUpperCase() : '$'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{tx.category || 'Transaction'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'Income' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(tx.amount))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 font-medium">
              No recent transactions found. Go to the Records tab to add some!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;