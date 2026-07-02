import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
      setDishes(data);
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
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-flavr pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
            showFilters || hasFilters
              ? 'bg-orange-500 text-white border-orange-500'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-500'
          }`}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 card-flavr">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="input-flavr !py-2 !px-3 text-sm min-w-[140px]">
                <option value="">All</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
              <input type="number" placeholder="₹0" value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="input-flavr !py-2 !px-3 text-sm w-24" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
              <input type="number" placeholder="₹500" value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="input-flavr !py-2 !px-3 text-sm w-24" />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 py-2">
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !category ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : dishes.length === 0
            ? <p className="col-span-full text-center py-12 text-gray-500">No dishes found. Try different filters.</p>
            : dishes.map((d, i) => <DishCard key={d._id} dish={d} index={i} onAdd={addToCart} />)
        }
      </div>
    </div>
  );
}
