import { Loader2 } from 'lucide-react';

export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3">
          <Loader2 size={40} className="text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={32} className="text-orange-500 animate-spin" />
    </div>
  );
}
