import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Loader2, Bot, Mic, MicOff, Sliders, 
  TrendingUp, DollarSign, Heart, Zap, ChefHat, Plus, X
} from 'lucide-react';
import { aiAPI } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';

const MOODS = [
  { emoji: '🙂', label: 'Healthy', prompt: 'Suggest healthy, low-calorie options', color: 'from-green-500 to-emerald-500' },
  { emoji: '🔥', label: 'Spicy', prompt: 'Something spicy and flavorful', color: 'from-red-500 to-orange-500' },
  { emoji: '💰', label: 'Budget', prompt: 'Best value dishes under ₹200', color: 'from-yellow-500 to-orange-500' },
  { emoji: '🤤', label: 'Cheat Day', prompt: 'Indulgent, decadent comfort food', color: 'from-purple-500 to-pink-500' },
  { emoji: '💪', label: 'High Protein', prompt: 'High protein meals for muscle building', color: 'from-blue-500 to-cyan-500' },
  { emoji: '🌿', label: 'Vegan', prompt: 'Vegan plant-based options', color: 'from-green-500 to-teal-500' },
];

const QUICK_CHIPS = [
  'Compare biryani and butter chicken',
  'What drink goes with spicy food?',
  'Best dessert after a heavy meal',
  'Healthy lunch under ₹250',
  'What did I order before?',
];

// LOGIC: Persist conversation to localStorage for session continuity
const STORAGE_KEY = 'flavr_ai_history';

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    // Restore persisted conversation
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      text: "Hey! I'm **FlavrAI** 🍽️ Your personal chef and nutritionist. Tell me what you're craving — I'll find the perfect dish, suggest pairings, or answer any food question!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [showBudget, setShowBudget] = useState(false);
  const [budget, setBudget] = useState(500);
  const [listening, setListening] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const chatEnd = useRef(null);
  const textRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20))); // keep last 20
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  // Voice recognition
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return; // Not supported
    }
    
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  // Build history array for API
  const buildHistory = () => {
    const history = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].isUser && !messages[i+1]?.isUser) {
        history.push({ user: messages[i].text, ai: messages[i+1].text });
      }
    }
    return history.slice(-4); // last 4 exchanges
  };

  const sendMessage = async (prompt) => {
    if (!prompt.trim() || loading) return;
    
    const userMsg = {
      text: prompt,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreaming('');

    try {
      const { data } = await aiAPI.recommend(prompt, buildHistory());
      
      // LOGIC: Typewriter streaming effect — reveal AI response char by char
      const reply = data.reply;
      setStreaming('');
      
      let idx = 0;
      const interval = setInterval(() => {
        idx += 2; // 2 chars at a time for speed
        if (idx >= reply.length) {
          clearInterval(interval);
          setMessages(prev => [...prev, {
            text: reply,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
          setStreaming('');
          setLoading(false);
        } else {
          setStreaming(reply.slice(0, idx));
        }
      }, 15); // 15ms per chunk
      
    } catch {
      setMessages(prev => [...prev, {
        text: "Oops! Hit a snag in the kitchen. Try rephrasing your question or check back.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      let prompt = input;
      if (budget > 0 && !prompt.includes('₹')) prompt += ` under ₹${budget}`;
      sendMessage(prompt);
    }
  };

  const handleMoodClick = (mood) => {
    let prompt = mood.prompt;
    if (budget > 0 && !prompt.includes('₹')) prompt += ` under ₹${budget}`;
    sendMessage(prompt);
    setShowMoods(false);
  };

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{
      text: "Chat cleared! 👋 I'm still here whenever you're hungry for ideas.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={22} className="text-white" />
            </span>
            AI Chef Studio
          </h1>
          <p className="text-gray-500 mt-1">Personal chef, nutritionist & food sommelier — powered by Mistral</p>
        </div>
        <button onClick={clearChat} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10">
          Clear chat
        </button>
      </motion.div>

      {/* Mood Selector — collapsed by default */}
      <div className="mb-4">
        <button onClick={() => setShowMoods(!showMoods)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-2 transition-colors">
          <ChefHat size={16} /> {showMoods ? 'Hide moods' : 'What are you craving?'} <span className="text-xs text-gray-400">(tap a mood)</span>
        </button>
        <AnimatePresence>
          {showMoods && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden">
              {MOODS.map(m => (
                <button key={m.label} onClick={() => handleMoodClick(m)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    bg-gradient-to-r ${m.color} text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}>
                  <span className="text-lg">{m.emoji}</span> {m.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Budget Slider */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setShowBudget(!showBudget)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            budget > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}>
          <DollarSign size={14} /> {budget > 0 ? `₹${budget}` : 'No budget'}
        </button>
        
        <AnimatePresence>
          {showBudget && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-3 overflow-hidden">
              <input type="range" min="0" max="1000" step="50" value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-32 accent-orange-500" />
              <span className="text-sm font-medium text-orange-500 min-w-[3rem]">₹{budget}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <div className="card-flavr overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        {/* Status bar */}
        <div className="px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-500">FlavrAI Online</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-400">Mistral Medium</span>
          </div>
          <span className="text-xs text-gray-400">{messages.length - 1} messages</span>
        </div>

        {/* Messages */}
        <div className="h-[460px] overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth custom-scroll"
          style={{ scrollBehavior: 'smooth' }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
          ))}

          {/* Streaming typing effect */}
          {streaming && (
            <ChatMessage message={streaming + '▊'} isUser={false} />
          )}

          {/* Typing dots (before streaming starts) */}
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

          <div ref={chatEnd} />
        </div>

        {/* Quick Chips (inside chat) */}
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
                placeholder="Ask FlavrAI anything about food..."
                className="input-flavr resize-none !py-3.5 !pr-12 !rounded-2xl text-sm bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                rows={1}
                disabled={loading}
              />
              {/* Voice button */}
              <button onClick={toggleVoice}
                className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                  listening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <button onClick={() => {
              let prompt = input;
              if (budget > 0 && !prompt.includes('₹')) prompt += ` under ₹${budget}`;
              sendMessage(prompt);
            }} disabled={!input.trim() || loading}
              className="btn-primary !p-3.5 !rounded-2xl flex-shrink-0 disabled:opacity-50 shadow-lg shadow-orange-500/20">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            FlavrAI uses Mistral via byNara • Responses are personalized based on your preferences & order history
          </p>
        </div>
      </div>
    </div>
  );
}
