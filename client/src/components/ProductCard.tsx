// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import toast from 'react-hot-toast';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/wishlist', { productId: product.id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist!');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default size/color logic
    const defaultSize = product.sizes.length > 0 ? product.sizes[0] : undefined;
    const defaultColor = product.colors.length > 0 ? product.colors[0].name : undefined;

    addItem(product, defaultSize, defaultColor);
    toast.success('Added to bag');
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    addToWishlistMutation.mutate();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <div 
        className="group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="block">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 relative">
            {/* Image */}
            <img
              src={product.images[0] || 'https://via.placeholder.com/400x600?text=No+Image'}
              alt={product.name}
              className={cn(
                "h-full w-full object-cover object-center transition-transform duration-700 ease-in-out",
                isHovered ? "scale-105" : "scale-100"
              )}
            />
            
            {/* Badges */}
            {product.featured && (
              <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                New
              </span>
            )}

            {/* Top Right Icons (Heart & Eye) */}
            <div className={cn(
              "absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}>
              <button
                onClick={handleAddToWishlist}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-md"
                title="Add to wishlist"
              >
                <Heart size={16} />
              </button>
              <button
                onClick={handleQuickView}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-md"
                title="Quick view"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* Quick Action Overlay */}
            <div className={cn(
              "absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ease-in-out",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <button
                onClick={handleAddToCart}
                className="w-full bg-white text-black font-semibold py-3 text-sm shadow-xl hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                ADD TO BAG
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:underline underline-offset-4 decoration-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">{product.category?.name || 'Collection'}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};
