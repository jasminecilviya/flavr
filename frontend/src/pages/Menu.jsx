import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Utensils } from 'lucide-react';
import { dishAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import DishCard from '../components/DishCard';
import SkeletonCard from '../components/SkeletonCard';
import { CATEGORIES } from '../utils/constants';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;

    dishAPI.getAll(params).then(({ data }) => {
      setDishes(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, category, priceRange]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const hasFilters = search || category || priceRange.min || priceRange.max;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Our Menu</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Discover dishes curated for you</p>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search dishes..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-flavr pl-10 pr-4" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-shrink-0 ${
            showFilters || hasFilters
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-500'
          }`}>
          <SlidersHorizontal size={18} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-white" />}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden">
            <div className="p-4 card-flavr">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="input-flavr !py-2 !px-3 text-sm min-w-[150px]">
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
                  <input type="number" placeholder="₹0" value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="input-flavr !py-2 !px-3 text-sm w-28" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
                  <input type="number" placeholder="₹500" value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="input-flavr !py-2 !px-3 text-sm w-28" />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 py-2 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <X size={16} /> Clear all
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !category ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === c ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>{c}</button>
        ))}
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4">{dishes.length} dish{dishes.length !== 1 ? 'es' : ''} found</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : dishes.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Utensils size={36} className="text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">No dishes found</p>
            <p className="text-sm text-gray-500 mt-1">Try different filters or search terms</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-outline !py-2 !px-4 text-sm mt-4">
                Clear Filters
              </button>
            )}
          </div>
        ) : dishes.map((d, i) => <DishCard key={d._id} dish={d} index={i} onAdd={addToCart} />)}
      </div>
    </div>
  );
}
