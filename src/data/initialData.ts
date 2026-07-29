import { MidweekMeeting, WeekendMeeting, Announcement, CleaningSchedule, PublicWitnessingSchedule, CongregationGroup } from '../types';
import { get21WeeksWindow, formatYYYYMMDD } from '../utils/weekUtils';

const monthsPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const monthsEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monDay = String(monday.getDate()).padStart(2, '0');
  const monMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const monYear = monday.getFullYear();

  const sunDay = String(sunday.getDate()).padStart(2, '0');
  const sunMonth = String(sunday.getMonth() + 1).padStart(2, '0');
  const sunYear = sunday.getFullYear();

  return `${monDay}/${monMonth}/${monYear} - ${sunDay}/${sunMonth}/${sunYear}`;
}

function formatWeekendLabel(sunday: Date): string {
  const day = String(sunday.getDate()).padStart(2, '0');
  const month = String(sunday.getMonth() + 1).padStart(2, '0');
  const year = sunday.getFullYear();
  return `${day}/${month}/${year}`;
}

const sampleSpeakers = [
  'Carlos Eduardo Santos',
  'Lucas Oliveira',
  'Rafael Souza',
  'Antônio Ferreira',
  'Roberto Almeida',
  'Fernando Costa',
  'Marcos Silva',
  'Daniel Pereira',
];

const sampleTalkTitles = [
  'Tenha Confiança em Jeová em Tempos Difíceis',
  'Como Superar a Ansiedade com a Ajuda de Deus',
  'Jeová Abençoa Quem É Leal e Perseverante',
  'Mantenha Sua Família Forte em Sentido Espiritual',
  'A Palavra de Deus É Viva e Exerce Poder',
  'Imite a Coragem dos Servos de Deus do Passado',
  'Seja Sábio e Escolha Bons Amigos',
  'Sirva a Jeová com Alegria e de Todo o Coração',
];

const samplePublicTalks = [
  'Por Que Amar Verdadeiramente o Próximo?',
  'Como o Reino de Deus Vai Mudar a Terra',
  'Você PODE Ter um Futuro Feliz!',
  'Deus Realmente Se Importa Conosco?',
  'Como Fazer Boas Escolhas na Vida',
  'Onde Encontrar Verdadeira Paz e Segurança',
];

const sampleWatchtowerTitles = [
  'Como Manter Nossa Fé Forte em Tempos de Incerteza',
  'Ame a Jeová e Seja Leal à Sua Organização',
  'Continue Mostrando Amor Fraternal Todos os Dias',
  'Permaneça Calmo e Confie no Poder de Deus',
  'Seja Grato Por Todas as Bênçãos de Jeová',
  'Trabalhem Juntos em União e Harmonia',
];

