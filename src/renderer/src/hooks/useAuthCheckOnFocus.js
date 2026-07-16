import { useEffect } from 'react';
import useAppStore from '../store/useAppStore'; // Kendi store yoluna göre uyarla

const useAuthCheckOnFocus = () => {
  // Hem checkAuth'u hem de user'ı store'dan çekiyoruz
  const { checkAuth, user, token } = useAppStore();
  useEffect(() => {
    const handleFocus = () => {
      // SADECE kullanıcı giriş yapmışsa (user != null) istek atsın
      if (document.visibilityState === 'visible' && user) {
        console.log('Kullanıcı aktif, oturum güncelleniyor...');
        checkAuth(); 
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth, user]); // user değiştikçe (giriş yapıldı/çıkış yapıldı) tetikleyici kendini günceller
};

export default useAuthCheckOnFocus;