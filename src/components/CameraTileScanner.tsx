import React, { useState, useRef, useEffect } from 'react';
import { Tile, TileColor } from '../types/okey';
import { COLOR_NAMES } from '../utils/okeyEngine';
import { TileView } from './TileView';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';

interface CameraTileScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTilesDetected: (tiles: Tile[]) => void;
  mode?: 'hand' | 'indicator' | 'discard';
  title?: string;
}

export const CameraTileScanner: React.FC<CameraTileScannerProps> = ({
  isOpen,
  onClose,
  onTilesDetected,
  mode = 'hand',
  title = 'Kamera ile Taş Tara',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedTiles, setDetectedTiles] = useState<Tile[]>([]);
  const [editingTileIndex, setEditingTileIndex] = useState<number | null>(null);
  const [detectionSummary, setDetectionSummary] = useState<string | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const resetState = () => {
    setCapturedImage(null);
    setDetectedTiles([]);
    setEditingTileIndex(null);
    setDetectionSummary(null);
    setCameraError(null);
    setIsAnalyzing(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tarayıcınız kamera erişimini desteklemiyor.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Kamera açılamadı veya izin verilmedi. Lütfen fotoğraf yükleme seçeneğini kullanın ya da taşları elle girin.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    setCameraError(null);
    try {
      const res = await fetch('/api/detect-tiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.details || json.error || 'Taşlar algılanamadı.');
      }

      const rawTiles = json.data?.tiles || [];
      const parsedTiles: Tile[] = rawTiles.map((t: any, idx: number) => ({
        id: `detected-${Date.now()}-${idx}`,
        color: (['red', 'blue', 'black', 'yellow', 'fake'].includes(t.color)
          ? t.color
          : 'red') as TileColor,
        value: typeof t.value === 'number' ? Math.min(13, Math.max(0, t.value)) : 1,
        isFakeOkey: t.color === 'fake',
      }));

      setDetectedTiles(parsedTiles);
      setDetectionSummary(
        json.data?.summary || `${parsedTiles.length} adet Okey taşı tespit edildi.`
      );
    } catch (err: any) {
      console.warn('Detection error:', err);
      setCameraError(
        err?.message || 'Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin veya taşları elle girin.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleHand = () => {
    const sampleTiles: Tile[] = [
      { id: `sample-${Date.now()}-1`, color: 'red', value: 7 },
      { id: `sample-${Date.now()}-2`, color: 'red', value: 8 },
      { id: `sample-${Date.now()}-3`, color: 'red', value: 9 },
      { id: `sample-${Date.now()}-4`, color: 'blue', value: 3 },
      { id: `sample-${Date.now()}-5`, color: 'blue', value: 4 },
      { id: `sample-${Date.now()}-6`, color: 'blue', value: 5 },
      { id: `sample-${Date.now()}-7`, color: 'yellow', value: 11 },
      { id: `sample-${Date.now()}-8`, color: 'yellow', value: 12 },
      { id: `sample-${Date.now()}-9`, color: 'yellow', value: 13 },
      { id: `sample-${Date.now()}-10`, color: 'black', value: 6 },
      { id: `sample-${Date.now()}-11`, color: 'red', value: 6 },
      { id: `sample-${Date.now()}-12`, color: 'yellow', value: 6 },
      { id: `sample-${Date.now()}-13`, color: 'black', value: 10 },
      { id: `sample-${Date.now()}-14`, color: 'fake', value: 0, isFakeOkey: true },
    ];
    setDetectedTiles(sampleTiles);
    setDetectionSummary('Örnek 14 adet Okey taşı yüklendi.');
    setCameraError(null);
  };

  const loadSampleIndicator = () => {
    const sample: Tile[] = [
      { id: `sample-ind-${Date.now()}`, color: 'yellow', value: 7 },
    ];
    setDetectedTiles(sample);
    setDetectionSummary('Örnek gösterge taşı (Sarı 7) yüklendi.');
    setCameraError(null);
  };

  const handleApply = () => {
    if (detectedTiles.length > 0) {
      onTilesDetected(detectedTiles);
      onClose();
    }
  };

  const updateTile = (index: number, newColor: TileColor, newValue: number) => {
    setDetectedTiles((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        color: newColor,
        value: newColor === 'fake' ? 0 : newValue,
        isFakeOkey: newColor === 'fake',
      };
      return updated;
    });
    setEditingTileIndex(null);
  };

  const removeTile = (index: number) => {
    setDetectedTiles((prev) => prev.filter((_, i) => i !== index));
    if (editingTileIndex === index) setEditingTileIndex(null);
  };

  const addManualTile = () => {
    const newTile: Tile = {
      id: `add-${Date.now()}`,
      color: 'red',
      value: 1,
    };
    setDetectedTiles((prev) => [...prev, newTile]);
    setEditingTileIndex(detectedTiles.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11241c] border border-[#264b38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#214232] bg-[#0d2018]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-200 text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* CAMERA / IMAGE PREVIEW AREA */}
          {!capturedImage ? (
            <div className="relative aspect-4/3 w-full bg-black rounded-xl overflow-hidden border border-[#264b38] flex items-center justify-center">
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Viewfinder overlay */}
              {isCameraActive && (
                <div className="absolute inset-4 border-2 border-dashed border-amber-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 px-3 py-1 text-xs text-amber-200 font-medium rounded-full">
                    {mode === 'indicator' ? 'Gösterge taşını vizöre hizalayın' : 'Taşları / istakayı vizöre hizalayın'}
                  </span>
                </div>
              )}

              {!isCameraActive && !cameraError && (
                <div className="text-center p-4">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-emerald-200">Kamera başlatılıyor...</p>
                </div>
              )}

              {cameraError && (
                <div className="text-center p-4 max-w-xs">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-300 mb-3">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-[#1b3a2c] text-xs font-semibold text-white rounded-lg border border-[#2e5d46]"
                  >
                    Kamerayı Tekrar Dene
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative aspect-4/3 w-full bg-black rounded-xl overflow-hidden border border-[#264b38]">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center">
                  <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mb-3" />
                  <p className="font-bold text-amber-300 text-sm">Yapay Zeka Taşları İnceliyor...</p>
                  <p className="text-xs text-neutral-300 mt-1">Renkler, sayılar ve sahte okey taranıyor</p>
                </div>
              )}
            </div>
          )}

          {/* CAPTURE BUTTONS (Only when camera active & no image yet) */}
          {!capturedImage && (
            <div className="flex gap-2">
              {isCameraActive && (
                <button
                  type="button"
                  onClick={captureFrame}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>Fotoğraf Çek ve Algıla</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 bg-[#1b3a2c] hover:bg-[#25503c] text-neutral-200 text-xs font-semibold rounded-xl border border-[#2e5d46] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Galeriden Seç</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* RESULTS & CORRECTION SECTION */}
          {capturedImage && !isAnalyzing && (
            <div className="space-y-3 bg-[#0d2018] p-3 rounded-xl border border-[#214232]">
              {/* Error banner if detection encountered issue */}
              {cameraError && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-neutral-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-red-200">Algılama Uyarısı</p>
                      <p className="text-neutral-300 mt-0.5">{cameraError}</p>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => analyzeImage(capturedImage)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Tekrar Dene</span>
                        </button>
                        <button
                          type="button"
                          onClick={addManualTile}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Elle Taş Ekle</span>
                        </button>
                        {mode === 'hand' && (
                          <button
                            type="button"
                            onClick={loadSampleHand}
                            className="px-3 py-1 bg-[#1c3e2e] hover:bg-[#25503c] text-emerald-300 font-semibold rounded-lg text-xs border border-emerald-600/40"
                          >
                            Örnek El Doldur (14 Taş)
                          </button>
                        )}
                        {mode === 'indicator' && (
                          <button
                            type="button"
                            onClick={loadSampleIndicator}
                            className="px-3 py-1 bg-[#1c3e2e] hover:bg-[#25503c] text-emerald-300 font-semibold rounded-lg text-xs border border-emerald-600/40"
                          >
                            Örnek Gösterge Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    Algılama Sonucu ({detectedTiles.length} Taş)
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {detectionSummary || 'Taşlara dokunarak rengini ve sayısını düzeltebilirsiniz.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {detectedTiles.length === 0 && mode === 'hand' && (
                    <button
                      type="button"
                      onClick={loadSampleHand}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40"
                    >
                      Örnek El
                    </button>
                  )}
                  {detectedTiles.length === 0 && mode === 'indicator' && (
                    <button
                      type="button"
                      onClick={loadSampleIndicator}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40"
                    >
                      Örnek Gösterge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addManualTile}
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-700/60 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Taş Ekle</span>
                  </button>
                </div>
              </div>

              {detectedTiles.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 space-y-2">
                  <p>Görüntüde henüz taş tespit edilemedi veya taşlar net değil.</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={addManualTile}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Elle Taş Ekle</span>
                    </button>
                    {mode === 'hand' && (
                      <button
                        type="button"
                        onClick={loadSampleHand}
                        className="px-3 py-1.5 bg-[#1b3a2c] hover:bg-[#25503c] text-amber-300 font-bold rounded-lg text-xs border border-[#2e5d46]"
                      >
                        Örnek El Yükle (14 Taş)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        resetState();
                        startCamera();
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-lg text-xs"
                    >
                      Yeniden Çek
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 bg-black/20 rounded-lg">
                  {detectedTiles.map((tile, idx) => (
                    <div key={tile.id || idx} className="relative group">
                      <TileView
                        tile={tile}
                        size="sm"
                        isSelected={editingTileIndex === idx}
                        onClick={() =>
                          setEditingTileIndex(editingTileIndex === idx ? null : idx)
                        }
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTile(idx);
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-500"
                        title="Bu taşı kaldır"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* INLINE TILE CORRECTION PANEL */}
              {editingTileIndex !== null && detectedTiles[editingTileIndex] && (
                <div className="p-3 bg-[#163325] rounded-xl border border-amber-400/40 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      Seçili Taşı Düzelt (Taş #{editingTileIndex + 1})
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingTileIndex(null)}
                      className="text-neutral-400 hover:text-white text-xs"
                    >
                      Kapat
                    </button>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {(['red', 'yellow', 'blue', 'black', 'fake'] as TileColor[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          updateTile(
                            editingTileIndex,
                            c,
                            c === 'fake' ? 0 : detectedTiles[editingTileIndex].value || 1
                          )
                        }
                        className={`py-1 text-[11px] font-bold rounded-md border transition-all ${
                          detectedTiles[editingTileIndex].color === c
                            ? 'bg-amber-400 text-neutral-950 border-amber-300'
                            : 'bg-[#0d2018] text-neutral-200 border-[#264b38]'
                        }`}
                      >
                        {COLOR_NAMES[c]}
                      </button>
                    ))}
                  </div>

                  {/* Numbers 1-13 */}
                  {detectedTiles[editingTileIndex].color !== 'fake' && (
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            updateTile(
                              editingTileIndex,
                              detectedTiles[editingTileIndex].color,
                              num
                            )
                          }
                          className={`h-7 rounded text-xs font-bold border transition-all ${
                            detectedTiles[editingTileIndex].value === num
                              ? 'bg-amber-400 text-neutral-950 border-amber-300'
                              : 'bg-[#0d2018] text-neutral-200 border-[#264b38]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={detectedTiles.length === 0}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {mode === 'indicator'
                      ? 'Göstergeyi Onayla'
                      : `${detectedTiles.length} Taşı İstakaya Aktar`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    startCamera();
                  }}
                  className="py-2.5 px-3 bg-[#1b3a2c] hover:bg-[#25503c] text-neutral-200 text-xs font-semibold rounded-xl border border-[#2e5d46] flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Yeniden Çek</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
