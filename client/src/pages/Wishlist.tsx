
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import api from '../api/client';
import { Heart, Loader, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Wishlist = () => {
  const { user } = useAuthStore();
  const addToCart = useCartStore((state) => state.addItem);
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data;
    },
    enabled: !!user
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  const handleAddToCart = (item: any) => {
    const product = item.product;
    const defaultSize = product.sizes?.[0]?.size || product.sizes?.[0];
    const defaultColor = product.colors?.[0]?.name;
    addToCart(product, defaultSize, defaultColor);
    toast.success('Added to bag');
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Heart size={48} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-black tracking-tight mb-4 uppercase">Sign In to View Wishlist</h2>
          <p className="text-gray-500 mb-8 max-w-md">Create an account or sign in to save your favorite items.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-24 py-8">
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
            <ArrowLeft size={16} className="mr-2" /> Continue Shopping
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter">My Wishlist</h1>
          <p className="text-gray-500 mt-2">{wishlistItems?.length || 0} saved items</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-gray-400" size={32} />
          </div>
        ) : !wishlistItems || wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Save your favorite items by clicking the heart icon on any product.
            </p>
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item: any) => (
              <div key={item.id} className="group relative">
                <Link to={`/product/${item.product.id}`}>
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/400x600'}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:underline underline-offset-4">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{item.product.category?.name}</p>
                  <p className="font-bold mt-2">{formatPrice(item.product.price)}</p>
                </Link>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 h-12 text-xs"
                  >
                    <ShoppingBag size={14} className="mr-2" />
                    Add to Bag
                  </Button>
                  <button
                    onClick={() => removeMutation.mutate(item.productId)}
                    className="w-12 h-12 border border-gray-200 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
