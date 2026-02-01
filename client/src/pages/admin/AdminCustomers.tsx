
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Loader, Users, Mail, Calendar, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const AdminCustomers = () => {
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100');
      return res.data;
    }
  });

  // Handle both array and paginated response formats
  const customers = Array.isArray(customersData) ? customersData : customersData?.users || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 text-red-600">
        <p>Failed to load customers. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length || 0} registered users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : !customers || customers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No customers yet</h3>
          <p className="text-gray-500">Customers will appear here when they register.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Customer</th>
                <th className="p-4 hidden md:table-cell">Email</th>
                <th className="p-4 hidden lg:table-cell">Joined</th>
                <th className="p-4 hidden md:table-cell">Orders</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer: any) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500 md:hidden">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      <span className="text-sm">{formatDate(customer.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingBag size={14} />
                      <span className="text-sm">{customer._count?.orders || 0}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {customer.isAdmin ? (
                      <Badge variant="info">
                        <ShieldCheck size={12} className="mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="default">Customer</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
