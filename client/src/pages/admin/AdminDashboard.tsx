
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { DollarSign, ShoppingBag, Users as UsersIcon, TrendingUp, Package, ArrowRight, Loader } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useSettingsStore } from '../../store/useSettingsStore';

export const AdminDashboard = () => {
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Fetch basic stats - in production you'd have a dedicated stats endpoint
      const [products, orders, users] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/orders/admin/all?limit=1000').catch(() => ({ data: { orders: [] } })),
        api.get('/users').catch(() => ({ data: { users: [] } }))
      ]);
      
      const allOrders = orders.data?.orders || [];
      const totalRevenue = allOrders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
      
      return {
        totalProducts: products.data?.total || 0,
        totalOrders: allOrders.length,
        totalCustomers: users.data?.users?.length || users.data?.total || 0,
        totalRevenue
      };
    }
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/admin/all?limit=5');
      return res.data?.orders || [];
    }
  });

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: formatPrice(stats?.totalRevenue || 0), 
      icon: DollarSign, 
      change: '+12%',
      color: 'bg-green-50 text-green-600'
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingBag, 
      change: '+8%',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      label: 'Customers', 
      value: stats?.totalCustomers || 0, 
      icon: UsersIcon, 
      change: '+24%',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      label: 'Products', 
      value: stats?.totalProducts || 0, 
      icon: Package, 
      change: '+5%',
      color: 'bg-orange-50 text-orange-600'
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      'DELIVERED': 'success',
      'PROCESSING': 'info',
      'SHIPPED': 'info',
      'PENDING': 'warning',
      'CANCELLED': 'error'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tight mb-1">
              {statsLoading ? <Loader className="animate-spin" size={24} /> : stat.value}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest">Recent Orders</h2>
          <Link 
            to="/admin/orders"
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        
        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-gray-400" size={24} />
          </div>
        ) : !recentOrders || recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" />
            <p>No orders yet</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Order</th>
                <th className="p-4 hidden md:table-cell">Customer</th>
                <th className="p-4 hidden lg:table-cell">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 hidden md:table-cell text-gray-600">{order.user?.name || 'Guest'}</td>
                  <td className="p-4 hidden lg:table-cell text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="p-4 font-bold">{formatPrice(order.total)}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link 
          to="/admin/products" 
          className="p-6 bg-black text-white hover:bg-gray-800 transition-colors group"
        >
          <Package size={24} className="mb-4" />
          <h3 className="font-bold text-lg mb-1">Manage Products</h3>
          <p className="text-gray-400 text-sm">Add, edit, or remove products from your catalog.</p>
          <ArrowRight size={16} className="mt-4 group-hover:translate-x-2 transition-transform" />
        </Link>
        
        <Link 
          to="/admin/orders" 
          className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-100"
        >
          <ShoppingBag size={24} className="mb-4 text-gray-700" />
          <h3 className="font-bold text-lg mb-1">View Orders</h3>
          <p className="text-gray-500 text-sm">Track and manage customer orders.</p>
          <ArrowRight size={16} className="mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
        </Link>
        
        <Link 
          to="/admin/coupons" 
          className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-100"
        >
          <TrendingUp size={24} className="mb-4 text-gray-700" />
          <h3 className="font-bold text-lg mb-1">Create Promotions</h3>
          <p className="text-gray-500 text-sm">Set up discount codes and special offers.</p>
          <ArrowRight size={16} className="mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
