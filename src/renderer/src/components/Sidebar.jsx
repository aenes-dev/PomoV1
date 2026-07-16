import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // YENİ: Modal'ı tüm ekrana yaymak için eklendi
import { UserPlus, Settings, Flame, Coffee, Bell, Check, X, LogOut, Loader2, PanelLeftClose, PanelLeftOpen, Clock, MessageSquare, Megaphone, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';
import useFriendStore from '../store/useFriendStore';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRequests, setShowRequests] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [deleteFriendInfo, setDeleteFriendInfo] = useState(null); 
  
  const { user, logout, isFullScreen, activeTab, setActiveTab } = useAppStore();
  
  const { 
    friends, 
    pendingRequests, 
    isLoadingFriends,
    fetchFriendsAndRequests, 
    sendRequest, 
    respondToRequest,
    initSocketListeners,
    removeFriend
  } = useFriendStore();

  const requestsRef = useRef(null);

  useEffect(() => {
    fetchFriendsAndRequests();
    initSocketListeners();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (requestsRef.current && !requestsRef.current.contains(event.target)) {
        setShowRequests(false);
      }
    };

    if (showRequests) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRequests]);

  if (isFullScreen) return null;

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!addUsername.trim()) return;

    setIsAdding(true);
    const result = await sendRequest(addUsername.trim());
    setIsAdding(false);

    if (result.success) {
      toast.success(result.message, {
        icon: '🚀',
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
      });
      setAddUsername('');
    } else {
      toast.error(result.message, {
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }
      });
    }
  };

  const handleRequestResponse = async (id, status) => {
    const success = await respondToRequest(id, status);
    if (success) {
      toast.success(status === 'accepted' ? 'İstek kabul edildi!' : 'İstek reddedildi.', {
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
      });
    }
  };

  const handleConfirmRemoveFriend = async () => {
    if (!deleteFriendInfo) return;
    
    const success = await removeFriend(deleteFriendInfo.id);
    if (success) {
      toast.success(`${deleteFriendInfo.username} arkadaşlıktan çıkarıldı.`, {
        icon: '👋',
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
      });
    }
    setDeleteFriendInfo(null);
  };

  return (
    <motion.div 
      animate={{ width: isExpanded ? 288 : 80 }} 
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-[#09090b] border-r border-gray-200 dark:border-[#27272a] flex flex-col h-full relative z-20 flex-shrink-0"
    >
      <div className={`p-4 border-b border-gray-200 dark:border-[#27272a] flex flex-col ${!isExpanded && 'items-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center flex-col gap-4'} mb-4 w-full`}>
          
          {isExpanded && (
            <motion.h2 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden"
            >
              Arkadaşlar
            </motion.h2>
          )}
          
          <div className={`flex items-center ${isExpanded ? 'gap-2' : 'flex-col gap-4'}`}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-gray-100 dark:bg-[#18181b] text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-[#27272a] transition-colors"
              title={isExpanded ? "Menüyü Daralt" : "Menüyü Genişlet"}
            >
              {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <div className="relative" ref={requestsRef}>
              <button 
                onClick={() => setShowRequests(!showRequests)}
                className={`relative p-2 rounded-lg transition-colors ${showRequests ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#27272a]'}`}
                title="Gelen İstekler"
              >
                <Bell size={18} />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#09090b]"></span>
                )}
              </button>

              <AnimatePresence>
                {showRequests && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 left-0 w-64 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b]">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Gelen İstekler</h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {pendingRequests.length > 0 ? (
                        pendingRequests.map(req => (
                          <div key={req.id} className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-[#27272a] hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                                {req.name?.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{req.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleRequestResponse(req.id, 'accepted')} className="p-1.5 bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"><Check size={14} /></button>
                              <button onClick={() => handleRequestResponse(req.id, 'rejected') } className="p-1.5 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"><X size={14} /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">Bekleyen istek yok.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-1.5 w-full mb-6">
            <button 
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'timer' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#18181b] hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <Clock size={18} /> Sayaç
            </button>
            <button 
              onClick={() => setActiveTab('suggestion')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'suggestion' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#18181b] hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <MessageSquare size={18} /> Öneriler
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'announcements' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#18181b] hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <Megaphone size={18} /> Duyurular
            </button>
          </div>
        )}

        {isExpanded ? (
          <form onSubmit={handleAddFriend} className="relative flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="Kullanıcı adı girin..." 
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#18181b] text-sm text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all border border-transparent dark:focus:border-[#27272a]"
            />
            <button 
              type="submit" 
              disabled={isAdding || !addUsername.trim()}
              className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0"
            >
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center"
            title="Arkadaş Ekle"
          >
            <UserPlus size={18} />
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto p-3 space-y-1 ${!isExpanded && 'flex flex-col items-center overflow-x-hidden'}`}>
        {isLoadingFriends ? (
          [1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={`flex items-center ${isExpanded ? 'gap-3 p-3' : 'justify-center p-2 mb-1'} w-full rounded-xl`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#18181b] animate-pulse flex-shrink-0"></div>
              {isExpanded && (
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-[#18181b] rounded animate-pulse w-24"></div>
                  <div className="h-2 bg-gray-200 dark:bg-[#18181b] rounded animate-pulse w-16"></div>
                </div>
              )}
            </div>
          ))
        ) : friends.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-10 w-full whitespace-nowrap overflow-hidden">
            {isExpanded ? 'Henüz arkadaşın yok.' : '...'}
          </div>
        ) : (
          friends.map((friend, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={friend._id}
              className={`group flex items-center ${isExpanded ? 'gap-3 p-3' : 'justify-center p-2 mb-1'} rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#18181b] transition-colors w-full relative`}
              title={friend.username}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-md uppercase flex-shrink-0">
                {friend.username.charAt(0)}
              </div>
              
              {isExpanded && (
                <>
                  <div className="flex-1 whitespace-nowrap overflow-hidden">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200  truncate">{friend.username}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {friend.status === 'online' ? <Flame size={12} className="text-red-500" /> : <Coffee size={12} className="text-gray-400" />}
                      {friend.status === 'online' ? `${friend.focusStatus?.activityName ? friend.focusStatus.activityName : 'Boşta'}` : 'Molada/Çevrimdışı'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setDeleteFriendInfo({ id: friend._id, username: friend.username });
                    }}
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-white bg-gray-200/50 hover:bg-red-500 dark:bg-[#27272a]/50 dark:hover:bg-red-500 rounded-lg transition-all"
                    title="Arkadaşı Sil"
                  >
                    <UserMinus size={16} />
                  </button>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className={`p-4 border-t border-gray-200 dark:border-[#27272a] flex items-center bg-white dark:bg-[#09090b] ${isExpanded ? 'justify-between' : 'flex-col gap-4 justify-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-200 flex items-center justify-center text-white dark:text-gray-800 font-bold uppercase flex-shrink-0" title={user?.username}>
            {user?.username?.charAt(0) || '?'}
          </div>
          {isExpanded && (
            <div className="whitespace-nowrap overflow-hidden">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate w-24">
                {user?.username || 'Kullanıcı'}
              </h4>
              <p className="text-xs text-green-500">Çevrimiçi</p>
            </div>
          )}
        </div>
        
        <div className={`flex items-center ${isExpanded ? 'gap-1' : 'flex-col gap-2'}`}>
          {isExpanded && (
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-[#18181b] transition-colors" title="Ayarlar">
              <Settings size={18} />
            </button>
          )}
          <button onClick={() => logout()} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Çıkış Yap">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      {/* PORTAL İLE TÜM EKRANI KAPLAYAN ARKADAŞ SİLME MODALI */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deleteFriendInfo && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setDeleteFriendInfo(null)} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
                className="relative w-full max-w-xs bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-[#27272a] text-center shadow-2xl z-10"
              >
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserMinus size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Arkadaşı Sil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{deleteFriendInfo.username}</span> adlı kullanıcıyı arkadaşlıktan çıkarmak istediğinize emin misiniz?
                </p>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setDeleteFriendInfo(null)} 
                    className="flex-1 py-2 text-sm font-bold bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3f3f46] rounded-xl transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="button" 
                    onClick={handleConfirmRemoveFriend} 
                    className="flex-1 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all"
                  >
                    Sil
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default Sidebar;