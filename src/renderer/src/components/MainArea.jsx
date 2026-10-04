// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Play, Pause, RotateCcw, Timer, Zap, Coffee, Maximize, Minimize, Target, ChevronUp, ChevronDown, Leaf, SkipForward, VolumeX, BellRing } from 'lucide-react';
// import useAppStore from '../store/useAppStore';
// import useSettingsStore from '../store/useAyarlarStore';
// import DersBitis from '../audio/ders-bitis.mp3';
// import MolaBitis from '../audio/mola-bitis.mp3';
// import toast from 'react-hot-toast';

// const MainArea = () => {
//   const [hours, setHours] = useState(0);
//   const [minutes, setMinutes] = useState(25);
//   const [taskName, setTaskName] = useState('');
  
//   const [mode, setMode] = useState('focus'); // 'focus' | 'break'
//   const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
//   const { 
//     timeLeft, 
//     isRunning, 
//     activityName,
//     startTimer, 
//     stopTimer, 
//     pauseTimer,
//     resumeTimer,
//     tick,
//     isFullScreen,
//     setFullScreen
//   } = useAppStore();

//   const { focusTime, breakTime, autoBreak, breakSound, getSettings } = useSettingsStore();

//   const prevIsRunning = useRef(isRunning);
//   const prevTimeLeft = useRef(timeLeft);
//   const skipNextCompletion = useRef(false);

//   // === MOBİL SES KİLİDİ İÇİN HTML AUDIO REFERANSLARI ===
//   const focusAudioRef = useRef(null);
//   const breakAudioRef = useRef(null);
//   const activeAudioRef = useRef(null);
//   const audioUnlocked = useRef(false); // Kilidin açılıp açılmadığını takip eder

//   useEffect(() => {
//     getSettings();
//   }, [getSettings]);

//   useEffect(() => {
//     if (activityName) {
//       if (activityName.includes('Mola')) {
//         setMode('break');
//       } else if (activityName !== 'Boşta' && !activityName.startsWith('Duraklatıldı:')) {
//         setMode('focus');
//         setTaskName(activityName);
//       }
//     }
//   }, [activityName]);

//   useEffect(() => {
//     if (focusTime && !isRunning && timeLeft === 0 && mode === 'focus') {
//       setHours(Math.floor(focusTime / 60));
//       setMinutes(focusTime % 60);
//     }
//   }, [focusTime, isRunning, timeLeft, mode]);

//   useEffect(() => {
//     let interval;
//     if (isRunning) {
//       interval = setInterval(() => {
//         tick();
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isRunning, tick]);

//   // ================= GARANTİLİ SES KONTROL FONKSİYONLARI =================
//   const unlockAudioForMobile = () => {
//     if (!audioUnlocked.current) {
//       // Kullanıcı Play'e bastığı an her iki sesi de DOM üzerinden tetikleyip kilidi açıyoruz
//       if (focusAudioRef.current) {
//         focusAudioRef.current.play().then(() => focusAudioRef.current.pause()).catch(() => {});
//       }
//       if (breakAudioRef.current) {
//         breakAudioRef.current.play().then(() => breakAudioRef.current.pause()).catch(() => {});
//       }
//       audioUnlocked.current = true;
//     }
//   };

//   const stopAlarm = () => {
//     if (activeAudioRef.current) {
//       activeAudioRef.current.pause();
//       activeAudioRef.current.currentTime = 0;
//     }
//     setIsAlarmPlaying(false);
//   };

//   const playNotificationSound = () => {
//     if (breakSound) {
//       stopAlarm(); 
      
//       // Çalınacak sesi DOM referansından seçiyoruz
//       const audioEl = mode === 'focus' ? focusAudioRef.current : breakAudioRef.current;
      
//       if (audioEl) {
//         audioEl.volume = mode === 'focus' ? 1.0 : 0.9;
//         audioEl.currentTime = 0;
//         activeAudioRef.current = audioEl; // Kapatmak için hafızaya al
        
//         audioEl.onended = () => {
//           setIsAlarmPlaying(false);
//         };
        
//         audioEl.play()
//           .then(() => setIsAlarmPlaying(true))
//           .catch((err) => console.log("Otomatik sesçalma engellendi:", err));
//       }
//     }
//   };
//   // ===============================================================

