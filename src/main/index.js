import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const { autoUpdater } = require('electron-updater');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "PomoV1", 
    show: false,
    frame: false,
    fullscreen: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contentSecurityPolicy: "default-src 'self'; connect-src 'self' https://pomov1-backend.onrender.com;",
      sandbox: false,
      partition: 'persist:pomo_session'
    }
  })
  
  // mainWindow.webContents.openDevTools();
  
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', () => {
    mainWindow.webContents.session.flushStorageData()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- OTOMATİK GÜNCELLEME OLAYLARI (YENİ EKLENDİ) ---
autoUpdater.on('update-available', () => {
  console.log('Yeni bir güncelleme bulundu!');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Güncelleme indirildi, uygulama yeniden başlatılıyor...');
  autoUpdater.quitAndInstall(); // İndirme bitince kapatıp yeni sürümü kurar
});
// ---------------------------------------------------

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.close()
  })

  createWindow()

  // --- GÜNCELLEME KONTROLÜ (YENİ EKLENDİ) ---
  // Sadece geliştirme (dev) modunda değilsek güncellemeleri kontrol et.
  // Bu sayede sen kod yazarken gereksiz yere update hatası fırlatmaz.
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  // ------------------------------------------

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})