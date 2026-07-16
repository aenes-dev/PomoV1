import { create } from 'zustand';
import api from '../api/axiosInstance';
import useAppStore from './useAppStore';
import toast from 'react-hot-toast';

const useFriendStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  isLoadingFriends: true, // Başlangıçta true yapıyoruz ki ilk açılışta skeleton gösterilsin

  fetchFriendsAndRequests: async () => {
    set({ isLoadingFriends: true }); // İstek başladığında yükleniyor durumuna geçir
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests')
      ]);
      set({ 
        friends: friendsRes.data.friends, 
        pendingRequests: requestsRes.data.requests 
      });


    } catch (error) {
      console.error('Veriler çekilemedi', error);
      toast.error('Arkadaş listesi yüklenirken bir sorun oluştu.');
    } finally {
      // Hata da olsa, başarılı da olsa işlem bitince loading'i kapat
      set({ isLoadingFriends: false }); 
    }
  },

  // İstek Gönder (Toast bildirimi Sidebar.jsx içinden tetikleniyor)
  sendRequest: async (username) => {
    try {
      const res = await api.post('/friends/request', { username });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Bir hata oluştu.' };
    }
  },

  respondToRequest: async (requestId, status) => {
    try {
      await api.put(`/friends/request/${requestId}`, { status });
      get().fetchFriendsAndRequests();
      return true;
    } catch (error) {
      toast.error('İsteğe yanıt verirken bir ağ hatası oluştu.');
      return false;
    }
  },

  removeFriend: async (friendId) => {
    try {
      const res = await api.delete(`/friends/remove/${friendId}`); 
      await get().fetchFriendsAndRequests();
      return true; // İşlem başarılı
    } catch (error) {
      toast.error(error.response?.data?.message || 'Arkadaş silinirken hata oluştu.');
      return false; // İşlem başarısız
    }
  },

  initSocketListeners: () => {
    const socket = useAppStore.getState().socket;
    if (!socket) return;

    socket.off('new_friend_request'); // Çift dinlemeyi önlemek için
    socket.off('request_accepted');

    // Biri bize istek attığında
    socket.on('new_friend_request', (requestData) => {
      set((state) => ({
        pendingRequests: [...state.pendingRequests, requestData]
      }));
      // Anında Toast bildirimi patlat!
      toast(`Yeni bir arkadaşlık isteğin var!`, { icon: '🔔' });
    });

    // Biri isteğimizi kabul ettiğinde
    socket.on('request_accepted', () => {
      get().fetchFriendsAndRequests();
      // Anında Toast bildirimi patlat!
      toast.success('Bir arkadaşlık isteğin kabul edildi!');
    });

    socket.on('friend_removed', () => {
      get().fetchFriendsAndRequests();
    });

    
    socket.on('send_request', () => {
      console.log('istek geldi.')
      get().fetchFriendsAndRequests();
    });

socket.on('user_status_update', ({ userId, status }) => {
  
  set((state) => ({
    friends: state.friends.map(f => 
      f._id === userId 
        ? { 
            ...f, 
            status: status.status !== undefined ? status.status : f.status,
            focusStatus: status.focusStatus !== undefined ? status.focusStatus : f.focusStatus 
          } 
        : f
    )
  }));
});
}


}));

export default useFriendStore;