//   useEffect(() => {
//     if (prevIsRunning.current && !isRunning && timeLeft === 0 && prevTimeLeft.current > 0) {
//       if (skipNextCompletion.current) {
//         skipNextCompletion.current = false;
//       } else {
//         handleTimerComplete();
//       }
//     }
//     prevIsRunning.current = isRunning;
//     prevTimeLeft.current = timeLeft;
//   }, [isRunning, timeLeft]);

//   const handleTimerComplete = () => {
//     playNotificationSound();

//     if (mode === 'focus') {
//       setMode('break');
//       const bTime = breakTime || 5;
//       const bSecs = bTime * 60;
      
//       setHours(Math.floor(bTime / 60));
//       setMinutes(bTime % 60);
//       setTaskName('Mola Zamanı ☕');

//       if (autoBreak) {
//         startTimer(bSecs, 'Mola Zamanı ☕');
//       }
//     } else {
//       setMode('focus');
//       const fTime = focusTime || 25;
      
//       setHours(Math.floor(fTime / 60));
//       setMinutes(fTime % 60);
//       setTaskName(''); 
//     }
//   };

//   const handleStart = () => {
//     stopAlarm(); 
//     const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60;
//     if (totalSeconds > 0) {
//       const defaultName = mode === 'break' ? 'Mola Zamanı ☕' : 'Odaklanıyor';
//       startTimer(totalSeconds, taskName || defaultName);
//     }
//   };

//   const handlePlayPause = () => {
//     unlockAudioForMobile(); // PLAY'E BASILDIĞI AN MOBİL SES KİLİDİ AÇILIR

//     if (isRunning) {
//       pauseTimer();
//     } else {
//       if (timeLeft > 0) {
//         resumeTimer();
//       } else {
//         handleStart();
//       }
//     }
//   };

//   const handleReset = () => {
//     stopAlarm(); 
//     skipNextCompletion.current = true;
//     stopTimer();
//     setMode('focus');
//     if (focusTime) {
//       setHours(Math.floor(focusTime / 60));
//       setMinutes(focusTime % 60);
//       setTaskName('');
//     }
//   };

//   const handleSkip = () => {
//     stopAlarm();
//     skipNextCompletion.current = true;
//     stopTimer(); 

//     if (mode === 'focus') {
//       setMode('break');
//       const bTime = breakTime || 5;
//       setHours(Math.floor(bTime / 60));
//       setMinutes(bTime % 60);
//       setTaskName('Mola Zamanı ☕');
//     } else {
//       setMode('focus');
//       const fTime = focusTime || 25;
//       setHours(Math.floor(fTime / 60));
//       setMinutes(fTime % 60);
//       setTaskName('');
//     }
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return h > 0 
//       ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
//       : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

//   const setPreset = (h, m) => {
//     setHours(h);
//     setMinutes(m);
//   };

//   const adjustHours = (val) => setHours(prev => Math.max(0, Math.min(23, (parseInt(prev) || 0) + val)));
  
//   const adjustMinutes = (val) => {
//     setMinutes(prev => {
//       let newVal = (parseInt(prev) || 0) + val;
//       if (newVal > 59) return 0;
//       if (newVal < 0) return 59;
//       return newVal;
//     });
//   };

//   const handleHoursChange = (e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)));
//   const handleMinutesChange = (e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)));

//   const toggleFullScreen = async () => {
//     if (!document.fullscreenElement) {
//       await document.documentElement.requestFullscreen().catch(err => console.log(err));
//       setFullScreen(true);
//     } else if (document.exitFullscreen) {
//       await document.exitFullscreen();
//       setFullScreen(false);
//     }
//   };

//   const isBreak = mode === 'break';
  
//   const ringColor = isBreak 
//     ? (isRunning ? 'border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : timeLeft > 0 ? 'border-emerald-500/40' : 'border-gray-200 dark:border-[#27272a]')
//     : (isRunning ? 'border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : timeLeft > 0 ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-gray-200 dark:border-[#27272a]');

