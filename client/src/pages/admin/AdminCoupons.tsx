import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Plus, Edit, Trash2, Loader, Tag, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

interface CouponFormData {
  code: string;
  discount: string;
  type: 'PERCENTAGE' | 'FIXED';
  minPurchase: string;
  expiresAt: string;
  isActive: boolean;
}

const initialFormData: CouponFormData = {
  code: '',
  discount: '',
  type: 'PERCENTAGE',
  minPurchase: '',
  expiresAt: '',
  isActive: true
};

export const AdminCoupons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const queryClient = useQueryClient();
  
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons/admin/all');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/coupons', data);
    },
    onSuccess: () => {
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/coupons/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => {
      toast.error('Failed to delete coupon');
    }
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      type: coupon.type,
      minPurchase: coupon.minPurchase?.toString() || '',
      expiresAt: coupon.expiresAt.split('T')[0],
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      type: formData.type,
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
      expiresAt: new Date(formData.expiresAt).toISOString(),
      isActive: formData.isActive
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons?.length || 0} discount codes</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={16} />
          Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : !coupons || coupons.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No coupons yet</h3>
          <p className="text-gray-500 mb-6">Create discount codes to offer promotions.</p>
          <Button onClick={openCreateModal}>Add Coupon</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4 hidden md:table-cell">Min. Purchase</th>
                <th className="p-4 hidden md:table-cell">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-gray-100 px-2 py-1">
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {coupon.type === 'PERCENTAGE' ? (
                        <>
                          <Percent size={14} className="text-gray-400" />
                          <span className="font-bold">{coupon.discount}%</span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="font-bold">{coupon.discount}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-600">
                    {coupon.minPurchase ? `$${coupon.minPurchase}` : '-'}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={isExpired(coupon.expiresAt) ? 'text-red-500' : 'text-gray-600'}>
                      {formatDate(coupon.expiresAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    {!coupon.isActive ? (
                      <Badge variant="default">Inactive</Badge>
                    ) : isExpired(coupon.expiresAt) ? (
                      <Badge variant="error">Expired</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(coupon)}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this coupon?')) {
                            deleteMutation.mutate(coupon.id);
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

      {/* Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Coupon Code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="e.g., SUMMER20"
            className="uppercase"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              options={[
                { value: 'PERCENTAGE', label: 'Percentage (%)' },
                { value: 'FIXED', label: 'Fixed Amount ($)' }
              ]}
            />
            <Input
              label={formData.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount ($)'}
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
              placeholder={formData.type === 'PERCENTAGE' ? '20' : '10.00'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Purchase ($)"
              type="number"
              step="0.01"
              value={formData.minPurchase}
              onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value }))}
              placeholder="50.00"
            />
            <Input
              label="Expiration Date"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 accent-black"
            />
            <span className="text-sm font-medium">Active</span>
          </label>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
