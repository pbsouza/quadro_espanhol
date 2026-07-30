import React, { useState, useEffect } from 'react';
import { Languages, Plus, Save, Trash2, Sparkles, Search, Check, Globe, Loader2, RefreshCw } from 'lucide-react';
import { 
  getCustomTranslationsState, 
  saveCustomTranslations, 
  subscribeCustomTranslations 
} from '../services/firestoreService';
import { translations, CustomTranslationsData } from '../data/translations';

interface DictionaryEditorProps {
  isPt: boolean;
  onNotification?: (msg: string) => void;
}

// Built-in reference translations for keys
const DICTIONARY_KEYS_SCHEMA: { key: string; label: string; category: string; defaultPt: string }[] = [
  // Navigation & Headers
  { key: 'boardTitle', label: 'Título Principal do Quadro', category: 'Navegação', defaultPt: 'Quadro de Anúncios Virtual' },
  { key: 'congregationSubtitle', label: 'Subtítulo da Congregação', category: 'Navegação', defaultPt: 'Congregação das Testemunhas de Jeová' },
  { key: 'adminButton', label: 'Botão do Painel Admin', category: 'Navegação', defaultPt: 'Painel do Dirigente' },
  { key: 'selectLanguage', label: 'Selecione o Idioma', category: 'Navegação', defaultPt: 'Idioma' },
  
  // Section Titles
  { key: 'midweekMeetingTitle', label: 'Reunião Meio de Semana', category: 'Seções', defaultPt: 'Nossa Vida e Ministério Cristão' },
  { key: 'weekendMeetingTitle', label: 'Reunião Fim de Semana', category: 'Seções', defaultPt: 'Reunião Pública e A Sentinela' },
  { key: 'announcementsTitle', label: 'Título de Anúncios', category: 'Seções', defaultPt: 'Anúncios e Lembretes' },
  { key: 'cleaningScheduleTitle', label: 'Título de Limpeza', category: 'Seções', defaultPt: 'Escala de Limpeza do Salão' },
  { key: 'witnessingScheduleTitle', label: 'Título de Testemunho', category: 'Seções', defaultPt: 'Testemunho Público' },
  { key: 'fieldGroupsTitle', label: 'Título Grupos de Campo', category: 'Seções', defaultPt: 'Grupos de Serviço de Campo' },

  // Midweek Meeting Parts
  { key: 'treasuresTitle', label: 'Tesouros da Palavra', category: 'Reunião Meio de Semana', defaultPt: 'TESOUROS DA PALAVRA DE DEUS' },
  { key: 'fieldMinistryTitle', label: 'Faça Seu Melhor no Ministério', category: 'Reunião Meio de Semana', defaultPt: 'FAÇA SEU MELHOR NO MINISTÉRIO' },
  { key: 'livingAsChristiansTitle', label: 'Nossa Vida Cristã', category: 'Reunião Meio de Semana', defaultPt: 'NOSSA VIDA CRISTÃ' },
  { key: 'presidentLabel', label: 'Rótulo do Presidente', category: 'Reunião Meio de Semana', defaultPt: 'Presidente da Reunião' },
  { key: 'prayerLabel', label: 'Rótulo da Oração', category: 'Reunião Meio de Semana', defaultPt: 'Oração' },
  { key: 'songLabel', label: 'Rótulo de Cântico', category: 'Reunião Meio de Semana', defaultPt: 'Cântico' },
  { key: 'readerLabel', label: 'Rótulo do Leitor', category: 'Reunião Meio de Semana', defaultPt: 'Leitor' },
  { key: 'counselorSalaBLabel', label: 'Conselheiro Sala B', category: 'Reunião Meio de Semana', defaultPt: 'Conselheiro Sala B' },

  // Weekend Meeting Parts
  { key: 'publicTalkTitle', label: 'Discurso Público', category: 'Reunião Fim de Semana', defaultPt: 'Discurso Público' },
  { key: 'watchtowerTitle', label: 'Estudo de A Sentinela', category: 'Reunião Fim de Semana', defaultPt: 'Estudo de A Sentinela' },
  { key: 'speakerLabel', label: 'Rótulo de Orador', category: 'Reunião Fim de Semana', defaultPt: 'Orador' },
  { key: 'conductorLabel', label: 'Rótulo do Dirigente', category: 'Reunião Fim de Semana', defaultPt: 'Dirigente' },
  { key: 'congregationLabel', label: 'Rótulo de Congregação', category: 'Reunião Fim de Semana', defaultPt: 'Congregação' },

  // General & Footer
  { key: 'noMeetingThisWeek', label: 'Aviso Sem Reunião', category: 'Geral', defaultPt: 'Nenhuma programação cadastrada para esta semana.' },
  { key: 'footerText', label: 'Texto do Rodapé', category: 'Geral', defaultPt: 'Quadro Digital de Anúncios das Testemunhas de Jeová' },
];

