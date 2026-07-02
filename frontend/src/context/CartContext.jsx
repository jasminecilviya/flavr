import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const cartTotal = cartItems.reduce((sum, i) => sum + (i.dish?.price || 0) * i.quantity, 0);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCartItems([]);
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get();
      setCartItems(Array.isArray(data?.items) ? data.items : []);
    } catch { /* cart may not exist yet */ }
  };

  const addToCart = async (dishId, quantity = 1) => {
    if (!user) return toast.error('Login to add items to cart');
    setLoading(true);
    try {
      const { data } = await cartAPI.add(dishId, quantity);
      setCartItems(Array.isArray(data?.items) ? data.items : []);
      toast.success('Added to cart!');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const { data } = await cartAPI.remove(itemId);
      setCartItems(Array.isArray(data?.items) ? data.items : []);
      toast.info('Removed from cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, loading, addToCart, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
