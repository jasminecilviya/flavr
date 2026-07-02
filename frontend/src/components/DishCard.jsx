import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DishCard({ dish, onAdd, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-flavr group overflow-hidden"
    >
      <Link to={`/food/${dish._id}`}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={dish.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800'}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 text-xs font-semibold rounded-full backdrop-blur-sm">
            {dish.category}
          </span>
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-bold rounded-full backdrop-blur-sm">
            <Star size={12} fill="currentColor" /> {dish.rating}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/food/${dish._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-500 transition-colors">
            {dish.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{dish.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-orange-500">₹{dish.price}</span>
          <button
            onClick={(e) => { e.preventDefault(); onAdd?.(dish._id); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors active:scale-95"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {dish.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {dish.tags.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