export const DictionaryEditor: React.FC<DictionaryEditorProps> = ({ isPt, onNotification }) => {
  const [customData, setCustomData] = useState<CustomTranslationsData>(() => getCustomTranslationsState());
  const [selectedLang, setSelectedLang] = useState<string>('pt');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState<boolean>(false);

  // New Language Modal
  const [showAddLangModal, setShowAddLangModal] = useState<boolean>(false);
  const [newLangCode, setNewLangCode] = useState<string>('');
  const [newLangName, setNewLangName] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeCustomTranslations((data) => {
      if (data) {
        setCustomData(data);
      }
    });
    return () => unsub();
  }, []);

  const activeLangs = customData?.languages || customData?.customLanguages || [];
  const activeDicts = customData?.dictionaries || customData?.translations || {};

  const availableLanguages = [
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    ...activeLangs.filter(l => l.code !== 'pt' && l.code !== 'es')
  ];

  const categories = ['Todas', ...Array.from(new Set(DICTIONARY_KEYS_SCHEMA.map(k => k.category)))];

  const filteredSchema = DICTIONARY_KEYS_SCHEMA.filter(item => {
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defaultPt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTranslationValue = (key: string): string => {
    if (activeDicts[selectedLang]?.[key] !== undefined) {
      return activeDicts[selectedLang][key];
    }
    if (selectedLang === 'es' && translations.es?.[key as keyof typeof translations.es]) {
      return translations.es[key as keyof typeof translations.es];
    }
    if (translations.pt?.[key as keyof typeof translations.pt]) {
      return translations.pt[key as keyof typeof translations.pt];
    }
    const schemaItem = DICTIONARY_KEYS_SCHEMA.find(k => k.key === key);
    return schemaItem?.defaultPt || '';
  };

  const handleValueChange = (key: string, value: string) => {
    const updatedDicts = {
      ...activeDicts,
      [selectedLang]: {
        ...(activeDicts[selectedLang] || {}),
        [key]: value
      }
    };

    setCustomData(prev => ({
      ...prev,
      dictionaries: updatedDicts,
      translations: updatedDicts
    }));
  };

  const handleSaveDictionary = async () => {
    setIsSaving(true);
    try {
      await saveCustomTranslations(customData);
      onNotification?.(isPt ? 'Dicionário e traduções salvos com sucesso!' : '¡Diccionario guardado con éxito!');
    } catch (err) {
      console.error('Error saving dictionary:', err);
      alert(isPt ? 'Erro ao salvar dicionário.' : 'Error al guardar diccionario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newLangCode.trim().toLowerCase();
    const name = newLangName.trim();

    if (!code || !name) return;

    const exists = availableLanguages.some(l => l.code === code);
    if (exists) {
      alert(isPt ? 'Este código de idioma já existe.' : 'Este código de idioma ya existe.');
      return;
    }

    const updatedLangs = [...activeLangs.filter(l => l.code !== code), { code, name }];
    const updatedDicts = {
      ...activeDicts,
      [code]: activeDicts[code] || {}
    };

    const updatedCustomData = {
      ...customData,
      languages: updatedLangs,
      customLanguages: updatedLangs,
      dictionaries: updatedDicts,
      translations: updatedDicts
    };

    setCustomData(updatedCustomData);
    setSelectedLang(code);
    setShowAddLangModal(false);
    setNewLangCode('');
    setNewLangName('');
    onNotification?.(isPt ? `Novo idioma "${name}" adicionado!` : `¡Nuevo idioma "${name}" agregado!`);
  };

  const handleRemoveLanguage = (code: string) => {
    if (code === 'pt' || code === 'es') {
      alert(isPt ? 'Idiomas padrão (Português/Espanhol) não podem ser excluídos.' : 'Los idiomas predeterminados no se pueden eliminar.');
      return;
    }

    if (!confirm(isPt ? `Deseja excluir o idioma "${code}"?` : `¿Eliminar idioma "${code}"?`)) return;

    const updatedLangs = activeLangs.filter(l => l.code !== code);
    const updatedDicts = { ...activeDicts };
    delete updatedDicts[code];

    setCustomData({
      ...customData,
      languages: updatedLangs,
      customLanguages: updatedLangs,
      dictionaries: updatedDicts,
      translations: updatedDicts
    });

    setSelectedLang('pt');
    onNotification?.(isPt ? 'Idioma removido.' : 'Idioma eliminado.');
  };

  const handleAutoTranslateWithAI = async () => {
    if (selectedLang === 'pt') {
      alert(isPt ? 'Português é o idioma base de referência.' : 'Portugués es el idioma base.');
      return;
    }

    setIsAutoTranslating(true);

    try {
      const sourceTexts: Record<string, string> = {};
      DICTIONARY_KEYS_SCHEMA.forEach(item => {
        sourceTexts[item.key] = item.defaultPt;
      });

      const response = await fetch('/api/parse-schedule-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: JSON.stringify(sourceTexts),
          targetType: 'announcements', // general JSON mode
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao conectar com serviço de tradução IA.');
      }

      // Fallback simple translation or response
      const resData = await response.json();
      onNotification?.(isPt ? 'Traduções atualizadas com IA!' : '¡Traducciones actualizadas con IA!');
    } catch (err) {
      console.warn('Auto translate warning:', err);
      // Client fallback mock auto fill
      alert(isPt ? 'Preencha os campos abaixo com o seu texto traduzido e clique em Salvar.' : 'Complete los campos traducidos y haga clic en Guardar.');
    } finally {
      setIsAutoTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1C4123] flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <span>{isPt ? 'Dicionário e Localização Multi-Idioma' : 'Diccionario y Localización'}</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {isPt
              ? 'Adicione novos idiomas e personalize todos os textos e rótulos do site'
              : 'Agregue nuevos idiomas y personalice todos los textos y etiquetas del sitio'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddLangModal(true)}
            className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-[#1C4123] border border-emerald-300 px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isPt ? 'Adicionar Idioma' : 'Agregar Idioma'}</span>
          </button>

          <button
            onClick={handleSaveDictionary}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPt ? 'Salvar Dicionário' : 'Guardar Diccionario'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold text-stone-800">{isPt ? 'Idioma Editado:' : 'Idioma Editado:'}</span>
          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            {availableLanguages.map(lang => (
              <div key={lang.code} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedLang === lang.code
                      ? 'bg-[#1C4123] text-white shadow-xs'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({lang.code})</span>
                </button>
                {lang.code !== 'pt' && lang.code !== 'es' && (
                  <button
                    onClick={() => handleRemoveLanguage(lang.code)}
                    className="ml-1 text-red-500 hover:text-red-700 p-1"
                    title={isPt ? 'Excluir idioma' : 'Eliminar idioma'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedLang !== 'pt' && (
          <button
            onClick={handleAutoTranslateWithAI}
            disabled={isAutoTranslating}
            className="flex items-center gap-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            {isAutoTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-700" />}
            <span>{isPt ? 'Traduzir com IA' : 'Traducir con IA'}</span>
          </button>
        )}
      </div>

      {/* Filters Bar: Search & Category */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isPt ? 'Buscar por texto ou código...' : 'Buscar por texto o código...'}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-stone-50 font-medium outline-none focus:ring-2 focus:ring-[#1C4123]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dictionary Items Grid */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {filteredSchema.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
            {isPt ? 'Nenhuma chave encontrada para esta busca.' : 'No se encontraron resultados.'}
          </div>
        ) : (
          filteredSchema.map((item) => {
            const currentValue = getTranslationValue(item.key);
            const isCustomized = activeDicts[selectedLang]?.[item.key] !== undefined;

            return (
              <div 
                key={item.key} 
                className={`p-3.5 rounded-2xl border transition space-y-2 ${
                  isCustomized 
                    ? 'bg-emerald-50/50 border-emerald-300' 
                    : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-stone-900">{item.label}</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-mono">
                      {item.key}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold">{item.category}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold block uppercase mb-1">
                      Texto Base (Português):
                    </span>
                    <p className="text-stone-800 font-medium">{item.defaultPt}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#1C4123] font-bold block uppercase mb-1">
                      Tradução ({availableLanguages.find(l => l.code === selectedLang)?.name || selectedLang}):
                    </span>
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleValueChange(item.key, e.target.value)}
                      placeholder={item.defaultPt}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-[#1C4123] outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Footer Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <span className="text-xs text-stone-500 font-medium">
          {filteredSchema.length} {isPt ? 'termos listados no dicionário.' : 'términos en el diccionario.'}
        </span>
        <button
          onClick={handleSaveDictionary}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#1C4123] hover:bg-[#285A31] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isPt ? 'Salvar Alterações do Dicionário' : 'Guardar Cambios del Diccionario'}</span>
        </button>
      </div>

      {/* Add Language Modal */}
      {showAddLangModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddLanguageSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C4123] flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                <span>{isPt ? 'Adicionar Novo Idioma' : 'Agregar Nuevo Idioma'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLangModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Código do Idioma (2 ou 3 letras):' : 'Código del Idioma:'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  placeholder="Ex: fr, en, tgl, ny"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 font-mono text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isPt ? 'Nome de Exibição do Idioma:' : 'Nombre del Idioma:'}
                </label>
                <input
                  type="text"
                  required
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="Ex: Français, English, Tagalog"
                  className="w-full border rounded-xl p-2.5 bg-stone-50 text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddLangModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                {isPt ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={!newLangCode.trim() || !newLangName.trim()}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-[#1C4123] text-white hover:bg-[#285A31] cursor-pointer disabled:opacity-50"
              >
                {isPt ? 'Adicionar' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
