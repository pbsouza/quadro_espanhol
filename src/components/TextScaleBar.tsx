import React from 'react';
import { AppLanguage } from '../types';

interface TextScaleBarProps {
  textScale: number;
  setTextScale: (scale: number) => void;
  language: AppLanguage;
}

export const TextScaleBar: React.FC<TextScaleBarProps> = ({
  textScale,
  setTextScale,
  language,
}) => {
  const isPt = language === 'pt';

  const handleDecrease = () => {
    if (textScale >= 1.0) {
      setTextScale(0.88);
    } else if (Math.abs(textScale - 0.88) < 0.02) {
      setTextScale(0.75);
    }
  };

  const handleNormal = () => {
    setTextScale(1.0);
  };

  const handleIncrease = () => {
    if (textScale <= 1.0) {
      setTextScale(1.18);
    } else if (Math.abs(textScale - 1.18) < 0.02) {
      setTextScale(1.35);
    }
  };

  const isDecreased = textScale < 0.99;
  const isIncreased = textScale > 1.01;
  const isNormal = !isDecreased && !isIncreased;

  const decreaseLabel = textScale <= 0.76 ? 'A--' : 'A-';
  const increaseLabel = textScale >= 1.30 ? 'A++' : 'A+';

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-stone-200/80 flex items-center gap-1.5 text-xs font-bold text-stone-700">
      <span className="text-[11px] text-stone-500 tracking-wider mr-1 hidden sm:inline">
        {isPt ? 'TEXTO:' : 'TEXTO:'}
      </span>

      {/* Decrease Button (A- / A--) */}
      <button
        onClick={handleDecrease}
        className={`px-3 py-1 rounded-full transition cursor-pointer font-bold ${
          isDecreased
            ? 'bg-[#1C4123] text-white shadow-xs'
            : 'text-stone-700 hover:bg-stone-100'
        }`}
        title={
          textScale <= 0.76
            ? (isPt ? 'Tamanho mínimo' : 'Tamaño mínimo')
            : (isPt ? 'Diminuir texto' : 'Disminuir texto')
        }
      >
        {decreaseLabel}
      </button>

      {/* Normal Button (A) */}
      <button
        onClick={handleNormal}
        className={`px-3 py-1 rounded-full transition cursor-pointer font-bold ${
          isNormal
            ? 'bg-[#1C4123] text-white shadow-xs'
            : 'text-stone-700 hover:bg-stone-100'
        }`}
        title={isPt ? 'Tamanho normal' : 'Tamaño normal'}
      >
        A
      </button>

      {/* Increase Button (A+ / A++) */}
      <button
        onClick={handleIncrease}
        className={`px-3 py-1 rounded-full transition cursor-pointer font-bold ${
          isIncreased
            ? 'bg-[#1C4123] text-white shadow-xs'
            : 'text-stone-700 hover:bg-stone-100'
        }`}
        title={
          textScale >= 1.30
            ? (isPt ? 'Tamanho máximo' : 'Tamaño máximo')
            : (isPt ? 'Aumentar texto' : 'Aumentar texto')
        }
      >
        {increaseLabel}
      </button>
    </div>
  );
};

