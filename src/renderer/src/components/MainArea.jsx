import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Zap, Coffee, Maximize, Minimize, Target, ChevronUp, ChevronDown } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const MainArea = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [taskName, setTaskName] = useState('');
  
  const { 
    timeLeft, 
    isRunning, 
    activityName,
    startTimer, 
    stopTimer, 
    pauseTimer,
    resumeTimer,
    tick,
    isFullScreen,
    setFullScreen
  } = useAppStore();

  useEffect(() => {
    if (activityName && activityName !== 'Boşta' && !activityName.startsWith('Duraklatıldı:')) {
      setTaskName(activityName);
    }
  }, [activityName]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const handleStart = () => {
    const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60;
    if (totalSeconds > 0) {
      startTimer(totalSeconds, taskName || "Odaklanıyor");
    }
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      if (timeLeft > 0) {
        resumeTimer();
      } else {
        handleStart();
      }
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPreset = (h, m) => {
    setHours(h);
    setMinutes(m);
  };

  const adjustHours = (val) => {
    setHours(prev => Math.max(0, Math.min(23, (parseInt(prev) || 0) + val)));
  };

  const adjustMinutes = (val) => {
    setMinutes(prev => {
      let newVal = (parseInt(prev) || 0) + val;
      if (newVal > 59) return 0;
      if (newVal < 0) return 59;
      return newVal;
    });
  };

  const handleHoursChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setHours(Math.max(0, Math.min(23, val)));
    } else {
      setHours(0);
    }
  };

  const handleMinutesChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setMinutes(Math.max(0, Math.min(59, val)));
    } else {
      setMinutes(0);
    }
  };

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(err => console.log(err));
      setFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setFullScreen(false);
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
      
      {/* Sağ Üst Tam Ekran Butonu */}
      <button 
        onClick={toggleFullScreen}
        className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/80 dark:bg-[#18181b]/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border border-gray-200/50 dark:border-[#27272a] backdrop-blur-md transition-all shadow-sm"
        title={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
      >
        {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Dinamik Atmosfer Işıkları */}
      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[120px] transition-all duration-[2000s] pointer-events-none ${
        isRunning ? 'bg-red-500/10 animate-pulse' : timeLeft > 0 ? 'bg-amber-500/10' : 'bg-red-500/5'
      }`}></div>
      <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[120px] transition-all duration-[2000s] pointer-events-none ${
        isRunning ? 'bg-orange-500/10 animate-pulse' : timeLeft > 0 ? 'bg-yellow-500/10' : 'bg-orange-500/5'
      }`}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 flex flex-col items-center justify-center w-full max-w-sm px-4 -mt-12 md:-mt-10"
      >
        
        <div className={`w-full bg-white dark:bg-[#18181b]/60 border border-gray-200 dark:border-[#27272a] rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md transition-all duration-300 ${
          isRunning || timeLeft > 0 
            ? 'mb-11 border-red-500/30 dark:border-red-500/20 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
            : 'mb-8 focus-within:border-red-500 dark:focus-within:border-red-500 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
        }`}>
          <div className={`p-2 rounded-xl transition-colors ${isRunning || timeLeft > 0 ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-[#27272a] text-gray-400'}`}>
            <Target size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Şu an neye odaklanıyorsun?" 
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            disabled={isRunning || timeLeft > 0} 
            className="flex-1 bg-transparent border-none outline-none text-base font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>

        {/* HIZLI SEÇİM BUTONLARI (Presets) */}
        <AnimatePresence mode="wait">
          {!isRunning && timeLeft === 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 w-full justify-center mb-8 overflow-hidden"
            >
              <button onClick={() => setPreset(0, 25)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-red-500/30 hover:bg-red-500/[0.02] hover:text-red-500 transition-all shadow-sm"><Timer size={14} /> 25 Dk</button>
              <button onClick={() => setPreset(0, 50)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Zap size={14} /> 50 Dk</button>
              <button onClick={() => setPreset(1, 0)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-blue-500/30 hover:bg-blue-500/[0.02] hover:text-blue-500 transition-all shadow-sm"><Coffee size={14} /> 1 Saat</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SAYAÇ HALKASI & İÇ AYAR ÇARKLARI */}
        <motion.div 
          layout
          className={`relative w-80 h-80 shrink-0 rounded-full border-[10px] bg-white/5 dark:bg-[#18181b]/20 flex flex-col items-center justify-center shadow-2xl mb-10 transition-all duration-500 backdrop-blur-sm ${
            isRunning ? 'border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : timeLeft > 0 ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-gray-200 dark:border-[#27272a] shadow-none'
          }`}
        >
          {isRunning && <div className="absolute inset-2 rounded-full border-[2px] border-red-500/20 animate-ping pointer-events-none" />}
          
          {!isRunning && timeLeft === 0 ? (
            <div className="flex items-center justify-center gap-1">
              <div className="flex flex-col items-center group">
                <button onClick={() => adjustHours(1)} className="p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"><ChevronUp size={28} /></button>
                <input 
                  type="number" 
                  value={hours.toString().padStart(2, '0')} 
                  onChange={handleHoursChange}
                  className="w-20 bg-transparent text-center text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => adjustHours(-1)} className="p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"><ChevronDown size={28} /></button>
              </div>
              <span className="text-5xl font-light text-gray-300 dark:text-gray-600 pb-2">:</span>
              <div className="flex flex-col items-center group">
                <button onClick={() => adjustMinutes(1)} className="p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"><ChevronUp size={28} /></button>
                <input 
                  type="number" 
                  value={minutes.toString().padStart(2, '0')} 
                  onChange={handleMinutesChange}
                  className="w-20 bg-transparent text-center text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => adjustMinutes(-1)} className="p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"><ChevronDown size={28} /></button>
              </div>
            </div>
          ) : (
            <h1 className="text-6xl font-extrabold text-gray-800 dark:text-gray-100 font-mono tracking-widest tabular-nums z-10">
              {formatTime(timeLeft)}
            </h1>
          )}

          <span className="absolute bottom-10 text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {isRunning ? 'Odaklanma Açık' : timeLeft > 0 ? 'Duraklatıldı' : 'Süreyi Ayarla'}
          </span>
        </motion.div>

        {/* KONTROL BUTONLARI */}
        <motion.div layout className="flex items-center justify-center gap-6 w-full">
          <button 
            onClick={stopTimer}
            disabled={!isRunning && timeLeft === 0}
            className={`p-4 rounded-full transition-all border border-transparent ${(isRunning || timeLeft > 0) ? 'bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border-gray-200/50 dark:border-[#27272a] shadow-sm cursor-pointer' : 'bg-gray-100/50 dark:bg-[#111] text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-40'}`}
            title="Sıfırla"
          >
            <RotateCcw size={24} />
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer ${
              isRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
            }`}
            title={isRunning ? "Duraklat" : "Başlat / Devam Et"}
          >
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />}
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default MainArea;