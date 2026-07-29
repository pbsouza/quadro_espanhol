import * as pdfjsLib from 'pdfjs-dist';
import { cleanPartTitle } from './textUtils';

// Set PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF worker setup error:', e);
}

export interface ParsedMeetingData {
  weekLabel?: string;
  weekDate?: string;
  meetingType: 'midweek' | 'weekend' | 'both';
  rawText: string;

  // Midweek fields
  president?: string;
  initialSong?: string;
  initialPrayer?: string;
  counselorSalaB?: string;

  talkTitle?: string;
  talkSpeaker?: string;
  gemsSpeaker?: string;
  readingMain?: string;
  readingSalaB?: string;

  facaSeuMelhor?: Array<{
    id?: string;
    title: string;
    durationMin?: number;
    assignedMain?: string;
    assignedAssistant?: string;
    assignedSalaB?: string;
    assignedSalaBAssistant?: string;
  }>;

  middleSong?: string;

  nossaVidaCrista?: Array<{
    id?: string;
    title: string;
    durationMin?: number;
    speaker?: string;
    reader?: string;
    isBibleStudy?: boolean;
  }>;

  finalSong?: string;
  finalPrayer?: string;

  // Weekend fields
  publicTalkTitle?: string;
  speakerName?: string;
  speakerCongregation?: string;
  weekendPresident?: string;
  weekendInitialSong?: string;
  watchtowerTitle?: string;
  watchtowerConductor?: string;
  watchtowerReader?: string;
  weekendFinalSong?: string;
  weekendFinalPrayer?: string;
}

/**
 * Extract plain text from PDF file
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join('\n');
    fullText += pageText + '\n';
  }
  return fullText;
}

/**
 * Extract plain text from RTF file
 */
export function extractTextFromRtf(rtfContent: string): string {
  return rtfContent
    .replace(/\\rtf1[\s\S]*?\\fonttbl[\s\S]*?\\colortbl[\s\S]*?\\viewkind4/g, '')
    .replace(/\\[a-z0-9]+\b/gi, '')
    .replace(/[\{\}]/g, '')
    .replace(/;\r?\n?/g, '\n')
    .trim();
}

/**
 * Extract plain text from DOC / DOCX / XML raw strings
 */
export function extractTextFromDocx(rawContent: string): string {
  if (rawContent.includes('<w:t>') || rawContent.includes('<w:t ')) {
    const matches = rawContent.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
    if (matches && matches.length > 0) {
      return matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
    }
  }
  return rawContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Read text from uploaded file (.pdf, .txt, .rtf, .doc, .docx)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPdf(file);
  } else if (fileName.endsWith('.rtf')) {
    const raw = await file.text();
    return extractTextFromRtf(raw);
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    const raw = await file.text();
    return extractTextFromDocx(raw);
  } else {
    // Plain text or CSV or TXT
    return await file.text();
  }
}

/**
 * Helper to clean up value strings (remove key names, colons, leading dashes)
 */
function cleanValue(text: string, ...keysToRemove: string[]): string {
  let result = text;
  for (const key of keysToRemove) {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, '');
  }
  return result.replace(/^[:\-\s\t–—]+/, '').trim();
}

/**
 * Helper to extract Cântico number or name
 */
function extractSong(line: string): string | undefined {
  const match = line.match(/(?:cântico|cántico|song)\s*(\d+|\w+[\w\s]*)/i);
  if (match) {
    if (/^\d+$/.test(match[1])) {
      return `Cântico ${match[1]}`;
    }
    return match[0].trim();
  }
  return undefined;
}

/**
 * Parse text content into structured meeting fields
 */
