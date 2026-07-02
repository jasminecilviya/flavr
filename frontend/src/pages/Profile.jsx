import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ALL_PREFERENCES = [
  'veg', 'non-veg', 'vegan', 'spicy', 'healthy', 'high-protein', 'gluten-free', 'low-carb',
];

export default function Profile() {
  const { user, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [preferences, setPreferences] = useState(user?.preferences || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferences(user.preferences || []);
    }
  }, [user]);

  const togglePref = (p) => {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name, preferences });
      // Update local state
      const updatedUser = { ...user, name, preferences };
      localStorage.setItem('flavrUser', JSON.stringify(updatedUser));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>

        <div className="card-flavr p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
          </div>
        </div>

        <div className="card-flavr p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-flavr pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Dietary Preferences <span className="text-gray-400 font-normal">(used by AI Chef)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_PREFERENCES.map((p) => (
                <button key={p} onClick={() => togglePref(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    preferences.includes(p)
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
