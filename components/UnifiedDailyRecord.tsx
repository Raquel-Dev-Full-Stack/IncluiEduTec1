import React, { useState, useMemo } from 'react';
import { Student, Class, User, Meal } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface UnifiedDailyRecordProps {
  students: Student[];
  classes: Class[];
  currentUser: User;
  meals: Meal[];
  onUpdateStudentHealth: (studentId: string, refeicoes: any[], evacuacao: any[]) => Promise<boolean>;
}

const mealFields = [
  { id: 'cafe_da_manha', label: 'Café da Manhã', icon: 'fa-coffee' },
  { id: 'colacao', label: 'Colação', icon: 'fa-apple-whole' },
  { id: 'almoco', label: 'Almoço', icon: 'fa-utensils' },
  { id: 'lanche', label: 'Lanche', icon: 'fa-cookie' },
  { id: 'janta', label: 'Janta', icon: 'fa-bowl-food' },
];

const UnifiedDailyRecord: React.FC<UnifiedDailyRecordProps> = ({
  students,
  classes,
  currentUser,
  onUpdateStudentHealth
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryFilter, setSummaryFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Process data for the unified history
  const unifiedHistory = useMemo(() => {
    const history: any[] = [];
    students.forEach(student => {
      const dates = new Set<string>();
      (student.refeicoes || []).forEach((r: any) => dates.add(r.data));
      (student.evacuacao || []).forEach((e: any) => dates.add(e.data));

      Array.from(dates).forEach(date => {
        const ref = (student.refeicoes || []).find((r: any) => r.data === date) || {};
        const evac = (student.evacuacao || []).find((e: any) => e.data === date) || {};
        history.push({
          id: `${student.id}-${date}`,
          studentId: student.id,
          studentName: student.name,
          ra: student.ra,
          date,
          ...ref,
          evacuou: evac.evacuou
        });
      });
    });
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [students]);

  const filteredHistory = useMemo(() => {
    if (summaryFilter === 'all') return unifiedHistory;
    return unifiedHistory.filter(h => h.date === summaryFilter);
  }, [unifiedHistory, summaryFilter]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdate = async (studentId: string, field: string, value: any) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setIsSaving(true);
    let updatedRefeicoes = [...(student.refeicoes || [])];
    let updatedEvacuacao = [...(student.evacuacao || [])];

    const refIndex = updatedRefeicoes.findIndex(r => r.data === selectedDate);
    const evacIndex = updatedEvacuacao.findIndex(e => e.data === selectedDate);

    if (field === 'evacuou') {
      if (evacIndex >= 0) updatedEvacuacao[evacIndex] = { ...updatedEvacuacao[evacIndex], evacuou: value };
      else updatedEvacuacao.push({ data: selectedDate, evacuou: value });
    } else if (field === 'dormiu') {
      if (refIndex >= 0) updatedRefeicoes[refIndex] = { ...updatedRefeicoes[refIndex], dormiu: value };
      else updatedRefeicoes.push({ data: selectedDate, dormiu: value, cafe_da_manha: '', colacao: '', almoco: '', lanche: '', janta: '' });
    } else {
      if (refIndex >= 0) updatedRefeicoes[refIndex] = { ...updatedRefeicoes[refIndex], [field]: value };
      else updatedRefeicoes.push({ data: selectedDate, [field]: value, dormiu: false });
    }

    await onUpdateStudentHealth(studentId, updatedRefeicoes, updatedEvacuacao);
    setIsSaving(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Relatório de Refeições, Saúde e Evacuação Diária', 14, 15);
    
    const tableData = filteredHistory.map(h => [
      new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR'),
      h.studentName,
      h.cafe_da_manha || '-',
      h.colacao || '-',
      h.almoco || '-',
      h.lanche || '-',
      h.janta || '-',
      h.dormiu ? 'Sim' : 'Não',
      h.evacuou ? 'Evacuou' : 'Não evacuou'
    ]);

    (doc as any).autoTable({
      head: [['Data', 'Aluno', 'Café', 'Colação', 'Almoço', 'Lanche', 'Janta', 'Dormiu?', 'Evacuação']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    doc.save(`relatorio_diario_${summaryFilter}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header com Design Premium */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100 dark:shadow-none">
            <i className="fa-solid fa-hospital-user"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Refeições, Saúde e Evacuação</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão integrada de rotina diária</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={exportToPDF}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <i className="fa-solid fa-file-pdf text-rose-500"></i> Exportar PDF
          </button>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Registro:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Registro Rápido */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Registrar Movimentação Diária</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-white border-b-2 border-slate-900">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest min-w-[200px]">Aluno</th>
                {mealFields.map(f => (
                  <th key={f.id} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{f.label}</th>
                ))}
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Dormiu?</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">Evacuação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map(student => {
                const todayRef = (student.refeicoes || []).find(r => r.data === selectedDate) || {};
                const todayEvac = (student.evacuacao || []).find(e => e.data === selectedDate) || {};
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase">RA: {student.ra}</div>
                    </td>
                    {mealFields.map(f => (
                      <td key={f.id} className="px-2 py-4">
                        <select
                          value={todayRef[f.id] || ''}
                          onChange={(e) => handleUpdate(student.id, f.id, e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">--</option>
                          <option value="tudo">Tudo</option>
                          <option value="metade">Pouco</option>
                          <option value="repeticao">Repetiu</option>
                          <option value="nao_comeu">Não</option>
                        </select>
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleUpdate(student.id, 'dormiu', !todayRef.dormiu)}
                        className={`w-full py-2 rounded-xl text-[10px] font-black transition-all ${todayRef.dormiu ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >
                        {todayRef.dormiu ? 'SIM' : 'NÃO'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleUpdate(student.id, 'evacuou', !todayEvac.evacuou)}
                        className={`w-full py-2 rounded-xl text-[10px] font-black transition-all ${todayEvac.evacuou ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >
                        {todayEvac.evacuou ? 'EVACUOU' : 'NÃO EVACUOU'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Consolidado com Filtros e Paginação */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mt-8">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30 dark:bg-slate-800/20">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Histórico Consolidado</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registros de alimentação, sono e evacuação</p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro:</label>
            <select
              value={summaryFilter === 'all' ? 'all' : 'day'}
              onChange={(e) => setSummaryFilter(e.target.value === 'all' ? 'all' : selectedDate)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="day">Hoje / Data Selecionada</option>
              <option value="all">Ver Tudo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                {mealFields.map(m => (
                  <th key={m.id} className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{m.label}</th>
                ))}
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dormiu?</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Evacuação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedHistory.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      {new Date(row.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{row.studentName}</span>
                  </td>
                  {mealFields.map(f => {
                    const status = row[f.id];
                    return (
                      <td key={f.id} className="px-4 py-4 text-center">
                        {status ? (
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${status === 'tudo' || status === 'repeticao' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {status === 'tudo' ? 'Tudo' : status === 'metade' ? 'Pouco' : status === 'repeticao' ? 'Repetiu' : 'Não'}
                          </span>
                        ) : '--'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${row.dormiu ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <i className={`fa-solid ${row.dormiu ? 'fa-check' : 'fa-xmark'}`}></i>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${row.evacuou ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-rose-500 shadow-lg shadow-rose-200'}`}></div>
                      <span className={`text-[10px] font-black uppercase ${row.evacuou ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {row.evacuou ? 'Evacuou' : 'Não evacuou'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página {currentPage} de {totalPages || 1}</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDailyRecord;
