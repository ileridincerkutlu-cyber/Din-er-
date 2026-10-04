export type TileColor = 'red' | 'blue' | 'black' | 'yellow' | 'fake';

export interface Tile {
  id: string;
  color: TileColor;
  value: number; // 1-13 (0 for fake okey)
  isFakeOkey?: boolean;
}

export type PlayerId = 'user' | 'rival_1' | 'rival_2' | 'rival_3';

export interface Player {
  id: PlayerId;
  name: string;
  takenTiles: Tile[];       // Yerden/açıktan aldığı taşlar
  discardedTiles: Tile[];   // Yere attığı taşlar
  isUser: boolean;
}

export type MoveActionType = 'draw_deck' | 'draw_discard' | 'discard' | 'hand_edit';

export interface GameMove {
  id: string;
  round: number;
  playerId: PlayerId;
  action: MoveActionType;
  tile?: Tile;
  text: string;
  timestamp: number;
}

export interface InventoryTileState {
  color: TileColor;
  value: number;
  key: string;
  total: number; // usually 2
  inMyHand: number;
  inDiscards: number;
  takenByRivals: number;
  remainingUnseen: number; // 2 - inMyHand - inDiscards - takenByRivals
}

export interface CompletedPer {
  id: string;
  type: 'run' | 'set';
  tiles: Tile[];
  description: string;
  containsOkey: boolean;
}

export interface PotentialPer {
  id: string;
  type: 'run_waiting' | 'set_waiting' | 'hole_run';
  currentTiles: Tile[];
  missingTiles: { color: TileColor; value: number; remainingInDeck: number }[];
  description: string;
  probabilityScore: number; // 0-100%
}

export interface DiscardAnalysis {
  tile: Tile;
  breakHandScore: number; // 0 (tamamen gereksiz/çöp) - 100 (per bozuyor)
  perLossRisk: string;
  rivalBenefitRisk: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  rivalBenefitReason: string;
  unseenCount: number;
  recommendation: 'Tavsiye Edilir' | 'Nötr / Atılabilir' | 'Riskli' | 'Sakla / Atma';
  recommendationLevel: 'safe' | 'neutral' | 'risky' | 'danger';
}

export interface HandAnalysisResult {
  completedPers: CompletedPer[];
  potentialPers: PotentialPer[];
  pairs: { tile1: Tile; tile2: Tile; name: string }[];
  deadwood: Tile[]; // per ve potansiyellere girmeyen serbest taşlar
  okeyPlacements: string[];
  handSummary: string;
  discardEvaluations: DiscardAnalysis[];
}
