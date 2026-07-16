import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Wrench, Zap, Plus, X, Send, Trash2, Edit2, Info, AlertTriangle, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';
import useAnnouncementStore from '../store/useAnnouncementStore';

const AnnouncementsArea = () => {
  const { user } = useAppStore();
  
  const { 
    announcements, 
    isLoading, 
    isSubmitting, 
    fetchAnnouncements, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAnnouncementStore();
  
  // UI State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', content: '', version: '', type: 'feature'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const getIcon = (type) => {
    switch (type) {
      case 'feature': return <Rocket size={16} className="text-indigo-400" />;
      case 'update': return <Zap size={16} className="text-amber-400" />;
      case 'fix': return <Wrench size={16} className="text-gray-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement._id);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        version: announcement.version,
        type: announcement.type
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', version: '', type: 'feature' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', version: '', type: 'feature' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.version) {
      return toast.error('Lütfen tüm alanları doldurun.');
    }

    let success = false;
    if (editingId) {
      success = await updateAnnouncement(editingId, formData);
    } else {
      success = await createAnnouncement(formData);
    }
    
    if (success) {
      handleCloseModal();
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteAnnouncement(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // TAM EKRAN SPINNER: Veriler yüklenirken başlık dahil her şey gizlenir
  if (isLoading && announcements.length === 0) {
    return (
      <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-indigo-400"
            />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-14 h-14 bg-white dark:bg-[#18181b] rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 z-10"
            >
              <Megaphone size={26} className="text-indigo-500" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide mb-1">
            PomoV1
          </h2>
          <p className="text-xs text-indigo-500 font-bold tracking-widest uppercase animate-pulse">
            Duyurular Yükleniyor...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex flex-col relative overflow-hidden transition-colors duration-500">
      
      {/* Arka Plan Dekoratif Parıltısı */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="pt-12 pb-6 px-10 border-b border-gray-200/50 dark:border-[#27272a]/50 z-10 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-indigo-500 dark:text-indigo-400" size={24} />
              Güncellemeler
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">PomoSync'teki en son yenilikler ve düzeltmeler</p>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-indigo-500/20"
              >
                <Plus size={14} /> Yeni Duyuru
              </motion.button>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400">
              Son Sürüm <span className="text-indigo-500 dark:text-indigo-400">{announcements.length > 0 ? announcements[0].version : 'v1.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE LISTESI */}
      <div className="flex-1 overflow-y-auto px-10 py-10 z-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {announcements.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Henüz bir duyuru yayınlanmamış.</div>
          ) : (
            announcements.map((ann, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }}
                key={ann._id}
                className="relative pl-8 pb-12 last:pb-0 group"
              >
                {index !== announcements.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-[-8px] w-px bg-gray-200 dark:bg-[#27272a]"></div>
                )}

                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-50 dark:bg-[#09090b] border-2 border-gray-200 dark:border-[#27272a] flex items-center justify-center group-hover:border-indigo-500 transition-colors duration-300 z-10">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-[#27272a] group-hover:bg-indigo-500 transition-colors duration-300"></div>
                </div>

                <div className="bg-white dark:bg-[#18181b]/40 border border-gray-200 dark:border-[#27272a] rounded-2xl p-6 backdrop-blur-md hover:bg-gray-50/50 dark:hover:bg-[#18181b]/80 transition-all duration-300 relative overflow-hidden">
                  
                  {/* ADMIN KONTROLLERİ */}
                  {user?.role === 'admin' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleOpenModal(ann)} className="p-1.5 bg-gray-100 dark:bg-[#27272a] hover:bg-indigo-500 hover:text-white text-gray-500 dark:text-gray-400 rounded-lg transition-colors" title="Düzenle">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(ann._id)} className="p-1.5 bg-gray-100 dark:bg-[#27272a] hover:bg-red-500 hover:text-white text-gray-500 dark:text-gray-400 rounded-lg transition-colors" title="Sil">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-gray-300">
                      {getIcon(ann.type)}
                      {ann.version}
                    </span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 pr-12">{ann.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ADMIN EKLEME / DÜZENLEME MODALI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#27272a] flex items-center justify-between bg-gray-50/50 dark:bg-[#18181b] flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {editingId ? <Edit2 size={18} className="text-indigo-500" /> : <Plus size={18} className="text-indigo-500" />} 
                    {editingId ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
                  </h3>
                  <button type="button" onClick={handleCloseModal} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Sürüm Numarası</label>
                    <input type="text" required value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} placeholder="Örn: v2.0.1" className="w-full bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Duyuru Başlığı</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Kullanıcıların göreceği başlık..." className="w-full bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Kategori</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer">
                      <option value="feature">🚀 Yeni Özellik (Feature)</option>
                      <option value="update">⚡ Güncelleme (Update)</option>
                      <option value="fix">🔧 Düzeltme (Fix)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">İçerik</label>
                    <textarea required rows="4" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Değişiklikleri detaylıca anlat..." className="w-full bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors resize-none custom-scrollbar"></textarea>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-[#27272a] flex justify-end gap-3 bg-gray-50/50 dark:bg-[#09090b]/50 flex-shrink-0">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    İptal
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                    {isSubmitting ? (
                      <div className="relative w-4 h-4 mr-1">
                        <div className="absolute inset-0 rounded-full border-[2px] border-white/30"></div>
                        <div className="absolute inset-0 rounded-full border-[2px] border-white border-t-transparent animate-spin"></div>
                      </div>
                    ) : (
                      <Send size={16} />
                    )} 
                    {editingId ? 'Güncelle' : 'Yayınla'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SİLME ONAY MODALI */}
      <AnimatePresence>
        {deleteId && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setDeleteId(null)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-xs bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-[#27272a] text-center shadow-2xl z-10"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Duyuruyu Sil</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Bu işlem geri alınamaz. Emin misiniz?</p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 py-2 text-sm font-bold bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3f3f46] rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDelete} 
                  className="flex-1 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all"
                >
                  Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AnnouncementsArea;