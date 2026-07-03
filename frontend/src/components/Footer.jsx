import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShoppingBag, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FlavrLogoFull } from '../assets/FlavrLogo';

export default function Footer() {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="bg-white dark:bg-[#0A0F1E] border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <FlavrLogoFull size={24} />
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              AI-powered food discovery platform. Taste the future with personalized meal recommendations.
            </p>
          </div>
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
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Account</h3>
            <ul className="mt-4 space-y-2.5">
              {user ? (
                <>
                  <li><Link to="/profile" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><User size={14} /> Profile</Link></li>
                  <li><Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"><ShoppingBag size={14} /> Orders</Link></li>
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
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/menu" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Help Center</Link></li>
              <li><span className="text-sm text-gray-500 dark:text-gray-400">hello@flavr.app</span></li>
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
