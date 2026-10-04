import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for large payload (camera images)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Camera tile detection endpoint
app.post("/api/detect-tiles", async (req, res) => {
  try {
    const { imageBase64, mode } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Görüntü verisi bulunamadı." });
    }

    // Extract mimeType if present and clean base64 header
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, "");

    const ai = getGenAI();

    const promptText = `
Sen bir Okey oyunu taş tespit uzmanısın.
Görüntüdeki Türk Okey taşlarını dikkatlice tespit et.
Okey taşları özellikleri:
- Renkler 4 adettir: 'red' (Kırmızı), 'blue' (Mavi), 'black' (Siyah), 'yellow' (Sarı).
- Sayılar 1 ile 13 arasındadır.
- Sahte Okey (Fake Okey) taşları: Sayı içermez, üzerinde yıldız, çiçek, yonca veya desen bulunur. Eğer sahte okey ise color 'fake', value 0 olmalı.
- Kullanıcı "${mode || 'hand'}" modu için tarama yapıyor:
  - Eğer 'indicator' modu ise: Tek bir gösterge taşı tespiti önemlidir.
  - Eğer 'hand' modu ise: İstaka üzerindeki veya yan yana dizilmiş kullanıcının elindeki tüm taşları sırasıyla listele.
  - Eğer 'discard' modu ise: Atılan/alınan tek veya birkaç taşı listele.

Lütfen tespit edilen her taşı JSON formatında döndür.
`;

    // Multi-model fallback sequence to handle transient 503/high demand
    const candidateModels = [
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
    ];

    let lastError: any = null;
    let responseText = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: promptText },
            ],
          },
          config: {
            systemInstruction:
              "Türk Okey taşlarını doğru renk (red, blue, black, yellow, fake) ve 1-13 arası sayı olarak tespit eden hassas vizyon sistemi.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tiles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      color: {
                        type: Type.STRING,
                        description: "Taş rengi: 'red', 'blue', 'black', 'yellow', veya 'fake'",
                      },
                      value: {
                        type: Type.INTEGER,
                        description: "Taş sayısı: 1-13 (sahte okey için 0)",
                      },
                      confidence: {
                        type: Type.NUMBER,
                        description: "Tespit güvenilirlik oranı (0.0 - 1.0)",
                      },
                      note: {
                        type: Type.STRING,
                        description: "Kısa açıklama (örn: Kırmızı 7, Sarı 12, Sahte Okey)",
                      },
                    },
                    required: ["color", "value"],
                  },
                },
                indicatorSuggestion: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING },
                    value: { type: Type.INTEGER },
                  },
                },
                summary: {
                  type: Type.STRING,
                  description: "Tespit özeti (örn: 14 taş tespit edildi)",
                },
              },
              required: ["tiles"],
            },
          },
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} attempt failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Görüntü analiz edilemedi.");
    }

    // Clean any markdown code fences if model returned them
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText || '{"tiles":[]}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Gemini tile detection error:", error);
    return res.status(500).json({
      error: "Taş algılama işlemi sırasında bir hata oluştu.",
      details: error?.message || "Servis geçici olarak yanıt veremedi. Lütfen tekrar deneyin.",
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Okey Asistanı server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
