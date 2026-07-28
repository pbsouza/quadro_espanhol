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

export async function getAvailableModelsForKey(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));

        if (supported.length > 0) {
          // Sort to prioritize fast flash models (2.5-flash, 2.0-flash, 1.5-flash)
          supported.sort((a: string, b: string) => {
            const a25 = a.includes('2.5') ? 2 : (a.includes('2.0') ? 1 : 0);
            const b25 = b.includes('2.5') ? 2 : (b.includes('2.0') ? 1 : 0);
            if (a25 !== b25) return b25 - a25;
            const aFlash = a.includes('flash') ? 1 : 0;
            const bFlash = b.includes('flash') ? 1 : 0;
            return bFlash - aFlash;
          });
          return supported;
        }
      }
    }
  } catch (err) {
    console.warn('Could not list models via API key:', err);
  }
  return ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-pro'];
}

export async function parseImageWithClientGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<any[]> {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const candidateModels = await getAvailableModelsForKey(apiKey);

  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
                { text: SCHEDULE_PROMPT },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
        console.warn(`Model ${modelName} failed (${res.status}): ${msg}`);
        lastErrorMsg = msg;
        continue;
      }

      const resData = await res.json();
      const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsedJSON = JSON.parse(responseText);
      if (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0) {
        return parsedJSON.weeks;
      }
      return [parsedJSON];
    } catch (err: any) {
      console.warn(`Model ${modelName} error:`, err);
      lastErrorMsg = err?.message || String(err);
    }
  }

  throw new Error(`Falha na IA Gemini: ${lastErrorMsg || 'Verifique sua chave de API.'}`);
}

export async function parseDocWithClientGemini(
  documentText: string,
  fileBase64: string | undefined,
  mimeType: string | undefined,
  apiKey: string
): Promise<any[]> {
  const parts: any[] = [];

  if (fileBase64 && mimeType === 'application/pdf') {
    const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanBase64,
      },
    });
  }

  if (documentText) {
    parts.push({ text: `DOCUMENTO / TEXTO:\n\n${documentText}` });
  }

  parts.push({ text: SCHEDULE_PROMPT });

  const candidateModels = await getAvailableModelsForKey(apiKey);
  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
        console.warn(`Model ${modelName} failed (${res.status}): ${msg}`);
        lastErrorMsg = msg;
        continue;
      }

      const resData = await res.json();
      const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsedJSON = JSON.parse(responseText);
      if (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0) {
        return parsedJSON.weeks;
      }
      return [parsedJSON];
    } catch (err: any) {
      console.warn(`Model ${modelName} error:`, err);
      lastErrorMsg = err?.message || String(err);
    }
  }

  throw new Error(`Falha na IA Gemini: ${lastErrorMsg || 'Verifique sua chave de API.'}`);
}
