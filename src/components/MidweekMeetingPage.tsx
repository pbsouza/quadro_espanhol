import React, { useState } from 'react';
import { MidweekMeeting, AppLanguage, PageView } from '../types';
import { Menu, BookOpen, User, Music, Gem, Wheat, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';
import { getTranslation } from '../data/translations';
import { findCurrentWeekIndex } from '../utils/weekUtils';

interface MidweekMeetingPageProps {
  meeting: MidweekMeeting | undefined;
  allMeetings: MidweekMeeting[];
  currentWeekIndex: number;
  setWeekIndex: (idx: number) => void;
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
  connectionError?: boolean;
  onRetryConnection?: () => void;
}

export const MidweekMeetingPage: React.FC<MidweekMeetingPageProps> = ({
  meeting,
  allMeetings,
  currentWeekIndex,
  setWeekIndex,
  language,
  onNavigate,
  onToggleMenu,
  connectionError = false,
  onRetryConnection,
}) => {
  const t = getTranslation(language);
  const [textScale, setTextScale] = useState<number>(1); // 0.88, 1, 1.15, 1.3

  if (!meeting && allMeetings.length > 0) {
    meeting = allMeetings[0];
  }

  // Fallback if no meeting loaded yet
  const weekLabel = language === 'pt'
    ? meeting?.weekLabel || '28 de Julho - 3 de Agosto de 2025'
    : meeting?.weekLabelEs || meeting?.weekLabel || '28 de Julio - 3 de Agosto de 2025';

  const tesourosList = meeting?.tesouros || [];
  const facaSeuMelhorList = meeting?.facaSeuMelhor || [];
  const nossaVidaCristaList = meeting?.nossaVidaCrista || [];

  // Dynamic numbering start logic
  const facaSeuMelhorStartNum = 4;
  const facaSeuMelhorEndNum = 3 + facaSeuMelhorList.length;

  const vidaCristaStartNum = facaSeuMelhorEndNum + 1;

  // Font scale class mapping
  const getScaledTextSize = (baseClass: string) => {
    if (textScale === 0.88) return `${baseClass} text-xs sm:text-sm`;
    if (textScale === 1.15) return `${baseClass} text-lg sm:text-xl`;
    if (textScale === 1.3) return `${baseClass} text-xl sm:text-2xl`;
    return baseClass;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-28 pt-4 px-3 sm:px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto" style={{ zoom: textScale }}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 text-[#1C4123] hover:bg-stone-200/60 rounded-xl transition flex items-center gap-1 text-sm font-semibold cursor-pointer"
          title={t.backToHome}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t.home}</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4123] tracking-tight text-center flex-1 mx-2">
          {t.midweekTitle}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => setWeekIndex(Math.max(0, currentWeekIndex - 1))}
            disabled={currentWeekIndex <= 0}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition shadow-xs cursor-pointer ${
              currentWeekIndex <= 0
                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                : 'bg-white text-[#5B3770] border-[#5B3770] hover:bg-purple-50'
            }`}
          >
            &lt;&lt; {t.previousWeek}
          </button>

          <button
            onClick={() => setWeekIndex(findCurrentWeekIndex(allMeetings))}
            className="px-3 py-2 bg-white text-[#1C4123] border border-[#1C4123] rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-50 transition shadow-xs cursor-pointer"
          >
            {t.currentWeek}
          </button>

          <button
            onClick={() => setWeekIndex(Math.min(allMeetings.length - 1, currentWeekIndex + 1))}
            disabled={currentWeekIndex >= allMeetings.length - 1}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-xs cursor-pointer ${
              currentWeekIndex >= allMeetings.length - 1
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-[#5B3770] hover:bg-[#4A2B5C]'
            }`}
          >
            {t.nextWeek} &gt;&gt;
          </button>
        </div>

        {/* Display Current Week Label */}
        <div className="text-center bg-[#E8F0E6] py-1.5 px-3 rounded-lg border border-[#D0E2CC]">
          <span className="text-xs sm:text-sm font-bold text-[#1C4123]">
            {weekLabel}
          </span>
        </div>
      </div>

      {/* Meeting Header Info Card (Purple Tint) */}
      <div className="bg-[#EFE6F7] border-t-4 border-[#5B3770] rounded-xl p-4 mb-5 shadow-xs text-stone-800 space-y-2">
        <div className="flex items-center gap-2 text-[#5B3770]">
          <BookOpen className="w-5 h-5 shrink-0" />
          <User className="w-4 h-4 shrink-0" />
          <span className="font-bold text-sm">
            {t.chairman}:{' '}
            <span className="font-normal text-stone-900">{meeting?.president || '---'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pl-1">
          <Music className="w-4 h-4 text-[#5B3770] shrink-0" />
          <span className="font-bold text-sm">
            {t.initialSong}:{' '}
            <span className="font-normal text-stone-900">{meeting?.initialSong || '---'}</span>
          </span>
        </div>

        <div className="text-sm pl-7">
          <span className="font-bold">
            {t.initialPrayer}:{' '}
            <span className="font-normal text-stone-900">{meeting?.initialPrayer || '---'}</span>
          </span>
        </div>

        {meeting?.counselorSalaB && meeting.counselorSalaB.trim() !== '' && meeting.counselorSalaB !== '---' && (
          <div className="text-sm pl-7 pt-1 border-t border-purple-200/60 mt-1">
            <span className="font-bold">
              {t.counselorSalaB}:{' '}
              <span className="font-normal text-stone-900">{meeting.counselorSalaB}</span>
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: TESOUROS DA PALAVRA DE DEUS */}
      <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="bg-[#515254] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-sm sm:text-base tracking-wide uppercase">
          <Gem className="w-4 h-4 text-cyan-300" />
          <span>{t.treasuresTitle}</span>
        </div>

        <div className="p-4 space-y-4 divide-y divide-stone-100">
          {/* Part 1: Talk */}
          <div className="pt-1">
            <p className={getScaledTextSize("font-bold text-stone-900 text-sm sm:text-base")}>
              {(() => {
                const title = tesourosList[0]?.title?.trim();
                if (!title || title === 'Discurso (10 min.)' || title === 'Tesouros da Palavra de Deus (10 min)') {
                  return `1. ${t.talkPartTitle}`;
                }
                if (title.startsWith('1.')) {
                  return title;
                }
                if (title.toLowerCase().includes('discurso')) {
                  return `1. ${title}`;
                }
                return `1. Discurso (10 min.): ${title}`;
              })()}
            </p>
            <p className="text-sm text-stone-600 mt-0.5 pl-4">
              <span className="font-medium text-stone-800">{tesourosList[0]?.speaker || '---'}</span>
            </p>
          </div>

          {/* Part 2: Gems */}
          <div className="pt-3">
            <p className={getScaledTextSize("font-bold text-stone-900 text-sm sm:text-base")}>
              2. {t.gemsTitle}
            </p>
            <p className="text-sm text-stone-600 mt-0.5 pl-4">
              <span className="font-medium text-stone-800">{tesourosList[1]?.speaker || '---'}</span>
            </p>
          </div>

          {/* Part 3: Bible Reading */}
          {(() => {
            const hasReadingSalaB = Boolean(tesourosList[2]?.speakerSalaB && tesourosList[2].speakerSalaB.trim().length > 0);
            return (
              <div className="pt-3">
                <p className={getScaledTextSize("font-bold text-stone-900 text-sm sm:text-base")}>
                  3. {t.bibleReadingTitle}
                </p>
                <div className={`grid grid-cols-1 ${hasReadingSalaB ? 'sm:grid-cols-2' : ''} gap-2 mt-2`}>
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <span className="text-xs font-bold text-stone-700 block">
                      {t.mainHall}:
                    </span>
                    <span className="text-sm text-stone-900">{tesourosList[2]?.speaker || '---'}</span>
                  </div>
                  {hasReadingSalaB && (
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      <span className="text-xs font-bold text-stone-700 block">
                        {t.auxiliaryClass}:
                      </span>
                      <span className="text-sm text-stone-900">{tesourosList[2]?.speakerSalaB}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* SECTION 2: FAÇA SEU MELHOR NO MINISTÉRIO */}
      <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="bg-[#A07A00] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-sm sm:text-base tracking-wide uppercase">
          <Wheat className="w-4 h-4 text-amber-200" />
          <span>{t.fieldMinistryTitle}</span>
        </div>

        {/* Dynamic Items from Database */}
        <div className="p-4 space-y-4 divide-y divide-stone-100">
          {facaSeuMelhorList.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-2">
              {language === 'pt' ? 'Nenhuma parte cadastrada para esta seção.' : 'Sin asignaciones enregistradas.'}
            </p>
          ) : (
            facaSeuMelhorList.map((part, idx) => {
              const itemNum = facaSeuMelhorStartNum + idx;
              const hasSalaB = Boolean(
                (part.assignedSalaB && part.assignedSalaB.trim().length > 0) ||
                (part.assignedSalaBAssistant && part.assignedSalaBAssistant.trim().length > 0)
              );

              return (
                <div key={part.id || idx} className={idx > 0 ? 'pt-3' : ''}>
                  <p className={getScaledTextSize("font-bold text-stone-900 text-sm sm:text-base")}>
                    {itemNum}. {part.title}
                  </p>

                  <div className={`grid grid-cols-1 ${hasSalaB ? 'sm:grid-cols-2' : ''} gap-2 mt-2`}>
                    <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60">
                      <span className="text-xs font-bold text-amber-900 block">
                        {t.mainHall}:
                      </span>
                      <p className="text-sm text-stone-900">
                        <span className="font-medium">{part.assignedMain || '---'}</span>
                        {part.assignedAssistant && part.assignedAssistant.trim().length > 0 && (
                          <span className="text-xs text-stone-600 block sm:inline sm:ml-1">
                            ({t.assistant}: {part.assignedAssistant})
                          </span>
                        )}
                      </p>
                    </div>

                    {hasSalaB && (
                      <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60">
                        <span className="text-xs font-bold text-amber-900 block">
                          {t.auxiliaryClass}:
                        </span>
                        <p className="text-sm text-stone-900">
                          <span className="font-medium">{part.assignedSalaB || '---'}</span>
                          {part.assignedSalaBAssistant && part.assignedSalaBAssistant.trim().length > 0 && (
                            <span className="text-xs text-stone-600 block sm:inline sm:ml-1">
                              ({t.assistant}: {part.assignedSalaBAssistant})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Server Connection Error Alert Box */}
      {connectionError && (
        <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C6CB] text-[#721C24] rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-bold text-sm sm:text-base">
              {language === 'pt' ? 'Erro ao conectar com o servidor.' : 'Error de conexión con el servidor.'}
            </span>
          </div>
          {onRetryConnection && (
            <button
              onClick={onRetryConnection}
              className="p-1.5 hover:bg-red-100 rounded-lg text-red-700 transition cursor-pointer"
              title="Tentar novamente"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SECTION 3: NOSSA VIDA CRISTÃ */}
      <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="bg-[#8B1E26] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-sm sm:text-base tracking-wide uppercase">
          <span className="text-lg">🐑</span>
          <span>{t.christianLivingTitle}</span>
        </div>

        <div className="p-4 space-y-4 divide-y divide-stone-100">
          {/* Middle Song */}
          <div className="flex items-center gap-2 py-1 text-sm font-semibold text-[#8B1E26]">
            <Music className="w-4 h-4 shrink-0" />
            <span>
              {t.middleSong}:{' '}
              <span className="text-stone-900 font-medium">{meeting?.middleSong || 'Cântico 88'}</span>
            </span>
          </div>

          {/* Dynamic Items from Database for Nossa Vida Cristã */}
          {nossaVidaCristaList.map((part, idx) => {
            const itemNum = vidaCristaStartNum + idx;
            return (
              <div key={part.id || idx} className="pt-3">
                <p className={getScaledTextSize("font-bold text-stone-900 text-sm sm:text-base")}>
                  {itemNum}. {part.title}
                </p>
                <div className="mt-1 pl-4 space-y-0.5">
                  <p className="text-sm text-stone-800">
                    <span className="font-semibold">{t.speakerOrConductor}: </span>
                    {part.speaker || '---'}
                  </p>
                  {part.reader && (
                    <p className="text-sm text-stone-700">
                      <span className="font-semibold">{t.reader}: </span>
                      {part.reader}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Final Song & Prayer */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Music className="w-4 h-4 text-[#8B1E26] shrink-0" />
              <span className="font-bold text-stone-900">
                {t.finalSong}:{' '}
                <span className="font-normal text-stone-800">{meeting?.finalSong || '---'}</span>
              </span>
            </div>

            <div className="text-sm pl-6">
              <span className="font-bold text-stone-900">
                {t.finalPrayer}:{' '}
                <span className="font-normal text-stone-800">{meeting?.finalPrayer || '---'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Text Scale Selector Bar at Bottom Right */}
      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};

