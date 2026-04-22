
import React, { useState, useEffect } from 'react';
import { Student, Class, Attendance, User, StudentRecord } from '../types';
import Table from './Table';

interface TeacherStudentsProps {
  students: Student[];
  classes: Class[];
  attendances: Attendance[];
  onSaveAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  onSaveStudentRecord: (record: Partial<StudentRecord>) => void;
  currentUser: User;
  onViewProfile?: (studentId: string) => void;
}

const TeacherStudents: React.FC<TeacherStudentsProps> = ({
  students,
  classes,
  attendances,
  onSaveAttendance,
  onSaveStudentRecord,
  currentUser,
  onViewProfile
}) => {
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<string | null>(null);
  const [isRegisteringAttendance, setIsRegisteringAttendance] = useState(false);

  // Estado para registro individual
  const [individualRecord, setIndividualRecord] = useState({
    type: 'atividade' as 'atividade' | 'observacao',
    value: '',
    observation: ''
  });

  const [selectedBatchTurno, setSelectedBatchTurno] = useState<'Manhã' | 'Tarde' | 'Integral'>('Manhã');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchStatuses, setBatchStatuses] = useState<Record<string, 'presente' | 'falta'>>({});

  // Estado local para armazenar a data selecionada por aluno na tabela individual
  const [studentAttendanceDates, setStudentAttendanceDates] = useState<Record<string, string>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: new Date().toISOString().split('T')[0] }), {})
  );

  // Efeito para carregar presenças existentes ao mudar a data no modo de chamada em lote
  useEffect(() => {
    if (isRegisteringAttendance) {
      const newBatchStatuses: Record<string, 'presente' | 'falta'> = {};
      
      const filteredByTurno = students.filter(s => 
        s.attendancePeriod === selectedBatchTurno || 
        s.turno === 'integral' ||
        selectedBatchTurno === 'Integral'
      );

      filteredByTurno.forEach(student => {
        const existing = attendances.find(a =>
          a.studentId === student.id &&
          a.date.startsWith(batchDate) &&
          (a.shift === selectedBatchTurno || (!a.shift && student.attendancePeriod === selectedBatchTurno))
        );
        if (existing) {
          newBatchStatuses[student.id] = existing.status;
        }
      });
      setBatchStatuses(newBatchStatuses);
    }
  }, [batchDate, isRegisteringAttendance, attendances, students, selectedBatchTurno]);

  const handleAttendance = (studentId: string, classId: string, status: 'presente' | 'falta', customDate?: string) => {
    const selectedDate = customDate || studentAttendanceDates[studentId] || new Date().toISOString().split('T')[0];

    const now = new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateToSave = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();

    onSaveAttendance({
      studentId,
      classId,
      teacherId: currentUser.id,
      date: dateToSave,
      status,
      shift: isRegisteringAttendance ? selectedBatchTurno : (students.find(s => s.id === studentId)?.attendancePeriod || 'Manhã')
    });

    if (!isRegisteringAttendance) {
      const studentName = students.find(s => s.id === studentId)?.name.split(' ')[0];
      setFeedback({
        message: `${status === 'presente' ? 'Presença' : 'Falta'} registrada para ${studentName} em ${new Date(selectedDate).toLocaleDateString('pt-BR')}!`,
        type: 'success'
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleFinishBatchAttendance = () => {
    const studentIds = Object.keys(batchStatuses);
    if (studentIds.length === 0) {
      alert('Por favor, marque a presença de pelo menos um aluno antes de salvar.');
      return;
    }

    studentIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (student) {
        handleAttendance(id, student.classId, batchStatuses[id], batchDate);
      }
    });

    setFeedback({
      message: `Chamada realizada com sucesso para ${studentIds.length} alunos na data ${new Date(batchDate).toLocaleDateString('pt-BR')}!`,
      type: 'success'
    });

    setIsRegisteringAttendance(false);
    setBatchStatuses({});
    setTimeout(() => setFeedback(null), 3000);
  };

  const getAttendanceForDate = (studentId: string, dateStr: string, shift?: string) => {
    return attendances.find(a => 
      a.studentId === studentId && 
      a.date.startsWith(dateStr) && 
      (!shift || a.shift === shift)
    );
  };

  const studentHistory = (studentId: string) => {
    return attendances
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const updateStudentDate = (studentId: string, date: string) => {
    setStudentAttendanceDates(prev => ({ ...prev, [studentId]: date }));
  };

  const handleSaveIndividual = (studentId: string) => {
    if (!individualRecord.value && !individualRecord.observation) {
      alert('Preencha pelo menos um campo do registro.');
      return;
    }

    onSaveStudentRecord({
      studentId,
      date: studentAttendanceDates[studentId] || new Date().toISOString().split('T')[0],
      recordType: individualRecord.type,
      value: individualRecord.value,
      observation: individualRecord.observation
    });

    setFeedback({ message: 'Registro salvo com sucesso!', type: 'success' });
    setShowRegisterModal(null);
    setIndividualRecord({ type: 'atividade', value: '', observation: '' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-emerald-100">
            <i className="fa-solid fa-children"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meus Alunos</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Chamada diária e controle de frequência</p>
          </div>
        </div>

        {feedback && (
          <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}>
            <i className="fa-solid fa-circle-check"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        )}
      </header>

      {/* Botão de Cadastrar Nova Chamada */}
      <div className="flex justify-start">
        <button
          onClick={() => setIsRegisteringAttendance(!isRegisteringAttendance)}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isRegisteringAttendance
            ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'
            }`}
        >
          <i className={`fa-solid ${isRegisteringAttendance ? 'fa-xmark' : 'fa-calendar-plus'}`}></i>
          {isRegisteringAttendance ? 'Cancelar Chamada' : 'Cadastrar Nova Chamada'}
        </button>
      </div>

      {/* Formulário de Nova Chamada (Lote) */}
      {isRegisteringAttendance && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 animate-in zoom-in-95 duration-300 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <i className="fa-solid fa-clipboard-user"></i>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Nova Chamada Escolar</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Preencha a frequência de todos os alunos</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 shadow-inner">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Data:</label>
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 shadow-inner">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Turno:</label>
                <select
                  value={selectedBatchTurno}
                  onChange={(e) => setSelectedBatchTurno(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.filter(s => 
              s.attendancePeriod === selectedBatchTurno || 
              s.turno === 'integral' || 
              selectedBatchTurno === 'Integral'
            ).length === 0 ? (
              <div className="col-span-full py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs font-bold uppercase">Nenhum aluno encontrado para o turno {selectedBatchTurno}.</p>
              </div>
            ) : (
              students.filter(s => 
                s.attendancePeriod === selectedBatchTurno || 
                s.turno === 'integral' || 
                selectedBatchTurno === 'Integral'
              ).map((student) => (
                <div key={student.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-800 text-sm truncate">{student.name}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      {classes.find(c => c.id === student.classId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      onClick={() => setBatchStatuses(prev => ({ ...prev, [student.id]: 'presente' }))}
                      className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${batchStatuses[student.id] === 'presente'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-200'
                        }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => setBatchStatuses(prev => ({ ...prev, [student.id]: 'falta' }))}
                      className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${batchStatuses[student.id] === 'falta'
                        ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-rose-200'
                        }`}
                    >
                      Ausente
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              onClick={handleFinishBatchAttendance}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-save"></i>
              Salvar Chamada
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <Table<Student>
          data={students}
          columns={[
            {
              header: 'Aluno',
              accessor: (s) => (
                <button 
                  onClick={() => setShowHistory(showHistory === s.id ? null : s.id)}
                  className="flex items-center gap-3 text-left hover:bg-gray-50 p-2 -m-2 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <span className="text-sm">{s.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 group-hover:text-emerald-600 transition-all">{s.name}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">RA: {s.ra}</span>
                  </div>
                </button>
              )
            },
            {
              header: 'Turma / Turno',
              accessor: (s) => (
                <div className="flex flex-col gap-1">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100 w-fit">
                    {classes.find(c => c.id === s.classId)?.name || 'N/A'}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-lg border border-amber-100 w-fit">
                    {s.attendancePeriod || s.turno || 'Manhã'}
                  </span>
                </div>
              )
            },
            {
              header: 'Chamada Diária',
              accessor: (s) => {
                const dateStr = studentAttendanceDates[s.id] || new Date().toISOString().split('T')[0];
                const existingAttendance = getAttendanceForDate(s.id, dateStr, s.attendancePeriod || s.turno);

                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-2">
                    <div className="flex items-center gap-2">
                      {existingAttendance ? (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase ${existingAttendance.status === 'presente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                          <i className={`fa-solid ${existingAttendance.status === 'presente' ? 'fa-check' : 'fa-xmark'}`}></i>
                          {existingAttendance.status}
                          <button
                            onClick={() => handleAttendance(s.id, s.classId, existingAttendance.status === 'presente' ? 'falta' : 'presente')}
                            className="ml-2 text-[8px] underline opacity-50 hover:opacity-100"
                          >
                            Alterar
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAttendance(s.id, s.classId, 'presente')}
                            className="px-3 py-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-100 active:scale-90 flex items-center gap-1"
                          >
                            <i className="fa-solid fa-check"></i> Presente
                          </button>
                          <button
                            onClick={() => handleAttendance(s.id, s.classId, 'falta')}
                            className="px-3 py-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-rose-100 active:scale-90 flex items-center gap-1"
                          >
                            <i className="fa-solid fa-xmark"></i> Ausente
                          </button>
                        </>
                      )}
                    </div>

                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => updateStudentDate(s.id, e.target.value)}
                      className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                    />
                  </div>
                )
              }
            },
            {
              header: 'Frequência',
              accessor: (s) => {
                const history = studentHistory(s.id);
                const total = history.length;
                const presents = history.filter(a => a.status === 'presente').length;
                const percentage = total > 0 ? Math.round((presents / total) * 100) : 100;

                return (
                  <button
                    onClick={() => setShowHistory(showHistory === s.id ? null : s.id)}
                    className="flex flex-col items-start gap-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-700">{percentage}%</span>
                      <span className="text-[9px] font-bold text-gray-400 group-hover:text-blue-600 transition-colors uppercase">Histórico</span>
                    </div>
                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </button>
                );
              }
            },
            {
              header: 'Ações',
              accessor: (s) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRegisterModal(s.id)}
                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 group shadow-sm"
                    title="Registrar Atividade/Observação"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  {onViewProfile && (
                    <button
                      onClick={() => onViewProfile(s.id)}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 group shadow-sm"
                      title="Ver Perfil / Notas"
                    >
                      <i className="fa-solid fa-graduation-cap"></i>
                    </button>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRegisterModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 space-y-6">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Novo Registro de Aluno</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {students.find(s => s.id === showRegisterModal)?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRegisterModal(null)} className="text-gray-400 hover:text-gray-900 p-2">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </header>

            <div className="space-y-6">
              <div className="flex gap-4 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                {(['atividade', 'observacao'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setIndividualRecord(prev => ({ ...prev, type }))}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${individualRecord.type === type
                      ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {type === 'atividade' ? 'Atividade' : 'Observação'}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {individualRecord.type === 'atividade' ? 'Título da Atividade' : 'Assunto'}
                </label>
                <input
                  type="text"
                  value={individualRecord.value}
                  onChange={(e) => setIndividualRecord(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={individualRecord.type === 'atividade' ? "Ex: Exercício de Matemática" : "Ex: Comportamento em sala"}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição / Notas</label>
                <textarea
                  value={individualRecord.observation}
                  onChange={(e) => setIndividualRecord(prev => ({ ...prev, observation: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                />
              </div>

              <button
                onClick={() => handleSaveIndividual(showRegisterModal)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-save"></i>
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistory(null)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Histórico de Frequência</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {students.find(s => s.id === showHistory)?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowHistory(null)} className="text-gray-400 hover:text-gray-900">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {studentHistory(showHistory).length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <i className="fa-solid fa-calendar-xmark text-gray-200 text-4xl mb-4"></i>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest px-8">Nenhuma chamada registrada para este aluno</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentHistory(showHistory).map(record => {
                    const student = students.find(s => s.id === showHistory);
                    return (
                      <div key={record.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-black text-gray-800">
                            {new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded-md">
                               <i className="fa-solid fa-clock mr-1"></i>
                               {student?.attendancePeriod || 'N/A'}
                             </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${record.status === 'presente' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {record.status === 'presente' ? 'Presente' : 'Ausente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
