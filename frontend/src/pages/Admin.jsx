import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingBag, Utensils, DollarSign, Plus, Pencil, Trash2,
  X, Star, Search, ChefHat, TrendingUp, PieChart, Calendar
} from 'lucide-react';
import { adminAPI, dishAPI, orderAPI, restaurantAPI, CATEGORIES_LIST } from '../services/api';
import { toast } from 'react-toastify';
import { STATUS_COLORS } from '../utils/constants';

const TAGS_LIST = ['veg', 'non-veg', 'vegan', 'spicy', 'healthy', 'high-protein', 'gluten-free', 'low-carb'];

const EMPTY_DISH = {
  name: '', description: '', price: '', category: 'Lunch',
  restaurant: '', tags: [], rating: 0, isAvailable: true,
};

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dishModal, setDishModal] = useState(null); // null | 'create' | dish object
  const [form, setForm] = useState(EMPTY_DISH);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getOrders().then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      adminAPI.getUsers().then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      dishAPI.getAll({admin: "true"}).then(r => setDishes(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      restaurantAPI.getAll().then(r => setRestaurants(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
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

  // ─── Dish CRUD ──────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_DISH); setDishModal('create'); };
  const openEdit = (dish) => {
    setForm({
      name: dish.name, description: dish.description, price: dish.price,
      category: dish.category, restaurant: dish.restaurant?._id || '',
      tags: dish.tags || [], rating: dish.rating, isAvailable: dish.isAvailable,
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
      const payload = { ...form, price: Number(form.price), rating: Number(form.rating) };
      
      if (dishModal === 'create') {
        await dishAPI.create(payload);
        toast.success('Dish created!');
      } else {
        await dishAPI.update(dishModal._id, payload);
        toast.success('Dish updated!');
      }
      setDishModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save dish');
    } finally { setSaving(false); }
  };

  const deleteDish = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await dishAPI.delete(id);
      setDishes(prev => prev.filter(d => d._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filteredDishes = dishes.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Tabs ───────────────────────────────────────────
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'dishes', label: 'Dishes', icon: Utensils },
    { id: 'restaurants', label: 'Restaurants', icon: ChefHat },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

        {/* ══════ DASHBOARD ══════ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Dishes', value: dishes.length, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { label: 'Users', value: users.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map(s => (
                <div key={s.label} className="card-flavr p-5">
                  <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon size={22} className={s.color} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Order Status Distribution */}
            <div className="card-flavr p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><PieChart size={18} /> Orders by Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className={`p-4 rounded-xl border ${STATUS_COLORS[status] || ''}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm opacity-80">{status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card-flavr p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar size={18} /> Recent Orders</h3>
              <div className="space-y-2">
                {orders.slice(0, 5).map(o => (
                  <div key={o._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="font-mono text-gray-400">#{o._id.slice(-8)}</span>
                    <span className="text-gray-600 dark:text-gray-400">{o.user?.name || 'Guest'}</span>
                    <span className="font-semibold">₹{o.totalAmount}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ ORDERS ══════ */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="card-flavr p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <ShoppingBag size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o._id.slice(-8)}</p>
                      <p className="text-sm font-medium">{o.user?.name || 'Guest'} — <span className="text-gray-500">{o.items?.length} items</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-orange-500">₹{o.totalAmount}</span>
                    <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                      className="input-flavr !py-1.5 !px-2 text-sm min-w-[130px]">
                      {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center py-12 text-gray-500">No orders yet</p>}
          </div>
        )}

        {/* ══════ DISHES ══════ */}
        {tab === 'dishes' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search dishes..." value={search}
                  onChange={e => setSearch(e.target.value)} className="input-flavr !py-2 !pl-9 text-sm" />
              </div>
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm !py-2">
                <Plus size={16} /> Add Dish
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map(d => (
                <div key={d._id} className="card-flavr overflow-hidden group">
                  <div className="relative aspect-video">
                    <img src={d.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400'} alt={d.name}
                      className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                      d.isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>{d.isAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{d.name}</h3>
                        <p className="text-sm text-gray-500">{d.category} • ₹{d.price}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                        <Star size={14} fill="currentColor" /> {d.rating}
                      </div>
                    </div>
                    {d.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={() => openEdit(d)} className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600">
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => deleteDish(d._id, d.name)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ RESTAURANTS ══════ */}
        {tab === 'restaurants' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(r => (
              <div key={r._id} className="card-flavr p-4 flex items-center gap-4">
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
        )}

        {/* ══════ USERS ══════ */}
        {tab === 'users' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <div key={u._id} className="card-flavr p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                </div>
                {u.role === 'admin' && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-full">Admin</span>
                )}
              </div>
            ))}
          </div>
        )}

        </motion.div>
      </AnimatePresence>

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
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="input-flavr" placeholder="Dish name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="input-flavr" rows={2} placeholder="Describe the dish" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      className="input-flavr" placeholder="149" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <input type="number" step="0.1" min="0" max="5" value={form.rating}
                      onChange={e => setForm({...form, rating: e.target.value})} className="input-flavr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="input-flavr">
                      {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Restaurant</label>
                    <select value={form.restaurant} onChange={e => setForm({...form, restaurant: e.target.value})}
                      className="input-flavr">
                      <option value="">Select</option>
                      {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Image Picker */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl: e.target.value})}
                        className="input-flavr text-sm" placeholder="https://images.unsplash.com/..." />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {[
                      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop',
                    ].map(url => (
                      <button key={url} onClick={() => setForm({...form, imageUrl: url})}
                        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-orange-500 transition-all hover:scale-110">
                        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="col-span-2">
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
                  <button onClick={() => setForm({...form, isAvailable: !form.isAvailable})}
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
                  {saving ? 'Saving...' : dishModal === 'create' ? 'Create Dish' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
