import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Flame, Loader2, Crown, Zap, Target } from 'lucide-react';
import useStatsStore from '../store/useStatsStore';
import useAppStore from '../store/useAppStore';

const LeaderboardArea = () => {
  const { 
    leaderboard, 
    fetchLeaderboard, 
    isLeaderboardLoading, 
    weeklyPoints, 
    totalPoints, 
    fetchMyStats 
  } = useStatsStore();
  
  const { user } = useAppStore();

  useEffect(() => {
    fetchLeaderboard();
    fetchMyStats();
  }, [fetchLeaderboard, fetchMyStats]);



  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  // Kürsü renkleri
  const getPodiumStyle = (rank) => {
    switch(rank) {
      case 1: return { color: 'text-amber-400', bg: 'from-amber-400/20 to-amber-600/5', border: 'border-amber-400/30', shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]', height: 'h-40 md:h-48' };
       case 2: return { color: 'text-orange-400', bg: 'from-orange-400/20 to-red-500/5', border: 'border-orange-400/30', shadow: 'shadow-[0_0_20px_rgba(251,146,60,0.1)]', height: 'h-32 md:h-36' };
      case 3: return { color: 'text-slate-300', bg: 'from-slate-300/20 to-slate-500/5', border: 'border-slate-300/30', shadow: 'shadow-[0_0_20px_rgba(203,213,225,0.1)]', height: 'h-28 md:h-32' };
    }
  };

  // TAM EKRAN MÜKEMMEL YÜKLEME ANİMASYONU
  if (isLeaderboardLoading && leaderboard.length === 0) {
    return (
      <div className="flex-1 w-full h-full bg-[#fafafa] dark:bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-amber-500 border-r-amber-400"
            />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-14 h-14 bg-white dark:bg-[#18181b] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 z-10"
            >
              <Trophy size={26} className="text-amber-500" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide mb-1">
            PomoV1
          </h2>
          <p className="text-xs text-amber-500 font-bold tracking-widest uppercase animate-pulse">
            Efsaneler Yükleniyor...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-[#fafafa] dark:bg-[#09090b] flex flex-col p-4 md:p-8 overflow-y-auto relative selection:bg-red-500/30">
      
      <div className="max-w-4xl w-full mx-auto space-y-8 pb-10">
        
        {/* PREMIUM HEADER & BENİM İSTATİSTİKLERİM */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-3xl p-6 shadow-sm relative overflow-hidden">
          {/* Arka plan efekti */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4 text-center lg:text-left flex-col lg:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
              <Trophy size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Haftalık Liderlik Tablosu</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Bu hafta en çok odaklananlar zirvede yer alır.</p>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none bg-gray-50 dark:bg-[#09090b] border border-gray-100 dark:border-[#27272a] rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Bu Hafta</span>
              <div className="flex items-baseline gap-1 text-emerald-500">
                <Flame size={16} fill="currentColor" className="mb-1" />
                <span className="text-xl font-black">{weeklyPoints}</span>
                <span className="text-xs font-bold opacity-70">PUAN</span>
              </div>
            </div>
            <div className="flex-1 lg:flex-none bg-gray-50 dark:bg-[#09090b] border border-gray-100 dark:border-[#27272a] rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Toplam</span>
              <div className="flex items-baseline gap-1 text-amber-500">
                <Zap size={16} fill="currentColor" className="mb-1" />
                <span className="text-xl font-black">{totalPoints}</span>
                <span className="text-xs font-bold opacity-70">PUAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* LİSTE DURUMU */}
        {leaderboard.length === 0 ? (
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <Target size={64} className="text-gray-200 dark:text-gray-800 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Henüz Rekabet Başlamadı</h3>
            <p className="text-gray-500 mt-2 max-w-sm">Bu haftanın ilk puanını sen kazan, kürsünün zirvesine hemen yerleş!</p>
          </div>
        ) : (
          <>
            {/* ŞAMPİYONLUK KÜRSÜSÜ (İLK 3) */}
            {topThree.length > 0 && (
              <div className="flex items-end justify-center gap-2 md:gap-4 lg:gap-6 pt-10 pb-6">
                {topThree.map((person, index) => {
                  // Kürsü sıralaması: [2, 1, 3] şeklinde dizilim yapıyoruz
                  let rank = index + 1;
                  let orderClass = rank === 1 ? 'order-2 z-10' : rank === 2 ? 'order-1' : 'order-3';
                  const style = getPodiumStyle(rank);
                  const isMe = person.username === user?.username;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                      key={person.id} 
                      className={`flex flex-col items-center ${orderClass} flex-1 max-w-[140px] md:max-w-[180px] relative`}
                    >
                      {/* Avatar & Taç */}
                      <div className="relative mb-4 flex flex-col items-center group">
                        {rank === 1 && (
                          <motion.div 
                            initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.5, type: "spring" }}
                            className="absolute -top-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                          >
                            <Crown size={36} fill="currentColor" />
                          </motion.div>
                        )}
                        <div className={`relative rounded-full p-1 border-2 md:border-4 ${style.border} ${style.shadow} bg-white dark:bg-[#18181b] z-10 transition-transform group-hover:scale-105`}>
                          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xl font-bold uppercase overflow-hidden`}>
                            {person.avatar ? (
                              <img src={person.avatar} alt={person.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">{person.username?.charAt(0)}</span>
                            )}
                          </div>
                        </div>
                        {/* 1, 2, 3 Numarası */}
                        <div className={`absolute -bottom-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-black text-white z-20 shadow-lg ${rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-slate-400' : 'bg-orange-500'}`}>
                          {rank}
                        </div>
                      </div>

                      {/* İsim & Puan Kürsüsü Blok */}
                      <div className={`w-full ${style.height} rounded-t-2xl md:rounded-t-3xl border-t border-l border-r ${style.border} bg-gradient-to-t ${style.bg} backdrop-blur-sm flex flex-col items-center pt-5 md:pt-6 px-2 text-center transition-all`}>
                        <h3 className={`font-bold text-sm md:text-base truncate w-full px-1 ${isMe ? 'text-emerald-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {person.username}
                        </h3>
                        <div className={`mt-1 font-black text-lg md:text-2xl ${style.color} flex flex-col items-center`}>
                          {person.weeklyPoints} 
                          <span className="text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-widest mt-0.5">PUAN</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* GERİ KALANLAR LİSTESİ (4. ve Sonrası) */}
            {restOfList.length > 0 && (
              <div className="mt-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-3xl p-2 md:p-4 shadow-sm">
                <div className="space-y-1 md:space-y-2">
                  {restOfList.map((person, i) => {
                    const actualRank = i + 4;
                    const isMe = person.username === user?.username;

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.05) }}
                        key={person.id}
                        className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-[#27272a]/50 ${isMe ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-500/20' : 'border border-transparent hover:border-gray-100 dark:hover:border-[#27272a]'}`}
                      >
                        <div className="flex items-center gap-3 md:gap-5">
                          <span className="w-6 md:w-8 text-center text-sm md:text-base font-bold text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {actualRank}
                          </span>
                          
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-[#09090b] flex items-center justify-center text-gray-500 font-bold uppercase overflow-hidden shrink-0 border border-gray-200 dark:border-[#27272a]">
                            {person.avatar ? (
                              <img src={person.avatar} alt={person.username} className="w-full h-full object-cover" />
                            ) : (
                              <span>{person.username?.charAt(0)}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <h3 className={`text-sm md:text-base font-bold ${isMe ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'} flex items-center gap-2`}>
                              {person.username}
                              {isMe && <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white tracking-wider">SEN</span>}
                            </h3>
                          </div>
                        </div>

                        <div className="font-mono text-base md:text-lg font-bold text-gray-700 dark:text-gray-300">
                          {person.weeklyPoints} <span className="text-xs text-gray-400 font-sans tracking-wide">PUAN</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardArea;