// src/pages/Home.tsx
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Layout } from '../layouts/Layout';
import api from '../api/client';
import { ArrowRight, Loader, Truck, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await api.get('/products?limit=8&featured=true'); 
      return Array.isArray(response.data?.products) ? response.data.products : [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const features = [
    { icon: Truck, title: 'Free Shipping', description: 'On orders over $100' },
    { icon: ShieldCheck, title: 'Secure Payments', description: '100% protected transactions' },
    { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy' },
    { icon: Star, title: 'Premium Quality', description: 'Certified products' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] bg-gray-100 overflow-hidden">
         <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2070"
            alt="Hero Fashion"
            className="w-full h-full object-cover object-top"
          />
         <div className="absolute inset-0 bg-black/20" />
         
         <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 text-white">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-6 max-w-4xl leading-[0.9]">
               Redefining<br/>Luxury.
            </h1>
            <p className="text-lg md:text-xl font-medium max-w-lg mb-8 text-white/90">
               Discover the new collection. Meticulously crafted for the uncompromising individual.
            </p>
            <div className="flex gap-4">
               <Link to="/shop">
                  <Button className="bg-white text-black hover:bg-gray-100 h-14 px-10 rounded-none uppercase tracking-widest text-xs font-bold transition-all">
                     Shop Collection
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4 p-6 md:p-8 justify-center">
              <feature.icon size={24} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">{feature.title}</p>
                <p className="text-xs text-gray-500 hidden md:block">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      {Array.isArray(categories) && categories.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Shop by Category</h2>
            <p className="text-gray-500">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category: any) => (
              <Link 
                key={category.id} 
                to={`/shop?category=${category.id}`}
                className="group relative aspect-[4/5] overflow-hidden bg-gray-100"
              >
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg md:text-xl font-bold uppercase tracking-wider">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section className="py-16 md:py-24 px-4 md:px-12 lg:px-24 bg-gray-50">
         <div className="flex justify-between items-end mb-16">
            <div>
               <span className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block">Featured</span>
               <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Curated Selection</h2>
               <p className="text-gray-500 max-w-md">Our editors' top picks for the season. Timeless pieces that elevate your everyday wardrobe.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
               View All <ArrowRight size={16} />
            </Link>
         </div>

         {isLoading ? (
            <div className="flex justify-center items-center h-64">
               <Loader className="animate-spin text-gray-300" size={32} />
            </div>
         ) : error ? (
            <div className="text-center py-20 bg-white">
               <p className="text-gray-500 mb-4">Unable to load collection.</p>
               <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
               </Button>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
               {Array.isArray(products) && products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>
         )}
         
         <div className="mt-16 text-center md:hidden">
            <Link to="/shop">
               <Button variant="outline" className="w-full h-14 uppercase tracking-widest text-xs font-bold border-black hover:bg-black hover:text-white rounded-none">
                  View All Products
               </Button>
            </Link>
         </div>
      </section>

      {/* Editorial Split Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
         <div className="relative bg-gray-100 h-[50vh] md:h-full">
            <img 
               src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2070" 
               alt="Editorial" 
               className="w-full h-full object-cover"
            />
         </div>
         <div className="flex flex-col justify-center items-center text-center p-12 md:p-24 bg-gray-950 text-white">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">The Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
               Fashion as a <br/> Form of Art.
            </h2>
            <p className="text-gray-400 max-w-md leading-relaxed mb-10">
               We believe in sustainable luxury. Every piece is crafted with intention, using ethically sourced materials that stand the test of time.
            </p>
            <Link to="/shop?sort=newest">
              <Button className="bg-white text-black hover:bg-gray-200 h-14 px-12 rounded-none uppercase tracking-widest text-xs font-bold">
                 Explore New Arrivals
              </Button>
            </Link>
         </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 md:px-12 lg:px-24 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Join the Inner Circle</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">Subscribe to receive exclusive offers, early access to new collections, and styling tips from our experts.</p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email"
            className="flex-1 border border-gray-200 px-6 py-4 focus:border-black focus:outline-none transition-colors"
          />
          <Button className="h-14 px-8 rounded-none uppercase tracking-widest text-xs font-bold whitespace-nowrap">
            Subscribe
          </Button>
        </form>
      </section>
    </Layout>
  );
};