//   const light1 = isBreak ? (isRunning ? 'bg-emerald-500/10' : 'bg-emerald-500/5') : (isRunning ? 'bg-red-500/10' : 'bg-red-500/5');
//   const light2 = isBreak ? (isRunning ? 'bg-teal-500/10' : 'bg-teal-500/5') : (isRunning ? 'bg-orange-500/10' : 'bg-orange-500/5');

//   const inputBorder = isBreak
//     ? 'focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
//     : 'focus-within:border-red-500 dark:focus-within:border-red-500 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.1)]';

//   const inputActive = isBreak 
//     ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(16,185,129,0.05)]'
//     : 'border-red-500/30 dark:border-red-500/20 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.05)]';

//   const playBtnColor = isBreak
//     ? (isRunning ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20')
//     : (isRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20');

//   return (
//     <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden transition-colors duration-1000">
      
//       {/* HTML AUDIO ETİKETLERİ (Görünmez) - Mobilde ses çalması için DOM'da olmaları şart */}
//       <audio ref={focusAudioRef} src={DersBitis} preload="auto" />
//       <audio ref={breakAudioRef} src={MolaBitis} preload="auto" />

//       <AnimatePresence>
//         {isAlarmPlaying && (
//           <motion.div
//             initial={{ y: -50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -50, opacity: 0 }}
//             className="absolute top-12 z-50 flex items-center justify-center w-full pointer-events-none"
//           >
//             <button 
//               onClick={() => {
//                 stopAlarm();
//                 toast.success('Alarm başarıyla susturuldu.');
//               }}
//               className={`pointer-events-auto flex items-center gap-2.5 px-6 py-3 rounded-full backdrop-blur-md border shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold ${
//                 isBreak 
//                   ? 'bg-white/90 dark:bg-[#18181b]/90 border-emerald-500/50 shadow-emerald-500/20 text-emerald-500' 
//                   : 'bg-white/90 dark:bg-[#18181b]/90 border-red-500/50 shadow-red-500/20 text-red-500'
//               }`}
//             >
//               <div className="relative">
//                 <BellRing size={20} className="animate-pulse" />
//                 <VolumeX size={12} className="absolute -bottom-1 -right-1 bg-white dark:bg-[#18181b] rounded-full" />
//               </div>
//               Alarmı Sustur
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <button 
//         onClick={toggleFullScreen}
//         className="absolute top-6 right-6 z-40 p-3 rounded-2xl bg-white/80 dark:bg-[#18181b]/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border border-gray-200/50 dark:border-[#27272a] backdrop-blur-md transition-all shadow-sm"
//         title={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
//       >
//         {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
//       </button>

//       {/* Dinamik Atmosfer Işıkları */}
//       <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[120px] transition-colors duration-1000 pointer-events-none ${light1}`}></div>
//       <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[120px] transition-colors duration-1000 pointer-events-none ${light2}`}></div>

//       {/* Mola Modunda (isBreak) tavan boşluğu mt-0, 
//         Odaklanma modunda ise tablet (md) için mt-16 vererek aşağı ittik. 
//       */}
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.95 }} 
//         animate={{ opacity: 1, scale: 1 }} 
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className={`z-10 flex flex-col items-center justify-center w-full max-w-sm px-4 py-8 lg:-mt-10 ${isBreak ? 'mt-0' : 'mt-8 md:mt-16 lg:mt-0'}`}
//       >
        
//         {/* INPUT ALANI */}
//         {/* Odaklanma modunda mb-4 vererek altındaki elementle boşluğu daralttık */}
//         <div className={`w-full bg-white dark:bg-[#18181b]/60 border border-gray-200 dark:border-[#27272a] rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md transition-all duration-500 ${
//           isRunning || timeLeft > 0 
//             ? `mb-11 ${inputActive}` 
//             : `${isBreak ? 'mb-5' : 'mb-4  lg:mb-4'} ${inputBorder}`
//         }`}>
//           <div className={`p-2 rounded-xl transition-colors duration-500 ${
//             isRunning || timeLeft > 0 
//               ? (isBreak ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500') 
//               : 'bg-gray-100 dark:bg-[#27272a] text-gray-400'
//           }`}>
//             {isBreak ? <Leaf size={20} /> : <Target size={20} />}
//           </div>
//           <input 
//             type="text" 
//             placeholder={isBreak ? "Mola zamanı..." : "Şu an neye odaklanıyorsun?"} 
//             value={taskName}
//             onChange={(e) => setTaskName(e.target.value)}
//             disabled={isRunning || timeLeft > 0} 
//             className="flex-1 bg-transparent border-none outline-none text-base font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
//           />
//         </div>

