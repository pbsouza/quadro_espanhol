import React, { useState } from 'react';
import { AppLanguage, PageView, Announcement } from '../types';
import { Megaphone, Calendar, ChevronRight, Settings } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';
import { getTranslation } from '../data/translations';

interface HomePageProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  onNavigate: (page: PageView) => void;
  announcements: Announcement[];
  onOpenAdmin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  language,
  setLanguage,
  onNavigate,
  announcements,
  onOpenAdmin,
}) => {
  const t = getTranslation(language);
  const isPt = language === 'pt';
  const [textScale, setTextScale] = useState<number>(1);

  const upcomingCount = announcements.length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-24 pt-4 px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto" style={{ zoom: textScale }}>
      {/* Admin Toggle Top Right */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 text-xs text-[#2D5A27] bg-[#E8F0E6] hover:bg-[#D9E8D6] px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
          title={t.manage}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{t.manage}</span>
        </button>
      </div>

      {/* Main Header Title */}
      <div className="text-center mt-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C4123] tracking-tight leading-snug">
          {t.boardTitle}
          <br />
          {t.boardSubtitle}
          <br />
          {t.boardCity}
        </h1>

        {/* Language selector buttons */}
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
              isPt
                ? 'bg-[#1C4123] text-white ring-2 ring-[#1C4123]'
                : 'bg-[#98A88A] text-white hover:bg-[#8A9C7B]'
            }`}
          >
            {t.portuguese}
          </button>
          <button
            onClick={() => setLanguage('es')}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
              !isPt
                ? 'bg-[#1C4123] text-white ring-2 ring-[#1C4123]'
                : 'bg-[#98A88A] text-white hover:bg-[#8A9C7B]'
            }`}
          >
            {t.spanish}
          </button>
        </div>
      </div>

      {/* Anúncios e Lembretes Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1C4123] mb-3">
          {t.announcementsAndReminders}
        </h2>

        {/* Próximos Eventos Card */}
        <button
          onClick={() => onNavigate('announcements')}
          className="w-full bg-white rounded-2xl p-4 text-left border border-black/5 shadow-sm hover:shadow-md transition group flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0E6] flex items-center justify-center text-[#1C4123]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-[#1C4123] block group-hover:text-[#285A31] transition">
                {t.upcomingEvents}
              </span>
              <span className="text-xs text-stone-500">
                {upcomingCount}{' '}
                {upcomingCount === 1
                  ? t.announcementsAvailableSingular
                  : t.announcementsAvailablePlural}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#1C4123] group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Atividades Section */}
      <div>
        <h2 className="text-xl font-bold text-[#1C4123] mb-3">
          {t.activities}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Reunião Meio de Semana Card */}
          <div
            onClick={() => onNavigate('midweek')}
            className="relative h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-95 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800"
              alt={t.midweekMeetingCard}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                {t.midweekMeetingCard}
              </span>
            </div>
          </div>

          {/* 2. Reunião Fim de Semana Card */}
          <div
            onClick={() => onNavigate('weekend')}
            className="relative h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-95 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800"
              alt={t.weekendMeetingCard}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                {t.weekendMeetingCard}
              </span>
            </div>
          </div>

          {/* 3. Limpeza do Salão Card */}
          <div
            onClick={() => onNavigate('cleaning')}
            className="relative h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-95 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"
              alt={t.cleaningCard}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                {t.cleaningCard}
              </span>
            </div>
          </div>

          {/* 4. Testemunho Público Card */}
          <div
            onClick={() => onNavigate('witnessing')}
            className="relative h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-95 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"
              alt={t.witnessingCard}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                {t.witnessingCard}
              </span>
            </div>
          </div>

          {/* 5. Grupos Bento/Composite Collage Card */}
          <div
            onClick={() => onNavigate('groups')}
            className="relative h-48 sm:col-span-2 rounded-2xl overflow-hidden shadow-md cursor-pointer group hover:opacity-95 transition bg-stone-900"
          >
            <div className="grid grid-cols-3 h-full gap-0.5">
              <div className="col-span-2 h-full">
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600"
                  alt={t.groupsCard}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="col-span-1 grid grid-rows-2 gap-0.5 h-full">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=400"
                  alt={t.groupsCard}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400"
                  alt={t.groupsCard}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
              <span className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                {t.groupsCard}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};
