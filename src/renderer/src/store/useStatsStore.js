import { create } from 'zustand';
import api from '../api/axiosInstance'; // Kendi Axios instance'ın
import toast from 'react-hot-toast';

const useStatsStore = create((set, get) => ({
  weeklyPoints: 0,
  totalPoints: 0,
  leaderboard: [],
  isLoading: false,
  isLeaderboardLoading: false,

  // 1. Kullanıcının Kendi Puanlarını Çekme (Uygulama ilk açıldığında çağırabilirsin)
  fetchMyStats: async () => {
    try {
      const res = await api.get('/stats/mine'); // Endpoint'ini backend'ine göre ayarla
      if (res.data.success) {
        set({ 
          weeklyPoints: res.data.data.weeklyPoints, 
          totalPoints: res.data.data.totalPoints 
        });
      }
    } catch (error) {
      console.error('İstatistikler çekilemedi', error);
      // Arka plan işlemi olduğu için kullanıcıyı toast ile darlamaya gerek yok
    }
  },

  // 2. Odaklanma Bitince XP Ekleme (MainArea'dan çağrılan yer)
  addFocusTime: async (minutes, taskName) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/stats/update', { 
        minutesCompleted: minutes, 
        activityName: taskName || 'Odaklanma' 
      });

      if (res.data.success) {
        set({ 
          weeklyPoints: res.data.data.weeklyPoints, 
          totalPoints: res.data.data.totalPoints 
        });
        
        toast.success(`Harika! ${minutes} Puan kazandın. 🚀`);
      }
    } catch (error) {
      console.error('Puan güncellenirken hata oluştu', error);
      toast.error(error.response?.data?.message || 'Puan kaydedilemedi, ağ hatası!');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLeaderboard: async () => {
    set({ isLeaderboardLoading: true });
    try {
      const res = await api.get('/stats/leaderboard');
      if (res.data.success) {
        set({ leaderboard: res.data.data });
      }
    } catch (error) {
      console.error('Liderlik tablosu çekilemedi', error);
      toast.error('Liderlik tablosu yüklenirken bir sorun oluştu.');
    } finally {
      set({ isLeaderboardLoading: false });
    }
  }
}));

export default useStatsStore;