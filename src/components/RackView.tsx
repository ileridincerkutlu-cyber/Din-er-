import React, { useState } from 'react';
import { Tile } from '../types/okey';
import { TileView } from './TileView';
import { isTileOkey, COLOR_NAMES } from '../utils/okeyEngine';
import {
  Sparkles,
  ArrowDownUp,
  Palette,
  Hash,
  Copy,
  Plus,
  Camera,
  Trash2,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface RackViewProps {
  hand: Tile[];
  indicator: Tile | null;
  onDiscardTile: (tile: Tile) => void;
  onRemoveTileFromHand: (tileId: string) => void;
  onOpenAddModal: () => void;
  onOpenCameraModal: () => void;
  onSortByColor: () => void;
  onSortByValue: () => void;
  onSortByPairs: () => void;
  onClearRack: () => void;
}

export const RackView: React.FC<RackViewProps> = ({
  hand,
  indicator,
  onDiscardTile,
  onRemoveTileFromHand,
  onOpenAddModal,
  onOpenCameraModal,
  onSortByColor,
  onSortByValue,
  onSortByPairs,
  onClearRack,
}) => {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  const selectedTile = hand.find((t) => t.id === selectedTileId);

  // Divide tiles into 2 rows for realistic 2-shelf wooden Okey istaka
  const topShelf = hand.slice(0, Math.ceil(hand.length / 2));
  const bottomShelf = hand.slice(Math.ceil(hand.length / 2));

  return (
    <div className="space-y-3">
      {/* Top Controls & Status Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
            <span>İstakam</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-extrabold ${
                hand.length === 14
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : hand.length === 15
                  ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
              }`}
            >
              {hand.length} / 14 Taş {hand.length === 15 ? '(Taş Atınız)' : ''}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCameraModal}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all"
            title="Kamera ile İstakayı Tara"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kamera Tara</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-[#1b3a2c] hover:bg-[#234b39] text-emerald-300 font-semibold rounded-lg text-xs flex items-center gap-1 border border-[#2e5d46] transition-all"
            title="Elle Taş Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Taş Ekle</span>
          </button>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-neutral-400 mr-1 shrink-0 flex items-center gap-1">
          <ArrowDownUp className="w-3 h-3 text-neutral-500" />
          Dizilim:
        </span>
        <button
          type="button"
          onClick={onSortByColor}
          className="px-2 py-1 bg-[#0d2018] hover:bg-[#163325] text-neutral-200 rounded-md border border-[#214232] font-medium shrink-0 flex items-center gap-1"
        >
          <Palette className="w-3 h-3 text-amber-400" />
          Renk Perleri
        </button>
        <button
          type="button"
          onClick={onSortByValue}
          className="px-2 py-1 bg-[#0d2018] hover:bg-[#163325] text-neutral-200 rounded-md border border-[#214232] font-medium shrink-0 flex items-center gap-1"
        >
          <Hash className="w-3 h-3 text-sky-400" />
          Sayı Grupları
        </button>
        <button
          type="button"
          onClick={onSortByPairs}
          className="px-2 py-1 bg-[#0d2018] hover:bg-[#163325] text-neutral-200 rounded-md border border-[#214232] font-medium shrink-0 flex items-center gap-1"
        >
          <Copy className="w-3 h-3 text-emerald-400" />
          Çiftler
        </button>
        {hand.length > 0 && (
          <button
            type="button"
            onClick={onClearRack}
            className="ml-auto px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-md border border-red-800/50 font-medium shrink-0 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Boşalt
          </button>
        )}
      </div>

      {/* REALISTIC WOODEN OKEY RACK (İSTAKA) */}
      <div
        className="relative rounded-2xl p-3 sm:p-4 border-2 border-[#54381e] shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3d2411 0%, #2b190c 50%, #1c0e06 100%)',
          boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.15), 0 10px 25px -5px rgba(0,0,0,0.7)',
        }}
      >
        {/* Subtle wood grain line pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4a373_1px,transparent_1px)] [background-size:16px_16px]" />

        {hand.length === 0 ? (
          <div className="py-12 text-center text-neutral-300">
            <p className="text-sm font-semibold text-amber-200/90 mb-1">
              İstakanız şu an boş
            </p>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
              Kamera ile istakanızı tek dokunuşla tarayabilir veya taşları elle ekleyebilirsiniz.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onOpenCameraModal}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Kamera ile Tara
              </button>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#1b3a2c] text-emerald-300 text-xs font-bold rounded-xl border border-[#2e5d46] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Elle Taş Ekle
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Top Shelf */}
            <div className="relative bg-[#170e07]/80 rounded-xl p-2 border border-[#482c16] shadow-inner min-h-[76px] flex items-center overflow-x-auto">
              <div className="flex gap-2 min-w-full justify-start items-center">
                {topShelf.map((tile) => (
                  <TileView
                    key={tile.id}
                    tile={tile}
                    size="md"
                    isOkey={isTileOkey(tile, indicator)}
                    isSelected={selectedTileId === tile.id}
                    onClick={() =>
                      setSelectedTileId(selectedTileId === tile.id ? null : tile.id)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Shelf Divider / Wood lip */}
            <div className="h-1 bg-gradient-to-r from-[#442812] via-[#7d4e28] to-[#442812] rounded-full shadow-xs" />

            {/* Bottom Shelf */}
            <div className="relative bg-[#170e07]/80 rounded-xl p-2 border border-[#482c16] shadow-inner min-h-[76px] flex items-center overflow-x-auto">
              <div className="flex gap-2 min-w-full justify-start items-center">
                {bottomShelf.map((tile) => (
                  <TileView
                    key={tile.id}
                    tile={tile}
                    size="md"
                    isOkey={isTileOkey(tile, indicator)}
                    isSelected={selectedTileId === tile.id}
                    onClick={() =>
                      setSelectedTileId(selectedTileId === tile.id ? null : tile.id)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SELECTED TILE QUICK ACTION POPUP CARD */}
      {selectedTile && (
        <div className="p-3 bg-[#11241c] border border-amber-400/40 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <TileView
              tile={selectedTile}
              size="sm"
              isOkey={isTileOkey(selectedTile, indicator)}
            />
            <div>
              <div className="text-sm font-bold text-amber-200">
                {COLOR_NAMES[selectedTile.color]} {selectedTile.value || ''}
                {isTileOkey(selectedTile, indicator) && (
                  <span className="ml-1.5 text-xs text-emerald-400 font-extrabold">
                    ★ OKEY
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-300">
                Seçili taş: Bu taşı yere atabilir veya elden çıkarabilirsiniz.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onDiscardTile(selectedTile);
                setSelectedTileId(null);
              }}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Yere At</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onRemoveTileFromHand(selectedTile.id);
                setSelectedTileId(null);
              }}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700"
              title="İstakadan Kaldır"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
