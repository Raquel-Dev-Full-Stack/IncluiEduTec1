
import React, { useState } from 'react';
import { MediationRecord, Student, Class } from '../types';

interface MediatorRecordsProps {
  records: MediationRecord[];
  students: Student[];
  classes: Class[];
}

const MediatorRecords: React.FC<MediatorRecordsProps> = ({ records, students, classes }) => {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year'>('week');

  const getBehaviorColor = (status: string) => {
    switch(status) {
      case 'CALMO': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'AGITADO': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'EM CRISE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'ENGAJADO': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-book-medical"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Histórico de Mediações</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Registros consolidados de acompanhamento inclusivo</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filterPeriod === period 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="bg-white p-24 rounded-[3rem] text-center border border-gray-100">
             <i className="fa-solid fa-calendar-xmark text-gray-100 text-7xl mb-6"></i>
             <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">Nenhum registro encontrado no período.</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8">
              <div className="md:w-64 flex-shrink-0 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                  <h4 className="text-base font-black text-gray-800 leading-tight">{students.find(s => s.id === record.studentId)?.name || 'N/A'}</h4>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border text-center ${getBehaviorColor(record.behaviorStatus)}`}>
                    Status: {record.behaviorStatus}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-person-walking text-blue-400 text-[10px]"></i>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Mobilidade: {record.mobility === 'FEZ SOZINHO' ? 'OK' : 'Auxílio'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-between">
                <p className="text-xs text-gray-600 leading-relaxed font-medium italic mb-4">"{record.description}"</p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                   <div className="flex items-center gap-2">
                      <i className={`fa-solid fa-users ${record.interactedStudents === 'SIM' ? 'text-emerald-500' : 'text-gray-300'} text-xs`}></i>
                      <span className="text-[8px] font-black text-gray-400 uppercase">Interação</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <i className={`fa-solid fa-eye ${record.eyeContact === 'SIM' ? 'text-emerald-500' : 'text-gray-300'} text-xs`}></i>
                      <span className="text-[8px] font-black text-gray-400 uppercase">Contato Visual</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <button className="w-11 h-11 rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md flex items-center justify-center">
                  <i className="fa-solid fa-file-pdf text-lg"></i>
                </button>
                <button className="w-11 h-11 rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm hover:shadow-md flex items-center justify-center">
                  <i className="fa-solid fa-share-nodes text-lg"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediatorRecords;
