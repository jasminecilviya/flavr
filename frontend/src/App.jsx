import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Favorites from "./pages/Favorites";
import Menu from './pages/Menu';
import DishDetails from './pages/DishDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/food/:id" element={<DishDetails />} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                    <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              theme="dark"
              toastClassName="!bg-[#1A1F2E] !text-gray-100 !rounded-xl !shadow-xl"
              progressClassName="!bg-gradient-to-r !from-orange-500 !to-red-500"
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
