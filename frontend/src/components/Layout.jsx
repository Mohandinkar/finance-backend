import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  // Helper function to colorize the role badge based on the backend role
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Analyst':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white flex items-center justify-between px-8 z-10 border-b border-slate-200 shadow-sm">

          {/* Search Bar */}
          <div className="flex bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg items-center w-96 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search transactions, categories..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center space-x-6">

            {/* Notification Bell */}
            <button className="relative text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
              <div className="text-right flex flex-col items-end">
                <p className="text-sm font-bold text-slate-800">{user?.name || 'Guest'}</p>
                {/* Dynamic Role Badge */}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mt-0.5 ${getRoleBadgeStyle(user?.role)}`}>
                  {user?.role || 'Viewer'}
                </span>
              </div>

              {/* Avatar Initial */}
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                {user?.name
                  ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'G'}
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area (Where your pages render) */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;