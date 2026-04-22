import React from 'react';

interface ModuleWrapperProps {
  title: string;
  description: string;
  onAdd?: () => void;
  children: React.ReactNode;
}

const ModuleWrapper: React.FC<ModuleWrapperProps> = ({ title, description, onAdd, children }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-slate-100 transition-colors">{title}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-bold transition-colors">{description}</p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            Adicionar Novo
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        {children}
      </div>
    </div>
  );
};

export default ModuleWrapper;
