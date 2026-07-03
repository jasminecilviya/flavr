import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Heart, ChevronDown, MessageCircle, Sparkles } from 'lucide-react';
import { dishAPI, reviewAPI, favoriteAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function DishDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [dish, setDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dishAPI.getOne(id).then(({ data }) => setDish(data)),
      reviewAPI.get(id).then(({ data }) => setReviews(Array.isArray(data) ? data : [])),
      user ? favoriteAPI.getIds().then(({ data }) => setIsFav(data.includes(id))).catch(() => {}) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [id, user]);

  const toggleFav = async () => {
    if (!user) return toast.error('Login to save favorites');
    const { data } = await favoriteAPI.toggle(id);
    setIsFav(data.favorited);
    toast(data.favorited ? 'Saved to favorites ❤️' : 'Removed from favorites');
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const { data } = await reviewAPI.create(id, reviewData);
      toast.success('Review submitted!');
      setReviews(prev => [data, ...prev.filter(r => r.user?._id !== user._id)]);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="space-y-6">
          <div className="h-4 w-1/4 skeleton" />
          <div className="h-8 w-3/4 skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-2/3 skeleton" />
          <div className="h-10 w-1/3 skeleton" />
        </div>
      </div>
    </div>
  );

  if (!dish) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-6xl mb-4">😋</p>
      <p className="text-xl font-semibold">Dish not found</p>
    </div>
  );

  const userReview = reviews.find(r => r.user?._id === user?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Menu
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden group">
          <img src={dish.imageUrl || 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800'}
            alt={dish.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 text-sm font-semibold rounded-full backdrop-blur-md shadow-lg">
            {dish.category}
          </span>
          <button onClick={toggleFav}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg">
            <Heart size={20} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          {dish.restaurant && (
            <Link to={`/menu?restaurant=${dish.restaurant._id}`}
              className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium mb-1">
              <Sparkles size={14} /> {dish.restaurant.name}
            </Link>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className={i <= Math.round(dish.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({dish.rating})</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{dish.name}</h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed text-lg">{dish.description}</p>

          <div className="mt-6">
            <span className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              ₹{dish.price}
            </span>
          </div>

          {/* Tags */}
          {dish.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {dish.tags.map((t) => (
                <span key={t} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 rounded-full font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Quantity + Add */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:bg-gray-200 dark:active:bg-gray-700">
                <Minus size={18} />
              </button>
              <span className="px-6 font-semibold text-lg min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)}
                className="p-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:bg-gray-200 dark:active:bg-gray-700">
                <Plus size={18} />
              </button>
            </div>
            <button onClick={() => { addToCart(dish._id, qty); }} className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-3.5">
              <ShoppingCart size={20} /> Add to Cart — ₹{dish.price * qty}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ Reviews Section ═══ */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle size={24} className="text-orange-500" /> Reviews
            </h2>
            <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews • {dish.rating} avg rating</p>
          </div>
          {user && !userReview && (
            <button onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary !py-2.5 text-sm flex items-center gap-2">
              <Star size={16} /> Write Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="card-flavr p-6 mb-6 overflow-hidden">
            <h3 className="font-semibold mb-4">Your Review</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setReviewData({ ...reviewData, rating: i })}
                  className="transition-all hover:scale-110">
                  <Star size={28} className={i <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium">{reviewData.rating}/5</span>
            </div>
            <textarea value={reviewData.comment} onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
              className="input-flavr" rows={3} placeholder="What did you think? (optional)" maxLength={500} />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">{reviewData.comment.length}/500</span>
              <div className="flex gap-3">
                <button onClick={() => setShowReviewForm(false)} className="btn-outline !py-2 !px-4 text-sm">Cancel</button>
                <button onClick={submitReview} disabled={submittingReview}
                  className="btn-primary !py-2 !px-6 text-sm">{submittingReview ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 card-flavr">
              <MessageCircle size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500">No reviews yet. Be the first!</p>
            </div>
          ) : reviews.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card-flavr p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                    {r.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} className={i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>}
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
