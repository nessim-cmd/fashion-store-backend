import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0].name : undefined
  );

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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }
    toast.success(`Added ${quantity} item(s) to bag`);
    onClose();
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    addToWishlistMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-black hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-gray-100">
            <img
              src={product.images[0] || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category */}
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {product.category?.name || 'Collection'}
            </p>

            {/* Title */}
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-black">{formatPrice(product.price)}</span>
              {product.salePrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.salePrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 line-clamp-3">
              {product.description}
            </p>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border text-sm font-bold transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Color</p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'border-black scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Quantity</p>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <button
                onClick={handleAddToWishlist}
                className="p-4 border border-gray-200 hover:border-black transition-colors"
              >
                <Heart size={20} />
              </button>
            </div>

            {/* View Full Details */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
