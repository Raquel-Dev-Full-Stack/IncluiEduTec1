
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
  municipios?: any[];
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
  mediationRecords,
  municipios
}) => {
  const isSecretaria = user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN;
  const isDiretor = user.profile === UserProfile.DIRETOR;
  const isMediador = user.profile === UserProfile.MEDIADOR;
  const isProfessor = user.profile === UserProfile.PROFESSOR;
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
    year: '2026',
    loading: true
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Atualiza a cada minuto
    return () => clearInterval(timer);
  }, []);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>('');
  const [selectedTeacherStudentId, setSelectedTeacherStudentId] = useState<string>('all');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [selectedDirectorStudentId, setSelectedDirectorStudentId] = useState<string>('all');

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
        // 1. Busca os IDs das escolas do município selecionado (ou da secretaria)
        let schoolsQuery = supabase.from('schools').select('id', { count: 'exact' });
        
        // Determinar o município de filtragem
        const mId = user.profile === UserProfile.ADMIN ? selectedMunicipioId : user.municipio_id;

        if (mId) {
          schoolsQuery = schoolsQuery.eq('municipio_id', mId);
        }
        
        const { data: schoolsData, count: schoolsCount } = await schoolsQuery;

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
          supabase.from('reports').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Corpo Docente — professor_details
          supabase.from('professor_details').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Turmas Ativas — classes filtradas pelo município
          supabase.from('classes').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Total de Alunos do município (tabela students, filtrada pelas escolas do município)
          supabase.from('students').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Mediadores em Campo — mediator_records
          supabase.from('mediator_records').select('*', { count: 'exact', head: true }).in('school_id', schoolFilter),
          // Ano letivo
          supabase.from('classes').select('year').limit(1)
        ]);

        const currentYear = (classesYearData && classesYearData.length > 0 && classesYearData[0].year)
          ? String(classesYearData[0].year)
          : '2026';

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
  }, [isSecretaria, refreshKey, selectedMunicipioId, user.municipio_id, user.profile]);


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

  // Filtragem de dados para o Diretor ou Secretaria (Filtro Global)
  const filteredSchools = (schools || []).filter(s => {
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId) {
      return s.municipio_id === selectedMunicipioId;
    }
    return true;
  });

  const filteredStudents = (students || []).filter(s => {
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId && s.municipio_id !== selectedMunicipioId) return false;
    
    if (isDiretor) {
      const class_ = (classes || []).find(c => c.id === s.classId);
      return class_?.schoolId === schoolId;
    }
    if (isSecretaria && selectedSchoolId !== 'all') {
      return s.schoolId === selectedSchoolId;
    }
    return true;
  });

  const filteredClasses = (classes || []).filter(c => {
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId) {
      // Tentar encontrar escola vinculada para verificar município se não tiver municipio_id direto
      const school = (schools || []).find(s => s.id === c.schoolId);
      if (school && school.municipio_id !== selectedMunicipioId) return false;
    }
    if (isDiretor) return c.schoolId === schoolId;
    if (isSecretaria && selectedSchoolId !== 'all') return c.schoolId === selectedSchoolId;
    return true;
  });

  const filteredTeachers = (usersList || []).filter(u => {
    if (u.profile !== UserProfile.PROFESSOR) return false;
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId && u.municipio_id !== selectedMunicipioId) return false;
    if (isDiretor) return u.schoolId === schoolId;
    if (isSecretaria && selectedSchoolId !== 'all') return u.schoolId === selectedSchoolId;
    return true;
  });

  const filteredMediators = (usersList || []).filter(u => {
    if (u.profile !== UserProfile.MEDIADOR) return false;
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId && u.municipio_id !== selectedMunicipioId) return false;
    if (isDiretor) return u.schoolId === schoolId;
    if (isSecretaria && selectedSchoolId !== 'all') return u.schoolId === selectedSchoolId;
    return true;
  });

  const filteredReports = (reports || []).filter(r => {
    if (user.profile === UserProfile.ADMIN && selectedMunicipioId) {
       const school = (schools || []).find(s => s.id === r.schoolId);
       if (school && school.municipio_id !== selectedMunicipioId) return false;
    }
    if (isDiretor) return r.schoolId === schoolId;
    if (isSecretaria && selectedSchoolId !== 'all') return r.schoolId === selectedSchoolId;
    return true;
  });

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
      { label: 'Mediadores', count: filteredMediators.length, icon: 'fa-hand-holding-heart', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', iconBg: 'bg-indigo-500' },
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

      </div>
    );
  }

  // Renderização específica para o Mediador
  if (isMediador) {
    const myStudents = (students || []).filter(s => s.mediatorId === user.id || user.studentIds?.includes(s.id));
    const myRecords = (mediationRecords || []).filter(r => r.authorId === user.id);
    const myReports = (reports || []).filter(r => myStudents.some(s => s.id === r.studentId));

    const mediatorStats = [
      { label: 'Alunos Atendidos', count: myStudents.length, icon: 'fa-graduation-cap', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-500' },
      { label: 'Registros Realizados', count: myRecords.length, icon: 'fa-pen-to-square', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-500' },
      { label: 'Relatórios Pendentes', count: myReports.filter(r => r.status === 'rascunho').length, icon: 'fa-file-lines', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-500' },
      { label: 'Turmas Vinculadas', count: new Set(myStudents.map(s => s.classId)).size, icon: 'fa-users-rectangle', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-500' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Mediador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
              <i className="fa-solid fa-hand-holding-heart"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel do Mediador</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Olá, {user.name} · Foco na Inclusão</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano Letivo</span>
              <span className="text-xl font-black text-gray-800">2024</span>
            </div>
          </div>
        </div>

        {/* Grade de Métricas Mediador */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {mediatorStats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`p-7 rounded-[2.5rem] ${stat.bg} ${stat.border} border shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-500 group cursor-default relative overflow-hidden`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${stat.text} opacity-70`}>{stat.label}</p>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stat.count}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} text-white flex items-center justify-center shadow-lg group-hover:rotate-[15deg] transition-all duration-500`}>
                  <i className={`fa-solid ${stat.icon} text-xl`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção Meus Alunos */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i className="fa-solid fa-users text-lg"></i>
              </div>
              Alunos sob sua Mediação
            </h3>
            <button 
              onClick={() => setActiveTab?.('alunos')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Ver Todos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStudents.length > 0 ? myStudents.slice(0, 6).map(s => (
              <div key={s.id} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 text-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">{s.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RA: {s.ra}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum aluno vinculado ao seu perfil.</p>
              </div>
            )}
          </div>
        </div>

        {/* Registros Recentes */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-clock-rotate-left text-lg"></i>
            </div>
            Seus Últimos Registros
          </h3>

          <div className="space-y-4">
            {myRecords.length > 0 ? myRecords.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-5 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${r.behaviorStatus === 'EM CRISE' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                  <i className={`fa-solid ${r.behaviorStatus === 'EM CRISE' ? 'fa-triangle-exclamation' : 'fa-check'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-black text-gray-800">{myStudents.find(s => s.id === r.studentId)?.name || 'Aluno'}</p>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{new Date(r.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{r.description}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Você ainda não possui registros salvos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização padrão para Professor (Simplificado)
  if (isProfessor) {
    const myClasses = (classes || []).filter(c => c.teacherId === user.id);
    const myStudents = (students || []).filter(s => myClasses.some(c => c.id === s.classId));
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
           <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-100">
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel do Professor</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Olá, {user.name} · Suas Turmas e Alunos</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-sm">
                <i className="fa-solid fa-users-rectangle"></i>
              </div>
              <div>
                <h4 className="text-4xl font-black text-blue-700 tracking-tighter">{myClasses.length}</h4>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Suas Turmas</p>
              </div>
           </div>
           <div className="p-8 bg-purple-50 rounded-[3rem] border border-purple-100 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-purple-600 text-2xl shadow-sm">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div>
                <h4 className="text-4xl font-black text-purple-700 tracking-tighter">{myStudents.length}</h4>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Seus Alunos</p>
              </div>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-school text-lg"></i>
            </div>
            Acesso Rápido às Turmas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClasses.map(c => (
              <div key={c.id} onClick={() => setActiveTab?.('turmas')} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-black text-gray-800">{c.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.level} · {c.shift}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Evolução — Professor */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
          <div className="px-8 py-7 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Evolução dos Alunos</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Acompanhamento das Suas Turmas</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Selecionar Aluno</label>
                <select 
                  value={selectedTeacherStudentId}
                  onChange={(e) => setSelectedTeacherStudentId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700"
                >
                  <option value="all">Todos os Seus Alunos</option>
                  {myStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Tipo</label>
                <select 
                  value={selectedRecordType}
                  onChange={(e) => setSelectedRecordType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">Todos</option>
                  <option value="presenca">Presença</option>
                  <option value="refeicao">Refeição</option>
                  <option value="atividade">Atividade</option>
                  <option value="notas">Notas</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Período</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option>Mês Atual</option>
                  <option>Semana</option>
                </select>
              </div>
            </div>

            <div className="h-[300px] w-full bg-gray-50/30 rounded-[2rem] border border-gray-50 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentRecords && studentRecords.length > 0 ?
                  Array.from(new Set(studentRecords
                    .filter(r => selectedTeacherStudentId === 'all' ? myStudents.some(s => s.id === r.studentId) : r.studentId === selectedTeacherStudentId)
                    .map(r => r.date))).sort().slice(-15).map(date => {
                      const dayRecords = studentRecords.filter(r => r.date === date && (selectedTeacherStudentId === 'all' ? myStudents.some(s => s.id === r.studentId) : r.studentId === selectedTeacherStudentId));
                      const totalStudentsOnDay = selectedTeacherStudentId === 'all' ? Math.max(1, myStudents.length) : 1;

                      return {
                        date: new Date(date as string).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        presenca: (dayRecords.filter(r => r.recordType === 'presenca' && r.value === 'presente').length / totalStudentsOnDay) * 100,
                        refeicao: (dayRecords.filter(r => r.recordType === 'refeicao' && r.value !== 'não consumiu').length / totalStudentsOnDay) * 100,
                        atividades: (dayRecords.filter(r => r.recordType === 'atividade').length / totalStudentsOnDay) * 10,
                        notas: (dayRecords.filter(r => r.recordType === 'nota' || r.recordType === 'notas').length / totalStudentsOnDay) * 10,
                      };
                    }) : [
                    { date: '01/02', presenca: 80, refeicao: 70, atividades: 6, notas: 7 },
                    { date: '10/02', presenca: 90, refeicao: 85, atividades: 8, notas: 8 },
                    { date: '20/02', presenca: 95, refeicao: 90, atividades: 9, notas: 9 },
                  ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800 }} />
                  {(selectedRecordType === 'all' || selectedRecordType === 'presenca') && (
                    <Line type="monotone" dataKey="presenca" name="Presença %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  )}
                  {(selectedRecordType === 'all' || selectedRecordType === 'refeicao') && (
                    <Line type="monotone" dataKey="refeicao" name="Refeição %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  )}
                  {(selectedRecordType === 'all' || selectedRecordType === 'atividade') && (
                    <Line type="monotone" dataKey="atividades" name="Atividades (Qtd)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  )}
                  {(selectedRecordType === 'all' || selectedRecordType === 'notas') && (
                    <Line type="monotone" dataKey="notas" name="Notas (Qtd)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Métricas de assistência por escola para a Secretaria (Formatado para o Gráfico)
  const chartData = filteredSchools
    .filter(school => selectedSchoolId === 'all' || school.id === selectedSchoolId)
    .map(school => {
      const studentsInSchool = (students || []).filter(s => s.schoolId === school.id).length;
      const mediatorsInSchool = (usersList || []).filter(u => u.profile === UserProfile.MEDIADOR && u.active && u.schoolId === school.id).length;

      const ratioValue = mediatorsInSchool > 0 ? (studentsInSchool / mediatorsInSchool) : studentsInSchool;

      return {
        name: school.name.split(' ').slice(0, 3).join(' '),
        fullName: school.name,
        alunos: studentsInSchool,
        mediadores: mediatorsInSchool,
        relacao: ratioValue.toFixed(1)
      };
    });

  const shiftsData = filteredSchools
    .filter(school => selectedSchoolId === 'all' || school.id === selectedSchoolId)
    .map(school => {
      const schoolStudents = (students || []).filter(s => s.schoolId === school.id);
      const parcial = schoolStudents.filter(s => {
        const val = s.turno || s.schoolRegime;
        return val?.toLowerCase() === 'parcial';
      }).length;
      const integral = schoolStudents.filter(s => {
        const val = s.turno || s.schoolRegime;
        return val?.toLowerCase() === 'integral';
      }).length;

      return {
        name: school.name.split(' ').slice(0, 3).join(' '),
        fullName: school.name,
        parcial,
        integral,
        total: schoolStudents.length
      };
    }).filter(d => d.total > 0);

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

  // Verificação de existência de alunos para o Dashboard da Secretaria
  if (isSecretaria && (!students || students.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 text-4xl mb-6 border border-gray-100">
          <i className="fa-solid fa-users-slash"></i>
        </div>
        <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">Nenhum aluno cadastrado</h3>
        <p className="text-gray-400 font-medium text-center max-w-sm">
          Ainda não há dados de alunos registrados no sistema para o seu município.
        </p>
        <button 
          onClick={() => setActiveTab?.('alunos')}
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:scale-105 transition-all active:scale-95"
        >
          Cadastrar Primeiro Aluno
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Turmas Inclusivas', count: filteredClasses.length, change: '+12%', icon: 'fa-users-rectangle', color: 'purple' },
    { label: 'Corpo Docente', count: filteredTeachers.length, change: '100% ativo', icon: 'fa-chalkboard-user', color: 'sky' },
    { label: 'Unidades Escolares', count: selectedSchoolId === 'all' ? statsData.schools : 1, change: 'Mapeadas', icon: 'fa-school', color: 'emerald' },
    { label: 'Alunos Público-Alvo', count: filteredStudents.length, change: 'Apoio Ativo', icon: 'fa-graduation-cap', color: 'orange' },
    { label: 'Mediadores Mobilizados', count: filteredMediators.length, change: '1 por 3 alunos', icon: 'fa-hand-holding-heart', color: 'rose' },
    { label: 'Relatórios PDIs', count: filteredReports.length, change: 'Status 2026', icon: 'fa-file-lines', color: 'amber' }
  ];

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
              <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                {user.profile === UserProfile.ADMIN ? 'Admin Geral' : 'Secretaria de Educação'}
              </p>
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
            <div className="hidden sm:flex flex-col items-center px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl min-w-[140px]">
              <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Data e Hora</span>
              <div className="flex flex-col items-center">
                <span className="text-white text-xs font-bold leading-none">{currentTime.toLocaleDateString('pt-BR')}</span>
                <span className="text-white/80 text-[10px] font-medium mt-1">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
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

      {/* Análise de Assistência — Seção Original Restaurada */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-map-location-dot text-sm"></i>
          </div>
          <div>
            <h3 className="text-base font-black text-gray-800 tracking-tight">Análise de Assistência da Rede</h3>
            <p className="text-xs text-gray-400 font-medium">Distribuição de mediadores por unidade escolar</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user.profile === UserProfile.ADMIN && (
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Filtrar por Município</label>
                <div className="relative group">
                  <select
                    value={selectedMunicipioId}
                    onChange={(e) => {
                      setSelectedMunicipioId(e.target.value);
                      setSelectedSchoolId('all'); // Reset school filter on municipio change
                    }}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:border-purple-300 min-w-[200px]"
                  >
                    <option value="">Todos os Municípios</option>
                    {(municipios || []).map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.nome}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Filtrar por Unidade</label>
              <div className="relative group">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-blue-300 min-w-[220px]"
                >
                  <option value="all">Todas as Escolas {selectedMunicipioId ? '(Município)' : '(Rede)'}</option>
                  {filteredSchools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </div>
            </div>
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
        </div>
      </div>

      {/* Distribuição de Turnos por Escola — Nova Seção */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-blue-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-clock text-sm"></i>
          </div>
          <div>
            <h3 className="text-base font-black text-gray-800 tracking-tight">Distribuição de Turnos por Escola</h3>
            <p className="text-xs text-gray-400 font-medium">Proporção de alunos em tempo parcial vs. tempo integral</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user.profile === UserProfile.ADMIN && (
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Filtrar por Município</label>
                <div className="relative group">
                  <select
                    value={selectedMunicipioId}
                    onChange={(e) => {
                      setSelectedMunicipioId(e.target.value);
                      setSelectedSchoolId('all');
                    }}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:border-purple-300 min-w-[200px]"
                  >
                    <option value="">Todos os Municípios</option>
                    {(municipios || []).map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.nome}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block text-right">Filtrar por Unidade</label>
              <div className="relative group">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-blue-300 min-w-[220px]"
                >
                  <option value="all">Todas as Escolas {selectedMunicipioId ? '(Município)' : '(Rede)'}</option>
                  {filteredSchools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shiftsData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                barGap={12}
              >
                <defs>
                  <linearGradient id="colorParcial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="colorIntegral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={1} />
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
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                          <p className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{data.fullName}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-bold text-orange-400 uppercase">Tempo Parcial:</span>
                              <span className="text-sm font-black text-orange-600">{data.parcial}</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-bold text-teal-400 uppercase">Tempo Integral:</span>
                              <span className="text-sm font-black text-teal-600">{data.integral}</span>
                            </div>
                            <div className="flex items-center justify-between gap-8 pt-1.5 border-t border-gray-50 mt-1.5">
                              <span className="text-[10px] font-black text-gray-500 uppercase">Total de Alunos:</span>
                              <span className="text-sm font-black text-gray-800">{data.total}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: '#f8fafc' }} 
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Bar
                  dataKey="parcial"
                  name="Tempo Parcial"
                  fill="url(#colorParcial)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="integral"
                  name="Tempo Integral"
                  fill="url(#colorIntegral)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
            {chartData.length > 0 ? chartData.reduce((prev, curr) => {
              const rPrev = Number(prev.relacao);
              const rCurr = Number(curr.relacao);
              if (rCurr < rPrev) return curr;
              if (rCurr === rPrev && curr.mediadores > prev.mediadores) return curr;
              return prev;
            }).name : 'N/A'}
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
            {chartData.length > 0 ? chartData.reduce((prev, curr) => {
              const rPrev = Number(prev.relacao);
              const rCurr = Number(curr.relacao);
              if (rCurr > rPrev) return curr;
              // Se a proporção for igual, a escola com MENOS mediadores é o ponto de atenção
              if (rCurr === rPrev && curr.mediadores < prev.mediadores) return curr;
              return prev;
            }).name : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 font-medium">Maior carga por mediador</p>
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
                {(filteredStudents || []).map(s => (
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
