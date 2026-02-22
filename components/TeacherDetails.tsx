
import React, { useState, useMemo } from 'react';
import { User, LessonPlan, Class } from '../types';
import Table from './Table';

interface TeacherDetailsProps {
  teacher: User;
  lessonPlans: LessonPlan[];
  classes: Class[];
  onBack: () => void;
}

const TeacherDetails: React.FC<TeacherDetailsProps> = ({ teacher, lessonPlans, classes, onBack }) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const teacherClasses = useMemo(() =>
    classes.filter(c => c.teacherId === teacher.id),
    [classes, teacher.id]);

  const filteredPlans = useMemo(() => {
    const now = new Date();
    return lessonPlans.filter(p => {
      const planDate = new Date(p.createdAt);
      if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return planDate >= weekAgo;
      }
      if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return planDate >= monthAgo;
      }
      if (filterPeriod === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return planDate >= yearAgo;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [lessonPlans, filterPeriod]);

  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'N/A';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{teacher.name}</h2>
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${teacher.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                }`}>
                {teacher.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-gray-500 text-xs font-medium mt-1">
              <i className="fa-solid fa-envelope mr-1 opacity-50"></i> {teacher.email}
              <span className="mx-2 opacity-20">|</span>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                Professor(a) Regente
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['all', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {period === 'all' ? 'Tudo' : period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Turmas Vinculadas */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <i className="fa-solid fa-users-rectangle text-blue-500"></i>
            Turmas Atribuídas
          </h3>
          <div className="space-y-4">
            {teacherClasses.length === 0 ? (
              <p className="text-xs italic text-gray-400">Nenhuma turma atribuída no momento.</p>
            ) : (
              teacherClasses.map(c => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{c.name}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Ano Letivo {c.year}</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado Direito: Histórico de Registros */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <i className="fa-solid fa-book-open text-blue-500"></i>
              Histórico de Registros de Aula ({filteredPlans.length})
            </h3>
          </div>

          <Table<LessonPlan>
            data={filteredPlans}
            columns={[
              {
                header: 'Data',
                accessor: (p) => (
                  <span className="font-bold text-gray-800">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                )
              },
              {
                header: 'Turma',
                accessor: (p) => <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">{getClassName(p.classId)}</span>
              },
              {
                header: 'Conteúdo Registrado',
                accessor: (p) => (
                  <div className="max-w-xs py-1">
                    <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{p.temaAula}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-2" title={p.description}>
                      {p.description}
                    </p>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
