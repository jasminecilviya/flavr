import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock } from 'lucide-react';
import { orderAPI } from '../services/api';
import { STATUS_COLORS } from '../utils/constants';
import Loader from '../components/Loader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMy().then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Place your first order to see it here</p>
          <Link to="/menu" className="btn-primary inline-flex">Browse Menu</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-flavr p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-400 font-mono">#{order._id.slice(-8)}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status] || 'text-gray-500 bg-gray-500/10'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {order.items?.map((item) => (
                      <p key={item._id} className="text-sm text-gray-600 dark:text-gray-400">
                        {item.dish?.name || 'Unknown'} × {item.quantity} — ₹{item.price * item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-orange-500">₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
