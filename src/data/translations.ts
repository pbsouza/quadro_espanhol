import { AppLanguage } from '../types';

export interface TranslationDictionary {
  // Common / Navigation
  manage: string;
  home: string;
  midweekMeeting: string;
  weekendMeeting: string;
  announcements: string;
  cleaning: string;
  witnessing: string;
  groups: string;
  language: string;
  portuguese: string;
  spanish: string;
  textSize: string;
  backToHome: string;
  close: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  add: string;
  actions: string;
  loading: string;
  error: string;
  retry: string;
  none: string;

  // Header & Title
  boardTitle: string;
  boardSubtitle: string;
  boardCity: string;
  congregationName: string;
  congregationType: string;

  // Home Page
  announcementsAndReminders: string;
  upcomingEvents: string;
  announcementsAvailableSingular: string;
  announcementsAvailablePlural: string;
  activities: string;
  midweekMeetingCard: string;
  weekendMeetingCard: string;
  cleaningCard: string;
  witnessingCard: string;
  groupsCard: string;

  // Midweek Meeting Page
  midweekTitle: string;
  midweekSubtitle: string;
  treasuresFromGodsWord: string;
  treasuresTitle: string;
  applyYourselfToFieldMinistry: string;
  fieldMinistryTitle: string;
  livingAsChristians: string;
  christianLivingTitle: string;
  song: string;
  prayer: string;
  initialPrayer: string;
  finalPrayer: string;
  initialSong: string;
  middleSong: string;
  finalSong: string;
  openingComments: string;
  concludingComments: string;
  congregationBibleStudy: string;
  president: string;
  chairman: string;
  auxiliaryCounselor: string;
  counselorSalaB: string;
  reader: string;
  speakerOrConductor: string;
  mainHall: string;
  auxiliaryHall: string;
  auxiliaryClass: string;
  speaker: string;
  part: string;
  addPart: string;
  nextWeek: string;
  previousWeek: string;
  currentWeek: string;
  selectWeek: string;
  weekOf: string;
  gemsTitle: string;
  bibleReadingTitle: string;
  talkPartTitle: string;

  // Weekend Meeting Page
  weekendTitle: string;
  weekendSubtitle: string;
  publicTalk: string;
  publicTalkTitle: string;
  talkTheme: string;
  watchtowerStudy: string;
  watchtowerStudyTitle: string;
  watchtowerReader: string;
  theme: string;
  congregation: string;
  conductor: string;
  watchtowerTitle: string;

  // Cleaning Page
  cleaningTitle: string;
  cleaningSubtitle: string;
  responsibleGroup: string;
  overseerInCharge: string;
  dateOrPeriod: string;
  additionalInstructions: string;
  noCleaningSchedule: string;

  // Public Witnessing Page
  witnessingTitle: string;
  witnessingSubtitle: string;
  location: string;
  schedule: string;
  publishersAssigned: string;
  noWitnessingSchedule: string;

  // Groups Page
  groupsTitle: string;
  groupsSubtitle: string;
  groupNumber: string;
  overseer: string;
  assistant: string;
  departureLocation: string;
  meetingTimes: string;
  groupMembers: string;
  noGroupMembers: string;

  // Announcements Page
  announcementsTitle: string;
  announcementsSubtitle: string;
  publishedOn: string;
  pinned: string;
  noAnnouncements: string;

  // Admin / Management Page
  adminPanelTitle: string;
  adminPanelSubtitle: string;
  tabMidweek: string;
  tabWeekend: string;
  tabAnnouncements: string;
  tabCleaning: string;
  tabWitnessing: string;
  tabGroups: string;

  // Admin Actions & Modals
  saveSuccess: string;
  deleteSuccess: string;
  confirmDelete: string;
  addNewWeek: string;
  newAnnouncement: string;
  newCleaningSchedule: string;
  newWitnessingSchedule: string;
  newGroup: string;
  editGroup: string;
  groupName: string;
  groupNumberLabel: string;
  groupOverseerLabel: string;
  groupAssistantLabel: string;
  groupLocationLabel: string;
  groupScheduleLabel: string;
  groupMembersInputLabel: string;
  groupMembersPlaceholder: string;
  groupMembersHelp: string;
  
