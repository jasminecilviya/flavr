import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShoppingBag, Utensils, DollarSign, Plus, Pencil, Trash2,
  X, Star, Search, ChefHat, TrendingUp, PieChart, Calendar,
  Gift, Tag, Copy, CheckCircle2, Loader2, BarChart3, Eye, EyeOff,
  Clock, Award
} from 'lucide-react';
import { adminAPI, dishAPI, orderAPI, restaurantAPI, CATEGORIES_LIST } from '../services/api';
import { toast } from 'react-toastify';

const TAGS_LIST = ['veg', 'non-veg', 'vegan', 'spicy', 'healthy', 'high-protein', 'gluten-free', 'low-carb'];

const EMPTY_DISH = {
  name: '', description: '', price: '', category: 'Lunch',
  restaurant: '', tags: [], rating: 4.5, isAvailable: true, imageUrl: '',
};

const EMPTY_COUPON = {
  code: '', discountType: 'percentage', discountValue: '', minOrderAmount: 0,
  maxDiscount: 0, usageLimit: 100, isActive: true,
};

// Unsplash food image presets
const FOOD_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=400&fit=crop', label: 'Steak' },
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop', label: 'Chicken' },
  { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', label: 'Pancakes' },
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', label: 'Platter' },
  { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop', label: 'Salad' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', label: 'Pizza' },
  { url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=400&fit=crop', label: 'Biryani' },
  { url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop', label: 'Dessert' },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dish form
  const [dishModal, setDishModal] = useState(null);
  const [form, setForm] = useState(EMPTY_DISH);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Coupon form
  const [couponModal, setCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);
  const [couponSaving, setCouponSaving] = useState(false);

  // Stats animation
  const [animatedStats, setAnimatedStats] = useState({});

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getOrders().then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      adminAPI.getUsers().then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      dishAPI.getAll({ admin: 'true' }).then(r => setDishes(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      restaurantAPI.getAll().then(r => setRestaurants(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      adminAPI.getCoupons().then(r => setCoupons(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      adminAPI.getStats().then(r => {
        setStats(r.data);
        // Animate stats
        const targets = {
          totalUsers: r.data.totalUsers || 0,
          totalOrders: r.data.totalOrders || 0,
          totalRevenue: r.data.totalRevenue || 0,
          totalDishes: r.data.totalDishes || 0,
        };
        const interval = setInterval(() => {
          setAnimatedStats(prev => {
            const next = {};
            let done = true;
            for (const [key, target] of Object.entries(targets)) {
              next[key] = Math.min((prev[key] || 0) + Math.ceil(target / 20), target);
              if (next[key] < target) done = false;
            }
            if (done) clearInterval(interval);
            return next;
          });
        }, 50);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const ordersByStatus = { Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 };
  orders.forEach(o => { if (ordersByStatus[o.status] !== undefined) ordersByStatus[o.status]++; });

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order → ${status}`);
    } catch { toast.error('Failed'); }
  };

  // ─── Dish CRUD ─────────────────────────────────
  const openCreate = () => { setForm(EMPTY_DISH); setDishModal('create'); };

  const openEdit = (dish) => {
    setForm({
      name: dish.name || '',
      description: dish.description || '',
      price: dish.price || '',
      category: dish.category || 'Lunch',
      restaurant: dish.restaurant?._id || '',
      tags: dish.tags || [],
      rating: dish.rating || 4.5,
      isAvailable: dish.isAvailable !== false,
      imageUrl: dish.imageUrl || '',
    });
    setDishModal(dish);
  };

  const toggleTag = (t) => setForm(prev => ({
    ...prev,
    tags: prev.tags.includes(t) ? prev.tags.filter(x => x !== t) : [...prev.tags, t],
  }));

  const saveDish = async () => {
    if (!form.name || !form.description || !form.price) {
      return toast.error('Name, description, and price required');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        restaurant: form.restaurant || undefined,
        tags: form.tags,
        rating: Number(form.rating || 0),
        isAvailable: form.isAvailable,
        imageUrl: form.imageUrl || undefined,
      };

      if (dishModal === 'create') {
        await dishAPI.create(payload);
        toast.success('Dish created! 🎉');
      } else {
        await dishAPI.update(dishModal._id, payload);
        toast.success('Dish updated! ✅');
      }
      setDishModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save dish');
    } finally { setSaving(false); }
  };

  const deleteDish = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await dishAPI.delete(id);
      setDishes(prev => prev.filter(d => d._id !== id));
      toast.success(`"${name}" deleted`);
    } catch { toast.error('Failed to delete'); }
  };

  const filteredDishes = dishes.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Coupon CRUD ───────────────────────────────
  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue) {
      return toast.error('Code and discount value required');
    }
    setCouponSaving(true);
    try {
      await adminAPI.createCoupon({
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount || 0),
        maxDiscount: Number(couponForm.maxDiscount || 0),
        usageLimit: Number(couponForm.usageLimit || 100),
      });
      toast.success('Coupon created! 🎉');
      setCouponModal(false);
      setCouponForm(EMPTY_COUPON);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create coupon');
    } finally { setCouponSaving(false); }
  };

  const toggleCoupon = async (id) => {
    try {
      const { data } = await adminAPI.toggleCoupon(id);
      setCoupons(prev => prev.map(c => c._id === id ? data : c));
      toast(data.isActive ? 'Coupon activated' : 'Coupon deactivated');
    } catch { toast.error('Failed'); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminAPI.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed'); }
  };

  // ─── Tabs ──────────────────────────────────────
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'dishes', label: 'Dishes', icon: Utensils },
    { id: 'coupons', label: 'Coupons', icon: Gift },
    { id: 'restaurants', label: 'Restaurants', icon: ChefHat },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your Flavr platform</p>
        </div>
        {stats && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} /> Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ DASHBOARD ══════ */}
      {tab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: animatedStats.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { label: 'Total Orders', value: animatedStats.totalOrders || 0, icon: ShoppingBag, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
              { label: 'Revenue', value: `₹${(animatedStats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/10' },
              { label: 'Dishes', value: animatedStats.totalDishes || 0, icon: Utensils, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`${s.bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-800`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
                    <s.icon size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Status */}
            <div className="lg:col-span-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={18} className="text-orange-500" /> Order Status
              </h3>
              <div className="card-flavr p-5 space-y-4">
                {Object.entries(ordersByStatus).map(([status, count]) => {
                  const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                  const colors = {
                    Pending: 'bg-yellow-500',
                    Preparing: 'bg-blue-500',
                    'Out for Delivery': 'bg-purple-500',
                    Delivered: 'bg-green-500',
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{status}</span>
                        <span className="font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[status] || 'bg-gray-500'} rounded-full transition-all duration-1000`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Dishes */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" /> Top Rated Dishes
              </h3>
              <div className="card-flavr overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats?.topDishes?.slice(0, 6).map((d, i) => (
                    <div key={d._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <span className="text-lg font-black text-gray-300 dark:text-gray-600 w-6">#{i + 1}</span>
                      <img src={d.imageUrl || FOOD_IMAGES[0].url} alt={d.name}
                        className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.restaurant?.name || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        <Star size={14} fill="currentColor" /> {d.rating}
                      </div>
                      <span className="text-sm font-bold text-green-500">₹{d.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════ ORDERS ══════ */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-flavr overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">No orders yet</p>
                </div>
              ) : orders.map(o => (
                <div key={o._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          #{String(o._id).slice(-4)}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{o.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{o.user?.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {o.items?.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">
                              {item.dish?.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>₹{o.totalAmount}</span>
                          <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        o.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                        o.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                        o.status === 'Preparing' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      }`}>{o.status}</span>
                      <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-2 py-1.5 font-medium cursor-pointer">
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════ DISHES ══════ */}
      {tab === 'dishes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-flavr !pl-10 !rounded-xl text-sm" placeholder="Search dishes..." />
            </div>
            <button onClick={openCreate} className="btn-primary !py-2.5 text-sm flex items-center gap-2 flex-shrink-0">
              <Plus size={16} /> Add Dish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Utensils size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No dishes found</p>
                <p className="text-sm mt-1">Create your first dish!</p>
              </div>
            ) : filteredDishes.map(d => (
              <motion.div key={d._id} layout
                className="card-flavr overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                  <img src={d.imageUrl || FOOD_IMAGES[0].url} alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      d.isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>{d.isAvailable ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-white font-bold truncate">{d.name}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <span>{d.category}</span>
                      <span>•</span>
                      <span>₹{d.price}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Star size={10} /> {d.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {d.tags?.slice(0, 2).map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] rounded">{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteDish(d._id, d.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════ COUPONS ══════ */}
      {tab === 'coupons' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-end mb-6">
            <button onClick={() => setCouponModal(true)} className="btn-primary !py-2.5 text-sm flex items-center gap-2">
              <Plus size={16} /> New Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Gift size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No coupons yet</p>
                <p className="text-sm mt-1">Create promotional coupons for your users!</p>
              </div>
            ) : coupons.map(c => (
              <motion.div key={c._id} layout
                className={`card-flavr p-5 border-l-4 ${c.isActive ? 'border-l-green-500' : 'border-l-gray-300 dark:border-l-gray-700'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-orange-500" />
                      <span className="font-bold text-lg tracking-wider uppercase">{c.code}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      {c.minOrderAmount > 0 && ` • Min ₹${c.minOrderAmount}`}
                    </p>
                  </div>
                  <button onClick={() => toggleCoupon(c._id)}
                    className={`p-1.5 rounded-lg transition-all ${c.isActive ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {c.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Used: {c.usedCount}/{c.usageLimit}</span>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      toast.success('Copied!');
                    }} className="text-orange-500 hover:underline">Copy</button>
                    <button onClick={() => deleteCoupon(c._id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════ RESTAURANTS ══════ */}
      {tab === 'restaurants' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <ChefHat size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No restaurants</p>
              </div>
            ) : restaurants.map(r => (
              <div key={r._id} className="card-flavr p-5 flex items-center gap-4">
                <img src={r.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                  alt={r.name} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.address}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.menuId?.categories?.join(', ') || 'No categories'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════ USERS ══════ */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No users</p>
              </div>
            ) : users.map(u => (
              <div key={u._id} className="card-flavr p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{u.name}</p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {u.preferences?.length ? u.preferences.join(', ') : 'No preferences'}
                  </p>
                </div>
                {u.role === 'admin' && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-full">Admin</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════ DISH MODAL ══════ */}
      <AnimatePresence>
        {dishModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDishModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-[#1A1F2E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">{dishModal === 'create' ? 'New Dish' : 'Edit Dish'}</h2>
                <button onClick={() => setDishModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-flavr" placeholder="Dish name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      className="input-flavr" rows={2} placeholder="Describe the dish" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="input-flavr" placeholder="149" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <input type="number" step="0.1" min="0" max="5" value={form.rating}
                      onChange={e => setForm({ ...form, rating: e.target.value })} className="input-flavr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="input-flavr">
                      {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Restaurant</label>
                    <select value={form.restaurant} onChange={e => setForm({ ...form, restaurant: e.target.value })}
                      className="input-flavr">
                      <option value="">Select restaurant</option>
                      {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Image Picker - Premium redesign */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="" className="w-full h-full object-cover"
                          onError={e => { e.target.src = FOOD_IMAGES[0].url; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Preview</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                        className="input-flavr text-sm" placeholder="Paste image URL..." />
                    </div>
                  </div>
                  {/* Quick image picker grid */}
                  <div className="flex gap-1.5 mt-1 overflow-x-auto pb-1">
                    {FOOD_IMAGES.map(img => (
                      <button key={img.url} onClick={() => setForm({ ...form, imageUrl: img.url })}
                        className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all hover:scale-110 ${
                          form.imageUrl === img.url ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-transparent hover:border-orange-500'
                        }`}>
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_LIST.map(t => (
                      <button key={t} onClick={() => toggleTag(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          form.tags.includes(t)
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Available toggle */}
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${form.isAvailable ? 'left-7' : 'left-1'}`} />
                  </button>
                  <span className="text-sm">{form.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setDishModal(null)} className="flex-1 btn-outline !py-2.5 text-sm">Cancel</button>
                <button onClick={saveDish} disabled={saving}
                  className="flex-1 btn-primary !py-2.5 text-sm">
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : dishModal === 'create' ? 'Create Dish' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ COUPON MODAL ══════ */}
      <AnimatePresence>
        {couponModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setCouponModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-[#1A1F2E] rounded-2xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">Create Coupon</h2>
                <button onClick={() => setCouponModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code</label>
                  <input value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="input-flavr uppercase tracking-widest" placeholder="FLAVR50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="input-flavr">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input type="number" value={couponForm.discountValue}
                      onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                      className="input-flavr" placeholder={couponForm.discountType === 'percentage' ? '20' : '100'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order (₹)</label>
                    <input type="number" value={couponForm.minOrderAmount}
                      onChange={e => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                      className="input-flavr" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                    <input type="number" value={couponForm.maxDiscount}
                      onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                      className="input-flavr" placeholder="0 = no limit" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit</label>
                  <input type="number" value={couponForm.usageLimit}
                    onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="input-flavr" placeholder="100" />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setCouponModal(null)} className="flex-1 btn-outline !py-2.5 text-sm">Cancel</button>
                <button onClick={saveCoupon} disabled={couponSaving}
                  className="flex-1 btn-primary !py-2.5 text-sm">
                  {couponSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Coupon'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
