
import React, { useState, useCallback, useMemo } from 'react';
import { LearningType, Activity, Course, ModalityType, ABCDefinition, BloomLevel, ICAPLevel } from './types';
import { ABC_TYPES, ICAP_DEFINITIONS } from './constants';
import ActivityCard from './components/ActivityCard';
import LearningProfileChart from './components/LearningProfileChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LabelList } from 'recharts';

const MODALITY_LABELS: Record<ModalityType, string> = {
  'F2F': 'Présentiel',
  'Sync': 'Distanciel synchrone',
  'Async': 'Distanciel asynchrone'
};

const MODALITY_COLORS: Record<ModalityType, string> = {
  'F2F': '#0f172a', // Slate 900
  'Sync': '#6366f1', // Indigo 500
  'Async': '#10b981' // Emerald 500
};

const BLOOM_LEVELS: BloomLevel[] = [
  'Mémorisation',
  'Compréhension',
  'Application',
  'Analyse',
  'Évaluation',
  'Création'
];

const ICAP_LEVELS: ICAPLevel[] = ['Passif', 'Actif', 'Constructif', 'Interactif'];

const getFreshInitialState = (): Course => ({
  title: "Nouveau Projet de Formation",
  description: "",
  targetAudience: "",
  activities: [],
  numWeeks: 4
});

