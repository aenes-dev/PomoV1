import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // Yüklenme ikonu
import Titlebar from './components/Titlebar';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import AuthScreen from './components/AuthScreen';
import useAppStore from './store/useAppStore';
import Spinner from './components/Spinner';
import {Toaster} from 'react-hot-toast';
import AnnouncementsArea from './components/AnnouncementsArea';
import SuggestionsArea from './components/SuggestionsArea';
import useAuthCheckOnFocus from './hooks/useAuthCheckOnFocus';
import Ayarlar from './components/Ayarlar'

import Test from './components/Test'

function App() {
  const { user, checkAuth, isCheckingAuth, activeTab, isFullScreen } = useAppStore();
  
  const test = true

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  useAuthCheckOnFocus()


  if (isCheckingAuth) {
    return (
     <>
     <Spinner/>
     </>
    );
  }


  // if(test){
  //   return(
  //     <>
  //     <Test/>
  //     </>
  //   )
  // }


  return (
    <div className="dark">
      <Toaster 
    position="top-right" 
    toastOptions={{
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '12px',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      },
      success: {
        iconTheme: {
          primary: '#22c55e',
          secondary: '#1a1a1a',
        },
      },
      error: {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ef4444',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#1a1a1a',
        },
      },
    }} 
  />
      <div className="flex flex-col h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-white font-sans overflow-hidden">
        <Titlebar />
        
        <div className="flex flex-1 overflow-hidden">
          {!user ? (
            <AuthScreen />
          ) : (
            <>
              <Sidebar />
            {activeTab === 'timer' && <MainArea />}
          {activeTab === 'suggestion' && <SuggestionsArea />}
          {activeTab === 'announcements' && <AnnouncementsArea />}
          {activeTab === 'ayarlar' && <Ayarlar/>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 