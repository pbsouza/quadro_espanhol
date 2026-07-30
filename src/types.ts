export type AppLanguage = string;

export type PageView = 
  | 'home' 
  | 'midweek' 
  | 'weekend' 
  | 'cleaning' 
  | 'witnessing' 
  | 'groups' 
  | 'announcements'
  | 'admin';

export interface TesouroItem {
  id: string;
  title: string;
  durationMin: number;
  speaker: string;
  speakerSalaB?: string;
  type: 'talk' | 'gems' | 'reading';
}

export interface MinisterioPart {
  id: string;
  title: string;
  durationMin: number;
  assignedMain: string;
  assignedAssistant?: string;
  assignedSalaB?: string;
  assignedSalaBAssistant?: string;
  description?: string;
}

export interface VidaCristaPart {
  id: string;
  title: string;
  durationMin: number;
  speaker: string;
  reader?: string;
  description?: string;
  isBibleStudy?: boolean;
}

export interface MidweekMeeting {
  id: string;
  weekId: string; // e.g. "2025-W31"
  weekLabel: string; // e.g. "28 de Julho - 3 de Agosto de 2025"
  weekLabelEs?: string;
  president: string;
  initialSong: string;
  initialPrayer: string;
  counselorSalaB: string;
  tesouros: TesouroItem[];
  facaSeuMelhor: MinisterioPart[];
  nossaVidaCrista: VidaCristaPart[];
  middleSong: string;
  finalSong: string;
  finalPrayer: string;
}

export interface WeekendMeeting {
  id: string;
  weekId: string;
  weekLabel: string;
  publicTalkTitle: string;
  speakerName: string;
  speakerCongregation: string;
  president: string;
  initialSong: string;
  watchtowerTitle: string;
  watchtowerConductor: string;
  watchtowerReader: string;
  finalSong: string;
  finalPrayer: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'geral' | 'evento' | 'lembrete';
  important?: boolean;
  expirationDate?: string;
}

export interface CleaningSchedule {
  id: string;
  weekLabel: string;
  group: string;
  overseer: string;
  tasks: string[];
}

export interface PublicWitnessingSchedule {
  id: string;
  location: string;
  dayOfWeek: string;
  timeSlot: string;
  publishers: string[];
}

export interface CongregationGroup {
  id: string;
  number: number;
  name: string;
  overseer: string;
  assistant: string;
  location: string;
  schedule: string;
  members?: string[];
}

export interface CardImages {
  midweek?: string;
  weekend?: string;
  cleaning?: string;
  witnessing?: string;
  groups?: string;
}

export const DEFAULT_CARD_IMAGES: CardImages = {
  midweek: '/img/midweek.jpg',
  weekend: '/img/weekend.jpg',
  cleaning: '/img/cleaning.jpg',
  witnessing: '/img/witnessing.jpg',
  groups: '/img/groups.jpg',
};
