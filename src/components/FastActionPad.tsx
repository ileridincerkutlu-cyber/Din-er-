import React, { useState } from 'react';
import { Player, PlayerId, Tile } from '../types/okey';
import { TileView } from './TileView';
import { ManualTileSelector } from './ManualTileSelector';
import { COLOR_NAMES } from '../utils/okeyEngine';
import {
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  UserX,
  RotateCcw,
  Sparkles,
  Users,
  ChevronRight,
} from 'lucide-react';

interface FastActionPadProps {
  round: number;
  players: Player[];
  activePlayerId: PlayerId;
  myHand: Tile[];
  onDrawDeck: (tile?: Tile) => void;
  onDrawDiscard: (tile: Tile) => void;
  onUserDiscard: (tile: Tile) => void;
  onRivalTake: (rivalId: PlayerId, tile: Tile) => void;
  onRivalDiscard: (rivalId: PlayerId, tile: Tile) => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
  lastActionSummary?: string;
}

export const FastActionPad: React.FC<FastActionPadProps> = ({
  round,
  players,
  activePlayerId,
  myHand,
  onDrawDeck,
  onDrawDiscard,
  onUserDiscard,
  onRivalTake,
  onRivalDiscard,
  onUndoLastMove,
  canUndo,
  lastActionSummary,
}) => {
  // Modal states for tile pickers
  const [pickerMode, setPickerMode] = useState<
    'draw_deck' | 'draw_discard' | 'user_discard' | 'rival_take' | 'rival_discard' | null
  >(null);

  const [selectedRivalId, setSelectedRivalId] = useState<PlayerId>('rival_1');
  const [showHandPickerForDiscard, setShowHandPickerForDiscard] = useState(false);

  const rivals = players.filter((p) => !p.isUser);

  const handleTileSelected = (tile: Tile) => {
    if (pickerMode === 'draw_deck') {
      onDrawDeck(tile);
    } else if (pickerMode === 'draw_discard') {
      onDrawDiscard(tile);
    } else if (pickerMode === 'user_discard') {
      onUserDiscard(tile);
    } else if (pickerMode === 'rival_take') {
      onRivalTake(selectedRivalId, tile);
    } else if (pickerMode === 'rival_discard') {
      onRivalDiscard(selectedRivalId, tile);
    }
    setPickerMode(null);
  };

  return (
    <div className="space-y-4">
      {/* Game Turn & Status Banner */}
      <div className="flex items-center justify-between p-3 bg-[#0e2118] border border-[#214232] rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-sm">
            {round}
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-200">Tur {round}</div>
            <div className="text-[11px] text-emerald-400 font-medium truncate max-w-[200px] sm:max-w-xs">
              {lastActionSummary || 'Yeni hamle bekleniyor...'}
            </div>
          </div>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={onUndoLastMove}
            className="px-2.5 py-1.5 bg-[#173628] hover:bg-[#204936] text-amber-300 text-xs font-semibold rounded-xl border border-[#2b5e46] flex items-center gap-1 transition-all active:scale-95"
            title="Son hamleyi geri al"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Geri Al</span>
          </button>
        )}
      </div>

      {/* Target Rival Quick Switcher for Rival Actions */}
      <div className="flex items-center justify-between bg-[#11241c] p-2 rounded-xl border border-[#214232]">
        <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 ml-1">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          Aktif Rakip:
        </span>
        <div className="flex gap-1.5">
          {rivals.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRivalId(r.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedRivalId === r.id
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-[#0d2018] text-neutral-300 border border-[#214232] hover:bg-[#183628]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4 GIANT FAST-ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* BUTTON 1: [ TAŞ ÇEKTİM ] */}
        <div className="bg-gradient-to-br from-[#123625] to-[#0c2419] border border-[#295b42] rounded-2xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-neutral-400">BENİM HAMLEM</span>
              <span className="text-sm font-black text-white">TAŞ ÇEKTİM</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-300 mb-3">
            Desteden kapalı taş veya soldan atılan taşı elinize alın.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPickerMode('draw_deck')}
              className="py-2.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm text-center active:scale-95 transition-all"
            >
              Desteden
            </button>
            <button
              type="button"
              onClick={() => setPickerMode('draw_discard')}
              className="py-2.5 px-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-sm text-center active:scale-95 transition-all"
            >
              Yerden (Açık)
            </button>
          </div>
        </div>

        {/* BUTTON 2: [ TAŞ ATTIM ] */}
        <div className="bg-gradient-to-br from-[#3b1717] to-[#250d0d] border border-[#5c2828] rounded-2xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-red-300">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-neutral-400">BENİM HAMLEM</span>
              <span className="text-sm font-black text-white">TAŞ ATTIM</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-300 mb-3">
            Elinizden yere atılan taşı seçerek turu bitirin.
          </p>
          <button
            type="button"
            onClick={() => {
              if (myHand.length > 0) {
                setShowHandPickerForDiscard(true);
              } else {
                setPickerMode('user_discard');
              }
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Elimden Taş At</span>
          </button>
        </div>

        {/* BUTTON 3: [ RAKİP TAŞ ALDI ] */}
        <div className="bg-gradient-to-br from-[#1b2b3a] to-[#0f1d29] border border-[#2d4d6a] rounded-2xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-sky-300">
            <div className="p-2 bg-sky-500/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-neutral-400">
                {players.find((p) => p.id === selectedRivalId)?.name || 'RAKİP'}
              </span>
              <span className="text-sm font-black text-white">TAŞ ALDI</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-300 mb-3">
            Rakibin masadan açıkça aldığı taşı kaydedin (olasılıkları günceller).
          </p>
          <button
            type="button"
            onClick={() => setPickerMode('rival_take')}
            className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Yerden Aldığı Taş</span>
          </button>
        </div>

        {/* BUTTON 4: [ RAKİP TAŞ ATTI ] */}
        <div className="bg-gradient-to-br from-[#332212] to-[#211409] border border-[#5e3e20] rounded-2xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-amber-300">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <UserX className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-neutral-400">
                {players.find((p) => p.id === selectedRivalId)?.name || 'RAKİP'}
              </span>
              <span className="text-sm font-black text-white">TAŞ ATTI</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-300 mb-3">
            Rakip yere taş attığında seçin (havuzdan düşülür, analize girer).
          </p>
          <button
            type="button"
            onClick={() => setPickerMode('rival_discard')}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <UserX className="w-4 h-4" />
            <span>Yere Attığı Taş</span>
          </button>
        </div>
      </div>

      {/* MODAL: DISCARD FROM CURRENT HAND PICKER */}
      {showHandPickerForDiscard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#132a20] border-t sm:border border-[#2a503d] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#214232] mb-3">
              <div>
                <h3 className="font-bold text-amber-200 text-base">Hangi Taşı Attınız?</h3>
                <p className="text-xs text-neutral-400">Elinizdeki taşa dokunun, otomatik atılsın</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandPickerForDiscard(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg"
              >
                Kapat
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 bg-black/20 rounded-xl mb-4">
              {myHand.map((tile) => (
                <TileView
                  key={tile.id}
                  tile={tile}
                  size="md"
                  onClick={() => {
                    onUserDiscard(tile);
                    setShowHandPickerForDiscard(false);
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowHandPickerForDiscard(false);
                setPickerMode('user_discard');
              }}
              className="w-full py-2 text-xs text-neutral-300 hover:text-white text-center underline"
            >
              Taş elinizde değil mi? Listeden elle seçin
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL TILE SELECTOR FOR ACTION MODES */}
      <ManualTileSelector
        isOpen={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        onSelect={handleTileSelected}
        title={
          pickerMode === 'draw_deck'
            ? 'Desteden Çekilen Taş'
            : pickerMode === 'draw_discard'
            ? 'Yerden Alınan Taş'
            : pickerMode === 'user_discard'
            ? 'Yere Attığınız Taş'
            : pickerMode === 'rival_take'
            ? `${players.find((p) => p.id === selectedRivalId)?.name || 'Rakip'} - Yerden Aldığı Taş`
            : `${players.find((p) => p.id === selectedRivalId)?.name || 'Rakip'} - Yere Attığı Taş`
        }
        subtitle="Seçtiğiniz taş havuzdan ve ilgili oyuncunun kaydından otomatik işlenecektir."
      />
    </div>
  );
};
