import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card-flavr p-4 flex items-center gap-4">
              <img src={item.dish?.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200'}
                alt={item.dish?.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/food/${item.dish?._id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-orange-500 truncate block">
                  {item.dish?.name || 'Unknown'}
                </Link>
                <p className="text-sm text-gray-500">₹{item.dish?.price} × {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-500">₹{(item.dish?.price || 0) * item.quantity}</p>
                <button onClick={() => removeFromCart(item._id)}
                  className="mt-1 text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-flavr p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="text-green-500">Free</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">₹{cartTotal}</span>
              </div>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
