import { useState } from 'react';
import { Layout } from '../layouts/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import toast from 'react-hot-toast';
import { User, Lock, ShoppingBag, Heart, MapPin, CreditCard, Loader2, X, Check, Trash2, Edit2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const emptyAddressForm = {
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false,
  };

  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.put('/users/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/users/password', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => {
      toast.error('Failed to update password. Please check your current password.');
    },
  });

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: async (data: typeof addressForm) => {
      const res = await api.post('/addresses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added!');
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
    },
    onError: () => {
      toast.error('Failed to add address');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof addressForm }) => {
      const res = await api.put(`/addresses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated!');
      setEditingAddress(null);
      setAddressForm(emptyAddressForm);
    },
    onError: () => {
      toast.error('Failed to update address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/addresses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted!');
    },
    onError: () => {
      toast.error('Failed to delete address');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/addresses/${id}/default`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default address updated!');
    },
    onError: () => {
      toast.error('Failed to update default address');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    updateProfileMutation.mutate({ name: profileForm.name });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode || !addressForm.country) {
      toast.error('Please fill in all fields');
      return;
    }
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: addressForm });
    } else {
      createAddressMutation.mutate(addressForm);
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Please log in to view your profile.</p>
          <Link to="/login" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ] as const;

  const quickLinks = [
    { label: 'My Orders', path: '/orders', icon: ShoppingBag, description: 'Track and manage your orders' },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, description: 'View your saved items' },
    { label: 'Payment Methods', path: '#', icon: CreditCard, description: 'Manage payment options' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24 min-h-[60vh]">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">My Account</h1>
          <p className="text-gray-500">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gray-200 transition-colors group"
                >
                  <link.icon size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                  <div>
                    <p className="text-sm font-bold">{link.label}</p>
                    <p className="text-xs text-gray-400">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 p-6 lg:p-8">
              {activeTab === 'profile' && (
                <>
                  <h2 className="text-lg font-bold mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full border border-gray-200 px-4 py-3 text-gray-400 bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updateProfileMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'password' && (
                <>
                  <h2 className="text-lg font-bold mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updatePasswordMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'addresses' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Saved Addresses</h2>
                    {!showAddressForm && (
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1"
                      >
                        <Plus size={14} /> Add New
                      </button>
                    )}
                  </div>

                  {/* Address Form */}
                  {showAddressForm && (
                    <form onSubmit={handleAddressSubmit} className="mb-8 p-6 bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                        <button type="button" onClick={cancelAddressForm} className="text-gray-400 hover:text-black">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Street Address</label>
                          <input
                            type="text"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="123 Main Street, Apt 4B"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="New York"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">State/Province</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="NY"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Postal Code</label>
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="10001"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Country</label>
                          <input
                            type="text"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                            placeholder="United States"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isDefault" className="text-sm">Set as default address</label>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {(createAddressMutation.isPending || updateAddressMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddressForm}
                          className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 hover:border-black transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Address List */}
                  {addressesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                  ) : addresses.length === 0 && !showAddressForm ? (
                    <div className="text-center py-12 text-gray-500">
                      <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No saved addresses</p>
                      <p className="text-sm mt-1 mb-4">Add an address for faster checkout</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`p-5 border transition-colors ${address.isDefault ? 'border-black' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold">{address.name}</p>
                                {address.isDefault && (
                                  <span className="bg-black text-white text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                {address.street}<br />
                                {address.city}, {address.state} {address.postalCode}<br />
                                {address.country}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => setDefaultMutation.mutate(address.id)}
                                  disabled={setDefaultMutation.isPending}
                                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Set as default"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => startEditAddress(address)}
                                className="p-2 text-gray-400 hover:text-black transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this address?')) {
                                    deleteAddressMutation.mutate(address.id);
                                  }
                                }}
                                disabled={deleteAddressMutation.isPending}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
