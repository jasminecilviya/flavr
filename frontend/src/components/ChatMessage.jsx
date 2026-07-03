import { motion } from 'framer-motion';
import { Sparkles, User, Bot, Clock } from 'lucide-react';

export default function ChatMessage({ message, isUser, timestamp }) {
  // LOGIC: Simple markdown renderer for AI responses
  const renderAI = (text) => {
    // Split by follow-up suggestions
    const parts = text.split(/(?=💬)/);
    
    return parts.map((part, i) => {
      if (part.startsWith('💬')) {
        // Follow-up suggestions — render as clickable chips
        const questions = part.replace('💬 **Try asking:** ', '').split('•').map(q => q.trim().replace(/"/g, ''));
        return (
          <div key={i} className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, j) => (
                <span key={j} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full text-gray-600 dark:text-gray-300 italic">
                  "{q}"
                </span>
              ))}
            </div>
          </div>
        );
      }

      // Split by bullet points
      const lines = part.split('\n').filter(l => l.trim());
      
      return (
        <div key={i} className="space-y-2">
          {lines.map((line, j) => {
            // Bold
            const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
            
            if (line.startsWith('- **')) {
              return (
                <p key={j} className="pl-3 border-l-2 border-orange-400/50" dangerouslySetInnerHTML={{ __html: rendered }} />
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={j} className="ml-4 text-gray-600 dark:text-gray-400 list-disc" dangerouslySetInnerHTML={{ __html: rendered.slice(2) }} />
              );
            }
            return <p key={j} dangerouslySetInnerHTML={{ __html: rendered }} />;
          })}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 mt-1">
          <Sparkles size={18} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-3.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl rounded-br-sm shadow-lg shadow-orange-500/20'
              : 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50'
          }`}
        >
          {isUser ? (
            <p>{message}</p>
          ) : (
            renderAI(message)
          )}
        </div>
        {timestamp && (
          <p className={`text-[10px] text-gray-400 mt-1.5 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
            {timestamp}
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
