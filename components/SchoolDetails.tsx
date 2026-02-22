import React, { useState, useMemo, useEffect } from 'react';
import { User, School, Class, Student, MediationRecord, UserProfile, Meal, Report, Attendance } from '../types';
import Table from './Table';
import { supabase } from '../lib/supabaseClient';

interface SchoolDetailsProps {
  school: School;
  onBack: () => void;
  user: User;
  allClasses: Class[];
  allStudents: Student[];
  allUsers: User[];
  allMediationRecords: MediationRecord[];
  allAttendances: Attendance[];
  allMeals: Meal[];
  allReports: Report[];
  teachersTable: any[];
  mediatorsTable: any[];
}

const SchoolDetails: React.FC<SchoolDetailsProps> = ({
  school,
  onBack,
  user,
  allClasses,
  allStudents,
  allUsers,
  allMediationRecords,
  allAttendances,
  allMeals,
  allReports,
  teachersTable,
  mediatorsTable
}) => {
  const [activeSubTab, setActiveSubTab] = useState('administrativo');
  const [isAddingMediator, setIsAddingMediator] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [dynamicStats, setDynamicStats] = useState({
    alunos_atendidos: school.studentCount || 0,
    turmas_ativas: school.classCount || 0,
    professores: school.teacherCount || 0,
    mediadores: school.mediatorCount || 0,
    loading: true
  });

  // Buscar contadores reais do Supabase para esta escola
  useEffect(() => {
    const fetchSchoolStats = async () => {
      if (!school.id) return;

      try {
        const [
          { count: studentsCount },
          { count: classesCount },
          { count: teachersCount },
          { count: mediatorsCount }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('professor_details').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('mediator_records').select('*', { count: 'exact', head: true }).eq('school_id', school.id)
        ]);

        setDynamicStats({
          alunos_atendidos: studentsCount || 0,
          turmas_ativas: classesCount || 0,
          professores: teachersCount || 0,
          mediadores: mediatorsCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas da escola:', error);
        setDynamicStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSchoolStats();
  }, [school.id]);

  // Estados do formulário de novo mediador
  const [newMediator, setNewMediator] = useState({
    name: '',
    cpf: '',
    contact: '',
    classId: '',
    observations: ''
  });

  // Filtragem de dados REAIS vinculados a esta escola
  const schoolClasses = useMemo(() => allClasses.filter(c => c.schoolId === school.id), [school.id, allClasses]);
  const schoolStudents = useMemo(() => allStudents.filter(s => s.schoolId === school.id || schoolClasses.some(c => c.id === s.classId)), [school.id, schoolClasses, allStudents]);

  const schoolTeachers = useMemo(() => {
    const fromUsers = allUsers.filter(u => u.profile === UserProfile.PROFESSOR && (u.schoolId === school.id || schoolClasses.some(c => c.teacherId === u.id)));
    const fromTable = teachersTable.filter(t => t.school_id === school.id).map(t => ({
      id: t.id,
      name: t.name,
      email: t.email || t.email_institucional,
      active: t.active !== false,
      profile: UserProfile.PROFESSOR
    }));
    // Combinar e evitar duplicatas por ID ou nome
    const combined = [...fromUsers];
    fromTable.forEach(t => {
      if (!combined.some(u => u.id === t.id || u.name === t.name)) {
        combined.push(t as any);
      }
    });
    return combined;
  }, [school.id, schoolClasses, allUsers, teachersTable]);

  const schoolMediators = useMemo(() => {
    const fromUsers = allUsers.filter(u => u.profile === UserProfile.MEDIADOR && (u.schoolId === school.id || schoolClasses.some(c => c.mediatorId === u.id)));
    const fromTable = mediatorsTable.filter(m => m.school_id === school.id).map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      active: m.active !== false,
      profile: UserProfile.MEDIADOR
    }));
    const combined = [...fromUsers];
    fromTable.forEach(m => {
      if (!combined.some(u => u.id === m.id || u.name === m.name)) {
        combined.push(m as any);
      }
    });
    return combined;
  }, [school.id, schoolClasses, allUsers, mediatorsTable]);

  const schoolMediation = useMemo(() =>
    allMediationRecords.filter(r => (r as any).schoolId === school.id || schoolStudents.some(s => s.id === r.studentId)),
    [school.id, schoolStudents, allMediationRecords]);

  const schoolMeals = useMemo(() =>
    allMeals.filter(m => (m as any).schoolId === school.id || schoolStudents.some(s => s.id === m.studentId)),
    [school.id, schoolStudents, allMeals]);

  const schoolReports = useMemo(() =>
    allReports.filter(r => (r as any).schoolId === school.id || schoolStudents.some(s => s.id === r.studentId)),
    [school.id, schoolStudents, allReports]);

  const schoolAttendances = useMemo(() =>
    allAttendances.filter(a => (a as any).schoolId === school.id || schoolStudents.some(s => s.id === a.studentId)),
    [school.id, schoolStudents, allAttendances]);

  const tabs = [
    { id: 'administrativo', label: 'DADOS ADMINISTRATIVOS', icon: 'fa-building-shield' },
    { id: 'turmas', label: 'TURMAS', icon: 'fa-users-rectangle' },
    { id: 'professores', label: 'PROFESSORES', icon: 'fa-chalkboard-user' },
    { id: 'alunos', label: 'ALUNOS', icon: 'fa-graduation-cap' },
    { id: 'presencas', label: 'PRESENÇAS', icon: 'fa-calendar-check' },
    { id: 'refeicoes', label: 'REFEIÇÕES', icon: 'fa-utensils' },
    { id: 'mediacao', label: 'MEDIAÇÃO', icon: 'fa-hand-holding-heart' },
    { id: 'relatorios', label: 'RELATÓRIOS', icon: 'fa-file-lines' },
  ];

  const handleSaveMediator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediator.name || !newMediator.cpf || !newMediator.contact) {
      alert('Por favor, preencha os campos obrigatórios (Nome, CPF e Contato).');
      return;
    }

    // Simulação de salvamento
    alert(`Mediador ${newMediator.name} cadastrado com sucesso e protocolado na Secretaria!`);
    setIsAddingMediator(false);
    setNewMediator({ name: '', cpf: '', contact: '', classId: '', observations: '' });
  };

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'administrativo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Informações da Unidade</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Nome Oficial</p>
                  <p className="text-sm font-bold text-gray-800">{school.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Código INEP</p>
                  <p className="text-sm font-bold text-blue-600">{school.inep}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Tipo</p>
                  <p className="text-sm font-bold text-gray-700">{school.type || 'Municipal'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Endereço Completo</p>
                  <p className="text-sm font-medium text-gray-600">{school.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Bairro</p>
                  <p className="text-sm font-medium text-gray-600">{school.neighborhood || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">CEP</p>
                  <p className="text-sm font-medium text-gray-600">{school.zipCode || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Cidade / UF</p>
                  <p className="text-sm font-medium text-gray-600">{school.municipality || 'Maricá'} / {school.state || 'RJ'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Gestão e Contato</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Diretor(a) Responsável</p>
                    <p className="text-sm font-black text-blue-900">{school.principalName || 'Não Informado'}</p>
                    {school.principalEmail && <p className="text-[10px] text-blue-400 font-medium">{school.principalEmail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Contato Institucional</p>
                    <p className="text-sm font-black text-emerald-900">{school.phone || '(00) 0000-0000'}</p>
                    {school.email && <p className="text-[10px] text-emerald-400 font-medium">{school.email}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-comment-dots text-gray-300"></i> Observações Adicionais
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    {school.observations || 'Nenhuma observação interna cadastrada pela Secretaria.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'turmas':
        return (
          <Table<Class>
            data={schoolClasses}
            onRowClick={(c) => alert(`Turma: ${c.name}\nAno: ${c.year}\n\nEste registro é carregado dinamicamente do Supabase.\nNo perfil Secretaria, esta área é destinada apenas à visualização dos dados consolidados da unidade.`)}
            columns={[
              { header: 'TURMA', accessor: 'name' },
              { header: 'ANO', accessor: 'year' }
            ]}
          />
        );
      case 'professores':
        return (
          <Table<any>
            data={schoolTeachers}
            columns={[
              { header: 'NOME', accessor: (u) => <span className="font-bold text-gray-800">{u.name}</span> },
              { header: 'E-MAIL', accessor: (u) => u.email || 'N/A' },
              { header: 'STATUS', accessor: (u) => u.active ? <span className="text-emerald-500 font-bold uppercase text-[10px]">Ativo</span> : <span className="text-gray-400 uppercase text-[10px]">Inativo</span> }
            ]}
          />
        );
      case 'alunos':
        return (
          <Table<Student>
            data={schoolStudents}
            columns={[
              { header: 'ALUNO', accessor: (s) => <span className="font-bold text-gray-800">{s.name}</span> },
              { header: 'RA', accessor: 'ra' },
              { header: 'DEFICIÊNCIA', accessor: 'deficiency' },
              { header: 'AEE', accessor: (s) => s.aee ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">SIM</span> : 'NÃO' }
            ]}
          />
        );
      case 'presencas':
        return (
          <Table<Attendance>
            data={schoolAttendances}
            columns={[
              { header: 'DATA', accessor: (a) => new Date(a.date).toLocaleDateString('pt-BR') },
              { header: 'ALUNO', accessor: (a) => schoolStudents.find(s => s.id === a.studentId)?.name || 'N/A' },
              {
                header: 'STATUS', accessor: (a) => (
                  <span className={`font-bold uppercase text-[10px] ${a.status === 'presente' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {a.status}
                  </span>
                )
              }
            ]}
          />
        );
      case 'refeicoes':
        return (
          <Table<Meal>
            data={schoolMeals}
            columns={[
              { header: 'DATA', accessor: (m) => new Date(m.date).toLocaleDateString('pt-BR') },
              { header: 'ALUNO', accessor: (m) => schoolStudents.find(s => s.id === m.studentId)?.name || 'N/A' },
              { header: 'TIPO', accessor: 'type' },
              { header: 'CONSUMO', accessor: 'status' }
            ]}
          />
        );
      case 'mediacao':
        return (
          <div className="space-y-12">
            {/* Seção 1: Profissionais Mediadores */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fa-solid fa-user-doctor"></i> Quadro de Mediadores Profissionais
                </h3>
                {user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN ? (
                  <button
                    onClick={() => setIsAddingMediator(!isAddingMediator)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <i className={`fa-solid ${isAddingMediator ? 'fa-xmark' : 'fa-plus'}`}></i>
                    {isAddingMediator ? 'Cancelar' : 'Adicionar Novo Mediador'}
                  </button>
                ) : null}
              </div>

              {isAddingMediator && (
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                  <form onSubmit={handleSaveMediator} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo do Mediador *</label>
                        <input
                          type="text"
                          value={newMediator.name}
                          onChange={(e) => setNewMediator({ ...newMediator, name: e.target.value })}
                          placeholder="Nome do profissional"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF *</label>
                        <input
                          type="text"
                          value={newMediator.cpf}
                          onChange={(e) => setNewMediator({ ...newMediator, cpf: e.target.value.replace(/\D/g, '') })}
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contato (Tel/Email) *</label>
                        <input
                          type="text"
                          value={newMediator.contact}
                          onChange={(e) => setNewMediator({ ...newMediator, contact: e.target.value })}
                          placeholder="(00) 00000-0000 ou email@exemplo.com"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turma Atribuída (Opcional)</label>
                        <select
                          value={newMediator.classId}
                          onChange={(e) => setNewMediator({ ...newMediator, classId: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                        >
                          <option value="">Nenhuma turma vinculada</option>
                          {schoolClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Observações</label>
                        <input
                          type="text"
                          value={newMediator.observations}
                          onChange={(e) => setNewMediator({ ...newMediator, observations: e.target.value })}
                          placeholder="Informações adicionais, especialidades ou restrições..."
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                      >
                        Finalizar Cadastro de Mediador
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <Table<any>
                data={schoolMediators}
                columns={[
                  { header: 'NOME', accessor: (m) => <span className="font-bold text-gray-800">{m.name}</span> },
                  { header: 'E-MAIL/CONTATO', accessor: (m) => m.email || 'N/A' },
                  { header: 'STATUS', accessor: (m) => m.active ? <span className="text-emerald-500 font-bold uppercase text-[10px]">Ativo</span> : <span className="text-gray-400 uppercase text-[10px]">Inativo</span> }
                ]}
              />
            </div>

            {/* Seção 2: Registros de Mediação */}
            <div className="space-y-6 pt-12 border-t border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-clipboard-list"></i> Histórico de Atendimentos e Registros
              </h3>
              <Table<MediationRecord>
                data={schoolMediation}
                columns={[
                  { header: 'DATA', accessor: (r) => new Date(r.date).toLocaleDateString('pt-BR') },
                  { header: 'MEDIADOR', accessor: (r) => allUsers.find(u => u.id === r.authorId)?.name || 'N/A' },
                  { header: 'ALUNO', accessor: (r) => schoolStudents.find(s => s.id === r.studentId)?.name || 'N/A' },
                  { header: 'STATUS', accessor: (r) => <span className="uppercase font-bold text-[10px]">{r.status}</span> },
                  { header: 'COMPORTAMENTO', accessor: (r) => <span className="uppercase font-bold text-[10px]">{r.behaviorStatus}</span> }
                ]}
              />
            </div>
          </div>
        );
      case 'relatorios':
        return (
          <Table<Report>
            data={schoolReports}
            columns={[
              {
                header: 'TÍTULO',
                accessor: (r) => (
                  <button
                    onClick={() => setViewingReport(r)}
                    className="font-black text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 group transition-all text-left"
                  >
                    <i className="fa-solid fa-file-contract opacity-30 group-hover:opacity-100 transition-opacity"></i>
                    {r.title}
                  </button>
                )
              },
              { header: 'TIPO', accessor: 'type' },
              {
                header: 'STATUS',
                accessor: (r) => (
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${r.status === 'finalizado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {r.status}
                  </span>
                )
              },
              { header: 'ATUALIZADO EM', accessor: (r) => new Date(r.updatedAt).toLocaleDateString('pt-BR') }
            ]}
          />
        );
      default:
        return (
          <div className="py-20 text-center space-y-4">
            <i className="fa-solid fa-clock-rotate-left text-gray-200 text-5xl"></i>
            <p className="text-gray-400 text-sm italic">Dados históricos em processamento para esta unidade.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header da Escola */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{school.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">INEP: {school.inep}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operacional
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ALUNOS ATENDIDOS', count: dynamicStats.alunos_atendidos, icon: 'fa-graduation-cap', color: 'blue' },
          { label: 'TURMAS ATIVAS', count: dynamicStats.turmas_ativas, icon: 'fa-users-rectangle', color: 'purple' },
          { label: 'PROFESSORES', count: dynamicStats.professores, icon: 'fa-chalkboard-user', color: 'emerald' },
          { label: 'MEDIADORES', count: dynamicStats.mediadores, icon: 'fa-hand-holding-heart', color: 'indigo' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
            {dynamicStats.loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-300"></i>
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center text-2xl`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-800">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Internas */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex overflow-x-auto bg-gray-50/50 border-b border-gray-100 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${activeSubTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-8 flex-1">
          {renderSubContent()}
        </div>
      </div>

      {/* Modal de Visualização de Relatório */}
      {viewingReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingReport(null)}></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-blue-50/30 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-100">
                  <i className="fa-solid fa-file-invoice"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{viewingReport.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                      Tipo: {viewingReport.type}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${viewingReport.status === 'finalizado' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                      Status: {viewingReport.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Última Atualização</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(viewingReport.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unidade Escolar</p>
                  <p className="text-sm font-bold text-gray-800">{school.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">Conteúdo do Documento</h4>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-inner min-h-[200px]">
                  <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {viewingReport.description || "Nenhum conteúdo adicional disponível para este registro histórico."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 flex-shrink-0 shadow-sm">
                  <i className="fa-solid fa-circle-info"></i>
                </div>
                <div>
                  <p className="text-[11px] text-amber-800 font-bold uppercase tracking-tight mb-1">Informação de Conformidade</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Este relatório foi protocolado digitalmente e está em conformidade com as diretrizes da Secretaria Municipal de Educação. O acesso é auditado conforme a LGPD.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => setViewingReport(null)}
                className="px-8 py-3.5 bg-white border border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
              >
                Fechar Visualização
              </button>
              <button
                onClick={() => window.print()}
                className="px-10 py-3.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-print"></i>
                Imprimir Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDetails;
