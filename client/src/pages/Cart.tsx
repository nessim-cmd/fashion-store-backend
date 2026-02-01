import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Layout } from '../layouts/Layout';
import { Button } from '../components/ui/Button';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const formatPrice = useSettingsStore((s) => s.formatPrice);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <ArrowRight size={30} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">Your Bag is Empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">Items remain in your bag for 60 minutes, but aren't reserved.</p>
          <Link to="/">
             <Button className="bg-black text-white hover:bg-gray-800 h-14 px-10 uppercase tracking-widest text-xs font-bold rounded-none">
                Start Shopping
             </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-24">
         {/* Breadcrumb / Back */}
         <div className="mb-10 pt-4">
            <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-black">
               <ArrowLeft size={16} className="mr-2" /> Continue Shopping
            </Link>
         </div>

         <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start pb-24">
            {/* Cart Items */}
            <div className="lg:col-span-8">
               <h1 className="text-4xl font-black mb-8 border-b border-gray-100 pb-4 uppercase tracking-tighter">Shopping Bag ({items.length})</h1>
               
               <ul className="divide-y divide-gray-100">
               {items.map((item) => (
                  <li key={item.cartId} className="flex py-10">
                     <div className="flex-shrink-0 w-32 h-40 bg-gray-100 overflow-hidden">
                        <img
                           src={item.images[0]}
                           alt={item.name}
                           className="w-full h-full object-center object-cover"
                        />
                     </div>

                     <div className="ml-6 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                           <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                 <Link to={`/product/${item.id}`}>{item.name}</Link>
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">{item.category?.name || 'Item'}</p>
                              
                              <div className="mt-4 space-y-1">
                                 {item.selectedSize && (
                                    <p className="text-sm text-gray-600">Size: <span className="font-semibold">{item.selectedSize}</span></p>
                                 )}
                                 {item.selectedColor && (
                                    <p className="text-sm text-gray-600">Color: <span className="font-semibold">{item.selectedColor}</span></p>
                                 )}
                              </div>
                           </div>
                           <p className="text-lg font-bold text-gray-900">
                              {formatPrice((item.salePrice || item.price) * item.quantity)}
                           </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center border border-gray-200">
                              <button
                                 onClick={() => updateQuantity(item.cartId, Math.max(0, item.quantity - 1))}
                                 className="p-2 hover:bg-gray-50"
                              >
                                 <Minus size={14} />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                 onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                 className="p-2 hover:bg-gray-50"
                              >
                                 <Plus size={14} />
                              </button>
                           </div>
                           <button
                              type="button"
                              onClick={() => removeItem(item.cartId)}
                              className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider text-[10px]"
                           >
                              <Trash2 size={14} /> Remove
                           </button>
                        </div>
                     </div>
                  </li>
               ))}
               </ul>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-16 lg:mt-0">
               <div className="bg-gray-50 p-8 lg:p-10 sticky top-32">
                  <h2 className="text-lg font-bold text-gray-900 mb-8 uppercase tracking-widest">Order Summary</h2>
                  
                  <div className="flow-root">
                     <dl className="-my-4 text-sm text-gray-500 divide-y divide-gray-200">
                        <div className="py-4 flex items-center justify-between">
                           <dt className="text-gray-600">Subtotal</dt>
                           <dd className="font-medium text-gray-900">{formatPrice(total())}</dd>
                        </div>
                        <div className="py-4 flex items-center justify-between">
                           <dt className="text-gray-600">Shipping</dt>
                           <dd className="font-medium text-gray-900">Calculated later</dd>
                        </div>
                        <div className="py-4 flex items-center justify-between border-t border-gray-300 mt-4 pt-4">
                           <dt className="text-base font-bold text-gray-900">Order Total</dt>
                           <dd className="text-xl font-black text-gray-900">{formatPrice(total())}</dd>
                        </div>
                     </dl>
                  </div>

                  <div className="mt-8">
                     <Link to="/checkout">
                        <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase tracking-widest rounded-none shadow-xl">
                           Checkout <ArrowRight size={16} className="ml-2" />
                        </Button>
                     </Link>
                  </div>
                  
                  <div className="mt-6 text-xs text-center text-gray-500 leading-relaxed">
                     <p>Free standard shipping on all orders over $200.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </Layout>
  );
};
