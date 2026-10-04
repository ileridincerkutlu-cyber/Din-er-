import React, { useState, useEffect, useMemo } from 'react';
import {
  Tile,
  TileColor,
  Player,
  PlayerId,
  GameMove,
} from './types/okey';
import {
  calculateInventory,
  analyzeHand,
  sortHandByColor,
  sortHandByValue,
  calculateOkeyTile,
} from './utils/okeyEngine';
import { HeaderBar } from './components/HeaderBar';
import { RackView } from './components/RackView';
import { FastActionPad } from './components/FastActionPad';
import { RivalsTracker } from './components/RivalsTracker';
import { HandAnalysisSection } from './components/HandAnalysisSection';
import { InventoryMatrix } from './components/InventoryMatrix';
import { CameraTileScanner } from './components/CameraTileScanner';
import { ManualTileSelector } from './components/ManualTileSelector';
import { MoveHistoryDrawer } from './components/MoveHistoryDrawer';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import {
  Layers,
  Zap,
  Users,
  BarChart3,
  Grid,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

// Initial realistic default sample hand
const DEFAULT_INITIAL_HAND: Tile[] = [
  { id: 't-1', color: 'red', value: 7 },
  { id: 't-2', color: 'red', value: 8 },
  { id: 't-3', color: 'red', value: 9 },
  { id: 't-4', color: 'blue', value: 3 },
  { id: 't-5', color: 'blue', value: 4 },
  { id: 't-6', color: 'blue', value: 5 },
  { id: 't-7', color: 'yellow', value: 11 },
  { id: 't-8', color: 'yellow', value: 12 },
  { id: 't-9', color: 'yellow', value: 13 },
  { id: 't-10', color: 'black', value: 6 },
  { id: 't-11', color: 'red', value: 6 },
  { id: 't-12', color: 'yellow', value: 6 },
  { id: 't-13', color: 'black', value: 10 },
  { id: 't-14', color: 'yellow', value: 2 },
];

const DEFAULT_INDICATOR: Tile = {
  id: 'ind-default',
  color: 'yellow',
  value: 7,
};

export default function App() {
  // Navigation tabs
  type TabType = 'rack' | 'fast_action' | 'rivals' | 'analysis' | 'inventory';
  const [activeTab, setActiveTab] = useState<TabType>('rack');

  // Player count: 2, 3 or 4
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);

  // Indicator tile
  const [indicator, setIndicator] = useState<Tile | null>(DEFAULT_INDICATOR);

  // User's hand
  const [myHand, setMyHand] = useState<Tile[]>(DEFAULT_INITIAL_HAND);

  // Round / Turn number
  const [round, setRound] = useState<number>(1);

  // Game move history
  const [history, setHistory] = useState<GameMove[]>([]);

  // Active player for turn tracking
  const [activePlayerId, setActivePlayerId] = useState<PlayerId>('user');

  // Modal controls
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'hand' | 'indicator' | 'discard'>('hand');
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const [manualPickerPurpose, setManualPickerPurpose] = useState<'add_hand' | 'indicator'>('add_hand');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  // Players state
  const [players, setPlayers] = useState<Player[]>([
    { id: 'user', name: 'Ben', takenTiles: [], discardedTiles: [], isUser: true },
    { id: 'rival_1', name: 'Rakip 1', takenTiles: [], discardedTiles: [], isUser: false },
    { id: 'rival_2', name: 'Rakip 2', takenTiles: [], discardedTiles: [], isUser: false },
    { id: 'rival_3', name: 'Rakip 3', takenTiles: [], discardedTiles: [], isUser: false },
  ]);

  // Adjust players when playerCount changes
  const activePlayers = useMemo(() => {
    if (playerCount === 2) {
      return players.filter((p) => p.id === 'user' || p.id === 'rival_1');
    }
    if (playerCount === 3) {
      return players.filter((p) => p.id === 'user' || p.id === 'rival_1' || p.id === 'rival_2');
    }
    return players;
  }, [players, playerCount]);

  // Next rival (the player to the user's right who takes user's discards)
  const nextRival = useMemo(() => {
    return activePlayers.find((p) => p.id === 'rival_1');
  }, [activePlayers]);

  // Recalculate 106-tile inventory
  const inventory = useMemo(() => {
    return calculateInventory(myHand, activePlayers, indicator);
  }, [myHand, activePlayers, indicator]);

  // Recalculate Hand Analysis
  const handAnalysis = useMemo(() => {
    return analyzeHand(
      myHand,
      indicator,
      inventory,
      nextRival,
      activePlayers.filter((p) => !p.isUser)
    );
  }, [myHand, indicator, inventory, nextRival, activePlayers]);

  // --- ACTIONS ---

  const handleSelectPlayerCount = (cnt: 2 | 3 | 4) => {
    setPlayerCount(cnt);
  };

  const handleNewGame = () => {
    setShowNewGameConfirm(true);
  };

  const confirmNewGame = () => {
    setMyHand([]);
    setIndicator(null);
    setRound(1);
    setHistory([]);
    setPlayers([
      { id: 'user', name: 'Ben', takenTiles: [], discardedTiles: [], isUser: true },
      { id: 'rival_1', name: 'Rakip 1', takenTiles: [], discardedTiles: [], isUser: false },
      { id: 'rival_2', name: 'Rakip 2', takenTiles: [], discardedTiles: [], isUser: false },
      { id: 'rival_3', name: 'Rakip 3', takenTiles: [], discardedTiles: [], isUser: false },
    ]);
    setShowNewGameConfirm(false);
  };

  // Add tile(s) to user hand
  const handleAddTilesToHand = (newTiles: Tile[]) => {
    setMyHand((prev) => [...prev, ...newTiles]);
    newTiles.forEach((t) => {
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}-${Math.random()}`,
          round,
          playerId: 'user',
          action: 'draw_deck',
          tile: t,
          text: `Elinize eklendi: ${t.color === 'fake' ? 'Sahte Okey' : `${t.color} ${t.value}`}`,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    });
  };

  // Discard tile from user hand
  const handleUserDiscard = (tile: Tile) => {
    // Remove one copy from hand
    setMyHand((prev) => {
      const idx = prev.findIndex((t) => t.id === tile.id || (t.color === tile.color && t.value === tile.value));
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });

    // Add to user discarded
    setPlayers((prev) =>
      prev.map((p) => (p.isUser ? { ...p, discardedTiles: [tile, ...p.discardedTiles] } : p))
    );

    // Record history
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        round,
        playerId: 'user',
        action: 'discard',
        tile,
        text: `Yere taş attı: ${tile.color === 'fake' ? 'Sahte Okey' : `${tile.color} ${tile.value}`}`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    // Next round progression
    setRound((r) => r + 1);
  };

  // User draws from deck
  const handleUserDrawDeck = (tile?: Tile) => {
    if (tile) {
      setMyHand((prev) => [...prev, tile]);
    }
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        round,
        playerId: 'user',
        action: 'draw_deck',
        tile,
        text: tile
          ? `Desteden çekti: ${tile.color === 'fake' ? 'Sahte Okey' : `${tile.color} ${tile.value}`}`
          : 'Desteden kapalı taş çekti',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // User draws from discard
  const handleUserDrawDiscard = (tile: Tile) => {
    setMyHand((prev) => [...prev, tile]);
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        round,
        playerId: 'user',
        action: 'draw_discard',
        tile,
        text: `Yerden açık taş aldı: ${tile.color === 'fake' ? 'Sahte Okey' : `${tile.color} ${tile.value}`}`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Rival takes a visible tile from table
  const handleRivalTake = (rivalId: PlayerId, tile: Tile) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === rivalId ? { ...p, takenTiles: [tile, ...p.takenTiles] } : p))
    );
    const rivalName = players.find((p) => p.id === rivalId)?.name || 'Rakip';
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        round,
        playerId: rivalId,
        action: 'draw_discard',
        tile,
        text: `${rivalName} yerden aldı: ${tile.color === 'fake' ? 'Sahte Okey' : `${tile.color} ${tile.value}`}`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Rival discards a tile to table
  const handleRivalDiscard = (rivalId: PlayerId, tile: Tile) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === rivalId ? { ...p, discardedTiles: [tile, ...p.discardedTiles] } : p))
    );
    const rivalName = players.find((p) => p.id === rivalId)?.name || 'Rakip';
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        round,
        playerId: rivalId,
        action: 'discard',
        tile,
        text: `${rivalName} yere attı: ${tile.color === 'fake' ? 'Sahte Okey' : `${tile.color} ${tile.value}`}`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[0];

    if (last.playerId === 'user') {
      if (last.action === 'discard' && last.tile) {
        // Return tile to hand, remove from discards
        setMyHand((prev) => [...prev, last.tile!]);
        setPlayers((prev) =>
          prev.map((p) =>
            p.isUser ? { ...p, discardedTiles: p.discardedTiles.filter((t) => t.id !== last.tile!.id) } : p
          )
        );
      } else if ((last.action === 'draw_deck' || last.action === 'draw_discard') && last.tile) {
        // Remove drawn tile from hand
        setMyHand((prev) => prev.filter((t) => t.id !== last.tile!.id));
      }
    } else {
      // Rival undo
      if (last.action === 'draw_discard' && last.tile) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === last.playerId ? { ...p, takenTiles: p.takenTiles.filter((t) => t.id !== last.tile!.id) } : p
          )
        );
      } else if (last.action === 'discard' && last.tile) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === last.playerId ? { ...p, discardedTiles: p.discardedTiles.filter((t) => t.id !== last.tile!.id) } : p
          )
        );
      }
    }

    setHistory((prev) => prev.slice(1));
  };

  // Sort handlers
  const handleSortByColor = () => {
    setMyHand((prev) => sortHandByColor(prev));
  };

  const handleSortByValue = () => {
    setMyHand((prev) => sortHandByValue(prev));
  };

  const handleSortByPairs = () => {
    // Sort so matching pairs sit side by side
    const pairIds = new Set<string>();
    const pairsGroup: Tile[] = [];
    const rest: Tile[] = [];

    for (let i = 0; i < myHand.length; i++) {
      if (pairIds.has(myHand[i].id)) continue;
      for (let j = i + 1; j < myHand.length; j++) {
        if (pairIds.has(myHand[j].id)) continue;
        if (myHand[i].color === myHand[j].color && myHand[i].value === myHand[j].value) {
          pairsGroup.push(myHand[i], myHand[j]);
          pairIds.add(myHand[i].id);
          pairIds.add(myHand[j].id);
          break;
        }
      }
    }

    myHand.forEach((t) => {
      if (!pairIds.has(t.id)) rest.push(t);
    });

    setMyHand([...pairsGroup, ...sortHandByColor(rest)]);
  };

  return (
    <div className="min-h-screen bg-[#091711] text-neutral-100 flex flex-col pb-20 sm:pb-6 selection:bg-amber-500 selection:text-neutral-950">
      {/* HEADER BAR */}
      <HeaderBar
        playerCount={playerCount}
        onSelectPlayerCount={handleSelectPlayerCount}
        indicator={indicator}
        onOpenIndicatorPicker={() => {
          setManualPickerPurpose('indicator');
          setIsManualPickerOpen(true);
        }}
        onOpenIndicatorCamera={() => {
          setCameraMode('indicator');
          setIsCameraOpen(true);
        }}
        onNewGame={handleNewGame}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* DESKTOP TAB NAVIGATION (SM+ SCREENS) */}
        <div className="hidden sm:flex items-center gap-2 p-1.5 bg-[#0e2219] border border-[#214232] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('rack')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rack'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>İstakam ({myHand.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fast_action')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'fast_action'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Hızlı Hamle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rivals')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rivals'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rakipler ({activePlayers.length - 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'analysis'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>El Analizi & Tavsiye</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Taş Envanteri (106)</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'rack' && (
            <div className="space-y-4">
              <RackView
                hand={myHand}
                indicator={indicator}
                onDiscardTile={handleUserDiscard}
                onRemoveTileFromHand={(id) => setMyHand((prev) => prev.filter((t) => t.id !== id))}
                onOpenAddModal={() => {
                  setManualPickerPurpose('add_hand');
                  setIsManualPickerOpen(true);
                }}
                onOpenCameraModal={() => {
                  setCameraMode('hand');
                  setIsCameraOpen(true);
                }}
                onSortByColor={handleSortByColor}
                onSortByValue={handleSortByValue}
                onSortByPairs={handleSortByPairs}
                onClearRack={() => setMyHand([])}
              />

              {/* Hand Analysis preview directly below rack for convenience */}
              {myHand.length > 0 && (
                <div className="pt-2 border-t border-[#183627]">
                  <HandAnalysisSection
                    hand={myHand}
                    indicator={indicator}
                    analysis={handAnalysis}
                    onDiscardTile={handleUserDiscard}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'fast_action' && (
            <FastActionPad
              round={round}
              players={activePlayers}
              activePlayerId={activePlayerId}
              myHand={myHand}
              onDrawDeck={handleUserDrawDeck}
              onDrawDiscard={handleUserDrawDiscard}
              onUserDiscard={handleUserDiscard}
              onRivalTake={handleRivalTake}
              onRivalDiscard={handleRivalDiscard}
              onUndoLastMove={handleUndo}
              canUndo={history.length > 0}
              lastActionSummary={history[0]?.text}
            />
          )}

          {activeTab === 'rivals' && (
            <RivalsTracker
              players={activePlayers}
              inventory={inventory}
              onRivalTake={handleRivalTake}
              onRivalDiscard={handleRivalDiscard}
            />
          )}

          {activeTab === 'analysis' && (
            <HandAnalysisSection
              hand={myHand}
              indicator={indicator}
              analysis={handAnalysis}
              onDiscardTile={handleUserDiscard}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryMatrix inventory={inventory} />
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom for mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a1811]/95 backdrop-blur-md border-t border-[#1d3d2c] px-1 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('rack')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'rack'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">İstakam</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fast_action')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'fast_action'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Hamle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rivals')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'rivals'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Rakipler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'analysis'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Analiz</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'inventory'
              ? 'text-amber-400 font-extrabold scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Masa (106)</span>
        </button>
      </nav>

      {/* CAMERA SCANNER MODAL */}
      <CameraTileScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        mode={cameraMode}
        title={
          cameraMode === 'indicator'
            ? 'Kamera ile Gösterge Taşını Tara'
            : 'Kamera ile İstakadaki Taşları Tara'
        }
        onTilesDetected={(detected) => {
          if (cameraMode === 'indicator') {
            if (detected.length > 0) {
              setIndicator(detected[0]);
            }
          } else {
            handleAddTilesToHand(detected);
          }
        }}
      />

      {/* MANUAL TILE SELECTOR MODAL */}
      <ManualTileSelector
        isOpen={isManualPickerOpen}
        onClose={() => setIsManualPickerOpen(false)}
        multiAdd={manualPickerPurpose === 'add_hand'}
        title={manualPickerPurpose === 'indicator' ? 'Gösterge Taşı Seçin' : 'İstakaya Taş Ekle'}
        subtitle={
          manualPickerPurpose === 'indicator'
            ? 'Okey taşı bu taşa göre otomatik hesaplanacaktır.'
            : 'Dokunduğunuz taşlar sırayla istakanıza eklenecektir.'
        }
        onSelect={(tile) => {
          if (manualPickerPurpose === 'indicator') {
            setIndicator(tile);
          } else {
            handleAddTilesToHand([tile]);
          }
        }}
      />

      {/* MOVE HISTORY DRAWER */}
      <MoveHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        players={activePlayers}
        onUndoLastMove={handleUndo}
        canUndo={history.length > 0}
        onClearHistory={() => setHistory([])}
      />

      {/* APK & ANDROID DOWNLOAD MODAL */}
      <ApkDownloadModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />

      {/* NEW GAME CONFIRMATION MODAL */}
      {showNewGameConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-5 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-lg">Yeni Oyun Başlatılsın mı?</h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mevcut istaka, rakiplerin taş hareketleri ve geçmiş sıfırlanacaktır.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={confirmNewGame}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Evet, Sıfırla
              </button>
              <button
                type="button"
                onClick={() => setShowNewGameConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-[#1b3a2c] hover:bg-[#25503c] text-neutral-200 font-semibold rounded-xl text-xs"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
