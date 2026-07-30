import { GoogleGenAI } from '@google/genai';
import { sanitizeParsedWeekTitles } from '../utils/textUtils';
import { getPromptForTarget } from '../utils/geminiPrompts';

const GEMINI_KEY_STORAGE_KEY = 'gemini_api_key';

function getFallbackApiKey(): string {
  if (typeof atob === 'function') {
    return atob('QVEuQWI4Uk42SWJhQUxWOXhPLVRHZHNUcVJPYURpT2hCWmhjT1I5cU44eUpQRkFzZWRJTGc=');
  }
  return Buffer.from('QVEuQWI4Uk42SWJhQUxWOXhPLVRHZHNUcVJPYURpT2hCWmhjT1I5cU44eUpQRkFzZWRJTGc=', 'base64').toString('utf-8');
}

export function getStoredGeminiApiKey(): string | null {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  const storedKey = localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
  if (storedKey && storedKey.trim() !== '') return storedKey.trim();
  return getFallbackApiKey();
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
      "weekLabel": "ex: 03/03/2026 - 09/03/2026 ou 03/03/2026" (ATENÇÃO: extraia no formato dd/mm/aaaa. NUNCA utilize aaaa/mm/dd ou aaaa-mm-dd),
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
          "title": "título da parte (ATENÇÃO: NUNCA inclua o número da parte no início. Extraia apenas 'Empiece conversaciones' em vez de '4. Empiece conversaciones')",
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
          "title": "título da parte (ATENÇÃO: NUNCA inclua o número da parte no início. Extraia apenas 'Seamos adaptables' em vez de '7. Seamos adaptables')",
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
3. REMOVA QUALQUER NUMERAÇÃO DO INÍCIO DOS TÍTULOS DAS PARTES (ex: extraia "Empiece conversaciones" e NÃO "4. Empiece conversaciones" ou "4. 4. Empiece conversaciones").
4. FORMATO DE DATAS: Todas as datas e rótulos de semana (weekLabel) DEVEM estar estritamente no formato dd/mm/aaaa (ex: '29/07/2026' ou '03/03/2026 - 09/03/2026'). NUNCA utilize o formato aaaa/mm/dd ou aaaa-mm-dd.
5. Se houver Cânticos, formate como "Cântico X" (ex: "Cântico 45").
6. Retorne APENAS o JSON puro.`;

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
          // Sort to prioritize fast flash models (3.6-flash, flash-latest, 3.1-flash-lite)
          supported.sort((a: string, b: string) => {
            const getScore = (m: string) => {
              if (m.includes('3.6-flash') || m === 'gemini-3.6-flash') return 10;
              if (m.includes('flash-latest') || m === 'gemini-flash-latest') return 9;
              if (m.includes('3.1-flash-lite')) return 8;
              if (m.includes('3.1-pro')) return 7;
              if (m.includes('flash')) return 5;
              return 1;
            };
            return getScore(b) - getScore(a);
          });
          return supported;
        }
      }
    }
  } catch (err) {
    console.warn('Could not list models via API key:', err);
  }
  return ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
}

export async function parseImageWithClientGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
  targetType: string = 'meetings'
): Promise<any> {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const candidateModels = await getAvailableModelsForKey(apiKey);
  const promptText = getPromptForTarget(targetType);

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
                { text: promptText },
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

      if (parsedJSON.weeks || Array.isArray(parsedJSON.weeks)) {
        const rawWeeks = (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0)
          ? parsedJSON.weeks
          : [parsedJSON];
        return rawWeeks.map((w: any) => sanitizeParsedWeekTitles(w));
      }

      return parsedJSON;
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
  apiKey: string,
  targetType: string = 'meetings'
): Promise<any> {
  const parts: any[] = [];
  const promptText = getPromptForTarget(targetType);

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

  parts.push({ text: promptText });

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

      if (parsedJSON.weeks || Array.isArray(parsedJSON.weeks)) {
        const rawWeeks = (Array.isArray(parsedJSON.weeks) && parsedJSON.weeks.length > 0)
          ? parsedJSON.weeks
          : [parsedJSON];
        return rawWeeks.map((w: any) => sanitizeParsedWeekTitles(w));
      }

      return parsedJSON;
    } catch (err: any) {
      console.warn(`Model ${modelName} error:`, err);
      lastErrorMsg = err?.message || String(err);
    }
  }

  throw new Error(`Falha na IA Gemini: ${lastErrorMsg || 'Verifique sua chave de API.'}`);
}
