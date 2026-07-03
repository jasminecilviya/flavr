import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, ChefHat, Truck, Star, Heart, Search, TrendingUp } from 'lucide-react';
import { dishAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DishCard from '../components/DishCard';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORY_IMAGES = {
  Breakfast: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  Lunch: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
  Dinner: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
};

const FEATURES = [
  { icon: ChefHat, title: 'Expert Chefs', desc: 'Curated from top restaurants', color: 'from-orange-500 to-red-500' },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized by your taste', color: 'from-purple-500 to-pink-500' },
  { icon: Truck, title: 'Lightning Delivery', desc: 'Track in real-time', color: 'from-blue-500 to-cyan-500' },
  { icon: Star, title: 'Top Rated Only', desc: 'Best dishes guaranteed', color: 'from-yellow-500 to-orange-500' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=600&fit=crop&q=80',
];

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImg, setHeroImg] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const heroRef = useRef(null);

  // Parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dishAPI.getAll({ minRating: 4 }).then(({ data }) => {
      setDishes(Array.isArray(data) ? data.slice(0, 8) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section ref={heroRef} className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Background image with parallax */}
        {HERO_IMAGES.map((img, i) => (
          <motion.div key={img} style={{ y: heroY }}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroImg ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
          </motion.div>
        ))}

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1.5 h-1.5 bg-orange-500/30 rounded-full"
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', opacity: 0 }}
              animate={{ y: [null, '-10%'], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
              style={{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }} />
          ))}
        </div>

        {/* Content */}
        <motion.div style={{ opacity: heroOpacity }}
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-sm font-medium text-white/90 mb-6 border border-white/10">
              <Sparkles size={14} className="text-orange-400" /> AI-Powered Food Discovery
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05]">
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                Taste the
              </span>
              <br />
              <span className="text-white">Future</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/70 max-w-lg leading-relaxed">
              Let AI discover what you'll crave. Smart meal matching from the best restaurants, powered by your tastes.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link to="/menu" className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl text-lg
                         hover:shadow-2xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all inline-flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2">Explore Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link to="/ai-assistant"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/20
                           hover:bg-white/20 transition-all inline-flex items-center gap-2">
                <Sparkles size={20} /> Ask AI Chef
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-8 text-white/60">
              <div><span className="text-white font-bold text-xl">30+</span><p className="text-xs mt-0.5">Premium Dishes</p></div>
              <div><span className="text-white font-bold text-xl">3</span><p className="text-xs mt-0.5">Top Restaurants</p></div>
              <div><span className="text-white font-bold text-xl">4.7</span><p className="text-xs mt-0.5">Avg Rating</p></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}
              className="group bg-white dark:bg-[#1A1F2E] rounded-2xl p-5 md:p-6 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300
                         border border-gray-100 dark:border-gray-800 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ TOP RATED ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Top Picks</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">Most Loved Dishes</h2>
            <p className="mt-1 text-gray-500">Hand-picked favorites from our community</p>
          </div>
          <Link to="/menu" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : dishes.map((d, i) => <DishCard key={d._id} dish={d} index={i} onAdd={addToCart} />)
          }
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-20 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">Browse by Category</h2>
            <p className="mt-1 text-gray-500">Find exactly what you're craving</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Object.entries(CATEGORY_IMAGES).map(([cat, img], i) => (
              <motion.div key={cat} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/menu?category=${cat}`}
                  className="relative group block overflow-hidden rounded-2xl aspect-[4/3] shadow-lg">
                  <img src={img} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-xl">{cat}</h3>
                    <p className="text-white/60 text-sm mt-0.5">Explore →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 p-8 md:p-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready for a flavor trip?</h2>
              <p className="mt-2 text-white/80 text-lg">Let our AI find your next favorite dish in seconds.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/menu" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all">
                Get Started
              </Link>
              {!user && (
                <Link to="/register" className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
