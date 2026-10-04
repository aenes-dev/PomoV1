import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, Palette, X, Rocket } from 'lucide-react';
import { createPortal } from 'react-dom';

const mockUpdates = [
  {
    id: 1,
    icon: <Trophy size={20} className="text-amber-500" />,
    title: 'Liderlik Tablosu',
    description: 'Artık arkadaşlarınla rekabet edebilir, haftalık XP sıralamasında zirveye oynayabilirsin!'
  },
  {
    id: 2,
    icon: <Zap size={20} className="text-blue-500" />,
    title: 'Performans Artışı',
    description: 'Ses kilitlenme sorunları ve arayüzdeki donmalar tamamen giderildi, artık çok daha akıcı.'
  },
  {
    id: 3,
    icon: <Palette size={20} className="text-emerald-500" />,
    title: 'Arayüz İyileştirmeleri',
    description: 'Daha modern ve odaklanmanı kolaylaştıracak yeni renk paletleri ve ikonlar eklendi.'
  }
];

const WhatsNewModal = ({ isOpen, onClose, version = "1.2.0" }) => {
  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#27272a] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative pt-10 pb-6 px-8 text-center bg-gradient-to-b from-red-50 to-white dark:from-red-500/10 dark:to-[#18181b]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100/50 hover:bg-gray-100 dark:bg-[#27272a]/50 dark:hover:bg-[#27272a] rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center rounded-2xl mb-4 rotate-3 shadow-sm border border-red-200 dark:border-red-500/30">
              <Rocket size={32} />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                Pomo'da Yeni Neler Var?
              </h2>
              <span className="px-2.5 py-1 rounded-md bg-red-500 text-white text-xs font-bold shadow-sm">
                v{version}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Senin için harika özellikler hazırladık. Hemen göz at!
            </p>
          </div>

          {/* Content (Scrollable if needed) */}
          <div className="px-8 py-2 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-5">
            {mockUpdates.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                key={item.id} 
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#27272a]/50 border border-transparent dark:hover:border-[#27272a] transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#27272a] shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer & CTA */}
          <div className="p-6 pt-4 mt-2 border-t border-gray-100 dark:border-[#27272a]">
            <button
              onClick={onClose}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles size={18} />
              Harika, keşfetmeye başla!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};

export default WhatsNewModal;
