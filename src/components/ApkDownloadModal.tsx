import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setDeferredPrompt(null);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e2118] border border-[#214232] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f3f2f] bg-[#091711]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-amber-200 text-sm sm:text-base">
              Android İçin APK & Uygulama İndirme
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-neutral-200 text-xs sm:text-sm">
          {/* Quick PWA Install Button (if browser event available) */}
          {deferredPrompt && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 border border-emerald-500/50 rounded-xl flex items-center justify-between gap-3 shadow-lg">
              <div>
                <p className="font-bold text-emerald-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Tek Dokunuşla Telefona Yükle
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Tarayıcınız doğrudan APK benzeri native yüklemeyi destekliyor.
                </p>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-lg text-xs shrink-0 shadow-md transition-transform active:scale-95"
              >
                Yükle
              </button>
            </div>
          )}

          {installSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Uygulama telefonunuza başarıyla eklendi! Ana ekranınızdan açabilirsiniz.</span>
            </div>
          )}

          {/* Option 1: Chrome Ana Ekrana Ekle (WebAPK) */}
          <div className="p-4 bg-[#142d21] border border-[#264b38] rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>En Hızlı Yöntem: Chrome ile Telefona Yükleme (WebAPK)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Okey Asistanı, modern bir PWA (Progressive Web App) olarak kodlanmıştır. Android'de APK kurmaktan farksız çalışır; tam ekran açılır, kamerasını doğrudan kullanır ve telefonunuzun uygulama listesinde yer alır.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-300 pl-1">
              <li>Android telefonunuzda <strong>Google Chrome</strong> tarayıcısını açın.</li>
              <li>Sağ üst köşedeki <strong>üç noktaya (⋮)</strong> dokunun.</li>
              <li>Açılan menüde <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> butonuna dokunun.</li>
              <li>Telefonunuza APK gibi ikon eklenir ve tek dokunuşla tam ekran başlar.</li>
            </ol>
          </div>

          {/* Option 2: PWABuilder ile Gerçek .APK İndirme */}
          <div className="p-4 bg-[#142d21] border border-[#264b38] rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-xs flex items-center justify-center font-black">
                2
              </span>
              <span>Doğrudan .APK Dosyası Üretip İndirme (PWABuilder)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Telefonunuza resmi bir <strong>.apk</strong> kurulum dosyası indirmek istiyorsanız Microsoft'un resmi aracı PWABuilder ile 30 saniyede paketleyebilirsiniz:
            </p>
            <div className="space-y-1 text-xs text-neutral-300 pl-1">
              <p>1. Aşağıdaki bağlantıyı kopyalayın:</p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-black/40 border border-[#2a543f] px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-amber-200 select-all"
                />
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
              <p className="mt-2">
                2. <strong>pwabuilder.com</strong> sitesine gidin, kopyaladığınız linki yapıştırın ve <strong>"Package for Android"</strong> butonuna basarak doğrudan APK indirin.
              </p>
            </div>
            <a
              href={`https://www.pwabuilder.com?site=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f4733] hover:bg-[#285c42] text-amber-200 font-semibold rounded-lg text-xs border border-[#347453] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>PWABuilder'da Aç ve APK Paketle</span>
            </a>
          </div>

          {/* Android Avantajları */}
          <div className="p-3 bg-[#0d2018] rounded-xl border border-[#1b3a2c] flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-neutral-400">
              Telefonunuza yüklediğinizde kamera izni ve taş tanıma sistemi arka planda otomatik kaydedilir ve her açılışta hazır olur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1f3f2f] bg-[#091711] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
