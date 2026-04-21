import React from 'react';
import { Student, Class, User, Guardian } from '../types';

interface StudentDetailsViewProps {
  student: Student;
  studentClass: Class | undefined;
  mediator: User | undefined;
  regentTeacher?: User;
  onBack: () => void;
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ student, studentClass, mediator, regentTeacher, onBack }) => {
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Botão Voltar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-all shadow-sm">
          <i className="fa-solid fa-arrow-left"></i>
        </div>
        Voltar para Lista de Alunos
      </button>

      {/* Header do Perfil */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-200 dark:shadow-none shrink-0 mt-2">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{student.name}</h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.aee ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  {student.aee ? 'Atendimento AEE Ativo' : 'Sem AEE'}
                </span>
                {student.active !== false && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    Matrícula Ativa
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-barcode text-emerald-500"></i> Registro Acadêmico
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{student.ra || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-cake-candles text-emerald-500"></i> Nascimento
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{calculateAge(student.birthDate || student.birth_date)} ({formatDate(student.birthDate || student.birth_date)})</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-school text-emerald-500"></i> Turma Oficial
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{studentClass?.name || 'Não vinculada'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-layer-group text-emerald-500"></i> Série / Ano
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{student.grade || studentClass?.level || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Detalhamento Pedagógico e Clínico */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seção 1: Corpo Docente e Apoio */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Equipe de Apoio e Responsáveis Pedagógicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mediador(a) Inclusivo</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{mediator?.name || 'Sem mediador atribuído'}</p>
                </div>
              </div>
              <div className="p-5 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-lg shadow-purple-200 dark:shadow-none shrink-0">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Professor(a) Regente</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{regentTeacher?.name || 'Não identificado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Diagnóstico e Deficiência */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Perfil Clínico e Diagnóstico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deficiência Principal</p>
                <div className="p-5 bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                  <p className="text-sm font-black text-rose-600 dark:text-rose-400">{student.deficiency || 'Não informada'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Diagnóstico Detalhado (CID)</p>
                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-500">{student.diagnosis || 'Pendente de preenchimento'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Responsáveis */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Grupo Familiar / Responsáveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.guardians && student.guardians.length > 0 ? (
                student.guardians.map((guardian, idx) => (
                  <div key={idx} className="p-6 bg-gray-50/50 dark:bg-slate-800/40 rounded-[2rem] border border-gray-100 dark:border-slate-800/60 shadow-sm transition-all hover:border-emerald-200 dark:hover:border-emerald-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-user-group"></i>
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{guardian.relation}</span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-800 dark:text-white capitalize mb-3 italic">{guardian.name}</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-50 dark:border-slate-700 shadow-sm">
                        <i className="fa-solid fa-phone text-emerald-500"></i>
                        <span className="font-bold">{guardian.phone}</span>
                      </div>
                      {guardian.email && (
                        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-50 dark:border-slate-700 shadow-sm overflow-hidden">
                          <i className="fa-solid fa-envelope text-blue-500"></i>
                          <span className="truncate">{guardian.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                  <i className="fa-solid fa-users-slash text-gray-300 text-3xl mb-3 block"></i>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhum responsável cadastrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção 4: Descrição Pedagógica */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Observações e Descrição Pedagógica
            </h3>
            <div className="p-8 bg-gray-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-gray-100 dark:border-slate-800 italic text-gray-600 dark:text-slate-400 leading-relaxed text-sm relative">
               <div className="absolute top-4 left-4 text-gray-200 dark:text-slate-700 text-4xl opacity-50">
                  <i className="fa-solid fa-quote-left"></i>
               </div>
               <p className="relative z-10 px-6">
                {student.description || 'Nenhuma descrição detalhada disponível para este aluno no momento.'}
               </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Laudo e Dados do Sistema */}
        <div className="space-y-6">
          {/* Seção 5: Documentação */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Documentação Médica
            </h3>
            
            <div className={`p-8 rounded-[2rem] border-2 border-dashed ${student.hasMedicalReport ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800'}`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${student.hasMedicalReport ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-100' : 'bg-gray-200 dark:bg-slate-800 text-gray-400'}`}>
                  <i className={`fa-solid ${student.hasMedicalReport ? 'fa-file-medical' : 'fa-file-circle-xmark'}`}></i>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                    {student.hasMedicalReport ? 'Laudo Médico (CID)' : 'Laudo não anexado'}
                  </p>
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 mt-1 uppercase font-black tracking-widest">
                    {student.hasMedicalReport ? 'Documento PDF/IMG' : 'Pendente de validação'}
                  </p>
                </div>
                
                {student.hasMedicalReport && student.medicalReportUrl && (
                  <a
                    href={student.medicalReportUrl}
                    download={`laudo-${student.name.split(' ')[0]}`}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-download"></i>
                    Baixar Documento
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Seção 5: Regime e Matrícula */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Metadados do Sistema
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-clock text-blue-400"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Regime</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.schoolRegime || 'Parcial'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-sun text-amber-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Período</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.attendancePeriod || 'N/A'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-calendar-check text-emerald-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ano Matrícula</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.enrollment_year || student.year || '2026'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-magnifying-glass-chart text-indigo-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monitoramento</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{formatDate(student.last_monitoring_at) || 'Sem data'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsView;
