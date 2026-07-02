import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0A0F1E] border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              flavr
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              AI-powered food discovery platform. Taste the future with personalized meal recommendations powered by artificial intelligence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Explore</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/menu" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500">Menu</Link></li>
              <li><Link to="/ai-assistant" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500"><Sparkles size={14} /> AI Chef</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Account</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500">Profile</Link></li>
              <li><Link to="/orders" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500">Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Flavr. All rights reserved. Made with ❤️ and AI.
        </div>
      </div>
    </footer>
  );
}
