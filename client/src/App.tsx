
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';

// Admin Imports
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlist" element={<Wishlist />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
