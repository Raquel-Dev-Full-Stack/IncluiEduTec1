
import React, { useState, useMemo } from 'react';
import { Student, Class, Attendance, User, MediationRecord } from '../types';
import Table from './Table';

interface MediatorStudentsProps {
  students: Student[];
  classes: Class[];
  attendances: Attendance[];
  mediationRecords: MediationRecord[];
  onSaveAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  onSaveMediationRecord: (record: Omit<MediationRecord, 'id'>) => void;
  currentUser: User;
}

const MediatorStudents: React.FC<MediatorStudentsProps> = ({ 
  students, 
  classes, 
  attendances, 
  mediationRecords,
  onSaveAttendance,
  onSaveMediationRecord,
  currentUser
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Estados para o card de Monitoramento Comportamental & Suporte (abaixo da tabela)
  const [targetStudentId, setTargetStudentId] = useState('');
  const [behaviorStatus, setBehaviorStatus] = useState('CALMO');
  const [hygiene, setHygiene] = useState('FEZ SOZINHO');
  const [feeding, setFeeding] = useState('FEZ SOZINHO');
  const [mobility, setMobility] = useState('FEZ SOZINHO');
  const [medication, setMedication] = useState('FEZ SOZINHO');
  const [interacted, setInteracted] = useState(false);
  const [participated, setParticipated] = useState(false);
  const [eyeContact, setEyeContact] = useState(false);
  const [observation, setObservation] = useState('');

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);
  
  const studentRecords = useMemo(() => 
    mediationRecords
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [mediationRecords, selectedStudentId]);

  const handleAttendance = (studentId: string, classId: string, status: 'presente' | 'falta') => {
    onSaveAttendance({
      studentId,
      classId,
      teacherId: currentUser.id,
      date: new Date().toISOString(),
      status
    });
    setFeedback(`Frequência registrada com sucesso.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveGeneralMediation = () => {
    if (!targetStudentId) {
      alert('Selecione um aluno para salvar o registro.');
      return;
    }

    const student = students.find(s => s.id === targetStudentId);

    onSaveMediationRecord({
      studentId: targetStudentId,
      classId: student?.classId,
      date: new Date().toISOString(),
      behaviorStatus,
      hygiene,
      feeding,
      mobility,
      medication,
      interactedStudents: interacted ? 'SIM' : 'NÃO',
      groupActivity: participated ? 'SIM' : 'NÃO',
      eyeContact: eyeContact ? 'SIM' : 'NÃO',
      description: observation,
      status: 'Finalizado',
      authorId: currentUser.id,
      type: 'Comportamental'
    });

    setObservation('');
    setFeedback('Monitoramento registrado com sucesso.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const getTodayStatus = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendances.find(a => a.studentId === studentId && a.date.startsWith(today));
  };

  if (selectedStudentId && selectedStudent) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
        <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSelectedStudentId(null)}
              className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all border border-gray-100"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Prontuário do Aluno</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                Visualizando registros de: <span className="text-blue-600">{selectedStudent.name}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
             <div className="bg-slate-900 rounded-[3rem] p-8 text-white min-h-[400px]">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <i className="fa-solid fa-history"></i>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Histórico de Registros</h3>
                </div>
                
                <div className="space-y-6">
                  {studentRecords.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-12">Nenhum registro encontrado.</p>
                  ) : (
                    studentRecords.map((record) => (
                      <div key={record.id} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2.5 py-1 rounded-lg">
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-300 leading-relaxed">"{record.description}"</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           <span className="px-2 py-0.5 bg-slate-700 rounded text-[9px] font-bold">Estado: {record.behaviorStatus}</span>
                           <span className="px-2 py-0.5 bg-slate-700 rounded text-[9px] font-bold">Interação: {record.interactedStudents}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-100">
            <i className="fa-solid fa-children"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meus Alunos</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão Individualizada e Acompanhamento Inclusivo</p>
          </div>
        </div>
        {feedback && (
          <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase animate-bounce">
            <i className="fa-solid fa-check-circle mr-2"></i> {feedback}
          </div>
        )}
      </header>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <Table<Student>
          data={students}
          columns={[
            {
              header: 'Aluno PCD / TEA',
              accessor: (s) => (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{s.name}</span>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{s.deficiency}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'Turma',
              accessor: (s) => (
                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-lg border border-gray-100">
                  {classes.find(c => c.id === s.classId)?.name || 'N/A'}
                </span>
              )
            },
            {
              header: 'Chamada Hoje',
              accessor: (s) => {
                const today = getTodayStatus(s.id);
                return (
                  <div className="flex items-center gap-2">
                    {today ? (
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${
                        today.status === 'presente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {today.status}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAttendance(s.id, s.classId, 'presente')} 
                          className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          onClick={() => handleAttendance(s.id, s.classId, 'falta')} 
                          className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            },
            {
              header: 'Ação',
              accessor: (s) => (
                <button 
                  onClick={() => setSelectedStudentId(s.id)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2 border border-indigo-500/20 group"
                >
                  <i className="fa-solid fa-notes-medical group-hover:scale-110 transition-transform"></i> 
                  Prontuário
                </button>
              )
            }
          ]}
        />
      </div>

      {/* NOVO CARD: Monitoramento Comportamental & Suporte */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-5 border-b border-gray-50 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
            <i className="fa-solid fa-heart-pulse"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Monitoramento Comportamental & Suporte</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Registro rápido de suporte e interação social</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Seleção de Aluno */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno Alvo *</label>
              <select 
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecione o Aluno...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Registro / Histórico */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registro de Histórico / Atividade</label>
              <textarea 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Descreva o suporte oferecido ou intercorrências do período..."
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
              ></textarea>
            </div>

            {/* Interação Social */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interação Social</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Interagiu com alunos', state: interacted, setter: setInteracted },
                  { label: 'Participou de atividade coletiva', state: participated, setter: setParticipated },
                  { label: 'Manteve contato visual', state: eyeContact, setter: setEyeContact },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 group ${
                      item.state ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${item.state ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300'}`}>
                      <i className={`fa-solid ${item.state ? 'fa-check' : 'fa-minus'} text-xs`}></i>
                    </div>
                    <span className={`text-[9px] font-black uppercase leading-tight ${item.state ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Estado Comportamental */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado Comportamental Atual</label>
              <div className="grid grid-cols-2 gap-2">
                {['CALMO', 'AGITADO', 'EM CRISE', 'ENGAJADO'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setBehaviorStatus(status)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      behaviorStatus === status 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistência Física */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assistência Física (Autonomia)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Higiene / Banheiro', state: hygiene, setter: setHygiene, icon: 'fa-restroom' },
                  { label: 'Alimentação / Lanche', state: feeding, setter: setFeeding, icon: 'fa-utensils' },
                  { label: 'Mobilidade / Locomoção', state: mobility, setter: setMobility, icon: 'fa-person-walking' },
                  { label: 'Administração de Medicação', state: medication, setter: setMedication, icon: 'fa-pills' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                      <i className={`fa-solid ${item.icon} text-indigo-400`}></i> {item.label}
                    </p>
                    <div className="flex gap-2">
                      {['FEZ SOZINHO', 'COM AUXÍLIO'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => item.setter(opt)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                            item.state === opt 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-400'
                          }`}
                        >
                          {opt === 'FEZ SOZINHO' ? 'Sozinho' : 'Auxílio'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveGeneralMediation}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              Salvar Registro de Monitoramento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediatorStudents;