const App: React.FC = () => {
  const [course, setCourse] = useState<Course>(getFreshInitialState());
  const [activeTab, setActiveTab] = useState<'design' | 'analytics' | 'summary'>('design');
  const [dragOverCell, setDragOverCell] = useState<{ week: number; mode: ModalityType } | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditModalFlipped, setIsEditModalFlipped] = useState(false);
  const [selectedTypeInfo, setSelectedTypeInfo] = useState<ABCDefinition | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const addActivity = useCallback((type: LearningType, week: number, mode: ModalityType) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `Nouveau ${type}`,
      description: "",
      duration: 30,
      mode,
      week,
      objectives: "",
      taskType: "Individuel",
      cardNumber: "",
      bloomLevels: [],
      material: "",
      demarche: 'Individuelle',
      icapLevel: 'Actif'
    };
    setCourse(prev => ({ ...prev, activities: [...prev.activities, newActivity] }));
  }, []);

  const moveActivity = useCallback((draggedId: string, targetId: string | null, week: number, mode: ModalityType) => {
    setCourse(prev => {
      const activities = [...prev.activities];
      const draggedIdx = activities.findIndex(a => a.id === draggedId);
      if (draggedIdx === -1) return prev;
      const [draggedItem] = activities.splice(draggedIdx, 1);
      const updatedItem = { ...draggedItem, week, mode };
      if (targetId) {
        const targetIdx = activities.findIndex(a => a.id === targetId);
        if (targetIdx !== -1) activities.splice(targetIdx, 0, updatedItem);
        else activities.push(updatedItem);
      } else activities.push(updatedItem);
      return { ...prev, activities };
    });
  }, []);

  const reorderActivity = useCallback((id: string, direction: 'up' | 'down') => {
    setCourse(prev => {
      const activities = [...prev.activities];
      const currentIdx = activities.findIndex(a => a.id === id);
      if (currentIdx === -1) return prev;
      const act = activities[currentIdx];
      const cellActs = activities.filter(a => a.week === act.week && a.mode === act.mode);
      const idxInCell = cellActs.findIndex(a => a.id === id);
      if (direction === 'up' && idxInCell > 0) {
        const otherAct = cellActs[idxInCell - 1];
        const otherIdx = activities.findIndex(a => a.id === otherAct.id);
        [activities[currentIdx], activities[otherIdx]] = [activities[otherIdx], activities[currentIdx]];
      } else if (direction === 'down' && idxInCell < cellActs.length - 1) {
        const otherAct = cellActs[idxInCell + 1];
        const otherIdx = activities.findIndex(a => a.id === otherAct.id);
        [activities[currentIdx], activities[otherIdx]] = [activities[otherIdx], activities[currentIdx]];
      }
      return { ...prev, activities };
    });
  }, []);

  const updateActivity = (updated: Activity) => {
    setCourse(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === updated.id ? updated : a)
    }));
    setEditingActivity(null);
    setIsEditModalFlipped(false);
  };

  const deleteActivity = (id: string) => {
    setCourse(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  };

  const handleResetMatrix = () => {
    if (window.confirm("Voulez-vous vider toutes les cartes de la matrice ? Cette action est irréversible.")) {
      setCourse(prev => ({ 
        ...prev, 
        activities: [] 
      }));
      setEditingActivity(null);
    }
  };

  const selectBloomLevel = (level: BloomLevel) => {
    if (!editingActivity) return;
    const isAlreadySelected = editingActivity.bloomLevels?.includes(level);
    setEditingActivity({ ...editingActivity, bloomLevels: isAlreadySelected ? [] : [level] });
  };

  const onDrop = (e: React.DragEvent, week: number, mode: ModalityType) => {
    e.preventDefault();
    setDragOverCell(null);
    const learningType = e.dataTransfer.getData('learningType') as LearningType;
    const activityId = e.dataTransfer.getData('activityId');
    if (learningType) addActivity(learningType, week, mode);
    else if (activityId) moveActivity(activityId, null, week, mode);
  };

  const totalDuration = useMemo(() => course.activities.reduce((sum, a) => sum + a.duration, 0), [course.activities]);

  const icapData = useMemo(() => {
    return ICAP_LEVELS.map(level => ({
      name: level,
      value: course.activities.filter(a => a.icapLevel === level).length,
      duration: course.activities.filter(a => a.icapLevel === level).reduce((s, a) => s + a.duration, 0),
      color: ICAP_DEFINITIONS[level].color
    }));
  }, [course.activities]);

  const modalityData = useMemo(() => {
    return (['F2F', 'Sync', 'Async'] as ModalityType[]).map(mode => ({
      name: MODALITY_LABELS[mode],
      value: course.activities.filter(a => a.mode === mode).length,
      duration: course.activities.filter(a => a.mode === mode).reduce((s, a) => s + a.duration, 0),
      color: MODALITY_COLORS[mode]
    }));
  }, [course.activities]);

  const abcBarData = useMemo(() => {
    return Object.values(LearningType).map(type => ({
      name: type,
      duration: course.activities.filter(a => a.type === type).reduce((s, a) => s + a.duration, 0),
      color: ABC_TYPES[type].color
    }));
  }, [course.activities]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 overflow-x-hidden">
      {/* MODAL MODE D'EMPLOI */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 shrink-0">
               <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mode d'emploi : Scénarisation ABC</h2>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1">Concevoir une expérience d'apprentissage efficace</p>
               </div>
               <button onClick={() => setIsGuideOpen(false)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-thin">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Le principe ABC Learning Design</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    La méthode ABC repose sur <strong>6 types d'activités d'apprentissage</strong>. L'objectif est de créer un équilibre entre ces types pour maximiser l'engagement et l'efficacité pédagogique.
                  </p>
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[11px] text-indigo-800 font-bold italic">
                      "Glissez-déposez les cartes depuis la gauche vers la matrice pour planifier votre formation. <br />
                      Cliquez sur un des modes d'apprentissage de la rubrique cartes ABC pour obtenir sa description détaillée"
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(LearningType).map(type => (
                    <div key={type} className="flex items-center p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] mr-2 shadow-sm shrink-0" style={{ backgroundColor: ABC_TYPES[type].color }}>{type[0]}</div>
                      <span className="text-[9px] font-black uppercase text-slate-700 truncate">{type}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Comment utiliser l'outil ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">1</div>
                    <h4 className="text-xs font-black uppercase text-slate-800">Planifier</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Glissez les cartes types (Acquisition, Discussion...) dans les cellules Semaine / Modalité de la matrice.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">2</div>
                    <h4 className="text-xs font-black uppercase text-slate-800">Éditer</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Cliquez sur une carte pour remplir les détails : objectifs (Recto), description (Verso) et niveau ICAP (engagement).</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">3</div>
                    <h4 className="text-xs font-black uppercase text-slate-800">Analyser</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Consultez l'onglet "Analyses" pour vérifier l'équilibre de votre parcours et le profil d'engagement ICAP.</p>
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 p-5 rounded-[32px] space-y-3">
                <div className="flex items-center space-x-3 mb-1">
                   <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                   <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Le Modèle d'Engagement ICAP</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(ICAP_DEFINITIONS).map(([key, def]) => (
                    <div key={key} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: def.color }}></div>
                        <span className="text-[9px] font-black uppercase text-slate-900">{key}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight font-medium line-clamp-3">{def.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-3">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Licences & Crédits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">ABC Learning Design</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      Développé par l'<strong>UCL (University College London)</strong> par Clive Young et Nataša Perović. 
                      Sous licence <strong>CC BY-NC-SA 4.0</strong>.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Modèle ICAP</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      Développé par <strong>Michelene T.H. Chi et Ruth Wylie</strong>. 
                      Taxonomie de l'engagement cognitif via les comportements manifestes.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 md:col-span-2">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Créateur</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      <strong>Pascal PAGNY</strong> : <a href="mailto:pascal.pagny@ac-paris.fr" className="hover:text-indigo-600 transition-colors">pascal.pagny@ac-paris.fr</a>
                    </p>
                  </div>
                </div>
              </section>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end shrink-0">
              <button onClick={() => setIsGuideOpen(false)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl transition-all hover:scale-105 active:scale-95">J'ai compris</button>
            </div>
          </div>
        </div>
      )}

      {selectedTypeInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
             <div className="h-32 flex items-center px-8 relative overflow-hidden" style={{ backgroundColor: selectedTypeInfo.color }}>
               <div className="relative flex items-center justify-between w-full">
                 <div className="flex items-center space-x-5 text-white">
                   <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-3xl">{selectedTypeInfo.type[0]}</div>
                   <div><h3 className="text-3xl font-black uppercase tracking-tighter">{selectedTypeInfo.type}</h3></div>
                 </div>
                 <button onClick={() => setSelectedTypeInfo(null)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
             </div>
             <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Rôle de l'apprenant</h4>
                    <p className="text-slate-800 font-bold">{selectedTypeInfo.learnerRole}</p>
                </div>

                <p className="text-sm text-slate-500 italic border-l-2 pl-4" style={{ borderColor: selectedTypeInfo.color }}>{selectedTypeInfo.description}</p>
                
                {selectedTypeInfo.structuredTasks && selectedTypeInfo.structuredTasks.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Exemples de tâches</h4>
                        <div className="space-y-6">
                          {selectedTypeInfo.structuredTasks.map((t, i) => (
                            <div key={i}>
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">{t.title}</h5>
                              <ul className="grid grid-cols-2 gap-2">
                                {t.items.map((item, j) => (
                                  <li key={j} className="text-xs flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: selectedTypeInfo.color }}></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                    </div>
                )}

                {selectedTypeInfo.trainerRole && (
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Rôle du formateur</h4>
                        <p className="text-slate-800 font-bold">{selectedTypeInfo.trainerRole}</p>
                    </div>
                )}

                {selectedTypeInfo.digitalTools && selectedTypeInfo.digitalTools.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Outils numériques conseillés</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedTypeInfo.digitalTools.map((tool, i) => (
                                <span key={i} className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[850px] max-h-[95vh] perspective-1000">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex flex-col"><h3 className="font-black uppercase tracking-widest text-slate-800 text-xs">Paramètres de l'activité</h3></div>
               <div className="flex space-x-2">
                 <button 
                  onClick={() => setIsEditModalFlipped(!isEditModalFlipped)} 
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase shadow-md flex items-center"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   {isEditModalFlipped ? 'Voir Recto' : 'Voir Verso'}
                 </button>
                 <button onClick={() => { setEditingActivity(null); setIsEditModalFlipped(false); }} className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
            </div>
            <div className="flex-1 relative">
               <div className={`w-full h-full transition-all duration-500 preserve-3d ${isEditModalFlipped ? 'rotate-y-180' : ''}`}>
                 
                 {/* RECTO */}
                 <div className="backface-hidden absolute inset-0 bg-white p-6 space-y-4 overflow-y-auto">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Titre de l'activité</label><input className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} /></div>
                    
                    {/* Mode d'apprentissage modifiable sous le titre */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Type d'apprentissage ABC</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {Object.values(LearningType).map(type => (
                          <button key={type} onClick={() => setEditingActivity({...editingActivity, type})} className={`px-2 py-2 rounded-xl text-[8.5px] font-black uppercase border transition-all ${editingActivity.type === type ? 'text-white border-transparent shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`} style={{ backgroundColor: editingActivity.type === type ? ABC_TYPES[type].color : '' }}>{type}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Engagement ICAP</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ICAP_LEVELS.map(level => (
                          <button key={level} onClick={() => setEditingActivity({...editingActivity, icapLevel: level})} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${editingActivity.icapLevel === level ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-100'}`} style={{ backgroundColor: editingActivity.icapLevel === level ? ICAP_DEFINITIONS[level].color : '' }}>{level}</button>
                        ))}
                      </div>
                    </div>

                    {/* Objectifs Pédagogiques (Déplacé au-dessus de Bloom) */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Objectifs Pédagogiques</label>
                      <textarea 
                        className="w-full h-32 px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none resize-none" 
                        value={editingActivity.objectives} 
                        onChange={e => setEditingActivity({...editingActivity, objectives: e.target.value})}
                        placeholder="Quels sont les objectifs de cette activité ?"
                      />
                    </div>

                    {/* Niveaux de Bloom (Déplacé sous les objectifs) */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Niveaux de Bloom</label>
                      <div className="grid grid-cols-3 gap-2">{BLOOM_LEVELS.map(l => <button key={l} onClick={() => selectBloomLevel(l)} className={`p-2 rounded-xl text-[9px] font-black uppercase border transition-all ${editingActivity.bloomLevels?.includes(l) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>{l}</button>)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-slate-400 uppercase">Durée (min)</label><input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-2xl font-black" value={editingActivity.duration} onChange={e => setEditingActivity({...editingActivity, duration: parseInt(e.target.value)||0})} /></div>
                      <div><label className="text-[10px] font-black text-slate-400 uppercase">N° carte</label><input className="w-full px-4 py-3 bg-slate-50 rounded-2xl font-black" value={editingActivity.cardNumber||''} onChange={e => setEditingActivity({...editingActivity, cardNumber: e.target.value})} /></div>
                    </div>
                 </div>

                 {/* VERSO */}
                 <div className="backface-hidden absolute inset-0 rotate-y-180 bg-white p-6 space-y-6 overflow-y-auto">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Modalité</label><div className="flex gap-2">{Object.keys(MODALITY_LABELS).map(m => <button key={m} onClick={() => setEditingActivity({...editingActivity, mode: m as any})} className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase transition-all ${editingActivity.mode === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{MODALITY_LABELS[m as ModalityType]}</button>)}</div></div>
                    
                    {/* Rubrique Démarche */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Type de démarche</label>
                      <div className="flex gap-2">
                        {(['Individuelle', 'Collective'] as const).map(d => (
                          <button 
                            key={d} 
                            onClick={() => setEditingActivity({...editingActivity, demarche: d})} 
                            className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase transition-all ${editingActivity.demarche === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rubrique Matériel */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Matériel</label>
                      <input 
                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-sm" 
                        value={editingActivity.material || ''} 
                        onChange={e => setEditingActivity({...editingActivity, material: e.target.value})}
                        placeholder="Équipements, logiciels, supports..."
                      />
                    </div>
                    
                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Description Détaillée</label><textarea className="w-full h-[380px] px-5 py-4 bg-slate-50 border-none rounded-[32px] text-sm font-medium outline-none resize-none" value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} /></div>
                 </div>
               </div>
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button onClick={() => { deleteActivity(editingActivity.id); setEditingActivity(null); }} className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors">Supprimer l'activity</button>
              <button onClick={() => updateActivity(editingActivity)} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl hover:bg-indigo-700 transition-all">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
            <div className="flex flex-col"><h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Scénarisation de la formation hybride</h1><input type="text" value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})} placeholder="Titre de la formation..." className="bg-transparent border-none p-0 text-xl font-black text-slate-900 w-[400px] outline-none" /></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right border-r border-slate-100 pr-6"><div className="text-[10px] text-slate-400 font-bold uppercase">Volume Horaire</div><div className="text-sm font-black text-slate-800">{Math.floor(totalDuration/60)}h {totalDuration % 60}m</div></div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-2 space-y-6 no-print">
            {/* BOUTON MODE D'EMPLOI */}
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-700 hover:bg-indigo-100 transition-all group shadow-sm"
            >
              <div className="p-2 bg-indigo-600 text-white rounded-xl group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Mode d'emploi</span>
            </button>

            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h2 className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-widest">Cartes ABC</h2><div className="grid grid-cols-1 gap-2.5">{Object.values(LearningType).map(type => (<div key={type} draggable onDragStart={(e) => e.dataTransfer.setData('learningType', type)} onClick={() => setSelectedTypeInfo(ABC_TYPES[type])} className="flex items-center p-2.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white cursor-grab shadow-sm transition-all hover:border-indigo-100"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[11px] mr-3 shadow-sm shrink-0" style={{ backgroundColor: ABC_TYPES[type].color }}>{type[0]}</div><span className="text-[10px] font-black text-slate-700 uppercase truncate">{type}</span></div>))}</div></section>
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h2 className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-widest">Profil ABC</h2><LearningProfileChart activities={course.activities} /></section>
          </div>

          <div className="col-span-12 lg:col-span-10 space-y-6">
            <div className="flex justify-between items-center no-print">
               <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                {(['design', 'analytics', 'summary'] as const).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'design' ? 'Matrice' : tab === 'analytics' ? 'Analyses' : 'Synthèse globale'}</button>))}
              </div>
              <div className="flex space-x-3"><button onClick={handleResetMatrix} className="text-[10px] font-black uppercase bg-white border border-red-200 px-5 py-2.5 rounded-2xl text-red-600 shadow-sm hover:bg-red-50 transition-colors">Vider</button><button onClick={() => setCourse(p => ({...p, numWeeks: p.numWeeks + 1}))} className="text-[10px] font-black uppercase bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-indigo-600 shadow-sm hover:bg-slate-50 transition-colors">Semaine +</button></div>
            </div>

            {activeTab === 'design' && (
              <div className="relative overflow-x-auto pb-8 scrollbar-thin">
                <div className="min-w-max">
                  <div className="flex mb-4"><div className="w-[180px] shrink-0 sticky left-0 z-30 bg-slate-50"></div><div className="flex gap-6">{Array.from({ length: course.numWeeks }).map((_, wIdx) => (<div key={wIdx+1} className="w-[300px] text-center bg-slate-900 text-white rounded-2xl py-3 font-black uppercase text-[11px] shadow-sm">Semaine {wIdx+1}</div>))}</div></div>
                  <div className="flex flex-col gap-6">
                    {(['F2F', 'Sync', 'Async'] as ModalityType[]).map(mode => (
                      <div key={mode} className="flex">
                        <div className="w-[180px] shrink-0 sticky left-0 z-20 bg-slate-50 flex items-stretch p-2"><div className="w-full flex items-center justify-center bg-white border border-slate-200 rounded-3xl shadow-sm px-4 py-8"><span className="text-[10px] font-black uppercase text-slate-500 tracking-wider text-center leading-tight">{MODALITY_LABELS[mode]}</span></div></div>
                        <div className="flex gap-6">{Array.from({ length: course.numWeeks }).map((_, wIdx) => { const week = wIdx+1; const cellActs = course.activities.filter(a => a.week === week && a.mode === mode); const isOver = dragOverCell?.week === week && dragOverCell?.mode === mode; return (<div key={`${week}-${mode}`} onDragOver={(e) => { e.preventDefault(); setDragOverCell({ week, mode }); }} onDragLeave={() => setDragOverCell(null)} onDrop={(e) => onDrop(e, week, mode)} className={`w-[300px] p-4 rounded-3xl border-2 transition-all flex flex-col gap-6 relative group/cell min-h-[220px] ${isOver ? 'bg-indigo-50/50 border-indigo-400 scale-[1.01] shadow-xl z-10' : 'bg-white border-slate-200 border-dashed hover:border-slate-300'}`}>{cellActs.map(a => (<ActivityCard key={a.id} activity={a} onDelete={deleteActivity} onEdit={setEditingActivity} onMove={moveActivity} onReorder={reorderActivity} />))}{cellActs.length === 0 && !isOver && (<div className="flex-1 flex items-center justify-center py-12"><span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em] text-center">Zone vide</span></div>)}</div>); })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Engagement (ICAP)</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={icapData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                            {icapData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ICAP_LEVELS.map(level => (
                        <div key={level} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: ICAP_DEFINITIONS[level].color }}></div>
                          <span className="text-[9px] font-black uppercase text-slate-800">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Modalités</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={modalityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="duration"
                          >
                            {modalityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {modalityData.map(m => (
                        <div key={m.name} className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="flex items-center text-slate-600">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: m.color }}></div>
                            {m.name}
                          </span>
                          <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{m.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Profil ABC</h3>
                    <div className="bg-slate-50 rounded-3xl p-4 shadow-inner border border-slate-100">
                      <LearningProfileChart activities={course.activities} />
                    </div>
                    
                    {/* Graphique à barres horizontal pour les modes ABC avec précision du temps */}
                    <div className="h-[240px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={abcBarData} margin={{ left: 10, right: 50 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} 
                            width={80}
                          />
                          <RechartsTooltip 
                            cursor={{ fill: '#f1f5f9' }} 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                            formatter={(value: number) => [`${value} min`, 'Durée']}
                          />
                          <Bar dataKey="duration" radius={[0, 8, 8, 0]} barSize={20}>
                            {abcBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList 
                              dataKey="duration" 
                              position="right" 
                              formatter={(value: number) => `${value} min`} 
                              style={{ fontSize: '9px', fontWeight: '900', fill: '#64748b' }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'summary' && (
              <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto text-left">
                <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-slate-100 pb-8 gap-8">
                  <div className="space-y-4 flex-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{course.title}</h2>
                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Synthèse Globale du Scénario ABC + ICAP</p>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 flex-1 min-w-[200px] shadow-sm">
                        <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">Durée Totale de Formation</span>
                        <div className="text-2xl font-black text-indigo-700">{Math.floor(totalDuration/60)}h {totalDuration % 60}m</div>
                      </div>
                      <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 flex-1 min-w-[140px] shadow-sm">
                        <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Activités Planifiées</span>
                        <div className="text-2xl font-black text-emerald-700">{course.activities.length}</div>
                      </div>
                      <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 flex-1 min-w-[140px] shadow-sm">
                        <span className="text-[10px] font-black text-amber-400 uppercase block mb-1">Période d'Apprentissage</span>
                        <div className="text-2xl font-black text-amber-700">{course.numWeeks} semaines</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 no-print shrink-0">
                    <div className="text-xs font-black text-slate-300 uppercase tracking-widest text-center mb-1">Actions d'export</div>
                    <button 
                      onClick={handleExportPDF}
                      className="flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Télécharger en PDF
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center justify-center px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Imprimer
                    </button>
                  </div>
                </div>

                {Array.from({length: course.numWeeks}).map((_, wIdx) => {
                  const week = wIdx + 1;
                  const weekActs = course.activities.filter(a => a.week === week);
                  if (weekActs.length === 0) return null;
                  return (
                    <div key={week} className="mb-20 last:mb-0">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-indigo-700 uppercase tracking-widest flex items-center">
                          <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm shadow-md">S{week}</span>
                          Séquence Semaine {week}
                        </h3>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          Durée hebdo : {weekActs.reduce((s,a) => s+a.duration, 0)} min
                        </div>
                      </div>
                      <div className="space-y-8 pl-10 border-l-2 border-indigo-100 relative">
                        {weekActs.map(a => (
                          <div key={a.id} className="p-8 bg-slate-50/40 rounded-[32px] border border-slate-100 relative group/sum shadow-sm hover:shadow-md transition-all">
                             <div className="absolute -left-[51px] top-8 w-5 h-5 rounded-full bg-white border-4" style={{ borderColor: ABC_TYPES[a.type].color }}></div>
                             <div className="flex justify-between items-start mb-4">
                               <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-lg text-slate-500 border border-slate-200">{MODALITY_LABELS[a.mode]}</span>
                                    {a.icapLevel && <span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg text-white shadow-xs" style={{ backgroundColor: ICAP_DEFINITIONS[a.icapLevel].color }}>{a.icapLevel}</span>}
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg text-white shadow-xs" style={{ backgroundColor: ABC_TYPES[a.type].color }}>{a.type}</span>
                                  </div>
                                  <h4 className="text-xl font-black text-slate-800 uppercase leading-tight tracking-tight">{a.title}</h4>
                               </div>
                               <span className="text-sm font-black text-indigo-400 bg-white px-3 py-1.5 rounded-xl border border-indigo-50 shadow-sm">{a.duration} min</span>
                             </div>
                             <p className="text-sm text-slate-600 mb-8 italic leading-relaxed">{a.description || "Aucune description saisie."}</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Objectifs de la Carte (Recto)</span>
                                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">{a.objectives || "Non spécifiés."}</p>
                                  {a.bloomLevels && a.bloomLevels.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-slate-50">
                                      {a.bloomLevels.map(b => (
                                        <span key={b} className="text-[8px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">{b}</span>
                                      ))}
                                    </div>
                                  )}
                               </div>
                               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Détails (Verso)</span>
                                  <div className="mb-4">
                                      <span className="text-[8px] font-black uppercase text-slate-300 block mb-1">Démarche :</span>
                                      <p className="text-xs text-slate-700 font-bold">{a.demarche || "Individuelle"}</p>
                                  </div>
                                  {a.material && (
                                    <div className="mb-4">
                                      <span className="text-[8px] font-black uppercase text-slate-300 block mb-1">Matériel :</span>
                                      <p className="text-xs text-slate-700 font-bold">{a.material}</p>
                                    </div>
                                  )}
                                  <span className="text-[8px] font-black uppercase text-slate-300 block mb-1">Type de tâche :</span>
                                  <p className="text-xs text-slate-700 font-semibold">{a.taskType || "Individuel"}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
