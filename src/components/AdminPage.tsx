import React, { useState } from 'react';
import { 
  AppLanguage, 
  PageView, 
  MidweekMeeting, 
  WeekendMeeting, 
  Announcement, 
  CleaningSchedule, 
  PublicWitnessingSchedule, 
  CongregationGroup,
  MinisterioPart,
  VidaCristaPart
} from '../types';
import { 
  saveMidweekMeeting, 
  deleteMidweekMeeting,
  saveWeekendMeeting, 
  deleteWeekendMeeting,
  saveAnnouncement, 
  deleteAnnouncement,
  saveCleaningSchedule,
  deleteCleaningSchedule,
  saveWitnessingSchedule,
  deleteWitnessingSchedule,
  saveGroup,
  deleteGroup,
  seedAllData 
} from '../services/firestoreService';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ArrowLeft, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  BookOpen, 
  Calendar, 
  Megaphone, 
  Sparkles, 
  MapPin, 
  Users, 
  Settings,
  Eye,
  EyeOff,
  ShieldCheck,
  Edit2,
  X,
  AlertTriangle,
  Globe,
  Languages
} from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';

const formatWeekLabelFromDate = (dateStr: string, isPtLang: boolean = true): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const yearNum = parseInt(parts[0], 10);
  const monthNum = parseInt(parts[1], 10) - 1;
  const dayNum = parseInt(parts[2], 10);

  const selectedDate = new Date(yearNum, monthNum, dayNum);
  if (isNaN(selectedDate.getTime())) return '';

  const day = selectedDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthsEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const months = isPtLang ? monthsPt : monthsEs;

  const monDay = monday.getDate();
  const sunDay = sunday.getDate();
  const monMonth = months[monday.getMonth()];
  const sunMonth = months[sunday.getMonth()];
  const year = sunday.getFullYear();

  if (monday.getMonth() === sunday.getMonth()) {
    return `${monDay} a ${sunDay} de ${monMonth} de ${year}`;
  } else {
    return `${monDay} de ${monMonth} a ${sunDay} de ${sunMonth} de ${year}`;
  }
};

const formatExactDateLabel = (dateStr: string, isPtLang: boolean = true): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const yearNum = parseInt(parts[0], 10);
  const monthNum = parseInt(parts[1], 10) - 1;
  const dayNum = parseInt(parts[2], 10);

  const selectedDate = new Date(yearNum, monthNum, dayNum);
  if (isNaN(selectedDate.getTime())) return '';

  const monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthsEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const months = isPtLang ? monthsPt : monthsEs;

  const day = selectedDate.getDate();
  const month = months[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();

  return `${day} de ${month} de ${year}`;
};

interface AdminPageProps {
  language: AppLanguage;
  setLanguage?: (lang: AppLanguage) => void;
  onNavigate: (page: PageView) => void;
  midweekMeetings?: MidweekMeeting[];
  weekendMeetings?: WeekendMeeting[];
  midweekMeeting?: MidweekMeeting;
  weekendMeeting?: WeekendMeeting;
  announcements: Announcement[];
  cleaningList: CleaningSchedule[];
  witnessingList: PublicWitnessingSchedule[];
  groupsList: CongregationGroup[];
}

export const AdminPage: React.FC<AdminPageProps> = ({
  language,
  setLanguage,
  onNavigate,
  midweekMeetings = [],
  weekendMeetings = [],
  midweekMeeting,
  weekendMeeting,
  announcements,
  cleaningList,
  witnessingList,
  groupsList,
}) => {
  const isPt = language === 'pt';

  // Text Accessibility Scale State
  const [textScale, setTextScale] = useState<number>(1);

  // Selected Week Index State
  const [selectedMidweekIndex, setSelectedMidweekIndex] = useState<number>(0);
  const [selectedWeekendIndex, setSelectedWeekendIndex] = useState<number>(0);

  // Fallbacks to prop midweekMeeting/weekendMeeting if list is empty
  const allMidweekList = midweekMeetings.length > 0 ? midweekMeetings : (midweekMeeting ? [midweekMeeting] : []);
  const allWeekendList = weekendMeetings.length > 0 ? weekendMeetings : (weekendMeeting ? [weekendMeeting] : []);

  const safeMidweekIndex = Math.min(selectedMidweekIndex, Math.max(0, allMidweekList.length - 1));
  const safeWeekendIndex = Math.min(selectedWeekendIndex, Math.max(0, allWeekendList.length - 1));

  const activeMidweek = allMidweekList[safeMidweekIndex] || allMidweekList[0];
  const activeWeekend = allWeekendList[safeWeekendIndex] || allWeekendList[0];

  // Modals state
  const [showNewMidweekModal, setShowNewMidweekModal] = useState(false);
  const [newMidweekDate, setNewMidweekDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newMidweekLabel, setNewMidweekLabel] = useState(() => formatWeekLabelFromDate(new Date().toISOString().split('T')[0], true));
  const [newMidweekReading, setNewMidweekReading] = useState('');

  const [showNewWeekendModal, setShowNewWeekendModal] = useState(false);
  const [newWeekendDate, setNewWeekendDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newWeekendLabel, setNewWeekendLabel] = useState(() => formatExactDateLabel(new Date().toISOString().split('T')[0], true));

  const handleOpenNewMidweekModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setNewMidweekDate(todayStr);
    setNewMidweekLabel(formatWeekLabelFromDate(todayStr, isPt));
    setNewMidweekReading('');
    setShowNewMidweekModal(true);
  };

  const handleMidweekDateChange = (dateVal: string) => {
    setNewMidweekDate(dateVal);
    if (dateVal) {
      const formatted = formatWeekLabelFromDate(dateVal, isPt);
      if (formatted) {
        setNewMidweekLabel(formatted);
      }
    }
  };

  const handleOpenNewWeekendModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setNewWeekendDate(todayStr);
    setNewWeekendLabel(formatExactDateLabel(todayStr, isPt));
    setShowNewWeekendModal(true);
  };

  const handleWeekendDateChange = (dateVal: string) => {
    setNewWeekendDate(dateVal);
    if (dateVal) {
      const formatted = formatExactDateLabel(dateVal, isPt);
      if (formatted) {
        setNewWeekendLabel(formatted);
      }
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [showNewCleaningModal, setShowNewCleaningModal] = useState(false);
  const [newCleaningWeek, setNewCleaningWeek] = useState('');
  const [newCleaningGroup, setNewCleaningGroup] = useState('Grupo 1');
  const [newCleaningOverseer, setNewCleaningOverseer] = useState('');

  const [editingGroup, setEditingGroup] = useState<CongregationGroup | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupNum, setNewGroupNum] = useState('1');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupOverseer, setNewGroupOverseer] = useState('');
  const [newGroupAssistant, setNewGroupAssistant] = useState('');
  const [newGroupLocation, setNewGroupLocation] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');

  const [showNewWitnessingModal, setShowNewWitnessingModal] = useState(false);
  const [newWitnessingLocation, setNewWitnessingLocation] = useState('');
  const [newWitnessingDay, setNewWitnessingDay] = useState('Sábado');
  const [newWitnessingTime, setNewWitnessingTime] = useState('09:00 - 11:00');
  const [newWitnessingPublishers, setNewWitnessingPublishers] = useState('');

  // Login Authentication State
  const storedPin = localStorage.getItem('admin_pin') || '1234';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    sessionStorage.getItem('admin_auth') === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Management Tab State
  const [activeTab, setActiveTab] = useState<
    'midweek' | 'weekend' | 'announcements' | 'cleaning' | 'witnessing' | 'groups' | 'settings'
  >('midweek');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Local editable state for Midweek
  const [president, setPresident] = useState(activeMidweek?.president || '');
  const [initialSong, setInitialSong] = useState(activeMidweek?.initialSong || '');
  const [initialPrayer, setInitialPrayer] = useState(activeMidweek?.initialPrayer || '');
  const [counselorSalaB, setCounselorSalaB] = useState(activeMidweek?.counselorSalaB || '');
  const [talkTitle, setTalkTitle] = useState(activeMidweek?.tesouros?.[0]?.title || '');
  const [talkSpeaker, setTalkSpeaker] = useState(activeMidweek?.tesouros?.[0]?.speaker || '');
  const [gemsSpeaker, setGemsSpeaker] = useState(activeMidweek?.tesouros?.[1]?.speaker || '');
  const [readingMain, setReadingMain] = useState(activeMidweek?.tesouros?.[2]?.speaker || '');
  const [readingSalaB, setReadingSalaB] = useState(activeMidweek?.tesouros?.[2]?.speakerSalaB || '');
  const [facaSeuMelhor, setFacaSeuMelhor] = useState<MinisterioPart[]>(
    activeMidweek?.facaSeuMelhor || []
  );
  const [middleSong, setMiddleSong] = useState(activeMidweek?.middleSong || '');
  const [nossaVidaCrista, setNossaVidaCrista] = useState<VidaCristaPart[]>(
    activeMidweek?.nossaVidaCrista || []
  );
  const [finalSong, setFinalSong] = useState(activeMidweek?.finalSong || '');
  const [finalPrayer, setFinalPrayer] = useState(activeMidweek?.finalPrayer || '');

  // Local editable state for Weekend
  const [weekendTalkTitle, setWeekendTalkTitle] = useState(activeWeekend?.publicTalkTitle || '');
  const [weekendSpeaker, setWeekendSpeaker] = useState(activeWeekend?.speakerName || '');
  const [weekendCongregation, setWeekendCongregation] = useState(activeWeekend?.speakerCongregation || '');
  const [weekendPresident, setWeekendPresident] = useState(activeWeekend?.president || '');
  const [weekendInitialSong, setWeekendInitialSong] = useState(activeWeekend?.initialSong || '');
  const [wtTitle, setWtTitle] = useState(activeWeekend?.watchtowerTitle || '');
  const [wtConductor, setWtConductor] = useState(activeWeekend?.watchtowerConductor || '');
  const [wtReader, setWtReader] = useState(activeWeekend?.watchtowerReader || '');
  const [weekendFinalSong, setWeekendFinalSong] = useState(activeWeekend?.finalSong || '');
  const [weekendFinalPrayer, setWeekendFinalPrayer] = useState(activeWeekend?.finalPrayer || '');

  // Sync form state when selected midweek meeting changes
  React.useEffect(() => {
    if (activeMidweek) {
      setPresident(activeMidweek.president || '');
      setInitialSong(activeMidweek.initialSong || '');
      setInitialPrayer(activeMidweek.initialPrayer || '');
      setCounselorSalaB(activeMidweek.counselorSalaB || '');
      setTalkTitle(activeMidweek.tesouros?.[0]?.title || '');
      setTalkSpeaker(activeMidweek.tesouros?.[0]?.speaker || '');
      setGemsSpeaker(activeMidweek.tesouros?.[1]?.speaker || '');
      setReadingMain(activeMidweek.tesouros?.[2]?.speaker || '');
      setReadingSalaB(activeMidweek.tesouros?.[2]?.speakerSalaB || '');
      setFacaSeuMelhor(activeMidweek.facaSeuMelhor || []);
      setMiddleSong(activeMidweek.middleSong || '');
      setNossaVidaCrista(activeMidweek.nossaVidaCrista || []);
      setFinalSong(activeMidweek.finalSong || '');
      setFinalPrayer(activeMidweek.finalPrayer || '');
    }
  }, [selectedMidweekIndex, midweekMeetings]);

  // Sync form state when selected weekend meeting changes
  React.useEffect(() => {
    if (activeWeekend) {
      setWeekendTalkTitle(activeWeekend.publicTalkTitle || '');
      setWeekendSpeaker(activeWeekend.speakerName || '');
      setWeekendCongregation(activeWeekend.speakerCongregation || '');
      setWeekendPresident(activeWeekend.president || '');
      setWeekendInitialSong(activeWeekend.initialSong || '');
      setWtTitle(activeWeekend.watchtowerTitle || '');
      setWtConductor(activeWeekend.watchtowerConductor || '');
      setWtReader(activeWeekend.watchtowerReader || '');
      setWeekendFinalSong(activeWeekend.finalSong || '');
      setWeekendFinalPrayer(activeWeekend.finalPrayer || '');
    }
  }, [selectedWeekendIndex, weekendMeetings]);

  // New Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'geral' | 'evento' | 'lembrete'>('geral');
  const [annImportant, setAnnImportant] = useState(true);

  // PIN settings
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === storedPin || pinInput === 'admin' || pinInput === '1234') {
      setIsAuthenticated(true);
      setLoginError('');
      if (rememberMe) {
        sessionStorage.setItem('admin_auth', 'true');
      }
    } else {
      setLoginError(isPt ? 'Senha / PIN incorreto. Tente novamente.' : 'PIN incorrecto. Inténtelo de nuevo.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPinInput('');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      localStorage.setItem('admin_pin', newPin);
      setPinChangeMsg(isPt ? 'PIN alterado com sucesso!' : '¡PIN cambiado con éxito!');
      setNewPin('');
      setTimeout(() => setPinChangeMsg(''), 3000);
    } else {
      alert(isPt ? 'O PIN deve ter pelo menos 4 caracteres.' : 'El PIN debe tener al menos 4 caracteres.');
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Save Midweek Meeting
  const handleSaveMidweek = async () => {
    if (!activeMidweek) return;
    setSaving(true);
    try {
      const updated: MidweekMeeting = {
        ...activeMidweek,
        president,
        initialSong,
        initialPrayer,
        counselorSalaB,
        tesouros: [
          { id: 't1', title: isPt ? 'Discurso (10 min.)' : 'Discurso (10 min.)', durationMin: 10, speaker: talkSpeaker, type: 'talk' },
          { id: 't2', title: isPt ? 'Joias Espirituais (10 min.)' : 'Buscemos Perlas Escondidas (10 min.)', durationMin: 10, speaker: gemsSpeaker, type: 'gems' },
          { id: 't3', title: isPt ? 'Leitura da Bíblia (4 min.)' : 'Lectura de la Biblia (4 min.)', durationMin: 4, speaker: readingMain, speakerSalaB: readingSalaB, type: 'reading' },
        ],
        facaSeuMelhor,
        middleSong,
        nossaVidaCrista,
        finalSong,
        finalPrayer,
      };
      await saveMidweekMeeting(updated);
      showNotification(isPt ? `Reunião (${activeMidweek.weekLabel}) salva com sucesso!` : '¡Reunión guardada!');
    } catch (err) {
      console.error(err);
      alert(isPt ? 'Erro ao salvar no Firebase.' : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // Save Weekend Meeting
  const handleSaveWeekend = async () => {
    if (!activeWeekend) return;
    setSaving(true);
    try {
      const updated: WeekendMeeting = {
        ...activeWeekend,
        publicTalkTitle: weekendTalkTitle,
        speakerName: weekendSpeaker,
        speakerCongregation: weekendCongregation,
        president: weekendPresident,
        initialSong: weekendInitialSong,
        watchtowerTitle: wtTitle,
        watchtowerConductor: wtConductor,
        watchtowerReader: wtReader,
        finalSong: weekendFinalSong,
        finalPrayer: weekendFinalPrayer,
      };
      await saveWeekendMeeting(updated);
      showNotification(isPt ? `Reunião (${activeWeekend.weekLabel}) salva com sucesso!` : '¡Reunión guardada!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar no Firebase.');
    } finally {
      setSaving(false);
    }
  };

  // Add Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setSaving(true);
    try {
      const newAnn: Announcement = {
        id: 'ann_' + Date.now(),
        title: annTitle,
        content: annContent,
        date: new Date().toISOString().split('T')[0],
        category: annCategory,
        important: annImportant,
      };
      await saveAnnouncement(newAnn);
      setAnnTitle('');
      setAnnContent('');
      showNotification(isPt ? 'Anúncio publicado com sucesso!' : '¡Anuncio publicado!');
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar anúncio.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Anúncio' : 'Eliminar Anuncio',
      message: isPt ? 'Deseja excluir este anúncio permanentemente?' : '¿Eliminar este anuncio?',
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteAnnouncement(id);
          showNotification(isPt ? 'Anúncio removido.' : 'Anuncio eliminado.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Create new Midweek Week Submit
  const handleCreateMidweekWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMidweekLabel.trim()) return;

    setSaving(true);
    try {
      const newId = `midweek_${Date.now()}`;
      const newMeeting: MidweekMeeting = {
        id: newId,
        weekId: `week_${Date.now()}`,
        weekLabel: newMidweekLabel.trim(),
        president: '',
        initialSong: '1',
        initialPrayer: '',
        counselorSalaB: '',
        tesouros: [
          { id: 't1', title: 'Tesouros da Palavra de Deus (10 min)', durationMin: 10, speaker: '', type: 'talk' },
          { id: 't2', title: 'Encontre Joias Espirituais (10 min)', durationMin: 10, speaker: '', type: 'gems' },
          { id: 't3', title: `Leitura da Bíblia (4 min) - ${newMidweekReading.trim() || 'LEITURA BÍBLICA'}`, durationMin: 4, speaker: '', speakerSalaB: '', type: 'reading' }
        ],
        facaSeuMelhor: [
          { id: 'f1', title: 'Iniciando Conversas (3 min)', durationMin: 3, assignedMain: '', assignedAssistant: '' },
          { id: 'f2', title: 'Cultivando o Interesse (4 min)', durationMin: 4, assignedMain: '', assignedAssistant: '' }
        ],
        middleSong: '2',
        nossaVidaCrista: [
          { id: 'v1', title: 'Necessidades da Congregação (15 min)', durationMin: 15, speaker: '' },
          { id: 'v2', title: 'Estudo Bíblico de Congregação (30 min)', durationMin: 30, speaker: '', reader: '', isBibleStudy: true }
        ],
        finalSong: '3',
        finalPrayer: ''
      };
      await saveMidweekMeeting(newMeeting);
      showNotification(isPt ? 'Nova semana criada com sucesso!' : '¡Nueva semana creada!');
      setSelectedMidweekIndex(allMidweekList.length);
      setShowNewMidweekModal(false);
      setNewMidweekLabel('');
      setNewMidweekReading('');
    } catch (err) {
      console.error(err);
      alert(isPt ? 'Erro ao criar semana.' : 'Error al crear semana.');
    } finally {
      setSaving(false);
    }
  };

  // Delete current Midweek Week
  const handleDeleteMidweekWeek = () => {
    if (!activeMidweek?.id) return;
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Semana' : 'Eliminar Semana',
      message: isPt ? `Deseja realmente excluir a semana "${activeMidweek.weekLabel}"?` : `¿Desea eliminar "${activeMidweek.weekLabel}"?`,
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteMidweekMeeting(activeMidweek.id);
          setSelectedMidweekIndex(0);
          showNotification(isPt ? 'Semana excluída.' : 'Semana eliminada.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Create new Weekend Week Submit
  const handleCreateWeekendWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekendLabel.trim()) return;

    setSaving(true);
    try {
      const newId = `weekend_${Date.now()}`;
      const newMeeting: WeekendMeeting = {
        id: newId,
        weekId: `week_${Date.now()}`,
        weekLabel: newWeekendLabel.trim(),
        publicTalkTitle: '',
        speakerName: '',
        speakerCongregation: '',
        president: '',
        initialSong: '1',
        watchtowerTitle: 'Estudo de A Sentinela',
        watchtowerConductor: '',
        watchtowerReader: '',
        finalSong: '2',
        finalPrayer: ''
      };
      await saveWeekendMeeting(newMeeting);
      showNotification(isPt ? 'Nova semana de Fim de Semana criada!' : '¡Nueva semana creada!');
      setSelectedWeekendIndex(allWeekendList.length);
      setShowNewWeekendModal(false);
      setNewWeekendLabel('');
    } catch (err) {
      console.error(err);
      alert(isPt ? 'Erro ao criar semana.' : 'Error al crear semana.');
    } finally {
      setSaving(false);
    }
  };

  // Delete current Weekend Week
  const handleDeleteWeekendWeek = () => {
    if (!activeWeekend?.id) return;
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Semana' : 'Eliminar Semana',
      message: isPt ? `Deseja realmente excluir a semana "${activeWeekend.weekLabel}"?` : `¿Desea eliminar "${activeWeekend.weekLabel}"?`,
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteWeekendMeeting(activeWeekend.id);
          setSelectedWeekendIndex(0);
          showNotification(isPt ? 'Semana excluída.' : 'Semana eliminada.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Cleaning CRUD
  const handleAddCleaningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCleaningWeek.trim()) return;

    setSaving(true);
    try {
      const newItem: CleaningSchedule = {
        id: `cleaning_${Date.now()}`,
        weekLabel: newCleaningWeek.trim(),
        group: newCleaningGroup.trim() || 'Grupo 1',
        overseer: newCleaningOverseer.trim(),
        tasks: ['Limpeza do Salão Principal', 'Limpeza dos Banheiros', 'Aspirar Tapetes']
      };
      await saveCleaningSchedule(newItem);
      showNotification(isPt ? 'Escala de limpeza adicionada!' : '¡Escala agregada!');
      setShowNewCleaningModal(false);
      setNewCleaningWeek('');
      setNewCleaningOverseer('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCleaning = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Escala' : 'Eliminar Escala',
      message: isPt ? 'Deseja excluir esta escala de limpeza?' : '¿Eliminar escala?',
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteCleaningSchedule(id);
          showNotification(isPt ? 'Escala excluída.' : 'Escala eliminada.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Groups CRUD
  const handleOpenNewGroupModal = () => {
    setEditingGroup(null);
    setNewGroupNum((groupsList.length + 1).toString());
    setNewGroupName('');
    setNewGroupOverseer('');
    setNewGroupAssistant('');
    setNewGroupLocation('');
    setNewGroupSchedule('');
    setNewGroupMembers('');
    setShowNewGroupModal(true);
  };

  const handleOpenEditGroupModal = (group: CongregationGroup) => {
    setEditingGroup(group);
    setNewGroupNum(group.number.toString());
    setNewGroupName(group.name);
    setNewGroupOverseer(group.overseer);
    setNewGroupAssistant(group.assistant);
    setNewGroupLocation(group.location);
    setNewGroupSchedule(group.schedule);
    setNewGroupMembers(group.members ? group.members.join('\n') : '');
    setShowNewGroupModal(true);
  };

  const handleAddGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newGroupNum, 10) || 1;
    const name = newGroupName.trim() || `Grupo ${num}`;

    // Parse members string into array (separated by newlines or commas)
    const membersArray = newGroupMembers
      .split(/[\n,]+/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    setSaving(true);
    try {
      const groupToSave: CongregationGroup = {
        id: editingGroup ? editingGroup.id : `group_${Date.now()}`,
        number: num,
        name,
        overseer: newGroupOverseer.trim(),
        assistant: newGroupAssistant.trim(),
        location: newGroupLocation.trim() || 'Salão do Reino',
        schedule: newGroupSchedule.trim() || 'Sábados às 09:00',
        members: membersArray
      };
      await saveGroup(groupToSave);
      showNotification(
        editingGroup
          ? (isPt ? 'Grupo atualizado com sucesso!' : '¡Grupo actualizado!')
          : (isPt ? 'Grupo adicionado com sucesso!' : '¡Grupo agregado!')
      );
      setShowNewGroupModal(false);
      setEditingGroup(null);
      setNewGroupName('');
      setNewGroupOverseer('');
      setNewGroupAssistant('');
      setNewGroupLocation('');
      setNewGroupSchedule('');
      setNewGroupMembers('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Grupo' : 'Eliminar Grupo',
      message: isPt ? 'Deseja excluir este grupo de serviço?' : '¿Eliminar grupo?',
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteGroup(id);
          showNotification(isPt ? 'Grupo removido.' : 'Grupo eliminado.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Witnessing CRUD
  const handleAddWitnessingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWitnessingLocation.trim()) return;

    const pubs = newWitnessingPublishers.split(',').map(s => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      const newWitnessing: PublicWitnessingSchedule = {
        id: `witnessing_${Date.now()}`,
        location: newWitnessingLocation.trim(),
        dayOfWeek: newWitnessingDay.trim() || 'Sábado',
        timeSlot: newWitnessingTime.trim() || '09:00 - 11:00',
        publishers: pubs
      };
      await saveWitnessingSchedule(newWitnessing);
      showNotification(isPt ? 'Ponto de testemunho criado!' : '¡Punto de testimonio creado!');
      setShowNewWitnessingModal(false);
      setNewWitnessingLocation('');
      setNewWitnessingPublishers('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWitnessing = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Excluir Ponto' : 'Eliminar Punto',
      message: isPt ? 'Deseja excluir este ponto de testemunho?' : '¿Eliminar punto?',
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteWitnessingSchedule(id);
          showNotification(isPt ? 'Ponto removido.' : 'Punto eliminado.');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Seed / Reset Data
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: isPt ? 'Restaurar Banco de Dados' : 'Restaurar Datos',
      message: isPt ? 'Deseja restaurar todos os dados do banco Firebase para os valores originais?' : '¿Restaurar datos originales?',
      onConfirm: async () => {
        setSaving(true);
        try {
          await seedAllData();
          showNotification(isPt ? 'Banco de dados restaurado com sucesso!' : '¡Base de datos restaurada!');
        } catch (err) {
          console.error(err);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /* ================= LOGIN SCREEN ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Top Banner */}
          <div className="bg-[#1C4123] text-white p-6 text-center relative">
            <button
              onClick={() => onNavigate('home')}
              className="absolute left-4 top-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
              title="Voltar ao Quadro"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#285A31] rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-8 h-8 text-[#E8F0E6]" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {isPt ? 'Acesso Administrativo' : 'Acceso Administrativo'}
            </h1>
            <p className="text-xs text-stone-200 mt-1">
              {isPt
                ? 'Painel de Gestão do Quadro de Anúncios'
                : 'Panel de Gestión del Cuadro de Anuncios'}
            </p>

            {/* Language Switcher in Login */}
            {setLanguage && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-3 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setLanguage('pt')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPt
                      ? 'bg-white text-[#1C4123] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  Português
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isPt
                      ? 'bg-white text-[#1C4123] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  Español
                </button>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-semibold text-center animate-shake">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isPt ? 'Senha ou PIN de Acesso:' : 'Contraseña o PIN de Acceso:'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder={isPt ? 'Digite o PIN (Ex: 1234)' : 'Ingrese el PIN (Ej: 1234)'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1C4123] text-sm bg-stone-50/50"
                  autoFocus
                />
                <KeyRound className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1C4123] focus:ring-[#1C4123]"
                />
                <span>{isPt ? 'Lembrar neste navegador' : 'Recordar en este navegador'}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1C4123] hover:bg-[#285A31] text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isPt ? 'Entrar no Painel' : 'Iniciar Sesión'}</span>
            </button>

            {/* Quick Helper Badge for Convenience */}
            <div className="bg-[#E8F0E6] border border-[#2D5A27]/20 rounded-2xl p-3 text-center text-xs text-[#1C4123] flex items-center justify-between">
              <span className="font-medium">
                {isPt ? 'PIN Padrão de demonstração:' : 'PIN Predeterminado:'}
              </span>
              <span className="font-extrabold bg-white px-2 py-0.5 rounded-md border border-[#2D5A27]/30 text-stone-900">
                1234
              </span>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline underline-offset-2"
              >
                {isPt ? '← Voltar para o Quadro de Anúncios' : '← Volver al Cuadro de Anuncios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ================= DEDICATED MANAGEMENT DASHBOARD ================= */
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-24 pt-4 px-3 sm:px-6 max-w-5xl mx-auto" style={{ zoom: textScale }}>
      {/* Top Admin Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-stone-100 rounded-xl transition text-stone-700"
            title="Voltar ao Quadro"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4123]">
                {isPt ? 'Painel de Gestão e Edição' : 'Panel de Gestión y Edición'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{isPt ? 'Autenticado' : 'Autenticado'}</span>
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {isPt
                ? 'Gerencie as reuniões, anúncios, limpeza e grupos em tempo real'
                : 'Gestione reuniones, anuncios, limpieza y grupos en tiempo real'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {setLanguage && (
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold gap-1">
              <Languages className="w-3.5 h-3.5 text-stone-500 ml-1 mr-0.5 shrink-0 hidden sm:inline" />
              <button
                type="button"
                onClick={() => setLanguage('pt')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  isPt
                    ? 'bg-[#1C4123] text-white shadow-xs font-extrabold'
                    : 'text-stone-600 hover:text-stone-900 font-medium'
                }`}
              >
                Português
              </button>
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  !isPt
                    ? 'bg-[#1C4123] text-white shadow-xs font-extrabold'
                    : 'text-stone-600 hover:text-stone-900 font-medium'
                }`}
              >
                Español
              </button>
            </div>
          )}

          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-[#1C4123] bg-[#E8F0E6] hover:bg-[#D9E8D6] px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            {isPt ? 'Ver Quadro' : 'Ver Cuadro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition border border-red-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isPt ? 'Sair' : 'Salir'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-stone-200">
        <button
          onClick={() => setActiveTab('midweek')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'midweek'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isPt ? 'Meio de Semana' : 'Entre Semana'}</span>
        </button>

        <button
          onClick={() => setActiveTab('weekend')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'weekend'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isPt ? 'Fim de Semana' : 'Fin de Semana'}</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'announcements'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{isPt ? 'Anúncios' : 'Anuncios'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cleaning')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'cleaning'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isPt ? 'Limpeza' : 'Limpieza'}</span>
        </button>

        <button
          onClick={() => setActiveTab('witnessing')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'witnessing'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isPt ? 'Testemunho' : 'Predicación'}</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'groups'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isPt ? 'Grupos' : 'Grupos'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'bg-[#1C4123] text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{isPt ? 'Configurações' : 'Ajustes'}</span>
        </button>
      </div>

      {/* TAB 1: REUNIÃO MEIO DE SEMANA */}
      {activeTab === 'midweek' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C4123]">
                {isPt ? 'Editar Reunião Meio de Semana' : 'Editar Reunión Entre Semana'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {activeMidweek?.weekLabel || 'Semana Ativa'}
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                <span>💾 {isPt ? 'Economia do Firebase Ativa: Exibindo 10 semanas anteriores, semana atual e 10 próximas (Cache Local)' : 'Optimización Firebase Activa: 10 semanas pasadas, actual e 10 futuras (Cache Local)'}</span>
              </div>
            </div>
            <button
              onClick={handleSaveMidweek}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          {/* Week Selection Dropdown & Actions */}
          <div className="bg-[#E8F0E6] p-4 rounded-2xl border border-[#1C4123]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="bg-[#1C4123] text-white p-2.5 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#1C4123] block">
                  {isPt ? 'Selecionar Semana para Editar:' : 'Seleccionar Semana para Editar:'}
                </span>
                <span className="text-xs text-stone-600 font-medium">
                  {activeMidweek?.weekLabel || (isPt ? 'Nenhuma semana selecionada' : 'Ninguna semana')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedMidweekIndex}
                onChange={(e) => setSelectedMidweekIndex(Number(e.target.value))}
                className="flex-1 md:flex-none bg-white border border-stone-300 rounded-xl px-3 py-2 font-bold text-xs text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C4123] cursor-pointer"
              >
                {allMidweekList.map((m, idx) => (
                  <option key={m.id || idx} value={idx}>
                    📅 {m.weekLabel} {idx === 0 ? `(${isPt ? 'Semana Atual' : 'Semana Actual'})` : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenNewMidweekModal}
                disabled={saving}
                className="bg-[#1C4123] hover:bg-[#285A31] text-white px-3 py-2 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Criar nova semana de reuniões"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isPt ? 'Nova Semana' : 'Nueva Semana'}</span>
              </button>

              {allMidweekList.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteMidweekWeek}
                  disabled={saving}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1"
                  title="Excluir esta semana"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Section: General Info */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">Informações Iniciais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Presidente da Reunião:</label>
                <input
                  type="text"
                  value={president}
                  onChange={(e) => setPresident(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Conselheiro da Sala B:</label>
                <input
                  type="text"
                  value={counselorSalaB}
                  onChange={(e) => setCounselorSalaB(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Cântico Inicial:</label>
                <input
                  type="text"
                  value={initialSong}
                  onChange={(e) => setInitialSong(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Oração Inicial:</label>
                <input
                  type="text"
                  value={initialPrayer}
                  onChange={(e) => setInitialPrayer(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Tesouros */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">
              {isPt ? '1. Tesouros da Palavra de Deus' : '1. Tesoros de la Palabra de Dios'}
            </h3>
            <p className="text-xs text-stone-500">
              {isPt
                ? 'Partes fixas do programa. Informe apenas o nome dos irmãos designados.'
                : 'Partes fijas del programa. Indique solo el nombre de los hermanos asignados.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  {isPt ? '1. Discurso (10 min) — Orador:' : '1. Discurso (10 min) — Orador:'}
                </label>
                <input
                  type="text"
                  value={talkSpeaker}
                  onChange={(e) => setTalkSpeaker(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {isPt ? '2. Joias Espirituais (10 min) — Orador:' : '2. Busquemos Perlas Escondidas (10 min) — Orador:'}
                </label>
                <input
                  type="text"
                  value={gemsSpeaker}
                  onChange={(e) => setGemsSpeaker(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {isPt ? '3. Leitura da Bíblia (Salão Principal):' : '3. Lectura de la Biblia (Salón Principal):'}
                </label>
                <input
                  type="text"
                  value={readingMain}
                  onChange={(e) => setReadingMain(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {isPt ? '3. Leitura da Bíblia (Sala B):' : '3. Lectura de la Biblia (Sala B):'}
                </label>
                <input
                  type="text"
                  placeholder={isPt ? 'Opcional' : 'Opcional'}
                  value={readingSalaB}
                  onChange={(e) => setReadingSalaB(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Faça Seu Melhor */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div>
                <h3 className="font-bold text-amber-950 text-sm">
                  {isPt ? '2. Faça Seu Melhor no Ministério' : '2. Seamos Mejores Maestros'}
                </h3>
                <p className="text-xs text-amber-800">
                  {isPt ? 'Partes dinâmicas do programa' : 'Partes dinámicas del programa'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newP: MinisterioPart = {
                    id: 'm_' + Date.now(),
                    title: isPt ? 'Iniciando Conversas (3 min.)' : 'Empezando Conversaciones (3 min.)',
                    durationMin: 3,
                    assignedMain: '',
                    assignedAssistant: '',
                    assignedSalaB: '',
                    assignedSalaBAssistant: '',
                  };
                  setFacaSeuMelhor([...facaSeuMelhor, newP]);
                }}
                className="flex items-center gap-1 bg-[#A07A00] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-800 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isPt ? 'Adicionar Parte' : 'Agregar Intervención'}</span>
              </button>
            </div>

            {facaSeuMelhor.map((part, idx) => (
              <div key={part.id} className="bg-white p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-amber-900">
                  <span>{isPt ? `Parte #${4 + idx}` : `Intervención #${4 + idx}`}</span>
                  <button
                    type="button"
                    onClick={() => setFacaSeuMelhor(facaSeuMelhor.filter(p => p.id !== part.id))}
                    className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="font-semibold block text-[11px]">
                      {isPt ? 'Título da Parte:' : 'Título de la Intervención:'}
                    </label>
                    <input
                      type="text"
                      value={part.title}
                      onChange={(e) =>
                        setFacaSeuMelhor(
                          facaSeuMelhor.map(p => p.id === part.id ? { ...p, title: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">
                      {isPt ? 'Estudante (Salão Principal):' : 'Estudiante (Salón Principal):'}
                    </label>
                    <input
                      type="text"
                      value={part.assignedMain}
                      onChange={(e) =>
                        setFacaSeuMelhor(
                          facaSeuMelhor.map(p => p.id === part.id ? { ...p, assignedMain: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">
                      {isPt ? 'Ajudante (Salão Principal):' : 'Ayudante (Salón Principal):'}
                    </label>
                    <input
                      type="text"
                      value={part.assignedAssistant || ''}
                      onChange={(e) =>
                        setFacaSeuMelhor(
                          facaSeuMelhor.map(p => p.id === part.id ? { ...p, assignedAssistant: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">
                      {isPt ? 'Estudante (Sala B):' : 'Estudiante (Sala B):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? 'Opcional' : 'Opcional'}
                      value={part.assignedSalaB || ''}
                      onChange={(e) =>
                        setFacaSeuMelhor(
                          facaSeuMelhor.map(p => p.id === part.id ? { ...p, assignedSalaB: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">
                      {isPt ? 'Ajudante (Sala B):' : 'Ayudante (Sala B):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? 'Opcional' : 'Opcional'}
                      value={part.assignedSalaBAssistant || ''}
                      onChange={(e) =>
                        setFacaSeuMelhor(
                          facaSeuMelhor.map(p => p.id === part.id ? { ...p, assignedSalaBAssistant: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Nossa Vida Cristã */}
          <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200 space-y-3">
            <div className="flex items-center justify-between border-b border-red-200 pb-2">
              <div>
                <h3 className="font-bold text-red-950 text-sm">3. Nossa Vida Cristã</h3>
                <p className="text-xs text-red-800">Cânticos, necessidades locais e estudo de livro</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newV: VidaCristaPart = {
                    id: 'v_' + Date.now(),
                    title: 'Necessidades Locais (15 min.)',
                    durationMin: 15,
                    speaker: 'Orador A',
                  };
                  setNossaVidaCrista([...nossaVidaCrista, newV]);
                }}
                className="flex items-center gap-1 bg-[#8B1E26] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-900 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Parte</span>
              </button>
            </div>

            <div className="text-xs">
              <label className="font-semibold block mb-1">Cântico do Meio:</label>
              <input
                type="text"
                value={middleSong}
                onChange={(e) => setMiddleSong(e.target.value)}
                className="w-full border rounded-xl p-2.5 bg-white font-medium"
              />
            </div>

            {nossaVidaCrista.map((part, idx) => (
              <div key={part.id} className="bg-white p-3 rounded-xl border border-red-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-red-900">
                  <span>Parte #{4 + facaSeuMelhor.length + idx}</span>
                  <button
                    type="button"
                    onClick={() => setNossaVidaCrista(nossaVidaCrista.filter(p => p.id !== part.id))}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block text-[11px]">Título da Parte:</label>
                    <input
                      type="text"
                      value={part.title}
                      onChange={(e) =>
                        setNossaVidaCrista(
                          nossaVidaCrista.map(p => p.id === part.id ? { ...p, title: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">Orador / Dirigente:</label>
                    <input
                      type="text"
                      value={part.speaker}
                      onChange={(e) =>
                        setNossaVidaCrista(
                          nossaVidaCrista.map(p => p.id === part.id ? { ...p, speaker: e.target.value } : p)
                        )
                      }
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-red-200">
              <div>
                <label className="font-semibold block mb-1">Cântico Final:</label>
                <input
                  type="text"
                  value={finalSong}
                  onChange={(e) => setFinalSong(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Oração Final:</label>
                <input
                  type="text"
                  value={finalPrayer}
                  onChange={(e) => setFinalPrayer(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REUNIÃO FIM DE SEMANA */}
      {activeTab === 'weekend' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C4123]">
                {isPt ? 'Editar Reunião Fim de Semana' : 'Editar Reunión Fin de Semana'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {activeWeekend?.weekLabel || 'Domingo'}
              </p>
            </div>
            <button
              onClick={handleSaveWeekend}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          {/* Week Selection Dropdown & Actions */}
          <div className="bg-[#E8F0E6] p-4 rounded-2xl border border-[#1C4123]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="bg-[#1C4123] text-white p-2.5 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#1C4123] block">
                  {isPt ? 'Selecionar Data para Editar:' : 'Seleccionar Fecha para Editar:'}
                </span>
                <span className="text-xs text-stone-600 font-medium">
                  {activeWeekend?.weekLabel || (isPt ? 'Nenhuma data selecionada' : 'Ninguna fecha')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedWeekendIndex}
                onChange={(e) => setSelectedWeekendIndex(Number(e.target.value))}
                className="flex-1 md:flex-none bg-white border border-stone-300 rounded-xl px-3 py-2 font-bold text-xs text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C4123] cursor-pointer"
              >
                {allWeekendList.map((m, idx) => (
                  <option key={m.id || idx} value={idx}>
                    📅 {m.weekLabel} {idx === 0 ? `(${isPt ? 'Data Atual' : 'Fecha Actual'})` : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenNewWeekendModal}
                disabled={saving}
                className="bg-[#1C4123] hover:bg-[#285A31] text-white px-3 py-2 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Criar nova reunião de Fim de Semana"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isPt ? 'Nova Data' : 'Nueva Fecha'}</span>
              </button>

              {allWeekendList.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteWeekendWeek}
                  disabled={saving}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1"
                  title="Excluir esta semana"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-bold text-stone-900 text-sm">Discurso Público</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Título do Discurso Público:</label>
                <input
                  type="text"
                  value={weekendTalkTitle}
                  onChange={(e) => setWeekendTalkTitle(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Orador Convidado:</label>
                <input
                  type="text"
                  value={weekendSpeaker}
                  onChange={(e) => setWeekendSpeaker(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Congregação do Orador:</label>
                <input
                  type="text"
                  value={weekendCongregation}
                  onChange={(e) => setWeekendCongregation(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>

            <h3 className="font-bold text-stone-900 text-sm pt-2 border-t">Estudo de A Sentinela</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Leitor de A Sentinela:</label>
                <input
                  type="text"
                  value={wtReader}
                  onChange={(e) => setWtReader(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>

            <h3 className="font-bold text-stone-900 text-sm pt-2 border-t">Designações Gerais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Presidente da Reunião:</label>
                <input
                  type="text"
                  value={weekendPresident}
                  onChange={(e) => setWeekendPresident(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Cântico Inicial:</label>
                <input
                  type="text"
                  value={weekendInitialSong}
                  onChange={(e) => setWeekendInitialSong(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Cântico Final:</label>
                <input
                  type="text"
                  value={weekendFinalSong}
                  onChange={(e) => setWeekendFinalSong(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Oração Final:</label>
                <input
                  type="text"
                  value={weekendFinalPrayer}
                  onChange={(e) => setWeekendFinalPrayer(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANÚNCIOS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Form Create Announcement */}
          <form onSubmit={handleAddAnnouncement} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
            <h2 className="text-lg font-bold text-[#1C4123]">Publicar Novo Anúncio ou Lembrete</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Título do Anúncio:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assembleia de Circuito em Breve"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Conteúdo / Descrição Detalhada:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escreva os detalhes da informação para a congregação..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Categoria:</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full border rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="geral">Geral</option>
                  <option value="evento">Evento</option>
                  <option value="lembrete">Lembrete Importante</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={annImportant}
                    onChange={(e) => setAnnImportant(e.target.checked)}
                    className="rounded text-[#1C4123]"
                  />
                  <span>Destacar como Anúncio Importante</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1C4123] hover:bg-[#285A31] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar no Firebase</span>
            </button>
          </form>

          {/* Existing Announcements List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
            <h2 className="text-lg font-bold text-[#1C4123]">Anúncios Publicados ({announcements.length})</h2>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#1C4123] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                        {ann.category}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">{ann.date}</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">{ann.title}</h3>
                    <p className="text-xs text-stone-600 mt-1 whitespace-pre-line">{ann.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition shrink-0"
                    title="Excluir Anúncio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIMPEZA */}
      {activeTab === 'cleaning' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C4123]">Escala de Limpeza do Salão do Reino</h2>
              <p className="text-xs text-stone-500 font-medium">Gerenciar grupos e tarefas de limpeza</p>
            </div>
            <button
              onClick={() => setShowNewCleaningModal(true)}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Escala de Limpeza</span>
            </button>
          </div>

          <div className="space-y-4">
            {cleaningList.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-stone-900 text-sm">
                  <span>{item.weekLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs">
                      {item.group}
                    </span>
                    <button
                      onClick={() => handleDeleteCleaning(item.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition"
                      title="Excluir Escala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-stone-600 font-medium">Superintendente Responsável: {item.overseer}</p>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <p className="font-bold mb-1 text-stone-800">Tarefas Programadas:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                    {item.tasks.map((task, tIdx) => (
                      <li key={tIdx}>{task}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TESTEMUNHO PÚBLICO */}
      {activeTab === 'witnessing' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C4123]">Pontos de Testemunho Público / Carrinho</h2>
              <p className="text-xs text-stone-500 font-medium">Gerenciar pontos de testemunho urbano</p>
            </div>
            <button
              onClick={() => setShowNewWitnessingModal(true)}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Ponto de Testemunho</span>
            </button>
          </div>

          <div className="space-y-4">
            {witnessingList.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-stone-900 text-sm">
                  <span>{item.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-200 text-stone-800 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                      {item.dayOfWeek} • {item.timeSlot}
                    </span>
                    <button
                      onClick={() => handleDeleteWitnessing(item.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition"
                      title="Excluir Ponto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-stone-600 pt-1">
                  <span className="font-semibold">Publicadores Designados:</span>
                  <span>{item.publishers.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GRUPOS DE SERVIÇO */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C4123]">Grupos de Serviço de Campo</h2>
              <p className="text-xs text-stone-500 font-medium">Gerenciar grupos de pregação e saídas</p>
            </div>
            <button
              onClick={handleOpenNewGroupModal}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Grupo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupsList.map((group) => (
              <div key={group.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2 text-xs relative">
                <div className="flex justify-between items-center font-extrabold text-[#1C4123] text-sm border-b pb-1">
                  <span>Grupo #{group.number} - {group.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditGroupModal(group)}
                      className="text-amber-700 hover:text-amber-900 p-1 hover:bg-amber-100 rounded-lg transition"
                      title="Editar Grupo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-lg transition"
                      title="Excluir Grupo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p><strong className="text-stone-800">Superintendente:</strong> {group.overseer}</p>
                <p><strong className="text-stone-800">Ajudante:</strong> {group.assistant}</p>
                <p><strong className="text-stone-800">Local de Saída:</strong> {group.location}</p>
                <p><strong className="text-stone-800">Horário:</strong> {group.schedule}</p>
                <div className="pt-2 border-t border-stone-200/80 mt-2">
                  <p><strong className="text-stone-800">Integrantes ({group.members?.length || 0}):</strong></p>
                  {group.members && group.members.length > 0 ? (
                    <ul className="mt-1 space-y-1 text-stone-700 pl-1">
                      {group.members.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1C4123] shrink-0"></span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-stone-500 italic mt-0.5">Nenhum integrante cadastrado</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CONFIGURAÇÕES */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
          <h2 className="text-lg font-bold text-[#1C4123]">
            {isPt ? 'Configurações do Sistema' : 'Configuración del Sistema'}
          </h2>

          {/* Language Selection Card */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 max-w-md text-xs">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1C4123]" />
              <span>{isPt ? 'Idioma do Painel e do Quadro' : 'Idioma del Panel y del Cuadro'}</span>
            </h3>
            <p className="text-stone-600">
              {isPt
                ? 'Alterne o idioma exibido em todo o quadro e no painel de gestão entre Português e Espanhol.'
                : 'Cambie el idioma mostrado en todo el cuadro y en el panel de gestión entre Portugués y Español.'}
            </p>
            {setLanguage && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLanguage('pt')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                    isPt
                      ? 'bg-[#1C4123] text-white ring-2 ring-[#1C4123]'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  Português
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                    !isPt
                      ? 'bg-[#1C4123] text-white ring-2 ring-[#1C4123]'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  Español
                </button>
              </div>
            )}
          </div>

          {/* Change PIN Form */}
          <form onSubmit={handleSavePin} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 max-w-md text-xs">
            <h3 className="font-bold text-stone-900 text-sm">Alterar PIN / Senha de Acesso</h3>
            {pinChangeMsg && (
              <p className="text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {pinChangeMsg}
              </p>
            )}
            <div>
              <label className="font-semibold block mb-1">Novo PIN (mínimo 4 caracteres):</label>
              <input
                type="text"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Ex: 5678"
                className="w-full border rounded-xl p-2.5 bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1C4123] text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#285A31] transition"
            >
              Salvar Novo PIN
            </button>
          </form>

          {/* Reset Firebase Data */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3 max-w-md text-xs">
            <h3 className="font-bold text-amber-950 text-sm">Restaurar Banco de Dados</h3>
            <p className="text-amber-800">
              Recarrega o Firebase Firestore com a programação de reuniões, anúncios e grupos padrão originais.
            </p>
            <button
              onClick={handleResetData}
              disabled={saving}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restaurar Dados Iniciais</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DIALOGS ================= */}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                {isPt ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white transition shadow-sm cursor-pointer"
              >
                {saving ? (isPt ? 'Aguarde...' : 'Aguarde...') : (isPt ? 'Confirmar' : 'Confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Midweek Week Modal */}
      {showNewMidweekModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleCreateMidweekWeekSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{isPt ? 'Criar Nova Semana (Meio de Semana)' : 'Crear Nueva Semana'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewMidweekModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-[#1C4123]" />
                  <span>{isPt ? 'Selecione a Data da Reunião no Calendário:' : 'Seleccione la Fecha de la Reunión:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={newMidweekDate}
                  onChange={(e) => handleMidweekDateChange(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-stone-50 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1C4123] cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  {isPt ? 'A semana será calculada automaticamente com base na data escolhida.' : 'La semana se calculará automáticamente según la fecha.'}
                </p>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Nome da Semana (Gerado):' : 'Nombre de la Semana:'}
                </label>
                <input
                  type="text"
                  required
                  value={newMidweekLabel}
                  onChange={(e) => setNewMidweekLabel(e.target.value)}
                  placeholder={isPt ? 'Ex: 11 a 17 de Agosto de 2025' : 'Ej: 11 a 17 de Agosto'}
                  className="w-full border border-[#1C4123]/30 rounded-xl p-3 bg-[#E8F0E6] font-bold text-[#1C4123] focus:outline-none focus:ring-2 focus:ring-[#1C4123]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Leitura Bíblica da Semana:' : 'Lectura Bíblica:'}
                </label>
                <input
                  type="text"
                  value={newMidweekReading}
                  onChange={(e) => setNewMidweekReading(e.target.value)}
                  placeholder={isPt ? 'Ex: SALMOS 88-91' : 'Ej: SALMOS 88-91'}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-stone-50 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1C4123]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowNewMidweekModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                {isPt ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={saving || !newMidweekLabel.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1C4123] hover:bg-[#285A31] text-white transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? (isPt ? 'Criando...' : 'Creando...') : (isPt ? 'Criar Semana' : 'Crear Semana')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Weekend Week Modal */}
      {showNewWeekendModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleCreateWeekendWeekSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{isPt ? 'Criar Nova Semana (Fim de Semana)' : 'Crear Nueva Semana'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewWeekendModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-[#1C4123]" />
                  <span>{isPt ? 'Selecione a Data da Reunião no Calendário:' : 'Seleccione la Fecha de la Reunión:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={newWeekendDate}
                  onChange={(e) => handleWeekendDateChange(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-stone-50 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1C4123] cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  {isPt ? 'A data da reunião será gerada automaticamente com base no dia escolhido.' : 'La fecha de la reunión se generará automáticamente según el día elegido.'}
                </p>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Data da Reunião (Gerada):' : 'Fecha de la Reunión:'}
                </label>
                <input
                  type="text"
                  required
                  value={newWeekendLabel}
                  onChange={(e) => setNewWeekendLabel(e.target.value)}
                  placeholder={isPt ? 'Ex: 17 de Agosto de 2025' : 'Ej: 17 de Agosto de 2025'}
                  className="w-full border border-[#1C4123]/30 rounded-xl p-3 bg-[#E8F0E6] font-bold text-[#1C4123] focus:outline-none focus:ring-2 focus:ring-[#1C4123]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowNewWeekendModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                {isPt ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={saving || !newWeekendLabel.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1C4123] hover:bg-[#285A31] text-white transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? (isPt ? 'Criando...' : 'Creando...') : (isPt ? 'Criar Data' : 'Crear Fecha')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Cleaning Modal */}
      {showNewCleaningModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddCleaningSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Nova Escala de Limpeza</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCleaningModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Semana:</label>
                <input
                  type="text"
                  required
                  value={newCleaningWeek}
                  onChange={(e) => setNewCleaningWeek(e.target.value)}
                  placeholder="Ex: 11 a 17 de Agosto"
                  className="w-full border rounded-xl p-3 bg-stone-50 text-stone-900"
                />
              </div>
              <div>
                <label className="font-bold text-stone-800 block mb-1">Grupo Responsável:</label>
                <input
                  type="text"
                  value={newCleaningGroup}
                  onChange={(e) => setNewCleaningGroup(e.target.value)}
                  placeholder="Ex: Grupo 1"
                  className="w-full border rounded-xl p-3 bg-stone-50 text-stone-900"
                />
              </div>
              <div>
                <label className="font-bold text-stone-800 block mb-1">Superintendente Responsável:</label>
                <input
                  type="text"
                  value={newCleaningOverseer}
                  onChange={(e) => setNewCleaningOverseer(e.target.value)}
                  placeholder="Nome do superintendente"
                  className="w-full border rounded-xl p-3 bg-stone-50 text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowNewCleaningModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !newCleaningWeek.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1C4123] text-white hover:bg-[#285A31] cursor-pointer disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New / Edit Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddGroupSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>
                  {editingGroup
                    ? (isPt ? 'Editar Grupo de Serviço' : 'Editar Grupo de Servicio')
                    : (isPt ? 'Novo Grupo de Serviço' : 'Nuevo Grupo de Servicio')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowNewGroupModal(false);
                  setEditingGroup(null);
                }}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Número do Grupo:</label>
                  <input
                    type="number"
                    value={newGroupNum}
                    onChange={(e) => setNewGroupNum(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Nome do Grupo:</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Grupo Centro"
                    className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Superintendente:</label>
                <input
                  type="text"
                  value={newGroupOverseer}
                  onChange={(e) => setNewGroupOverseer(e.target.value)}
                  placeholder="Nome do superintendente"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Ajudante:</label>
                <input
                  type="text"
                  value={newGroupAssistant}
                  onChange={(e) => setNewGroupAssistant(e.target.value)}
                  placeholder="Nome do ajudante"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Local de Saída:</label>
                <input
                  type="text"
                  value={newGroupLocation}
                  onChange={(e) => setNewGroupLocation(e.target.value)}
                  placeholder="Ex: Salão do Reino / Rua das Flores, 100"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Horário das Saídas:</label>
                <input
                  type="text"
                  value={newGroupSchedule}
                  onChange={(e) => setNewGroupSchedule(e.target.value)}
                  placeholder="Ex: Sábados e Domingos às 09:00"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Integrantes do Grupo (Nomes):' : 'Integrantes del Grupo (Nombres):'}
                </label>
                <textarea
                  rows={4}
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  placeholder={
                    isPt
                      ? 'Digite os nomes dos integrantes (um por linha ou separados por vírgula)...'
                      : 'Ingrese los nombres de los integrantes (uno por línea o separados por coma)...'
                  }
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900 resize-y"
                />
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {isPt ? 'Ex: João Silva, Maria Souza, Pedro Santos' : 'Ej: Juan Silva, María Souza'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowNewGroupModal(false);
                  setEditingGroup(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1C4123] text-white hover:bg-[#285A31] cursor-pointer disabled:opacity-50"
              >
                {editingGroup
                  ? (isPt ? 'Salvar Alterações' : 'Guardar Cambios')
                  : (isPt ? 'Adicionar Grupo' : 'Agregar Grupo')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Witnessing Modal */}
      {showNewWitnessingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddWitnessingSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Novo Ponto de Testemunho</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewWitnessingModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Local do Ponto:</label>
                <input
                  type="text"
                  required
                  value={newWitnessingLocation}
                  onChange={(e) => setNewWitnessingLocation(e.target.value)}
                  placeholder="Ex: Praça Central / Estação de Trem"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Dia da Semana:</label>
                  <input
                    type="text"
                    value={newWitnessingDay}
                    onChange={(e) => setNewWitnessingDay(e.target.value)}
                    placeholder="Ex: Sábado"
                    className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Horário:</label>
                  <input
                    type="text"
                    value={newWitnessingTime}
                    onChange={(e) => setNewWitnessingTime(e.target.value)}
                    placeholder="Ex: 09:00 - 11:00"
                    className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Publicadores (separados por vírgula):</label>
                <input
                  type="text"
                  value={newWitnessingPublishers}
                  onChange={(e) => setNewWitnessingPublishers(e.target.value)}
                  placeholder="Ex: João Silva, Maria Santos"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowNewWitnessingModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !newWitnessingLocation.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1C4123] text-white hover:bg-[#285A31] cursor-pointer disabled:opacity-50"
              >
                Adicionar Ponto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Accessibility Text Scale Selector Bar */}
      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};
