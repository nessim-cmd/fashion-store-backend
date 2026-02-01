// src/components/ProductCard.tsx
import React, { useState, useRef } from 'react';
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
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Long press for mobile quick view
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowQuickView(true);
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if it was a long press
    if (isLongPress.current) {
      e.preventDefault();
      isLongPress.current = false;
    }
  };

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

  // List view layout
  if (viewMode === 'list') {
    return (
      <>
        <div 
          className="group flex flex-col sm:flex-row gap-4 p-3 sm:p-4 border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer rounded-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          {/* Image - Full width on mobile, fixed width on desktop */}
          <Link to={`/product/${product.id}`} onClick={handleClick} className="w-full sm:w-28 md:w-32 aspect-square sm:aspect-[3/4] flex-shrink-0">
            <img
              src={product.images[0] || 'https://via.placeholder.com/400x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
          </Link>
          
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
                {product.category?.name || 'Collection'}
              </p>
              <Link to={`/product/${product.id}`} onClick={handleClick}>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 hover:underline underline-offset-4 line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 hidden sm:block">
                {product.description || 'Premium quality essentials designed for the modern lifestyle.'}
              </p>
            </div>
            
            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
              <span className="text-base sm:text-lg font-bold">{formatPrice(product.price)}</span>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={handleQuickView}
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors rounded"
                  title="Quick view"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors rounded"
                  title="Add to wishlist"
                >
                  <Heart size={16} />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="h-9 sm:h-10 px-3 sm:px-4 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-1.5 rounded"
                >
                  <ShoppingBag size={14} />
                  <span className="hidden xs:inline">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <QuickViewModal
          product={product}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      </>
    );
  }

  // Grid view layout (default)
  return (
    <>
      <div 
        className="group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <Link to={`/product/${product.id}`} onClick={handleClick} className="block">
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
