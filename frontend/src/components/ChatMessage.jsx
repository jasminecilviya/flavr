import { motion } from 'framer-motion';
import { Sparkles, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

// LOGIC: Simple markdown renderer for AI responses with code blocks
function renderAI(text) {
  if (!text) return null;

  // Split by code blocks first
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.map((part, i) => {
    if (part.type === 'code') {
      return (
        <pre key={i} className="my-3 p-3 bg-gray-900 dark:bg-black rounded-xl overflow-x-auto text-xs text-green-400 font-mono leading-relaxed">
          <code>{part.content}</code>
        </pre>
      );
    }

    // Split by 💬 follow-up suggestions section
    const subParts = part.content.split(/(?=💬)/);
    return subParts.map((sp, j) => {
      if (sp.startsWith('💬')) {
        const questions = sp
          .replace('💬 **Try asking:** ', '')
          .replace('💬**Try asking:**', '')
          .split('•')
          .map(q => q.trim().replace(/^"/, '').replace(/"$/, ''))
          .filter(Boolean);
        return (
          <div key={`${i}-${j}`} className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">💡 Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, k) => (
                <span key={k}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full text-gray-600 dark:text-gray-300 italic border border-gray-200 dark:border-gray-700">
                  "{q}"
                </span>
              ))}
            </div>
          </div>
        );
      }

      // Parse lines
      const lines = sp.split('\n').filter(l => l.trim());
      if (lines.length === 0) return null;

      return (
        <div key={`${i}-${j}`} className="space-y-2">
          {lines.map((line, k) => {
            // Bold
            let rendered = line
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>')
              .replace(/__(.*?)__/g, '<em>$1</em>');

            // Star rating display
            if (/^[⭐]{1,5}/.test(line.trim())) {
              return (
                <p key={k} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />
              );
            }

            // Meal tags
            if (/^[🥗🔥💪🌿]/.test(line.trim())) {
              return (
                <p key={k} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />
              );
            }

            // Bullet with bold
            if (line.startsWith('- **')) {
              return (
                <p key={k} className="pl-3 border-l-2 border-orange-400/50 text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />
              );
            }

            // Bullet
            if (line.startsWith('- ')) {
              return (
                <li key={k} className="ml-4 text-gray-600 dark:text-gray-400 text-sm list-disc" dangerouslySetInnerHTML={{ __html: rendered.slice(2) }} />
              );
            }

            // Heading
            if (/^#{1,3}\s/.test(line)) {
              const level = line.match(/^(#+)\s/)[1].length;
              const size = level === 1 ? 'text-base font-bold' : level === 2 ? 'text-sm font-bold' : 'text-sm font-semibold';
              return (
                <p key={k} className={`${size} text-gray-900 dark:text-gray-100 mt-1`} dangerouslySetInnerHTML={{ __html: rendered.replace(/^#+\s/, '') }} />
              );
            }

            return <p key={k} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />;
          })}
        </div>
      );
    });
  });
}

export default function ChatMessage({ message, isUser, timestamp }) {
  const [showTime, setShowTime] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      onClick={() => setShowTime(!showTime)}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 mt-1">
          <Sparkles size={18} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[88%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-3.5 leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl rounded-br-sm shadow-lg shadow-orange-500/20'
              : 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50'
          }`}
        >
          {isUser ? (
            <p className="text-sm">{message}</p>
          ) : (
            renderAI(message)
          )}
        </div>
        {(showTime || timestamp) && (
          <p className={`text-[10px] text-gray-400 mt-1 flex items-center gap-1 ${isUser ? 'justify-end mr-1' : 'ml-1'}`}>
            <Clock size={10} />
            {timestamp || 'just now'}
          </p>
        )}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={18} className="text-gray-500" />
        </div>
      )}
    </motion.div>
  );
}
