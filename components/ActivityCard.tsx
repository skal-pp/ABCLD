
import React, { useState } from 'react';
import { Activity, ModalityType } from '../types';
import { ABC_TYPES, ICAP_DEFINITIONS } from '../constants';

interface Props {
  activity: Activity;
  onDelete: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onMove: (draggedId: string, targetId: string | null, week: number, mode: ModalityType) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  compact?: boolean;
}

const ActivityCard: React.FC<Props> = ({ activity, onDelete, onEdit, onMove, onReorder, compact = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const def = ABC_TYPES[activity.type];
  const icap = activity.icapLevel ? ICAP_DEFINITIONS[activity.icapLevel] : null;

  const handleDragStart = (e: React.DragEvent) => {
    if (isFlipped) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('activityId', activity.id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const draggedActivityId = e.dataTransfer.getData('activityId');
    if (draggedActivityId && draggedActivityId !== activity.id) {
      onMove(draggedActivityId, activity.id, activity.week, activity.mode);
    }
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`perspective-1000 relative w-full h-[180px] shrink-0 transition-all duration-300 ${isFlipped ? 'flipped z-20' : 'z-10'} ${isDragOver ? 'translate-y-2' : ''}`}
      draggable={!isFlipped}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Indicateur visuel d'insertion pour le drag & drop */}
      {isDragOver && (
        <div className="absolute -top-2 left-0 w-full h-1.5 bg-indigo-500 rounded-full z-30 shadow-[0_0_12px_rgba(79,70,229,0.5)] animate-pulse" />
      )}

      <div className="card-inner relative w-full h-full preserve-3d shadow-sm hover:shadow-md rounded-xl">
        
        {/* RECTO (FRONT) */}
        <div 
          onClick={() => onEdit(activity)}
          className="backface-hidden absolute inset-0 flex border border-slate-200 rounded-xl overflow-hidden bg-white"
          style={{ backgroundColor: def.bgLight }}
        >
          <div className="w-1.5 shrink-0" style={{ backgroundColor: def.color }} />
          <div className="flex-1 p-3.5 flex flex-col min-w-0 h-full relative">
            <div className="flex justify-between items-start mb-1 shrink-0">
              <div className="flex flex-col min-w-0 flex-1 pr-1">
                {/* Header Row: ABC Type + ICAP Level */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span 
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block w-fit bg-white/90 shadow-xs border border-white/40"
                    style={{ color: def.color }}
                  >
                    {activity.type}
                  </span>
                  {icap && (
                    <span 
                      className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md text-white shadow-xs border border-white/20"
                      style={{ backgroundColor: icap.color }}
                    >
                      {activity.icapLevel}
                    </span>
                  )}
                </div>
                <h4 className="font-black text-[12px] text-slate-900 leading-tight truncate uppercase tracking-tight">{activity.title}</h4>
              </div>
              
              <div className="flex items-center space-x-1.5 shrink-0 no-print">
                <div className="flex flex-col bg-white/80 rounded-lg p-0.5 border border-slate-200 shadow-sm overflow-hidden">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReorder(activity.id, 'up'); }}
                    className="p-1 rounded-t hover:bg-slate-100 hover:text-indigo-600 text-slate-500 transition-all active:scale-90 border-b border-slate-100"
                    title="Monter l'activité"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReorder(activity.id, 'down'); }}
                    className="p-1 rounded-b hover:bg-slate-100 hover:text-indigo-600 text-slate-500 transition-all active:scale-90"
                    title="Descendre l'activité"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <button 
                  onClick={toggleFlip}
                  className="p-2 rounded-lg bg-white/90 text-slate-500 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-slate-200"
                  title="Détails"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bloom Levels */}
            <div className="flex flex-wrap gap-1 mt-1 shrink-0">
              {activity.bloomLevels && activity.bloomLevels.length > 0 ? (
                activity.bloomLevels.map(level => (
                  <span key={level} className="text-[7.5px] px-2 py-0.5 bg-white/80 text-slate-700 rounded-md font-black uppercase tracking-tighter border border-white/60 shadow-xs">
                    {level}
                  </span>
                ))
              ) : (
                <span className="text-[8px] text-slate-300 italic">Bloom ?</span>
              )}
            </div>
            
            <p className="text-[10.5px] text-slate-600 mt-2.5 leading-relaxed flex-1 overflow-hidden font-medium line-clamp-4">
              {activity.objectives || activity.description || "Aucun détail saisi."}
            </p>

            <div className="mt-2.5 flex items-center justify-between shrink-0 pt-2 border-t border-black/5">
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-[9px] text-slate-600 font-black bg-white/80 px-2.5 py-1 rounded-lg border border-white/60 tabular-nums shadow-xs">
                  {activity.duration} min
                </div>
                <div className="flex items-center space-x-2">
                  {activity.cardNumber && (
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                      #{activity.cardNumber}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full shadow-sm border border-white" style={{ backgroundColor: def.color }} />
            </div>
          </div>
        </div>

        {/* VERSO (BACK) */}
        <div 
          className="backface-hidden rotate-y-180 absolute inset-0 flex border border-slate-200 rounded-xl overflow-hidden shadow-sm cursor-default p-4 flex-col h-full bg-white"
          style={{ backgroundColor: def.bgLight }}
        >
          <div className="flex justify-between items-center mb-3 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: def.color }}>Détails de l'activité</span>
            <button 
              onClick={toggleFlip}
              className="p-1.5 rounded-lg bg-white/50 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-slate-200"
              title="Retourner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3">
            {activity.material && (
              <div>
                <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Matériel :</span>
                <p className="text-[11px] text-slate-700 leading-tight font-bold bg-white/50 p-2 rounded-lg border border-white/40">
                  {activity.material}
                </p>
              </div>
            )}
            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Description :</span>
              <p className="text-[11px] text-slate-700 leading-tight font-medium">
                {activity.description || "Aucune description détaillée."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center shrink-0 pt-3 border-t border-black/5 no-print">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
              className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
            >
              Supprimer
            </button>
            <button 
              onClick={() => { onEdit(activity); }}
              className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-200 shadow-sm"
            >
              Éditer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivityCard;
