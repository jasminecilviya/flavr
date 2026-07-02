import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChefHat, Truck, Star } from 'lucide-react';
import { dishAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import DishCard from '../components/DishCard';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORY_IMAGES = {
  Breakfast: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
  Lunch: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600',
  Dinner: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600',
};

const FEATURES = [
  { icon: ChefHat, title: 'Expert Chefs', desc: 'Curated dishes from top restaurants' },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized by your taste' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Track in real-time' },
  { icon: Star, title: 'Top Rated', desc: 'Only the best dishes' },
];

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    dishAPI.getAll({ minRating: 4 }).then(({ data }) => {
      setDishes(data.slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-[#0A0F1E] dark:via-[#0F172A] dark:to-[#1A1F2E]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZjZiMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-full text-sm font-medium text-orange-500 mb-6">
              <Sparkles size={16} /> AI-Powered Food Discovery
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
                Taste the Future
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">with Flavr</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Let AI discover what you'll love. Personalized meal recommendations from the best restaurants, powered by smart taste matching.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/menu" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Explore Menu <ArrowRight size={20} />
              </Link>
              <Link to="/ai-assistant" className="btn-outline text-lg px-8 py-4 inline-flex items-center gap-2">
                <Sparkles size={20} /> Ask AI Chef
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="card-flavr p-4 md:p-6 text-center hover:shadow-md transition-shadow">
              <f.icon size={28} className="mx-auto text-orange-500" />
              <h3 className="mt-2 font-semibold text-sm">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Rated Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Rated</h2>
            <p className="mt-1 text-gray-500">Most loved dishes right now</p>
          </div>
          <Link to="/menu" className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : dishes.map((d, i) => <DishCard key={d._id} dish={d} index={i} onAdd={addToCart} />)
          }
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 dark:bg-[#0F172A] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
            <p className="mt-1 text-gray-500">Find exactly what you're craving</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(CATEGORY_IMAGES).map(([cat, img], i) => (
              <motion.div key={cat} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/menu?category=${cat}`} className="relative group block overflow-hidden rounded-2xl aspect-[4/3]">
                  <img src={img} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{cat}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
