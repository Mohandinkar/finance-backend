import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Landmark, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await LedgerAPI.login(formData);
      login(res.user, res.token);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mr-3 shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">The Ledger</h1>
        </div>

        {/* Custom Tabs using React Router Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all text-slate-500 hover:text-slate-700"
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-500">Email Address</label>
            <input
              type="email" name="email" required
              className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.email} onChange={handleInputChange} placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500">Password</label>
              <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Forgot password?</a>
            </div>
            <input
              type="password" name="password" required
              className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.password} onChange={handleInputChange} placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-70 group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Ledger'}
            {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;