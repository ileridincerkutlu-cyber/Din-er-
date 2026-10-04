import React, { useState } from 'react';
import { Player, PlayerId, Tile, InventoryTileState } from '../types/okey';
import { TileView } from './TileView';
import { ManualTileSelector } from './ManualTileSelector';
import { analyzeRivalActions, COLOR_NAMES } from '../utils/okeyEngine';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface RivalsTrackerProps {
  players: Player[];
  inventory: Map<string, InventoryTileState>;
  onRivalTake: (rivalId: PlayerId, tile: Tile) => void;
  onRivalDiscard: (rivalId: PlayerId, tile: Tile) => void;
}

export const RivalsTracker: React.FC<RivalsTrackerProps> = ({
  players,
  inventory,
  onRivalTake,
  onRivalDiscard,
}) => {
  const rivals = players.filter((p) => !p.isUser);
  const [activeTabId, setActiveTabId] = useState<PlayerId>(rivals[0]?.id || 'rival_1');

  // Quick picker for adding tile directly in the rival tab
  const [pickerConfig, setPickerConfig] = useState<{
    rivalId: PlayerId;
    action: 'take' | 'discard';
  } | null>(null);

  const activeRival = rivals.find((r) => r.id === activeTabId) || rivals[0];

  if (!activeRival) return null;

  const analysis = analyzeRivalActions(activeRival, inventory);

  return (
    <div className="space-y-4">
      {/* Rivals Tab Switcher */}
      <div className="flex gap-2 border-b border-[#214232] pb-2">
        {rivals.map((r, index) => {
          const isSelected = r.id === activeRival.id;
          const isNextRival = index === 0; // Usually Rakip 1 is to the right
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveTabId(r.id)}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'bg-[#0d2018] text-neutral-300 border border-[#214232] hover:bg-[#183628]'
              }`}
            >
              <span>{r.name}</span>
              <span className={`text-[10px] font-medium ${isSelected ? 'text-neutral-800' : 'text-neutral-400'}`}>
                {isNextRival ? 'Sağınızdaki Oyuncu' : `Rakip ${index + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE RIVAL CARD */}
      <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-xl space-y-4">
        {/* Profile Header & Quick Actions */}
        <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-200 text-base">{activeRival.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-neutral-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Aldığı: <strong>{activeRival.takenTiles.length}</strong>
                </span>
                <span className="text-neutral-500">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Attığı: <strong>{activeRival.discardedTiles.length}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPickerConfig({ rivalId: activeRival.id, action: 'take' })}
              className="py-1.5 px-2.5 bg-sky-700/80 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Aldı</span>
            </button>
            <button
              type="button"
              onClick={() => setPickerConfig({ rivalId: activeRival.id, action: 'discard' })}
              className="py-1.5 px-2.5 bg-amber-600/80 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Attı</span>
            </button>
          </div>
        </div>

        {/* SECTION: YERDEN ALDIĞI TAŞLAR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              Yerden Aldığı Taşlar ({activeRival.takenTiles.length})
            </span>
          </div>
          {activeRival.takenTiles.length === 0 ? (
            <div className="p-3 bg-[#0d2018] rounded-xl border border-[#1b3a2c] text-xs text-neutral-400 text-center">
              Bu oyuncu henüz masadan açık taş almadı (desteden kapalı çekiyor).
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto p-2 bg-[#0d2018] rounded-xl border border-[#1b3a2c]">
              {activeRival.takenTiles.map((tile, i) => (
                <TileView key={`${tile.id}-${i}`} tile={tile} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* SECTION: YERE ATTIĞI TAŞLAR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-red-400" />
              Yere Attığı Taşlar ({activeRival.discardedTiles.length})
            </span>
          </div>
          {activeRival.discardedTiles.length === 0 ? (
            <div className="p-3 bg-[#0d2018] rounded-xl border border-[#1b3a2c] text-xs text-neutral-400 text-center">
              Henüz yere atılan taş kaydedilmedi.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto p-2 bg-[#0d2018] rounded-xl border border-[#1b3a2c]">
              {activeRival.discardedTiles.map((tile, i) => (
                <TileView key={`${tile.id}-${i}`} tile={tile} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* SECTION: RAKİP OLASILIK ANALİZİ */}
        <div className="p-3.5 bg-gradient-to-br from-[#163325] to-[#0f241a] rounded-xl border border-[#2b5941] space-y-3">
          <div className="flex items-center justify-between border-b border-[#214232] pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold text-amber-200 uppercase tracking-wide">
                Görünen Hareketlerden Olasılık Analizi
              </span>
            </div>
            <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 text-[10px] font-bold rounded-full border border-amber-800">
              {analysis.riskAssessment}
            </span>
          </div>

          <div className="text-xs text-neutral-300 italic">
            &quot;{analysis.tendencyLabel}&quot;
          </div>

          {/* Likely needs */}
          {analysis.likelyRuns.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Muhtemel Per İhtiyaçları (Olasılık Tahmini):
              </div>
              <ul className="text-xs text-neutral-200 space-y-1 list-disc list-inside bg-black/20 p-2 rounded-lg">
                {analysis.likelyRuns.map((desc, idx) => (
                  <li key={idx} className="leading-tight text-emerald-300/90">
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unwanted / Safe Discards */}
          {analysis.unwantedTiles.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-neutral-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                İstemediği / Güvenli Olabilecek Taşlar (Attıklarına Göre):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.unwantedTiles.map((tName, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#0d2018] text-neutral-200 text-[11px] rounded-md border border-[#214232]"
                  >
                    {tName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer / Probability notice */}
          <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-1 border-t border-[#1b3a2c]">
            <HelpCircle className="w-3 h-3 text-neutral-500 shrink-0" />
            <span>
              Bu analiz kapalı taşları bilmez; yalnızca masadan alınan ve atılan taşların per kombinasyon olasılıklarına dayanır.
            </span>
          </div>
        </div>
      </div>

      {/* MODAL FOR DIRECT ADD */}
      {pickerConfig && (
        <ManualTileSelector
          isOpen={true}
          onClose={() => setPickerConfig(null)}
          onSelect={(tile) => {
            if (pickerConfig.action === 'take') {
              onRivalTake(pickerConfig.rivalId, tile);
            } else {
              onRivalDiscard(pickerConfig.rivalId, tile);
            }
            setPickerConfig(null);
          }}
          title={
            pickerConfig.action === 'take'
              ? `${activeRival.name} - Yerden Aldığı Taş`
              : `${activeRival.name} - Yere Attığı Taş`
          }
          subtitle="Taş havuzdan düşülecek ve olasılık analizi güncellenecektir."
        />
      )}
    </div>
  );
};
