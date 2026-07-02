import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';

export default function ChatMessage({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
        }`}
      >
        {/* Simple markdown rendering for AI messages */}
        {isUser ? (
          <p>{message}</p>
        ) : (
          <div className="space-y-2">
            {message.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- **')) {
                const [name, ...rest] = line.slice(3).split('** — ');
                return (
                  <p key={i} className=" ml-2">
                    <span className="font-semibold">{name}</span>
                    {rest.length > 0 && <span className="text-gray-500 dark:text-gray-400"> — {rest.join(' — ')}</span>}
                  </p>
                );
              }
              if (line.startsWith('- ')) {
                return <p key={i} className=" ml-2">• {line.slice(2)}</p>;
              }
              return line ? <p key={i}>{line}</p> : null;
            })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-gray-500" />
        </div>
      )}
    </motion.div>
  );
}
