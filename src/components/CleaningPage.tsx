import React, { useState } from 'react';
import { CleaningSchedule, AppLanguage, PageView } from '../types';
import { ArrowLeft, Menu, Sparkles, CheckCircle2, User } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';
import { getTranslation } from '../data/translations';

interface CleaningPageProps {
  cleaningList: CleaningSchedule[];
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
}

export const CleaningPage: React.FC<CleaningPageProps> = ({
  cleaningList,
  language,
  onNavigate,
  onToggleMenu,
}) => {
  const t = getTranslation(language);
  const [textScale, setTextScale] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-28 pt-4 px-3 sm:px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto" style={{ zoom: textScale }}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 text-[#1C4123] hover:bg-stone-200/60 rounded-xl transition flex items-center gap-1 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t.home}</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4123] tracking-tight text-center flex-1 mx-2">
          {t.cleaningTitle}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Banner Intro */}
      <div className="bg-[#E8F0E6] p-4 rounded-2xl border border-[#D0E2CC] mb-6 flex items-start gap-3">
        <Sparkles className="w-6 h-6 text-[#1C4123] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-[#1C4123] text-sm">
            {t.cleaningSubtitle}
          </h3>
          <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
            {language === 'pt'
              ? 'A cooperação de todos nos ajuda a manter a casa de Jeová limpa e acolhedora.'
              : 'La cooperación de todos nos ayuda a mantener la casa de Jehová limpia y acogedora.'}
          </p>
        </div>
      </div>

      {cleaningList.length === 0 ? (
        <div className="text-center py-12 text-stone-500 text-sm">
          {t.noCleaningSchedule}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cleaningList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold bg-[#1C4123] text-white px-3 py-1 rounded-full">
                  {item.weekLabel}
                </span>
                <div className="flex items-center gap-1 text-xs text-stone-600 font-medium">
                  <User className="w-3.5 h-3.5 text-[#1C4123]" />
                  <span>{item.overseer}</span>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-extrabold text-stone-900 text-base">
                  {item.group}
                </h4>
                <p className="text-xs text-stone-500 font-semibold mt-1 uppercase tracking-wider">
                  {t.responsibleGroup}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {item.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-stone-800">
                      <CheckCircle2 className="w-4 h-4 text-[#1C4123] shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};