  // Data Reset / Sync
  syncData: string;
  restoreInitialData: string;
  restoreDataWarning: string;
  confirmResetData: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  pt: {
    // Common / Navigation
    manage: 'Gerenciar',
    home: 'Início',
    midweekMeeting: 'Reunião Meio de Semana',
    weekendMeeting: 'Reunião Fim de Semana',
    announcements: 'Anúncios e Lembretes',
    cleaning: 'Limpeza do Salão',
    witnessing: 'Testemunho Público',
    groups: 'Grupos de Serviço',
    language: 'Idioma',
    portuguese: 'Português',
    spanish: 'Español',
    textSize: 'Tamanho do Texto',
    backToHome: 'Voltar ao Quadro',
    close: 'Fechar',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    add: 'Adicionar',
    actions: 'Ações',
    loading: 'Carregando...',
    error: 'Erro de conexão',
    retry: 'Tentar Novamente',
    none: 'Nenhum',

    // Header & Title
    boardTitle: 'Quadro de Anúncios -',
    boardSubtitle: 'Congregação Espanhola de',
    boardCity: 'Linhares',
    congregationName: 'Congregação Linhares',
    congregationType: 'Espanhola',

    // Home Page
    announcementsAndReminders: 'Anúncios e Lembretes',
    upcomingEvents: 'Próximos Eventos',
    announcementsAvailableSingular: 'aviso disponível',
    announcementsAvailablePlural: 'avisos disponíveis',
    activities: 'Atividades',
    midweekMeetingCard: 'Reunião Meio de Semana',
    weekendMeetingCard: 'Reunião Fim de Semana',
    cleaningCard: 'Limpeza do Salão',
    witnessingCard: 'Testemunho Público',
    groupsCard: 'Grupos de Serviço',

    // Midweek Meeting Page
    midweekTitle: 'Nossa Vida e Ministério Cristão',
    midweekSubtitle: 'Programação da Reunião de Meio de Semana',
    treasuresFromGodsWord: 'TESOUROS DA PALAVRA DE DEUS',
    treasuresTitle: 'TESOUROS DA PALAVRA DE DEUS',
    applyYourselfToFieldMinistry: 'FAÇA SEU MELHOR NO MINISTÉRIO',
    fieldMinistryTitle: 'FAÇA SEU MELHOR NO MINISTÉRIO',
    livingAsChristians: 'NOSSA VIDA CRISTÃ',
    christianLivingTitle: 'NOSSA VIDA CRISTÃ',
    song: 'Cântico',
    prayer: 'Oração',
    initialPrayer: 'Oração Inicial',
    finalPrayer: 'Oração Final',
    initialSong: 'Cântico Inicial',
    middleSong: 'Cântico Intermediário',
    finalSong: 'Cântico Final',
    openingComments: 'Comentários Iniciais',
    concludingComments: 'Comentários Finais',
    congregationBibleStudy: 'Estudo Bíblico de Congregação',
    president: 'Presidente',
    chairman: 'Presidente',
    auxiliaryCounselor: 'Conselheiro Auxiliar',
    counselorSalaB: 'Conselheiro da Sala B',
    reader: 'Leitor',
    speakerOrConductor: 'Orador / Dirigente',
    mainHall: 'Salão Principal',
    auxiliaryHall: 'Sala B',
    auxiliaryClass: 'Sala B',
    speaker: 'Orador',
    part: 'Parte',
    addPart: 'Adicionar Parte',
    nextWeek: 'Próxima Semana',
    previousWeek: 'Semana Anterior',
    currentWeek: 'Semana Atual',
    selectWeek: 'Selecionar Semana',
    weekOf: 'Semana de',
    gemsTitle: 'Joias Espirituais (10 min.)',
    bibleReadingTitle: 'Leitura da Bíblia (4 min.)',
    talkPartTitle: 'Discurso (10 min.)',

    // Weekend Meeting Page
    weekendTitle: 'Reunião do Fim de Semana',
    weekendSubtitle: 'Discurso Público e Estudo de A Sentinela',
    publicTalk: 'DISCURSO PÚBLICO',
    publicTalkTitle: 'DISCURSO PÚBLICO',
    talkTheme: 'Tema do Discurso',
    watchtowerStudy: 'ESTUDO DE A SENTINELA',
    watchtowerStudyTitle: 'ESTUDO DE A SENTINELA',
    watchtowerReader: 'Leitor',
    theme: 'Tema',
    congregation: 'Congregação',
    conductor: 'Dirigente',
    watchtowerTitle: 'Estudo de A Sentinela',

    // Cleaning Page
    cleaningTitle: 'Limpeza do Salão do Reino',
    cleaningSubtitle: 'Escala e Grupos Encarregados da Limpeza',
    responsibleGroup: 'Grupo Responsável',
    overseerInCharge: 'Superintendente Encarregado',
    dateOrPeriod: 'Data / Período',
    additionalInstructions: 'Instruções Adicionais',
    noCleaningSchedule: 'Nenhuma escala de limpeza cadastrada.',

    // Public Witnessing Page
    witnessingTitle: 'Testemunho Público de Carrinho',
    witnessingSubtitle: 'Locais, Horários e Publicadores Designados',
    location: 'Local',
    schedule: 'Horário / Escala',
    publishersAssigned: 'Publicadores Designados',
    noWitnessingSchedule: 'Nenhuma escala de testemunho público cadastrada.',

    // Groups Page
    groupsTitle: 'Grupos de Serviço de Campo',
    groupsSubtitle: 'Organização dos Grupos e Saídas para o Ministério',
    groupNumber: 'Grupo',
    overseer: 'Superintendente',
    assistant: 'Ajudante',
    departureLocation: 'Local de Saída',
    meetingTimes: 'Horários de Saída',
    groupMembers: 'Integrantes do Grupo',
    noGroupMembers: 'Nenhum integrante cadastrado',

    // Announcements Page
    announcementsTitle: 'Anúncios e Lembretes Importantes',
    announcementsSubtitle: 'Avisos e informações gerais para a congregação',
    publishedOn: 'Publicado em',
    pinned: 'Destaque',
    noAnnouncements: 'Nenhum anúncio disponível no momento.',

    // Admin / Management Page
    adminPanelTitle: 'Painel de Gerenciamento',
    adminPanelSubtitle: 'Edite informações do quadro de anúncios da congregação',
    tabMidweek: 'Meio de Semana',
    tabWeekend: 'Fim de Semana',
    tabAnnouncements: 'Anúncios',
    tabCleaning: 'Limpeza',
    tabWitnessing: 'Testemunho',
    tabGroups: 'Grupos',

    // Admin Actions & Modals
    saveSuccess: 'Alterações salvas com sucesso!',
    deleteSuccess: 'Item excluído com sucesso!',
    confirmDelete: 'Tem certeza que deseja excluir este item?',
    addNewWeek: 'Adicionar Nova Semana',
    newAnnouncement: 'Novo Anúncio',
    newCleaningSchedule: 'Nova Escala de Limpeza',
    newWitnessingSchedule: 'Nova Escala de Testemunho',
    newGroup: 'Novo Grupo de Serviço',
    editGroup: 'Editar Grupo de Serviço',
    groupName: 'Nome do Grupo',
    groupNumberLabel: 'Número do Grupo',
    groupOverseerLabel: 'Superintendente',
    groupAssistantLabel: 'Ajudante',
    groupLocationLabel: 'Local de Saída',
    groupScheduleLabel: 'Horário de Saída',
    groupMembersInputLabel: 'Integrantes do Grupo (Nomes):',
    groupMembersPlaceholder: 'Digite os nomes dos integrantes (um por linha ou separados por vírgula)...',
    groupMembersHelp: 'Ex: João Silva, Maria Souza, Pedro Santos',

    // Data Reset / Sync
    syncData: 'Sincronizar Dados',
    restoreInitialData: 'Restaurar Dados Padrão',
    restoreDataWarning: 'Atenção: isto irá redefinir todas as escalas para os dados iniciais.',
    confirmResetData: 'Tem certeza que deseja redefinir os dados para os padrões iniciais?',
  },