export function parseMeetingText(text: string): ParsedMeetingData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: ParsedMeetingData = {
    meetingType: 'midweek',
    rawText: text,
    facaSeuMelhor: [],
    nossaVidaCrista: [],
  };

  // Check if text refers to Weekend meeting
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes('sentinela') ||
    lowerText.includes('discurso público') ||
    lowerText.includes('orador convidado')
  ) {
    if (
      lowerText.includes('tesouros') ||
      lowerText.includes('faça seu melhor') ||
      lowerText.includes('joias espirituais')
    ) {
      result.meetingType = 'both';
    } else {
      result.meetingType = 'weekend';
    }
  }

  const songsFound: string[] = [];
  lines.forEach((l) => {
    const s = extractSong(l);
    if (s && !songsFound.includes(s)) {
      songsFound.push(s);
    }
  });

  if (songsFound.length >= 1) result.initialSong = songsFound[0];
  if (songsFound.length >= 2) result.middleSong = songsFound[1];
  if (songsFound.length >= 3) result.finalSong = songsFound[2];

  let currentSection: 'tesouros' | 'facaSeuMelhor' | 'nossaVidaCrista' | 'none' = 'none';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Section detection
    if (lower.includes('tesouros da palavra') || lower.includes('tesoros de la palabra')) {
      currentSection = 'tesouros';
      continue;
    }
    if (lower.includes('faça seu melhor') || lower.includes('seamos melhores') || lower.includes('ministerio')) {
      currentSection = 'facaSeuMelhor';
      continue;
    }
    if (lower.includes('nossa vida cristã') || lower.includes('nuestra vida cristiana')) {
      currentSection = 'nossaVidaCrista';
      continue;
    }

    // Presidente
    if (lower.startsWith('presidente') || lower.includes('presidente da reunião') || lower.includes('presidente:')) {
      result.president = cleanValue(line, 'presidente da reunião', 'presidente de reunión', 'presidente');
      if (!result.weekendPresident) result.weekendPresident = result.president;
    }

    // Oração inicial / oração de abertura
    if (lower.includes('oração inicial') || lower.includes('oración inicial') || lower.includes('oração de abertura')) {
      result.initialPrayer = cleanValue(line, 'oração inicial', 'oración inicial', 'oração de abertura');
    }

    // Oração final
    if (lower.includes('oração final') || lower.includes('oración final')) {
      result.finalPrayer = cleanValue(line, 'oração final', 'oración final');
      if (!result.weekendFinalPrayer) result.weekendFinalPrayer = result.finalPrayer;
    }

    // Conselheiro Sala B
    if (lower.includes('conselheiro') || lower.includes('consejero') || lower.includes('sala b:')) {
      if (!result.counselorSalaB && (lower.includes('sala b') || lower.includes('conselheiro') || lower.includes('consejero'))) {
        result.counselorSalaB = cleanValue(line, 'conselheiro sala b', 'consejero sala b', 'conselheiro', 'consejero');
      }
    }

    // Discurso / Orador (Tesouros)
    if (lower.includes('1. discurso') || lower.includes('discurso (10 min)') || (currentSection === 'tesouros' && lower.includes('discurso'))) {
      const speaker = cleanValue(line, '1. discurso (10 min)', '1. discurso', 'discurso (10 min)', 'discurso', 'orador:');
      if (speaker) result.talkSpeaker = speaker;
    }

    // Tema Discurso
    if (lower.includes('tema discurso') || lower.includes('tema do discurso')) {
      result.talkTitle = cleanValue(line, 'tema discurso', 'tema do discurso');
    }

    // Joias Espirituais / Busquemos Perlas
    if (lower.includes('joias espirituais') || lower.includes('busquemos perlas') || lower.includes('2. joias')) {
      const speaker = cleanValue(line, '2. joias espirituais (10 min)', 'joias espirituais (10 min)', 'joias espirituais', 'busquemos perlas escondidas', 'orador:');
      if (speaker) result.gemsSpeaker = speaker;
    }

    // Leitura da Bíblia
    if (lower.includes('leitura da bíblia') || lower.includes('lectura de la biblia') || lower.includes('3. leitura')) {
      if (lower.includes('sala b')) {
        result.readingSalaB = cleanValue(line, '3. leitura da bíblia (sala b)', 'leitura da bíblia (sala b)', 'lectura de la biblia (sala b)', 'sala b:');
      } else {
        const val = cleanValue(line, '3. leitura da bíblia (4 min)', '3. leitura da bíblia', 'leitura da bíblia (4 min)', 'leitura da bíblia', 'lectura de la biblia', 'salão principal:');
        if (val) result.readingMain = val;
      }
    }

    // Faça Seu Melhor Parts Parsing
    if (
      currentSection === 'facaSeuMelhor' ||
      lower.includes('iniciando conversas') ||
      lower.includes('cultivando o interesse') ||
      lower.includes('fazendo discípulos') ||
      lower.includes('explicando suas crenças') ||
      lower.includes('primeira conversa') ||
      lower.includes('revisita')
    ) {
      if (
        line.includes(':') ||
        line.includes('—') ||
        lower.includes('ajudante') ||
        lower.includes('estudante') ||
        lower.includes('designado')
      ) {
        // Parse Title & Assignees
        const parts = line.split(/[:—]/);
        if (parts.length >= 2) {
          const partTitle = parts[0].trim();
          const rest = parts.slice(1).join(':').trim();

          // Check if assistant is included
          let assignedMain = rest;
          let assignedAssistant = '';

          if (rest.toLowerCase().includes('ajudante')) {
            const splitAssist = rest.split(/ajudante[:\s\t]+/i);
            assignedMain = splitAssist[0].replace(/[\/,\-\(]/g, '').trim();
            assignedAssistant = splitAssist[1] ? splitAssist[1].replace(/[\)]/g, '').trim() : '';
          } else if (rest.includes('/')) {
            const splitPair = rest.split('/');
            assignedMain = splitPair[0].trim();
            assignedAssistant = splitPair[1].trim();
          }

          if (partTitle.length > 2 && result.facaSeuMelhor) {
            result.facaSeuMelhor.push({
              id: `imported_m_${Date.now()}_${i}`,
              title: cleanPartTitle(partTitle),
              durationMin: 4,
              assignedMain,
              assignedAssistant,
            });
          }
        }
      }
    }

    // Nossa Vida Cristã Parsing
    if (
      currentSection === 'nossaVidaCrista' ||
      lower.includes('necessidades locais') ||
      lower.includes('estudo bíblico de congregação') ||
      lower.includes('estudo bíblico da congregação')
    ) {
      if (line.includes(':') || line.includes('—')) {
        const parts = line.split(/[:—]/);
        if (parts.length >= 2) {
          const title = parts[0].trim();
          const rest = parts.slice(1).join(':').trim();

          const isBibleStudy = lower.includes('estudo bíblico');
          let speaker = rest;
          let reader = '';

          if (isBibleStudy && rest.toLowerCase().includes('leitor')) {
            const splitRead = rest.split(/leitor[:\s\t]+/i);
            speaker = splitRead[0].replace(/[\/,\-\(\)]/g, '').trim();
            reader = splitRead[1] ? splitRead[1].replace(/[\)]/g, '').trim() : '';
          }

          if (title.length > 2 && result.nossaVidaCrista) {
            result.nossaVidaCrista.push({
              id: `imported_v_${Date.now()}_${i}`,
              title: cleanPartTitle(title),
              durationMin: isBibleStudy ? 30 : 15,
              speaker,
              reader,
              isBibleStudy,
            });
          }
        }
      }
    }

    // Weekend Meeting Specific Fields
    if (lower.includes('discurso público') || lower.includes('tema do discurso público')) {
      result.publicTalkTitle = cleanValue(line, 'discurso público', 'tema do discurso público', 'tema:');
    }
    if (lower.includes('orador:') || lower.includes('orador convidado')) {
      result.speakerName = cleanValue(line, 'orador convidado', 'orador:');
    }
    if (lower.includes('congregação do orador') || lower.includes('congregação:')) {
      result.speakerCongregation = cleanValue(line, 'congregação do orador', 'congregação:');
    }
    if (lower.includes('estudo de a sentinela') || lower.includes('estudo da sentinela')) {
      result.watchtowerTitle = cleanValue(line, 'estudo de a sentinela', 'estudo da sentinela', 'tema:');
    }
    if (lower.includes('dirigente:') || lower.includes('dirigente da sentinela')) {
      result.watchtowerConductor = cleanValue(line, 'dirigente da sentinela', 'dirigente:');
    }
    if (lower.includes('leitor da sentinela') || lower.includes('leitor:')) {
      result.watchtowerReader = cleanValue(line, 'leitor da sentinela', 'leitor:');
    }
  }

  // Ensure default structure if empty
  if (!result.facaSeuMelhor || result.facaSeuMelhor.length === 0) {
    result.facaSeuMelhor = [
      { id: 'm1', title: 'Iniciando Conversas (3 min.)', durationMin: 3, assignedMain: '', assignedAssistant: '' },
      { id: 'm2', title: 'Cultivando o Interesse (4 min.)', durationMin: 4, assignedMain: '', assignedAssistant: '' },
      { id: 'm3', title: 'Fazendo Discípulos (5 min.)', durationMin: 5, assignedMain: '', assignedAssistant: '' },
    ];
  }

  if (!result.nossaVidaCrista || result.nossaVidaCrista.length === 0) {
    result.nossaVidaCrista = [
      { id: 'v1', title: 'Necessidades Locais (15 min.)', durationMin: 15, speaker: '' },
      { id: 'v2', title: 'Estudo Bíblico de Congregação (30 min.)', durationMin: 30, speaker: '', reader: '', isBibleStudy: true },
    ];
  }

  return result;
}
