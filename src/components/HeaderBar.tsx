import React from 'react';
import { Tile, TileColor } from '../types/okey';
import { TileView } from './TileView';
import { calculateOkeyTile, COLOR_NAMES } from '../utils/okeyEngine';
import {
  Users,
  Sparkles,
  Camera,
  RotateCw,
  History,
  HelpCircle,
  Smartphone,
} from 'lucide-react';

interface HeaderBarProps {
  playerCount: 2 | 3 | 4;
  onSelectPlayerCount: (count: 2 | 3 | 4) => void;
  indicator: Tile | null;
  onOpenIndicatorPicker: () => void;
  onOpenIndicatorCamera: () => void;
  onNewGame: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenApkGuide: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  playerCount,
  onSelectPlayerCount,
  indicator,
  onOpenIndicatorPicker,
  onOpenIndicatorCamera,
  onNewGame,
  onOpenHistory,
  historyCount,
  onOpenApkGuide,
}) => {
  const okey = calculateOkeyTile(indicator);

  const okeyTilePreview: Tile | null = okey
    ? {
        id: 'okey-preview',
        color: okey.color,
        value: okey.value,
      }
    : null;

  return (
    <header className="bg-[#0e2118] border-b border-[#214232] shadow-xl sticky top-0 z-40">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-md border border-amber-300">
            <span className="text-lg">🎴</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Okey Asistanı</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/40">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium hidden sm:block">
              Gerçek Zamanlı El & Taş Takip Sistemi
            </p>
          </div>
        </div>

        {/* Player Count & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Player Count Selector */}
          <div className="flex items-center bg-[#07140f] p-0.5 rounded-xl border border-[#1b3a2c]">
            {([2, 3, 4] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onSelectPlayerCount(cnt)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                  playerCount === cnt
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={`${cnt} Kişilik Oyun`}
              >
                <Users className="w-3 h-3 hidden sm:inline" />
                <span>{cnt}P</span>
              </button>
            ))}
          </div>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative p-2 bg-[#142d21] hover:bg-[#1b3a2c] text-neutral-300 hover:text-amber-200 rounded-xl border border-[#264b38] transition-colors"
            title="Hamle Geçmişi"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-neutral-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* APK / Download Guide Button */}
          <button
            type="button"
            onClick={onOpenApkGuide}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-[#142d21] hover:bg-[#1f4733] text-emerald-300 hover:text-emerald-200 text-xs font-bold rounded-xl border border-[#264b38] flex items-center gap-1.5 transition-colors"
            title="Android APK / Telefona Yükle"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">APK Yükle</span>
          </button>

          {/* New Game Button */}
          <button
            type="button"
            onClick={onNewGame}
            className="p-2 sm:px-3 sm:py-1.5 bg-[#1b3a2c] hover:bg-[#25503c] text-amber-300 text-xs font-bold rounded-xl border border-[#2e5d46] flex items-center gap-1.5 transition-colors"
            title="Yeni Oyun Başlat"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yeni Oyun</span>
          </button>
        </div>
      </div>

      {/* GÖSTERGE & OKEY DİNAMİK BANNER */}
      <div className="bg-[#091711] border-t border-[#183627] px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          {/* Gösterge Box */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 whitespace-nowrap">
              Gösterge Taşı:
            </span>
            {indicator ? (
              <div className="flex items-center gap-1.5">
                <TileView tile={indicator} size="xs" />
                <button
                  type="button"
                  onClick={onOpenIndicatorPicker}
                  className="text-[11px] text-amber-300 hover:underline font-semibold"
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenIndicatorPicker}
                  className="px-2 py-0.5 bg-[#142d21] hover:bg-[#1c3e2e] text-neutral-200 text-xs font-semibold rounded-lg border border-[#264b38]"
                >
                  Elle Seç
                </button>
                <button
                  type="button"
                  onClick={onOpenIndicatorCamera}
                  className="p-1 bg-[#142d21] hover:bg-[#1c3e2e] text-amber-300 rounded-lg border border-[#264b38]"
                  title="Kamera ile Gösterge Tara"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Okey Result Box */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1c3e2e]">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-400 text-amber-400" />
              OKEY:
            </span>
            {okeyTilePreview ? (
              <div className="flex items-center gap-1.5">
                <TileView tile={okeyTilePreview} size="xs" isOkey={true} />
                <span className="text-xs font-extrabold text-white">
                  {COLOR_NAMES[okeyTilePreview.color]} {okeyTilePreview.value}
                </span>
                <span className="text-[10px] text-emerald-400 hidden md:inline ml-1 font-medium bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Sahte Okey oyunda {COLOR_NAMES[okeyTilePreview.color]} {okeyTilePreview.value} olarak oynar
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">
                (Gösterge seçilmedi)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
