import { create } from 'zustand';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  isLoading: true,
  isSubmitting: false,

  // Duyuruları Getir (GET)
  fetchAnnouncements: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        set({ announcements: res.data.announcements });
      }
    } catch (error) {
      toast.error('Duyurular yüklenirken hata oluştu.');
    } finally {
      set({ isLoading: false });
    }
  },

  // Yeni Duyuru Ekle (POST)
  createAnnouncement: async (formData) => {
    set({ isSubmitting: true });
    try {
      const res = await api.post('/announcements/create', formData);
      toast.success(res.data.message);
      await get().fetchAnnouncements(); // Listeyi otomatik tazele
      return true; // İşlem başarılı
    } catch (error) {
      toast.error(error.response?.data?.message || 'Duyuru eklenirken bir hata oluştu.');
      return false; // İşlem başarısız
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Duyuru Güncelle (PUT)
  updateAnnouncement: async (id, formData) => {
    set({ isSubmitting: true });
    try {
      const res = await api.put(`/announcements/update/${id}`, formData);
      toast.success(res.data.message);
      await get().fetchAnnouncements(); // Listeyi otomatik tazele
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Duyuru güncellenirken bir hata oluştu.');
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Duyuru Sil (DELETE)
  deleteAnnouncement: async (id) => {

    try {
      const res = await api.delete(`/announcements/delete/${id}`);
      toast.success(res.data.message);
      await get().fetchAnnouncements(); // Listeyi otomatik tazele
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silinirken hata oluştu.');
    }
  }
}));

export default useAnnouncementStore;