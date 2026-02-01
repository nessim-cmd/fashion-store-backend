import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0].name : undefined
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImage(0);
      setSelectedSize(product.sizes.length > 0 ? product.sizes[0] : undefined);
      setSelectedColor(product.colors.length > 0 ? product.colors[0].name : undefined);
    }
  }, [isOpen, product]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const images = product.images.length > 0 ? product.images : ['https://via.placeholder.com/500'];

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Mobile: Bottom Sheet / Desktop: Center Modal */}
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:mx-4">
        <div className="bg-white w-full max-h-[92vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-t-3xl md:rounded-2xl animate-slide-up md:animate-none">
          
          {/* Mobile Header - Drag Handle & Close */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            <button
              onClick={onClose}
              className="absolute right-4 p-2 text-gray-400 hover:text-black"
            >
              <X size={22} />
            </button>
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-black hover:text-white transition-colors rounded-full"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:grid md:grid-cols-2 max-h-[calc(92vh-52px)] md:max-h-[85vh] overflow-y-auto">
            {/* Image Section */}
            <div className="relative bg-gray-50">
              {/* Image */}
              <div className="aspect-square md:aspect-auto md:h-full">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Navigation (if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === idx ? 'bg-black w-6' : 'bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Sale Badge */}
              {product.salePrice && product.salePrice < product.price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-5 md:p-8 flex flex-col">
              {/* Category & Rating Row */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {product.category?.name || 'Collection'}
                </p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description - Hidden on very small screens */}
              <p className="hidden sm:block text-sm text-gray-500 mb-5 line-clamp-2">
                {product.description || 'Premium quality product designed for the modern lifestyle.'}
              </p>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Color</p>
                    <span className="text-xs text-gray-400 capitalize">{selectedColor}</span>
                  </div>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color.name 
                            ? 'border-black ring-2 ring-offset-2 ring-black' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-11 px-3 border text-sm font-bold transition-all ${
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

              {/* Quantity */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Quantity</p>
                <div className="flex items-center border border-gray-200 w-fit rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Actions - Fixed at bottom on mobile */}
              <div className="mt-auto pt-4 border-t border-gray-100 md:border-0 md:pt-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 rounded-lg"
                  >
                    <ShoppingBag size={18} />
                    Add to Bag — {formatPrice((product.salePrice || product.price) * quantity)}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="w-14 h-14 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center rounded-lg"
                  >
                    <Heart size={22} />
                  </button>
                </div>

                {/* View Full Details */}
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="block mt-4 text-center py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-gray-200 rounded-lg hover:border-black"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
