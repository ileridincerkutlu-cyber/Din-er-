import {
  Tile,
  TileColor,
  Player,
  InventoryTileState,
  CompletedPer,
  PotentialPer,
  DiscardAnalysis,
  HandAnalysisResult,
} from '../types/okey';

export const COLOR_NAMES: Record<TileColor, string> = {
  red: 'Kırmızı',
  blue: 'Mavi',
  black: 'Siyah',
  yellow: 'Sarı',
  fake: 'Sahte Okey',
};

export const COLOR_CODES: Record<TileColor, { bg: string; text: string; border: string; badge: string }> = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-500',
    badge: 'bg-red-950 text-red-300 border-red-800',
  },
  blue: {
    bg: 'bg-sky-500',
    text: 'text-sky-500',
    border: 'border-sky-500',
    badge: 'bg-sky-950 text-sky-300 border-sky-800',
  },
  black: {
    bg: 'bg-neutral-800',
    text: 'text-neutral-900',
    border: 'border-neutral-700',
    badge: 'bg-neutral-900 text-neutral-300 border-neutral-700',
  },
  yellow: {
    bg: 'bg-amber-400',
    text: 'text-amber-500',
    border: 'border-amber-400',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  fake: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
};

/**
 * Calculates the actual Okey tile based on the indicator.
 * In Turkish Okey:
 * Okey is the tile with the same color and number = (indicator.value % 13) + 1.
 * (e.g. Yellow 7 -> Okey is Yellow 8; Yellow 13 -> Okey is Yellow 1).
 */
export function calculateOkeyTile(indicator: Tile | null): { color: TileColor; value: number } | null {
  if (!indicator || indicator.color === 'fake') return null;
  const nextVal = indicator.value === 13 ? 1 : indicator.value + 1;
  return {
    color: indicator.color,
    value: nextVal,
  };
}

/**
 * Checks if a tile is the actual Okey (Wildcard)
 */
export function isTileOkey(tile: Tile, indicator: Tile | null): boolean {
  if (!indicator || tile.color === 'fake') return false;
  const okey = calculateOkeyTile(indicator);
  if (!okey) return false;
  return tile.color === okey.color && tile.value === okey.value;
}

/**
 * Generates an empty 106-tile inventory
 */
export function generateBaseInventory(): Map<string, InventoryTileState> {
  const map = new Map<string, InventoryTileState>();
  const colors: TileColor[] = ['red', 'blue', 'black', 'yellow'];

  colors.forEach((c) => {
    for (let v = 1; v <= 13; v++) {
      const key = `${c}-${v}`;
      map.set(key, {
        color: c,
        value: v,
        key,
        total: 2,
        inMyHand: 0,
        inDiscards: 0,
        takenByRivals: 0,
        remainingUnseen: 2,
      });
    }
  });

  // 2 Fake Okeys
  map.set('fake-0', {
    color: 'fake',
    value: 0,
    key: 'fake-0',
    total: 2,
    inMyHand: 0,
    inDiscards: 0,
    takenByRivals: 0,
    remainingUnseen: 2,
  });

  return map;
}

/**
 * Recalculates inventory state based on hand, discarded tiles, and rival taken tiles.
 */
export function calculateInventory(
  myHand: Tile[],
  players: Player[],
  indicator: Tile | null
): Map<string, InventoryTileState> {
  const inv = generateBaseInventory();

  const countTile = (t: Tile, field: 'inMyHand' | 'inDiscards' | 'takenByRivals') => {
    const key = t.color === 'fake' ? 'fake-0' : `${t.color}-${t.value}`;
    const entry = inv.get(key);
    if (entry) {
      entry[field] += 1;
      entry.remainingUnseen = Math.max(0, entry.total - entry.inMyHand - entry.inDiscards - entry.takenByRivals);
    }
  };

  // In user hand
  myHand.forEach((t) => countTile(t, 'inMyHand'));

  // In players discards
  players.forEach((p) => {
    p.discardedTiles.forEach((t) => countTile(t, 'inDiscards'));
  });

  // In rival hands (known because they took from discard pile)
  players.forEach((p) => {
    if (!p.isUser) {
      p.takenTiles.forEach((t) => countTile(t, 'takenByRivals'));
    }
  });

  // Count indicator as 1 seen on the table
  if (indicator) {
    const key = indicator.color === 'fake' ? 'fake-0' : `${indicator.color}-${indicator.value}`;
    const entry = inv.get(key);
    if (entry) {
      entry.inDiscards += 1;
      entry.remainingUnseen = Math.max(0, entry.total - entry.inMyHand - entry.inDiscards - entry.takenByRivals);
    }
  }

  return inv;
}

