import { GoogleGenAI } from '@google/genai';

const GEMINI_KEY_STORAGE_KEY = 'gemini_api_key';

export function getStoredGeminiApiKey(): string | null {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  return localStorage.getItem(GEMINI_KEY_STORAGE_KEY) || null;
}

export function setStoredGeminiApiKey(key: string): void {
  if (key && key.trim() !== '') {
    localStorage.setItem(GEMINI_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
  }
}

const SCHEDULE_PROMPT = `Analise esta imagem ou documento com a programação das reuniões das Testemunhas de Jeová.
O documento/imagem pode conter UMA OU MAIS SEMANAS de programação (ex: 2, 3, 4 semanas ou o mês todo).

Identifique cada semana individualmente e extraia em formato JSON estruturado com um array "weeks".

Estrutura JSON obrigatória:
{
  "weeks": [
    {
      "weekLabel": "ex: 3 a 9 de Março de 2026" (período indicado no cabeçalho),
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
1. Se houver MAIS DE UMA SEMANA, SEPARE CADA SEMANA EM UM ELEMENTO NO ARRAY "weeks"!
2. Extraia nomes de irmãos, oradores, ajudantes, leitores, presidentes e cânticos para cada semana.
3. Se houver Cânticos, formate como "Cântico X" (ex: "Cântico 45").
4. Retorne APENAS o JSON puro.`;

export async function parseImageWithClientGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            { text: SCHEDULE_PROMPT },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedJSON = JSON.parse(responseText);
      if (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0) {
        return parsedJSON.weeks;
      }
      return [parsedJSON];
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying next...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Não foi possível analisar a imagem com os modelos do Gemini.');
}

export async function parseDocWithClientGemini(
  documentText: string,
  fileBase64: string | undefined,
  mimeType: string | undefined,
  apiKey: string
): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [];

  if (fileBase64 && mimeType === 'application/pdf') {
    const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: 'application/pdf',
      },
    });
  }

  if (documentText) {
    parts.push({ text: `DOCUMENTO / TEXTO:\n\n${documentText}` });
  }

  parts.push({ text: SCHEDULE_PROMPT });

  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedJSON = JSON.parse(responseText);
      if (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0) {
        return parsedJSON.weeks;
      }
      return [parsedJSON];
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying next...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Não foi possível analisar o documento com os modelos do Gemini.');
}
