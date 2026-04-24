import React, { useState } from 'react';
import { Student, Class, User } from '../types';

interface TeacherMealsProps {
  students: Student[];
  classes: Class[];
  currentUser: User;
  onUpdateStudentHealth?: (studentId: string, refeicoes: any[], evacuacao: any[]) => void;
  meals?: any[];
  onSaveMeal?: any;
}

const mealFields = [
  { id: 'cafe_da_manha', label: 'Café da Manhã', icon: 'fa-coffee' },
  { id: 'colacao', label: 'Colação', icon: 'fa-apple-whole' },
  { id: 'almoco', label: 'Almoço', icon: 'fa-utensils' },
  { id: 'lanche', label: 'Lanche', icon: 'fa-cookie' },
  { id: 'janta', label: 'Janta', icon: 'fa-bowl-food' },
];

const TeacherMeals: React.FC<TeacherMealsProps> = ({
  students,
  classes,
  currentUser,
  onUpdateStudentHealth
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryFilter, setSummaryFilter] = useState<string>(new Date().toISOString().split('T')[0]); // 'all' or 'YYYY-MM-DD'
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);

  const handleDailyRecordChange = async (
    studentId: string, 
    field: 'cafe_da_manha' | 'colacao' | 'almoco' | 'lanche' | 'janta' | 'dormiu' | 'evacuou', 
    value: string | boolean
  ) => {
    if (!onUpdateStudentHealth) return;
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setIsSaving(true);
    let updatedRefeicoes = [...(student.refeicoes || [])];
    let updatedEvacuacao = [...(student.evacuacao || [])];

    const todayRefeicaoIndex = updatedRefeicoes.findIndex(r => r.data === selectedDate);
    const todayEvacuacaoIndex = updatedEvacuacao.findIndex(e => e.data === selectedDate);

    if (field === 'evacuou') {
      if (todayEvacuacaoIndex >= 0) {
        updatedEvacuacao[todayEvacuacaoIndex] = { ...updatedEvacuacao[todayEvacuacaoIndex], evacuou: value };
      } else {
        updatedEvacuacao.push({ data: selectedDate, evacuou: value });
      }
    } else if (field === 'dormiu') {
      if (todayRefeicaoIndex >= 0) {
        updatedRefeicoes[todayRefeicaoIndex] = { ...updatedRefeicoes[todayRefeicaoIndex], dormiu: value };
      } else {
        updatedRefeicoes.push({ data: selectedDate, cafe_da_manha: '', colacao: '', almoco: '', lanche: '', janta: '', dormiu: value });
      }
    } else {
      if (todayRefeicaoIndex >= 0) {
        updatedRefeicoes[todayRefeicaoIndex] = { ...updatedRefeicoes[todayRefeicaoIndex], [field]: value };
      } else {
        updatedRefeicoes.push({ data: selectedDate, cafe_da_manha: '', colacao: '', almoco: '', lanche: '', janta: '', dormiu: false, [field]: value });
      }
    }

    const success = await (onUpdateStudentHealth(studentId, updatedRefeicoes, updatedEvacuacao) as any);
    setIsSaving(false);
    
    if (success !== false) {
      setFeedback(`Registro diário atualizado com sucesso!`);
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const selectedStudentForHistory = students.find(s => s.id === viewingHistory);

  const getMealStatusDisplay = (val: string) => {
    if (val === 'tudo' || val === 'metade' || val === 'repeticao') return 'Sim';
    return 'Não';
  };

  const getStudentHistory = (student: Student) => {
    const dates = new Set<string>();
    (student.refeicoes || []).forEach((r: any) => dates.add(r.data));
    (student.evacuacao || []).forEach((e: any) => dates.add(e.data));

    const history = Array.from(dates).map(date => {
      const ref = (student.refeicoes || []).find((r: any) => r.data === date) || {};
      const evac = (student.evacuacao || []).find((e: any) => e.data === date) || {};
      return {
        date,
        ...ref,
        evacuou: evac.evacuou || false
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return history;
  };

  const summaryRows: { student: Student; date: string; data: any }[] = [];
  if (summaryFilter === 'all') {
    students.forEach(student => {
      const history = getStudentHistory(student);
      history.forEach(day => {
        summaryRows.push({ student, date: day.date, data: day });
      });
    });
    summaryRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else {
    students.forEach(student => {
      const todayRefeicao = (student.refeicoes || []).find(r => r.data === summaryFilter) || {};
      const todayEvacuacao = (student.evacuacao || []).find(e => e.data === summaryFilter) || {};
      summaryRows.push({ student, date: summaryFilter, data: { ...todayRefeicao, evacuou: todayEvacuacao.evacuou || false } });
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-notes-medical"></i>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Controle de Saúde e Refeições</h1>
              {isSaving && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 animate-pulse">
                  <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Salvando...</span>
                </div>
              )}
            </div>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Acompanhamento diário consolidado</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {isRegistering && (
            <button
              onClick={() => {
                setIsRegistering(false);
                if (!isSaving) {
                  setFeedback('Registros diários concluídos!');
                  setTimeout(() => setFeedback(null), 3000);
                }
              }}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
                isSaving 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 active:scale-95'
              } animate-in fade-in slide-in-from-right-4 duration-300`}
            >
              <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isRegistering
              ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
              }`}
          >
            <i className={`fa-solid ${isRegistering ? 'fa-xmark' : 'fa-plus'}`}></i>
            {isRegistering ? 'Cancelar' : 'Fazer Registro'}
          </button>
        </div>
      </header>

      {feedback && (
        <div className="max-w-md mx-auto px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 text-center">
          <i className="fa-solid fa-circle-check mr-2"></i> {feedback}
        </div>
      )}

      {isRegistering && (
        <div className="bg-[#1a1b2e] rounded-[3rem] border border-indigo-500/20 shadow-2xl shadow-indigo-900/20 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-indigo-500/20 bg-indigo-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Registros Diários de Saúde e Alimentação</h2>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Selecione a data para registrar as refeições</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-[#0f1021] px-5 py-2.5 rounded-2xl border border-indigo-500/30">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Data do Registro:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-200 outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950/50 border-b border-indigo-500/20">
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest min-w-[200px]">Aluno</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Café da Manhã</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Colação</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Almoço</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Lanche</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Janta</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Dormiu?</th>
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[120px]">Evacuou?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/10">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest">Nenhum aluno encontrado.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const todayRefeicao = (student.refeicoes || []).find(r => r.data === selectedDate) || {};
                    const todayEvacuacao = (student.evacuacao || []).find(e => e.data === selectedDate) || {};
                    
                    return (
                      <tr key={`daily-${student.id}`} className="hover:bg-indigo-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-100 text-sm block">{student.name}</span>
                          <span className="text-[9px] font-black text-indigo-400 uppercase">RA: {student.ra}</span>
                        </td>
                        {['cafe_da_manha', 'colacao', 'almoco', 'lanche', 'janta'].map((field) => (
                          <td key={field} className="px-2 py-4">
                            <select 
                              value={todayRefeicao[field] || ''}
                              onChange={(e) => handleDailyRecordChange(student.id, field as any, e.target.value)}
                              className="w-full bg-[#0f1021] border border-indigo-500/30 rounded-lg px-2 py-2 text-[10px] font-bold text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">--</option>
                              <option value="tudo">Comeu tudo</option>
                              <option value="metade">Comeu pouco</option>
                              <option value="repeticao">Repetiu</option>
                              <option value="nao_comeu">Não comeu</option>
                            </select>
                          </td>
                        ))}
                        <td className="px-2 py-4 text-center">
                          <div className="flex bg-[#0f1021] p-0.5 rounded-lg border border-indigo-500/30">
                            <button
                              onClick={() => handleDailyRecordChange(student.id, 'dormiu', true)}
                              className={`flex-1 py-1 rounded-md text-[9px] font-black transition-all ${todayRefeicao.dormiu === true ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-300'}`}
                            >SIM</button>
                            <button
                              onClick={() => handleDailyRecordChange(student.id, 'dormiu', false)}
                              className={`flex-1 py-1 rounded-md text-[9px] font-black transition-all ${todayRefeicao.dormiu === false ? 'bg-rose-500 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-300'}`}
                            >NÃO</button>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex bg-[#0f1021] p-0.5 rounded-lg border border-indigo-500/30">
                            <button
                              onClick={() => handleDailyRecordChange(student.id, 'evacuou', true)}
                              className={`flex-1 py-1 rounded-md text-[9px] font-black transition-all ${todayEvacuacao.evacuou === true ? 'bg-purple-600 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-300'}`}
                            >SIM</button>
                            <button
                              onClick={() => handleDailyRecordChange(student.id, 'evacuou', false)}
                              className={`flex-1 py-1 rounded-md text-[9px] font-black transition-all ${todayEvacuacao.evacuou === false ? 'bg-purple-600 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-300'}`}
                            >NÃO</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Resumo (Dark Theme style) */}
      <div className="bg-[#1a1b2e] rounded-[3rem] border border-indigo-500/20 shadow-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-indigo-500/20 bg-indigo-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
               <i className="fa-solid fa-list-check"></i>
             </div>
             <div>
                <h3 className="text-lg font-black text-white">Resumo Diário</h3>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                  {summaryFilter === 'all' ? 'Exibindo todos os registros históricos' : `Exibindo registros de: ${new Date(summaryFilter + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 bg-[#0f1021] px-4 py-2 rounded-xl border border-indigo-500/30">
            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Visualizar Data:</label>
            <select
              value={summaryFilter === 'all' ? 'all' : 'specific'}
              onChange={(e) => {
                if (e.target.value === 'all') setSummaryFilter('all');
                else setSummaryFilter(new Date().toISOString().split('T')[0]);
              }}
              className="bg-transparent border-none text-xs font-bold text-gray-200 outline-none cursor-pointer [color-scheme:dark]"
            >
              <option value="specific">Dia específico</option>
              <option value="all">Todos os dias</option>
            </select>
            {summaryFilter !== 'all' && (
              <input
                type="date"
                value={summaryFilter}
                onChange={(e) => setSummaryFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-200 outline-none cursor-pointer ml-2 border-l border-indigo-500/30 pl-2 [color-scheme:dark]"
              />
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-950/50 border-b border-indigo-500/20">
                <th className="px-6 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Aluno</th>
                {summaryFilter === 'all' && (
                  <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[100px]">Data</th>
                )}
                {mealFields.map(m => (
                  <th key={m.id} className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <i className={`fa-solid ${m.icon} text-indigo-400 opacity-80`}></i>
                      {m.label}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <i className="fa-solid fa-bed text-indigo-400 opacity-80"></i>
                    Dormiu?
                  </div>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center min-w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <i className="fa-solid fa-poop text-indigo-400 opacity-80"></i>
                    Evacuou?
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/10">
              {summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={summaryFilter === 'all' ? 9 : 8} className="p-16 text-center">
                    <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest">Nenhum registro encontrado para este filtro.</p>
                  </td>
                </tr>
              ) : (
                summaryRows.map((row, idx) => (
                  <tr key={`${row.student.id}-${row.date}-${idx}`} className="hover:bg-indigo-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-300 font-bold overflow-hidden shadow-inner border border-indigo-500/30">
                          <span className="text-sm">{row.student.name.charAt(0)}</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-200 text-sm">{row.student.name}</span>
                            <button
                              onClick={() => setViewingHistory(row.student.id)}
                              title="Ver Histórico Completo"
                              className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center text-[10px]"
                            >
                              <i className="fa-solid fa-clock-rotate-left"></i>
                            </button>
                          </div>
                          <span className="text-[9px] font-black text-indigo-400/70 uppercase tracking-tighter">RA: {row.student.ra}</span>
                        </div>
                      </div>
                    </td>
                    {summaryFilter === 'all' && (
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-950/50 text-indigo-300 text-[10px] font-black tracking-widest border border-indigo-500/20">
                          {row.date ? new Date(row.date + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                        </span>
                      </td>
                    )}
                    {mealFields.map(meal => (
                      <td key={meal.id} className="px-4 py-4 text-center">
                         {getMealStatusDisplay(row.data[meal.id]) === 'Sim' ? (
                           <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Sim</span>
                         ) : (
                           <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">Não</span>
                         )}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                       {row.data.dormiu === true ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest">Sim</span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">Não</span>
                       )}
                    </td>
                    <td className="px-4 py-4 text-center">
                       {row.data.evacuou === true ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">Sim</span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">Não</span>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Histórico Individual */}
      {viewingHistory && selectedStudentForHistory && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1a1b2e] w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-indigo-500/30">
            <header className="p-8 border-b border-indigo-500/20 flex items-center justify-between bg-indigo-950/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Histórico de Refeições e Saúde</h3>
                  <p className="text-indigo-300 font-bold uppercase text-[9px] tracking-widest">{selectedStudentForHistory.name} | RA: {selectedStudentForHistory.ra}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingHistory(null)}
                className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all shadow-sm flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {getStudentHistory(selectedStudentForHistory).length === 0 ? (
                <div className="py-20 text-center">
                  <i className="fa-solid fa-calendar-xmark text-indigo-500/30 text-6xl mb-4 block"></i>
                  <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest">Nenhum registro histórico encontrado.</p>
                </div>
              ) : (
                getStudentHistory(selectedStudentForHistory).map((dayData: any) => (
                  <div key={dayData.date} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1 bg-indigo-900/30 text-indigo-300 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-500/30">
                        {new Date(dayData.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex-1 h-px bg-indigo-500/20"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {mealFields.map(type => {
                        const val = dayData[type.id];
                        const hasEaten = getMealStatusDisplay(val) === 'Sim';

                        return (
                          <div key={type.id} className="bg-indigo-950/30 border border-indigo-500/20 rounded-3xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <i className={`fa-solid ${type.icon} text-indigo-400`}></i>
                              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{type.label}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${hasEaten ? 'bg-emerald-500/80' : 'bg-slate-700'}`}>
                                <i className={`fa-solid ${hasEaten ? 'fa-check' : 'fa-xmark'}`}></i>
                              </div>
                              <span className="text-[10px] font-bold text-gray-300">{hasEaten ? 'Registrado' : 'Não'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-indigo-500/10">
                              <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-900/20">
                                <i className={`fa-solid fa-bed text-[10px] mb-1 ${dayData.dormiu ? 'text-indigo-400' : 'text-slate-600'}`}></i>
                                <span className="text-[7px] font-black uppercase text-indigo-400/70">{dayData.dormiu ? 'DORMIU' : 'NÃO'}</span>
                              </div>
                              <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-900/20">
                                <i className={`fa-solid fa-poop text-[10px] mb-1 ${dayData.evacuou ? 'text-amber-500' : 'text-slate-600'}`}></i>
                                <span className="text-[7px] font-black uppercase text-indigo-400/70">{dayData.evacuou ? 'EVACUOU' : 'NÃO'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <footer className="p-6 bg-indigo-950/50 border-t border-indigo-500/20 text-center">
              <button 
                onClick={() => setViewingHistory(null)}
                className="px-10 py-3 bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
              >
                Fechar Histórico
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMeals;