export function generate21WeeksMidweekMeetings(refDate: Date = new Date()): MidweekMeeting[] {
  const { weekIds } = get21WeeksWindow(refDate);

  return weekIds.map((weekStr, index) => {
    const parts = weekStr.split('-');
    const monday = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    
    const speakerIdx = index % sampleSpeakers.length;
    const speaker2Idx = (index + 2) % sampleSpeakers.length;
    const speaker3Idx = (index + 4) % sampleSpeakers.length;
    const talkTitle = sampleTalkTitles[index % sampleTalkTitles.length];

    return {
      id: `week-${weekStr}`,
      weekId: weekStr,
      weekLabel: formatWeekLabel(monday),
      weekLabelEs: formatWeekLabel(monday),
      president: sampleSpeakers[speakerIdx],
      initialSong: `Cântico ${(index * 7 + 12) % 150 + 1}`,
      initialPrayer: sampleSpeakers[(speakerIdx + 1) % sampleSpeakers.length],
      counselorSalaB: sampleSpeakers[(speakerIdx + 3) % sampleSpeakers.length],
      tesouros: [
        {
          id: `t1_${weekStr}`,
          title: `${talkTitle} (10 min.)`,
          durationMin: 10,
          speaker: sampleSpeakers[speaker2Idx],
          type: 'talk',
        },
        {
          id: `t2_${weekStr}`,
          title: 'Joias Espirituais (10 min.)',
          durationMin: 10,
          speaker: sampleSpeakers[speaker3Idx],
          type: 'gems',
        },
        {
          id: `t3_${weekStr}`,
          title: 'Leitura da Bíblia (4 min.)',
          durationMin: 4,
          speaker: 'Mateus Lima',
          speakerSalaB: 'Gabriel Costa',
          type: 'reading',
        },
      ],
      facaSeuMelhor: [
        {
          id: `m1_${weekStr}`,
          title: 'Iniciando Conversas (3 min.)',
          durationMin: 3,
          assignedMain: 'Felipe Rocha',
          assignedAssistant: 'Thiago Mendes',
          assignedSalaB: 'Bruno Dias',
          assignedSalaBAssistant: 'Daniel Pereira',
        },
        {
          id: `m2_${weekStr}`,
          title: 'Cultivando o Interesse (4 min.)',
          durationMin: 4,
          assignedMain: 'André Martins',
          assignedAssistant: 'Pedro Henrique',
          assignedSalaB: 'Samuel Ramos',
          assignedSalaBAssistant: 'Víctor Nunes',
        },
        {
          id: `m3_${weekStr}`,
          title: 'Fazendo Discípulos (5 min.)',
          durationMin: 5,
          assignedMain: 'Rodrigo Alves',
          assignedAssistant: 'Leandro Castro',
          assignedSalaB: 'Gustavo Barbosa',
          assignedSalaBAssistant: 'Henrique Cardoso',
        },
      ],
      middleSong: `Cântico ${(index * 5 + 40) % 150 + 1}`,
      nossaVidaCrista: [
        {
          id: `v1_${weekStr}`,
          title: 'Necessidades Locais (15 min.)',
          durationMin: 15,
          speaker: sampleSpeakers[(speakerIdx + 5) % sampleSpeakers.length],
        },
        {
          id: `v2_${weekStr}`,
          title: 'Estudo Bíblico de Congregação (30 min.)',
          durationMin: 30,
          speaker: `${sampleSpeakers[speakerIdx]} (Dirigente)`,
          reader: 'João Pedro Silva (Leitor)',
          isBibleStudy: true,
        },
      ],
      finalSong: `Cântico ${(index * 9 + 80) % 150 + 1}`,
      finalPrayer: sampleSpeakers[(speakerIdx + 6) % sampleSpeakers.length],
    };
  });
}

export function generate21WeeksWeekendMeetings(refDate: Date = new Date()): WeekendMeeting[] {
  const { weekIds } = get21WeeksWindow(refDate);

  return weekIds.map((weekStr, index) => {
    const parts = weekStr.split('-');
    const monday = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const sundayStr = formatYYYYMMDD(sunday);

    const speakerIdx = index % sampleSpeakers.length;
    const talkTitle = samplePublicTalks[index % samplePublicTalks.length];
    const wtTitle = sampleWatchtowerTitles[index % sampleWatchtowerTitles.length];

    return {
      id: `w-${sundayStr}`,
      weekId: weekStr,
      weekLabel: formatWeekendLabel(sunday),
      publicTalkTitle: talkTitle,
      speakerName: sampleSpeakers[(speakerIdx + 2) % sampleSpeakers.length],
      speakerCongregation: 'Congregação Central',
      president: sampleSpeakers[speakerIdx],
      initialSong: `Cântico ${(index * 3 + 15) % 150 + 1}`,
      watchtowerTitle: wtTitle,
      watchtowerConductor: sampleSpeakers[(speakerIdx + 1) % sampleSpeakers.length],
      watchtowerReader: sampleSpeakers[(speakerIdx + 4) % sampleSpeakers.length],
      finalSong: `Cântico ${(index * 7 + 90) % 150 + 1}`,
      finalPrayer: sampleSpeakers[(speakerIdx + 5) % sampleSpeakers.length],
    };
  });
}

