import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('flavrUser')));
  const [token, setToken] = useState(() => localStorage.getItem('flavrToken'));
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const persist = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('flavrUser', JSON.stringify(userData));
    localStorage.setItem('flavrToken', jwt);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      persist(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      persist(data, data.token);
      toast.success('Account created! Welcome to Flavr.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('flavrUser');
    localStorage.removeItem('flavrToken');
    toast.info('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
