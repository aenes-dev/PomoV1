import { create } from 'zustand'
import { io } from 'socket.io-client'
import api, { controller } from '../api/axiosInstance.js'
import toast from 'react-hot-toast'
import { persist } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      socket: null,
      isLoading: false,
      isCheckingAuth: true,
      error: null,

      timeLeft: 0,
      endTime: null,
      isRunning: false,
      activityName: '',
      focusStatus: { isFocusing: false, activityName: 'Boşta' },

      isFullScreen: false,
      activeTab: sessionStorage.getItem('activeTab') || 'timer',

      setFullScreen: (status) => set({ isFullScreen: status }),
      setActiveTab: (tab) => {
        sessionStorage.setItem('activeTab', tab)
        set({ activeTab: tab })
      },

      setFocusStatus: (status) => {
        set({ focusStatus: status })
        const socket = get().socket
        if (socket && socket.connected) {
          socket.emit('status_update', status)
        }
      },

      startTimer: (seconds, name) => {
        const finalName = name || 'Odaklanıyor'
        set({
          timeLeft: seconds,
          endTime: Date.now() + seconds * 1000,
          isRunning: true,
          activityName: finalName
        })
        get().setFocusStatus({ isFocusing: true, activityName: finalName })
      },

      pauseTimer: () => {
        const { activityName } = get()
        set({ isRunning: false, endTime: null })
        get().setFocusStatus({
          isFocusing: false,
          activityName: `Duraklatıldı: ${activityName}`
        })
      },

      resumeTimer: () => {
        const { activityName, timeLeft } = get()
        set({
          isRunning: true,
          endTime: Date.now() + timeLeft * 1000
        })
        get().setFocusStatus({
          isFocusing: true,
          activityName: activityName
        })
      },

      stopTimer: () => {
        set({ isRunning: false, timeLeft: 0, activityName: '' })
        get().setFocusStatus({ isFocusing: false, activityName: 'Boşta' })
      },

      tick: () => {
        const { isRunning, endTime } = get()

        if (isRunning && endTime) {
          const now = Date.now()
          const remainingSeconds = Math.ceil((endTime - now) / 1000)

          if (remainingSeconds > 0) {
            set({ timeLeft: remainingSeconds })
          } else {
            get().stopTimer()
            toast.success('Süre doldu, harika iş çıkardın!')
          }
        }
      },

      // --- KİMLİK DOĞRULAMA (AUTH) İŞLEMLERİ ---
      checkAuth: async () => {
        let token = null

        // 2. Token'ı doğrudan Zustand'ın kaydettiği kasadan çekiyoruz
        const storageData = localStorage.getItem('pomosync-timer-storage')

        if (storageData) {
          try {
            const parsedData = JSON.parse(storageData)
            token = parsedData.state.token // Kasanın içindeki token'a ulaştık
            set({ token: token })
          } catch (error) {
            console.error('Zustand hafızası okunamadı', error)
          }
        }

        if (!token) {
          set({ user: null, isAuthenticated: false, isCheckingAuth: false })
          return
        }

        try {
          const response = await api.get('/auth/me')
          const userData = response.data.user || response.data

          set({ user: userData, isAuthenticated: true, isCheckingAuth: false })
          get().connectSocket()
        } catch (error) {
          // Eğer backend "Token geçersiz/Süresi dolmuş" (401 veya 403) derse SİL
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Token geçersiz, siliniyor...')
            set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false })
          } else {
            console.error('Sunucuya ulaşılamadı (Render uyanıyor olabilir), token korundu.')
            set({
              // Tokeni silmiyoruz, sadece oturum açılamadığını belirtiyoruz
              isCheckingAuth: false,
              error: 'Sunucuya bağlanılamadı, lütfen bekleyin.'
            })
          }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })

          const userData = response.data.user || response.data
          set({ user: userData, isAuthenticated: true, isLoading: false, token: userData.token })

          get().connectSocket()
          toast.success(`Hoş geldin, ${userData.username || 'Dostum'}! Odaklanmaya hazır mısın?`)
          return true
        } catch (error) {
          console.log(error)
          set({
            error: error.response?.data?.message || 'Giriş yapılamadı.',
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', { username, email, password })

          const userData = response.data.user || response.data
          set({ user: userData, token: userData.token, isAuthenticated: true, isLoading: false })

          get().connectSocket()
          toast.success('Aramıza hoş geldin! Hesabın başarıyla oluşturuldu.')
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Kayıt olunamadı.',
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },

      logout: async () => {
        controller.abort()

        set({ token: null, user: null, isAuthenticated: false, socket: null })
        sessionStorage.removeItem('activeTab')
        try {
          await api.post('/auth/logout')
        } catch (err) {
          console.error('Çıkış isteği sırasında hata:', err)
        }

        window.location.reload()
        const { socket } = get()
        if (socket) socket.disconnect()
      },

      updateUser: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.put('/settings/users/update', payload)
          console.log(response)
          
          if(response.status == 200){
          set((state) => ({
            user: { ...state.user, ...response.data }
          }))
          get().checkAuth()
          toast.success('Kullanıcı ayarları başarıyla güncellendi.')

          return { success: true }

        } else if(response.status == 400){
          toast.error(response.message)
        }
        } catch (error) {
             console.log(error.response)
             toast.error(error.response.data.message)
          return { success: false, message: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      // --- SOKET (GERÇEK ZAMANLI) İŞLEMLERİ ---
      connectSocket: () => {
        const { socket, token } = get()
        if (socket && socket.connected) return

        if (!token) return

        const newSocket = io('http://localhost:5000', {
          auth: { token: token },
          // transports: ['websocket'],
          secure: true
        })

        newSocket.on('connect', () => {
          // console.log('Soket başarıyla bağlandı!', newSocket.id);
        })

        newSocket.on('connect_error', (err) => {
          console.error('Soket hatası:', err.message)
        })

        set({ socket: newSocket })
      },


      handleCheckUpdate: async () => {
           if (window.api && window.api.checkForUpdates) {
      window.api.checkForUpdates()
      toast.success(
        'Güncellemeler kontrol ediliyor... İndirme başlarsa uygulama otomatik yenilenecektir.',
        {
          icon: '🔄',
          duration: 4000,
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
        }
      )
    } else {
      toast.error('Güncelleme sistemi şu an kullanılamıyor.', {
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }
      })
    }
      }
    }),
    {
      name: 'pomosync-timer-storage',
      partialize: (state) => ({
        token: state.token, // <-- BUNU EKLE
        timeLeft: state.timeLeft,
        endTime: state.endTime,
        isRunning: state.isRunning,
        activityName: state.activityName,
        focusStatus: state.focusStatus
      })
    }
  )
)

export default useAppStore
