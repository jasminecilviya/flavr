import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Loader2 } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, fetchCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.postalCode) {
      return toast.error('Please fill all shipping fields');
    }
    setProcessing(true);
    try {
      const { data } = await orderAPI.create({ shippingAddress: form });
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.demo) {
        // ponytail: demo mode — auto-success without Stripe
        toast.success('Demo order placed! (Stripe keys not configured)');
        await fetchCart();
        navigate('/orders');
      } else {
        toast.success('Order placed!');
        await fetchCart();
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="card-flavr p-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-flavr" placeholder="123 Main St" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-flavr" placeholder="Mumbai" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                  <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="input-flavr" placeholder="400001" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input-flavr" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={processing}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
            {processing ? (
              <><Loader2 size={20} className="animate-spin" /> Processing...</>
            ) : (
              <><CreditCard size={20} /> Pay ₹{cartTotal}</>
            )}
          </button>
        </motion.form>

        {/* Order Summary */}
        <div className="card-flavr p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="truncate mr-2">{item.dish?.name} × {item.quantity}</span>
                <span className="font-medium">₹{(item.dish?.price || 0) * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-500">₹{cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
