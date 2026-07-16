import axios from 'axios';
// 1. KRİTİK: Kısır döngüyü kırmak için bu satırı SİLİYORUZ!
// import useAppStore from '../store/useAppStore'; 

export const controller = new AbortController();

const api = axios.create({
  baseURL: 'https://pomov1-backend.onrender.com/api',
});

api.interceptors.request.use(
  (config) => {
    let token = null;

    const storageData = localStorage.getItem('pomosync-timer-storage');
    
    if (storageData) {
      try {
        const parsedData = JSON.parse(storageData);
        token = parsedData.state.token; 
      } catch (error) {
        console.error("Zustand hafızası okunamadı", error);
      }
    }

    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.defaults.signal = controller.signal;

export default api;