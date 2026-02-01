import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, X, User as UserIcon, Search, Menu, Heart, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useCartStore((state) => state.items);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch wishlist count
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data;
    },
    enabled: !!user,
  });
  const wishlistCount = wishlistData?.length || 0;

  // Fetch user notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 60000 // Refetch every minute
  });
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
    setIsNotifOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { label: 'Shop All', path: '/shop' },
    { label: 'New Arrivals', path: '/shop?sort=newest' },
    { label: 'Men', path: '/shop?category=Men' },
    { label: 'Women', path: '/shop?category=Women' },
    { label: 'Accessories', path: '/shop?category=Accessories' },
    { label: 'Sale', path: '/shop?onSale=true' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="w-full mx-auto px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(true)} className="text-gray-900 mr-4">
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase">
              Luxe.
            </Link>
          </div>

          {/* Left: Brand - Desktop */}
          <div className="hidden md:flex items-center">
            <Link to="/" className="text-3xl font-black tracking-tighter uppercase">
              Luxe.
            </Link>
          </div>

          {/* Center: Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                to={item.path}
                className="text-[11px] lg:text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-900 hover:text-gray-500 transition-colors"
            >
              <Search size={20} />
            </button>
            
            <Link to="/wishlist" className="hidden md:block text-gray-900 hover:text-gray-500 transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Notification Bell for logged in users */}
            {user && (
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-gray-900 hover:text-gray-500 transition-colors relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllReadMutation.mutate()}
                          className="text-xs text-gray-500 hover:text-black"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-sm text-gray-500 text-center">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((notif: any) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              if (notif.type === 'ORDER_STATUS' || notif.type === 'ORDER_SHIPPED' || notif.type === 'ORDER_DELIVERED') {
                                navigate('/orders');
                                setIsNotifOpen(false);
                              }
                            }}
                          >
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      to="/orders"
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 text-center text-xs font-medium text-black hover:bg-gray-50 border-t border-gray-100"
                    >
                      View All Orders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative group hidden md:block">
                <button className="text-gray-900 hover:text-gray-500 transition-colors flex items-center gap-2 py-2">
                  <UserIcon size={20} />
                </button>
                <div className="absolute right-0 mt-0 pt-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-100 ease-out">
                  <div className="bg-white border border-gray-100 shadow-xl py-2">
                    <div className="px-6 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold uppercase text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.name}</p>
                    </div>
                    <Link to="/orders" className="block px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black hover:bg-gray-50">My Orders</Link>
                    <Link to="/wishlist" className="block px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black hover:bg-gray-50">Wishlist</Link>
                    <Link to="/profile" className="block px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black hover:bg-gray-50">Profile</Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black hover:bg-gray-50 flex items-center gap-2">
                        <Settings size={12} /> Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="block w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                <Link to="/login" className="hover:text-gray-500 transition-colors">Sign In</Link>
                <span className="text-gray-300">|</span>
                <Link to="/register" className="hover:text-gray-500 transition-colors">Join Us</Link>
              </div>
            )}

            <Link to="/cart" className="relative text-gray-900 hover:text-gray-500 transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-white"
          >
            <div className="h-20 px-6 md:px-12 lg:px-24 flex items-center justify-between border-b border-gray-100">
              <span className="text-2xl font-black tracking-tighter uppercase">Search</span>
              <button onClick={() => setIsSearchOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="max-w-2xl mx-auto px-6 py-12">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 text-2xl border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <button type="submit" className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">
                  Press Enter to Search
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white text-black"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <span className="text-2xl font-black tracking-tighter uppercase">Luxe.</span>
              <button onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex flex-col gap-6 items-center justify-center min-h-[70vh]">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} className="text-3xl font-black uppercase tracking-tighter hover:text-gray-500">
                  {item.label}
                </Link>
              ))}
              
              <div className="w-full border-t border-gray-100 my-4"></div>
              
              {user ? (
                <>
                  <Link to="/orders" className="text-xl font-bold uppercase tracking-widest hover:text-gray-500">My Orders</Link>
                  <Link to="/wishlist" className="text-xl font-bold uppercase tracking-widest hover:text-gray-500">Wishlist</Link>
                  <Link to="/profile" className="text-xl font-bold uppercase tracking-widest hover:text-gray-500">Profile</Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="text-xl font-bold uppercase tracking-widest hover:text-gray-500">Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-xl font-bold uppercase tracking-widest text-red-500 mt-4">Logout</button>
                </>
              ) : (
                <div className="flex flex-col gap-4 text-center">
                  <Link to="/login" className="text-xl font-bold uppercase tracking-widest">Sign In</Link>
                  <Link to="/register" className="text-xl font-bold uppercase tracking-widest text-gray-500">Join Us</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