  es: {
    // Common / Navigation
    manage: 'Gestionar',
    home: 'Inicio',
    midweekMeeting: 'Reunión entre Semana',
    weekendMeeting: 'Reunión Fin de Semana',
    announcements: 'Anuncios y Recordatorios',
    cleaning: 'Limpieza del Salón',
    witnessing: 'Predicación Pública',
    groups: 'Grupos de Servicio',
    language: 'Idioma',
    portuguese: 'Português',
    spanish: 'Español',
    textSize: 'Tamaño del Texto',
    backToHome: 'Volver al Cuadro',
    close: 'Cerrar',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    actions: 'Acciones',
    loading: 'Cargando...',
    error: 'Error de conexión',
    retry: 'Intentar de Nuevo',
    none: 'Ninguno',

    // Header & Title
    boardTitle: 'Tablero de Anuncios -',
    boardSubtitle: 'Congregación Española de',
    boardCity: 'Linhares',
    congregationName: 'Congregación Linhares',
    congregationType: 'Española',

    // Home Page
    announcementsAndReminders: 'Anuncios y Recordatorios',
    upcomingEvents: 'Próximos Eventos',
    announcementsAvailableSingular: 'anuncio disponible',
    announcementsAvailablePlural: 'anuncios disponibles',
    activities: 'Actividades',
    midweekMeetingCard: 'Reunión entre Semana',
    weekendMeetingCard: 'Reunión Fin de Semana',
    cleaningCard: 'Limpieza del Salón',
    witnessingCard: 'Predicación Pública',
    groupsCard: 'Grupos de Servicio',

    // Midweek Meeting Page
    midweekTitle: 'Nuestra Vida y Ministerio Cristianos',
    midweekSubtitle: 'Programa de la Reunión entre Semana',
    treasuresFromGodsWord: 'TESOROS DE LA PALABRA DE DIOS',
    treasuresTitle: 'TESOROS DE LA PALABRA DE DIOS',
    applyYourselfToFieldMinistry: 'SEAMOS MEJORES MAESTROS',
    fieldMinistryTitle: 'SEAMOS MEJORES MAESTROS',
    livingAsChristians: 'NUESTRA VIDA CRISTIANA',
    christianLivingTitle: 'NUESTRA VIDA CRISTIANA',
    song: 'Canción',
    prayer: 'Oración',
    initialPrayer: 'Oración Inicial',
    finalPrayer: 'Oración Final',
    initialSong: 'Canción Inicial',
    middleSong: 'Canción Intermedia',
    finalSong: 'Canción Final',
    openingComments: 'Palabras de Introducción',
    concludingComments: 'Palabras de Conclusión',
    congregationBibleStudy: 'Estudio Bíblico de la Congregación',
    president: 'Presidente',
    chairman: 'Presidente',
    auxiliaryCounselor: 'Consejero Auxiliar',
    counselorSalaB: 'Consejero Sala B',
    reader: 'Lector',
    speakerOrConductor: 'Orador / Conductor',
    mainHall: 'Salón Principal',
    auxiliaryHall: 'Sala B',
    auxiliaryClass: 'Sala B',
    speaker: 'Orador',
    part: 'Intervención',
    addPart: 'Agregar Intervención',
    nextWeek: 'Próxima Semana',
    previousWeek: 'Semana Anterior',
    currentWeek: 'Semana Actual',
    selectWeek: 'Seleccionar Semana',
    weekOf: 'Semana del',
    gemsTitle: 'Buscemos Perlas Escondidas (10 min.)',
    bibleReadingTitle: 'Lectura de la Biblia (4 min.)',
    talkPartTitle: 'Discurso (10 min.)',

    // Weekend Meeting Page
    weekendTitle: 'Reunión del Fin de Semana',
    weekendSubtitle: 'Discurso Público y Estudio de La Atalaya',
    publicTalk: 'DISCURSO PÚBLICO',
    publicTalkTitle: 'DISCURSO PÚBLICO',
    talkTheme: 'Tema del Discurso',
    watchtowerStudy: 'ESTUDIO DE LA ATALAYA',
    watchtowerStudyTitle: 'ESTUDIO DE LA ATALAYA',
    watchtowerReader: 'Lector',
    theme: 'Tema',
    congregation: 'Congregación',
    conductor: 'Conductor',
    watchtowerTitle: 'Estudio de La Atalaya',

    // Cleaning Page
    cleaningTitle: 'Limpieza del Salón del Reino',
    cleaningSubtitle: 'Programa y Grupos Encargados de la Limpieza',
    responsibleGroup: 'Grupo Encargado',
    overseerInCharge: 'Superintendente Encargado',
    dateOrPeriod: 'Fecha / Período',
    additionalInstructions: 'Instrucciones Adicionales',
    noCleaningSchedule: 'No hay programa de limpieza registrado.',

    // Public Witnessing Page
    witnessingTitle: 'Predicación Pública con Carrito',
    witnessingSubtitle: 'Lugares, Horarios y Publicadores Asignados',
    location: 'Lugar',
    schedule: 'Horario / Turno',
    publishersAssigned: 'Publicadores Asignados',
    noWitnessingSchedule: 'No hay programa de predicación pública registrado.',

    // Groups Page
    groupsTitle: 'Grupos de Servicio del Campo',
    groupsSubtitle: 'Organización de los Grupos y Salidas a la Predicación',
    groupNumber: 'Grupo',
    overseer: 'Superintendente',
    assistant: 'Ayudante',
    departureLocation: 'Lugar de Salida',
    meetingTimes: 'Horarios de Salida',
    groupMembers: 'Integrantes del Grupo',
    noGroupMembers: 'Sin integrantes registrados',

    // Announcements Page
    announcementsTitle: 'Anuncios y Recordatorios Importantes',
    announcementsSubtitle: 'Avisos e información general para la congregación',
    publishedOn: 'Publicado el',
    pinned: 'Destacado',
    noAnnouncements: 'No hay anuncios disponibles en este momento.',

    // Admin / Management Page
    adminPanelTitle: 'Panel de Gestión',
    adminPanelSubtitle: 'Edite información del tablero de anuncios de la congregación',
    tabMidweek: 'Entre Semana',
    tabWeekend: 'Fin de Semana',
    tabAnnouncements: 'Anuncios',
    tabCleaning: 'Limpieza',
    tabWitnessing: 'Predicación',
    tabGroups: 'Grupos',

    // Admin Actions & Modals
    saveSuccess: '¡Cambios guardados con éxito!',
    deleteSuccess: '¡Elemento eliminado con éxito!',
    confirmDelete: '¿Está seguro de que desea eliminar este elemento?',
    addNewWeek: 'Agregar Nueva Semana',
    newAnnouncement: 'Nuevo Anuncio',
    newCleaningSchedule: 'Nuevo Programa de Limpieza',
    newWitnessingSchedule: 'Nuevo Programa de Predicación',
    newGroup: 'Nuevo Grupo de Servicio',
    editGroup: 'Editar Grupo de Servicio',
    groupName: 'Nombre del Grupo',
    groupNumberLabel: 'Número del Grupo',
    groupOverseerLabel: 'Superintendente',
    groupAssistantLabel: 'Ayudante',
    groupLocationLabel: 'Lugar de Salida',
    groupScheduleLabel: 'Horario de Salida',
    groupMembersInputLabel: 'Integrantes del Grupo (Nombres):',
    groupMembersPlaceholder: 'Ingrese los nombres de los integrantes (uno por línea o separados por coma)...',
    groupMembersHelp: 'Ej: Juan Silva, María Souza, Pedro Santos',

    // Data Reset / Sync
    syncData: 'Sincronizar Datos',
    restoreInitialData: 'Restaurar Datos Predeterminados',
    restoreDataWarning: 'Atención: esto restablecerá todos los programas a los datos iniciales.',
    confirmResetData: '¿Está seguro de que desea restablecer los datos a los valores iniciales?',
  }
};

