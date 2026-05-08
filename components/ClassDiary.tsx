
import React from 'react';
import ModuleWrapper from './ModuleWrapper';

export type ClassDiaryTab = 'turmas' | 'alunos' | 'planos' | 'planejamento';

interface ClassDiaryProps {
  activeSubTab: ClassDiaryTab;
  onSubTabChange: (tab: ClassDiaryTab) => void;
  studentsComponent: React.ReactNode;
  inclusivePlansComponent: React.ReactNode;
  pedagogicalPlanningComponent: React.ReactNode;
  classesComponent: React.ReactNode;
}

const ClassDiary: React.FC<ClassDiaryProps> = ({ 
  activeSubTab,
  onSubTabChange,
  studentsComponent, 
  inclusivePlansComponent, 
  pedagogicalPlanningComponent,
  classesComponent
}) => {
  const tabs = [
    { id: 'turmas', label: 'Minhas Turmas', icon: 'fa-users-rectangle' },
    { id: 'alunos', label: 'Chamada e Frequência', icon: 'fa-users' },
    { id: 'planos', label: 'Planos Inclusivos (PEI/PDI)', icon: 'fa-file-medical' },
    { id: 'planejamento', label: 'Planejamento Pedagógico', icon: 'fa-book' },
  ];

  return (
    <div className="space-y-6">
      <header className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Diário de Classe</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Gestão unificada de suas turmas, frequência, inclusão e planejamento.</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSubTabChange(tab.id as ClassDiaryTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeSubTab === 'turmas' && classesComponent}
        {activeSubTab === 'alunos' && studentsComponent}
        {activeSubTab === 'planos' && inclusivePlansComponent}
        {activeSubTab === 'planejamento' && pedagogicalPlanningComponent}
      </div>
    </div>
  );
};

export default ClassDiary;
