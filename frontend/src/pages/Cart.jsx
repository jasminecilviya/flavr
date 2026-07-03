import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => setImgErrors(prev => ({ ...prev, [id]: true }));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <ShoppingBag size={48} className="text-orange-500/60" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added anything yet. Explore our menu and find something delicious!</p>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
            <ArrowLeft size={18} /> Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag size={28} className="text-orange-500" /> Your Cart
          </h1>
          <p className="text-gray-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} • ₹{cartTotal}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card-flavr p-4 flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {imgErrors[item._id] || !item.dish?.imageUrl ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">🍽️</div>
                ) : (
                  <img src={item.dish.imageUrl} alt={item.dish?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => handleImgError(item._id)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/food/${item.dish?._id}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-orange-500 truncate block transition-colors">
                  {item.dish?.name || 'Unknown Dish'}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">₹{item.dish?.price} each</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <button onClick={() => updateQuantity?.(item._id, Math.max(1, item.quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="font-semibold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity?.(item._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <p className="font-bold text-orange-500">₹{(item.dish?.price || 0) * item.quantity}</p>
                  <button onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-flavr p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Items ({itemCount})</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="text-green-500 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">₹{cartTotal}</span>
              </div>
            </div>
          </div>
          <Link to="/checkout"
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5">
            Proceed to Checkout <ArrowLeft size={16} className="rotate-180" />
          </Link>
          <Link to="/menu"
            className="block text-center text-xs text-gray-400 hover:text-orange-500 mt-3 transition-colors">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
