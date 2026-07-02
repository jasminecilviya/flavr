import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              flavr
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/menu" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
              Menu
            </Link>
            {user && (
              <Link to="/ai-assistant" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                <Sparkles size={16} />
                AI Chef
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                  <User size={18} />
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <LogOut size={18} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-primary text-sm !py-2 !px-4">
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0F1E]">
          <div className="px-4 py-4 space-y-3">
            <Link to="/menu" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-300">Menu</Link>
            {user && (
              <Link to="/ai-assistant" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Sparkles size={16} /> AI Chef
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-300">Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <User size={16} /> Profile
                </Link>
                <Link to="/orders" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-300">Orders</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-500">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block btn-primary text-center text-sm">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
