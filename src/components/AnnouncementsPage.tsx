import React, { useState } from 'react';
import { Announcement, AppLanguage, PageView } from '../types';
import { ArrowLeft, Menu, Megaphone, Calendar, AlertCircle, Clock } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';
import { getTranslation } from '../data/translations';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface AnnouncementsPageProps {
  announcements: Announcement[];
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  announcements,
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
          {t.announcementsTitle}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {announcements.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-stone-200 text-stone-500 sm:col-span-2">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p>{t.noAnnouncements}</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs ${
                item.important ? 'border-amber-300 ring-1 ring-amber-200' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#1C4123] shrink-0" />
                  <h3 className="font-extrabold text-stone-900 text-base">
                    {item.title}
                  </h3>
                </div>
                {item.important && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3 text-amber-700" />
                    {t.pinned}
                  </span>
                )}
              </div>

              <p className="text-sm text-stone-700 leading-relaxed my-2 whitespace-pre-line">
                {item.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.publishedOn} {formatToDDMMYYYY(item.date)}</span>
                </div>
                {item.expirationDate && (
                  <div className="flex items-center gap-1 text-amber-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{language === 'pt' ? 'Vence em:' : 'Vence el:'} {formatToDDMMYYYY(item.expirationDate)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};

