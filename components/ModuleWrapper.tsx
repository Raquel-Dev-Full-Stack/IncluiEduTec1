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
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            Adicionar Novo
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ModuleWrapper;
