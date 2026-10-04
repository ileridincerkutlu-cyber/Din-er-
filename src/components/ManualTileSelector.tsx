import React, { useState } from 'react';
import { Tile, TileColor } from '../types/okey';
import { COLOR_NAMES } from '../utils/okeyEngine';
import { TileView } from './TileView';
import { X, Plus, Check } from 'lucide-react';

interface ManualTileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tile: Tile) => void;
  title?: string;
  subtitle?: string;
  multiAdd?: boolean;
}

export const ManualTileSelector: React.FC<ManualTileSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Taş Seçin',
  subtitle = 'Renk ve sayıyı seçerek onaylayın',
  multiAdd = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<TileColor>('red');
  const [selectedValue, setSelectedValue] = useState<number>(1);
  const [recentAdded, setRecentAdded] = useState<Tile[]>([]);

  if (!isOpen) return null;

  const colors: TileColor[] = ['red', 'yellow', 'blue', 'black'];

  const handleConfirm = (color: TileColor, value: number) => {
    const tile: Tile = {
      id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      color,
      value,
      isFakeOkey: color === 'fake',
    };
    onSelect(tile);
    setRecentAdded((prev) => [tile, ...prev].slice(0, 8));
    if (!multiAdd) {
      onClose();
    }
  };

  const currentPreviewTile: Tile = {
    id: 'preview',
    color: selectedColor,
    value: selectedColor === 'fake' ? 0 : selectedValue,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#132a20] border-t sm:border border-[#2a503d] rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#214232]">
          <div>
            <h3 className="text-lg font-bold text-amber-200">{title}</h3>
            <p className="text-xs text-emerald-300/80">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Preview */}
        <div className="flex items-center justify-center gap-4 my-4 p-3 bg-[#0d2018] rounded-xl border border-[#214232]">
          <TileView tile={currentPreviewTile} size="lg" />
          <div className="text-left">
            <div className="text-xs text-neutral-400">Seçilen Taş</div>
            <div className="text-base font-bold text-white">
              {COLOR_NAMES[selectedColor]} {selectedColor === 'fake' ? '' : selectedValue}
            </div>
            {multiAdd && (
              <div className="text-[11px] text-emerald-400 mt-0.5">
                Dokunduğunuz taş anında eklenir
              </div>
            )}
          </div>
        </div>

        {/* Color Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
            Taş Rengi
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              const colorBg =
                c === 'red'
                  ? 'bg-red-600'
                  : c === 'yellow'
                  ? 'bg-amber-500'
                  : c === 'blue'
                  ? 'bg-sky-600'
                  : 'bg-neutral-800';
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold ${
                    isSelected
                      ? 'border-amber-400 bg-emerald-950/80 ring-2 ring-amber-400/40'
                      : 'border-[#214232] bg-[#0d2018] hover:bg-[#183528]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${colorBg} mb-1 shadow-xs`} />
                  <span>{COLOR_NAMES[c]}</span>
                </button>
              );
            })}
            {/* Sahte Okey */}
            <button
              type="button"
              onClick={() => {
                setSelectedColor('fake');
                setSelectedValue(0);
                if (multiAdd) handleConfirm('fake', 0);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold ${
                selectedColor === 'fake'
                  ? 'border-amber-400 bg-emerald-950/80 ring-2 ring-amber-400/40'
                  : 'border-[#214232] bg-[#0d2018] hover:bg-[#183528]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 mb-1 flex items-center justify-center text-[9px] text-amber-200">
                ★
              </span>
              <span>Sahte</span>
            </button>
          </div>
        </div>

        {/* Numbers 1-13 Keypad */}
        {selectedColor !== 'fake' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Sayı (1 - 13)
            </label>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedValue === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedValue(num);
                      if (multiAdd) {
                        handleConfirm(selectedColor, num);
                      }
                    }}
                    className={`h-11 rounded-xl text-base font-black border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-[#0d2018] text-neutral-100 border-[#214232] hover:bg-[#1b3a2c]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2 pt-2 border-t border-[#214232]">
          <button
            type="button"
            onClick={() => handleConfirm(selectedColor, selectedColor === 'fake' ? 0 : selectedValue)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-neutral-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {multiAdd ? <Plus className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span>{multiAdd ? 'Taşı Ekle (Devam Et)' : 'Seçimi Onayla'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-[#1b3a2c] hover:bg-[#234b39] text-neutral-200 font-semibold rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>

        {/* Recently Added list in multiAdd mode */}
        {multiAdd && recentAdded.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#214232]">
            <span className="text-[11px] text-neutral-400 block mb-1.5">Eklenen Taşlar:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {recentAdded.map((t, idx) => (
                <TileView key={`${t.id}-${idx}`} tile={t} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
