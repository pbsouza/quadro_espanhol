import React, { useState } from 'react';
import { 
  FileText, Upload, Sparkles, X, Check, FileCode, AlertCircle, Camera, 
  Image as ImageIcon, Loader2, ChevronLeft, ChevronRight, Calendar, Key,
  Users, Megaphone, MapPin, ListChecks
} from 'lucide-react';
import { extractTextFromFile, ParsedMeetingData } from '../utils/fileImportParser';
import { cleanPartTitle } from '../utils/textUtils';
import { formatToDDMMYYYY } from '../utils/dateUtils';
import { optimizeImage } from '../utils/imageOptimizer';
import { 
  getStoredGeminiApiKey, 
  setStoredGeminiApiKey, 
  parseImageWithClientGemini, 
  parseDocWithClientGemini 
} from '../services/geminiClientService';
import { 
  CleaningSchedule, 
  PublicWitnessingSchedule, 
  CongregationGroup, 
  Announcement 
} from '../types';

export type ImportSection = 'meetings' | 'cleaning' | 'witnessing' | 'groups' | 'announcements';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPt: boolean;
  initialSection?: ImportSection;
  initialMeetingTarget?: 'midweek' | 'weekend' | 'both';
  onApplyParsedData?: (data: ParsedMeetingData) => void;
  onApplyAllParsedWeeks?: (weeks: ParsedMeetingData[], targetType?: 'midweek' | 'weekend' | 'both') => void;
  onApplyParsedCleaning?: (items: CleaningSchedule[]) => void;
  onApplyParsedWitnessing?: (items: PublicWitnessingSchedule[]) => void;
  onApplyParsedGroups?: (items: CongregationGroup[]) => void;
  onApplyParsedAnnouncements?: (items: Announcement[]) => void;
}

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  isPt,
  initialSection = 'meetings',
  initialMeetingTarget = 'midweek',
  onApplyParsedData,
  onApplyAllParsedWeeks,
  onApplyParsedCleaning,
  onApplyParsedWitnessing,
  onApplyParsedGroups,
  onApplyParsedAnnouncements,
}) => {
  const [importSection, setImportSection] = useState<ImportSection>(initialSection);
  const [activeInputTab, setActiveInputTab] = useState<'image' | 'file' | 'text'>('image');
  const [selectedMeetingTarget, setSelectedMeetingTarget] = useState<'midweek' | 'weekend' | 'both'>(initialMeetingTarget);

  React.useEffect(() => {
    setImportSection(initialSection);
    setSelectedMeetingTarget(initialMeetingTarget);
  }, [initialSection, initialMeetingTarget, isOpen]);
  
  // File state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Results state
  const [parsedWeeks, setParsedWeeks] = useState<ParsedMeetingData[]>([]);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);

  const [parsedCleaning, setParsedCleaning] = useState<CleaningSchedule[]>([]);
  const [parsedWitnessing, setParsedWitnessing] = useState<PublicWitnessingSchedule[]>([]);
  const [parsedGroups, setParsedGroups] = useState<CongregationGroup[]>([]);
  const [parsedAnnouncements, setParsedAnnouncements] = useState<Announcement[]>([]);

  // API Key Prompt State
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [pendingAction, setPendingAction] = useState<'image' | 'doc' | null>(null);

  if (!isOpen) return null;

  const clearAllResults = () => {
    setParsedWeeks([]);
    setParsedCleaning([]);
    setParsedWitnessing([]);
    setParsedGroups([]);
    setParsedAnnouncements([]);
    setErrorMsg('');
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const isPdf = selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf');
      if (isPdf && selected.size > MAX_PDF_SIZE_BYTES) {
        setErrorMsg(isPt ? 'O arquivo PDF excede o limite máximo de 5 MB.' : 'El archivo PDF supera el límite máximo de 5 MB.');
        setDocFile(null);
        e.target.value = '';
        return;
      }
      setDocFile(selected);
      clearAllResults();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setIsProcessing(true);
      clearAllResults();

      try {
        const { file: optimizedFile, dataUrl } = await optimizeImage(selected, 1920, 1024 * 1024);
        setImageFile(optimizedFile);
        setImagePreview(dataUrl);
      } catch (err) {
        console.warn('Error optimizing image:', err);
        setImageFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selected);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processResponseJSON = (resData: any, section: ImportSection) => {
    if (section === 'meetings') {
      const rawWeeks = Array.isArray(resData.weeks) && resData.weeks.length > 0 
        ? resData.weeks 
        : (Array.isArray(resData) ? resData : [resData.data || resData]);
      
      const formatted: ParsedMeetingData[] = rawWeeks.map((item: any, idx: number) => ({
        weekLabel: item.weekLabel || undefined,
        weekDate: item.weekDate || undefined,
        meetingType: item.meetingType || 'midweek',
        rawText: `[Semana ${idx + 1}]`,
        president: item.president || undefined,
        initialSong: item.initialSong || undefined,
        initialPrayer: item.initialPrayer || undefined,
        counselorSalaB: item.counselorSalaB || undefined,
        talkTitle: item.talkTitle || undefined,
        talkSpeaker: item.talkSpeaker || undefined,
        gemsSpeaker: item.gemsSpeaker || undefined,
        readingMain: item.readingMain || undefined,
        readingSalaB: item.readingSalaB || undefined,
        facaSeuMelhor: item.facaSeuMelhor || [],
        middleSong: item.middleSong || undefined,
        nossaVidaCrista: item.nossaVidaCrista || [],
        finalSong: item.finalSong || undefined,
        finalPrayer: item.finalPrayer || undefined,
        publicTalkTitle: item.publicTalkTitle || undefined,
        speakerName: item.speakerName || undefined,
        speakerCongregation: item.speakerCongregation || undefined,
        weekendPresident: item.weekendPresident || undefined,
        weekendInitialSong: item.weekendInitialSong || undefined,
        watchtowerTitle: item.watchtowerTitle || undefined,
        watchtowerConductor: item.watchtowerConductor || undefined,
        watchtowerReader: item.watchtowerReader || undefined,
        weekendFinalSong: item.weekendFinalSong || undefined,
        weekendFinalPrayer: item.weekendFinalPrayer || undefined,
      }));
      setParsedWeeks(formatted);
      setSelectedWeekIdx(0);
      return;
    }

    if (section === 'cleaning') {
      const raw = resData.cleaning || resData.data?.cleaning || (Array.isArray(resData) ? resData : (resData.data && Array.isArray(resData.data) ? resData.data : []));
      const formatted: CleaningSchedule[] = raw.map((item: any, idx: number) => ({
        id: `clean_ai_${Date.now()}_${idx}`,
        weekLabel: item.weekLabel || item.period || item.week || item.semana || `Semana ${idx + 1}`,
        group: item.group || item.grupo || `Grupo ${idx + 1}`,
        overseer: item.overseer || item.superintendente || item.encarregado || 'Irmão encarregado',
        tasks: Array.isArray(item.tasks) && item.tasks.length > 0 
          ? item.tasks 
          : (Array.isArray(item.tarefas) && item.tarefas.length > 0 ? item.tarefas : ['Varrer o salão', 'Limpar banheiros', 'Passar pano'])
      }));
      setParsedCleaning(formatted);
      return;
    }

    if (section === 'witnessing') {
      const raw = resData.witnessing || resData.data?.witnessing || (Array.isArray(resData) ? resData : (resData.data && Array.isArray(resData.data) ? resData.data : []));
      const formatted: PublicWitnessingSchedule[] = raw.map((item: any, idx: number) => ({
        id: `wit_ai_${Date.now()}_${idx}`,
        location: item.location || item.local || item.ponto || 'Ponto do Carrinho',
        dayOfWeek: item.dayOfWeek || item.dia || item.diaDaSemana || 'Segunda-feira',
        timeSlot: item.timeSlot || item.horario || item.turno || '08:00 - 10:00',
        publishers: Array.isArray(item.publishers) ? item.publishers : (Array.isArray(item.publicadores) ? item.publicadores : [])
      }));
      setParsedWitnessing(formatted);
      return;
    }

    if (section === 'groups') {
      const raw = resData.groups || resData.data?.groups || (Array.isArray(resData) ? resData : (resData.data && Array.isArray(resData.data) ? resData.data : []));
      const formatted: CongregationGroup[] = raw.map((item: any, idx: number) => ({
        id: `grp_ai_${Date.now()}_${idx}`,
        number: typeof item.number === 'number' ? item.number : (typeof item.numero === 'number' ? item.numero : idx + 1),
        name: item.name || item.nome || `Grupo ${idx + 1}`,
        overseer: item.overseer || item.superintendente || 'Superintendente',
        assistant: item.assistant || item.ajudante || 'Ajudante',
        location: item.location || item.local || 'Local de saída',
        schedule: item.schedule || item.horario || item.dias || 'Terça a Sábado',
        members: Array.isArray(item.members) ? item.members : (Array.isArray(item.membros) ? item.membros : [])
      }));
      setParsedGroups(formatted);
      return;
    }

    if (section === 'announcements') {
      const raw = resData.announcements || resData.data?.announcements || (Array.isArray(resData) ? resData : (resData.data && Array.isArray(resData.data) ? resData.data : []));
      const formatted: Announcement[] = raw.map((item: any, idx: number) => ({
        id: `ann_ai_${Date.now()}_${idx}`,
        title: item.title || item.titulo || 'Anúncio Importante',
        content: item.content || item.conteudo || item.texto || item.descricao || 'Conteúdo do aviso',
        date: item.date || item.data || new Date().toLocaleDateString('pt-BR'),
        category: item.category === 'evento' || item.category === 'lembrete' ? item.category : 'geral',
        important: Boolean(item.important || item.importante),
        expirationDate: item.expirationDate || item.dataExpiracao || undefined
      }));
      setParsedAnnouncements(formatted);
      return;
    }
  };

  const handleAnalyzeImageWithGemini = async () => {
    if (!imageFile || !imagePreview) {
      setErrorMsg(isPt ? 'Por favor, tire uma foto ou selecione uma imagem da programação.' : 'Por favor seleccione o tome una foto de la programación.');
      return;
    }

    setIsProcessing(true);
    clearAllResults();
    setShowApiKeyPrompt(false);

    const targetTypeParam = importSection === 'meetings' ? selectedMeetingTarget : importSection;

    try {
      let resJSON: any = null;
      let serverWorked = false;

      // 1. Try server endpoint first
      try {
        const response = await fetch('/api/parse-schedule-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imagePreview,
            mimeType: imageFile.type || 'image/jpeg',
            targetType: targetTypeParam,
            isPt,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resData = await response.json();
          if (response.ok && resData.success) {
            resJSON = resData;
            serverWorked = true;
          }
        }
      } catch (srvErr) {
        console.warn('Backend image route unavailable, falling back to client Gemini:', srvErr);
      }

      // 2. Client-side Gemini fallback
      if (!serverWorked) {
        const apiKey = getStoredGeminiApiKey();
        if (!apiKey) {
          setShowApiKeyPrompt(true);
          setPendingAction('image');
          setIsProcessing(false);
          return;
        }

        resJSON = await parseImageWithClientGemini(
          imagePreview,
          imageFile.type || 'image/jpeg',
          apiKey,
          targetTypeParam
        );
      }

      processResponseJSON(resJSON, importSection);
    } catch (err: any) {
      console.error('Gemini image OCR error:', err);
      setErrorMsg(
        err?.message ||
          (isPt
            ? 'Erro ao ler a foto. Verifique a iluminação ou sua Chave de API Gemini.'
            : 'Error al leer la foto. Verifique la imagen o su Clave de API Gemini.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeTextOrDoc = async () => {
    setIsProcessing(true);
    clearAllResults();
    setShowApiKeyPrompt(false);

    const targetTypeParam = importSection === 'meetings' ? selectedMeetingTarget : importSection;

    try {
      let rawText = '';
      let pdfBase64: string | undefined = undefined;

      if (activeInputTab === 'file') {
        if (!docFile) {
          setErrorMsg(isPt ? 'Por favor, selecione um arquivo (PDF, TXT, DOC ou RTF).' : 'Por favor seleccione un archivo (PDF, TXT, DOC o RTF).');
          setIsProcessing(false);
          return;
        }

        if (docFile.type === 'application/pdf' || docFile.name.toLowerCase().endsWith('.pdf')) {
          try {
            const arrayBuf = await docFile.arrayBuffer();
            const bytes = new Uint8Array(arrayBuf);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            pdfBase64 = `data:application/pdf;base64,${btoa(binary)}`;
          } catch (e) {
            console.warn('PDF base64 read warning:', e);
          }
        }

        rawText = await extractTextFromFile(docFile);
      } else {
        if (!pastedText.trim()) {
          setErrorMsg(isPt ? 'Por favor, cole o texto da programação.' : 'Por favor pegue el texto de la programación.');
          setIsProcessing(false);
          return;
        }
        rawText = pastedText;
      }

      let resJSON: any = null;
      let serverWorked = false;

      // 1. Try server endpoint first
      try {
        const response = await fetch('/api/parse-schedule-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: rawText || undefined,
            fileBase64: pdfBase64,
            mimeType: docFile?.type || 'text/plain',
            targetType: targetTypeParam,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resData = await response.json();
          if (response.ok && resData.success) {
            resJSON = resData;
            serverWorked = true;
          }
        }
      } catch (srvErr) {
        console.warn('Backend document route unavailable, falling back to client Gemini:', srvErr);
      }

      // 2. Client-side Gemini fallback
      if (!serverWorked) {
        const apiKey = getStoredGeminiApiKey();
        if (!apiKey) {
          setShowApiKeyPrompt(true);
          setPendingAction('doc');
          setIsProcessing(false);
          return;
        }

        resJSON = await parseDocWithClientGemini(
          rawText,
          pdfBase64,
          docFile?.type || 'text/plain',
          apiKey,
          targetTypeParam
        );
      }

      processResponseJSON(resJSON, importSection);
    } catch (err: any) {
      console.error('Document AI parsing error:', err);
      setErrorMsg(
        err?.message ||
          (isPt ? 'Erro ao ler e analisar o arquivo com IA. Verifique o formato.' : 'Error al leer y analizar el archivo con IA.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setStoredGeminiApiKey(apiKeyInput.trim());
    setShowApiKeyPrompt(false);
    if (pendingAction === 'image') {
      handleAnalyzeImageWithGemini();
    } else if (pendingAction === 'doc') {
      handleAnalyzeTextOrDoc();
    }
  };

  const handleConfirmApplySingle = () => {
    if (parsedWeeks.length > 0 && selectedWeekIdx < parsedWeeks.length) {
      onApplyParsedData?.(parsedWeeks[selectedWeekIdx]);
      onClose();
    }
  };

  const handleConfirmApplyAll = () => {
    if (parsedWeeks.length > 0 && onApplyAllParsedWeeks) {
      onApplyAllParsedWeeks(parsedWeeks, selectedMeetingTarget);
      onClose();
    }
  };

  const handleConfirmApplyCleaning = () => {
    if (parsedCleaning.length > 0 && onApplyParsedCleaning) {
      onApplyParsedCleaning(parsedCleaning);
      onClose();
    }
  };

  const handleConfirmApplyWitnessing = () => {
    if (parsedWitnessing.length > 0 && onApplyParsedWitnessing) {
      onApplyParsedWitnessing(parsedWitnessing);
      onClose();
    }
  };

  const handleConfirmApplyGroups = () => {
    if (parsedGroups.length > 0 && onApplyParsedGroups) {
      onApplyParsedGroups(parsedGroups);
      onClose();
    }
  };

  const handleConfirmApplyAnnouncements = () => {
    if (parsedAnnouncements.length > 0 && onApplyParsedAnnouncements) {
      onApplyParsedAnnouncements(parsedAnnouncements);
      onClose();
    }
  };

  const activeParsed = parsedWeeks[selectedWeekIdx] || parsedWeeks[0];

  const hasAnyResults = 
    parsedWeeks.length > 0 || 
    parsedCleaning.length > 0 || 
    parsedWitnessing.length > 0 || 
    parsedGroups.length > 0 || 
    parsedAnnouncements.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#1C4123] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isPt ? 'Leitura Inteligente com IA' : 'Lectura Inteligente con IA'}
              </h3>
              <p className="text-xs text-stone-200 font-medium">
                {isPt
                  ? 'Envie uma foto ou documento para ler e extrair a programação com IA'
                  : 'Suba una foto o documento para extraer la programación con IA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {/* Section Selection Tabs */}
          <div className="bg-stone-100 p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-1 border border-stone-200">
            <button
              onClick={() => {
                setImportSection('meetings');
                clearAllResults();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                importSection === 'meetings' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isPt ? 'Reuniões' : 'Reuniones'}</span>
            </button>

            <button
              onClick={() => {
                setImportSection('cleaning');
                clearAllResults();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                importSection === 'cleaning' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>{isPt ? 'Limpeza' : 'Limpieza'}</span>
            </button>

            <button
              onClick={() => {
                setImportSection('witnessing');
                clearAllResults();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                importSection === 'witnessing' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isPt ? 'Testemunho' : 'Predicación'}</span>
            </button>

            <button
              onClick={() => {
                setImportSection('groups');
                clearAllResults();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                importSection === 'groups' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isPt ? 'Grupos' : 'Grupos'}</span>
            </button>

            <button
              onClick={() => {
                setImportSection('announcements');
                clearAllResults();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                importSection === 'announcements' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{isPt ? 'Anúncios' : 'Anuncios'}</span>
            </button>
          </div>

          {/* Target Meeting Sub-type if Meetings section is selected */}
          {importSection === 'meetings' && (
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#1C4123] block">
                  {isPt ? 'Tipo de Reunião:' : 'Tipo de Reunión:'}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">
                  {isPt ? 'Especifique para qual reunião estes dados são.' : 'Especifique a qué reunión pertenecen estos datos.'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMeetingTarget('midweek')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedMeetingTarget === 'midweek' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {isPt ? 'Meio de Semana' : 'Entre Semana'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMeetingTarget('weekend')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedMeetingTarget === 'weekend' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {isPt ? 'Fim de Semana' : 'Fin de Semana'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMeetingTarget('both')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedMeetingTarget === 'both' ? 'bg-[#1C4123] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {isPt ? 'Ambas' : 'Ambas'}
                </button>
              </div>
            </div>
          )}

          {/* Option Input Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActiveInputTab('image');
                  setErrorMsg('');
                  setShowApiKeyPrompt(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeInputTab === 'image'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>{isPt ? 'Foto / Imagem (Visão IA)' : 'Foto / Imagen (Visión IA)'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveInputTab('file');
                  setErrorMsg('');
                  setShowApiKeyPrompt(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeInputTab === 'file'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isPt ? 'Documento (PDF, TXT, RTF)' : 'Documento (PDF, TXT, RTF)'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveInputTab('text');
                  setErrorMsg('');
                  setShowApiKeyPrompt(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeInputTab === 'text'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isPt ? 'Colar Texto' : 'Pegar Texto'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowApiKeyPrompt(!showApiKeyPrompt)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer py-1 px-2 rounded-lg hover:bg-stone-100 transition"
              title={isPt ? 'Configurar Chave Gemini' : 'Configurar Clave Gemini'}
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{isPt ? 'Chave IA' : 'Clave IA'}</span>
            </button>
          </div>

          {/* API Key Prompt Box */}
          {showApiKeyPrompt && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span>{isPt ? 'Chave de API Gemini (Para Acesso Direto)' : 'Clave de API Gemini'}</span>
                <button onClick={() => setShowApiKeyPrompt(false)} className="text-amber-700 hover:text-amber-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-amber-800">
                {isPt
                  ? 'Forneça sua chave de API do Gemini para ler fotos e documentos diretamente do navegador.'
                  : 'Proporcione su clave de API de Gemini para leer fotos y documentos desde el navegador.'}
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isPt ? 'Cole sua AI Studio API Key aqui...' : 'Pegue su AI Studio API Key aquí...'}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {isPt ? 'Salvar e Continuar' : 'Guardar y Continuar'}
                </button>
              </div>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-800 hover:underline font-semibold"
                >
                  {isPt ? 'Obter chave gratuita no Google AI Studio →' : 'Obtener clave gratuita en Google AI Studio →'}
                </a>
              </div>
            </div>
          )}

          {/* Tab 1: Image / Vision AI */}
          {activeInputTab === 'image' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-stone-300 hover:border-[#1C4123] rounded-2xl p-6 text-center bg-stone-50 transition relative">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-60 mx-auto rounded-xl shadow-md border border-stone-200 object-contain"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-1.5 rounded-xl text-xs transition">
                        {isPt ? 'Trocar Foto' : 'Cambiar Foto'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          clearAllResults();
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                      >
                        {isPt ? 'Remover' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-[#1C4123] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 text-sm">
                        {isPt ? 'Tire uma foto do quadro/escala ou escolha uma imagem' : 'Tome una foto o seleccione una imagen'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {isPt ? 'Formatos aceitos: JPG, PNG, WEBP, HEIC' : 'Formatos aceptados: JPG, PNG, WEBP'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <label className="cursor-pointer bg-[#1C4123] hover:bg-[#285A31] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>{isPt ? 'Tirar Foto com Câmera' : 'Tomar Foto con Cámara'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>{isPt ? 'Selecionar da Galeria' : 'Seleccionar de Galería'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {imagePreview && !hasAnyResults && (
                <button
                  onClick={handleAnalyzeImageWithGemini}
                  disabled={isProcessing}
                  className="w-full bg-[#1C4123] hover:bg-[#285A31] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isPt ? 'Lendo e Analisando Foto com IA...' : 'Analizando Foto con IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>{isPt ? 'Analisar e Extrair Dados com IA' : 'Analizar y Extraer Datos con IA'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Tab 2: Document */}
          {activeInputTab === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-stone-300 hover:border-[#1C4123] rounded-2xl p-6 text-center bg-stone-50 transition">
                <input
                  type="file"
                  id="doc-file-input"
                  accept=".pdf,.txt,.doc,.docx,.rtf"
                  onChange={handleDocChange}
                  className="hidden"
                />
                <label htmlFor="doc-file-input" className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-[#1C4123] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">
                      {docFile ? docFile.name : isPt ? 'Arraste o arquivo (PDF, TXT, DOC, RTF) aqui' : 'Arrastre el archivo (PDF, TXT, DOC, RTF) aquí'}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {docFile
                        ? `${(docFile.size / 1024).toFixed(1)} KB`
                        : isPt ? 'PDF, TXT, DOC, DOCX ou RTF (máx 5 MB)' : 'PDF, TXT, DOC, DOCX o RTF (máx 5 MB)'}
                    </p>
                  </div>
                  <span className="inline-block bg-[#1C4123] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
                    {isPt ? 'Escolher Arquivo' : 'Elegir Archivo'}
                  </span>
                </label>
              </div>

              {docFile && !hasAnyResults && (
                <button
                  onClick={handleAnalyzeTextOrDoc}
                  disabled={isProcessing}
                  className="w-full bg-[#1C4123] hover:bg-[#285A31] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isPt ? 'Lendo e Processando Arquivo com IA...' : 'Leyendo y Procesando Archivo con IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>{isPt ? 'Analisar e Extrair Dados com IA' : 'Analizar y Extraer Datos con IA'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Tab 3: Text */}
          {activeInputTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isPt ? 'Cole abaixo o texto da programação:' : 'Pegue abajo el texto de la programación:'}
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    clearAllResults();
                  }}
                  placeholder={isPt ? 'Cole aqui o texto do programa, lista ou arquivo...' : 'Pegue aquí el texto del programa o lista...'}
                  className="w-full p-3 border border-stone-300 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-[#1C4123] focus:border-transparent outline-none"
                />
              </div>

              {pastedText.trim() && !hasAnyResults && (
                <button
                  onClick={handleAnalyzeTextOrDoc}
                  disabled={isProcessing}
                  className="w-full bg-[#1C4123] hover:bg-[#285A31] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isPt ? 'Lendo e Processando Texto com IA...' : 'Procesando Texto con IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>{isPt ? 'Analisar e Extrair Dados com IA' : 'Analizar y Extraer Datos con IA'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isPt ? 'Erro na Leitura:' : 'Error en la lectura:'}</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* RESULTS: Meetings */}
          {importSection === 'meetings' && parsedWeeks.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {isPt ? `Encontradas ${parsedWeeks.length} Semanas Extraídas!` : `¡Encontradas ${parsedWeeks.length} Semanas Extraídas!`}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPt ? 'Revise os dados abaixo e confirme para salvar.' : 'Revise los datos abajo y confirme para guardar.'}
                    </p>
                  </div>
                </div>

                {parsedWeeks.length > 1 && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                    <button
                      onClick={() => setSelectedWeekIdx(Math.max(0, selectedWeekIdx - 1))}
                      disabled={selectedWeekIdx === 0}
                      className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-stone-800">
                      Semana {selectedWeekIdx + 1} de {parsedWeeks.length}
                    </span>
                    <button
                      onClick={() => setSelectedWeekIdx(Math.min(parsedWeeks.length - 1, selectedWeekIdx + 1))}
                      disabled={selectedWeekIdx === parsedWeeks.length - 1}
                      className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Week detail card */}
              {activeParsed && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-200 flex justify-between">
                    <span>{activeParsed.weekLabel ? formatToDDMMYYYY(activeParsed.weekLabel) : `Semana ${selectedWeekIdx + 1}`}</span>
                    <span className="text-stone-500 font-medium">
                      {activeParsed.president ? `Presidente: ${activeParsed.president}` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                    {activeParsed.talkTitle && (
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-stone-500 block font-medium">Tesouros / Discurso:</span>
                        <span className="font-bold text-stone-900">{cleanPartTitle(activeParsed.talkTitle)}</span>
                        {activeParsed.talkSpeaker && <span className="block text-stone-600">Orador: {activeParsed.talkSpeaker}</span>}
                      </div>
                    )}

                    {activeParsed.publicTalkTitle && (
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-stone-500 block font-medium">Discurso Público:</span>
                        <span className="font-bold text-stone-900">{cleanPartTitle(activeParsed.publicTalkTitle)}</span>
                        {activeParsed.speakerName && <span className="block text-stone-600">Orador: {activeParsed.speakerName}</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={clearAllResults}
                      className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs text-stone-700 transition cursor-pointer"
                    >
                      {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                    </button>

                    <div className="flex items-center gap-2">
                      {parsedWeeks.length > 1 && (
                        <button
                          onClick={handleConfirmApplyAll}
                          className="bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>{isPt ? `Acrescentar Todas as ${parsedWeeks.length} Semanas no Banco` : `Acrescentar Todas as Semanas`}</span>
                        </button>
                      )}

                      <button
                        onClick={handleConfirmApplySingle}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isPt ? 'Preencher Formulário' : 'Llenar Formulario'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESULTS: Cleaning */}
          {importSection === 'cleaning' && parsedCleaning.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {isPt ? `Encontradas ${parsedCleaning.length} Escalas de Limpeza!` : `¡Encontradas ${parsedCleaning.length} Escalas de Limpieza!`}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPt ? 'Confirme para acrescentar à escala de limpeza.' : 'Confirme para agregar al programa de limpieza.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parsedCleaning.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>Período: {item.weekLabel}</span>
                      <span className="text-emerald-800">{item.group}</span>
                    </div>
                    <p className="text-stone-600">Encarregado: <span className="font-semibold text-stone-800">{item.overseer}</span></p>
                    {item.tasks && item.tasks.length > 0 && (
                      <div className="text-stone-500 pt-1 border-t border-stone-200">
                        <span className="font-semibold text-stone-700">Tarefas: </span>
                        {item.tasks.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  onClick={clearAllResults}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs text-stone-700 transition cursor-pointer"
                >
                  {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                </button>
                <button
                  onClick={handleConfirmApplyCleaning}
                  className="bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isPt ? 'Salvar Escala de Limpeza no Banco' : 'Guardar Limpieza en Banco'}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS: Witnessing */}
          {importSection === 'witnessing' && parsedWitnessing.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {isPt ? `Encontrados ${parsedWitnessing.length} Turnos de Testemunho!` : `¡Encontrados ${parsedWitnessing.length} Turnos de Predicación!`}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPt ? 'Confirme para acrescentar à escala de testemunho público.' : 'Confirme para agregar a la escala de predicación.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parsedWitnessing.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{item.location}</span>
                      <span className="text-emerald-800">{item.dayOfWeek} ({item.timeSlot})</span>
                    </div>
                    {item.publishers && item.publishers.length > 0 && (
                      <p className="text-stone-600">
                        Publicadores: <span className="font-semibold text-stone-800">{item.publishers.join(', ')}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  onClick={clearAllResults}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs text-stone-700 transition cursor-pointer"
                >
                  {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                </button>
                <button
                  onClick={handleConfirmApplyWitnessing}
                  className="bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isPt ? 'Salvar Testemunho no Banco' : 'Guardar Predicación'}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS: Groups */}
          {importSection === 'groups' && parsedGroups.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {isPt ? `Encontrados ${parsedGroups.length} Grupos de Campo!` : `¡Encontrados ${parsedGroups.length} Grupos de Servicio!`}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPt ? 'Confirme para acrescentar os grupos ao sistema.' : 'Confirme para agregar los grupos.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parsedGroups.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{item.name || `Grupo ${item.number}`}</span>
                      <span className="text-emerald-800">Superintendente: {item.overseer}</span>
                    </div>
                    <p className="text-stone-600">Local de Saída: <span className="font-semibold text-stone-800">{item.location}</span> ({item.schedule})</p>
                    {item.members && item.members.length > 0 && (
                      <p className="text-stone-500 pt-1 border-t border-stone-200">
                        Integrantes ({item.members.length}): {item.members.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  onClick={clearAllResults}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs text-stone-700 transition cursor-pointer"
                >
                  {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                </button>
                <button
                  onClick={handleConfirmApplyGroups}
                  className="bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isPt ? 'Salvar Grupos no Banco' : 'Guardar Grupos'}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS: Announcements */}
          {importSection === 'announcements' && parsedAnnouncements.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {isPt ? `Encontrados ${parsedAnnouncements.length} Anúncios!` : `¡Encontrados ${parsedAnnouncements.length} Anuncios!`}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPt ? 'Confirme para acrescentar os anúncios ao quadro.' : 'Confirme para agregar los anuncios.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parsedAnnouncements.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{item.title}</span>
                      <span className="text-stone-500 font-normal">{item.date}</span>
                    </div>
                    <p className="text-stone-700">{item.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  onClick={clearAllResults}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs text-stone-700 transition cursor-pointer"
                >
                  {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                </button>
                <button
                  onClick={handleConfirmApplyAnnouncements}
                  className="bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isPt ? 'Salvar Anúncios no Banco' : 'Guardar Anuncios'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