/**
 * Sorts hand by color and number
 */
export function sortHandByColor(hand: Tile[]): Tile[] {
  const colorOrder: Record<TileColor, number> = {
    red: 0,
    yellow: 1,
    blue: 2,
    black: 3,
    fake: 4,
  };

  return [...hand].sort((a, b) => {
    if (a.color !== b.color) {
      return colorOrder[a.color] - colorOrder[b.color];
    }
    return a.value - b.value;
  });
}

/**
 * Sorts hand by number and color
 */
export function sortHandByValue(hand: Tile[]): Tile[] {
  return [...hand].sort((a, b) => {
    if (a.value !== b.value) {
      return a.value - b.value;
    }
    return a.color.localeCompare(b.color);
  });
}

/**
 * Evaluates hand structure:
 * - Completed Runs (e.g. Red 5-6-7, Yellow 11-12-13-1)
 * - Completed Sets (e.g. Red 8, Blue 8, Black 8)
 * - Pairs (Çiftler)
 * - Incomplete runs and sets (Waiting lists with remaining outs)
 * - Discard evaluation
 */
export function analyzeHand(
  hand: Tile[],
  indicator: Tile | null,
  inventory: Map<string, InventoryTileState>,
  nextRival?: Player,
  allRivals: Player[] = []
): HandAnalysisResult {
  const okey = calculateOkeyTile(indicator);

  // Classify tiles: Wildcards vs Concrete
  const okeyTiles: Tile[] = [];
  const normalTiles: Tile[] = [];

  hand.forEach((t) => {
    if (isTileOkey(t, indicator)) {
      okeyTiles.push(t);
    } else if (t.color === 'fake') {
      // Fake okey plays as the original okey tile's color & value!
      if (okey) {
        normalTiles.push({
          ...t,
          color: okey.color,
          value: okey.value,
          isFakeOkey: true,
        });
      } else {
        normalTiles.push(t);
      }
    } else {
      normalTiles.push(t);
    }
  });

  const completedPers: CompletedPer[] = [];
  const usedTileIds = new Set<string>();

  // 1. Check Runs (Same color consecutive >= 3)
  const byColor: Record<TileColor, Tile[]> = {
    red: [],
    blue: [],
    black: [],
    yellow: [],
    fake: [],
  };

  normalTiles.forEach((t) => {
    if (byColor[t.color]) byColor[t.color].push(t);
  });

  Object.entries(byColor).forEach(([colorStr, tiles]) => {
    if (tiles.length < 3) return;
    const color = colorStr as TileColor;
    const sorted = [...tiles].sort((a, b) => a.value - b.value);

    // Remove duplicates for run building
    const uniqueValues: { val: number; tile: Tile }[] = [];
    sorted.forEach((t) => {
      if (!uniqueValues.some((uv) => uv.val === t.value)) {
        uniqueValues.push({ val: t.value, tile: t });
      }
    });

    // Special rule in Okey: 1 can follow 13 (e.g. 11-12-13-1 or 12-13-1)
    const has1 = uniqueValues.some((uv) => uv.val === 1);
    const has13 = uniqueValues.some((uv) => uv.val === 13);
    const has12 = uniqueValues.some((uv) => uv.val === 12);
    if (has1 && has13 && has12) {
      const tile1 = uniqueValues.find((uv) => uv.val === 1)!.tile;
      uniqueValues.push({ val: 14, tile: tile1 }); // 14 acts as wrap-around 1
    }

    let currentRun: Tile[] = [];
    for (let i = 0; i < uniqueValues.length; i++) {
      if (currentRun.length === 0) {
        currentRun.push(uniqueValues[i].tile);
      } else {
        const prevVal = uniqueValues[i - 1].val;
        const curVal = uniqueValues[i].val;
        if (curVal === prevVal + 1) {
          currentRun.push(uniqueValues[i].tile);
        } else {
          if (currentRun.length >= 3) {
            completedPers.push({
              id: `run-${color}-${currentRun[0].value}`,
              type: 'run',
              tiles: [...currentRun],
              description: `${COLOR_NAMES[color]} ${currentRun.map((x) => x.value).join('-')} Serisi`,
              containsOkey: false,
            });
            currentRun.forEach((t) => usedTileIds.add(t.id));
          }
          currentRun = [uniqueValues[i].tile];
        }
      }
    }
    if (currentRun.length >= 3) {
      completedPers.push({
        id: `run-${color}-${currentRun[0].value}`,
        type: 'run',
        tiles: [...currentRun],
        description: `${COLOR_NAMES[color]} ${currentRun.map((x) => x.value).join('-')} Serisi`,
        containsOkey: false,
      });
      currentRun.forEach((t) => usedTileIds.add(t.id));
    }
  });

  // 2. Check Sets (Same value, different colors >= 3)
  const byValue: Record<number, Tile[]> = {};
  normalTiles.forEach((t) => {
    if (!byValue[t.value]) byValue[t.value] = [];
    byValue[t.value].push(t);
  });

  Object.entries(byValue).forEach(([valStr, tiles]) => {
    const val = Number(valStr);
    // Unique colors only
    const uniqueColors: Tile[] = [];
    tiles.forEach((t) => {
      if (!uniqueColors.some((ut) => ut.color === t.color)) {
        uniqueColors.push(t);
      }
    });

    if (uniqueColors.length >= 3) {
      // Don't duplicate if already completely in run, unless set is better
      completedPers.push({
        id: `set-${val}`,
        type: 'set',
        tiles: uniqueColors,
        description: `${val}'li ${uniqueColors.map((t) => COLOR_NAMES[t.color]).join(', ')} Grubu`,
        containsOkey: false,
      });
      uniqueColors.forEach((t) => usedTileIds.add(t.id));
    }
  });

  // 3. Potential Pers (Waiting for 1 tile to make a run or set)
  const potentialPers: PotentialPer[] = [];

  // Consecutive incomplete runs (e.g. Yellow 5-6 -> needs 4 or 7)
  Object.entries(byColor).forEach(([colorStr, tiles]) => {
    const color = colorStr as TileColor;
    const sorted = [...tiles].sort((a, b) => a.value - b.value);
    for (let i = 0; i < sorted.length - 1; i++) {
      const t1 = sorted[i];
      const t2 = sorted[i + 1];

      // Direct neighbours (e.g. 5 and 6)
      if (t2.value === t1.value + 1) {
        const needed: { color: TileColor; value: number; remainingInDeck: number }[] = [];
        if (t1.value > 1) {
          const invKey = `${color}-${t1.value - 1}`;
          needed.push({
            color,
            value: t1.value - 1,
            remainingInDeck: inventory.get(invKey)?.remainingUnseen ?? 0,
          });
        }
        if (t2.value < 13) {
          const invKey = `${color}-${t2.value + 1}`;
          needed.push({
            color,
            value: t2.value + 1,
            remainingInDeck: inventory.get(invKey)?.remainingUnseen ?? 0,
          });
        }
        // If 12-13, 1 also wraps around!
        if (t1.value === 12 && t2.value === 13) {
          const invKey = `${color}-1`;
          needed.push({
            color,
            value: 1,
            remainingInDeck: inventory.get(invKey)?.remainingUnseen ?? 0,
          });
        }

        const totalOuts = needed.reduce((sum, n) => sum + n.remainingInDeck, 0);
        const score = Math.min(95, Math.round(totalOuts * 22));

        potentialPers.push({
          id: `pot-run-${color}-${t1.value}`,
          type: 'run_waiting',
          currentTiles: [t1, t2],
          missingTiles: needed,
          description: `${COLOR_NAMES[color]} ${t1.value}-${t2.value} (Açık Uçlu Seri)`,
          probabilityScore: score,
        });
      }

      // Inside gap / hole run (e.g. 5 and 7 -> needs 6)
      if (t2.value === t1.value + 2) {
        const midVal = t1.value + 1;
        const invKey = `${color}-${midVal}`;
        const remaining = inventory.get(invKey)?.remainingUnseen ?? 0;
        const score = Math.min(80, Math.round(remaining * 25));

        potentialPers.push({
          id: `pot-gap-${color}-${t1.value}`,
          type: 'hole_run',
          currentTiles: [t1, t2],
          missingTiles: [{ color, value: midVal, remainingInDeck: remaining }],
          description: `${COLOR_NAMES[color]} ${t1.value}-${t2.value} (Araya ${midVal} Bekliyor)`,
          probabilityScore: score,
        });
      }
    }
  });

  // 2-tile sets (e.g. Red 9 and Blue 9 -> needs Yellow 9 or Black 9)
  Object.entries(byValue).forEach(([valStr, tiles]) => {
    const val = Number(valStr);
    const uniqueColors: Tile[] = [];
    tiles.forEach((t) => {
      if (!uniqueColors.some((ut) => ut.color === t.color)) uniqueColors.push(t);
    });

    if (uniqueColors.length === 2) {
      const allColors: TileColor[] = ['red', 'blue', 'black', 'yellow'];
      const missingColors = allColors.filter((c) => !uniqueColors.some((t) => t.color === c));
      const missing = missingColors.map((c) => {
        const invKey = `${c}-${val}`;
        return {
          color: c,
          value: val,
          remainingInDeck: inventory.get(invKey)?.remainingUnseen ?? 0,
        };
      });

      const totalOuts = missing.reduce((sum, n) => sum + n.remainingInDeck, 0);
      const score = Math.min(90, Math.round(totalOuts * 20));

      potentialPers.push({
        id: `pot-set-${val}`,
        type: 'set_waiting',
        currentTiles: uniqueColors,
        missingTiles: missing,
        description: `${val}'li ${uniqueColors.map((t) => COLOR_NAMES[t.color]).join(' + ')} Çifti`,
        probabilityScore: score,
      });
    }
  });

  // 4. Pairs (Çiftler)
  const pairs: { tile1: Tile; tile2: Tile; name: string }[] = [];
  const processedPairIds = new Set<string>();

  for (let i = 0; i < hand.length; i++) {
    if (processedPairIds.has(hand[i].id)) continue;
    for (let j = i + 1; j < hand.length; j++) {
      if (processedPairIds.has(hand[j].id)) continue;
      if (hand[i].color === hand[j].color && hand[i].value === hand[j].value) {
        pairs.push({
          tile1: hand[i],
          tile2: hand[j],
          name: `${COLOR_NAMES[hand[i].color]} ${hand[i].value} Çifti`,
        });
        processedPairIds.add(hand[i].id);
        processedPairIds.add(hand[j].id);
        break;
      }
    }
  }

  // 5. Okey placements suggestions
  const okeyPlacements: string[] = [];
  if (okeyTiles.length > 0) {
    if (potentialPers.length > 0) {
      const topPot = potentialPers.sort((a, b) => b.probabilityScore - a.probabilityScore)[0];
      const targetMissing = topPot.missingTiles[0];
      if (targetMissing) {
        okeyPlacements.push(
          `Joker Okey'i ${topPot.description} perini ${COLOR_NAMES[targetMissing.color]} ${targetMissing.value} yerine kullanarak anında tamamlayabilirsiniz.`
        );
      }
    } else {
      okeyPlacements.push('Okey elinizde joker olarak serbest. Eksik bir taş geldiğinde perinizi 4 veya 5 taşa uzatmak için saklayın.');
    }
  }

  // 6. Deadwood (İlişkisiz / Tekil taşlar)
  const inAnyGroupIds = new Set<string>();
  completedPers.forEach((cp) => cp.tiles.forEach((t) => inAnyGroupIds.add(t.id)));
  potentialPers.forEach((pp) => pp.currentTiles.forEach((t) => inAnyGroupIds.add(t.id)));
  pairs.forEach((pr) => {
    inAnyGroupIds.add(pr.tile1.id);
    inAnyGroupIds.add(pr.tile2.id);
  });
  okeyTiles.forEach((t) => inAnyGroupIds.add(t.id));

  const deadwood = hand.filter((t) => !inAnyGroupIds.has(t.id));

  // 7. Discard Evaluations (Taş Atma Tavsiyeleri)
  const discardEvaluations: DiscardAnalysis[] = hand.map((tile) => {
    const isOkey = isTileOkey(tile, indicator);
    if (isOkey) {
      return {
        tile,
        breakHandScore: 100,
        perLossRisk: 'Bu taş gerçek OKEY (Joker)! Kesinlikle elinizde tutmalısınız.',
        rivalBenefitRisk: 'Kritik',
        rivalBenefitReason: 'Okey taşını yere atmak oyunu kaybettirir veya rakiplere doğrudan yarar.',
        unseenCount: 0,
        recommendation: 'Sakla / Atma',
        recommendationLevel: 'danger',
      };
    }

    const tileKey = tile.color === 'fake' ? 'fake-0' : `${tile.color}-${tile.value}`;
    const unseenCount = inventory.get(tileKey)?.remainingUnseen ?? 0;

    // Check if in completed per
    const inCompleted = completedPers.some((cp) => cp.tiles.some((t) => t.id === tile.id));
    if (inCompleted) {
      return {
        tile,
        breakHandScore: 92,
        perLossRisk: 'Hazır bitmiş bir perinizi bozar.',
        rivalBenefitRisk: 'Orta',
        rivalBenefitReason: 'Elinizin düzenini bozacağı için atılması tavsiye edilmez.',
        unseenCount,
        recommendation: 'Sakla / Atma',
        recommendationLevel: 'danger',
      };
    }

    // Check if in open-ended run
    const inOpenRun = potentialPers.some((pp) => pp.type === 'run_waiting' && pp.currentTiles.some((t) => t.id === tile.id));
    if (inOpenRun) {
      return {
        tile,
        breakHandScore: 70,
        perLossRisk: 'Gelişme şansı çok yüksek olan açık uçlu serinizi bozar.',
        rivalBenefitRisk: 'Orta',
        rivalBenefitReason: 'Seri taşları değerlidir, son ana kadar tutulabilir.',
        unseenCount,
        recommendation: 'Riskli',
        recommendationLevel: 'risky',
      };
    }

    // Check if in gap or set waiting
    const inGapOrSet = potentialPers.some((pp) => pp.currentTiles.some((t) => t.id === tile.id));
    if (inGapOrSet) {
      return {
        tile,
        breakHandScore: 50,
        perLossRisk: 'Araya tek taş veya 3. renk bekleyen potansiyel peri bozar.',
        rivalBenefitRisk: 'Orta',
        rivalBenefitReason: 'Eğer beklenen taş masada tükenmişse bu taş rahatlıkla elden çıkarılabilir.',
        unseenCount,
        recommendation: 'Nötr / Atılabilir',
        recommendationLevel: 'neutral',
      };
    }

    // Rival benefit analysis:
    // What has the next rival taken?
    let rivalRisk: 'Düşük' | 'Orta' | 'Yüksek' = 'Düşük';
    let rivalReason = 'Masada yerde görünen veya güvenli taş sınıfında.';

    if (nextRival && nextRival.takenTiles.length > 0) {
      const matchesTakenColor = nextRival.takenTiles.some((tt) => tt.color === tile.color);
      const matchesTakenNear = nextRival.takenTiles.some(
        (tt) => tt.color === tile.color && Math.abs(tt.value - tile.value) <= 2
      );
      const matchesTakenSameNumber = nextRival.takenTiles.some((tt) => tt.value === tile.value);

      if (matchesTakenNear) {
        rivalRisk = 'Yüksek';
        rivalReason = `Sağınızdaki ${nextRival.name}, ${COLOR_NAMES[tile.color]} serisi topluyor gibi görünüyor (yerden ${COLOR_NAMES[tile.color]} taş almıştı).`;
      } else if (matchesTakenSameNumber) {
        rivalRisk = 'Yüksek';
        rivalReason = `Sağınızdaki ${nextRival.name}, ${tile.value} sayı grubu topluyor olabilir.`;
      } else if (matchesTakenColor) {
        rivalRisk = 'Orta';
        rivalReason = `Rakip ${COLOR_NAMES[tile.color]} rengiyle ilgilenmişti.`;
      }
    }

    // Has someone already discarded this exact tile? (Çifte / Yerdeki Taş)
    const discardsOfThis = inventory.get(tileKey)?.inDiscards ?? 0;
    if (discardsOfThis >= 1) {
      rivalRisk = 'Düşük';
      rivalReason = `Bu taştan masada zaten ${discardsOfThis} adet atılmış. Rakip için oldukça güvenli / istenmeyen taş.`;
    }

    // If tile is in deadwood
    if (deadwood.some((t) => t.id === tile.id)) {
      if (rivalRisk === 'Yüksek') {
        return {
          tile,
          breakHandScore: 20,
          perLossRisk: 'Elinizde hiçbir per veya ikiliye bağlanmıyor.',
          rivalBenefitRisk: 'Yüksek',
          rivalBenefitReason: rivalReason,
          unseenCount,
          recommendation: 'Riskli',
          recommendationLevel: 'risky',
        };
      }
      return {
        tile,
        breakHandScore: 10,
        perLossRisk: 'Elinizde hiçbir per veya ikiliye bağlanmıyor (tamamen serbest taş).',
        rivalBenefitRisk: rivalRisk,
        rivalBenefitReason: rivalReason,
        unseenCount,
        recommendation: 'Tavsiye Edilir',
        recommendationLevel: 'safe',
      };
    }

    return {
      tile,
      breakHandScore: 35,
      perLossRisk: 'Elinizde ikincil derecede bir taş.',
      rivalBenefitRisk: rivalRisk,
      rivalBenefitReason: rivalReason,
      unseenCount,
      recommendation: 'Nötr / Atılabilir',
      recommendationLevel: 'neutral',
    };
  });

  // Overall Hand Summary text
  let summary = '';
  if (completedPers.length >= 4) {
    summary = 'Eliniz bitmeye çok yakın! Hazır perleriniz oturmuş durumda.';
  } else if (completedPers.length >= 2) {
    summary = `${completedPers.length} hazır periniz var, kalan potansiyel serileri tamamlamaya odaklanın.`;
  } else if (potentialPers.length >= 3) {
    summary = 'Elinizde çok sayıda potansiyel seri var, dışarıdaki taş durumuna göre elinizi sadeleştirin.';
  } else {
    summary = 'Eliniz henüz dağınık. Serbest taşları elden çıkarıp açık uçlu serilere yönelin.';
  }

  return {
    completedPers,
    potentialPers,
    pairs,
    deadwood,
    okeyPlacements,
    handSummary: summary,
    discardEvaluations,
  };
}

