import React, { useState, useEffect } from 'react'
import { Timer, User, Info, Lock, Volume2, Shield, RefreshCw, Loader2 } from 'lucide-react'
import useSettingsStore from '../store/useAyarlarStore'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'
import packageJson from '../../../../package.json'

const Ayarlar = () => {
  const [activeTab, setActiveTab] = useState('pomo')

  // ================= STORES =================
  const { focusTime, breakTime, autoBreak, breakSound, getSettings, setSetting } =
    useSettingsStore()
  const { user, updateUser, isLoading, handleCheckUpdate } = useAppStore() // Global loading (Hesap için)

  // Zamanlayıcı kayıt işlemi için lokal loading state'i
  const [isSavingTimer, setIsSavingTimer] = useState(false)

  useEffect(() => {
    getSettings()
  }, [getSettings])

  const [formData, setFormData] = useState({
    displayName: '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
    profileImage: null,
    profilePreview: null,
    focusTime: 0,
    breakTime: 0,
    autoBreak: false,
    breakSound: false
  })

  useEffect(() => {
    setFormData((prev) => {
      // KRİTİK DÜZELTME: Eğer kullanıcı yeni bir dosya seçtiyse (profileImage doluysa),
      // ekrandaki önizlemeyi (preview) sakın backend'den gelen eski resimle ezme!
      const currentAvatar = user?.avatar || user?.profile || null
      const safeProfilePreview = prev.profileImage ? prev.profilePreview : currentAvatar

      return {
        ...prev,
        // İsim alanında da aynı mantık: Eğer henüz boşsa store'dan al, kullanıcı sildiyse dokunma
        displayName: prev.displayName || user?.displayName || user?.username || '',

        // Korumaya aldığımız resmi veriyoruz
        profilePreview: safeProfilePreview,

        // Zamanlayıcı değerleri ilk başta 0 olduğu için 0'sa store'dan al diyoruz
        focusTime: prev.focusTime === 0 ? (focusTime ?? 0) : prev.focusTime,
        breakTime: prev.breakTime === 0 ? (breakTime ?? 0) : prev.breakTime,

        // Diğer boolean ayarlar
        autoBreak: autoBreak ?? false,
        breakSound: breakSound ?? false
      }
    })
  }, [user, focusTime, breakTime, autoBreak, breakSound])

  // Tüm input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNumberChange = (name, value) => {
    if (value === '') {
      setFormData((prev) => ({ ...prev, [name]: 0 }))
    } else {
      // parseInt başındaki 0'ları doğal olarak yutar
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }))
    }
  }

  // ================= DEĞİŞİKLİK KONTROLLERİ =================
  const isTimerChanged =
    formData.focusTime !== focusTime ||
    formData.breakTime !== breakTime ||
    formData.autoBreak !== autoBreak ||
    formData.breakSound !== breakSound

  const isDisplayNameChanged =
    formData.displayName.trim() !== (user?.displayName || user?.username || '')
  const isPasswordChanged =
    formData.currentPassword.trim() !== '' ||
    formData.newPassword.trim() !== '' ||
    formData.newPasswordConfirm.trim() !== ''
  const isProfileChanged = formData.profileImage !== null
  const isAccountChanged = isDisplayNameChanged || isPasswordChanged || isProfileChanged

  // GÖRÜNÜRLÜK KONTROLLERİ (İşlem sürerken butonların kaybolmasını engeller)
  const showTimerButtons = isTimerChanged || isSavingTimer
  const showAccountButtons = isAccountChanged || isLoading

  // ================= İŞLEM FONKSİYONLARI =================

  // ZAMANLAYICI İPTAL & KAYDET
  const handleCancelTimer = () => {
    setFormData((prev) => ({
      ...prev,
      focusTime: focusTime,
      breakTime: breakTime,
      autoBreak: autoBreak,
      breakSound: breakSound
    }))
  }

  const handleSaveTimer = async () => {
    setIsSavingTimer(true) // İşlemi başlat
    try {
      const promises = []

      if (formData.focusTime !== focusTime)
        promises.push(setSetting('focusTime', formData.focusTime))
      if (formData.breakTime !== breakTime)
        promises.push(setSetting('breakTime', formData.breakTime))
      if (formData.autoBreak !== autoBreak)
        promises.push(setSetting('autoBreak', formData.autoBreak))
      if (formData.breakSound !== breakSound)
        promises.push(setSetting('breakSound', formData.breakSound))

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    } finally {
      setIsSavingTimer(false) // Bittiğinde kapat
    }
  }

  // HESAP İPTAL & KAYDET
  const handleCancelAccount = () => {
    setFormData((prev) => ({
      ...prev,
      displayName: user?.displayName || user?.username || '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      profileImage: null,
      profilePreview: user?.avatar || user?.profile || null
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: file, profilePreview: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAccount = async () => {
    if (formData.newPassword && formData.newPassword !== formData.newPasswordConfirm) {
      toast.error('Yeni şifreler eşleşmiyor.')
      return
    }

    const payload = {}
    if (isDisplayNameChanged) payload.displayName = formData.displayName
    if (formData.currentPassword && formData.newPassword) {
      payload.currentPassword = formData.currentPassword
      payload.newPassword = formData.newPassword
    }
    if (isProfileChanged) payload.profile = formData.profilePreview

    if (Object.keys(payload).length > 0) {
      await updateUser(payload)
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
        profileImage: null
      }))
    }
  }

  const tabs = [
    { id: 'pomo', name: 'Zamanlayıcı', icon: <Timer size={18} /> },
    { id: 'hesap', name: 'Hesap', icon: <User size={18} /> },
    { id: 'hakkinda', name: 'Hakkında', icon: <Info size={18} /> }
  ]

  return (
    <div className="flex flex-col w-full h-full bg-transparent select-none">
      {/* ÜST MENÜ (TAB BAR) */}
      <div className="w-full border-b border-[#1f1f1f] pt-8 px-4 flex justify-center gap-8 md:gap-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center cursor-pointer gap-2 pb-4 px-2 border-b-2 transition-all duration-300 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-[#ef4444] text-[#ef4444]'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-[#333]'
              }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-y-auto p-6 md:p-5 flex justify-center items-start custom-scrollbar">
        <div className="w-full max-w-3xl">
          {/* ================= ZAMANLAYICI AYARLARI ================= */}
          {activeTab === 'pomo' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in zoom-in-[0.98] duration-500 ease-out">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white tracking-wide">
                  Zamanlayıcı Ayarları
                </h3>
                <p className="text-sm text-gray-500 mt-1">Çalışma ve mola sürelerini özelleştir.</p>
              </div>

              <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-2 space-y-1 shadow-lg">
                <div className="flex justify-between items-center p-4 rounded-xl hover:bg-[#111] transition-colors border border-transparent hover:border-[#222]">
                  <div>
                    <span className="block font-medium text-gray-200">Odak Süresi</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Ana çalışma seansı</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.focusTime === 0 ? '' : formData.focusTime} // <-- BURASI DEĞİŞTİ
                      onChange={(e) => handleNumberChange('focusTime', e.target.value)}
                      className="w-16 bg-black text-gray-200 text-center rounded-lg py-2 border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-gray-500 w-4 font-medium">dk</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl hover:bg-[#111] transition-colors border border-transparent hover:border-[#222]">
                  <div>
                    <span className="block font-medium text-gray-200">Mola</span>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      Odak sonrası dinlenme
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.breakTime === 0 ? '' : formData.breakTime} // <-- BURASI DEĞİŞTİ
                      onChange={(e) => handleNumberChange('breakTime', e.target.value)}
                      className="w-16 bg-black text-gray-200 text-center rounded-lg py-2 border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-gray-500 w-4 font-medium">dk</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1f1f1f] my-2"></div>

                <label className="flex justify-between items-center p-4 rounded-xl hover:bg-[#111] transition-colors border border-transparent hover:border-[#222] cursor-pointer group">
                  <div>
                    <span className="block font-medium text-gray-200 group-hover:text-white transition-colors">
                      Otomatik Molalar
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      Süre bittiğinde molayı kendi başlatır
                    </span>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      name="autoBreak"
                      checked={formData.autoBreak}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#0c0c0c] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-white peer-checked:bg-[#ef4444]"></div>
                  </div>
                </label>

                <label className="flex justify-between items-center p-4 rounded-xl hover:bg-[#111] transition-colors border border-transparent hover:border-[#222] cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-gray-400" />
                    <div>
                      <span className="block font-medium text-gray-200 group-hover:text-white transition-colors">
                        Mola Sesi
                      </span>
                      <span className="text-xs text-gray-500 block mt-0.5">
                        Süre bittiğinde uyarı sesi çal
                      </span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      name="breakSound"
                      checked={formData.breakSound}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#0c0c0c] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-white peer-checked:bg-[#ef4444]"></div>
                  </div>
                </label>
              </div>

              {/* ZAMANLAYICI KAYDET/İPTAL BUTONLARI */}
              <div className="pt-6 flex items-center justify-end h-10">
                <div
                  className={`flex gap-3 transition-all duration-300 ease-out
                  ${showTimerButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                >
                  <button
                    onClick={handleCancelTimer}
                    disabled={!showTimerButtons || isSavingTimer}
                    className="px-6 py-2.5 rounded-xl border border-[#333] text-gray-300 hover:bg-[#111] hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveTimer}
                    disabled={!showTimerButtons || isSavingTimer}
                    className={`px-6 py-2.5 rounded-xl bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all text-sm font-medium flex items-center justify-center gap-2
                      ${isSavingTimer ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-500 active:scale-[0.98]'}`}
                  >
                    {isSavingTimer ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Değişiklikleri Kaydet'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= KULLANICI İŞLEMLERİ ================= */}
          {activeTab === 'hesap' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in zoom-in-[0.98] duration-500 ease-out">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white tracking-wide">Hesap Ayarları</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Profil bilgilerini güncelle ve güvenliğini sağla.
                </p>
              </div>

              <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col md:flex-row gap-10 shadow-lg">
                {/* Sol Taraf: Profil Fotoğrafı */}
                <div className="flex flex-col items-center pt-2">
                  <label
                    htmlFor="profile-upload"
                    className="w-32 h-32 bg-[#111] rounded-full border border-[#222] hover:border-[#444] flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    {formData.profilePreview ? (
                      <img
                        src={formData.profilePreview}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-gray-500" size={48} />
                    )}
                  </label>
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="mt-4 text-[13px] text-gray-400/80 font-medium tracking-wide">
                    Profili değiştirmek için tıkla
                  </p>
                </div>

                {/* Sağ Taraf: Form Alanları */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <User size={16} /> Genel Bilgiler
                    </h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
                        Görünen Ad
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full bg-black text-gray-200 px-4 py-3 rounded-xl border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        value={user?.email || 'Yükleniyor...'}
                        disabled
                        className="w-full bg-black/40 text-gray-600 px-4 py-3 rounded-xl border border-[#1f1f1f] cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#1f1f1f] my-6"></div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Lock size={16} /> Şifre Değiştir
                    </h4>
                    <div>
                      <input
                        type="password"
                        name="currentPassword"
                        placeholder="Mevcut Şifre"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full bg-black text-gray-200 px-4 py-3 rounded-xl border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors placeholder:text-gray-700 mb-3"
                      />
                      <div className="flex gap-3">
                        <input
                          type="password"
                          name="newPassword"
                          placeholder="Yeni Şifre"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="flex-1 bg-black text-gray-200 px-4 py-3 rounded-xl border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors placeholder:text-gray-700"
                        />
                        <input
                          type="password"
                          name="newPasswordConfirm"
                          placeholder="Yeni Şifre (Tekrar)"
                          value={formData.newPasswordConfirm}
                          onChange={handleInputChange}
                          className="flex-1 bg-black text-gray-200 px-4 py-3 rounded-xl border border-[#222] focus:outline-none focus:border-[#ef4444] transition-colors placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HESAP KAYDET/İPTAL BUTONLARI */}
                  <div className="pt-4 flex items-center justify-end h-10">
                    <div
                      className={`flex gap-3 transition-all duration-300 ease-out
                      ${showAccountButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                    >
                      <button
                        onClick={handleCancelAccount}
                        disabled={!showAccountButtons || isLoading}
                        className="px-6 py-2.5 rounded-xl border border-[#333] text-gray-300 hover:bg-[#111] hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleSaveAccount}
                        disabled={!showAccountButtons || isLoading}
                        className={`px-6 py-2.5 rounded-xl bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all text-sm font-medium flex items-center justify-center gap-2
                      ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-500 active:scale-[0.98]'}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          'Değişiklikleri Kaydet'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= HAKKINDA ================= */}
          {activeTab === 'hakkinda' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in zoom-in-[0.98] duration-500 ease-out">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white tracking-wide">PomoV1 Hakkında</h3>
              </div>
              <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#ef4444] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[2rem] flex items-center justify-center border border-[#222] shadow-2xl mb-6 shadow-[#ef4444]/5">
                  <Timer className="text-[#ef4444]" size={48} strokeWidth={1.5} />
                </div>
                <h4 className="text-2xl font-black text-white tracking-tight">PomoV1</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#111] border border-[#222] text-gray-400 px-3 py-1 rounded-full text-xs font-mono">
                    v{packageJson.version}
                  </span>
                  <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Shield size={12} /> Güncel
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-6 max-w-sm leading-relaxed">
                  Odaklanmanı artırmak için tasarlandı. Masaüstü bildirimleri ve pürüzsüz arayüzü
                  ile kesintisiz bir deneyim sunar.
                </p>
                <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-[#222] to-transparent my-8"></div>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button className="flex items-center justify-center cursor-pointer gap-2 w-full bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-gray-300 px-6 py-3 rounded-xl transition-all active:scale-[0.98] text-sm font-medium group"
                  onClick={() => handleCheckUpdate()}>
                    <RefreshCw
                      size={16}
                      className="group-hover:rotate-180 transition-transform duration-500"
                    />
                    Güncellemeleri Kontrol Et
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-2">
                    <Shield size={14} className="text-gray-500" />
                    <span>Otomatik güncellemeler aktiftir.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ayarlar
