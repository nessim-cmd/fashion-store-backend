
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Loader, Users, Mail, Calendar, ShieldCheck, ShoppingBag, Trash2, MoreVertical, Shield } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100');
      return res.data;
    }
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => 
      api.put(`/users/${userId}`, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
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
                <th className="p-4 text-right">Actions</th>
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
                  <td className="p-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === customer.id ? null : customer.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === customer.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg z-10">
                          <button
                            onClick={() => {
                              setSelectedUser(customer);
                              setShowRoleModal(true);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Shield size={14} />
                            {customer.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(customer);
                              setShowDeleteModal(true);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 size={14} />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedUser.name}</strong> ({selectedUser.email})? 
              This action cannot be undone and will remove all their data.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteMutation.mutate(selectedUser.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Change User Role</h3>
            <p className="text-gray-600 mb-6">
              {selectedUser.isAdmin ? (
                <>Are you sure you want to remove admin privileges from <strong>{selectedUser.name}</strong>?</>
              ) : (
                <>Are you sure you want to make <strong>{selectedUser.name}</strong> an admin? They will have full access to the admin panel.</>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateRoleMutation.mutate({ 
                  userId: selectedUser.id, 
                  isAdmin: !selectedUser.isAdmin 
                })}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? 'Updating...' : (selectedUser.isAdmin ? 'Remove Admin' : 'Make Admin')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
