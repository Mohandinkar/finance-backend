import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookText, Users, ChevronRight, LogOut, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // We only include the pages we actually built APIs for. 
  // User Management is strictly hidden if you aren't an Admin.
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Records', path: '/records', icon: BookText },
    ...(user?.role === 'Admin' ? [{ name: 'User Management', path: '/users', icon: Users }] : []),
  ];

  return (
    <div className="w-72 bg-slate-50 flex flex-col pt-8 pb-6 px-6 relative border-r border-slate-200">

      {/* Logo Area */}
      <div className="flex items-center mb-12 px-2">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mr-3 shadow-md shrink-0 text-white">
          <Landmark className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">The Ledger</h1>
      </div>

      <div className="text-xs uppercase tracking-widest text-slate-400 mb-4 px-2 font-bold">
        Overview
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {/* We wrap the inside in a function so ChevronRight can see isActive */}
            {({ isActive }) => (
              <>
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Clean and simple Sign Out */}
      <div className="mt-8 space-y-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;