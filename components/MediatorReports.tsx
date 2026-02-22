import React, { useState } from 'react';
import { Student, Class } from '../types';

interface MediatorReportsProps {
  students: Student[];
  classes: Class[];
}

const MediatorReports: React.FC<MediatorReportsProps> = ({ students, classes }) => {
  const [selectedId, setSelectedId] = useState('');

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Gerando relatório em ${format.toUpperCase()}... O arquivo será baixado em instantes.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-amber-100">
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gerador de Relatórios</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Consolidação de dados para conselho de classe e PDI</p>
          </div>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-8">
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
             <i className="fa-solid fa-user-graduate text-amber-600"></i>
             <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Relatório Individual por Aluno</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Selecionar Aluno
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione o Aluno...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Período Inicial</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Período Final</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex gap-4">
          <button 
            disabled={!selectedId}
            onClick={() => handleExport('pdf')}
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-pdf"></i> Exportar PDF
          </button>
          <button 
            disabled={!selectedId}
            onClick={() => handleExport('excel')}
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-excel"></i> Exportar Excel
          </button>
        </div>

        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
           <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1"></i>
           <p className="text-[10px] text-amber-800 font-bold leading-relaxed uppercase tracking-tighter">
             Os relatórios gerados contêm dados sensíveis e pessoais (LGPD). Certifique-se de manuseá-los apenas para fins institucionais.
           </p>
        </div>
      </div>
    </div>
  );
};

export default MediatorReports;