//         {/* HIZLI SEÇİM BUTONLARI */}
//         <AnimatePresence mode="wait">
//           {!isRunning && timeLeft === 0 && !isBreak && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
//               className="flex gap-2 w-full justify-center mb-4 lg:mb-3 overflow-hidden"
//             >
//               <button onClick={() => setPreset(0, 25)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Timer size={14} /> 25 Dk</button>
//               <button onClick={() => setPreset(0, 50)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Zap size={14} /> 50 Dk</button>
//               <button onClick={() => setPreset(1, 0)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Coffee size={14} /> 1 Saat</button>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div 
//           className={`relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 shrink-0 rounded-full border-[10px] bg-white/5 dark:bg-[#18181b]/20 flex flex-col items-center justify-center shadow-2xl mb-6 lg:mb-10 transition-all duration-700 backdrop-blur-sm ${ringColor} shadow-none`}
//         >
//           {!isRunning && timeLeft === 0 ? (
//             <div className="flex items-center justify-center gap-1">
//               <div className="flex flex-col items-center group">
//                 <button onClick={() => adjustHours(1)} className={`p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronUp size={28} /></button>
//                 <input 
//                   type="number" 
//                   value={hours.toString().padStart(2, '0')} 
//                   onChange={handleHoursChange}
//                   className="w-16 lg:w-20 bg-transparent text-center text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                 />
//                 <button onClick={() => adjustHours(-1)} className={`p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronDown size={28} /></button>
//               </div>
//               <span className="text-4xl lg:text-5xl font-light text-gray-300 dark:text-gray-600 pb-2 lg:pb-4">:</span>
//               <div className="flex flex-col items-center group">
//                 <button onClick={() => adjustMinutes(1)} className={`p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronUp size={28} /></button>
//                 <input 
//                   type="number" 
//                   value={minutes.toString().padStart(2, '0')} 
//                   onChange={handleMinutesChange}
//                   className="w-16 lg:w-20 bg-transparent text-center text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                 />
//                 <button onClick={() => adjustMinutes(-1)} className={`p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronDown size={28} /></button>
//               </div>
//             </div>
//           ) : (
//             <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-gray-100 font-mono tracking-widest tabular-nums z-10">
//               {formatTime(timeLeft)}
//             </h1>
//           )}

//           <span className={`absolute bottom-10 text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${isBreak ? 'text-emerald-500/80' : 'text-gray-400 dark:text-gray-500'}`}>
//             {isRunning ? (isBreak ? 'Mola Devam Ediyor' : 'Odaklanma Açık') : timeLeft > 0 ? 'Duraklatıldı' : (isBreak ? 'Molayı Başlat' : 'Süreyi Ayarla')}
//           </span>
//         </div>

//         {/* KONTROL BUTONLARI */}
//         <div className="flex items-center justify-center gap-5 w-full z-10">
          
//           <button 
//             onClick={handleReset}
//             disabled={!isRunning && timeLeft === 0}
//             className={`p-4 rounded-full transition-all border border-transparent ${(isRunning || timeLeft > 0) ? 'bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border-gray-200/50 dark:border-[#27272a] shadow-sm cursor-pointer' : 'bg-gray-100/50 dark:bg-[#111] text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-40'}`}
//             title="Sıfırla & Derse Dön"
//           >
//             <RotateCcw size={24} />
//           </button>
          
//           <motion.button 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handlePlayPause}
//             className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-500 cursor-pointer ${playBtnColor}`}
//             title={isRunning ? "Duraklat" : "Başlat / Devam Et"}
//           >
//             {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />}
//           </motion.button>

//           <button 
//             onClick={handleSkip}
//             className="p-4 rounded-full transition-all border border-transparent bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border-gray-200/50 dark:border-[#27272a] shadow-sm cursor-pointer"
//             title={isBreak ? "Derse Dön" : "Molaya Geç"}
//           >
//             <SkipForward size={24} />
//           </button>

