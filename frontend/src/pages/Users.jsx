import React, { useEffect, useState } from 'react';
import { LedgerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Shield, Trash2, UserCheck, Search, AlertCircle, UserPlus, Edit2, X } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', status: '' });
  const [addFormData, setAddFormData] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const { user } = useAuth(); // Logged in user (must be Admin to see this page)

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Real API call to your Express backend
      const responsePayload = await LedgerAPI.getUsers();
      // Ensure we are setting an array even if the backend returns nothing
      // Backend returns { success: true, data: [...] }
      setUsers(Array.isArray(responsePayload) ? responsePayload : responsePayload.data || responsePayload.users || []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError('Failed to fetch users. Ensure the server is running and you have Admin rights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        // Real API Delete call using MongoDB _id
        await LedgerAPI.deleteUser(id);
        // Remove from local state instantly for snappy UI
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        console.error("Delete Error:", err);
        alert(err.response?.data?.message || "Failed to delete user.");
      }
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, status: u.status || 'Active' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await LedgerAPI.updateUserRole(editingUser._id, formData);
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...formData } : u));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await LedgerAPI.register(addFormData);
      if (data.success) {
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '', password: '', role: 'Viewer' });
        fetchUsers();
      }
    } catch (err) {
      console.error("Add User Error:", err);
      alert(err.response?.data?.message || "Failed to add user.");
    }
  };

  // Pristine Light theme role badge colors
  const getRoleStyle = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Analyst': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500 pb-10">

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-2">Provisioning and access control for the platform.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4 mr-2" /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-lg w-96 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input type="text" placeholder="Search by name or email..." className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-widest font-bold text-slate-500 border-b border-slate-200 bg-slate-50/50">
          <div className="col-span-3">User Name</div>
          <div className="col-span-4">Email Address</div>
          <div className="col-span-2 text-center">Role Status</div>
          <div className="col-span-2 text-center">Account State</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* User Rows */}
        <div className="flex-1">
          {error ? (
            <div className="flex justify-center items-center h-48 text-rose-600 font-medium">
              <AlertCircle className="w-5 h-5 mr-2" /> {error}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-48 text-slate-400 font-medium animate-pulse">
              Loading user roster...
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-slate-400 font-medium">
              No users found.
            </div>
          ) : users.map((u) => (
            <div
              key={u._id} // Using MongoDB _id
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors last:border-0 group"
            >
              <div className="col-span-3 font-bold text-sm text-slate-900 truncate">{u.name}</div>
              <div className="col-span-4 text-sm text-slate-500 truncate">{u.email}</div>
              <div className="col-span-2 flex justify-center">
                <span className={`px-2 py-1 border rounded-md text-[10px] uppercase tracking-wider font-bold ${getRoleStyle(u.role)}`}>
                  {u.role}
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border ${
                  (u.status || 'Active') === 'Active' 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                    : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}>
                  {/* Reuse AlertCircle or UserCheck depending on status */}
                  {(u.status || 'Active') === 'Active' ? <UserCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} 
                  {u.status || 'Active'}
                </span>
              </div>

              <div className="col-span-1 text-right flex justify-end gap-1">
                {/* Prevent the Admin from deleting themselves! */}
                {user?._id !== u._id ? (
                  <>
                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic mt-1.5">You</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white shadow-2xl border border-slate-200 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">System Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
                  <option value="Viewer">Viewer</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white shadow-2xl border border-slate-200 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">Add New User</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input type="text" required value={addFormData.name} onChange={e => setAddFormData({ ...addFormData, name: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                <input type="email" required value={addFormData.email} onChange={e => setAddFormData({ ...addFormData, email: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                <input type="password" required minLength="6" value={addFormData.password} onChange={e => setAddFormData({ ...addFormData, password: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">System Role</label>
                <select value={addFormData.role} onChange={e => setAddFormData({ ...addFormData, role: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
                  <option value="Viewer">Viewer</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-2">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;