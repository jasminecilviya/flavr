import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShoppingBag, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="bg-white dark:bg-[#0A0F1E] border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              flavr
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              AI-powered food discovery platform. Taste the future with personalized meal recommendations.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/menu" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Menu</Link></li>
              <li><Link to="/ai-assistant" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><Sparkles size={14} /> AI Chef</Link></li>
              {user && (
                <li><Link to="/favorites" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><Heart size={14} /> Favorites</Link></li>
              )}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Account</h3>
            <ul className="mt-4 space-y-2.5">
              {user ? (
                <>
                  <li><Link to="/profile" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><User size={14} /> Profile</Link></li>
                  <li><Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><ShoppingBag size={14} /> Orders</Link></li>
                  <li><Link to="/cart" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Cart</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Register</Link></li>
                </>
              )}
              {isAdmin && (
                <li><Link to="/admin" className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors"><Shield size={14} /> Admin</Link></li>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/menu" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Help Center</Link></li>
              <li><span className="text-sm text-gray-500 dark:text-gray-400">contact@flavr.app</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Flavr. All rights reserved.</p>
          <p className="text-xs">Made with ❤️ and AI</p>
        </div>
      </div>
    </footer>
  );
}
