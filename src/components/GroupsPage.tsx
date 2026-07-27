import React, { useState } from 'react';
import { CongregationGroup, AppLanguage, PageView } from '../types';
import { ArrowLeft, Menu, Users, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { TextScaleBar } from './TextScaleBar';

interface GroupsPageProps {
  groupsList: CongregationGroup[];
  language: AppLanguage;
  onNavigate: (page: PageView) => void;
  onToggleMenu: () => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({
  groupsList,
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
          {isPt ? 'Grupos de Serviço de Campo' : 'Grupos de Servicio de Campo'}
        </h1>

        <button
          onClick={onToggleMenu}
          className="p-2.5 bg-[#1C4123] text-white rounded-xl shadow-xs hover:bg-[#285A31] transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groupsList.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#1C4123] text-white font-extrabold flex items-center justify-center text-sm">
                  {group.number}
                </span>
                <h3 className="font-extrabold text-stone-900 text-base">
                  {group.name}
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-800">
              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <ShieldCheck className="w-4 h-4 text-[#1C4123] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">
                    {isPt ? 'Superintendente:' : 'Superintendente:'}{' '}
                    <span className="font-normal">{group.overseer}</span>
                  </span>
                  <span className="font-bold text-stone-900 block mt-0.5">
                    {isPt ? 'Ajudante:' : 'Ayudante:'}{' '}
                    <span className="font-normal">{group.assistant}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 pl-1 pt-1">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-stone-900">{isPt ? 'Local:' : 'Lugar:'} </strong>
                  {group.location}
                </span>
              </div>

              <div className="flex items-start gap-2 pl-1">
                <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-stone-900">{isPt ? 'Horários:' : 'Horarios:'} </strong>
                  {group.schedule}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TextScaleBar textScale={textScale} setTextScale={setTextScale} language={language} />
    </div>
  );
};
