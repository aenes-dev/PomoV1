import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  
  const { login, register, isLoading, error } = useAppStore();

  // Hata geldiğinde şık bir Toast fırlat (Zustand store'daki error değiştiğinde tetiklenir)
  useEffect(() => {
    if (error) {
      toast.error(error, {
        icon: '⚠️',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ef4444',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
        }
      });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.username, formData.email, formData.password);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden h-full">
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
            <Timer size={32} className="text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {isLogin ? 'PomoV1\'e Giriş Yap' : 'Aramıza Katıl'}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin ? 'Çalışma arkadaşların seni bekliyor.' : 'Odaklanma serüvenine hemen başla.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Kullanıcı Adı"
                  required={!isLogin}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors dark:text-white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="E-posta Adresi"
            required
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors dark:text-white"
          />
          
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Şifre"
            required
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors dark:text-white"
          />

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl py-3 shadow-lg shadow-red-500/30 transition-all flex justify-center items-center h-12 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => { 
              setIsLogin(!isLogin); 
              setFormData({ username: '', email: '', password: '' }); 
            }}
            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            {isLogin ? 'Hesabın yok mu? Kayıt ol.' : 'Zaten hesabın var mı? Giriş yap.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;