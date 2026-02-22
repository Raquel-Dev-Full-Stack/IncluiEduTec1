
import React, { useState } from 'react';
import { Class, Student } from '../types';

interface MediatorClassesProps {
  classes: Class[];
  students: Student[];
}

const MediatorClasses: React.FC<MediatorClassesProps> = ({ classes, students }) => {
  const [obsVisible, setObsVisible] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-users-rectangle"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Turmas Acompanhadas</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Monitoramento de inclusão e apoio pedagógico coletivo</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter(s => s.classId === cls.id);
          return (
            <div key={cls.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-800">{cls.name}</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Ano Letivo {cls.year}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <i className="fa-solid fa-chalkboard"></i>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-tighter">Meus Alunos</p>
                  <p className="text-xl font-black text-gray-800">{classStudents.length}</p>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-500 uppercase mb-1 tracking-tighter">Período</p>
                  <p className="text-sm font-black text-blue-700 uppercase">{cls.shift || 'Integral'}</p>
                </div>
              </div>

              <div className="flex-1">
                {obsVisible === cls.id ? (
                  <div className="space-y-3 animate-in fade-in zoom-in-95">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Observações da Turma</label>
                    <textarea 
                      placeholder="Registre pontos relevantes sobre a dinâmica desta turma..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={3}
                    ></textarea>
                    <button 
                      onClick={() => setObsVisible(null)}
                      className="w-full py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      Salvar Notas
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setObsVisible(cls.id)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <i className="fa-solid fa-notes-medical"></i>
                    Registrar Observação Geral
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {classes.length === 0 && (
        <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center">
          <i className="fa-solid fa-magnifying-glass text-gray-100 text-6xl mb-6"></i>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma turma vinculada para mediação.</p>
        </div>
      )}
    </div>
  );
};

export default MediatorClasses;