export interface LanguageOption {
  code: string;
  name: string;
}

export interface CustomTranslationsData {
  languages?: LanguageOption[];
  customLanguages?: LanguageOption[];
  dictionaries?: Record<string, Record<string, string>>;
  translations?: Record<string, Record<string, string>>;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
];

let customTranslationsState: CustomTranslationsData = {
  languages: DEFAULT_LANGUAGES,
  customLanguages: DEFAULT_LANGUAGES,
  dictionaries: {},
  translations: {},
};

const translationListeners: Array<(data: CustomTranslationsData) => void> = [];

export function setCustomTranslationsData(data: Partial<CustomTranslationsData>) {
  const rawLangs = data.languages || data.customLanguages;
  const rawDicts = data.dictionaries || data.translations || {};
  customTranslationsState = {
    languages: rawLangs && rawLangs.length > 0 ? rawLangs : DEFAULT_LANGUAGES,
    customLanguages: rawLangs && rawLangs.length > 0 ? rawLangs : DEFAULT_LANGUAGES,
    dictionaries: rawDicts,
    translations: rawDicts,
  };
  translationListeners.forEach((fn) => fn(customTranslationsState));
}

export function subscribeTranslationUpdates(listener: (data: CustomTranslationsData) => void) {
  translationListeners.push(listener);
  listener(customTranslationsState);
  return () => {
    const idx = translationListeners.indexOf(listener);
    if (idx >= 0) translationListeners.splice(idx, 1);
  };
}

export function getAvailableLanguages(): LanguageOption[] {
  return customTranslationsState.languages && customTranslationsState.languages.length > 0
    ? customTranslationsState.languages
    : DEFAULT_LANGUAGES;
}

export function getCustomTranslationsData(): CustomTranslationsData {
  return customTranslationsState;
}

/**
 * Helper function to retrieve a translation dictionary merged with custom overrides
 */
export function getTranslation(lang: AppLanguage = 'pt'): TranslationDictionary {
  const baseDict = translations[lang] || translations.pt;
  const customDict = customTranslationsState.dictionaries[lang] || {};

  return {
    ...translations.pt,
    ...baseDict,
    ...customDict,
  } as TranslationDictionary;
}

/**
 * Helper function to retrieve a specific translated string by key
 */
export function t(key: keyof TranslationDictionary, lang: AppLanguage = 'pt'): string {
  const dict = getTranslation(lang);
  return dict[key] || translations.pt[key] || String(key);
}