export const INITIAL_MIDWEEK_MEETINGS: MidweekMeeting[] = generate21WeeksMidweekMeetings();
export const INITIAL_WEEKEND_MEETINGS: WeekendMeeting[] = generate21WeeksWeekendMeetings();

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Limpeza Geral do Salão do Reino',
    content: 'Neste próximo sábado, às 08:30, teremos a limpeza geral do Salão do Reino. Todos do Grupo 2 estão convidados.',
    date: new Date().toISOString().split('T')[0],
    category: 'lembrete',
    important: true,
  },
  {
    id: 'ann-2',
    title: 'Assembleia de Circuito - Inscrições',
    content: 'A assembleia do circuito está agendada para o próximo mês. Verifique com o secretário o transporte e arranjos de hospedagem.',
    date: new Date().toISOString().split('T')[0],
    category: 'evento',
    important: true,
  },
  {
    id: 'ann-3',
    title: 'Escola do Serviço de Pioneiro',
    content: 'Desejamos excelentes bênçãos aos irmãos que participarão da Escola de Pioneiros na próxima semana.',
    date: new Date().toISOString().split('T')[0],
    category: 'geral',
    important: false,
  },
];

export const INITIAL_CLEANING: CleaningSchedule[] = [
  {
    id: 'clean-1',
    weekLabel: 'Semana Atual',
    group: 'Grupo 1 - Bairro Interlagos',
    overseer: 'Lucas Oliveira',
    tasks: ['Higienização dos sanitários', 'Aspirar e varrer o auditório', 'Limpeza do palco e pódio', 'Recolhimento dos lixos'],
  },
  {
    id: 'clean-2',
    weekLabel: 'Próxima Semana',
    group: 'Grupo 2 - Bairro Três Barras',
    overseer: 'Carlos Eduardo Santos',
    tasks: ['Limpeza dos vidros e portas', 'Desinfecção das cadeiras', 'Organização do balcão de publicações', 'Limpeza do pátio externo'],
  },
];

export const INITIAL_WITNESSING: PublicWitnessingSchedule[] = [
  {
    id: 'wit-1',
    location: 'Praça 22 de Agosto - Centro',
    dayOfWeek: 'Terça-feira',
    timeSlot: '09:00 - 11:00',
    publishers: ['Maria Santos', 'Elena Rodríguez', 'Carmen Silva'],
  },
  {
    id: 'wit-2',
    location: 'Terminal Rodoviário',
    dayOfWeek: 'Quinta-feira',
    timeSlot: '15:00 - 17:00',
    publishers: ['Roberto Almeida', 'José Martínez'],
  },
  {
    id: 'wit-3',
    location: 'Praça Novo Horizonte',
    dayOfWeek: 'Sábado',
    timeSlot: '08:30 - 10:30',
    publishers: ['Ana Paula Oliveira', 'Beatriz Gómez'],
  },
];

export const INITIAL_GROUPS: CongregationGroup[] = [
  {
    id: 'grp-1',
    number: 1,
    name: 'Grupo Interlagos',
    overseer: 'Lucas Oliveira',
    assistant: 'Rafael Souza',
    location: 'Rua Dom Pedro II, nº 142 - Interlagos',
    schedule: 'Sábados e Domingos às 09:00',
    members: ['Lucas Oliveira', 'Rafael Souza', 'Mateus Lima', 'Ana Paula Oliveira', 'Beatriz Gómez'],
  },
  {
    id: 'grp-2',
    number: 2,
    name: 'Grupo Três Barras',
    overseer: 'Carlos Eduardo Santos',
    assistant: 'Antônio Ferreira',
    location: 'Av. Presidente Vargas, nº 850 - Três Barras',
    schedule: 'Sábados e Domingos às 09:00',
    members: ['Carlos Eduardo Santos', 'Antônio Ferreira', 'Samuel Ramos', 'Bruno Dias', 'Carla Mendes'],
  },
  {
    id: 'grp-3',
    number: 3,
    name: 'Grupo Novo Horizonte',
    overseer: 'Roberto Almeida',
    assistant: 'Fernando Costa',
    location: 'Rua São Mateus, nº 310 - Novo Horizonte',
    schedule: 'Sábados e Domingos às 09:00',
    members: ['Roberto Almeida', 'Fernando Costa', 'Pedro Henrique', 'Thiago Mendes', 'Marcos Silva'],
  },
];
