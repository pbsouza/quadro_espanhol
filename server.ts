import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON with base64 image support (up to 20mb)
  app.use(express.json({ limit: "20mb" }));

  // API route to parse schedule photo/image via Gemini Vision AI
  app.post("/api/parse-schedule-image", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Nenhuma imagem fornecida." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
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

      const prompt = `Analise esta foto/imagem da programação das reuniões das Testemunhas de Jeová.
A foto/imagem pode conter UMA OU MAIS SEMANAS de programação (ex: 2, 3, 4 semanas em sequência).

Identifique cada semana individualmente e extraia em formato JSON estruturado contendo um array "weeks".

Estrutura JSON obrigatória:
{
  "weeks": [
    {
      "weekLabel": "ex: 3 a 9 de Março de 2026" (extraia o período/data da semana indicado no cabeçalho),
      "weekDate": "YYYY-MM-DD" (se puder determinar a data de início YYYY-MM-DD, senão null),
      "meetingType": "midweek" | "weekend" | "both",
      "president": string ou null,
      "initialSong": string ou null,
      "initialPrayer": string ou null,
      "counselorSalaB": string ou null,
      "talkTitle": string ou null,
      "talkSpeaker": string ou null,
      "gemsSpeaker": string ou null,
      "readingMain": string ou null,
      "readingSalaB": string ou null,
      "facaSeuMelhor": [
        {
          "title": "título da parte",
          "durationMin": 4,
          "assignedMain": "nome do estudante ou designado",
          "assignedAssistant": "nome do ajudante se houver",
          "assignedSalaB": "nome se for na Sala B",
          "assignedSalaBAssistant": "ajudante na Sala B"
        }
      ],
      "middleSong": string ou null,
      "nossaVidaCrista": [
        {
          "title": "título da parte",
          "durationMin": 15,
          "speaker": "nome do orador/dirigente",
          "reader": "nome do leitor se houver",
          "isBibleStudy": boolean
        }
      ],
      "finalSong": string ou null,
      "finalPrayer": string ou null,
      "publicTalkTitle": string ou null,
      "speakerName": string ou null,
      "speakerCongregation": string ou null,
      "weekendPresident": string ou null,
      "weekendInitialSong": string ou null,
      "watchtowerTitle": string ou null,
      "watchtowerConductor": string ou null,
      "watchtowerReader": string ou null,
      "weekendFinalSong": string ou null,
      "weekendFinalPrayer": string ou null
    }
  ]
}

Regras:
1. Se houver MAIS DE UMA SEMANA na imagem, SEPARE CADA SEMANA EM UM OBJETO NO ARRAY "weeks".
2. Identifique nomes de irmãos, títulos e minutos com clareza.
3. Não invente nomes se não puder ler. Deixe em branco ou null.
4. Se houver Cânticos, extraia o número ou título (ex: "Cântico 45").
5. Retorne APENAS o JSON puro.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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

      const responseText = response.text || "{}";
      const parsedJSON = JSON.parse(responseText);
      const weeks = Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0
        ? parsedJSON.weeks
        : [parsedJSON];

      return res.json({ success: true, weeks, data: weeks[0] });
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
      const { documentText, fileBase64, mimeType } = req.body;

      if (!documentText && !fileBase64) {
        return res.status(400).json({ error: "Nenhum documento ou texto fornecido." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
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

      const prompt = `Analise este documento ou texto com a programação das reuniões das Testemunhas de Jeová.
O documento pode conter UMA OU MAIS SEMANAS de programação (ex: 2, 3, 4 semanas ou todo o mês).

Identifique cada semana individualmente e extraia em formato JSON estruturado com um array "weeks".

Estrutura JSON obrigatória:
{
  "weeks": [
    {
      "weekLabel": "ex: 3 a 9 de Março de 2026" (extraia o período/data da semana indicado no cabeçalho),
      "weekDate": "YYYY-MM-DD" (se puder determinar a data de início YYYY-MM-DD, senão null),
      "meetingType": "midweek" | "weekend" | "both",
      "president": string ou null,
      "initialSong": string ou null,
      "initialPrayer": string ou null,
      "counselorSalaB": string ou null,
      "talkTitle": string ou null,
      "talkSpeaker": string ou null,
      "gemsSpeaker": string ou null,
      "readingMain": string ou null,
      "readingSalaB": string ou null,
      "facaSeuMelhor": [
        {
          "title": "título da parte",
          "durationMin": 4,
          "assignedMain": "nome do estudante ou designado",
          "assignedAssistant": "nome do ajudante se houver",
          "assignedSalaB": "nome se for na Sala B",
          "assignedSalaBAssistant": "ajudante na Sala B"
        }
      ],
      "middleSong": string ou null,
      "nossaVidaCrista": [
        {
          "title": "título da parte",
          "durationMin": 15,
          "speaker": "nome do orador/dirigente",
          "reader": "nome do leitor se houver",
          "isBibleStudy": boolean
        }
      ],
      "finalSong": string ou null,
      "finalPrayer": string ou null,
      "publicTalkTitle": string ou null,
      "speakerName": string ou null,
      "speakerCongregation": string ou null,
      "weekendPresident": string ou null,
      "weekendInitialSong": string ou null,
      "watchtowerTitle": string ou null,
      "watchtowerConductor": string ou null,
      "watchtowerReader": string ou null,
      "weekendFinalSong": string ou null,
      "weekendFinalPrayer": string ou null
    }
  ]
}

Regras:
1. Se houver MAIS DE UMA SEMANA no documento, SEPARE CADA SEMANA EM UM ELEMENTO NO ARRAY "weeks"!
2. Extraia nomes de irmãos, oradores, ajudantes, leitores, presidentes e cânticos para cada semana.
3. Se houver Cânticos, formate como "Cântico X" (ex: "Cântico 45").
4. Retorne APENAS o JSON puro.`;

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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: contentsParts,
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedJSON = JSON.parse(responseText);
      const weeks = Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0
        ? parsedJSON.weeks
        : [parsedJSON];

      return res.json({ success: true, weeks, data: weeks[0] });
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
