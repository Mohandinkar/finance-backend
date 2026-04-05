import React, { useEffect, useState } from 'react';
import { Plus, X, AlertCircle, Search, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { LedgerAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transform -translate-y-1 transition-all">
        <div
          className="w-3.5 h-3.5 rounded-full shadow-md border border-white/20"
          style={{ backgroundColor: data.payload.color }}
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {data.name} Allocation
          </span>
          <span className="text-base font-black text-white tracking-tight">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const Records = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', category: '', type: 'Expense', amount: '', notes: '' });

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await LedgerAPI.getRecords({ page: 1, limit: 50 });
      let validData = Array.isArray(data) ? data : (data.records || data.data || []);
      setRecords(validData);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const recordToSubmit = {
        ...newRecord,
        amount: newRecord.type === 'Expense' ? -Math.abs(Number(newRecord.amount)) : Math.abs(Number(newRecord.amount))
      };
      await LedgerAPI.addRecord(recordToSubmit);
      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      alert("Error adding record.");
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Records Data Grid</h1>
        {user?.role === 'Admin' && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </button>
        )}
      </div>

      {/* Analytics & Filters Area */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 group">

        {/* Advanced Filter Bar */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 p-6 space-y-5">
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
            <Filter className="w-4 h-4 mr-2 text-blue-500" /> Filter & Sort Controls
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Search Box */}
            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Search</label>
              <Search className="w-4 h-4 absolute left-3 top-[34px] text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300"
              />
            </div>

            {/* Type Filter */}
            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Transaction Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300 cursor-pointer appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Income">Income Only</option>
                <option value="Expense">Expense Only</option>
              </select>
              <div className="absolute right-3 top-[34px] pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Date Range Start */}
            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
              <Calendar className="w-4 h-4 absolute left-3 top-[34px] text-slate-400 pointer-events-none group-focus-within/input:text-blue-500 transition-colors" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300 cursor-pointer"
              />
            </div>

            {/* Date Range End */}
            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
              <Calendar className="w-4 h-4 absolute left-3 top-[34px] text-slate-400 pointer-events-none group-focus-within/input:text-blue-500 transition-colors" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Pie Chart */}
        <div className="lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-center">
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
            <ArrowUpDown className="w-4 h-4 mr-2 text-blue-500" /> Distribution
          </div>
          <div className="flex-1 min-h-[140px] w-full relative">
            {(() => {
              // Calculate filtered totals dynamically
              let currentIncome = 0;
              let currentExpense = 0;

              const filteredForChart = (Array.isArray(records) ? records : []).filter(record => {
                const matchesSearch = record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesType = filterType === 'All' || record.type === filterType;

                const recordDate = new Date(record.date).getTime();
                const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
                const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
                const matchesDate = recordDate >= start && recordDate <= end;

                return matchesSearch && matchesType && matchesDate;
              });

              filteredForChart.forEach(r => {
                if (r.type === 'Income') currentIncome += Math.abs(r.amount);
                if (r.type === 'Expense') currentExpense += Math.abs(r.amount);
              });

              const pieData = [
                { name: 'Income', value: currentIncome, color: '#10b981' },
                { name: 'Expense', value: currentExpense, color: '#f43f5e' }
              ].filter(item => item.value > 0);

              if (pieData.length === 0) {
                return <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">No Data</div>;
              }

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none" paddingAngle={2}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={<CustomPieTooltip />}
                      cursor={{ fill: 'transparent' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
          <div className="col-span-2 cursor-pointer hover:text-blue-600" onClick={() => setSortConfig({ key: 'date', direction: sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}>
            Date {sortConfig.key === 'date' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
          </div>
          <div className="col-span-4 cursor-pointer hover:text-blue-600" onClick={() => setSortConfig({ key: 'category', direction: sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
            Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-right cursor-pointer hover:text-blue-600" onClick={() => setSortConfig({ key: 'amount', direction: sortConfig.key === 'amount' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}>
            Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
          </div>
          <div className="col-span-2 text-right">Notes</div>
        </div>

        <div>
          {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> :
            records.length === 0 ? <div className="p-8 text-center text-slate-400">No records found.</div> :
              (() => {
                const filteredAndSortedRecords = (Array.isArray(records) ? records : []).filter(record => {
                  const matchesSearch = record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchesType = filterType === 'All' || record.type === filterType;

                  const recordDate = new Date(record.date).getTime();
                  // Correct proper start/end day bounds
                  const start = dateRange.start ? new Date(dateRange.start + 'T00:00:00').getTime() : 0;
                  const end = dateRange.end ? new Date(dateRange.end + 'T23:59:59').getTime() : Infinity;
                  const matchesDate = recordDate >= start && recordDate <= end;

                  return matchesSearch && matchesType && matchesDate;
                }).sort((a, b) => {
                  let valA = a[sortConfig.key];
                  let valB = b[sortConfig.key];

                  if (sortConfig.key === 'date') {
                    valA = new Date(a.date).getTime();
                    valB = new Date(b.date).getTime();
                  } else if (sortConfig.key === 'amount') {
                    valA = Math.abs(a.amount);
                    valB = Math.abs(b.amount);
                  } else if (sortConfig.key === 'category') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                  }

                  if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                  if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                  return 0;
                });

                if (filteredAndSortedRecords.length === 0) return <div className="p-8 text-center text-slate-400 font-medium">No records match your filters.</div>;

                return filteredAndSortedRecords.map((row) => (
                  <div key={row._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 items-center hover:bg-slate-50">
                    <div className="col-span-2 text-sm text-slate-500">{new Date(row.date).toLocaleDateString()}</div>
                    <div className="col-span-4 font-bold text-sm text-slate-900">{row.category}</div>
                    <div className="col-span-2 text-center"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${row.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{row.type}</span></div>
                    <div className={`col-span-2 text-right text-sm font-bold ${row.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.type === 'Income' ? '+' : '-'}${Math.abs(row.amount).toFixed(2)}
                    </div>
                    <div className="col-span-2 flex justify-end relative group">
                      {/* The Truncated Text shown in the table */}
                      <div className="text-xs text-slate-500 truncate max-w-[150px] cursor-help font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                        {row.notes || "—"}
                      </div>

                      {/* The Modern Tooltip (Visible on Hover) */}
                      {row.notes && (
                        <div className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 origin-bottom-right border border-slate-700">
                          <div className="font-bold text-blue-400 mb-1 flex items-center uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                            Record Details
                          </div>
                          <p className="leading-relaxed text-slate-200 leading-normal italic">
                            "{row.notes}"
                          </p>
                          {/* Decorative arrow */}
                          <div className="absolute top-full right-4 w-3 h-3 bg-slate-900 rotate-45 -translate-y-1.5 border-r border-b border-slate-700"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white shadow-2xl border border-slate-200 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-6">New Record</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input type="date" required value={newRecord.date} onChange={e => setNewRecord({ ...newRecord, date: e.target.value })} className="w-full border p-2 rounded" />
              <select value={newRecord.type} onChange={e => setNewRecord({ ...newRecord, type: e.target.value })} className="w-full border p-2 rounded">
                <option value="Expense">Expense</option><option value="Income">Income</option>
              </select>
              <input type="text" required placeholder="Category" value={newRecord.category} onChange={e => setNewRecord({ ...newRecord, category: e.target.value })} className="w-full border p-2 rounded" />
              <input type="number" step="0.01" required placeholder="Amount" value={newRecord.amount} onChange={e => setNewRecord({ ...newRecord, amount: e.target.value })} className="w-full border p-2 rounded" />
              <div className="space-y-1.5 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Describe this transaction..."
                    value={newRecord.notes}
                    onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;