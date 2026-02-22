
import React, { useEffect, useState } from 'react';
import { User, UserProfile } from '../types';
import { MOCK_STUDENTS, MOCK_USERS, MOCK_REPORTS, MOCK_CLASSES, MOCK_SCHOOLS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface DashboardProps {
  user: User;
  setActiveTab?: (tab: string) => void;
  refreshKey?: number;
  schools?: any[];
  students?: any[];
  classes?: any[];
  usersList?: any[];
  reports?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  setActiveTab,
  refreshKey,
  schools,
  students,
  classes,
  usersList,
  reports
}) => {
  const isSecretaria = user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN;
  const isDiretor = user.profile === UserProfile.DIRETOR;
  const schoolId = user.schoolId;

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
            <i className="fa-solid fa-shield-halved text-emerald-500 text-xs"></i>
            Segurança de Dados
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-cloud-arrow-up text-blue-400 text-xs"></i>
            Sincronizado Supabase
          </span>
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

  // Métricas de assistência por escola para a Secretaria
  const schoolAssistanceMetrics = (schools || []).map(school => {
    const schoolClasses = (classes || []).filter(c => c.schoolId === school.id);
    const studentsInSchool = (students || []).filter(s => schoolClasses.some(c => c.id === s.classId)).length;
    const mediatorsInSchool = (usersList || []).filter(u => u.profile === UserProfile.MEDIADOR && u.active && u.schoolId === school.id).length;

    const ratioValue = mediatorsInSchool > 0 ? (studentsInSchool / mediatorsInSchool) : studentsInSchool;
    const displayRatio = mediatorsInSchool > 0 ? `1:${Math.ceil(ratioValue)}` : `0:${studentsInSchool}`;
    const isScarce = mediatorsInSchool === 0 ? studentsInSchool > 0 : ratioValue > 10;
    const density = studentsInSchool > 0 ? (mediatorsInSchool / studentsInSchool) : 0;

    return { ...school, studentsInSchool, mediatorsInSchool, displayRatio, isScarce, density };
  });

  const getHeatMapColor = (density: number) => {
    if (density === 0) return 'bg-slate-50 border-slate-200';
    if (density < 0.05) return 'bg-blue-50 border-blue-100 text-blue-700';
    if (density < 0.1) return 'bg-blue-100 border-blue-200 text-blue-800';
    if (density < 0.2) return 'bg-blue-200 border-blue-300 text-blue-900';
    return 'bg-blue-500 border-blue-600 text-white';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schoolAssistanceMetrics.map((school) => (
              <div
                key={school.id}
                className={`relative overflow-hidden rounded-2xl border-2 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${getHeatMapColor(school.density)}`}
              >
                {school.isScarce && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-lg shadow-rose-200 z-10">
                    <i className="fa-solid fa-triangle-exclamation text-[8px]"></i>
                    Escassez
                  </div>
                )}

                <div>
                  <h4 className="font-black text-sm mb-4 leading-snug pr-16">{school.name}</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium opacity-60">Alunos Matriculados</span>
                      <span className="text-sm font-black">{school.studentsInSchool}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium opacity-60">Mediadores Ativos</span>
                      <span className="text-sm font-black">{school.mediatorsInSchool}</span>
                    </div>
                    <div className="pt-2.5 mt-1 border-t border-current border-opacity-10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wide opacity-50">Mediador / Aluno</span>
                        <span className={`text-sm font-black ${school.isScarce ? 'text-rose-600' : ''}`}>
                          {school.displayRatio}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${school.density > 0.15 ? 'bg-white/70' : 'bg-current opacity-25'}`}
                    style={{ width: `${Math.min(school.density * 500, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-6 flex flex-wrap gap-5 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 w-full">Legenda de Densidade</p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-slate-50 border-2 border-slate-200"></span>
              <span className="text-xs font-semibold text-gray-500">Sem dados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-blue-50 border-2 border-blue-100"></span>
              <span className="text-xs font-semibold text-gray-500">Baixa Densidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-blue-200 border-2 border-blue-300"></span>
              <span className="text-xs font-semibold text-gray-500">Média Densidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-blue-500 border-2 border-blue-600"></span>
              <span className="text-xs font-semibold text-gray-500">Alta Densidade</span>
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
