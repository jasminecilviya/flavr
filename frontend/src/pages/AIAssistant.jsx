import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { aiAPI } from '../services/api';
import ChatMessage from '../components/ChatMessage';

const QUICK_CHIPS = [
  'Suggest a vegan dinner under ₹500',
  'High protein breakfast ideas',
  'Something spicy for lunch',
  'Healthy options under ₹300',
  'Best dishes for a cheat meal',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { text: "Hey! I'm FlavrAI 🍽️ Tell me what you're craving and I'll find the perfect dish for you. Mention your budget, dietary preferences, or mood!", isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;
    setMessages((prev) => [...prev, { text: prompt, isUser: true }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.recommend(prompt);
      setMessages((prev) => [...prev, { text: data.reply, isUser: false }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Oops! I couldn't process that right now. Try asking in a different way or check back later.", isUser: false },
      ]);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="text-orange-500" size={32} /> AI Chef
        </h1>
        <p className="mt-1 text-gray-500">Get personalized meal recommendations powered by AI</p>
      </motion.div>

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK_CHIPS.map((chip) => (
          <button key={chip} onClick={() => sendMessage(chip)} disabled={loading}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 
                       text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 rounded-full 
                       transition-all border border-gray-200 dark:border-gray-700 disabled:opacity-50">
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="card-flavr overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg.text} isUser={msg.isUser} />
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex gap-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Typing dots when loading AI response */}
          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex gap-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEnd} />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-[#0A0F1E]">
          <div className="flex gap-3">
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what you're craving..."
              className="input-flavr resize-none !py-3 !rounded-xl flex-1"
              rows={1}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="btn-primary !p-3 !rounded-xl flex-shrink-0 disabled:opacity-50">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
