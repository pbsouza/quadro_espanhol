export function getPromptForTarget(targetType: string = 'meetings'): string {
  if (targetType === 'cleaning') {
    return `Analise esta foto, imagem ou documento da escala de LIMPEZA DO SALÃO DO REINO.
Extraia as informações em formato JSON estruturado com o array "cleaning".

Estrutura JSON obrigatória:
{
  "targetType": "cleaning",
  "cleaning": [
    {
      "weekLabel": "dd/mm/aaaa - dd/mm/aaaa ou dd/mm/aaaa (período ou semana no formato dd/mm/aaaa)",
      "group": "Nome ou número do grupo responsável (ex: Grupo 1)",
      "overseer": "Superintendente ou encarregado da limpeza",
      "tasks": ["Tarefa 1", "Tarefa 2", "Tarefa 3"]
    }
  ]
}

Regras:
1. Extraia cada semana/escala em um objeto separado no array "cleaning".
2. FORMATO DE DATAS: dd/mm/aaaa. NUNCA utilize aaaa/mm/dd.
3. Se houver tarefas específicas listadas, coloque-as no array "tasks". Se não houver, crie tarefas relevantes de limpeza.
4. Retorne APENAS o JSON puro.`;
  }

  if (targetType === 'witnessing') {
    return `Analise esta foto, imagem ou documento da escala de TESTEMUNHO PÚBLICO / PREDICACIÓN PÚBLICA.
Extraia as informações em formato JSON estruturado com o array "witnessing".

Estrutura JSON obrigatória:
{
  "targetType": "witnessing",
  "witnessing": [
    {
      "location": "Local ou Ponto do Carrinho",
      "dayOfWeek": "Dia da Semana (ex: Segunda-feira, Terça-feira...)",
      "timeSlot": "Horário ou Turno (ex: 08:00 - 10:00)",
      "publishers": ["Nome do Publicador 1", "Nome do Publicador 2"]
    }
  ]
}

Regras:
1. Extraia cada horário/turno de testemunho público em um objeto no array "witnessing".
2. Liste os nomes dos publicadores designados em "publishers".
3. Retorne APENAS o JSON puro.`;
  }

  if (targetType === 'groups') {
    return `Analise esta foto, imagem ou documento dos GRUPOS DE SERVIÇO DE CAMPO / GRUPOS DE PREDICACIÓN.
Extraia as informações em formato JSON estruturado com o array "groups".

Estrutura JSON obrigatória:
{
  "targetType": "groups",
  "groups": [
    {
      "number": 1,
      "name": "Nome do Grupo (ex: Grupo 1 - Centro)",
      "overseer": "Superintendente de Grupo",
      "assistant": "Ajudante de Grupo",
      "location": "Local de Saída / Ponto de Encontro",
      "schedule": "Horários / Dias de Saída (ex: Terça a Sábado às 09:00)",
      "members": ["Membro 1", "Membro 2", "Membro 3"]
    }
  ]
}

Regras:
1. Extraia cada grupo de serviço em um objeto no array "groups".
2. Se houver número do grupo, extraia em "number" (número inteiro).
3. Liste os integrantes do grupo em "members".
4. Retorne APENAS o JSON puro.`;
  }

  if (targetType === 'announcements') {
    return `Analise esta foto, imagem ou documento de ANÚNCIOS E LEMBRETES / ANUNCIOS.
Extraia as informações em formato JSON estruturado com o array "announcements".

Estrutura JSON obrigatória:
{
  "targetType": "announcements",
  "announcements": [
    {
      "title": "Título do Anúncio ou Lembrete",
      "content": "Texto detalhado do anúncio",
      "date": "dd/mm/aaaa (data de publicação)",
      "category": "geral" | "evento" | "lembrete",
      "important": true ou false,
      "expirationDate": "dd/mm/aaaa (se houver data limite/expiração, senão null)"
    }
  ]
}

Regras:
1. Extraia cada anúncio em um objeto no array "announcements".
2. FORMATO DE DATAS: dd/mm/aaaa.
3. Se for um aviso urgente ou especial, defina "important": true.
4. Retorne APENAS o JSON puro.`;
  }

  // Default: meetings (midweek/weekend)
  return `Analise esta foto, imagem ou documento da programação das reuniões das Testemunhas de Jeová.
A foto/imagem/documento pode conter UMA OU MAIS SEMANAS de programação (ex: 2, 3, 4 semanas em sequência).

Identifique cada semana individualmente e extraia em formato JSON estruturado contendo um array "weeks".

Estrutura JSON obrigatória:
{
  "targetType": "meetings",
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
1. Se houver MAIS DE UMA SEMANA na imagem/documento, SEPARE CADA SEMANA EM UM OBJETO NO ARRAY "weeks".
2. Identifique nomes de irmãos, títulos e minutos com clareza.
3. REMOVA QUALQUER NUMERAÇÃO DO INÍCIO DOS TÍTULOS DAS PARTES.
4. FORMATO DE DATAS: Todas as datas e rótulos de semana (weekLabel) DEVEM estar estritamente no formato dd/mm/aaaa (ex: '29/07/2026' ou '03/03/2026 - 09/03/2026'). NUNCA utilize o formato aaaa/mm/dd ou aaaa-mm-dd.
5. Não invente nomes se não puder ler. Deixe em branco ou null.
6. Se houver Cânticos, extraia o número ou título (ex: "Cântico 45").
7. Retorne APENAS o JSON puro.`;
}
