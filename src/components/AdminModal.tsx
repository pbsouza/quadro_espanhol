import React, { useState } from 'react';
import { MidweekMeeting, MinisterioPart, VidaCristaPart, Announcement, AppLanguage } from '../types';
import { saveMidweekMeeting, saveAnnouncement, seedAllData } from '../services/firestoreService';
import { X, Plus, Trash2, Save, RefreshCw, CheckCircle } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  midweekMeeting: MidweekMeeting | undefined;
  language: AppLanguage;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  midweekMeeting,
  language,
}) => {
  if (!isOpen) return null;

  const isPt = language === 'pt';

  // Local state initialized with current meeting data or defaults
  const [president, setPresident] = useState(midweekMeeting?.president || '');
  const [initialSong, setInitialSong] = useState(midweekMeeting?.initialSong || '');
  const [initialPrayer, setInitialPrayer] = useState(midweekMeeting?.initialPrayer || '');
  const [counselorSalaB, setCounselorSalaB] = useState(midweekMeeting?.counselorSalaB || '');

  // Tesouros
  const [talkTitle, setTalkTitle] = useState(midweekMeeting?.tesouros[0]?.title || '');
  const [talkSpeaker, setTalkSpeaker] = useState(midweekMeeting?.tesouros[0]?.speaker || '');
  const [gemsSpeaker, setGemsSpeaker] = useState(midweekMeeting?.tesouros[1]?.speaker || '');
  const [readingMain, setReadingMain] = useState(midweekMeeting?.tesouros[2]?.speaker || '');
  const [readingSalaB, setReadingSalaB] = useState(midweekMeeting?.tesouros[2]?.speakerSalaB || '');

  // Dynamic Faça Seu Melhor
  const [facaSeuMelhor, setFacaSeuMelhor] = useState<MinisterioPart[]>(
    midweekMeeting?.facaSeuMelhor || []
  );

  // Dynamic Nossa Vida Cristã
  const [middleSong, setMiddleSong] = useState(midweekMeeting?.middleSong || '');
  const [nossaVidaCrista, setNossaVidaCrista] = useState<VidaCristaPart[]>(
    midweekMeeting?.nossaVidaCrista || []
  );
  const [finalSong, setFinalSong] = useState(midweekMeeting?.finalSong || '');
  const [finalPrayer, setFinalPrayer] = useState(midweekMeeting?.finalPrayer || '');

  // New Announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add new dynamic part to Faça Seu Melhor
  const handleAddMinisterioPart = () => {
    const newPart: MinisterioPart = {
      id: 'm_' + Date.now(),
      title: 'Iniciando Conversas (3 min.)',
      durationMin: 3,
      assignedMain: 'Estudante A',
      assignedAssistant: 'Ajudante B',
    };
    setFacaSeuMelhor([...facaSeuMelhor, newPart]);
  };

  // Remove part from Faça Seu Melhor
  const handleRemoveMinisterioPart = (id: string) => {
    setFacaSeuMelhor(facaSeuMelhor.filter((p) => p.id !== id));
  };

  // Update part in Faça Seu Melhor
  const handleUpdateMinisterioPart = (id: string, field: keyof MinisterioPart, val: string) => {
    setFacaSeuMelhor(
      facaSeuMelhor.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Add new dynamic part to Nossa Vida Cristã
  const handleAddVidaCristaPart = () => {
    const newPart: VidaCristaPart = {
      id: 'v_' + Date.now(),
      title: 'Necessidades Locais (15 min.)',
      durationMin: 15,
      speaker: 'Orador A',
    };
    setNossaVidaCrista([...nossaVidaCrista, newPart]);
  };

  // Remove part from Nossa Vida Cristã
  const handleRemoveVidaCristaPart = (id: string) => {
    setNossaVidaCrista(nossaVidaCrista.filter((p) => p.id !== id));
  };

  // Update part in Nossa Vida Cristã
  const handleUpdateVidaCristaPart = (id: string, field: keyof VidaCristaPart, val: string) => {
    setNossaVidaCrista(
      nossaVidaCrista.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Save changes to Firestore
  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');

    try {
      if (midweekMeeting) {
        const updatedMeeting: MidweekMeeting = {
          ...midweekMeeting,
          president,
          initialSong,
          initialPrayer,
          counselorSalaB,
          tesouros: [
            {
              id: 't1',
              title: talkTitle,
              durationMin: 10,
              speaker: talkSpeaker,
              type: 'talk',
            },
            {
              id: 't2',
              title: 'Joias Espirituais (10 min.)',
              durationMin: 10,
              speaker: gemsSpeaker,
              type: 'gems',
            },
            {
              id: 't3',
              title: 'Leitura da Bíblia (4 min.)',
              durationMin: 4,
              speaker: readingMain,
              speakerSalaB: readingSalaB,
              type: 'reading',
            },
          ],
          facaSeuMelhor,
          middleSong,
          nossaVidaCrista,
          finalSong,
          finalPrayer,
        };

        await saveMidweekMeeting(updatedMeeting);
      }

      // Save announcement if filled
      if (annTitle.trim() && annContent.trim()) {
        const newAnn: Announcement = {
          id: 'ann_' + Date.now(),
          title: annTitle,
          content: annContent,
          date: new Date().toISOString().split('T')[0],
          category: 'geral',
          important: true,
        };
        await saveAnnouncement(newAnn);
        setAnnTitle('');
        setAnnContent('');
      }

      setSuccessMsg(isPt ? 'Salvo no Firestore com sucesso!' : '¡Guardado en Firestore con éxito!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirm(isPt ? 'Deseja restaurar todos os dados iniciais do Firebase?' : '¿Restaurar todos los datos iniciales?')) {
      setSaving(true);
      await seedAllData();
      setSaving(false);
      setSuccessMsg(isPt ? 'Banco de dados restaurado!' : '¡Base de datos restaurada!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col border border-stone-200">
        {/* Modal Header */}
        <div className="bg-[#1C4123] text-white p-4 flex items-center justify-between shrink-0">
          <h2 className="font-extrabold text-base">
            {isPt ? 'Gerenciar Reunião & Firestore' : 'Gestionar Reunión & Firestore'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 overflow-y-auto space-y-6 text-xs text-stone-800">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* President & Initial Info */}
          <div className="space-y-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm border-b pb-1">
              {isPt ? 'Informações Iniciais da Reunião' : 'Información Inicial'}
            </h3>
            <div>
              <label className="font-semibold block mb-1">Presidente:</label>
              <input
                type="text"
                value={president}
                onChange={(e) => setPresident(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Cântico Inicial:</label>
                <input
                  type="text"
                  value={initialSong}
                  onChange={(e) => setInitialSong(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Oração Inicial:</label>
                <input
                  type="text"
                  value={initialPrayer}
                  onChange={(e) => setInitialPrayer(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Conselheiro da Sala B:</label>
              <input
                type="text"
                value={counselorSalaB}
                onChange={(e) => setCounselorSalaB(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          {/* Tesouros da Palavra de Deus */}
          <div className="space-y-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm border-b pb-1">
              1. Tesouros da Palavra de Deus
            </h3>
            <div>
              <label className="font-semibold block mb-1">1. Tema Discurso (10 min):</label>
              <input
                type="text"
                value={talkTitle}
                onChange={(e) => setTalkTitle(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Orador Discurso:</label>
                <input
                  type="text"
                  value={talkSpeaker}
                  onChange={(e) => setTalkSpeaker(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">2. Joias Espirituais Orador:</label>
                <input
                  type="text"
                  value={gemsSpeaker}
                  onChange={(e) => setGemsSpeaker(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">3. Leitura Bíblia (Salão P.):</label>
                <input
                  type="text"
                  value={readingMain}
                  onChange={(e) => setReadingMain(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Leitura Bíblia (Sala B):</label>
                <input
                  type="text"
                  value={readingSalaB}
                  onChange={(e) => setReadingSalaB(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC: Faça Seu Melhor no Ministério */}
          <div className="space-y-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1">
              <div>
                <h3 className="font-bold text-amber-950 text-sm">
                  2. Faça Seu Melhor no Ministério
                </h3>
                <p className="text-[11px] text-amber-800">
                  Partes dinâmicas do banco de dados (numeração automática a partir do nº 4)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMinisterioPart}
                className="flex items-center gap-1 bg-[#A07A00] text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-amber-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {facaSeuMelhor.map((part, idx) => (
              <div
                key={part.id}
                className="bg-white p-3 rounded-lg border border-amber-200 space-y-2 relative"
              >
                <div className="flex justify-between items-center font-bold text-amber-900 text-xs">
                  <span>Parte #{4 + idx}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMinisterioPart(part.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remover parte"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="font-semibold block text-[11px]">Título da Parte:</label>
                  <input
                    type="text"
                    value={part.title}
                    onChange={(e) => handleUpdateMinisterioPart(part.id, 'title', e.target.value)}
                    className="w-full border rounded p-1.5 bg-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block text-[11px]">Estudante (Salão Principal):</label>
                    <input
                      type="text"
                      value={part.assignedMain}
                      onChange={(e) =>
                        handleUpdateMinisterioPart(part.id, 'assignedMain', e.target.value)
                      }
                      className="w-full border rounded p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-[11px]">Ajudante (Salão Principal):</label>
                    <input
                      type="text"
                      value={part.assignedAssistant || ''}
                      onChange={(e) =>
                        handleUpdateMinisterioPart(part.id, 'assignedAssistant', e.target.value)
                      }
                      className="w-full border rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC: Nossa Vida Cristã */}
          <div className="space-y-3 bg-red-50/70 p-3 rounded-xl border border-red-200">
            <div className="flex items-center justify-between border-b border-red-200 pb-1">
              <div>
                <h3 className="font-bold text-red-950 text-sm">
                  3. Nossa Vida Cristã
                </h3>
                <p className="text-[11px] text-red-800">
                  Partes dinâmicas continuam a numeração após o Ministério
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVidaCristaPart}
                className="flex items-center gap-1 bg-[#8B1E26] text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-900 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Cântico do Meio:</label>
              <input
                type="text"
                value={middleSong}
                onChange={(e) => setMiddleSong(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>

            {nossaVidaCrista.map((part, idx) => (
              <div
                key={part.id}
                className="bg-white p-3 rounded-lg border border-red-200 space-y-2"
              >
                <div className="flex justify-between items-center font-bold text-red-900 text-xs">
                  <span>Parte #{4 + facaSeuMelhor.length + idx}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVidaCristaPart(part.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="font-semibold block text-[11px]">Título da Parte:</label>
                  <input
                    type="text"
                    value={part.title}
                    onChange={(e) => handleUpdateVidaCristaPart(part.id, 'title', e.target.value)}
                    className="w-full border rounded p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[11px]">Orador / Dirigente:</label>
                  <input
                    type="text"
                    value={part.speaker}
                    onChange={(e) => handleUpdateVidaCristaPart(part.id, 'speaker', e.target.value)}
                    className="w-full border rounded p-1.5 text-xs"
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-200">
              <div>
                <label className="font-semibold block mb-1">Cântico Final:</label>
                <input
                  type="text"
                  value={finalSong}
                  onChange={(e) => setFinalSong(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Oração Final:</label>
                <input
                  type="text"
                  value={finalPrayer}
                  onChange={(e) => setFinalPrayer(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Add Announcement */}
          <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm border-b pb-1">
              Publicar Novo Anúncio
            </h3>
            <input
              type="text"
              placeholder="Título do anúncio..."
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full border rounded-lg p-2 bg-white"
            />
            <textarea
              placeholder="Conteúdo do anúncio..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              className="w-full border rounded-lg p-2 bg-white h-20"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0 gap-2">
          <button
            type="button"
            onClick={handleResetData}
            disabled={saving}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 bg-stone-200 hover:bg-stone-300 px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Dados</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1C4123] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#285A31] transition shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar no Firebase'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
