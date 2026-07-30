import React, { useState } from 'react';
import { FileText, Upload, Sparkles, X, Check, FileCode, AlertCircle, Camera, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight, Calendar, Key } from 'lucide-react';
import { extractTextFromFile, parseMeetingText, ParsedMeetingData } from '../utils/fileImportParser';
import { cleanPartTitle } from '../utils/textUtils';
import { formatToDDMMYYYY } from '../utils/dateUtils';
import { optimizeImage } from '../utils/imageOptimizer';
import { 
  getStoredGeminiApiKey, 
  setStoredGeminiApiKey, 
  parseImageWithClientGemini, 
  parseDocWithClientGemini 
} from '../services/geminiClientService';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPt: boolean;
  initialMeetingTarget?: 'midweek' | 'weekend' | 'both';
  onApplyParsedData: (data: ParsedMeetingData) => void;
  onApplyAllParsedWeeks?: (weeks: ParsedMeetingData[], targetType?: 'midweek' | 'weekend' | 'both') => void;
}

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  isPt,
  initialMeetingTarget = 'midweek',
  onApplyParsedData,
  onApplyAllParsedWeeks,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'image' | 'file' | 'text'>('image');
  const [selectedMeetingTarget, setSelectedMeetingTarget] = useState<'midweek' | 'weekend' | 'both'>(initialMeetingTarget);

  React.useEffect(() => {
    setSelectedMeetingTarget(initialMeetingTarget);
  }, [initialMeetingTarget, isOpen]);
  
  // File state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedWeeks, setParsedWeeks] = useState<ParsedMeetingData[]>([]);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);

  // API Key Prompt State for GitHub Pages / Static hosting
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [pendingAction, setPendingAction] = useState<'image' | 'doc' | null>(null);

  if (!isOpen) return null;

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
      setErrorMsg('');
      setParsedWeeks([]);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setIsProcessing(true);
      setErrorMsg('');
      setParsedWeeks([]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type.startsWith('image/')) {
        setActiveInputTab('image');
        setIsProcessing(true);
        setErrorMsg('');
        setParsedWeeks([]);

        try {
          const { file: optimizedFile, dataUrl } = await optimizeImage(dropped, 1920, 1024 * 1024);
          setImageFile(optimizedFile);
          setImagePreview(dataUrl);
        } catch (err) {
          setImageFile(dropped);
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(dropped);
        } finally {
          setIsProcessing(false);
        }
      } else {
        const isPdf = dropped.type === 'application/pdf' || dropped.name.toLowerCase().endsWith('.pdf');
        if (isPdf && dropped.size > MAX_PDF_SIZE_BYTES) {
          setErrorMsg(isPt ? 'O arquivo PDF excede o limite máximo de 5 MB.' : 'El archivo PDF supera el límite máximo de 5 MB.');
          setDocFile(null);
          return;
        }
        setActiveInputTab('file');
        setDocFile(dropped);
        setErrorMsg('');
        setParsedWeeks([]);
      }
    }
  };

  const formatRawWeeks = (rawWeeks: any[]): ParsedMeetingData[] => {
    return rawWeeks.map((item, idx) => ({
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
  };

  const handleAnalyzeImageWithGemini = async () => {
    if (!imageFile || !imagePreview) {
      setErrorMsg(isPt ? 'Por favor, tire uma foto ou selecione uma imagem da programação.' : 'Por favor seleccione o tome una foto de la programación.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setParsedWeeks([]);
    setShowApiKeyPrompt(false);

    try {
      let rawWeeksList: any[] = [];
      let serverWorked = false;

      // 1. Try server endpoint first
      try {
        const response = await fetch('/api/parse-schedule-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imagePreview,
            mimeType: imageFile.type || 'image/jpeg',
            isPt,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resData = await response.json();
          if (response.ok && resData.success) {
            rawWeeksList = resData.weeks && resData.weeks.length > 0 ? resData.weeks : [resData.data];
            serverWorked = true;
          }
        }
      } catch (srvErr) {
        console.warn('Backend image route unavailable (static host/GitHub Pages), falling back to client Gemini:', srvErr);
      }

      // 2. Client-side Gemini fallback if on GitHub Pages / static host
      if (!serverWorked) {
        const apiKey = getStoredGeminiApiKey();
        if (!apiKey) {
          setShowApiKeyPrompt(true);
          setPendingAction('image');
          setIsProcessing(false);
          return;
        }

        rawWeeksList = await parseImageWithClientGemini(
          imagePreview,
          imageFile.type || 'image/jpeg',
          apiKey
        );
      }

      const formatted = formatRawWeeks(rawWeeksList);
      setParsedWeeks(formatted);
      setSelectedWeekIdx(0);
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
    setErrorMsg('');
    setParsedWeeks([]);
    setShowApiKeyPrompt(false);

    try {
      let rawText = '';
      let pdfBase64: string | undefined = undefined;

      if (activeInputTab === 'file') {
        if (!docFile) {
          setErrorMsg(isPt ? 'Por favor, selecione um arquivo (PDF, TXT, DOC ou RTF).' : 'Por favor seleccione un archivo (PDF, TXT, DOC o RTF).');
          setIsProcessing(false);
          return;
        }

        // Try reading base64 if PDF
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

      let aiWeeksResult: ParsedMeetingData[] = [];
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
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resData = await response.json();
          if (response.ok && resData.success) {
            const list = resData.weeks && resData.weeks.length > 0 ? resData.weeks : (resData.data ? [resData.data] : []);
            if (list.length > 0) {
              aiWeeksResult = formatRawWeeks(list);
              serverWorked = true;
            }
          }
        }
      } catch (srvErr) {
        console.warn('Backend doc route unavailable (static host/GitHub Pages), falling back to client Gemini:', srvErr);
      }

      // 2. Client-side Gemini fallback for GitHub Pages
      if (!serverWorked) {
        const apiKey = getStoredGeminiApiKey();
        if (apiKey) {
          try {
            const rawWeeks = await parseDocWithClientGemini(rawText, pdfBase64, docFile?.type, apiKey);
            if (rawWeeks && rawWeeks.length > 0) {
              aiWeeksResult = formatRawWeeks(rawWeeks);
            }
          } catch (clientGeminiErr) {
            console.warn('Client Gemini parsing error, falling back to local regex parser:', clientGeminiErr);
          }
        } else if (pdfBase64 || activeInputTab === 'file') {
          // If PDF/File and no API key set on static host, prompt for API key
          setShowApiKeyPrompt(true);
          setPendingAction('doc');
          setIsProcessing(false);
          return;
        }
      }

      if (aiWeeksResult.length > 0) {
        setParsedWeeks(aiWeeksResult);
        setSelectedWeekIdx(0);
      } else if (rawText && rawText.trim().length > 0) {
        // Fallback to local regex parser
        const parsed = parseMeetingText(rawText);
        setParsedWeeks([parsed]);
        setSelectedWeekIdx(0);
      } else {
        throw new Error(isPt ? 'Não foi possível extrair texto do arquivo.' : 'No se pudo extraer texto del archivo.');
      }
    } catch (err: any) {
      console.error('File import error:', err);
      setErrorMsg(
        err?.message || (isPt ? 'Erro ao ler e analisar o arquivo com IA. Verifique o formato.' : 'Error al leer y analizar el archivo con IA.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setStoredGeminiApiKey(apiKeyInput.trim());
    setShowApiKeyPrompt(false);
    setErrorMsg('');
    if (pendingAction === 'image') {
      handleAnalyzeImageWithGemini();
    } else if (pendingAction === 'doc') {
      handleAnalyzeTextOrDoc();
    }
  };

  const handleConfirmApplySingle = () => {
    const target = parsedWeeks[selectedWeekIdx] || parsedWeeks[0];
    if (target) {
      onApplyParsedData({ ...target, meetingType: selectedMeetingTarget });
      resetAndClose();
    }
  };

  const handleConfirmApplyAll = () => {
    if (parsedWeeks.length > 0) {
      if (onApplyAllParsedWeeks) {
        onApplyAllParsedWeeks(parsedWeeks, selectedMeetingTarget);
      } else {
        // Fallback to first week
        onApplyParsedData({ ...parsedWeeks[0], meetingType: selectedMeetingTarget });
      }
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    onClose();
    setParsedWeeks([]);
    setSelectedWeekIdx(0);
    setImageFile(null);
    setImagePreview(null);
    setDocFile(null);
    setPastedText('');
  };

  const activeParsed = parsedWeeks[selectedWeekIdx] || parsedWeeks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1C4123] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isPt ? 'Preenchimento Automático por Foto ou Arquivo' : 'Llenado Automático por Foto o Archivo'}
              </h3>
              <p className="text-xs text-stone-200 font-medium">
                {isPt
                  ? 'Tire uma foto do quadro/folha ou envie PDF/TXT para preencher os campos'
                  : 'Tome una foto o suba PDF/TXT para llenar los campos automáticamente'}
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
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Meeting Type Banner */}
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-[#1C4123] block">
                {isPt ? 'Destino da Importação:' : 'Destino de la Importación:'}
              </span>
              <span className="text-[11px] text-emerald-800 font-medium">
                {isPt 
                  ? 'Escolha para onde esses dados serão enviados (Meio de Semana ou Fim de Semana).' 
                  : 'Elija adónde se enviarán estos datos (Entre Semana o Fin de Semana).'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-emerald-200 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMeetingTarget('midweek')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedMeetingTarget === 'midweek'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {isPt ? 'Meio de Semana' : 'Entre Semana'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMeetingTarget('weekend')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedMeetingTarget === 'weekend'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {isPt ? 'Fim de Semana' : 'Fin de Semana'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMeetingTarget('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedMeetingTarget === 'both'
                    ? 'bg-[#1C4123] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {isPt ? 'Ambas' : 'Ambas'}
              </button>
            </div>
          </div>

          {/* Option Tabs */}
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
              onClick={() => {
                setShowApiKeyPrompt(!showApiKeyPrompt);
                setPendingAction(null);
              }}
              title={isPt ? 'Configurar Chave Gemini (GitHub Pages)' : 'Configurar Clave Gemini'}
              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPt ? 'Chave IA' : 'Clave IA'}</span>
            </button>
          </div>

          {/* API Key Prompt for Static Hosting / GitHub Pages */}
          {showApiKeyPrompt && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 font-extrabold text-amber-950 text-sm">
                <Key className="w-5 h-5 text-amber-700" />
                <span>{isPt ? 'Chave de API Gemini (GitHub Pages)' : 'Clave de API Gemini'}</span>
              </div>
              <p className="text-amber-900 leading-relaxed font-medium">
                {isPt
                  ? 'Para utilizar a Inteligência Artificial Gemini diretamente no GitHub Pages (site estático sem servidor), insira sua Chave de API do Google AI Studio. A chave fica salva apenas no seu navegador.'
                  : 'Para usar Inteligencia Artificial en GitHub Pages, ingrese su Clave de API Gemini de Google AI Studio. Se guarda en su navegador.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isPt ? 'Cole sua AI Studio API Key aqui...' : 'Pegue su AI Studio API Key aquí...'}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-stone-800 font-mono text-xs focus:border-amber-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="bg-[#1C4123] hover:bg-[#143019] text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isPt ? 'Salvar e Continuar' : 'Guardar y Continuar'}
                </button>
              </div>
              <p className="text-[11px] text-amber-800">
                {isPt ? 'Não tem uma chave?' : '¿No tiene clave? '}{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-amber-950 hover:text-amber-700"
                >
                  {isPt ? 'Obter chave gratuita no Google AI Studio' : 'Obtener clave gratuita en Google AI Studio'}
                </a>
              </p>
            </div>
          )}

          {/* Input Tab: Camera / Image OCR */}
          {activeInputTab === 'image' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-stone-300 hover:border-[#1C4123] bg-amber-50/40 hover:bg-[#E8F0E6]/30 p-5 rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                {imagePreview ? (
                  <div className="relative w-full max-h-52 overflow-hidden rounded-xl border border-stone-300 bg-black/5 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview da Programação"
                      className="max-h-48 object-contain rounded-lg shadow-xs"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        setParsedWeeks([]);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-amber-100 text-[#1C4123] rounded-full">
                      <ImageIcon className="w-8 h-8 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 text-sm">
                        {isPt ? 'Tire uma foto da folha/quadro ou escolha uma imagem' : 'Tome una foto de la hoja/quadro o seleccione una imagen'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 font-medium">
                        {isPt
                          ? 'IA reconhece fotos impressas, telas ou rascunhos da reunião'
                          : 'IA reconoce fotos impresas, pantallas o borradores'}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <label className="cursor-pointer bg-[#1C4123] hover:bg-[#285A31] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2">
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

                  <label className="cursor-pointer bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2">
                    <Upload className="w-4 h-4 text-stone-600" />
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
            </div>
          )}

          {/* Input Tab: File Upload (PDF, TXT, RTF) */}
          {activeInputTab === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-stone-300 hover:border-[#1C4123] bg-stone-50 hover:bg-[#E8F0E6]/30 p-6 rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="p-3 bg-stone-200/60 text-[#1C4123] rounded-full">
                <FileCode className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-stone-800 text-sm">
                  {docFile ? docFile.name : isPt ? 'Arraste o arquivo (PDF, TXT, DOC, DOCX ou RTF) aqui' : 'Arrastre el archivo (PDF, TXT, DOC, DOCX o RTF) aquí'}
                </p>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  {docFile
                    ? `${(docFile.size / 1024).toFixed(1)} KB`
                    : isPt
                    ? 'IA Gemini lê e analisa automaticamente todo o conteúdo do documento'
                    : 'IA Gemini lee e analisa automaticamente todo el contenido'}
                </p>
              </div>
              <label className="cursor-pointer bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition">
                {isPt ? 'Escolher Arquivo' : 'Elegir Archivo'}
                <input
                  type="file"
                  accept=".pdf,.txt,.rtf,.doc,.docx"
                  onChange={handleDocChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Input Tab: Text Area */}
          {activeInputTab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                {isPt ? 'Cole abaixo o texto da programação da reunião:' : 'Pegue abajo el texto de la programación:'}
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setParsedWeeks([]);
                }}
                placeholder={
                  isPt
                    ? "Exemplo:\nPresidente: Carlos Silva\nOração Inicial: Pedro Santos\n1. Discurso (10 min): Paulo Ramos\nJoias Espirituais: Rafael Souza\nLeitura da Bíblia: Mateus Lima..."
                    : "Ejemplo:\nPresidente: Carlos Silva\nOración Inicial: Pedro Santos..."
                }
                className="w-full h-40 p-3 text-xs bg-stone-50 border border-stone-300 rounded-2xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#1C4123]"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action to Analyze */}
          {parsedWeeks.length === 0 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={activeInputTab === 'image' ? handleAnalyzeImageWithGemini : handleAnalyzeTextOrDoc}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>
                  {isProcessing
                    ? isPt ? 'Lendo e Processando com IA...' : 'Leyendo y Procesando con IA...'
                    : activeInputTab === 'image'
                    ? isPt ? 'Analisar Foto com Visão IA' : 'Analizar Foto con Visión IA'
                    : isPt ? 'Analisar e Extrair Partes' : 'Analizar y Extraer Partes'}
                </span>
              </button>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedWeeks.length > 0 && activeParsed && (
            <div className="bg-[#E8F0E6]/60 border border-[#1C4123]/25 rounded-2xl p-4 space-y-4 shadow-xs">
              {/* Header banner */}
              <div className="flex flex-col gap-2 border-b border-stone-300/80 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1C4123] font-extrabold text-sm">
                    <Check className="w-5 h-5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full" />
                    <span>
                      {parsedWeeks.length > 1
                        ? (isPt ? `Encontradas ${parsedWeeks.length} Semanas Extraídas!` : `¡Encontradas ${parsedWeeks.length} Semanas Extraídas!`)
                        : (isPt ? 'Partes Identificadas com Sucesso!' : '¡Partes Identificadas con Éxito!')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-[#1C4123] text-white rounded-full shadow-xs">
                    {activeParsed.meetingType === 'both'
                      ? (isPt ? 'Meio e Fim de Semana' : 'Entre y Fin de Semana')
                      : activeParsed.meetingType === 'weekend'
                      ? (isPt ? 'Fim de Semana' : 'Fin de Semana')
                      : (isPt ? 'Meio de Semana' : 'Entre Semana')}
                  </span>
                </div>

                {/* Multi-week Selector Tabs & Carousel Navigation */}
                {parsedWeeks.length > 1 && (
                  <div className="bg-amber-100/90 border border-amber-300 p-3 rounded-xl space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        <span>
                          {isPt 
                            ? `Visualizando Semana ${selectedWeekIdx + 1} de ${parsedWeeks.length}:` 
                            : `Viendo Semana ${selectedWeekIdx + 1} de ${parsedWeeks.length}:`}
                        </span>
                      </p>
                      
                      {/* Prev / Next buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedWeekIdx((prev) => Math.max(0, prev - 1))}
                          disabled={selectedWeekIdx === 0}
                          className="p-1 rounded-lg bg-white text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer border border-stone-300"
                          title="Semana Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-amber-900 px-1">
                          {selectedWeekIdx + 1}/{parsedWeeks.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedWeekIdx((prev) => Math.min(parsedWeeks.length - 1, prev + 1))}
                          disabled={selectedWeekIdx === parsedWeeks.length - 1}
                          className="p-1 rounded-lg bg-white text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer border border-stone-300"
                          title="Próxima Semana"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Week Selector Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                      {parsedWeeks.map((wk, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedWeekIdx(idx)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer border ${
                            selectedWeekIdx === idx
                              ? 'bg-[#1C4123] text-white border-[#1C4123] shadow-xs'
                              : 'bg-white text-stone-800 hover:bg-stone-100 border-stone-300'
                          }`}
                        >
                          {wk.weekLabel ? formatToDDMMYYYY(wk.weekLabel) : `${isPt ? 'Semana' : 'Semana'} ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Cards Grid for Quick Overview when multiple weeks exist */}
              {parsedWeeks.length > 1 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold text-[#1C4123] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    {isPt ? 'Resumo de Todas as Semanas Identificadas no Arquivo:' : 'Resumen de Todas las Semanas Identificadas:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {parsedWeeks.map((wk, idx) => {
                      const isSelected = selectedWeekIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedWeekIdx(idx)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#1C4123] text-white border-[#1C4123] shadow-md ring-2 ring-amber-400'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-[#1C4123]/50 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1 border-b pb-1 border-current/20">
                              <span className="font-extrabold truncate">
                                {formatToDDMMYYYY(wk.weekLabel) || `Semana ${idx + 1}`}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-amber-300 text-amber-950' : 'bg-stone-100 text-stone-700'}`}>
                                #{idx + 1}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-90 truncate">
                              <strong>Pres:</strong> {wk.president || '—'}
                            </p>
                            <p className="text-[11px] opacity-90 truncate">
                              <strong>Orador:</strong> {wk.talkSpeaker || wk.speakerName || '—'}
                            </p>
                            <p className="text-[11px] opacity-90 truncate">
                              <strong>Leitura:</strong> {wk.readingMain || '—'}
                            </p>
                          </div>
                          <div className="mt-2 text-[10px] font-bold text-right underline opacity-80">
                            {isSelected ? (isPt ? '✓ Selecionada' : '✓ Seleccionada') : (isPt ? 'Clique para ver' : 'Clic para ver')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detailed Week Inspector */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-stone-200">
                  <span className="font-extrabold text-sm text-[#1C4123]">
                    {isPt ? `Detalhes da Semana ${selectedWeekIdx + 1}` : `Detalles de la Semana ${selectedWeekIdx + 1}`}
                    {activeParsed.weekLabel ? `: ${formatToDDMMYYYY(activeParsed.weekLabel)}` : ''}
                  </span>
                  <span className="text-xs text-stone-500 font-bold">
                    {isPt ? 'Inspeção dos dados extraídos' : 'Inspección de datos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-800">
                  {activeParsed.president && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Presidente (Meio de Semana):</span>
                      <span className="font-bold text-stone-900">{activeParsed.president}</span>
                    </div>
                  )}
                  {activeParsed.initialPrayer && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Oração Inicial:</span>
                      <span className="font-bold text-stone-900">{activeParsed.initialPrayer}</span>
                    </div>
                  )}
                  {activeParsed.talkSpeaker && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Orador Discurso (10 min):</span>
                      <span className="font-bold text-stone-900">{activeParsed.talkSpeaker}</span>
                    </div>
                  )}
                  {activeParsed.gemsSpeaker && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Joias Espirituais:</span>
                      <span className="font-bold text-stone-900">{activeParsed.gemsSpeaker}</span>
                    </div>
                  )}
                  {activeParsed.readingMain && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Leitura Bíblia (Principal):</span>
                      <span className="font-bold text-stone-900">{activeParsed.readingMain}</span>
                    </div>
                  )}
                  {activeParsed.readingSalaB && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Leitura Bíblia (Sala B):</span>
                      <span className="font-bold text-stone-900">{activeParsed.readingSalaB}</span>
                    </div>
                  )}
                  {activeParsed.counselorSalaB && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Conselheiro Sala B:</span>
                      <span className="font-bold text-stone-900">{activeParsed.counselorSalaB}</span>
                    </div>
                  )}
                  {activeParsed.finalPrayer && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-500 font-medium block">Oração Final:</span>
                      <span className="font-bold text-stone-900">{activeParsed.finalPrayer}</span>
                    </div>
                  )}
                  {activeParsed.speakerName && (
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-stone-500 font-medium block">Orador Discurso Público:</span>
                      <span className="font-bold text-stone-900">{activeParsed.speakerName}</span>
                    </div>
                  )}
                  {activeParsed.watchtowerConductor && (
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-stone-500 font-medium block">Dirigente A Sentinela:</span>
                      <span className="font-bold text-stone-900">{activeParsed.watchtowerConductor}</span>
                    </div>
                  )}
                </div>

                {activeParsed.facaSeuMelhor && activeParsed.facaSeuMelhor.length > 0 && (
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-stone-900 block mb-1">
                      Faça Seu Melhor ({activeParsed.facaSeuMelhor.length} partes):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-stone-700">
                      {activeParsed.facaSeuMelhor.map((p, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{cleanPartTitle(p.title)}:</span>{' '}
                          {p.assignedMain || 'Pendente'}
                          {p.assignedAssistant ? ` / Ajudante: ${p.assignedAssistant}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeParsed.nossaVidaCrista && activeParsed.nossaVidaCrista.length > 0 && (
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-stone-900 block mb-1">
                      Nossa Vida Cristã ({activeParsed.nossaVidaCrista.length} partes):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-stone-700">
                      {activeParsed.nossaVidaCrista.map((p, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{cleanPartTitle(p.title)}:</span>{' '}
                          {p.speaker || 'Pendente'}
                          {p.reader ? ` / Leitor: ${p.reader}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Apply Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-stone-300">
                <button
                  onClick={() => setParsedWeeks([])}
                  className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-xs transition cursor-pointer text-stone-700"
                >
                  {isPt ? 'Refazer Leitura' : 'Volver a Leer'}
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {parsedWeeks.length > 1 && (
                    <button
                      onClick={handleConfirmApplyAll}
                      className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>
                        {isPt
                          ? `Enviar Todas as ${parsedWeeks.length} Semanas para o Banco de Dados (Firebase)`
                          : `Enviar Todas las ${parsedWeeks.length} Semanas a Firebase`}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={handleConfirmApplySingle}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      parsedWeeks.length > 1
                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-300'
                        : 'bg-[#1C4123] hover:bg-[#285A31] text-white shadow-md'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {parsedWeeks.length > 1
                        ? isPt
                          ? `Preencher Apenas Semana ${selectedWeekIdx + 1} no Formulário`
                          : `Llenar Solo Semana ${selectedWeekIdx + 1}`
                        : isPt
                        ? 'Preencher Formulário'
                        : 'Llenar Formulario'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
