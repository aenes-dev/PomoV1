import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosInstance'; 
import useAppStore from './useAppStore';


 const useSettingsStore = create(
  persist(
    (set, get) => ({
      focusTime: 25,
      breakTime: 5,
      autoBreak: false, 
      breakSound: false, 
      
      isLoading: false,
      error: null,

      getSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/settings'); 
          const currentSettings = response.data;
          
          set((state) => ({ ...state, ...currentSettings }));
        } catch (error) {
          console.error("Ayarlar backend'den çekilirken hata oluştu:", error);
          set({ error: error.response?.data?.message || "Ayarlar yüklenemedi." });
        } finally {
          set({ isLoading: false });
        }
      },

      setSetting: async (key, value) => {
        const previousValue = get()[key];
        
        set((state) => ({ ...state, [key]: value }));
        
        try {
          await api.post('/settings/settings', { [key]: value });
        } catch (error) {
          console.error(`Ayar kaydedilemedi (${key}):`, error);
          set((state) => ({ ...state, [key]: previousValue }));
        }
      },

      clearSettings: () => { // kullanılmıyor.
        localStorage.removeItem('pomo-v1-settings-storage');
        set({
          focusTime: 25,
          breakTime: 5,
          autoBreak: true,
          breakSound: true,
          error: null
        });
      }

    }),
    {
      name: 'pomo-v1-settings-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        focusTime: state.focusTime,
        breakTime: state.breakTime,
        autoBreak: state.autoBreak,
        breakSound: state.breakSound
      }),
    }
  )
);

export default useSettingsStore;