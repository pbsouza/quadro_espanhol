import { MidweekMeeting, WeekendMeeting, Announcement, CleaningSchedule, PublicWitnessingSchedule, CongregationGroup } from '../types';

export const INITIAL_MIDWEEK_MEETINGS: MidweekMeeting[] = [
  {
    id: 'week-2025-07-28',
    weekId: '2025-07-28',
    weekLabel: '28 de Julho - 3 de Agosto de 2025',
    weekLabelEs: '28 de Julio - 3 de Agosto de 2025',
    president: 'Carlos Eduardo Santos',
    initialSong: 'Cântico 45',
    initialPrayer: 'Marcos Silva',
    counselorSalaB: 'Roberto Almeida',
    tesouros: [
      {
        id: 't1',
        title: 'Tenha Confiança em Jeová em Tempos Difíceis (10 min.)',
        durationMin: 10,
        speaker: 'Lucas Oliveira',
        type: 'talk'
      },
      {
        id: 't2',
        title: 'Joias Espirituais (10 min.)',
        durationMin: 10,
        speaker: 'Rafael Souza',
        type: 'gems'
      },
      {
        id: 't3',
        title: 'Leitura da Bíblia (4 min.)',
        durationMin: 4,
        speaker: 'Mateus Lima',
        speakerSalaB: 'Gabriel Costa',
        type: 'reading'
      }
    ],
    facaSeuMelhor: [
      {
        id: 'm1',
        title: 'Iniciando Conversas (3 min.)',
        durationMin: 3,
        assignedMain: 'Felipe Rocha',
        assignedAssistant: 'Thiago Mendes',
        assignedSalaB: 'Bruno Dias',
        assignedSalaBAssistant: 'Daniel Pereira'
      },
      {
        id: 'm2',
        title: 'Cultivando o Interesse (4 min.)',
        durationMin: 4,
        assignedMain: 'André Martins',
        assignedAssistant: 'Pedro Henrique',
        assignedSalaB: 'Samuel Ramos',
        assignedSalaBAssistant: 'Víctor Nunes'
      },
      {
        id: 'm3',
        title: 'Fazendo Discípulos (5 min.)',
        durationMin: 5,
        assignedMain: 'Rodrigo Alves',
        assignedAssistant: 'Leandro Castro',
        assignedSalaB: 'Gustavo Barbosa',
        assignedSalaBAssistant: 'Henrique Cardoso'
      }
    ],
    middleSong: 'Cântico 88',
    nossaVidaCrista: [
      {
        id: 'v1',
        title: 'Necessidades Locais (15 min.)',
        durationMin: 15,
        speaker: 'Fernando Costa'
      },
      {
        id: 'v2',
        title: 'Estudo Bíblico de Congregação (30 min.)',
        durationMin: 30,
        speaker: 'Antônio Ferreira (Dirigente)',
        reader: 'João Pedro Silva (Leitor)',
        isBibleStudy: true
      }
    ],
    finalSong: 'Cântico 110',
    finalPrayer: 'João Almeida'
  },
  {
    id: 'week-2025-08-04',
    weekId: '2025-08-04',
    weekLabel: '4 - 10 de Agosto de 2025',
    weekLabelEs: '4 - 10 de Agosto de 2025',
    president: 'Roberto Almeida',
    initialSong: 'Cântico 12',
    initialPrayer: 'Guilherme Torres',
    counselorSalaB: 'Carlos Eduardo Santos',
    tesouros: [
      {
        id: 't1_2',
        title: 'Como Superar a Ansiedade com a Ajuda de Deus (10 min.)',
        durationMin: 10,
        speaker: 'Antônio Ferreira',
        type: 'talk'
      },
      {
        id: 't2_2',
        title: 'Joias Espirituais (10 min.)',
        durationMin: 10,
        speaker: 'Lucas Oliveira',
        type: 'gems'
      },
      {
        id: 't3_2',
        title: 'Leitura da Bíblia (4 min.)',
        durationMin: 4,
        speaker: 'Daniel Pereira',
        speakerSalaB: 'Víctor Nunes',
        type: 'reading'
      }
    ],
    facaSeuMelhor: [
      {
        id: 'm1_2',
        title: 'Iniciando Conversas (3 min.)',
        durationMin: 3,
        assignedMain: 'Samuel Ramos',
        assignedAssistant: 'Bruno Dias'
      },
      {
        id: 'm2_2',
        title: 'Explicando Suas Crenças (5 min.)',
        durationMin: 5,
        assignedMain: 'Pedro Henrique',
        assignedAssistant: 'Thiago Mendes'
      }
    ],
    middleSong: 'Cântico 64',
    nossaVidaCrista: [
      {
        id: 'v1_2',
        title: 'Trabalho Realizado Pela Organização (10 min.)',
        durationMin: 10,
        speaker: 'Rafael Souza'
      },
      {
        id: 'v2_2',
        title: 'Necessidades Locais (5 min.)',
        durationMin: 5,
        speaker: 'Carlos Eduardo Santos'
      },
      {
        id: 'v3_2',
        title: 'Estudo Bíblico de Congregação (30 min.)',
        durationMin: 30,
        speaker: 'Lucas Oliveira (Dirigente)',
        reader: 'Mateus Lima (Leitor)',
        isBibleStudy: true
      }
    ],
    finalSong: 'Cântico 125',
    finalPrayer: 'Fernando Costa'
  }
];

