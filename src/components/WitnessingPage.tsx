import React, { useState } from 'react';
import { PublicWitnessingSchedule, AppLanguage, PageView } from '../types';
import { ArrowLeft, Menu, MapPin, Clock, Users } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';

interface WitnessingPageProps {
  witnessingList: PublicWitnessingSchedule[];
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
}

export const WitnessingPage: React.FC<WitnessingPageProps> = ({
  witnessingList,
  language,
  onNavigate,
  onToggleMenu,
}) => {
  const isPt = language === 'pt';
  const [textScale, setTextScale] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2E1A] font-sans pb-28 pt-4 px-3 sm:px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto" style={{ zoom: textScale }}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 text-[#1C4123] hover:bg-stone-200/60 rounded-xl transition flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{isPt ? 'Início' : 'Inicio'}</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C4123] tracking-tight text-center flex-1 mx-2">
          {isPt ? 'Testemunho Público' : 'Predicación Pública'}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {witnessingList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs"
          >
            <div className="flex items-center gap-2 text-[#1C4123] font-bold text-base mb-2">
              <MapPin className="w-5 h-5 shrink-0" />
              <h3>{item.location}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100 mb-3">
              <div>
                <span className="text-stone-500 font-semibold block">{isPt ? 'Dia:' : 'Día:'}</span>
                <span className="font-bold text-stone-900">{item.dayOfWeek}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <div>
                  <span className="text-stone-500 font-semibold block">{isPt ? 'Horário:' : 'Horario:'}</span>
                  <span className="font-bold text-stone-900">{item.timeSlot}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs text-stone-500 font-semibold uppercase mb-1">
                <Users className="w-3.5 h-3.5 text-[#1C4123]" />
                <span>{isPt ? 'Publicadores Designados:' : 'Publicadores Asignados:'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.publishers.map((pub, idx) => (
                  <span
                    key={idx}
                    className="bg-[#E8F0E6] text-[#1C4123] text-xs font-medium px-2.5 py-1 rounded-lg border border-[#D0E2CC]"
                  >
                    {pub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};
