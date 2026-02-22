
import React, { useState, useMemo } from 'react';
import { User, MediationRecord, Student } from '../types';
import Table from './Table';

interface MediatorDetailsProps {
  mediator: User;
  records: MediationRecord[];
  students: Student[];
  onBack: () => void;
}

const MediatorDetails: React.FC<MediatorDetailsProps> = ({ mediator, records, students, onBack }) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter(r => {
      const recordDate = new Date(r.date);
      if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return recordDate >= weekAgo;
      }
      if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return recordDate >= monthAgo;
      }
      if (filterPeriod === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return recordDate >= yearAgo;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterPeriod]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">{mediator.name}</h2>
               <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full">Mediador(a)</span>
            </div>
            <p className="text-gray-500 text-xs font-medium mt-1">
              <i className="fa-solid fa-envelope mr-1 opacity-50"></i> {mediator.email}
              <span className="mx-2 opacity-20">|</span>
              <i className="fa-solid fa-phone mr-1 opacity-50"></i> {mediator.phone || 'Sem contato'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
           {(['all', 'week', 'month', 'year'] as const).map((period) => (
             <button
               key={period}
               onClick={() => setFilterPeriod(period)}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                 filterPeriod === period 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                  : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               {period === 'all' ? 'Tudo' : period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
             </button>
           ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <i className="fa-solid fa-list-check text-indigo-500"></i>
             Histórico de Registros Realizados ({filteredRecords.length})
           </h3>
        </div>
        
        <Table<MediationRecord> 
          data={filteredRecords} 
          columns={[
            { 
              header: 'Data', 
              accessor: (r) => (
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{new Date(r.date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Vigência 2024</span>
                </div>
              )
            },
            { 
              header: 'Aluno Atendido', 
              accessor: (r) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                     <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <span className="font-black text-gray-700">{students.find(s => s.id === r.studentId)?.name || 'N/A'}</span>
                </div>
              )
            },
            { 
              header: 'Status de Alerta', 
              accessor: (r) => (
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                  r.status === 'Crítico' || r.status === 'Alerta'
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {r.status}
                </span>
              )
            },
            { 
              header: 'Comportamento / Observação', 
              accessor: (r) => (
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs truncate" title={r.description}>
                  <span className="font-bold text-gray-800 block mb-0.5">{r.behaviorStatus}</span>
                  {r.description}
                </p>
              )
            }
          ]} 
        />
      </div>
    </div>
  );
};

export default MediatorDetails;
