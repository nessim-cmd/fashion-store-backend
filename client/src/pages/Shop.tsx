import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { ProductCard } from '../components/ProductCard';
import api from '../api/client';
import { Loader, SlidersHorizontal, X, ChevronDown, Grid, LayoutList } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get filter values from URL
  const categoryFilter = searchParams.get('category') || '';
  const sortFilter = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const searchQuery = searchParams.get('search') || '';

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products-shop', categoryFilter, sortFilter, minPrice, maxPrice, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (sortFilter) params.append('sort', sortFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '50');
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = categoryFilter || sortFilter || minPrice || maxPrice || searchQuery;

  const products = productsData?.products || [];

  const sortOptions = [
    { value: '', label: 'Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
    { value: 'name_desc', label: 'Name: Z-A' },
  ];

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Banner */}
        <div className="bg-gray-100 px-6 md:px-12 lg:px-24 py-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'The Collection'}
          </h1>
          <p className="text-gray-500 max-w-md">
            Explore our curated selection of premium pieces. Designed for longevity and style.
          </p>
        </div>

        <div className="px-6 md:px-12 lg:px-24 py-8">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-11"
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-black rounded-full" />
                )}
              </Button>
              
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1"
                >
                  <X size={14} /> Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
              
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'}`}
                  title="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'}`}
                  title="List view"
                >
                  <LayoutList size={18} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortFilter}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none border border-gray-200 py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="w-64 flex-shrink-0 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Category</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilter('category', '')}
                      className={`block text-sm ${!categoryFilter ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      All Categories
                    </button>
                    {categories?.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter('category', cat.id)}
                        className={`block text-sm ${categoryFilter === cat.id ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Price Range</h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-20 border border-gray-200 py-2 px-3 text-sm focus:outline-none focus:border-black"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-20 border border-gray-200 py-2 px-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader className="animate-spin text-gray-300" size={32} />
                </div>
              ) : error ? (
                <div className="text-center py-32">
                  <p className="text-gray-500 mb-4">Could not load products.</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-32 bg-gray-50">
                  <p className="text-xl font-bold mb-2">No products found</p>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10' 
                    : 'space-y-4'
                }>
                  {products.map((product: any) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
