import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Search from './pages/Search';
import Category from './pages/Category';
import Shoes from './pages/Shoes';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaymentComplete from './pages/PaymentComplete';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminAgents from './pages/AdminAgents';
import AdminPayments from './pages/AdminPayments';
import AdminProducts from './pages/AdminProducts';
import AgentApply from './pages/AgentApply';
import AdminPromo from './pages/AdminPromo';
import AdminReports from './pages/AdminReports';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/common/Footer';

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/search" element={<Search />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/shoes" element={<Shoes />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/complete" element={<PaymentComplete />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/apply" element={<AgentApply />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/promo" element={<AdminPromo />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  );
}
