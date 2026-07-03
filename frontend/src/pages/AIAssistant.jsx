import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Loader2, Bot, Mic, MicOff, Sliders,
  TrendingUp, DollarSign, Heart, Zap, ChefHat, Plus, X,
  Languages, Calendar, Sun, Moon, MessageSquare, RefreshCw,
  Globe, Copy, CheckCircle2
} from 'lucide-react';
import { aiAPI } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LANGUAGES = [
  { code: 'english', label: 'English', flag: '🇬🇧', greeting: "Hey! I'm FlavrAI 🍽️" },
  { code: 'hindi', label: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते! मैं FlavrAI हूँ 🍽️' },
  { code: 'tamil', label: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்! நான் FlavrAI 🍽️' },
];

const MOODS = [
  { emoji: '🙂', label: 'Healthy', prompt: 'Suggest healthy, low-calorie options', color: 'from-green-500 to-emerald-500' },
  { emoji: '🔥', label: 'Spicy', prompt: 'Something spicy and flavorful', color: 'from-red-500 to-orange-500' },
  { emoji: '💰', label: 'Budget', prompt: 'Best value dishes under ₹200', color: 'from-yellow-500 to-orange-500' },
  { emoji: '🤤', label: 'Cheat Day', prompt: 'Indulgent, decadent comfort food', color: 'from-purple-500 to-pink-500' },
  { emoji: '💪', label: 'High Protein', prompt: 'High protein meals', color: 'from-blue-500 to-cyan-500' },
  { emoji: '🌿', label: 'Vegan', prompt: 'Vegan plant-based options', color: 'from-green-500 to-teal-500' },
];

const QUICK_CHIPS = [
  'Compare biryani and butter chicken',
  'What drink goes with spicy food?',
  'Best dessert after a heavy meal',
  'Healthy lunch under ₹250',
  'Suggest a 3-day meal plan',
  'What did I order before?',
];

const STORAGE_KEY = 'flavr_ai_v3_history';

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [language, setLanguage] = useState(user?.language || 'english');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [budget, setBudget] = useState(500);
  const [listening, setListening] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealDays, setMealDays] = useState(3);
  const [mealPlan, setMealPlan] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatEnd = useRef(null);
  const textRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streaming]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.abort();
    };
  }, []);

  // Welcome message based on language
  const getWelcomeMessage = useCallback(() => {
    const lang = LANGUAGES.find(l => l.code === language);
    return {
      text: lang?.greeting || "Hey! I'm FlavrAI 🍽️ Your personal chef and nutritionist. Ask me for recommendations, meal plans, or food advice!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWelcome: true,
    };
  }, [language]);

  // Ensure welcome message exists
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [language, getWelcomeMessage, messages.length]);

  // Voice recognition
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.info('Voice input not supported in this browser');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language]);

  // Build history array for API
  const buildHistory = () => {
    const history = [];
    const msgs = messages.filter(m => !m.isWelcome);
    for (let i = 0; i < msgs.length - 1; i++) {
      if (msgs[i].isUser && !msgs[i + 1]?.isUser) {
        history.push({ user: msgs[i].text, ai: msgs[i + 1].text });
      }
    }
    return history.slice(-6);
  };

  // ─── SSE STREAMING ─────────────────────────────
  const streamResponse = async (prompt, history) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const token = localStorage.getItem('flavrToken');

    const controller = new AbortController();
    streamRef.current = controller;

    try {
      const response = await fetch(`${BASE_URL}/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, history, language }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.done) break;
            if (data.text) {
              fullText += data.text;
              setStreaming(fullText);
            }
          } catch {}
        }
      }

      return fullText;
    } catch (err) {
      if (err.name === 'AbortError') return '';
      throw err;
    } finally {
      streamRef.current = null;
    }
  };

  // ─── SEND MESSAGE ─────────────────────────────
  const sendMessage = async (prompt) => {
    if (!prompt.trim() || loading) return;

    let finalPrompt = prompt;
    if (budget > 0 && !prompt.includes('₹') && !prompt.includes('under') && showBudget) {
      finalPrompt += ` under ₹${budget}`;
    }

    const userMsg = {
      text: finalPrompt,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreaming('');
    setShowMoods(false);

    try {
      // Try SSE streaming first
      let reply = '';
      try {
        reply = await streamResponse(finalPrompt, buildHistory());
      } catch {
        // Fallback to regular API
        const { data } = await aiAPI.recommend(finalPrompt, buildHistory(), language);
        reply = data.reply;
        setStreaming(reply);
      }

      if (reply) {
        setMessages(prev => [...prev, {
          text: reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setStreaming('');
      }
    } catch (err) {
      toast.error('Failed to get response');
      setStreaming('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ─── MEAL PLANNER ──────────────────────────────
  const generateMealPlan = async () => {
    setMealLoading(true);
    try {
      const { data } = await aiAPI.mealPlan(user?.preferences || [], mealDays);
      setMealPlan(data.plan);
    } catch {
      toast.error('Failed to generate meal plan');
    } finally {
      setMealLoading(false);
    }
  };

  const copyMealPlan = () => {
    if (mealPlan) {
      navigator.clipboard.writeText(mealPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Meal plan copied!');
    }
  };

  const clearChat = () => {
    setMessages([getWelcomeMessage()]);
    setStreaming('');
    toast.info('Chat cleared');
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              AI Chef Studio
            </span>
            <Sparkles size={28} className="text-orange-500" />
          </h1>
          <p className="text-gray-500 mt-1">Powered by Mistral Medium 3-5 • Personalized for you</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Picker */}
          <div className="relative">
            <button onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium border border-gray-200 dark:border-gray-700">
              <Globe size={16} className="text-orange-500" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            <AnimatePresence>
              {showLangPicker && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangPicker(false); toast.success(`Language: ${l.label}`); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        language === l.code ? 'text-orange-500 font-semibold bg-orange-50 dark:bg-orange-900/10' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      <span className="text-lg">{l.flag}</span>
                      <span>{l.label}</span>
                      {language === l.code && <CheckCircle2 size={16} className="ml-auto text-orange-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear chat */}
          <button onClick={clearChat} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ═══ SIDEBAR ═══ */}
        <div className="lg:col-span-1 space-y-4">
          {/* Mood Selector */}
          <div className="card-flavr p-4">
            <button onClick={() => setShowMoods(!showMoods)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-200">
              <span className="flex items-center gap-2"><Zap size={16} className="text-orange-500" /> Quick Mood</span>
              <ChevronDown size={16} className={`transition-transform ${showMoods ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showMoods && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {MOODS.map(m => (
                      <button key={m.label} onClick={() => { sendMessage(m.prompt); setShowMoods(false); }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-orange-500/10 hover:to-red-500/10 border border-gray-100 dark:border-gray-800 transition-all hover:scale-105">
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Budget Slider */}
          <div className="card-flavr p-4">
            <button onClick={() => setShowBudget(!showBudget)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-200">
              <span className="flex items-center gap-2"><DollarSign size={16} className="text-green-500" /> Budget Filter</span>
              <ChevronDown size={16} className={`transition-transform ${showBudget ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showBudget && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Max budget</span>
                      <span className="text-sm font-bold text-orange-500">₹{budget}</span>
                    </div>
                    <input type="range" min="50" max="2000" step="50" value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      className="w-full accent-orange-500" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>₹50</span>
                      <span>₹2000</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {budget > 0 ? `Showing dishes under ₹${budget}` : 'No budget limit'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Meal Planner */}
          <div className="card-flavr p-4">
            <button onClick={() => setShowMealPlanner(!showMealPlanner)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-200">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Meal Planner</span>
              <ChevronDown size={16} className={`transition-transform ${showMealPlanner ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showMealPlanner && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-gray-500">AI generates a personalized meal plan based on your preferences and dietary needs.</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">Days:</span>
                      <div className="flex gap-1">
                        {[1, 3, 5, 7].map(d => (
                          <button key={d} onClick={() => setMealDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              mealDays === d
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>{d}{d === 7 ? '' : ''}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={generateMealPlan} disabled={mealLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all">
                      {mealLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : '✨ Generate Meal Plan'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="card-flavr p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <MessageSquare size={16} className="text-orange-500" /> Session
            </div>
            <div className="text-xs text-gray-400 space-y-1.5">
              <p>Messages: {messages.filter(m => !m.isWelcome).length}</p>
              <p>Language: {currentLang.flag} {currentLang.label}</p>
              <p>Model: Mistral Medium 3-5</p>
              {user?.preferences?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.preferences.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">{p}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN CHAT ═══ */}
        <div className="lg:col-span-2">
          {/* Meal Plan Display */}
          <AnimatePresence>
            {mealPlan && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="card-flavr overflow-hidden mb-6 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span className="font-semibold text-sm">Your {mealDays}-Day Meal Plan</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyMealPlan} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => setMealPlan(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-5 max-h-[400px] overflow-y-auto">
                  <ChatMessage message={mealPlan} isUser={false} timestamp="Meal Plan" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Window */}
          <div className="card-flavr overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {/* Status bar */}
            <div className="px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-500">FlavrAI Online</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-400">{currentLang.flag} {currentLang.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] text-gray-400">
                  {budget > 0 && showBudget ? `Budget: ₹${budget}` : ''}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4 md:p-6 space-y-4 custom-scroll"
              ref={chatEnd}
              style={{ scrollBehavior: 'smooth' }}>
              {messages.map((msg, i) => (
                <ChatMessage key={`msg-${i}`} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
              ))}

              {/* Streaming typing effect */}
              <AnimatePresence>
                {streaming && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ChatMessage message={streaming} isUser={false} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing dots */}
              {loading && !streaming && (
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="flex gap-1.5 px-4 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)} disabled={loading}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 
                           text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 rounded-full border border-gray-200 dark:border-gray-700
                           transition-all disabled:opacity-40 whitespace-nowrap">
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#0A0F1E]">
              <div className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <textarea
                    ref={textRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'hindi' ? 'FlavrAI से पूछें...' : language === 'tamil' ? 'FlavrAI-யிடம் கேளுங்கள்...' : "Ask FlavrAI anything about food..."}
                    className="input-flavr resize-none !py-3.5 !pr-12 !rounded-2xl text-sm bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                    rows={1}
                    disabled={loading}
                  />
                  <button onClick={toggleVoice}
                    className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                      listening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                  className="btn-primary !p-3.5 !rounded-2xl flex-shrink-0 disabled:opacity-50 shadow-lg shadow-orange-500/20">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {showBudget && budget > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                      Budget: ₹{budget}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">
                  FlavrAI uses Mistral Medium via byNara
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline ChevronDown component
function ChevronDown({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
