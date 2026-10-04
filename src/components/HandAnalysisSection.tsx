import React from 'react';
import { Tile, HandAnalysisResult, TileColor } from '../types/okey';
import { TileView } from './TileView';
import { COLOR_NAMES } from '../utils/okeyEngine';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Target,
  Copy,
  Layers,
} from 'lucide-react';

interface HandAnalysisSectionProps {
  hand: Tile[];
  indicator: Tile | null;
  analysis: HandAnalysisResult;
  onDiscardTile: (tile: Tile) => void;
}

export const HandAnalysisSection: React.FC<HandAnalysisSectionProps> = ({
  hand,
  indicator,
  analysis,
  onDiscardTile,
}) => {
  if (hand.length === 0) {
    return (
      <div className="p-8 text-center bg-[#11241c] border border-[#214232] rounded-2xl">
        <Layers className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-amber-200">İstakanızda Taş Bulunmuyor</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Kamera ile taşlarınızı tarayabilir veya İstakam sekmesinden taş ekleyerek kapsamlı el analizi alabilirsiniz.
        </p>
      </div>
    );
  }

  // Sort discard evaluations: Safest first
  const sortedDiscards = [...analysis.discardEvaluations].sort((a, b) => {
    const priority = { safe: 0, neutral: 1, risky: 2, danger: 3 };
    return priority[a.recommendationLevel] - priority[b.recommendationLevel];
  });

  return (
    <div className="space-y-4">
      {/* HAND OVERVIEW SUMMARY BANNER */}
      <div className="p-4 bg-gradient-to-br from-[#163828] via-[#10291d] to-[#0d2117] border border-[#2e684a] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            Elin Mevcut Durumu & Yapısı
          </span>
          <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-xs font-black rounded-full border border-amber-400/40">
            {hand.length} Taş
          </span>
        </div>
        <p className="text-sm font-extrabold text-amber-100 mb-3">
          {analysis.handSummary}
        </p>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#0b1c14]/80 p-2 rounded-xl border border-[#214734]">
            <div className="text-base font-black text-emerald-400">
              {analysis.completedPers.length}
            </div>
            <div className="text-[10px] font-semibold text-neutral-400">Hazır Per</div>
          </div>
          <div className="bg-[#0b1c14]/80 p-2 rounded-xl border border-[#214734]">
            <div className="text-base font-black text-amber-400">
              {analysis.potentialPers.length}
            </div>
            <div className="text-[10px] font-semibold text-neutral-400">Potansiyel</div>
          </div>
          <div className="bg-[#0b1c14]/80 p-2 rounded-xl border border-[#214734]">
            <div className="text-base font-black text-sky-400">{analysis.pairs.length}</div>
            <div className="text-[10px] font-semibold text-neutral-400">Çift</div>
          </div>
          <div className="bg-[#0b1c14]/80 p-2 rounded-xl border border-[#214734]">
            <div className="text-base font-black text-neutral-300">
              {analysis.deadwood.length}
            </div>
            <div className="text-[10px] font-semibold text-neutral-400">Serbest Taş</div>
          </div>
        </div>
      </div>

      {/* 1. HAZIR PERLER */}
      <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-2">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Hazır Perler ({analysis.completedPers.length})
          </h3>
        </div>

        {analysis.completedPers.length === 0 ? (
          <p className="text-xs text-neutral-400 italic p-2 bg-[#0d2018] rounded-xl border border-[#1b3a2c] text-center">
            Elinizde henüz tamamlanmış (en az 3 taşlık) seri veya grup bulunmuyor.
          </p>
        ) : (
          <div className="space-y-2">
            {analysis.completedPers.map((per) => (
              <div
                key={per.id}
                className="p-3 bg-[#0d2018] rounded-xl border border-[#214232] flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-300">{per.description}</div>
                  <div className="text-[10px] text-neutral-400">
                    {per.type === 'run' ? 'Düz Renk Serisi' : 'Farklı Renk Sayı Grubu'}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {per.tiles.map((t, idx) => (
                    <TileView key={`${t.id}-${idx}`} tile={t} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. GELİŞTİRİLEBİLECEK PERLER & EKSİK TAŞLAR */}
      <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-2">
          <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Geliştirilebilecek Perler & Beklenen Taşlar ({analysis.potentialPers.length})
          </h3>
        </div>

        {analysis.potentialPers.length === 0 ? (
          <p className="text-xs text-neutral-400 italic p-2 bg-[#0d2018] rounded-xl border border-[#1b3a2c] text-center">
            Potansiyel seri veya grup kombinasyonu tespit edilmedi.
          </p>
        ) : (
          <div className="space-y-2.5">
            {analysis.potentialPers.map((pot) => (
              <div
                key={pot.id}
                className="p-3 bg-[#0d2018] rounded-xl border border-[#214232] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200">{pot.description}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      pot.probabilityScore >= 60
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    Olasılık: %{pot.probabilityScore}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Current 2 tiles */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-400 mr-1">Elinizdeki:</span>
                    {pot.currentTiles.map((t, idx) => (
                      <TileView key={`${t.id}-${idx}`} tile={t} size="xs" />
                    ))}
                  </div>

                  {/* Missing needed tiles */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-400 font-semibold">Gereken:</span>
                    {pot.missingTiles.map((m, idx) => (
                      <div
                        key={idx}
                        className="px-1.5 py-0.5 bg-[#173123] rounded-md border border-[#2d5c43] text-[11px] font-bold text-neutral-100 flex items-center gap-1"
                        title={`Masada/Destede ${m.remainingInDeck} adet kaldı`}
                      >
                        <span>
                          {COLOR_NAMES[m.color]} {m.value}
                        </span>
                        <span className="text-[9px] text-amber-300 bg-black/40 px-1 rounded-sm">
                          {m.remainingInDeck} kaldı
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. OKEY JOKER KULLANIM YERLERİ */}
      {analysis.okeyPlacements.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-[#122c1f] border border-emerald-700/60 rounded-2xl flex items-start gap-3">
          <div className="p-1.5 bg-emerald-500/20 text-amber-300 rounded-xl mt-0.5">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="text-xs space-y-1">
            <span className="font-extrabold text-amber-200 block uppercase tracking-wide">
              Okey Taşının En Verimli Kullanımı
            </span>
            {analysis.okeyPlacements.map((txt, idx) => (
              <p key={idx} className="text-emerald-100 leading-relaxed">
                {txt}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. ÇİFTLER BÖLÜMÜ (7 Çift Analizi) */}
      {analysis.pairs.length > 0 && (
        <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-2">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              <Copy className="w-4 h-4 text-sky-400" />
              Eldeki Çiftler ({analysis.pairs.length} / 7 Çift)
            </h3>
            <span className="text-[11px] text-sky-300 font-semibold">
              {analysis.pairs.length >= 4 ? 'Çifte gitmek mantıklı olabilir' : 'Düz per daha avantajlı'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.pairs.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 p-1.5 bg-[#0d2018] rounded-xl border border-[#214232]"
              >
                <TileView tile={p.tile1} size="xs" />
                <TileView tile={p.tile2} size="xs" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAŞ ATMA TAVSİYE MOTORU */}
      <div className="bg-[#11241c] border border-[#214232] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b3a2c] pb-2">
          <div>
            <h3 className="text-xs font-extrabold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Taş Atma Tavsiye Motoru
            </h3>
            <p className="text-[11px] text-neutral-400">
              Elinizi bozma riski ve rakiplere yarama olasılığına göre analiz
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sortedDiscards.map((item, idx) => {
            const levelBg =
              item.recommendationLevel === 'safe'
                ? 'border-emerald-700/60 bg-[#0d261a]'
                : item.recommendationLevel === 'neutral'
                ? 'border-neutral-700/60 bg-[#122119]'
                : item.recommendationLevel === 'risky'
                ? 'border-amber-700/60 bg-[#261e12]'
                : 'border-red-800/60 bg-[#281313]';

            const badgeColor =
              item.recommendationLevel === 'safe'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : item.recommendationLevel === 'neutral'
                ? 'bg-neutral-800 text-neutral-300 border-neutral-600'
                : item.recommendationLevel === 'risky'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-red-950 text-red-300 border-red-700';

            return (
              <div
                key={item.tile.id || idx}
                className={`p-3 rounded-xl border ${levelBg} transition-all space-y-2`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <TileView tile={item.tile} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {COLOR_NAMES[item.tile.color]} {item.tile.value || ''}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${badgeColor}`}
                        >
                          {item.recommendation}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">
                        {item.perLossRisk}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDiscardTile(item.tile)}
                    className="py-1.5 px-2.5 bg-[#1b3a2c] hover:bg-red-700 hover:text-white text-neutral-200 text-xs font-bold rounded-xl border border-[#2d5c43] flex items-center gap-1 transition-colors shrink-0"
                    title="Bu taşı yere at"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>At</span>
                  </button>
                </div>

                {/* Sub-details: Rival benefit & Deck count */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    Rakibe Yarar: <strong className="text-neutral-200">{item.rivalBenefitRisk}</strong> ({item.rivalBenefitReason})
                  </span>
                  <span className="text-amber-300 shrink-0 ml-2">
                    Dışarıda: {item.unseenCount} adet
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer note */}
        <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-2 border-t border-[#1b3a2c]">
          <HelpCircle className="w-3 h-3 text-neutral-500 shrink-0" />
          <span>
            Tavsiyeler kesin kazanma garantisi içermez. Matematiksel per ihtimalleri ve masadaki görünen taşların olasılıklarına dayanır.
          </span>
        </div>
      </div>
    </div>
  );
};
