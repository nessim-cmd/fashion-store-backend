import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import api from '../api/client';
import { ShoppingBag, Loader, Package, ArrowLeft, Eye } from 'lucide-react';

export const Orders = () => {
  const { user } = useAuthStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    enabled: !!user
  });

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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <ShoppingBag size={48} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-black tracking-tight mb-4 uppercase">Sign In to View Orders</h2>
          <p className="text-gray-500 mb-8 max-w-md">Log in to your account to see your order history.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 min-h-[60vh]">
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
            <ArrowLeft size={16} className="mr-2" /> Continue Shopping
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter">My Orders</h1>
          <p className="text-gray-500 mt-2">{orders?.length || 0} orders placed</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-gray-400" size={32} />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              When you place an order, it will appear here.
            </p>
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div 
                key={order.id} 
                className="border border-gray-100 p-6 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)} • {order.items?.length || 0} Items</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                    {getStatusBadge(order.status)}
                    <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
                
                {/* Preview of items */}
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {order.items?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="w-16 h-16 bg-gray-100 flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img 
                          src={item.product.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs font-bold">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Order Date</p>
                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Shipping Address</p>
              <div className="text-sm text-gray-600 bg-gray-50 p-4">
                <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                <p>{selectedOrder.shippingAddress?.streetAddress}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

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

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
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
    </Layout>
  );
};
