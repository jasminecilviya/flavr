import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { favoriteAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import DishCard from '../components/DishCard';
import SkeletonCard from '../components/SkeletonCard';

export default function Favorites() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    favoriteAPI.getAll().then(({ data }) => {
      setDishes(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFavToggle = (dishId, favorited) => {
    if (!favorited) setDishes(prev => prev.filter(d => d._id !== dishId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Heart size={28} className="text-red-500" /> My Favorites
          </h1>
          <p className="text-gray-500 mt-1">{dishes.length} saved dishes</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : dishes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">Save dishes you love by tapping the heart icon</p>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Browse Menu
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dishes.map((d, i) => (
            <DishCard key={d._id} dish={d} index={i} onAdd={addToCart} favorited={true} onFavToggle={handleFavToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
