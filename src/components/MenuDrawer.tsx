import React from 'react';
import { PageView, AppLanguage } from '../types';
import { X, Home, BookOpen, Calendar, Sparkles, Users, MapPin, Megaphone, Settings } from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageView) => void;
  language: AppLanguage;
  onOpenAdmin: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  language,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  const isPt = language === 'pt';

  const navItems = [
    {
      id: 'home' as PageView,
      label: isPt ? 'Quadro Principal' : 'Cuadro Principal',
      icon: Home,
    },
    {
      id: 'midweek' as PageView,
      label: isPt ? 'Reunião Meio de Semana' : 'Reunión entre Semana',
      icon: BookOpen,
    },
    {
      id: 'weekend' as PageView,
      label: isPt ? 'Reunião Fim de Semana' : 'Reunión Fin de Semana',
      icon: Calendar,
    },
    {
      id: 'cleaning' as PageView,
      label: isPt ? 'Limpeza do Salão' : 'Limpieza del Salón',
      icon: Sparkles,
    },
    {
      id: 'witnessing' as PageView,
      label: isPt ? 'Testemunho Público' : 'Predicación Pública',
      icon: MapPin,
    },
    {
      id: 'groups' as PageView,
      label: isPt ? 'Grupos de Serviço' : 'Grupos de Servicio',
      icon: Users,
    },
    {
      id: 'announcements' as PageView,
      label: isPt ? 'Anúncios e Lembretes' : 'Anuncios y Recordatorios',
      icon: Megaphone,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-xs bg-[#FDFBF7] h-full shadow-2xl p-5 flex flex-col justify-between z-10 border-l border-stone-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
            <div>
              <h3 className="font-extrabold text-[#1C4123] text-lg">
                Congregação Linhares
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {isPt ? 'Espanhola' : 'Española'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-stone-800 font-bold text-sm hover:bg-[#E8F0E6] hover:text-[#1C4123] transition text-left"
                >
                  <Icon className="w-5 h-5 text-[#1C4123] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-stone-200">
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#1C4123] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#285A31] transition shadow-xs"
          >
            <Settings className="w-4 h-4" />
            <span>{isPt ? 'Gerenciar Dados (Firebase)' : 'Gestionar Datos'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
