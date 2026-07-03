import { motion } from 'framer-motion';
import { Sparkles, User, Clock } from 'lucide-react';
import { useState } from 'react';

// ─── TABLE DETECTION ──────────────────────────────
function isTableLine(line) {
  return /^\s*\|.+\|\s*$/.test(line) && !/^\s*\|?\s*[-:]+\s*\|/.test(line);
}
function isSepLine(line) {
  return /^\s*\|?\s*[-:]+\s*\|/.test(line);
}

// ─── TABLE RENDERER ───────────────────────────────
function renderTable(lines) {
  // lines = array of markdown table rows starting with header
  const headerRow = lines[0];
  const bodyRows = lines.slice(1).filter(l => !/^\s*\|?\s*[-:]+\s*\|/.test(l));

  const headerCells = headerRow
    .split('|')
    .map(c => c.trim())
    .filter(Boolean);

  const tableBody = bodyRows.map(row =>
    row.split('|').map(c => c.trim()).filter(Boolean)
  );

  if (tableBody.length === 0) return null;

  const tagEmojis = { '🥗': true, '🔥': true, '💪': true, '🌿': true };

  return (
    <div key="table" className="my-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-orange-500 to-red-500">
            {headerCells.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                {h.replace(/\*\*/g, '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableBody.map((row, ri) => (
            <tr key={ri}
              className={`transition-colors ${
                ri % 2 === 0
                  ? 'bg-gray-50 dark:bg-gray-800/50'
                  : 'bg-white dark:bg-gray-800/20'
              } hover:bg-orange-50 dark:hover:bg-gray-700/40`}
            >
              {row.map((cell, ci) => {
                const withBold = cell.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
                const tags = Object.keys(tagEmojis).filter(e => cell.includes(e));
                let displayText = withBold;
                tags.forEach(e => { displayText = displayText.replace(e, ''); });

                return (
                  <td key={ci} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span dangerouslySetInnerHTML={{ __html: displayText }} />
                      {tags.map((emoji, ti) => (
                        <span key={ti}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700"
                          title={
                            emoji === '🥗' ? 'Healthy' :
                            emoji === '🔥' ? 'Spicy' :
                            emoji === '💪' ? 'High Protein' : 'Vegan'
                          }>
                          {emoji}
                        </span>
                      ))}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── RENDER REGULAR TEXT BLOCK ────────────────────
function renderTextBlock(text, keyPrefix) {
  const parts = [];
  let i = 0;

  // ─── Follow-up suggestions ───
  if (/^\s*💬/.test(text)) {
    const questions = text
      .replace(/💬\s*\*{0,2}Try asking\*{0,2}:?\s*/i, '')
      .split('•')
      .map(q => q.trim().replace(/^"/, '').replace(/"$/, ''))
      .filter(Boolean);
    return (
      <div key={keyPrefix} className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
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

  const lines = text.split('\n');

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // ─── Separator ───
    if (/^---/.test(trimmed)) {
      parts.push(<hr key={`${keyPrefix}-hr-${i}`} className="border-gray-200 dark:border-gray-700 my-2" />);
      i++;
      continue;
    }

    // ─── Heading ───
    const headingMatch = trimmed.match(/^(#{1,3})\s(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const size = level === 1 ? 'text-base font-bold' : level === 2 ? 'text-sm font-bold' : 'text-sm font-semibold';
      const rendered = headingMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
      parts.push(
        <p key={`${keyPrefix}-h-${i}`} className={`${size} text-gray-900 dark:text-gray-100 mt-3 first:mt-0`}
          dangerouslySetInnerHTML={{ __html: rendered }} />
      );
      i++;
      continue;
    }

    // ─── Star rating ───
    if (/^[⭐]{1,5}/.test(trimmed)) {
      const rendered = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
      parts.push(<p key={`${keyPrefix}-star-${i}`} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />);
      i++;
      continue;
    }

    // ─── Emoji lines ───
    if (/^[🥗🔥💪🌿✅📝]/.test(trimmed)) {
      const rendered = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
      parts.push(<p key={`${keyPrefix}-emoji-${i}`} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />);
      i++;
      continue;
    }

    // ─── Bullet with bold (border-left style) ───
    if (trimmed.startsWith('- **')) {
      const rendered = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
      parts.push(
        <p key={`${keyPrefix}-bb-${i}`} className="pl-3 border-l-2 border-orange-400/50 text-sm"
          dangerouslySetInnerHTML={{ __html: rendered }} />
      );
      i++;
      continue;
    }

    // ─── Bullet ───
    if (trimmed.startsWith('- ')) {
      const rendered = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
      parts.push(
        <li key={`${keyPrefix}-li-${i}`} className="ml-4 text-gray-600 dark:text-gray-400 text-sm list-disc"
          dangerouslySetInnerHTML={{ __html: rendered }} />
      );
      i++;
      continue;
    }

    // ─── Normal paragraph ───
    const rendered = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-500">$1</strong>');
    parts.push(<p key={`${keyPrefix}-p-${i}`} className="text-sm" dangerouslySetInnerHTML={{ __html: rendered }} />);
    i++;
  }

  return parts.length > 0 ? <div key={keyPrefix} className="space-y-2">{parts}</div> : null;
}

// ─── SEGMENT TEXT INTO TABLE / NON-TABLE BLOCKS ───
function segmentText(text) {
  const lines = text.split('\n');
  const segments = [];
  let currentTableLines = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isTableLine(line)) {
      if (!inTable) {
        // Flush any pending text
        if (currentTableLines.length > 0) {
          segments.push({ type: 'text', content: currentTableLines.join('\n') });
          currentTableLines = [];
        }
        inTable = true;
      }
      currentTableLines.push(line);
    } else if (isSepLine(line)) {
      // Skip separator row, but check if next line is also a pipe (means it's a table)
      if (inTable && i + 1 < lines.length && isTableLine(lines[i + 1])) {
        continue; // skip the separator, next row is data
      } else if (inTable) {
        // End of table
        if (currentTableLines.length > 0) {
          segments.push({ type: 'table', rows: [...currentTableLines] });
          currentTableLines = [];
        }
        inTable = false;
      } else {
        currentTableLines.push(line);
      }
    } else {
      if (inTable) {
        // End of table
        if (currentTableLines.length > 0) {
          segments.push({ type: 'table', rows: [...currentTableLines] });
          currentTableLines = [];
        }
        inTable = false;
      }
      currentTableLines.push(line);
    }
  }

  // Flush remaining
  if (inTable && currentTableLines.length > 0) {
    segments.push({ type: 'table', rows: currentTableLines });
  } else if (currentTableLines.length > 0) {
    segments.push({ type: 'text', content: currentTableLines.join('\n') });
  }

  return segments;
}

// ─── MAIN RENDERER ────────────────────────────────
function renderAI(text) {
  if (!text) return null;

  // Check for code blocks first
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  if (codeBlockRegex.test(text)) {
    codeBlockRegex.lastIndex = 0;
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
          <pre key={`code-${i}`} className="my-3 p-3 bg-gray-900 dark:bg-black rounded-xl overflow-x-auto text-xs text-green-400 font-mono leading-relaxed">
            <code>{part.content}</code>
          </pre>
        );
      }
      // Check for tables within text segment
      const segs = segmentText(part.content);
      return segs.map((seg, j) => {
        if (seg.type === 'table') return renderTable(seg.rows);
        return renderTextBlock(seg.content, `t-${i}-${j}`);
      });
    });
  }

  // No code blocks — segment directly
  const segments = segmentText(text);
  return segments.map((seg, i) => {
    if (seg.type === 'table') return renderTable(seg.rows);
    return renderTextBlock(seg.content, `s-${i}`);
  });
}

// ─── COMPONENT ────────────────────────────────────
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
      
      <div className={`max-w-[92%] ${isUser ? 'order-1' : ''}`}>
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
