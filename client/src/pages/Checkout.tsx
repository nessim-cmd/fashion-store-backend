import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Layout } from '../layouts/Layout';
import api from '../api/client';
import toast from 'react-hot-toast';
import { CreditCard, Banknote, ArrowLeft, ShieldCheck, Truck, RotateCcw, Plus, Check } from 'lucide-react';

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

interface ShippingForm {
  fullName: string;
  email: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  // Fetch saved addresses
  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    },
    enabled: !!user,
  });

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setUseNewAddress(false);
    } else if (addresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [addresses, selectedAddressId]);
  
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: user?.name || '',
    email: user?.email || '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'United States',
    phone: ''
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await api.post('/orders', orderData);
      return res.data;
    },
    onSuccess: () => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.get(`/coupons/validate/${code}`);
      return res.data;
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      const discountText = data.type === 'PERCENTAGE' ? `${data.discount}% off` : `$${data.discount} off`;
      toast.success(`Coupon applied: ${discountText}!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  });

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-black tracking-tight mb-4 uppercase">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Add items to your cart to proceed with checkout.</p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-black tracking-tight mb-4 uppercase">Sign In to Checkout</h2>
          <p className="text-gray-500 mb-8">Please log in to complete your purchase.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderItems = items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor
    }));

    // Get shipping address from saved address or form
    let shippingAddress;
    if (!useNewAddress && selectedAddressId) {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (selectedAddress) {
        shippingAddress = {
          fullName: selectedAddress.name,
          streetAddress: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        };
      }
    } else {
      // Validate new address form
      if (!shippingForm.fullName || !shippingForm.streetAddress || !shippingForm.city || !shippingForm.postalCode || !shippingForm.country || !shippingForm.phone) {
        toast.error('Please fill in all shipping fields');
        return;
      }
      shippingAddress = {
        fullName: shippingForm.fullName,
        streetAddress: shippingForm.streetAddress,
        city: shippingForm.city,
        postalCode: shippingForm.postalCode,
        country: shippingForm.country,
        phone: shippingForm.phone
      };
    }

    if (!shippingAddress) {
      toast.error('Please select or enter a shipping address');
      return;
    }

    const orderData = {
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod === 'cod' ? 'CASH_ON_DELIVERY' : 'CREDIT_CARD',
      couponId: appliedCoupon?.id
    };

    createOrderMutation.mutate(orderData);
  };

  const subtotal = total();
  const discount = appliedCoupon ? (subtotal * (appliedCoupon.discount / 100)) : 0;
  const finalTotal = subtotal - discount;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
        <Link to="/cart" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to Cart
        </Link>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white p-6 border border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">
                Shipping Address
              </h2>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Saved Addresses</p>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border cursor-pointer transition-all ${
                          !useNewAddress && selectedAddressId === address.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingAddress"
                            checked={!useNewAddress && selectedAddressId === address.id}
                            onChange={() => {
                              setSelectedAddressId(address.id);
                              setUseNewAddress(false);
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{address.name}</span>
                              {address.isDefault && (
                                <span className="bg-black text-white text-[10px] font-bold uppercase px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
                            </p>
                          </div>
                          {!useNewAddress && selectedAddressId === address.id && (
                            <Check size={20} className="text-black" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* New Address Option */}
              <div className="mb-4">
                <label
                  className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                    useNewAddress
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingAddress"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <Plus size={18} />
                  <span className="font-medium">Use a new address</span>
                </label>
              </div>

              {/* New Address Form */}
              {useNewAddress && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="John Doe"
                      required={useNewAddress}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      required={useNewAddress}
                    />
                  </div>
                  <Input
                    label="Street Address"
                    value={shippingForm.streetAddress}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                    placeholder="123 Main Street"
                    required={useNewAddress}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                      required={useNewAddress}
                    />
                    <Input
                      label="Postal Code"
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="10001"
                      required={useNewAddress}
                    />
                    <Input
                      label="Country"
                      value={shippingForm.country}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="United States"
                      required={useNewAddress}
                      className="col-span-2 md:col-span-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 border border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">
                Payment Method
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 hover:border-black'
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-bold uppercase">Credit Card</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 hover:border-black'
                  }`}
                >
                  <Banknote size={24} />
                  <span className="text-xs font-bold uppercase">Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Secure Card Payment</p>
                  <Input
                    label="Card Number"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="4242 4242 4242 4242"
                    required={paymentMethod === 'card'}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      value={cardForm.expiryDate}
                      onChange={(e) => setCardForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      placeholder="MM/YY"
                      required={paymentMethod === 'card'}
                    />
                    <Input
                      label="CVC"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                      placeholder="123"
                      required={paymentMethod === 'card'}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-gray-50 text-sm text-gray-600">
                  <p>Pay with cash upon delivery. A handling fee may apply for some locations.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 lg:p-8 sticky top-28">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                {items.map(item => (
                  <div key={item.cartId} className="flex gap-4">
                    <div className="w-16 h-20 bg-white flex-shrink-0">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <span className="font-bold text-sm">{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 border border-gray-200 py-2 px-3 text-sm uppercase focus:outline-none focus:border-black"
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => applyCouponMutation.mutate(couponCode)}
                    isLoading={applyCouponMutation.isPending}
                    disabled={!couponCode || !!appliedCoupon}
                    className="text-xs"
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Coupon "{appliedCoupon.code}" applied
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-300">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-black">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full mt-6 h-14 text-sm"
                isLoading={createOrderMutation.isPending}
              >
                {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(finalTotal)}`}
              </Button>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={18} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck size={18} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Free Ship</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw size={18} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Returns</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};