/**
 * Analyses rival's visible actions (picked from table & discarded)
 */
export function analyzeRivalActions(
  rival: Player,
  inventory: Map<string, InventoryTileState>
): {
  likelyRuns: string[];
  likelySets: string[];
  unwantedTiles: string[];
  riskAssessment: string;
  tendencyLabel: string;
} {
  const likelyRuns: string[] = [];
  const likelySets: string[] = [];
  const unwanted: string[] = [];

  // Group taken tiles
  rival.takenTiles.forEach((t) => {
    if (t.color === 'fake') return;
    const colName = COLOR_NAMES[t.color];
    likelyRuns.push(`${colName} ${Math.max(1, t.value - 2)}-${t.value}-${Math.min(13, t.value + 2)} civarı renk serisi`);
    likelySets.push(`${t.value}'li renk grubu (diğer renklerden ${t.value} arıyor olabilir)`);
  });

  // Group discarded tiles (tiles they don't want)
  rival.discardedTiles.forEach((t) => {
    const colName = COLOR_NAMES[t.color];
    const key = `${colName} ${t.value}`;
    if (!unwanted.includes(key)) {
      unwanted.push(key);
    }
  });

  let risk = 'Belirsiz';
  let tendency = 'Henüz yeterli hamle verisi yok';

  if (rival.takenTiles.length >= 3) {
    risk = 'Yüksek İhtimalle Hazırlanıyor';
    tendency = 'Sürekli masadan taş alıyor; perleri hızlıca kapatıyor olabilir.';
  } else if (rival.takenTiles.length >= 1) {
    risk = 'Orta Olasılık';
    tendency = `${COLOR_NAMES[rival.takenTiles[0].color]} rengi ve yakın sayılara ilgi gösteriyor.`;
  } else if (rival.discardedTiles.length >= 3) {
    risk = 'Düşük / Kapalı Oynuyor';
    tendency = 'Ortadan taş çekmeyip desteden oynuyor. Kapalı el tutuyor.';
  }

  return {
    likelyRuns,
    likelySets,
    unwantedTiles: unwanted.slice(-6), // last 6 discards
    riskAssessment: risk,
    tendencyLabel: tendency,
  };
}
