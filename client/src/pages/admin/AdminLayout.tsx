
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, ShoppingBag, List, Tag, Users, Package, Settings, Mail } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

export const AdminLayout = () => {
    const { user } = useAuthStore();

    if (!user || !user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
        { icon: Package, label: 'Orders', path: '/admin/orders' },
        { icon: List, label: 'Categories', path: '/admin/categories' },
        { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
        { icon: Users, label: 'Customers', path: '/admin/customers' },
        { icon: Mail, label: 'Newsletter', path: '/admin/newsletter' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Navbar */}
            <AdminNavbar />
            
            <div className="flex min-h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
                    <div className="p-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Navigation</h2>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                                        isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
