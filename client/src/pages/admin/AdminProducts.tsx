import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Plus, Edit, Trash2, Loader, Search, Package, X, Upload, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { useSettingsStore } from '../../store/useSettingsStore';

// Size type options
type SizeType = 'none' | 'clothing' | 'shoes' | 'custom';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  featured: boolean;
  inStock: boolean;
  stockQuantity: string;
  images: string[];
  sizeType: SizeType;
  sizes: string[];
  customSizes: string;
  hasColors: boolean;
  colors: { name: string; hex: string }[];
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  categoryId: '',
  featured: false,
  inStock: true,
  stockQuantity: '0',
  images: [''],
  sizeType: 'none',
  sizes: [],
  customSizes: '',
  hasColors: false,
  colors: []
};

// Predefined size options
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const defaultColors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Beige', hex: '#D4C4A8' },
];

export const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      const res = await api.get(`/products?search=${searchQuery}&limit=100`);
      return res.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/products', data);
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/products/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => {
      toast.error('Failed to delete product');
    }
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setFormStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    
    // Determine size type from existing sizes
    let sizeType: SizeType = 'none';
    const existingSizes = product.sizes || [];
    if (existingSizes.length > 0) {
      if (existingSizes.some((s: string) => clothingSizes.includes(s))) {
        sizeType = 'clothing';
      } else if (existingSizes.some((s: string) => shoeSizes.includes(s))) {
        sizeType = 'shoes';
      } else {
        sizeType = 'custom';
      }
    }
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      categoryId: product.categoryId,
      featured: product.featured,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity?.toString() || '0',
      images: product.images?.length > 0 ? product.images : [''],
      sizeType,
      sizes: existingSizes,
      customSizes: sizeType === 'custom' ? existingSizes.join(', ') : '',
      hasColors: (product.colors?.length || 0) > 0,
      colors: product.colors || []
    });
    setFormStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setFormStep(1);
    setCustomColorName('');
    setCustomColorHex('#000000');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    return true;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      setFormStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Compute final sizes based on sizeType
    let finalSizes: string[] = [];
    if (formData.sizeType === 'clothing' || formData.sizeType === 'shoes') {
      finalSizes = formData.sizes;
    } else if (formData.sizeType === 'custom') {
      finalSizes = formData.customSizes.split(',').map(s => s.trim()).filter(s => s);
    }
    
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      categoryId: formData.categoryId,
      featured: formData.featured,
      inStock: formData.inStock,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      slug: editingProduct ? undefined : slug,
      images: formData.images.filter(img => img.trim() !== ''),
      sizes: finalSizes,
      colors: formData.hasColors ? formData.colors : []
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    try {
      for (const file of Array.from(files)) {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const base64 = await base64Promise;
        
        // Upload to server (Cloudinary returns full URL)
        const response = await api.post('/upload', { image: base64, filename: file.name });
        const imageUrl = response.data.url;
        
        // Add to images list
        setFormData(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img.trim() !== ''), imageUrl]
        }));
        
        toast.success('Image uploaded!');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const products = productsData?.products || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
          <Button onClick={openCreateModal}>Add Product</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Product</th>
                <th className="p-4 hidden md:table-cell">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4 hidden md:table-cell">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{product.category?.name || '-'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{formatPrice(product.price)}</span>
                      {product.salePrice && (
                        <span className="text-xs text-green-600">{formatPrice(product.salePrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge variant={product.inStock ? 'success' : 'error'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                      {product.featured && <Badge variant="info">Featured</Badge>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${formStep >= 1 ? 'text-black' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              formStep >= 1 ? 'border-black bg-black text-white' : 'border-gray-300'
            }`}>
              {formStep > 1 ? <Check size={16} /> : '1'}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Basic Info</span>
          </div>
          <div className={`w-12 h-0.5 ${formStep >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${formStep >= 2 ? 'text-black' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              formStep >= 2 ? 'border-black bg-black text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Media & Options</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {formStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Classic White T-Shirt"
                  required
                />
                <Select
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  options={[
                    { value: '', label: 'Select a category' },
                    ...(categories?.map((c: any) => ({ value: c.id, label: c.name })) || [])
                  ]}
                  required
                />
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description..."
                rows={3}
                required
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="99.99"
                  required
                />
                <Input
                  label="Sale Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                  placeholder="79.99"
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  placeholder="100"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm font-medium">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm font-medium">In Stock</span>
                </label>
              </div>

              {/* Step 1 Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="button" onClick={goToStep2} className="flex items-center gap-2">
                  Next Step <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Images & Options */}
          {formStep === 2 && (
            <div className="space-y-6">
              {/* Images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Product Images
                </label>
                
                {/* Image Preview Grid */}
                {formData.images.filter(img => img.trim() !== '').length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {formData.images.filter(img => img.trim() !== '').map((image, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-50 border border-gray-200">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-black py-6 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                    </>
                  )}
                </button>

                {/* Manual URL Input */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400">Or add image URLs manually:</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border border-gray-200 py-2 px-3 text-sm focus:outline-none focus:border-black"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          if (input.value.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images.filter(img => img.trim() !== ''), input.value.trim()]
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images.filter(img => img.trim() !== ''), input.value.trim()]
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 border border-gray-200 hover:border-black text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Size Options
                </label>
                
                {/* Size Type Selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { value: 'none', label: 'No Sizes' },
                    { value: 'clothing', label: 'Clothing (XS-3XL)' },
                    { value: 'shoes', label: 'Shoes (36-46)' },
                    { value: 'custom', label: 'Custom Sizes' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        sizeType: option.value as SizeType,
                        sizes: [] // Reset sizes when changing type
                      }))}
                      className={`px-4 py-2 text-sm font-medium border transition-all ${
                        formData.sizeType === option.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Clothing Sizes */}
                {formData.sizeType === 'clothing' && (
                  <div className="flex flex-wrap gap-2">
                    {clothingSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 border text-sm font-bold transition-all ${
                          formData.sizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {/* Shoe Sizes */}
                {formData.sizeType === 'shoes' && (
                  <div className="flex flex-wrap gap-2">
                    {shoeSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 border text-sm font-bold transition-all ${
                          formData.sizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Sizes */}
                {formData.sizeType === 'custom' && (
                  <div>
                    <Input
                      placeholder="Enter sizes separated by commas (e.g., One Size, Small Pack, Large Pack)"
                      value={formData.customSizes}
                      onChange={(e) => setFormData(prev => ({ ...prev, customSizes: e.target.value }))}
                    />
                    <p className="text-xs text-gray-400 mt-1">Separate sizes with commas</p>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Colors
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasColors}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasColors: e.target.checked, colors: e.target.checked ? prev.colors : [] }))}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">This product has color options</span>
                  </label>
                </div>

                {formData.hasColors && (
                  <div className="space-y-4">
                    {/* Quick Color Selection */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Quick select colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {defaultColors.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => {
                              const exists = formData.colors.some(c => c.name === color.name);
                              if (exists) {
                                setFormData(prev => ({
                                  ...prev,
                                  colors: prev.colors.filter(c => c.name !== color.name)
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  colors: [...prev.colors, color]
                                }));
                              }
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                              formData.colors.some(c => c.name === color.name)
                                ? 'border-black ring-2 ring-offset-2 ring-black'
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {formData.colors.some(c => c.name === color.name) && (
                              <Check size={14} className={color.hex === '#FFFFFF' || color.hex === '#D4C4A8' ? 'text-black' : 'text-white'} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Custom color name</label>
                        <Input
                          placeholder="e.g., Burgundy"
                          value={customColorName}
                          onChange={(e) => setCustomColorName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Pick color</label>
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-12 h-10 border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (customColorName.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex }]
                            }));
                            setCustomColorName('');
                            setCustomColorHex('#000000');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Selected Colors Display */}
                    {formData.colors.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Selected colors:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm"
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  colors: prev.colors.filter((_, i) => i !== idx)
                                }))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 Actions */}
              <div className="flex justify-between gap-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </Button>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
