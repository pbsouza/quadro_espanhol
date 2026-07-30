import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { cleanPartTitle, sanitizeParsedWeekTitles } from "./src/utils/textUtils";
import { getPromptForTarget } from "./src/utils/geminiPrompts";

function getDefaultGeminiApiKey(): string {
  return Buffer.from('QVEuQWI4Uk42SWJhQUxWOXhPLVRHZHNUcVJPYURpT2hCWmhjT1I5cU44eUpQRkFzZWRJTGc=', 'base64').toString('utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON with base64 image support (up to 20mb)
  app.use(express.json({ limit: "20mb" }));

  // API route to parse schedule photo/image via Gemini Vision AI
  app.post("/api/parse-schedule-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, targetType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Nenhuma imagem fornecida." });
      }

      const apiKey = process.env.GEMINI_API_KEY || getDefaultGeminiApiKey();
      if (!apiKey) {
        return res.status(500).json({
          error: "Chave GEMINI_API_KEY não configurada no ambiente."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const cleanMimeType = mimeType || "image/jpeg";
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const prompt = getPromptForTarget(targetType || "meetings");

      const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let responseText = "{}";
      let lastErr: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: cleanMimeType,
                  },
                },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: "application/json",
            },
          });
          responseText = response.text || "{}";
          lastErr = null;
          break;
        } catch (mErr) {
          console.warn(`Server model ${modelName} failed, trying next...`, mErr);
          lastErr = mErr;
        }
      }

      if (lastErr && responseText === "{}") {
        throw lastErr;
      }
      const parsedJSON = JSON.parse(responseText);

      if (parsedJSON.weeks || Array.isArray(parsedJSON.weeks)) {
        const rawWeeks = Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0
          ? parsedJSON.weeks
          : [parsedJSON];
        const weeks = rawWeeks.map((w: any) => sanitizeParsedWeekTitles(w));
        return res.json({ success: true, targetType: targetType || "meetings", weeks, data: weeks[0] });
      }

      return res.json({
        success: true,
        targetType: parsedJSON.targetType || targetType || "general",
        data: parsedJSON,
        cleaning: parsedJSON.cleaning || [],
        witnessing: parsedJSON.witnessing || [],
        groups: parsedJSON.groups || [],
        announcements: parsedJSON.announcements || [],
      });
    } catch (error: any) {
      console.error("Erro ao analisar foto com Gemini:", error);
      return res.status(500).json({
        error: error.message || "Falha ao ler e processar a foto.",
      });
    }
  });

  // API route to parse schedule documents (PDF, TXT, RTF, DOC, etc.) via Gemini AI
  app.post("/api/parse-schedule-document", async (req, res) => {
    try {
      const { documentText, fileBase64, mimeType, targetType } = req.body;

      if (!documentText && !fileBase64) {
        return res.status(400).json({ error: "Nenhum documento ou texto fornecido." });
      }

      const apiKey = process.env.GEMINI_API_KEY || getDefaultGeminiApiKey();
      if (!apiKey) {
        return res.status(500).json({
          error: "Chave GEMINI_API_KEY não configurada no ambiente."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = getPromptForTarget(targetType || "meetings");

      const contentsParts: any[] = [];

      if (fileBase64 && mimeType === 'application/pdf') {
        const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "");
        contentsParts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: 'application/pdf'
          }
        });
      }

      if (documentText) {
        contentsParts.push({ text: `CONTEÚDO DO DOCUMENTO OU TEXTO:\n${documentText}` });
      }

      contentsParts.push({ text: prompt });

      const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
      let responseText = "{}";
      let lastErr: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: contentsParts,
            },
            config: {
              responseMimeType: "application/json",
            },
          });
          responseText = response.text || "{}";
          lastErr = null;
          break;
        } catch (mErr) {
          console.warn(`Server model ${modelName} failed, trying next...`, mErr);
          lastErr = mErr;
        }
      }

      if (lastErr && responseText === "{}") {
        throw lastErr;
      }
      const parsedJSON = JSON.parse(responseText);

      if (parsedJSON.weeks || Array.isArray(parsedJSON.weeks)) {
        const rawWeeks = Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0
          ? parsedJSON.weeks
          : [parsedJSON];
        const weeks = rawWeeks.map((w: any) => sanitizeParsedWeekTitles(w));
        return res.json({ success: true, targetType: targetType || "meetings", weeks, data: weeks[0] });
      }

      return res.json({
        success: true,
        targetType: parsedJSON.targetType || targetType || "general",
        data: parsedJSON,
        cleaning: parsedJSON.cleaning || [],
        witnessing: parsedJSON.witnessing || [],
        groups: parsedJSON.groups || [],
        announcements: parsedJSON.announcements || [],
      });
    } catch (error: any) {
      console.error("Erro ao analisar documento com Gemini:", error);
      return res.status(500).json({
        error: error.message || "Falha ao ler e processar o documento com IA.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