//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default MainArea;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Zap, Coffee, Maximize, Minimize, Target, ChevronUp, ChevronDown, Leaf, SkipForward, VolumeX, BellRing } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useSettingsStore from '../store/useAyarlarStore';
import useStatsStore from '../store/useStatsStore';
import DersBitis from '../audio/ders-bitis.mp3';
import MolaBitis from '../audio/mola-bitis.mp3';
import toast from 'react-hot-toast';

// === BİLEŞEN DIŞI DEĞİŞKENLER ===
// F5 atılsa bile XP'nin kaybolmaması için localStorage'dan çekiyoruz
let globalInitialTime = typeof window !== 'undefined' ? (parseInt(localStorage.getItem('pomo_initial_time')) || 0) : 0;
let isAudioUnlocked = false;
let focusAudio = typeof window !== 'undefined' ? new Audio(DersBitis) : null;
let breakAudio = typeof window !== 'undefined' ? new Audio(MolaBitis) : null;

const MainArea = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [taskName, setTaskName] = useState('');
  
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
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

  const { focusTime, breakTime, autoBreak, breakSound, getSettings } = useSettingsStore();
  const { addFocusTime } = useStatsStore();

  const prevIsRunning = useRef(isRunning);
  const prevTimeLeft = useRef(timeLeft);
  const skipNextCompletion = useRef(false);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    getSettings();
  }, [getSettings]);


  useEffect(() => {
    if (activityName) {
      if (activityName.includes('Mola')) {
        setMode('break');
      } else if (activityName !== 'Boşta' && !activityName.startsWith('Duraklatıldı:')) {
        setMode('focus');
        setTaskName(activityName);
      }
    }
  }, [activityName]);

  useEffect(() => {
    if (focusTime && !isRunning && timeLeft === 0 && mode === 'focus') {
      setHours(Math.floor(focusTime / 60));
      setMinutes(focusTime % 60);
    }
  }, [focusTime, isRunning, timeLeft, mode]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // ================= GARANTİLİ SES KONTROL FONKSİYONLARI =================
  const unlockAudioForMobile = () => {
    if (!isAudioUnlocked && focusAudio && breakAudio) {
      focusAudio.load();
      breakAudio.load();
      focusAudio.volume = 0;
      breakAudio.volume = 0;

      const p1 = focusAudio.play();
      if (p1) p1.then(() => focusAudio.pause()).catch(() => {});

      const p2 = breakAudio.play();
      if (p2) p2.then(() => breakAudio.pause()).catch(() => {});

      isAudioUnlocked = true;
    }
  };

  const stopAlarm = () => {
    if (focusAudio && !focusAudio.paused) {
      focusAudio.pause();
      focusAudio.currentTime = 0;
    }
    if (breakAudio && !breakAudio.paused) {
      breakAudio.pause();
      breakAudio.currentTime = 0;
    }
    setIsAlarmPlaying(false);
  };

  const playNotificationSound = () => {
    if (breakSound) {
      stopAlarm(); 
      
      const audioEl = mode === 'focus' ? focusAudio : breakAudio;
      
      if (audioEl) {
        audioEl.volume = mode === 'focus' ? 1.0 : 0.9;
        audioEl.currentTime = 0;
        
        audioEl.onended = () => {
          setIsAlarmPlaying(false);
        };
        
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsAlarmPlaying(true))
            .catch((err) => {
              console.log("F5 yüzünden otomatik ses engellendi:", err);
              // F5 atıldığı için ses engellenirse bile Alarm Butonunu ekrana çıkar!
              setIsAlarmPlaying(true);
              toast('Süre bitti! (Ses çalması için ekrana dokunun)', { 
                icon: '🔔',
                style: { background: '#18181b', color: '#fff', border: '1px solid #3b82f6' }
              });
            });
        }
      }
    }
  };
  // ===============================================================

  // ================= XP HESAPLAMA (F5 KORUMALI) =================
  const recordFocusSession = () => {
    // F5 atılmışsa global değer sıfır olabilir, o yüzden tekrar localStorage'a bakıyoruz
    const initTime = globalInitialTime > 0 ? globalInitialTime : (parseInt(localStorage.getItem('pomo_initial_time')) || 0);

    if (mode === 'focus' && initTime > 0) {
      const workedSeconds = initTime - timeLeft;
      const workedMinutes = Math.floor(workedSeconds / 60);

      if (workedMinutes > 0) {
        addFocusTime(workedMinutes, taskName || 'Odaklanma');
      } else if (workedSeconds > 2) {
        toast('Puan kazanmak için en az 1 dakika odaklanmalısın!', { 
          icon: '⏳', 
          style: { background: '#18181b', color: '#fff', border: '1px solid #f59e0b' } 
        });
      }
    }
    // İşlem bittikten sonra referansları temizliyoruz ki spam atmasın
    globalInitialTime = 0;
    localStorage.removeItem('pomo_initial_time');
  };

  useEffect(() => {
    if (prevIsRunning.current && !isRunning && timeLeft === 0 && prevTimeLeft.current > 0) {
      if (skipNextCompletion.current) {
        skipNextCompletion.current = false;
      } else {
        handleTimerComplete();
      }
    }
    prevIsRunning.current = isRunning;
    prevTimeLeft.current = timeLeft;
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    recordFocusSession(); 
    playNotificationSound();

    if (mode === 'focus') {
      setMode('break');
      const bTime = breakTime || 5;
      const bSecs = bTime * 60;
      
      setHours(Math.floor(bTime / 60));
      setMinutes(bTime % 60);
      setTaskName('Mola Zamanı ☕');

      if (autoBreak) {
        startTimer(bSecs, 'Mola Zamanı ☕');
      }
    } else {
      setMode('focus');
      const fTime = focusTime || 25;
      
      setHours(Math.floor(fTime / 60));
      setMinutes(fTime % 60);
      setTaskName(''); 
    }
  };

  const handleStart = () => {
    stopAlarm(); 
    const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60;
    if (totalSeconds > 0) {
      globalInitialTime = totalSeconds; 
      // F5 KORUMASI: Başlangıç süresini tarayıcıya kazıyoruz
      localStorage.setItem('pomo_initial_time', totalSeconds.toString()); 
      
      const defaultName = mode === 'break' ? 'Mola Zamanı ☕' : 'Odaklanıyor';
      startTimer(totalSeconds, taskName || defaultName);
    }
  };

  const handlePlayPause = () => {
    unlockAudioForMobile(); 

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

  const handleReset = () => {
    stopAlarm(); 
    skipNextCompletion.current = true;
    recordFocusSession(); 
    stopTimer();
    setMode('focus');
    if (focusTime) {
      setHours(Math.floor(focusTime / 60));
      setMinutes(focusTime % 60);
      setTaskName('');
    }
  };

  const handleSkip = () => {
    stopAlarm();
    skipNextCompletion.current = true;
    recordFocusSession(); 
    stopTimer(); 

    if (mode === 'focus') {
      setMode('break');
      const bTime = breakTime || 5;
      setHours(Math.floor(bTime / 60));
      setMinutes(bTime % 60);
      setTaskName('Mola Zamanı ☕');
    } else {
      setMode('focus');
      const fTime = focusTime || 25;
      setHours(Math.floor(fTime / 60));
      setMinutes(fTime % 60);
      setTaskName('');
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

  const adjustHours = (val) => setHours(prev => Math.max(0, Math.min(23, (parseInt(prev) || 0) + val)));
  
  const adjustMinutes = (val) => {
    setMinutes(prev => {
      let newVal = (parseInt(prev) || 0) + val;
      if (newVal > 59) return 0;
      if (newVal < 0) return 59;
      return newVal;
    });
  };

  const handleHoursChange = (e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)));
  const handleMinutesChange = (e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)));

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(err => console.log(err));
      setFullScreen(true);
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
      setFullScreen(false);
    }
  };

  const isBreak = mode === 'break';
  
  const ringColor = isBreak 
    ? (isRunning ? 'border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : timeLeft > 0 ? 'border-emerald-500/40' : 'border-gray-200 dark:border-[#27272a]')
    : (isRunning ? 'border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : timeLeft > 0 ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-gray-200 dark:border-[#27272a]');

  const light1 = isBreak ? (isRunning ? 'bg-emerald-500/10' : 'bg-emerald-500/5') : (isRunning ? 'bg-red-500/10' : 'bg-red-500/5');
  const light2 = isBreak ? (isRunning ? 'bg-teal-500/10' : 'bg-teal-500/5') : (isRunning ? 'bg-orange-500/10' : 'bg-orange-500/5');

  const inputBorder = isBreak
    ? 'focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
    : 'focus-within:border-red-500 dark:focus-within:border-red-500 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.1)]';

  const inputActive = isBreak 
    ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(16,185,129,0.05)]'
    : 'border-red-500/30 dark:border-red-500/20 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.05)]';

  const playBtnColor = isBreak
    ? (isRunning ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20')
    : (isRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20');

  return (
    <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden transition-colors duration-1000">

      <AnimatePresence>
        {isAlarmPlaying && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-12 z-50 flex items-center justify-center w-full pointer-events-none"
          >
            <button 
              onClick={() => {
                stopAlarm();
                toast.success('Alarm başarıyla susturuldu.');
              }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 lg:px-6 py-2 lg:py-3 rounded-full backdrop-blur-md border shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm lg:text-base font-bold ${
                isBreak 
                  ? 'bg-white/90 dark:bg-[#18181b]/90 border-emerald-500/50 shadow-emerald-500/20 text-emerald-500' 
                  : 'bg-white/90 dark:bg-[#18181b]/90 border-red-500/50 shadow-red-500/20 text-red-500'
              }`}
            >
              <div className="relative">
                <BellRing size={18} className="animate-pulse" />
                <VolumeX size={10} className="absolute -bottom-1 -right-1 bg-white dark:bg-[#18181b] rounded-full" />
              </div>
              Alarmı Sustur
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={toggleFullScreen}
        className="absolute top-4 right-4 lg:top-6 lg:right-6 z-40 p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-white/80 dark:bg-[#18181b]/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border border-gray-200/50 dark:border-[#27272a] backdrop-blur-md transition-all shadow-sm"
        title={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
      >
        {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] lg:w-[450px] h-[300px] lg:h-[450px] rounded-full blur-[100px] lg:blur-[120px] transition-colors duration-1000 pointer-events-none ${light1}`}></div>
      <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] lg:w-[450px] h-[300px] lg:h-[450px] rounded-full blur-[100px] lg:blur-[120px] transition-colors duration-1000 pointer-events-none ${light2}`}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`z-10 flex flex-col items-center justify-center w-full max-w-sm px-4 py-4 lg:py-8 lg:-mt-10 ${isBreak ? 'mt-0' : 'mt-2 md:mt-4 lg:mt-0'}`}
      >
        
        <div className={`w-full bg-white dark:bg-[#18181b]/60 border border-gray-200 dark:border-[#27272a] rounded-xl lg:rounded-2xl p-2 lg:p-3 flex items-center gap-3 backdrop-blur-md transition-all duration-500 ${
          isRunning || timeLeft > 0 
            ? `mb-6 lg:mb-11 ${inputActive}` 
            : `${isBreak ? 'mb-4 lg:mb-8' : 'mb-3 md:mb-4 lg:mb-8'} ${inputBorder}`
        }`}>
          <div className={`p-2 rounded-lg lg:rounded-xl transition-colors duration-500 ${
            isRunning || timeLeft > 0 
              ? (isBreak ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500') 
              : 'bg-gray-100 dark:bg-[#27272a] text-gray-400'
          }`}>
            {isBreak ? <Leaf size={18} /> : <Target size={18} />}
          </div>
          <input 
            type="text" 
            placeholder={isBreak ? "Mola zamanı..." : "Şu an neye odaklanıyorsun?"} 
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            disabled={isRunning || timeLeft > 0} 
            className="flex-1 bg-transparent border-none outline-none text-sm lg:text-base font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        <AnimatePresence mode="wait">
          {!isRunning && timeLeft === 0 && !isBreak && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 w-full justify-center mb-3 md:mb-4 lg:mb-8 overflow-hidden"
            >
              <button onClick={() => setPreset(0, 25)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Timer size={14} /> 25 Dk</button>
              <button onClick={() => setPreset(0, 50)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Zap size={14} /> 50 Dk</button>
              <button onClick={() => setPreset(1, 0)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-xs font-bold bg-white dark:bg-[#18181b]/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#27272a] hover:border-orange-500/30 hover:bg-orange-500/[0.02] hover:text-orange-500 transition-all shadow-sm"><Coffee size={14} /> 1 Saat</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          className={`relative w-56 h-56 md:w-60 md:h-60 lg:w-80 lg:h-80 shrink-0 rounded-full border-8 lg:border-[10px] bg-white/5 dark:bg-[#18181b]/20 flex flex-col items-center justify-center shadow-2xl mb-4 lg:mb-10 transition-all duration-700 backdrop-blur-sm ${ringColor} shadow-none`}
        >
          {!isRunning && timeLeft === 0 ? (
            <div className="flex items-center justify-center gap-1">
              <div className="flex flex-col items-center group">
                <button onClick={() => adjustHours(1)} className={`p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronUp className="w-5 h-5 lg:w-7 lg:h-7" /></button>
                <input 
                  type="number" 
                  value={hours.toString().padStart(2, '0')} 
                  onChange={handleHoursChange}
                  className="w-14 md:w-16 lg:w-20 bg-transparent text-center text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => adjustHours(-1)} className={`p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronDown className="w-5 h-5 lg:w-7 lg:h-7" /></button>
              </div>
              <span className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-300 dark:text-gray-600 pb-2 lg:pb-4">:</span>
              <div className="flex flex-col items-center group">
                <button onClick={() => adjustMinutes(1)} className={`p-1 -mb-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronUp className="w-5 h-5 lg:w-7 lg:h-7" /></button>
                <input 
                  type="number" 
                  value={minutes.toString().padStart(2, '0')} 
                  onChange={handleMinutesChange}
                  className="w-14 md:w-16 lg:w-20 bg-transparent text-center text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => adjustMinutes(-1)} className={`p-1 -mt-1 z-10 text-gray-300 dark:text-gray-600 transition-colors ${isBreak ? 'hover:text-emerald-500' : 'hover:text-red-500'}`}><ChevronDown className="w-5 h-5 lg:w-7 lg:h-7" /></button>
              </div>
            </div>
          ) : (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-gray-100 font-mono tracking-widest tabular-nums z-10">
              {formatTime(timeLeft)}
            </h1>
          )}

          <span className={`absolute bottom-6 lg:bottom-10 text-[9px] lg:text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${isBreak ? 'text-emerald-500/80' : 'text-gray-400 dark:text-gray-500'}`}>
            {isRunning ? (isBreak ? 'Mola Devam Ediyor' : 'Odaklanma Açık') : timeLeft > 0 ? 'Duraklatıldı' : (isBreak ? 'Molayı Başlat' : 'Süreyi Ayarla')}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 lg:gap-5 w-full z-10">
          
          <button 
            onClick={handleReset}
            disabled={!isRunning && timeLeft === 0}
            className={`p-3 lg:p-4 rounded-full transition-all border border-transparent ${(isRunning || timeLeft > 0) ? 'bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border-gray-200/50 dark:border-[#27272a] shadow-sm cursor-pointer' : 'bg-gray-100/50 dark:bg-[#111] text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-40'}`}
            title="Sıfırla & Derse Dön"
          >
            <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-500 cursor-pointer ${playBtnColor}`}
            title={isRunning ? "Duraklat" : "Başlat / Devam Et"}
          >
            {isRunning ? <Pause className="w-7 h-7 lg:w-8 lg:h-8" fill="currentColor" /> : <Play className="w-7 h-7 lg:w-8 lg:h-8 ml-1" fill="currentColor" />}
          </motion.button>

          <button 
            onClick={handleSkip}
            className="p-3 lg:p-4 rounded-full transition-all border border-transparent bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white border-gray-200/50 dark:border-[#27272a] shadow-sm cursor-pointer"
            title={isBreak ? "Derse Dön" : "Molaya Geç"}
          >
            <SkipForward className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

        </div>
      </motion.div>
    </div>
  );
};

export default MainArea;