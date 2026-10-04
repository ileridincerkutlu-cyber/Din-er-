import React, { useState } from 'react';
import { InventoryTileState, TileColor, Tile } from '../types/okey';
import { COLOR_NAMES, COLOR_CODES } from '../utils/okeyEngine';
import { TileView } from './TileView';
import { Layers, CheckCircle, Eye, HelpCircle, Filter } from 'lucide-react';

interface InventoryMatrixProps {
  inventory: Map<string, InventoryTileState>;
  onTileClick?: (tile: Tile) => void;
}

export const InventoryMatrix: React.FC<InventoryMatrixProps> = ({
  inventory,
  onTileClick,
}) => {
  const [selectedColorFilter, setSelectedColorFilter] = useState<TileColor | 'all'>('all');
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);

  const allEntries = Array.from(inventory.values());

  // Aggregate stats
  const totalTiles = 106;
  const inMyHandCount = allEntries.reduce((sum, e) => sum + e.inMyHand, 0);
  const inDiscardsCount = allEntries.reduce((sum, e) => sum + e.inDiscards, 0);
  const takenByRivalsCount = allEntries.reduce((sum, e) => sum + e.takenByRivals, 0);
  const remainingUnseenCount = allEntries.reduce((sum, e) => sum + e.remainingUnseen, 0);

  // Filter entries
  const filteredEntries = allEntries.filter((e) => {
    if (selectedColorFilter !== 'all' && e.color !== selectedColorFilter) {
      return false;
    }
    if (showOnlyRemaining && e.remainingUnseen === 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* OVERVIEW STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#11241c] border border-[#214232] rounded-2xl">
          <div className="text-[11px] font-bold text-neutral-400">Gizli / Kalan Taş</div>
          <div className="text-xl font-black text-amber-300 mt-0.5">
            {remainingUnseenCount} <span className="text-xs font-normal text-neutral-400">/ 106</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            %{Math.round((remainingUnseenCount / totalTiles) * 100)} havuzda
          </div>
        </div>

        <div className="p-3 bg-[#11241c] border border-[#214232] rounded-2xl">
          <div className="text-[11px] font-bold text-neutral-400">Elimdeki Taşlar</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{inMyHandCount}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">İstakanızda</div>
        </div>

        <div className="p-3 bg-[#11241c] border border-[#214232] rounded-2xl">
          <div className="text-[11px] font-bold text-neutral-400">Masada Açık / Yerde</div>
          <div className="text-xl font-black text-neutral-200 mt-0.5">{inDiscardsCount}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Atılmış taşlar</div>
        </div>

        <div className="p-3 bg-[#11241c] border border-[#214232] rounded-2xl">
          <div className="text-[11px] font-bold text-neutral-400">Rakiplerin Aldığı</div>
          <div className="text-xl font-black text-sky-300 mt-0.5">{takenByRivalsCount}</div>
          <div className="text-[10px] text-sky-400 mt-0.5">Bilinen ellerde</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0e2118] border border-[#214232] rounded-xl">
        {/* Color Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedColorFilter('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedColorFilter === 'all'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'bg-[#142d21] text-neutral-300 hover:bg-[#1b3a2c]'
            }`}
          >
            Tümü
          </button>
          {(['red', 'yellow', 'blue', 'black'] as TileColor[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColorFilter(c)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                selectedColorFilter === c
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-[#142d21] text-neutral-300 hover:bg-[#1b3a2c]'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  c === 'red'
                    ? 'bg-red-500'
                    : c === 'yellow'
                    ? 'bg-amber-400'
                    : c === 'blue'
                    ? 'bg-sky-500'
                    : 'bg-neutral-800'
                }`}
              />
              <span>{COLOR_NAMES[c]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedColorFilter('fake')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedColorFilter === 'fake'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'bg-[#142d21] text-neutral-300 hover:bg-[#1b3a2c]'
            }`}
          >
            ★ Sahte
          </button>
        </div>

        {/* Toggle remaining only */}
        <button
          type="button"
          onClick={() => setShowOnlyRemaining(!showOnlyRemaining)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
            showOnlyRemaining
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-[#142d21] text-neutral-400 border-[#214232]'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Sadece Kalanlar ({allEntries.filter((e) => e.remainingUnseen > 0).length})</span>
        </button>
      </div>

      {/* MATRIX GRID */}
      <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredEntries.map((item) => {
            const isDepleted = item.remainingUnseen === 0;
            const previewTile: Tile = {
              id: item.key,
              color: item.color,
              value: item.value,
              isFakeOkey: item.color === 'fake',
            };

            return (
              <div
                key={item.key}
                onClick={() => onTileClick && onTileClick(previewTile)}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isDepleted
                    ? 'bg-[#0a1610]/70 border-[#1a3327] opacity-50'
                    : 'bg-[#0e2219] border-[#224835] hover:border-amber-400/50 cursor-pointer'
                }`}
              >
                <TileView tile={previewTile} size="sm" />

                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <span
                      className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                        item.remainingUnseen === 2
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                          : item.remainingUnseen === 1
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                          : 'bg-red-950 text-red-400 border border-red-900 line-through'
                      }`}
                    >
                      {item.remainingUnseen} / 2 Kalan
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 space-y-0.5">
                    {item.inMyHand > 0 && (
                      <div className="text-emerald-400 font-medium">Elde: {item.inMyHand}</div>
                    )}
                    {item.inDiscards > 0 && <div>Yerde: {item.inDiscards}</div>}
                    {item.takenByRivals > 0 && (
                      <div className="text-sky-400">Rakipte: {item.takenByRivals}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
