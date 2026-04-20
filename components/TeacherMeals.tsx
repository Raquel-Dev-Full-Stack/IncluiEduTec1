
import React, { useState } from 'react';
import { Student, Class, Meal, User } from '../types';

interface TeacherMealsProps {
  students: Student[];
  classes: Class[];
  meals: Meal[];
  onSaveMeal: (meal: Omit<Meal, 'id'>) => void;
  currentUser: User;
}

const mealTypes = [
  { id: 'Café da Manhã', label: 'Café da Manhã', icon: 'fa-coffee' },
  { id: 'Colação', label: 'Colação', icon: 'fa-apple-whole' },
  { id: 'Almoço', label: 'Almoço', icon: 'fa-utensils' },
  { id: 'Lanche', label: 'Lanche', icon: 'fa-cookie' },
  { id: 'Janta', label: 'Janta', icon: 'fa-bowl-food' },
];

const mealStatus = [
  { id: 'comeu', label: 'Comeu tudo', color: 'emerald', icon: 'fa-check' },
  { id: 'comeu pouco', label: 'Comeu pouco', color: 'amber', icon: 'fa-chart-pie' },
  { id: 'não comeu', label: 'Não comeu', color: 'rose', icon: 'fa-xmark' },
];

const TeacherMeals: React.FC<TeacherMealsProps> = ({
  students,
  classes,
  meals,
  onSaveMeal,
  currentUser
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados para o modo de registro em lote
  const [batchMealType, setBatchMealType] = useState('Almoço');
  const [batchRecords, setBatchRecords] = useState<Record<string, string>>({});

  const getMealData = (studentId: string, type: string) => {
    return meals.find(m =>
      m.studentId === studentId &&
      m.type === type &&
      m.date.startsWith(selectedDate)
    );
  };

  const handleStatusChange = (studentId: string, mealType: string, status: string) => {
    const existing = getMealData(studentId, mealType) || {};
    onSaveMeal({
      ...existing,
      studentId,
      date: selectedDate + 'T' + new Date().toLocaleTimeString('pt-BR'),
      type: mealType,
      status,
    } as Omit<Meal, 'id'>);
    setFeedback(`Registro de ${mealType} atualizado!`);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleCheckboxChange = (studentId: string, mealType: string, field: 'sono' | 'evacuou', value: boolean) => {
    const existing = getMealData(studentId, mealType) || {};
    onSaveMeal({
      studentId,
      date: selectedDate + 'T' + new Date().toLocaleTimeString('pt-BR'),
      type: mealType,
      status: existing.status || 'Não comeu',
      sono: field === 'sono' ? value : existing.sono,
      evacuou: field === 'evacuou' ? value : existing.evacuou,
    });
    setFeedback(`${field === 'sono' ? 'Sono' : 'Evacuação'} atualizada!`);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleSaveBatch = () => {
    const studentIds = Object.keys(batchRecords);
    if (studentIds.length === 0) {
      alert('Selecione o estado de pelo menos um aluno.');
      return;
    }

    studentIds.forEach(id => {
      handleStatusChange(id, batchMealType, batchRecords[id]);
    });

    setFeedback(`${studentIds.length} registros de ${batchMealType} salvos!`);
    setIsRegistering(false);
    setBatchRecords({});
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-amber-100">
            <i className="fa-solid fa-utensils"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Controle de Refeições</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Acompanhamento nutricional diário por aluno</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Registro:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-700 outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isRegistering
              ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-100 active:scale-95'
              }`}
          >
            <i className={`fa-solid ${isRegistering ? 'fa-xmark' : 'fa-plus'}`}></i>
            {isRegistering ? 'Cancelar' : 'Fazer Registro'}
          </button>
        </div>
      </header>

      {/* Interface de Registro Rápido */}
      {isRegistering && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-900/5 animate-in zoom-in-95 duration-300 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <i className="fa-solid fa-file-signature"></i>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Novo Registro de Merenda</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Preencha o consumo de todos os alunos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 shadow-inner">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Refeição:</label>
              <select
                value={batchMealType}
                onChange={(e) => setBatchMealType(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
              >
                {mealTypes.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs font-bold uppercase">Nenhum aluno encontrado para suas turmas.</p>
              </div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-amber-200 transition-all shadow-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-800 text-sm truncate">{student.name}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      {classes.find(c => c.id === student.classId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-4">
                    {mealStatus.map(status => (
                      <button
                        key={status.id}
                        onClick={() => setBatchRecords(prev => ({ ...prev, [student.id]: status.id }))}
                        title={status.label}
                        className={`w-8 h-8 rounded-xl text-[8px] font-black uppercase flex items-center justify-center transition-all border ${batchRecords[student.id] === status.id
                          ? `bg-${status.color}-500 border-${status.color}-500 text-white shadow-md`
                          : `bg-white border-gray-200 text-gray-400 hover:border-${status.color}-200`
                          }`}
                      >
                        <i className={`fa-solid ${status.icon}`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              onClick={handleSaveBatch}
              className="px-10 py-4 bg-amber-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-700 transition-all active:scale-95 shadow-xl shadow-amber-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-save"></i>
              Salvar Registros
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="max-w-md mx-auto px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 text-center">
          <i className="fa-solid fa-circle-check mr-2"></i> {feedback}
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Aluno</th>
                {mealTypes.map(m => (
                  <th key={m.id} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-1">
                      <i className={`fa-solid ${m.icon} text-amber-500 opacity-60`}></i>
                      {m.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <i className="fa-solid fa-folder-open text-gray-100 text-6xl mb-6 block"></i>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum aluno vinculado para esta turma.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-6 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-inner">
                          <span className="text-sm">{student.name.charAt(0)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{student.name}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">RA: {student.ra}</span>
                        </div>
                      </div>
                    </td>
                    {mealTypes.map(meal => {
                      const mealData = getMealData(student.id, meal.label) || {};
                      const currentStatus = mealData.status;

                      return (
                        <td key={meal.id} className="px-4 py-6 text-center">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-center gap-1">
                              {mealStatus.map(status => {
                                const isActive = currentStatus === status.id;
                                const colors: Record<string, string> = {
                                  emerald: isActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-emerald-500 border-emerald-100 hover:bg-emerald-50',
                                  amber: isActive ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-amber-500 border-amber-100 hover:bg-amber-50',
                                  rose: isActive ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50',
                                };

                                return (
                                  <button
                                    key={status.id}
                                    onClick={() => handleStatusChange(student.id, meal.label, status.id)}
                                    title={status.label}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm ${colors[status.color]}`}
                                  >
                                    <i className={`fa-solid ${status.icon} text-[10px]`}></i>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex flex-col gap-3 mt-1 border-t border-gray-100 pt-3 px-2">
                              {/* Controle de Sono */}
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <i className="fa-solid fa-bed text-indigo-400 text-[10px]"></i>
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Dormiu?</span>
                                </div>
                                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 w-full max-w-[100px] shadow-inner">
                                  <button
                                    onClick={() => handleCheckboxChange(student.id, meal.label, 'sono', true)}
                                    className={`flex-1 py-1 rounded-md text-[8px] font-black transition-all ${mealData.sono === true ? 'bg-indigo-500 text-white shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    SIM
                                  </button>
                                  <button
                                    onClick={() => handleCheckboxChange(student.id, meal.label, 'sono', false)}
                                    className={`flex-1 py-1 rounded-md text-[8px] font-black transition-all ${mealData.sono === false ? 'bg-rose-500 text-white shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    NÃO
                                  </button>
                                </div>
                              </div>

                              {/* Controle de Evacuação */}
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <i className="fa-solid fa-poop text-amber-700 text-[10px]"></i>
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Evacuou?</span>
                                </div>
                                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 w-full max-w-[100px] shadow-inner">
                                  <button
                                    onClick={() => handleCheckboxChange(student.id, meal.label, 'evacuou', true)}
                                    className={`flex-1 py-1 rounded-md text-[8px] font-black transition-all ${mealData.evacuou === true ? 'bg-amber-500 text-white shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    SIM
                                  </button>
                                  <button
                                    onClick={() => handleCheckboxChange(student.id, meal.label, 'evacuou', false)}
                                    className={`flex-1 py-1 rounded-md text-[8px] font-black transition-all ${mealData.evacuou === false ? 'bg-rose-500 text-white shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    NÃO
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
          <i className="fa-solid fa-circle-info text-xl"></i>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Informações de Consumo</p>
          <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
            O registro da alimentação é fundamental para o acompanhamento pedagógico e de saúde.
            Em caso de alunos com AEE, estas informações são compartilhadas com o mediador e a equipe diretiva.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherMeals;
