export default function CrmCustomerCard() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 p-4">
      
      {/* ANA KART KAPSAYICISI (Wrapper) */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-3xl overflow-hidden">
        
        {/* 1. HEADER (ÜST KISIM) - Flexbox ile Sağ-Sol Dağılımı */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100">
          
          <div className="flex gap-4 items-center">
            {/* Profil Avatarı */}
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
              AE
            </div>
            {/* İsim ve Etiket */}
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">Akif Enes</h2>
              <span className="text-sm text-slate-500">Kurumsal Müşteri</span>
            </div>
          </div>

          {/* Durum Rozeti (Badge) */}
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
            Aktif
          </span>

        </div>

        {/* 2. BODY (ORTA KISIM / İSTATİSTİKLER) - Grid Mimarisi ve Mobil Uyumluluk */}
        {/* Mobilde 1 kolon (alt alta), sm ve üzeri ekranlarda 3 kolon (yan yana) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div className="p-5 flex flex-col justify-center items-center sm:items-start">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Son Sipariş</span>
            <span className="mt-1 text-lg font-semibold text-slate-800">Su Arıtma Sistemi</span>
          </div>

          <div className="p-5 flex flex-col justify-center items-center sm:items-start">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Toplam Harcama</span>
            <span className="mt-1 text-lg font-semibold text-slate-800">₺18.500</span>
          </div>

          <div className="p-5 flex flex-col justify-center items-center sm:items-start">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kayıt Tarihi</span>
            <span className="mt-1 text-lg font-semibold text-slate-800">23 Tem 2026</span>
          </div>

        </div>

        {/* 3. FOOTER (ALT KISIM / BUTONLAR) - Flexbox ile Sağa Yaslama */}
        <div className="p-5 bg-white flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
          <button className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto">
            Profili Düzenle
          </button>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors w-full sm:w-auto">
            Fatura Kes
          </button>
        </div>

      </div>

    </div>
  );
}