import React from 'react';
import { GameMove, Player } from '../types/okey';
import { TileView } from './TileView';
import { RotateCcw, Clock, Trash2, X, History } from 'lucide-react';

interface MoveHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameMove[];
  players: Player[];
  onUndoLastMove: () => void;
  canUndo: boolean;
  onClearHistory: () => void;
}

export const MoveHistoryDrawer: React.FC<MoveHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  players,
  onUndoLastMove,
  canUndo,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  // Group moves by round
  const rounds: { round: number; moves: GameMove[] }[] = [];
  history.forEach((m) => {
    let group = rounds.find((r) => r.round === m.round);
    if (!group) {
      group = { round: m.round, moves: [] };
      rounds.push(group);
    }
    group.moves.push(m);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#11241c] border-t sm:border border-[#214232] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#214232]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-amber-200">Oyun Hamle Geçmişi</h3>
              <p className="text-xs text-neutral-400">Toplam {history.length} hamle kaydedildi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canUndo && (
              <button
                type="button"
                onClick={onUndoLastMove}
                className="px-2.5 py-1 bg-[#1b3a2c] hover:bg-[#25503c] text-amber-300 text-xs font-bold rounded-lg border border-[#2e5d46] flex items-center gap-1"
                title="Son hamleyi geri al"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Geri Al</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {rounds.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Henüz bir hamle kaydedilmedi. Taş çekme ve atma butonlarıyla oyun hamlelerini kaydetmeye başlayabilirsiniz.
            </div>
          ) : (
            rounds
              .slice()
              .reverse()
              .map((rnd) => (
                <div
                  key={rnd.round}
                  className="bg-[#0d2018] border border-[#214232] rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-1.5">
                    <span className="text-xs font-black text-amber-300">
                      TUR {rnd.round}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {rnd.moves.length} işlem
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {rnd.moves.map((move) => {
                      const player = players.find((p) => p.id === move.playerId);
                      const isUser = player?.isUser;
                      return (
                        <div
                          key={move.id}
                          className="flex items-center justify-between gap-2 p-1.5 bg-[#12281e] rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                                isUser
                                  ? 'bg-amber-400 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                              }`}
                            >
                              {player?.name || 'Oyuncu'}
                            </span>
                            <span className="text-neutral-200 font-medium">
                              {move.text}
                            </span>
                          </div>

                          {move.tile && (
                            <TileView tile={move.tile} size="xs" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-[#214232] flex justify-between items-center">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Geçmişi Temizle</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1b3a2c] text-white text-xs font-bold rounded-lg"
            >
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
