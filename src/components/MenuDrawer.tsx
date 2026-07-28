import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageView, AppLanguage } from '../types';
import { X, Home, BookOpen, Calendar, Sparkles, Users, MapPin, Megaphone, Settings } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

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
  // Handle mobile hardware back button to close drawer
  useModalBackHandler(isOpen, onClose);

  const t = getTranslation(language);

  const navItems = [
    {
      id: 'home' as PageView,
      label: t.backToHome,
      icon: Home,
    },
    {
      id: 'midweek' as PageView,
      label: t.midweekMeeting,
      icon: BookOpen,
    },
    {
      id: 'weekend' as PageView,
      label: t.weekendMeeting,
      icon: Calendar,
    },
    {
      id: 'cleaning' as PageView,
      label: t.cleaning,
      icon: Sparkles,
    },
    {
      id: 'witnessing' as PageView,
      label: t.witnessing,
      icon: MapPin,
    },
    {
      id: 'groups' as PageView,
      label: t.groups,
      icon: Users,
    },
    {
      id: 'announcements' as PageView,
      label: t.announcementsAndReminders,
      icon: Megaphone,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop with smooth opacity fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer content with spring slide animation */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 340,
              mass: 0.8,
            }}
            className="relative w-full max-w-xs bg-[#FDFBF7] h-full shadow-2xl p-5 flex flex-col justify-between z-10 border-l border-stone-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
                <div>
                  <h3 className="font-extrabold text-[#1C4123] text-lg">
                    {t.congregationName}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {t.congregationType}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.04 + index * 0.03,
                        duration: 0.25,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-stone-800 font-bold text-sm hover:bg-[#E8F0E6] hover:text-[#1C4123] transition-colors text-left cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-[#1C4123] shrink-0" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.22,
                  duration: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#1C4123] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#285A31] transition-colors shadow-xs cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>{t.manage}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