export const INITIAL_WEEKEND_MEETINGS: WeekendMeeting[] = [
  {
    id: 'w-2025-08-02',
    weekId: '2025-08-02',
    weekLabel: '3 de Agosto de 2025',
    publicTalkTitle: 'Por Que Amar Verdadeiramente o Próximo?',
    speakerName: 'Pr. Marcelo Guimarães',
    speakerCongregation: 'Congregação Central de Vitória',
    president: 'Lucas Oliveira',
    initialSong: 'Cântico 24',
    watchtowerTitle: 'Como Manter Nossa Fé Forte em Tempos de Incerteza',
    watchtowerConductor: 'Carlos Eduardo Santos',
    watchtowerReader: 'Rafael Souza',
    finalSong: 'Cântico 138',
    finalPrayer: 'Marcos Silva'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Limpeza Geral do Salão do Reino',
    content: 'Neste próximo sábado, às 08:30, teremos a limpeza geral do Salão do Reino. Todos do Grupo 2 estão convidados.',
    date: '2025-07-30',
    category: 'lembrete',
    important: true
  },
  {
    id: 'ann-2',
    title: 'Assembleia de Circuito - Inscrições',
    content: 'A assembleia do circuito está agendada para o próximo mês. Verifique com o secretário o transporte e arranjos de hospedagem.',
    date: '2025-08-01',
    category: 'evento',
    important: true
  },
  {
    id: 'ann-3',
    title: 'Escola do Serviço de Pioneiro',
    content: 'Desejamos excelentes bênçãos aos irmãos que participarão da Escola de Pioneiros na próxima semana.',
    date: '2025-08-05',
    category: 'geral',
    important: false
  }
];

export const INITIAL_CLEANING: CleaningSchedule[] = [
  {
    id: 'clean-1',
    weekLabel: '28 de Julho a 3 de Agosto',
    group: 'Grupo 1 - Bairro Interlagos',
    overseer: 'Lucas Oliveira',
    tasks: ['Higienização dos sanitários', 'Aspirar e varrer o auditório', 'Limpeza do palco e pódio', 'Recolhimento dos lixos']
  },
  {
    id: 'clean-2',
    weekLabel: '4 a 10 de Agosto',
    group: 'Grupo 2 - Bairro Três Barras',
    overseer: 'Carlos Eduardo Santos',
    tasks: ['Limpeza dos vidros e portas', 'Desinfecção das cadeiras', 'Organização do balcão de publicações', 'Limpeza do pátio externo']
  }
];

export const INITIAL_WITNESSING: PublicWitnessingSchedule[] = [
  {
    id: 'wit-1',
    location: 'Praça 22 de Agosto - Centro',
    dayOfWeek: 'Terça-feira',
    timeSlot: '09:00 - 11:00',
    publishers: ['Maria Santos', 'Elena Rodríguez', 'Carmen Silva']
  },
  {
    id: 'wit-2',
    location: 'Terminal Rodoviário de Linhares',
    dayOfWeek: 'Quinta-feira',
    timeSlot: '15:00 - 17:00',
    publishers: ['Roberto Almeida', 'José Martínez']
  },
  {
    id: 'wit-3',
    location: 'Praça do Bairro Novo Horizonte',
    dayOfWeek: 'Sábado',
    timeSlot: '08:30 - 10:30',
    publishers: ['Ana Paula Oliveira', 'Beatriz Gómez']
  }
];

export const INITIAL_GROUPS: CongregationGroup[] = [
  {
    id: 'grp-1',
    number: 1,
    name: 'Grupo Interlagos',
    overseer: 'Lucas Oliveira',
    assistant: 'Rafael Souza',
    location: 'Rua Dom Pedro II, nº 142 - Interlagos',
    schedule: 'Sábados e Domingos às 09:00'
  },
  {
    id: 'grp-2',
    number: 2,
    name: 'Grupo Três Barras',
    overseer: 'Carlos Eduardo Santos',
    assistant: 'Antônio Ferreira',
    location: 'Av. Presidente Vargas, nº 850 - Três Barras',
    schedule: 'Sábados e Domingos às 09:00'
  },
  {
    id: 'grp-3',
    number: 3,
    name: 'Grupo Novo Horizonte',
    overseer: 'Roberto Almeida',
    assistant: 'Fernando Costa',
    location: 'Rua São Mateus, nº 310 - Novo Horizonte',
    schedule: 'Sábados e Domingos às 09:00'
  }
];
