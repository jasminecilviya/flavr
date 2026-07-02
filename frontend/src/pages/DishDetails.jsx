import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, ChefHat } from 'lucide-react';
import { dishAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function DishDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    dishAPI.getOne(id).then(({ data }) => {
      setDish(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!dish) return <div className="text-center py-20 text-gray-500">Dish not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Menu
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={dish.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800'}
            alt={dish.name} className="w-full aspect-square object-cover" />
          <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-sm font-semibold rounded-full backdrop-blur-sm">
            {dish.category}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            {dish.restaurant && (
              <Link to={`/menu?restaurant=${dish.restaurant._id}`}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                {dish.restaurant.name}
              </Link>
            )}
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} fill="currentColor" className="text-yellow-400" />
              <span className="font-medium">{dish.rating}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{dish.name}</h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">{dish.description}</p>

          <div className="mt-6 text-3xl font-bold text-orange-500">₹{dish.price}</div>

          {/* Tags */}
          {dish.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {dish.tags.map((t) => (
                <span key={t} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Quantity + Add */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Minus size={18} />
              </button>
              <span className="px-6 font-semibold text-lg">{qty}</span>
              <button onClick={() => setQty(qty + 1)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <button onClick={() => addToCart(dish._id, qty)} className="btn-primary flex items-center gap-2">
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>

          {!user && (
            <p className="mt-4 text-sm text-gray-400">
              <Link to="/login" className="text-orange-500 hover:underline">Sign in</Link> to add items to cart
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
