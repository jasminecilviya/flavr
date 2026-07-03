import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [form, setForm] = useState({ email: 'priya@example.com', password: 'user123' });
  const [showPw, setShowPw] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
    navigate('/menu');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20 mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-500">Sign in to continue to Flavr</p>
        </div>

        <form onSubmit={handleSubmit} className="card-flavr p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-flavr pl-10" placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-flavr pl-10 pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo credentials hint */}
          <div className="text-center">
            <button type="button" onClick={() => setShowDemo(!showDemo)}
              className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
              {showDemo ? 'Hide demo credentials' : 'Show demo credentials'}
            </button>
            {showDemo && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-left border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Demo Accounts:</p>
                <div className="space-y-1 text-gray-500">
                  <p><span className="font-medium text-orange-500">Admin:</span> admin@flavr.com / admin123</p>
                  <p><span className="font-medium text-orange-500">User:</span> priya@example.com / user123</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[#1A1F2E] px-3 text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:underline font-medium">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
