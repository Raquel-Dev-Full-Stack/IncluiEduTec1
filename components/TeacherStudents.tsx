
import React, { useState, useEffect } from 'react';
import { Student, Class, Attendance, User, StudentRecord, SOSStrategy } from '../types';
import { supabase } from '../lib/supabaseClient';
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
  const [showGradesModal, setShowGradesModal] = useState<string | null>(null);
  const [isRegisteringAttendance, setIsRegisteringAttendance] = useState(false);

  // Estado para registro individual
  const [individualRecord, setIndividualRecord] = useState({
    type: 'atividade' as 'atividade' | 'observacao',
    value: '',
    observation: ''
  });

  const [showSOSModal, setShowSOSModal] = useState<string | null>(null);
  const [sosStrategies, setSosStrategies] = useState<SOSStrategy[]>([]);
  const [isLoadingSOS, setIsLoadingSOS] = useState(false);

  // Estado para lançar notas
  const [gradeRecord, setGradeRecord] = useState({
    bimester: '1º_bimestre',
    discipline: '',
    grade: '',
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
        s.turno?.toLowerCase() === 'integral' ||
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

  const handleSaveGrades = async (studentId: string) => {
    if (!gradeRecord.discipline || !gradeRecord.grade) {
      alert('Preencha a disciplina e a nota.');
      return;
    }

    const numericGrade = parseFloat(gradeRecord.grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      alert('Nota inválida. Insira um valor numérico entre 0 e 10.');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentNotas = student.notas || {};
    const bimesterNotas = currentNotas[gradeRecord.bimester] || {};
    
    const updatedNotas = {
      ...currentNotas,
      [gradeRecord.bimester]: {
        ...bimesterNotas,
        [gradeRecord.discipline]: {
          grade: numericGrade,
          observation: gradeRecord.observation
        }
      }
    };

    try {
      const { error } = await supabase
        .from('students')
        .update({ notas: updatedNotas })
        .eq('id', studentId);

      if (error) throw error;

      // Update local state directly to reflect immediately
      student.notas = updatedNotas;

      // Sincronizar com student_records para o gráfico de evolução
      onSaveStudentRecord({
        studentId,
        date: new Date().toISOString().split('T')[0],
        recordType: 'nota',
        value: gradeRecord.grade,
        observation: `${gradeRecord.discipline} - ${gradeRecord.bimester.replace('_', ' ')}`
      });

      setFeedback({ message: `Nota de ${gradeRecord.discipline} lançada com sucesso no ${gradeRecord.bimester.replace('_', ' ')}!`, type: 'success' });
      setShowGradesModal(null);
      setGradeRecord({ bimester: '1º_bimestre', discipline: '', grade: '', observation: '' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("Erro ao salvar notas:", err);
      alert('Ocorreu um erro ao salvar a nota. Tente novamente.');
    }
  };

  const handleOpenSOS = async (student: Student) => {
    if (!student.deficiency) {
      alert('Este aluno não possui tipo de deficiência registrado para consulta.');
      return;
    }

    setIsLoadingSOS(true);
    setShowSOSModal(student.id);

    try {
      const { data, error } = await supabase
        .from('knowledge_base_sos')
        .select('*')
        .eq('disability_type', student.deficiency);

      if (error) throw error;
      setSosStrategies(data || []);
    } catch (error) {
      console.error('Erro ao buscar estratégias:', error);
      setFeedback({ message: 'Erro ao carregar estratégias de adaptação.', type: 'error' });
    } finally {
      setIsLoadingSOS(false);
    }
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
              s.turno?.toLowerCase() === 'integral' || 
              selectedBatchTurno === 'Integral'
            ).length === 0 ? (
              <div className="col-span-full py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs font-bold uppercase">Nenhum aluno encontrado para o turno {selectedBatchTurno}.</p>
              </div>
            ) : (
              students.filter(s => 
                s.attendancePeriod === selectedBatchTurno || 
                s.turno?.toLowerCase() === 'integral' || 
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

      {/* Layout Mobile (Cartões) */}
      <div className="md:hidden space-y-4 px-2">
        {students.map((s) => {
          const dateStr = studentAttendanceDates[s.id] || new Date().toISOString().split('T')[0];
          const existingAttendance = getAttendanceForDate(s.id, dateStr, s.attendancePeriod || s.turno);
          const studentClassName = classes.find(c => c.id === s.classId)?.name || 'N/A';
          const studentShift = s.attendancePeriod || s.turno || 'Manhã';
          const history = studentHistory(s.id);
          const total = history.length;
          const presents = history.filter(a => a.status === 'presente').length;
          const percentage = total > 0 ? Math.round((presents / total) * 100) : 100;

          return (
            <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/50 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* 1. No topo: Nome e RA */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-gray-900 text-sm leading-tight">{s.name}</h4>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">RA: {s.ra}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistory(s.id)}
                  className="flex flex-col items-end gap-1"
                >
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{percentage}%</span>
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </button>
              </div>

              {/* 2. Turma e Turno */}
              <div className="flex flex-row gap-3">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100 flex items-center gap-1.5">
                  <i className="fa-solid fa-users-rectangle opacity-50"></i>
                  {studentClassName}
                </div>
                <div className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-lg border border-amber-100 flex items-center gap-1.5">
                  <i className="fa-solid fa-clock opacity-50"></i>
                  {studentShift}
                </div>
              </div>

              {/* 3. Chamada e Data */}
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status da Chamada</p>
                    {existingAttendance ? (
                      <div className={`flex items-center justify-between px-4 py-2 rounded-xl border text-[9px] font-black uppercase ${
                        existingAttendance.status === 'presente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        <span className="flex items-center gap-2">
                          <i className={`fa-solid ${existingAttendance.status === 'presente' ? 'fa-check' : 'fa-xmark'}`}></i>
                          {existingAttendance.status}
                        </span>
                        <button 
                          onClick={() => handleAttendance(s.id, s.classId, existingAttendance.status === 'presente' ? 'falta' : 'presente')}
                          className="text-[8px] underline opacity-60 font-bold"
                        >
                          Alterar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAttendance(s.id, s.classId, 'presente')}
                          className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase border border-emerald-100 active:scale-95 transition-all"
                        >
                          Presente
                        </button>
                        <button 
                          onClick={() => handleAttendance(s.id, s.classId, 'falta')}
                          className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase border border-rose-100 active:scale-95 transition-all"
                        >
                          Ausente
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-fit">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 text-right">Data</p>
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => updateStudentDate(s.id, e.target.value)}
                      className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 w-28 h-9"
                    />
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowRegisterModal(s.id)} className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 flex items-center justify-center transition-all active:scale-90"><i className="fa-solid fa-pen-to-square"></i></button>
                    <button onClick={() => onViewProfile?.(s.id)} className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center transition-all active:scale-90"><i className="fa-solid fa-graduation-cap"></i></button>
                    <button onClick={() => setShowGradesModal(s.id)} className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center transition-all active:scale-90"><i className="fa-solid fa-star-half-stroke"></i></button>
                    <button onClick={() => handleOpenSOS(s)} className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center transition-all active:scale-90"><i className="fa-solid fa-kit-medical"></i></button>
                  </div>
                  <button 
                    onClick={() => setShowHistory(s.id)}
                    className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    Ver Histórico <i className="fa-solid fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout Desktop (Tabela Original) */}
      <div className="hidden md:block bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
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
                      title="Ver Perfil do Aluno"
                    >
                      <i className="fa-solid fa-graduation-cap"></i>
                    </button>
                  )}
                  <button
                    onClick={() => setShowGradesModal(s.id)}
                    className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all border border-amber-100 group shadow-sm"
                    title="Lançar Notas"
                  >
                    <i className="fa-solid fa-star-half-stroke"></i>
                  </button>
                  <button
                    onClick={() => handleOpenSOS(s)}
                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 group shadow-sm"
                    title="SOS Adaptação"
                  >
                    <i className="fa-solid fa-kit-medical animate-pulse"></i>
                  </button>
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

      {showGradesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowGradesModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 space-y-6">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-star-half-stroke"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Lançar Notas</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {students.find(s => s.id === showGradesModal)?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowGradesModal(null)} className="text-gray-400 hover:text-gray-900 p-2">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </header>

            <div className="space-y-6">
              <div className="flex gap-4 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto custom-scrollbar">
                {(['1º_bimestre', '2º_bimestre', '3º_bimestre', '4º_bimestre'] as const).map(bimester => (
                  <button
                    key={bimester}
                    onClick={() => setGradeRecord(prev => ({ ...prev, bimester }))}
                    className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gradeRecord.bimester === bimester
                      ? 'bg-white text-amber-600 shadow-sm border border-amber-100'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {bimester.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Disciplina
                  </label>
                  <input
                    type="text"
                    value={gradeRecord.discipline}
                    onChange={(e) => setGradeRecord(prev => ({ ...prev, discipline: e.target.value }))}
                    placeholder="Ex: Matemática"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Nota
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={gradeRecord.grade}
                    onChange={(e) => setGradeRecord(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="Ex: 8.5"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações (Opcional)</label>
                <textarea
                  value={gradeRecord.observation}
                  onChange={(e) => setGradeRecord(prev => ({ ...prev, observation: e.target.value }))}
                  placeholder="Comentários sobre o desempenho..."
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none shadow-inner"
                />
              </div>

              <button
                onClick={() => handleSaveGrades(showGradesModal)}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-save"></i>
                Salvar Nota
              </button>

              {/* Lista de notas já lançadas */}
              {(() => {
                const student = students.find(s => s.id === showGradesModal);
                const notas = student?.notas?.[gradeRecord.bimester];
                if (!notas || Object.keys(notas).length === 0) return null;

                return (
                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Notas Registradas
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {Object.entries(notas).map(([disc, data]: [string, any]) => (
                        <div key={disc} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{disc}</p>
                            {data.observation && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{data.observation}</p>}
                          </div>
                          <div className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 font-black rounded-lg text-sm">
                            {data.grade}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
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

      {/* Modal SOS Adaptação */}
      {showSOSModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSOSModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="bg-rose-600 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                  <i className="fa-solid fa-kit-medical"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">SOS Adaptação</h3>
                  <p className="text-rose-100 text-[10px] font-black uppercase tracking-[0.2em]">Estratégias Pedagógicas Inclusivas</p>
                </div>
              </div>
              <button onClick={() => setShowSOSModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </header>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="mb-8 p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm font-bold text-lg">
                  {students.find(s => s.id === showSOSModal)?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Aluno(a)</p>
                  <h4 className="font-bold text-gray-900 text-lg leading-none">
                    {students.find(s => s.id === showSOSModal)?.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-700 text-[9px] font-black uppercase rounded-md">
                      {students.find(s => s.id === showSOSModal)?.deficiency || 'Não informada'}
                    </span>
                  </div>
                </div>
              </div>

              {isLoadingSOS ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Consultando Base de Conhecimento...</p>
                </div>
              ) : sosStrategies.length === 0 ? (
                <div className="py-16 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <i className="fa-solid fa-triangle-exclamation text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-400 text-xs font-bold uppercase px-12">Nenhuma estratégia específica encontrada para este perfil na base de dados.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sosStrategies.map((strategy, idx) => (
                    <div key={strategy.id} className="group relative">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-rose-200 rounded-full transition-all group-hover:bg-rose-500"></div>
                      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-rose-100">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">
                            BNCC: {strategy.bncc_code}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                            {idx + 1}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Estratégia de Mediação</h5>
                            <p className="text-gray-800 font-semibold leading-relaxed">
                              {strategy.strategy_description}
                            </p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <i className="fa-solid fa-lightbulb text-amber-400"></i>
                              Exemplo Prático de Adaptação
                            </h5>
                            <p className="text-gray-600 text-sm italic">
                              "{strategy.adaptation_example}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <footer className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center max-w-sm">
                Estas orientações baseiam-se no Guia de Avaliação Inclusiva e Legislação Vigente.
              </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
