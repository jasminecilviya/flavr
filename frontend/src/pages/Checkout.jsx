import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Tag, X, CheckCircle2 } from 'lucide-react';
import { orderAPI, couponAPI } from '../services/api';
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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const finalTotal = appliedCoupon ? Math.max(0, cartTotal - appliedCoupon.discount) : cartTotal;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;

  // Validate coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const { data } = await couponAPI.validate(couponCode, cartTotal);
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        toast.success(`Coupon applied! ${data.coupon.description}`);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.postalCode) {
      return toast.error('Please fill all shipping fields');
    }
    setProcessing(true);
    try {
      const payload = {
        shippingAddress: form,
        couponCode: appliedCoupon?.code || undefined,
        discount: discount || undefined,
      };
      const { data } = await orderAPI.create(payload);
      if (data.url) {
        window.location.href = data.url;
      } else if (data.demo) {
        toast.success('Demo order placed!');
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
              <><CreditCard size={20} /> Pay ₹{finalTotal}</>
            )}
          </button>
        </motion.form>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card-flavr p-6">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.dish?.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.dish?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="text-orange-500">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="card-flavr p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Tag size={16} className="text-orange-500" /> Have a coupon?
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <div>
                    <span className="font-bold text-sm text-green-600 dark:text-green-400 uppercase">{appliedCoupon.code}</span>
                    <p className="text-xs text-green-500">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button onClick={removeCoupon} className="p-1 hover:bg-green-200 dark:hover:bg-green-900/30 rounded-lg">
                  <X size={16} className="text-green-600" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="input-flavr text-sm uppercase" placeholder="FLAVR50"
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                <button onClick={applyCoupon} disabled={checkingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                  {checkingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
