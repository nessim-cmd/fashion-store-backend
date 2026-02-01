import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { Facebook, Instagram, Twitter, Youtube, CreditCard, Shield, Truck } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 w-full">
        {children}
      </main>
      <PWAInstallPrompt />
      <footer className="bg-gray-950 text-white py-16 w-full mt-auto">
        <div className="w-full px-6 md:px-12 lg:px-24">
           {/* Features Bar */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-gray-800">
             <div className="flex items-center gap-4">
               <Truck size={24} className="text-gray-400" />
               <div>
                 <p className="font-bold text-sm">Free Shipping</p>
                 <p className="text-xs text-gray-500">On orders over $100</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <Shield size={24} className="text-gray-400" />
               <div>
                 <p className="font-bold text-sm">Secure Payments</p>
                 <p className="text-xs text-gray-500">100% protected</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <CreditCard size={24} className="text-gray-400" />
               <div>
                 <p className="font-bold text-sm">Easy Returns</p>
                 <p className="text-xs text-gray-500">30-day return policy</p>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
              <div className="col-span-2 md:col-span-1">
                 <Link to="/" className="text-2xl font-black mb-6 tracking-tighter uppercase block">Luxe.</Link>
                 <p className="text-gray-400 text-sm leading-relaxed mb-6">Elevating your style with premium essentials. Designed for the modern individual.</p>
                 <div className="flex gap-4">
                   <a href="#" className="text-gray-500 hover:text-white transition-colors"><Facebook size={18} /></a>
                   <a href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram size={18} /></a>
                   <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter size={18} /></a>
                   <a href="#" className="text-gray-500 hover:text-white transition-colors"><Youtube size={18} /></a>
                 </div>
              </div>
              <div>
                 <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-300">Shop</h4>
                 <ul className="space-y-3 text-sm text-gray-500">
                    <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                    <li><Link to="/shop?category=Men" className="hover:text-white transition-colors">Men</Link></li>
                    <li><Link to="/shop?category=Women" className="hover:text-white transition-colors">Women</Link></li>
                    <li><Link to="/shop?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
                    <li><Link to="/shop?onSale=true" className="hover:text-white transition-colors">Sale</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-300">Account</h4>
                 <ul className="space-y-3 text-sm text-gray-500">
                    <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
                    <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
                    <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                    <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-300">Help</h4>
                 <ul className="space-y-3 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-300">Newsletter</h4>
                 <p className="text-gray-500 text-sm mb-4">Get exclusive offers and updates.</p>
                 <form className="flex border border-gray-800 bg-gray-900" onSubmit={(e) => e.preventDefault()}>
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="bg-transparent px-4 py-3 w-full text-sm outline-none placeholder:text-gray-600" 
                    />
                    <button className="px-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors border-l border-gray-800">
                      Join
                    </button>
                 </form>
              </div>
           </div>
           <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500">&copy; 2026 LUXE Inc. All rights reserved.</p>
              <div className="flex gap-6 text-xs text-gray-500">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              </div>
           </div>
        </div>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
};
