import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { orderAPI } from '../services/api';
import { STATUS_COLORS } from '../utils/constants';
import Loader from '../components/Loader';

const STATUS_STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Pending': Package,
  'Preparing': Sparkles,
  'Out for Delivery': MapPin,
  'Delivered': Package,
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    orderAPI.getMy().then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 mt-1">Track your orders in real-time</p>
      </div>

      {orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 card-flavr">
          <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Place your first order and track it here</p>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Browse Menu
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, i) => {
            const currentStatusIdx = STATUS_STEPS.indexOf(order.status);
            const StatusIcon = STATUS_ICONS[order.status] || Package;
            const isExpanded = expanded === order._id;

            return (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-flavr overflow-hidden hover:shadow-lg transition-shadow">
                
                {/* Header */}
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : order._id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <StatusIcon size={22} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">#{order._id.slice(-8)}</span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {order.items?.length} items • ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <ChevronRight size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded: Tracking Timeline */}
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-gray-100 dark:border-gray-800">
                    <div className="p-5">
                      {/* Timeline */}
                      <div className="relative ml-2.5">
                        {STATUS_STEPS.map((step, idx) => {
                          const StepIcon = STATUS_ICONS[step];
                          const isActive = idx <= currentStatusIdx;
                          const isCurrent = idx === currentStatusIdx;
                          return (
                            <div key={step} className="flex items-start gap-4 pb-8 last:pb-0 relative">
                              {/* Line */}
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`absolute left-[11px] top-8 w-0.5 h-10 ${isActive ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                              )}
                              {/* Dot */}
                              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                                isActive ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700'
                              } ${isCurrent ? 'ring-4 ring-orange-500/20' : ''}`}>
                                <StepIcon size={12} className={isActive ? 'text-white' : 'text-gray-400'} />
                              </div>
                              {/* Content */}
                              <div className="flex-1 -mt-0.5">
                                <p className={`font-medium text-sm ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                  {step}
                                </p>
                                {isCurrent && order.createdAt && (
                                  <p className="text-xs text-orange-500 font-medium mt-0.5">
                                    {currentStatusIdx === 0 ? 'Order placed' :
                                     currentStatusIdx === 1 ? 'Being prepared' :
                                     currentStatusIdx === 2 ? 'On its way!' : 'Delivered'}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items List */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div key={item._id} className="flex items-center justify-between text-sm py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">{item.quantity}×</span>
                                <span className="text-gray-700 dark:text-gray-300">{item.dish?.name || 'Unknown'}</span>
                              </div>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span>Total</span>
                          <span className="text-orange-500">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Shipping */}
                      {order.shippingAddress && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
