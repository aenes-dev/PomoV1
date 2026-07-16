import { create } from 'zustand';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const useSuggestionStore = create((set, get) => ({
  suggestions: [],
  isLoading: false,

  fetchSuggestions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/suggestions');
      set({ suggestions: res.data, isLoading: false });
    } catch (err) {
      toast.error('Öneriler yüklenemedi.');
      set({ isLoading: false });
    }
  },

  createSuggestion: async (content) => {
    try {
      const res = await api.post('/suggestions', { content });
      console.log(res.data)
      set((state) => ({ suggestions: [res.data, ...state.suggestions] }));
      return true;
    } catch (err) {
      toast.error('Öneri paylaşılırken hata oluştu.');
      return false;
    }
  },

  toggleReaction: async (suggestionId, emoji) => {
    try {
        console.log(emoji)
      // 1. İyimser Güncelleme: Ekranda anında değiştir (Bekleme hissi olmasın)
      set((state) => ({
        suggestions: state.suggestions.map(s => {
          if (s._id !== suggestionId) return s;
          
          let newReactions = [...(s.reactions || [])];
          const existingIndex = newReactions.findIndex(r => r.emoji === emoji);

          if (existingIndex >= 0) {
            // Varsa sayıyı azalt veya artır
            const current = newReactions[existingIndex];
            current.reacted = !current.reacted;
            current.count = current.reacted ? current.count + 1 : current.count - 1;
            // Sayı 0 olursa diziden çıkar
            if (current.count <= 0) newReactions.splice(existingIndex, 1);
          } else {
            // Yoksa yeni ekle
            newReactions.push({ emoji, count: 1, reacted: true });
          }
          return { ...s, reactions: newReactions };
        })
      }));

      // 2. Arka planda API'ye GERÇEK isteği at
      await api.post(`/suggestions/${suggestionId}/reactions`, { emoji });
    } catch (err) {
      console.error("Tepki Hatası:", err);
      toast.error('Tepki verilemedi.');
      get().fetchSuggestions(); // Hata olursa eski haline döndür
    }
  },

  addReply: async (suggestionId, content) => {
    try {
      const res = await api.post(`/suggestions/${suggestionId}/replies`, { content });
      set((state) => ({
        suggestions: state.suggestions.map(s => s._id === suggestionId ? res.data : s)
      }));
      return true;
    } catch (err) {
      toast.error('Yanıt eklenemedi.');
      return false;
    }
  },

  deleteContent: async (suggestionId, replyId = null) => {
    try {
      const url = replyId 
        ? `/suggestions/${suggestionId}/replies/${replyId}` 
        : `/suggestions/${suggestionId}`;
        
      await api.delete(url);
      
      if (replyId) {
        set((state) => ({
          suggestions: state.suggestions.map(s => 
            s._id === suggestionId ? { ...s, replies: s.replies.filter(r => r._id !== replyId) } : s
          )
        }));
      } else {
        set((state) => ({ suggestions: state.suggestions.filter(s => s._id !== suggestionId) }));
      }
      get().fetchSuggestions()
      return true;
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
      return false;
    }
  }
}));

export default useSuggestionStore;