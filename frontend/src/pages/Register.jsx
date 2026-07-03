import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (user) { navigate('/'); return null; }

  const passwordsMatch = form.password === form.confirm;
  const passwordValid = form.password.length >= 6;
  const canSubmit = form.name && form.email && form.password && passwordsMatch && passwordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    await register(form.name, form.email, form.password);
    navigate('/menu');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20 mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Flavr</h1>
          <p className="mt-2 text-gray-500">Create your account and start exploring</p>
        </div>

        <form onSubmit={handleSubmit} className="card-flavr p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-flavr pl-10" placeholder="Your name" required />
            </div>
          </div>

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
                className={`input-flavr pl-10 pr-10 ${submitted && form.password && !passwordValid ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Min 6 characters" minLength={6} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {submitted && form.password && !passwordValid && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <XCircle size={12} /> Password must be at least 6 characters
              </motion.p>
            )}
            {form.password && passwordValid && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Password is strong enough
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={`input-flavr ${submitted && form.confirm && !passwordsMatch ? '!border-red-500 !ring-red-500' : ''} ${
                form.confirm && passwordsMatch ? '!border-green-500 !ring-green-500' : ''
              }`}
              placeholder="Repeat password" minLength={6} required />
            {submitted && form.confirm && !passwordsMatch && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <XCircle size={12} /> Passwords don't match
              </motion.p>
            )}
            {form.confirm && passwordsMatch && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Passwords match
              </motion.p>
            )}
          </div>

          <button type="submit" disabled={loading || (submitted && !canSubmit)}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[#1A1F2E] px-3 text-gray-400">already have an account?</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-orange-500 hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
