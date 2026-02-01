import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Mail, Send, Users, Plus, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminNewsletter = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewNewsletter, setPreviewNewsletter] = useState<any>(null);
  const [formData, setFormData] = useState({ subject: '', content: '' });

  // Fetch newsletters
  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      const res = await api.get('/newsletter');
      return res.data;
    }
  });

  // Fetch subscribers
  const { data: subscribersData } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const res = await api.get('/newsletter/subscribers?active=true');
      return res.data;
    }
  });

  // Create newsletter
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/newsletter', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter created!');
      setShowCreateModal(false);
      setFormData({ subject: '', content: '' });
    },
    onError: () => toast.error('Failed to create newsletter')
  });

  // Send newsletter
  const sendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/newsletter/${id}/send`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success(res.data.message);
    },
    onError: () => toast.error('Failed to send newsletter')
  });

  // Delete newsletter
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/newsletter/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter deleted');
    },
    onError: () => toast.error('Failed to delete newsletter')
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handlePreview = (newsletter: any) => {
    setPreviewNewsletter(newsletter);
    setShowPreviewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'SENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Mail size={32} />
            Newsletter
          </h1>
          <p className="text-gray-500 mt-1">Manage newsletters and subscribers</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Create Newsletter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subscribersData?.total || 0}</p>
              <p className="text-sm text-gray-500">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50">
              <Send size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {newsletters?.filter((n: any) => n.status === 'SENT').length || 0}
              </p>
              <p className="text-sm text-gray-500">Newsletters Sent</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50">
              <Mail size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {newsletters?.filter((n: any) => n.status === 'DRAFT').length || 0}
              </p>
              <p className="text-sm text-gray-500">Draft Newsletters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter List */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold">All Newsletters</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : newsletters?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p>No newsletters yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {newsletters?.map((newsletter: any) => (
              <div key={newsletter.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">{newsletter.subject}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 text-xs font-medium ${getStatusColor(newsletter.status)}`}>
                      {newsletter.status}
                    </span>
                    {newsletter.sentAt && (
                      <span>Sent: {new Date(newsletter.sentAt).toLocaleDateString()}</span>
                    )}
                    {newsletter.sentCount > 0 && (
                      <span>{newsletter.sentCount} recipients</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(newsletter)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  {newsletter.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm(`Send this newsletter to ${subscribersData?.total || 0} subscribers?`)) {
                          sendMutation.mutate(newsletter.id);
                        }
                      }}
                      isLoading={sendMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <Send size={14} />
                      Send
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this newsletter?')) {
                        deleteMutation.mutate(newsletter.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Create Newsletter</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black"
                  placeholder="Newsletter subject..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Content (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black font-mono text-sm"
                  rows={12}
                  placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Create Newsletter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Preview: {previewNewsletter.subject}</h2>
              <button onClick={() => setShowPreviewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: previewNewsletter.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
