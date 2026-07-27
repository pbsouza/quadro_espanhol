import React, { useState } from 'react';
import { WeekendMeeting, AppLanguage, PageView } from '../types';
import { ArrowLeft, Menu, BookOpen, User, Music, Mic } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';
import { getTranslation } from '../data/translations';

interface WeekendMeetingPageProps {
  meeting: WeekendMeeting | undefined;
  allMeetings?: WeekendMeeting[];
  currentWeekIndex?: number;
  setWeekIndex?: (idx: number) => void;
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
}

export const WeekendMeetingPage: React.FC<WeekendMeetingPageProps> = ({
  meeting,
  allMeetings = [],
  currentWeekIndex = 0,
  setWeekIndex,
  language,
  onNavigate,
  onToggleMenu,
}) => {
  const t = getTranslation(language);
  const [textScale, setTextScale] = useState<number>(1);

  const hasMultipleWeeks = allMeetings.length > 1 && setWeekIndex;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-28 pt-4 px-3 sm:px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto" style={{ zoom: textScale }}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 text-[#1C4123] hover:bg-stone-200/60 rounded-xl transition flex items-center gap-1 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t.home}</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4123] tracking-tight text-center flex-1 mx-2">
          {t.weekendTitle}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Date Navigation Bar */}
      {hasMultipleWeeks ? (
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

            <span className="text-xs sm:text-sm font-black text-[#1C4123] text-center bg-[#E8F0E6] px-3 py-2 rounded-xl border border-[#D0E2CC] flex-1">
              📅 {meeting?.weekLabel || '3 de Agosto de 2025'}
            </span>

            <button
              onClick={() => setWeekIndex(Math.min(allMeetings.length - 1, currentWeekIndex + 1))}
              disabled={currentWeekIndex >= allMeetings.length - 1}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition shadow-xs cursor-pointer ${
                currentWeekIndex >= allMeetings.length - 1
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-[#5B3770] border-[#5B3770] hover:bg-purple-50'
              }`}
            >
              {t.nextWeek} &gt;&gt;
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center bg-[#E8F0E6] py-2 px-3 rounded-xl border border-[#D0E2CC] mb-5">
          <span className="text-sm font-bold text-[#1C4123]">
            {meeting?.weekLabel || '3 de Agosto de 2025'}
          </span>
        </div>
      )}

      {/* Header Info Box */}
      <div className="bg-[#EFE6F7] border-t-4 border-[#5B3770] rounded-xl p-4 mb-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#5B3770]">
          <User className="w-4 h-4 shrink-0" />
          <span className="font-bold text-sm">
            {t.chairman}:{' '}
            <span className="font-normal text-stone-900">{meeting?.president || '---'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pl-1 text-sm">
          <Music className="w-4 h-4 text-[#5B3770] shrink-0" />
          <span className="font-bold">
            {t.initialSong}:{' '}
            <span className="font-normal text-stone-900">{meeting?.initialSong || '---'}</span>
          </span>
        </div>
      </div>

      {/* Public Talk Section */}
      <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="bg-[#1C4123] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-sm sm:text-base tracking-wide uppercase">
          <Mic className="w-4 h-4 text-emerald-300" />
          <span>{t.publicTalkTitle}</span>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              {t.talkTheme}:
            </span>
            <p className="text-base font-extrabold text-stone-900 mt-0.5">
              "{meeting?.publicTalkTitle || 'Por Que Amar Verdadeiramente o Próximo?'}"
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              {t.speaker}:
            </span>
            <p className="text-sm font-semibold text-stone-900 mt-0.5">
              {meeting?.speakerName || 'Pr. Marcelo Guimarães'}
            </p>
            <p className="text-xs text-stone-600">
              {meeting?.speakerCongregation || 'Congregação Central'}
            </p>
          </div>
        </div>
      </div>

      {/* Watchtower Study Section */}
      <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="bg-[#5B3770] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-sm sm:text-base tracking-wide uppercase">
          <BookOpen className="w-4 h-4 text-purple-200" />
          <span>{t.watchtowerStudyTitle}</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
            <span className="text-xs font-bold text-purple-900 block">
              {t.watchtowerReader}:
            </span>
            <span className="text-sm text-stone-900 font-medium">
              {meeting?.watchtowerReader || '---'}
            </span>
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Music className="w-4 h-4 text-[#5B3770] shrink-0" />
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

      {/* Floating Text Scale Selector Bar */}
      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};

