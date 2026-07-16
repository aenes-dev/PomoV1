import React from 'react'
import { Timer } from 'lucide-react' // Timer ikonunu import ettik
import { motion } from 'framer-motion' // motion'ı import ettik

function Spinner({text='Oturum Kontrol Ediliyor...'}) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden">
      <div className="absolute w-72 h-72 bg-orange-500/10 rounded-full blur-[80px] animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center"
      >
        <div className="relative flex items-center justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-orange-500 border-r-orange-400"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-14 h-14 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 z-10"
          >
            <Timer size={26} className="text-orange-500" />
          </motion.div>
        </div>

        {/* Nefes alan metin */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide mb-1">
            PomoV1
          </h2>
          <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
          {text}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Spinner
