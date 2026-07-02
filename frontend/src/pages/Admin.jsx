import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Utensils, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { adminAPI, dishAPI, orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { STATUS_COLORS } from '../utils/constants';

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getOrders().then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      adminAPI.getUsers().then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      dishAPI.getAll().then(r => setDishes(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Dishes', value: dishes.length, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Revenue', value: `₹${orders.reduce((s, o) => s + o.totalAmount, 0)}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success(`Order ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteDish = async (id) => {
    if (!confirm('Delete this dish?')) return;
    try {
      await dishAPI.delete(id);
      setDishes((prev) => prev.filter((d) => d._id !== id));
      toast.success('Dish deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'dishes', label: 'Dishes' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card-flavr p-6">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <s.icon size={24} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="card-flavr p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-mono text-gray-400">#{order._id.slice(-8)} — {order.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">₹{order.totalAmount} • {order.items?.length} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="input-flavr !py-1.5 !px-3 text-sm min-w-[140px]">
                    {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-500 text-center py-8">No orders yet</p>}
        </motion.div>
      )}

      {tab === 'dishes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{dishes.length} dishes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <div key={dish._id} className="card-flavr p-4 flex items-center gap-4">
                <img src={dish.imageUrl || ''} alt={dish.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{dish.name}</p>
                  <p className="text-sm text-gray-500">₹{dish.price} • {dish.category}</p>
                </div>
                <button onClick={() => deleteDish(dish._id)}
                  className="text-sm text-red-500 hover:text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="card-flavr p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              {u.role === 'admin' && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-full">Admin</span>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
