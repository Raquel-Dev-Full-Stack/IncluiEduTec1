
import React, { useState } from 'react';
import { MediationRecord, Student, Class, StudentRecord } from '../types';

interface MediatorRecordsProps {
  records: MediationRecord[];
  studentRecords: StudentRecord[];
  students: Student[];
  classes: Class[];
}

const MediatorRecords: React.FC<MediatorRecordsProps> = ({ records, studentRecords, students, classes }) => {
  const [activeTab, setActiveTab] = useState<'mediacao' | 'diario'>('mediacao');
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year'>('week');

  const getBehaviorColor = (status: string) => {
    switch (status) {
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

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button
              onClick={() => setActiveTab('mediacao')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'mediacao' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Mediação
            </button>
            <button
              onClick={() => setActiveTab('diario')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'diario' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Registro Diário
            </button>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterPeriod === period
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {activeTab === 'mediacao' ? (
          records.length === 0 ? (
            <div className="bg-white p-24 rounded-[3rem] text-center border border-gray-100">
              <i className="fa-solid fa-calendar-xmark text-gray-100 text-7xl mb-6"></i>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">Nenhum registro de mediação encontrado.</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8">
                {/* ... existing record UI ... */}
                <div className="md:w-64 flex-shrink-0 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                    <h4 className="text-base font-black text-gray-800 leading-tight">{students.find(s => s.id === record.studentId)?.name || 'N/A'}</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border text-center ${getBehaviorColor(record.behaviorStatus)}`}>
                      Status: {record.behaviorStatus}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed font-medium italic mb-4">"{record.description}"</p>
                </div>
              </div>
            ))
          )
        ) : (
          studentRecords.length === 0 ? (
            <div className="bg-white p-24 rounded-[3rem] text-center border border-gray-100">
              <i className="fa-solid fa-clipboard-list text-gray-100 text-7xl mb-6"></i>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">Nenhum registro diário encontrado.</p>
            </div>
          ) : (
            studentRecords.map((record) => (
              <div key={record.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8">
                <div className="md:w-64 flex-shrink-0 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    <h4 className="text-base font-black text-gray-800 leading-tight">{students.find(s => s.id === record.studentId)?.name || 'N/A'}</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border text-center ${record.recordType === 'presenca' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        record.recordType === 'refeicao' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          record.recordType === 'atividade' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                      {record.recordType}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-800 mb-2">{record.value}</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium italic">"{record.observation}"</p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default MediatorRecords;
