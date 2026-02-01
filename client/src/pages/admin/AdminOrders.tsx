import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Loader, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useSettingsStore } from '../../store/useSettingsStore';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'warning' },
  { value: 'PROCESSING', label: 'Processing', icon: Package, color: 'info' },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'info' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'error' },
] as const;

export const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/orders/admin/all${params}`);
      return res.data;
    }
  });

  const orders = ordersData?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await api.put(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    if (!statusConfig) return <Badge>{status}</Badge>;
    
    return (
      <Badge variant={statusConfig.color as any}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{ordersData?.total || orders.length || 0} total orders</p>
        </div>
        <div className="flex gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Orders' },
              ...ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))
            ]}
            className="w-40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No orders yet</h3>
          <p className="text-gray-500">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Order</th>
                <th className="p-4 hidden md:table-cell">Customer</th>
                <th className="p-4 hidden lg:table-cell">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div>
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-4">
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Update */}
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current Status</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <Select
                value={selectedOrder.status}
                onChange={(e) => {
                  updateStatusMutation.mutate({ 
                    id: selectedOrder.id, 
                    status: e.target.value 
                  });
                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                }}
                options={ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                className="w-40"
              />
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Customer</p>
                <p className="font-medium">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Shipping Address</p>
                <div className="text-sm text-gray-600">
                  <p>{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.streetAddress}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Items</p>
              <div className="space-y-4">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50">
                    <div className="w-16 h-16 bg-white flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <div className="text-xs text-gray-500 flex gap-3 mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
              {selectedOrder.coupon && (
                <div className="flex justify-between items-center mt-2 text-green-600">
                  <span>Discount ({selectedOrder.coupon.code})</span>
                  <span>-{formatPrice(selectedOrder.coupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-black">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
