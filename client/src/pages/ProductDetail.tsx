import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../layouts/Layout';
import api from '../api/client';
import { Button } from '../components/ui/Button';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Loader, Minus, Plus, Star, Truck, RotateCcw, ShieldCheck, Heart, Share2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ProductDetail = () => {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
  });

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.colors?.length > 0 && !selectedColor) {
       toast.error('Please select a color');
       return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
       toast.error('Please select a size');
       return;
    }
    for(let i = 0; i < quantity; i++) {
        addItem(product, selectedSize, selectedColor);
    }
    toast.success(`Added to bag!`);
  };

  if (isLoading) {
     return (
        <Layout>
           <div className="min-h-screen flex items-center justify-center">
              <Loader className="animate-spin text-gray-400" size={32} />
           </div>
        </Layout>
     );
  }

  if (error || !product) {
     return (
        <Layout>
           <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500">Product not found.</p>
              <Link to="/shop">
                <Button variant="outline">Back to Shop</Button>
              </Link>
           </div>
        </Layout>
     );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage] || 'https://via.placeholder.com/800';
  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
            <ChevronLeft size={16} />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-gray-50 overflow-hidden"
            >
              <img 
                src={currentImage} 
                alt={product.name}
                className="w-full h-full object-cover" 
              />
            </motion.div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 bg-gray-50 border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:py-4">
            {/* Category & Rating */}
            <div className="flex items-center gap-4 mb-4">
              {product.category?.name && (
                <Link 
                  to={`/shop?category=${product.categoryId}`}
                  className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                >
                  {product.category.name}
                </Link>
              )}
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={14} />
                  <span className="text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({product.reviewCount || 0})</span>
                </div>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">{formatPrice(Number(price))}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(Number(product.price))}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1">
                    {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Color: {selectedColor || 'Select a color'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c: any) => {
                    const colorName = c.name || c;
                    const colorHex = c.hex || '#000000';
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === colorName
                            ? 'border-black ring-2 ring-offset-2 ring-black' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: colorHex }}
                        title={colorName}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider">Size</span>
                  <button className="text-xs text-gray-500 underline hover:text-black">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: any) => {
                    const size = s.size || s;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-12 px-4 flex items-center justify-center border text-sm font-bold transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 hover:border-black text-gray-900'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wider block mb-3">Quantity</span>
              <div className="flex items-center border border-gray-200 w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3 mb-8">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-black text-white hover:bg-gray-800 uppercase tracking-widest text-xs font-bold rounded-none"
                disabled={!product.inStock}
              >
                {product.inStock ? `Add to Bag — ${formatPrice(price * quantity)}` : 'Out of Stock'}
              </Button>
              <button className="w-14 h-14 border border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                <Heart size={20} />
              </button>
              <button 
                onClick={async () => {
                  const shareData = {
                    title: product.name,
                    text: product.description || `Check out ${product.name}!`,
                    url: window.location.href,
                  };
                  
                  try {
                    if (navigator.share && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                    } else {
                      // Fallback: copy to clipboard
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  } catch (err: any) {
                    if (err.name !== 'AbortError') {
                      // User didn't cancel, try clipboard fallback
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      } catch {
                        toast.error('Could not share');
                      }
                    }
                  }
                }}
                className="w-14 h-14 border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Truck size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-bold uppercase tracking-wider">Free Shipping</p>
                  <p className="text-xs text-gray-500">Orders over $100</p>
                </div>
                <div className="text-center">
                  <RotateCcw size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-bold uppercase tracking-wider">Free Returns</p>
                  <p className="text-xs text-gray-500">Within 30 days</p>
                </div>
                <div className="text-center">
                  <ShieldCheck size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-bold uppercase tracking-wider">Secure Pay</p>
                  <p className="text-xs text-gray-500">100% Protected</p>
                </div>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t border-gray-100 mt-6 pt-6 space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-sm font-bold uppercase tracking-wider">Product Details</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <p>• Premium quality materials</p>
                  <p>• Ethically sourced and produced</p>
                  <p>• Machine washable</p>
                  <p>• Imported</p>
                </div>
              </details>
              
              <details className="group border-t border-gray-100 pt-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-sm font-bold uppercase tracking-wider">Shipping & Returns</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <p>Free standard shipping on orders over $100.</p>
                  <p>Express shipping available at checkout.</p>
                  <p>Free returns within 30 days of purchase.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
