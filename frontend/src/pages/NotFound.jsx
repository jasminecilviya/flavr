import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md">
        <div className="text-8xl font-black mb-4">
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          This kitchen is closed
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back to the menu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={18} /> Go Home
          </Link>
          <Link to="/menu" className="btn-outline flex items-center gap-2">
            <Search size={18} /> Browse Menu
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
