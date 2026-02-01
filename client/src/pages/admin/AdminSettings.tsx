import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Settings, Globe, Store, Mail, Truck, Percent, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/useSettingsStore';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TND', symbol: 'TND', name: 'Tunisian Dinar' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
];

export const AdminSettings = () => {
  const queryClient = useQueryClient();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const [formData, setFormData] = useState({
    currency: 'USD',
    currencySymbol: '$',
    language: 'en',
    storeName: 'Fashion Store',
    storeEmail: 'contact@fashionstore.com',
    taxRate: '0',
    shippingFee: '0',
    freeShippingThreshold: '100',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
    onSuccess: (data: any) => {
      setFormData(prev => ({
        ...prev,
        ...data
      }));
    }
  } as any);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Also update the global settings store
      fetchSettings();
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);

    // Auto-update currency symbol when currency changes
    if (key === 'currency') {
      const curr = currencies.find(c => c.code === value);
      if (curr) {
        setFormData(prev => ({ ...prev, currency: value, currencySymbol: curr.symbol }));
      }
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings size={32} />
            Store Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure your store preferences</p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={updateMutation.isPending}
          disabled={!hasChanges}
          className="flex items-center gap-2"
        >
          {hasChanges ? <Save size={16} /> : <Check size={16} />}
          {hasChanges ? 'Save Changes' : 'Saved'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Information */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Store size={20} />
            Store Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors"
                placeholder="My Fashion Store"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.storeEmail}
                onChange={(e) => handleChange('storeEmail', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors"
                placeholder="contact@store.com"
              />
            </div>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Globe size={20} />
            Localization
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors bg-white"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors bg-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Truck size={20} />
            Shipping
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Shipping Fee ({formData.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.shippingFee}
                onChange={(e) => handleChange('shippingFee', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Free Shipping Threshold ({formData.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors"
                placeholder="100.00"
              />
              <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
            </div>
          </div>
        </div>

        {/* Tax */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Percent size={20} />
            Tax Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                className="w-full border border-gray-200 py-3 px-4 focus:outline-none focus:border-black transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">Applied to all orders (0 for no tax)</p>
            </div>
          </div>
        </div>
      </div>

      {/* SMTP Settings Info */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Mail size={20} />
          Email Configuration
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Email settings are configured via environment variables for security. 
          Add these to your <code className="bg-gray-200 px-1 py-0.5 rounded">.env</code> file:
        </p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
          <pre>{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Fashion Store" <noreply@fashionstore.com>
REDIS_URL=redis://localhost:6379  # Optional: for email queue`}</pre>
        </div>
      </div>
    </div>
  );
};
