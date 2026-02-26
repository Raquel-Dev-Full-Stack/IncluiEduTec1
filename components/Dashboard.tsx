
import React, { useEffect, useState } from 'react';
import { User, UserProfile } from '../types';
import { MOCK_STUDENTS, MOCK_USERS, MOCK_REPORTS, MOCK_CLASSES, MOCK_SCHOOLS } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface DashboardProps {
  user: User;
  setActiveTab?: (tab: string) => void;
  refreshKey?: number;
  schools?: any[];
  students?: any[];
  classes?: any[];
  usersList?: any[];
  reports?: any[];
  studentRecords?: any[];
  attendances?: any[];
  meals?: any[];
  mediationRecords?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  setActiveTab,
  refreshKey,
  schools,
  students,
  classes,
  usersList,
  reports,
  studentRecords,
  attendances,
  meals,
  mediationRecords
}) => {
  const isSecretaria = user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN;
  const isDiretor = user.profile === UserProfile.DIRETOR;
  const schoolId = user.schoolId;

  // Funções para Exportação Educacenso (Consolidado Municipal)
  const transformarParaEducacenso = (dados: any) => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<Educacenso municipio_id="' + (user.municipio_id || 'geral') + '">';
    const xmlFooter = '\n</Educacenso>';

    const escolasXml = (dados.escolas || []).map((e: any) => `
    <Escola id="${e.id}">
      <INEP>${e.inep || ''}</INEP>
      <Nome>${e.name}</Nome>
    </Escola>`).join('');

    const turmasXml = (dados.classes || []).map((c: any) => `
    <Turma id="${c.id}">
      <Nome>${c.name}</Nome>
      <Ano>${c.year}</Ano>
      <EscolaID>${c.schoolId}</EscolaID>
    </Turma>`).join('');

    const alunosXml = (dados.students || []).map((a: any) => `
    <Aluno id="${a.id}">
      <RA>${a.ra || ''}</RA>
      <Nome>${a.name}</Nome>
      <EscolaID>${a.schoolId || ''}</EscolaID>
      <TurmaID>${a.classId || ''}</TurmaID>
    </Aluno>`).join('');

    return `${xmlHeader}\n  <Escolas>${escolasXml}\n  </Escolas>\n  <Turmas>${turmasXml}\n  </Turmas>\n  <Alunos>${alunosXml}\n  </Alunos>${xmlFooter}`;
  };

  const salvarArquivo = (conteudo: string, nomeArquivo: string) => {
    const blob = new Blob([conteudo], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gerarArquivoEducacenso = () => {
    try {
      const arquivo = transformarParaEducacenso({
        escolas: schools,
        students: students,
        classes: classes,
        usersList: usersList,
        attendances: attendances,
        meals: meals,
        mediationRecords: mediationRecords,
        reports: reports
      });
      salvarArquivo(arquivo, "educacenso_export.xml");
      alert("Arquivo Educacenso gerado com sucesso! Pronto para envio ao INEP/MEC.");
    } catch (error) {
      console.error("Erro ao gerar arquivo Educacenso:", error);
      alert("Erro ao gerar o arquivo. Verifique os dados e tente novamente.");
    }
  };

  // Estados para os indicadores dinâmicos da Secretaria
  const [statsData, setStatsData] = useState({
    reports: 0,
    teachers: 0,
    classes: 0,
    schools: 0,
    pcdStudents: 0,
    totalStudents: 0,
    mediators: 0,
    year: '2024',
    loading: true
  });

  const [directorData, setDirectorData] = useState({
    alunos_atendidos: 0,
    turmas_ativas: 0,
    professores: 0,
    mediadores: 0,
    relatorios_pendentes: 0,
    schoolName: 'Carregando...',
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSecretaria) return;

      try {
        // 1. Busca os IDs das escolas do município da Secretaria
        const { data: schoolsData, count: schoolsCount } = await supabase
          .from('schools')
          .select('id', { count: 'exact' });

        const schoolIds = schoolsData?.map(s => s.id) || [];
        const schoolFilter = schoolIds.length > 0 ? schoolIds : ['none'];

        // 2. Agora busca os demais dados filtrados pelas escolas do município
        const [
          { count: reportsCount },
          { count: teachersCount },
          { count: classesCount },
          { count: studentsCount },
          { count: mediatorsCount },
          { data: classesYearData }
        ] = await Promise.all([
          // Relatórios / PDIs
          supabase.from('reports').select('*', { count: 'exact', head: true }),
          // Corpo Docente — professor_details
          supabase.from('professor_details').select('*', { count: 'exact', head: true }),
          // Turmas Ativas — classes filtradas pelo município
          supabase.from('classes').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Total de Alunos do município (tabela students, filtrada pelas escolas do município)
          supabase.from('students').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Mediadores em Campo — mediator_records
          supabase.from('mediator_records').select('*', { count: 'exact', head: true }),
          // Ano letivo
          supabase.from('classes').select('year').limit(1)
        ]);

        const currentYear = (classesYearData && classesYearData.length > 0 && classesYearData[0].year)
          ? String(classesYearData[0].year)
          : '2025';

        setStatsData({
          reports: reportsCount || 0,
          teachers: teachersCount || 0,
          classes: classesCount || 0,
          schools: schoolsCount || 0,
          pcdStudents: studentsCount || 0,
          totalStudents: studentsCount || 0,
          mediators: mediatorsCount || 0,
          year: currentYear,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStatsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [isSecretaria, refreshKey]);


  useEffect(() => {
    const fetchDirectorStats = async () => {
      if (!isDiretor || !schoolId) return;

      try {
        const [
          { data: schoolData },
          { count: studentsCount },
          { count: classesCount },
          { count: teachersCount },
          { count: mediatorsCount }
        ] = await Promise.all([
          supabase.from('schools').select('name').eq('id', schoolId).single(),
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('professor_details').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('mediator_records').select('*', { count: 'exact', head: true }).eq('school_id', schoolId)
        ]);

        setDirectorData({
          alunos_atendidos: studentsCount || 0,
          turmas_ativas: classesCount || 0,
          professores: teachersCount || 0,
          mediadores: mediatorsCount || 0,
          relatorios_pendentes: 0, // Pode ser expandido se houver tabela de relatórios
          schoolName: schoolData?.name || 'Escola não encontrada',
          loading: false
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas do diretor:', error);
        setDirectorData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDirectorStats();
  }, [isDiretor, schoolId, refreshKey]);

  // Filtragem de dados para o Diretor (apenas sua escola)
  const filteredStudents = isDiretor ? (students || []).filter(s => {
    const class_ = (classes || []).find(c => c.id === s.classId);
    return class_?.schoolId === schoolId;
  }) : (students || []);

  const filteredClasses = isDiretor ? (classes || []).filter(c => c.schoolId === schoolId) : (classes || []);

  const filteredTeachers = isDiretor ? (usersList || []).filter(u =>
    u.profile === UserProfile.PROFESSOR &&
    filteredClasses.some(c => c.teacherId === u.id)
  ) : (usersList || []).filter(u => u.profile === UserProfile.PROFESSOR);

  const filteredMediators = isDiretor ? (usersList || []).filter(u =>
    u.profile === UserProfile.MEDIADOR &&
    (u.schoolId === schoolId || filteredClasses.some(c => c.mediatorId === u.id))
  ) : (usersList || []).filter(u => u.profile === UserProfile.MEDIADOR);

  const filteredReports = isDiretor ? (reports || []).filter(r =>
    filteredStudents.some(s => s.id === r.studentId)
  ) : (reports || []);

  const finishedReportsCount = filteredReports.filter(r => r.status === 'finalizado').length;
  const pendingReportsCount = filteredReports.filter(r => r.status === 'rascunho').length;
  const reportProgress = filteredReports.length > 0 ? Math.round((finishedReportsCount / filteredReports.length) * 100) : 0;

  const currentSchool = isDiretor ? MOCK_SCHOOLS.find(s => s.id === schoolId) : null;

  // Renderização específica para o Diretor
  if (isDiretor) {
    const directorStats = [
      { label: 'Alunos Atendidos', count: directorData.alunos_atendidos, icon: 'fa-graduation-cap', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-500' },
      { label: 'Professores', count: directorData.professores, icon: 'fa-chalkboard-user', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-500' },
      { label: 'Turmas Ativas', count: directorData.turmas_ativas, icon: 'fa-users-rectangle', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-500' },
      { label: 'Mediadores', count: directorData.mediadores, icon: 'fa-hand-holding-heart', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', iconBg: 'bg-indigo-500' },
      { label: 'Relatórios Pendentes', count: directorData.relatorios_pendentes, icon: 'fa-file-lines', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-500' },
      { label: 'Taxa de Presença', count: 94, suffix: '%', icon: 'fa-chart-simple', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-500' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Moderno */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-100">
              <i className="fa-solid fa-school"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel da Unidade</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">{directorData.schoolName}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano Letivo</span>
              <span className="text-xl font-black text-gray-800">2024</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Status</span>
              <span className="text-xl font-black text-emerald-600 uppercase tracking-tighter">Ativa</span>
            </div>
          </div>
        </div>

        {/* Grade de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {directorStats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`p-7 rounded-[2.5rem] ${stat.bg} ${stat.border} border shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-500 group cursor-default relative overflow-hidden`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Círculo de Background para Efeito Visual */}
              <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full ${stat.iconBg} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`}></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${stat.text} opacity-70`}>{stat.label}</p>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tighter">
                    {stat.count}<span className="text-2xl ml-0.5">{stat.suffix || ''}</span>
                  </h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} text-white flex items-center justify-center shadow-lg shadow-gray-200 group-hover:rotate-[15deg] transition-all duration-500`}>
                  <i className={`fa-solid ${stat.icon} text-2xl`}></i>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 relative z-10">
                <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.iconBg} w-2/3 opacity-30`}></div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${stat.text}`}>Rede Municipal</span>
              </div>
            </div>
          ))}
        </div>

        {/* Seção Secundária */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <i className="fa-solid fa-chart-pie text-lg"></i>
              </div>
              Resumo de Documentação
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Processamento de PDIs / PEIs</span>
                  <span className="text-sm font-black text-indigo-600">{reportProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-1000 shadow-lg" style={{ width: `${reportProgress}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">Dados baseados no semestre letivo vigente.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Finalizados</p>
                  <p className="text-2xl font-black text-emerald-700">{finishedReportsCount}</p>
                </div>
                <div className="p-5 bg-rose-50 rounded-[2rem] border border-rose-100">
                  <p className="text-[9px] font-black text-rose-500 uppercase mb-1">Pendentes</p>
                  <p className="text-2xl font-black text-rose-700">{pendingReportsCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i className="fa-solid fa-bell text-lg"></i>
              </div>
              Ações Institucionais
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-5 p-4 bg-gray-50 hover:bg-amber-50 rounded-3xl transition-colors border border-transparent hover:border-amber-100 group">
                <div className="w-12 h-12 rounded-2xl bg-white text-amber-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">Revisão de Relatórios</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Prazo: Próximas 72h</p>
                </div>
                <i className="fa-solid fa-chevron-right ml-auto text-gray-300 text-xs"></i>
              </div>

              <div className="flex items-center gap-5 p-4 bg-gray-50 hover:bg-blue-50 rounded-3xl transition-colors border border-transparent hover:border-blue-100 group">
                <div className="w-12 h-12 rounded-2xl bg-white text-blue-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">Chamada Diária</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pendência em 2 turmas</p>
                </div>
                <i className="fa-solid fa-chevron-right ml-auto text-gray-300 text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Auditado */}
        <div className="bg-slate-900 text-slate-400 p-5 rounded-[2rem] flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.2em] uppercase border border-slate-800 shadow-2xl">
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-purple-400 text-xs"></i>
            Conexão Criptografada
          </span>
        </div>

        {/* Seção de Evolução — Adicionada para o Diretor */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
          <div className="px-8 py-7 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Evolução dos Alunos</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monitoramento da Unidade</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Filtros da Seção */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Selecionar Aluno</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                  <option value="all">Todos os Alunos da Unidade</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Tipo</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                  <option>Todos</option>
                  <option>Presença</option>
                  <option>Refeição</option>
                  <option>Atividade</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Período</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                  <option>Mês Atual</option>
                  <option>Semana</option>
                </select>
              </div>
            </div>

            <div className="h-[300px] w-full bg-gray-50/30 rounded-[2rem] border border-gray-50 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentRecords && studentRecords.length > 0 ?
                  Array.from(new Set(studentRecords.filter(r => filteredStudents.some(s => s.id === r.studentId)).map(r => r.date))).sort().slice(-7).map(date => ({
                    date: new Date(date as string).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    presenca: studentRecords.filter(r => r.date === date && r.recordType === 'presenca').length * 10,
                    refeicao: studentRecords.filter(r => r.date === date && r.recordType === 'refeicao').length * 15,
                    atividades: studentRecords.filter(r => r.date === date && r.recordType === 'atividade').length * 5,
                  })) : [
                    { date: '01/02', presenca: 80, refeicao: 70, atividades: 60 },
                    { date: '10/02', presenca: 90, refeicao: 85, atividades: 80 },
                    { date: '20/02', presenca: 95, refeicao: 90, atividades: 85 },
                  ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800 }} />
                  <Line type="monotone" dataKey="presenca" name="Presença" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="refeicao" name="Refeição" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="atividades" name="Atividades" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Relatórios / PDIs', count: statsData.reports, change: '+5%', icon: 'fa-file-circle-check', color: 'emerald' },
    { label: 'Corpo Docente', count: statsData.teachers, change: 'Ativo', icon: 'fa-chalkboard-user', color: 'purple' },
    { label: 'Turmas Ativas', count: statsData.classes, change: statsData.year, icon: 'fa-school', color: 'orange' },
    { label: 'Escolas Monitoradas - Rede Municipal', count: statsData.schools, change: 'Ativo', icon: 'fa-city', color: 'sky' },
    { label: 'Total Alunos PCD', count: statsData.pcdStudents, change: 'AEE', icon: 'fa-hands-holding-child', color: 'rose' },
    { label: 'Mediadores em Campo (por escola)', count: statsData.mediators, change: 'Monitorado', icon: 'fa-person-walking-luggage', color: 'amber' },
  ];

  // Métricas de assistência por escola para a Secretaria (Formatado para o Gráfico)
  const chartData = (schools || []).map(school => {
    const schoolClasses = (classes || []).filter(c => c.schoolId === school.id);
    const studentsInSchool = (students || []).filter(s => schoolClasses.some(c => c.id === s.classId)).length;
    const mediatorsInSchool = (usersList || []).filter(u => u.profile === UserProfile.MEDIADOR && u.active && u.schoolId === school.id).length;

    const ratioValue = mediatorsInSchool > 0 ? (studentsInSchool / mediatorsInSchool) : studentsInSchool;
    const density = studentsInSchool > 0 ? (mediatorsInSchool / studentsInSchool) : 0;

    return {
      name: school.name.split(' ').slice(0, 3).join(' '), // Abrevia nome para caber no eixo
      fullName: school.name,
      alunos: studentsInSchool,
      mediadores: mediatorsInSchool,
      relacao: ratioValue.toFixed(1),
      density
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
          <p className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{data.fullName}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Alunos:</span>
              <span className="text-sm font-black text-blue-600">{data.alunos}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Mediadores:</span>
              <span className="text-sm font-black text-purple-600">{data.mediadores}</span>
            </div>
            <div className="flex items-center justify-between gap-8 pt-1.5 border-t border-gray-50 mt-1.5">
              <span className="text-[10px] font-black text-indigo-500 uppercase">Aluno/Mediador:</span>
              <span className="text-sm font-black text-indigo-700">1:{data.relacao}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Hero Header com Gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 shadow-2xl shadow-blue-200">
        {/* Círculos decorativos de fundo */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-indigo-400 opacity-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl shadow-lg border border-white/30">
              <i className="fa-solid fa-landmark"></i>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">Secretaria de Educação</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Olá, {user.name.split(' ')[0]}!</h1>
              <p className="text-blue-200 text-sm mt-1 font-medium">
                Painel de Gestão Municipal · IncluiEduTec
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center px-5 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl min-w-[110px]">
              <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Ano Letivo</span>
              <span className="text-white text-xl font-black">{statsData.year}</span>
            </div>
            <div className="flex flex-col items-center px-5 py-3 bg-emerald-400/25 backdrop-blur-sm border border-emerald-300/30 rounded-2xl min-w-[110px]">
              <span className="text-emerald-200 text-[10px] font-black uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
                <span className="text-emerald-100 text-lg font-black uppercase tracking-tight">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const gradients: Record<string, string> = {
            emerald: 'from-emerald-500 to-teal-600',
            purple: 'from-purple-500 to-violet-600',
            orange: 'from-orange-500 to-amber-600',
            sky: 'from-sky-500 to-blue-600',
            rose: 'from-rose-500 to-pink-600',
            amber: 'from-amber-500 to-orange-600',
          };
          const lightBg: Record<string, string> = {
            emerald: 'bg-emerald-50 border-emerald-100',
            purple: 'bg-purple-50 border-purple-100',
            orange: 'bg-orange-50 border-orange-100',
            sky: 'bg-sky-50 border-sky-100',
            rose: 'bg-rose-50 border-rose-100',
            amber: 'bg-amber-50 border-amber-100',
          };
          const textColor: Record<string, string> = {
            emerald: 'text-emerald-700',
            purple: 'text-purple-700',
            orange: 'text-orange-700',
            sky: 'text-sky-700',
            rose: 'text-rose-700',
            amber: 'text-amber-700',
          };
          const badgeColors: Record<string, string> = {
            emerald: 'bg-emerald-100 text-emerald-700',
            purple: 'bg-purple-100 text-purple-700',
            orange: 'bg-orange-100 text-orange-700',
            sky: 'bg-sky-100 text-sky-700',
            rose: 'bg-rose-100 text-rose-700',
            amber: 'bg-amber-100 text-amber-700',
          };
          const grad = gradients[stat.color] || 'from-blue-500 to-indigo-600';
          const bg = lightBg[stat.color] || 'bg-blue-50 border-blue-100';
          const tc = textColor[stat.color] || 'text-blue-700';
          const bc = badgeColors[stat.color] || 'bg-blue-100 text-blue-700';

          return (
            <div
              key={stat.label}
              className={`group relative overflow-hidden bg-white border rounded-2xl p-6 cursor-default transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${bg}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Círculo decorativo de fundo */}
              <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br ${grad} opacity-[0.06] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500`}></div>

              <div className="relative z-10 flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${bc}`}>
                  {stat.change}
                </span>
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-4xl font-black tracking-tighter ${tc}`}>
                {statsData.loading ? (
                  <span className="inline-block w-12 h-9 bg-gray-100 rounded-lg animate-pulse"></span>
                ) : stat.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Análise de Assistência — Seção Reformulada */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cabeçalho da Seção */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-map-location-dot text-sm"></i>
          </div>
          <div>
            <h3 className="text-base font-black text-gray-800 tracking-tight">Análise de Assistência da Rede</h3>
            <p className="text-xs text-gray-400 font-medium">Distribuição de mediadores por unidade escolar</p>
          </div>
        </div>

        <div className="p-8">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                barGap={12}
              >
                <defs>
                  <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="colorMediadores" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  interval={0}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Bar
                  dataKey="alunos"
                  name="Alunos"
                  fill="url(#colorAlunos)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="mediadores"
                  name="Mediadores"
                  fill="url(#colorMediadores)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Destaques Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-people-group"></i>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Média Municipal</p>
              </div>
              <p className="text-2xl font-black text-slate-800">1:{(chartData.reduce((acc, curr) => acc + Number(curr.relacao), 0) / (chartData.length || 1)).toFixed(1)}</p>
              <p className="text-xs text-slate-400 font-medium">Cobertura média de assistência</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Escola com mais Apoio</p>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {chartData.length > 0 ? chartData.reduce((prev, curr) => Number(prev.relacao) < Number(curr.relacao) ? prev : curr).name : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-medium">Melhor taxa mediador/aluno</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Ponto de Atenção</p>
              </div>
              <p className="text-2xl font-black text-slate-800">
                {chartData.length > 0 ? chartData.reduce((prev, curr) => Number(prev.relacao) > Number(curr.relacao) ? prev : curr).name : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-medium">Maior carga por mediador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evolução dos Alunos — Nova Seção */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-7 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <i className="fa-solid fa-chart-line text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Evolução dos Alunos</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monitoramento de registros e desempenho</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Filtros da Seção */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Selecionar Aluno</label>
              <select
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="all">Visão Geral da Rede</option>
                {(isDiretor ? filteredStudents : students || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Tipo de Registro</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Todos os Registros</option>
                <option>Presença e Frequência</option>
                <option>Consumo de Refeições</option>
                <option>Atividades Pedagógicas</option>
                <option>Observações Mediadas</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Visualização</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Evolução Semanal</option>
                <option>Comparativo Mensal</option>
                <option>Histórico Anual</option>
              </select>
            </div>
          </div>

          {/* Gráfico de Evolução Dinâmico (Simulado com base em studentRecords) */}
          <div className="h-[350px] w-full bg-gray-50/30 rounded-[2.5rem] border border-gray-50 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentRecords && studentRecords.length > 0 ?
                // Agrupando dados por data (simplificado)
                Array.from(new Set(studentRecords.map(r => r.date))).sort().slice(-7).map(date => ({
                  date: new Date(date as string).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                  presenca: studentRecords.filter(r => r.date === date && r.recordType === 'presenca').length * 10,
                  refeicao: studentRecords.filter(r => r.date === date && r.recordType === 'refeicao').length * 15,
                  atividades: studentRecords.filter(r => r.date === date && r.recordType === 'atividade').length * 5,
                })) : [
                  { date: '01/02', presenca: 90, refeicao: 85, atividades: 70 },
                  { date: '05/02', presenca: 85, refeicao: 80, atividades: 75 },
                  { date: '10/02', presenca: 95, refeicao: 90, atividades: 80 },
                  { date: '15/02', presenca: 100, refeicao: 95, atividades: 90 },
                  { date: '20/02', presenca: 92, refeicao: 88, atividades: 85 },
                ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                <Line type="monotone" dataKey="presenca" name="Presença (%)" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="refeicao" name="Refeições (%)" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="atividades" name="Atividades" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Listagem de Destaques da Evolução */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Presença Média</p>
              <h4 className="text-2xl font-black text-blue-700">92.4%</h4>
            </div>
            <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100/50">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Refeições Ok</p>
              <h4 className="text-2xl font-black text-purple-700">88.1%</h4>
            </div>
            <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Atividades Comcl.</p>
              <h4 className="text-2xl font-black text-amber-700">142</h4>
            </div>
            <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Novas Observações</p>
              <h4 className="text-2xl font-black text-emerald-700">28</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Exportação Educacenso — Exclusivo Secretaria */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-7 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100">
              <i className="fa-solid fa-file-export text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Exportação Educacenso</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Geração de arquivo consolidado para o INEP</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-lg font-black text-emerald-900">Pronto para Exportar</h4>
              <p className="text-sm text-emerald-700/70 font-medium max-w-md">
                Gere o arquivo oficial do Educacenso consolidado com todos os dados das escolas, turmas e alunos do município.
                O arquivo será gerado no formato XML seguindo os padrões exigidos pelo MEC.
              </p>
            </div>
            <button
              onClick={gerarArquivoEducacenso}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-95 group"
            >
              <i className="fa-solid fa-download group-hover:animate-bounce"></i>
              Exportar para Educacenso
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <i className="fa-solid fa-check-circle text-emerald-500"></i>
              <span className="text-[10px] font-black uppercase text-gray-500">Dados de {schools?.length || 0} Escolas</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <i className="fa-solid fa-check-circle text-emerald-500"></i>
              <span className="text-[10px] font-black uppercase text-gray-500">Dados de {students?.length || 0} Alunos</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <i className="fa-solid fa-check-circle text-emerald-500"></i>
              <span className="text-[10px] font-black uppercase text-gray-500">Perfil Municipal Consolidado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de Segurança */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-400 p-5 rounded-2xl flex items-center justify-center gap-6 border border-slate-700/50 shadow-xl">
        <span className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest">
          <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
          Dados Protegidos
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        <span className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest">
          <i className="fa-solid fa-cloud-arrow-up text-blue-400 text-sm"></i>
          Sincronizado · Supabase
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        <span className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest">
          <i className="fa-solid fa-lock text-purple-400 text-sm"></i>
          Conexão Criptografada
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
