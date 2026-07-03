import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function DishCard({ dish, onAdd, index = 0, favorited = false, onFavToggle }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(favorited);
  const [imgLoaded, setImgLoaded] = useState(false);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Login to save favorites');
    try {
      const { data } = await favoriteAPI.toggle(dish._id);
      setIsFav(data.favorited);
      onFavToggle?.(dish._id, data.favorited);
    } catch { /* quiet */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
      className="group relative bg-white dark:bg-[#1A1F2E] rounded-2xl overflow-hidden 
                 shadow-sm hover:shadow-xl dark:shadow-black/20 transition-all duration-500 
                 hover:-translate-y-1.5 border border-gray-100 dark:border-gray-800/50"
    >
      <Link to={`/food/${dish._id}`} className="block">
        {/* Image container with parallax hover */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800">
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <img
            src={dish.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600'}
            alt={dish.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-xs font-semibold rounded-full shadow-lg">
              {dish.category}
            </span>
          </div>
          
          {/* Rating badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-bold rounded-full backdrop-blur-sm shadow-lg">
            <Star size={12} fill="currentColor" /> {dish.rating}
          </div>

          {/* Favorite button */}
          <button onClick={toggleFav}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
                       hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
            <Heart size={16} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} />
          </button>

          {/* Price pill */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-lg shadow-lg">
            ₹{dish.price}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/food/${dish._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-500 transition-colors">
            {dish.name}
          </h3>
        </Link>
        
        {dish.restaurant && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Sparkles size={10} className="text-orange-500" /> {dish.restaurant.name}
          </p>
        )}
        
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {dish.description}
        </p>
        
        {/* Tags */}
        {dish.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {dish.tags.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={(e) => { e.preventDefault(); onAdd?.(dish._id); }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 
                     hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl 
                     transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <Plus size={16} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
