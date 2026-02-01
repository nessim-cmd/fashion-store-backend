import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Plus, Edit, Trash2, Loader, FolderOpen, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

interface SubcategoryFormData {
  name: string;
  description: string;
  categoryId: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  image: ''
};

const initialSubFormData: SubcategoryFormData = {
  name: '',
  description: '',
  categoryId: ''
};

export const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [subFormData, setSubFormData] = useState<SubcategoryFormData>(initialSubFormData);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // Category mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/categories', data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create category')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => await api.put(`/categories/${id}`, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update category')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => toast.error('Failed to delete category')
  });

  // Subcategory mutations
  const createSubMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/categories/subcategories', data),
    onSuccess: () => {
      toast.success('Subcategory created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeSubModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create subcategory')
  });

  const updateSubMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => await api.put(`/categories/subcategories/${id}`, data),
    onSuccess: () => {
      toast.success('Subcategory updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeSubModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update subcategory')
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/categories/subcategories/${id}`),
    onSuccess: () => {
      toast.success('Subcategory deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => toast.error('Failed to delete subcategory')
  });

  // Category handlers
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: formData.name,
      description: formData.description || null,
      image: formData.image || null,
      slug: editingCategory ? undefined : slug
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Subcategory handlers
  const openCreateSubModal = (categoryId?: string) => {
    setEditingSubcategory(null);
    setSubFormData({ ...initialSubFormData, categoryId: categoryId || '' });
    setIsSubModalOpen(true);
  };

  const openEditSubModal = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setSubFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId
    });
    setIsSubModalOpen(true);
  };

  const closeSubModal = () => {
    setIsSubModalOpen(false);
    setEditingSubcategory(null);
    setSubFormData(initialSubFormData);
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = subFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: subFormData.name,
      description: subFormData.description || null,
      categoryId: subFormData.categoryId,
      slug: editingSubcategory ? undefined : slug
    };

    if (editingSubcategory) {
      updateSubMutation.mutate({ id: editingSubcategory.id, data: payload });
    } else {
      createSubMutation.mutate(payload);
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const totalSubcategories = categories?.reduce((acc: number, cat: any) => acc + (cat.subcategories?.length || 0), 0) || 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories?.length || 0} categories • {totalSubcategories} subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCreateSubModal()} className="flex items-center gap-2">
            <Layers size={16} />
            Add Subcategory
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus size={16} />
            Add Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Create your first category to organize products.</p>
          <Button onClick={openCreateModal}>Add Category</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          {categories.map((category: any) => (
            <div key={category.id} className="border-b border-gray-100 last:border-b-0">
              {/* Category Row */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1">
                  {category.subcategories?.length > 0 ? (
                    <button 
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}
                  
                  <div className="w-12 h-12 bg-gray-100 flex-shrink-0">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FolderOpen size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-xs text-gray-400">
                      /{category.slug} • {category.subcategories?.length || 0} subcategories
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreateSubModal(category.id)}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                    title="Add Subcategory"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => openEditModal(category)}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Delete this category and all its subcategories?')) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Subcategories */}
              {expandedCategories.has(category.id) && category.subcategories?.length > 0 && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {category.subcategories.map((sub: any) => (
                    <div 
                      key={sub.id} 
                      className="flex items-center justify-between px-4 py-3 pl-16 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Layers size={14} className="text-gray-400" />
                        <div>
                          <span className="font-medium text-sm">{sub.name}</span>
                          <span className="text-xs text-gray-400 ml-2">/{sub.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditSubModal(sub)}
                          className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this subcategory?')) {
                              deleteSubMutation.mutate(sub.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Men's Clothing"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional category description..."
            rows={3}
          />

          <Input
            label="Image URL"
            type="url"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />

          {formData.image && (
            <div className="aspect-video bg-gray-100 max-w-xs">
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={closeSubModal}
        title={editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        size="md"
      >
        <form onSubmit={handleSubSubmit} className="space-y-6">
          <Select
            label="Parent Category"
            value={subFormData.categoryId}
            onChange={(e) => setSubFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            options={[
              { value: '', label: 'Select a category' },
              ...(categories?.map((c: any) => ({ value: c.id, label: c.name })) || [])
            ]}
            required
          />

          <Input
            label="Subcategory Name"
            value={subFormData.name}
            onChange={(e) => setSubFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., T-Shirts"
            required
          />

          <Textarea
            label="Description"
            value={subFormData.description}
            onChange={(e) => setSubFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description..."
            rows={3}
          />

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={closeSubModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createSubMutation.isPending || updateSubMutation.isPending}
            >
              {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
