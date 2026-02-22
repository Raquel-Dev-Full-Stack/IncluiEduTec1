
import React from 'react';
import { Class, Student } from '../types';

interface TeacherClassesProps {
  classes: Class[];
  students: Student[];
  onRegisterActivity: (classId: string) => void;
}

const TeacherClasses: React.FC<TeacherClassesProps> = ({ classes, students, onRegisterActivity }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-100">
            <i className="fa-solid fa-users-rectangle"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Minhas Turmas</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão de classes e planejamento de atividades</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter(s => s.classId === cls.id);
          return (
            <div key={cls.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-800">{cls.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ano Letivo {cls.year}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <i className="fa-solid fa-chalkboard"></i>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Alunos</p>
                  <p className="text-xl font-black text-gray-800">{classStudents.length}</p>
                </div>
                <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Status</p>
                  <p className="text-sm font-black text-emerald-700 uppercase">Ativa</p>
                </div>
              </div>

              <button
                onClick={() => onRegisterActivity(cls.id)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                Registrar Atividade
              </button>
            </div>
          );
        })}
      </div>

      {classes.length === 0 && (
        <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center">
          <i className="fa-solid fa-folder-open text-gray-100 text-6xl mb-6"></i>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma turma vinculada ao seu perfil.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
