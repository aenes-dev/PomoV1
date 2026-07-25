import React from 'react';
import { Minus, Square, X, Timer } from 'lucide-react';

const Titlebar = () => {
  // Electron'un ipcRenderer köprüsünü çağırıyoruz
  const handleMinimize = () => window.electron.ipcRenderer.send('window-minimize');
  const handleMaximize = () => window.electron.ipcRenderer.send('window-maximize');
  const handleClose = () => window.electron.ipcRenderer.send('window-close');

  return (
    <div 
      className="h-10 bg-gray-100 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 select-none z-50"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Timer size={16} className="text-red-500" />
        <span className="text-xs font-semibold tracking-wide">Pomo V1.1.1</span>
      </div>

      <div className="flex items-center gap-4 text-gray-500" style={{ WebkitAppRegion: 'no-drag' }}>
        <button onClick={handleMinimize} className="hover:text-gray-900 dark:hover:text-white transition-colors">
          <Minus size={16} />
        </button>
        <button onClick={handleMaximize} className="hover:text-gray-900 dark:hover:text-white transition-colors">
          <Square size={14} />
        </button>
        <button onClick={handleClose} className="hover:text-red-500 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Titlebar;