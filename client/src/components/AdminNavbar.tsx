import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { Bell, LogOut, User, X, Home } from 'lucide-react';

export const AdminNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch admin notifications
  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications/admin');
      return res.data;
    },
    refetchInterval: 30000
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black text-white h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left - Brand */}
      <div className="flex items-center gap-6">
        <Link to="/admin" className="text-xl font-black tracking-tighter uppercase">
          Luxe<span className="text-gray-400">Admin</span>
        </Link>
        <Link 
          to="/" 
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Home size={14} />
          View Store
        </Link>
      </div>

      {/* Right - User & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-black border border-gray-200 shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-sm">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={16} className="text-gray-400 hover:text-black" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-sm text-gray-500 text-center">No new notifications</p>
                ) : (
                  notifications.slice(0, 10).map((notif: any) => (
                    <Link
                      key={notif.id}
                      to="/admin/orders"
                      onClick={() => setShowNotifications(false)}
                      className={`block p-4 border-b border-gray-50 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                    >
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              <Link
                to="/admin/orders"
                onClick={() => setShowNotifications(false)}
                className="block p-3 text-center text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-100"
              >
                View All Orders
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <User size={18} />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};
