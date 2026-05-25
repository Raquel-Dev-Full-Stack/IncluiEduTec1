import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import ActivityLogDashboard from './components/ActivityLogDashboard';
import ActivityLogsTab from './components/ActivityLogsTab';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import SchoolDetails from './components/SchoolDetails';
import SchoolRegistration from './components/SchoolRegistration';
import ClassRegistration from './components/ClassRegistration';
import StudentRegistration from './components/StudentRegistration';
import MediatorRegistration from './components/MediatorRegistration';
import MediatorDetails from './components/MediatorDetails';
import MediatorClasses from './components/MediatorClasses';
import MediatorStudents from './components/MediatorStudents';
import MediatorRecords from './components/MediatorRecords';
import MediatorReports from './components/MediatorReports';
import MediatorSettings from './components/MediatorSettings';
import TeacherDetails from './components/TeacherDetails';
import TeacherRegistration from './components/TeacherRegistration';
import TeacherClasses from './components/TeacherClasses';
import TeacherStudents from './components/TeacherStudents';
import TeacherMeals from './components/TeacherMeals';
import TeacherRecords from './components/TeacherRecords';
import TeacherSettings from './components/TeacherSettings';
import TeacherInclusivePlans from './components/TeacherInclusivePlans';
import DirectorTeacherRecords from './components/DirectorTeacherRecords';
import StudentDetailsView from './components/StudentDetailsView';
import Settings from './components/Settings';
import DBAnalysis from './components/DBAnalysis';
import AdminDashboard from './components/AdminDashboard';
import AdminRegistros from './components/AdminRegistros';
import ModuleWrapper from './components/ModuleWrapper';
import Table from './components/Table';
import CourseTab from './components/CourseTab';
import HelpGuide from './components/HelpGuide';
import ClassDiary from './components/ClassDiary';
import { User, UserProfile, School, Student, MediationRecord, Class, LessonPlan, Attendance, Meal, StudentRecord, Report, Municipio } from './types';
import { MOCK_USERS, MOCK_SCHOOLS, MOCK_STUDENTS, MOCK_MEDIATION_RECORDS, MOCK_CLASSES, MOCK_LESSON_PLANS, MOCK_MEALS } from './constants';
import { supabase } from './lib/supabaseClient';

// Função para buscar perfil do usuário no public.users via auth_user_id
const fetchUserProfile = async (authUserId: string) => {
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();

  if (!data && !error) {
    const fallback = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (data) {
    return {
      ...data,
      schoolId: data.school_id,
      municipio_id: data.municipio_id
    };
  }
  return null;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  // Rastreia se o login foi feito via bypass (sem sessão Supabase Auth)
  const isBypassLogin = React.useRef(false);
  // Evita que o onAuthStateChange sobreponha o login manual em andamento
  const isHandlingLogin = React.useRef(false);
  const [teacherSubTab, setTeacherSubTab] = useState<'list' | 'records'>('list');
  const [classDiaryTab, setClassDiaryTab] = useState<'turmas' | 'alunos' | 'planos' | 'planejamento'>('turmas');

  // Estados Locais Reativos (Iniciados vazios para carregar do Supabase)
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [mediationRecords, setMediationRecords] = useState<MediationRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);
  const [teachersTable, setTeachersTable] = useState<any[]>([]);
  const [mediatorsTable, setMediatorsTable] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedMediatorId, setSelectedMediatorId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<User | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [mediatorToEdit, setMediatorToEdit] = useState<User | null>(null);
  const [isAddingMediator, setIsAddingMediator] = useState(false);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedClassIdForActivity, setSelectedClassIdForActivity] = useState<string | null>(null);
  const [selectedClassIdForStudents, setSelectedClassIdForStudents] = useState<string | null>(null);
  const [selectedSecretariaId, setSelectedSecretariaId] = useState<string | null>(null);
  const [selectedStudentIdForView, setSelectedStudentIdForView] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Monitorar ações do sistema
  const logActivity = async (acao: string, detalhes: any, forced_municipio_id?: string, forced_school_id?: string) => {
    if (!user) return;
    try {
      const logData = {
        user_id: user.id,
        perfil: user.profile,
        acao,
        detalhes: typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes),
        municipio_id: forced_municipio_id || user.municipio_id || null,
        school_id: forced_school_id || user.schoolId || null
      };

      await supabase.from('user_activity_logs').insert([logData]);
      if (activeTab === 'admin_total' || activeTab === 'activity_logs') fetchActivityLogs();
    } catch (err) {
      console.error('Erro ao registrar log:', err);
    }
  };

  // Auxiliares para logs detalhados
  const getDiffLogs = (oldData: any, newData: any, fields: Record<string, string>) => {
    const changes: string[] = [];
    Object.entries(fields).forEach(([key, label]) => {
      let oldVal = oldData?.[key];
      let newVal = newData?.[key];

      // Normalização para comparação
      if (oldVal === null) oldVal = undefined;
      if (newVal === null) newVal = undefined;

      // Converter booleanos para texto amigável
      if (typeof oldVal === 'boolean') oldVal = oldVal ? 'Ativo/Sim' : 'Inativo/Não';
      if (typeof newVal === 'boolean') newVal = newVal ? 'Ativo/Sim' : 'Inativo/Não';
      
      // Se for string, remover espaços extras
      if (typeof oldVal === 'string') oldVal = oldVal.trim();
      if (typeof newVal === 'string') newVal = newVal.trim();

      if (newVal !== undefined && oldVal !== newVal) {
        changes.push(`${label} → ${newVal || '(vazio)'}`);
      }
    });
    return changes.length > 0 ? changes.join(', ') : 'Nenhuma alteração detectada';
  };

  const getCreationLogs = (data: any, fields: Record<string, string>) => {
    const details: string[] = [];
    Object.entries(fields).forEach(([key, label]) => {
      let val = data?.[key];
      if (typeof val === 'boolean') val = val ? 'Ativo/Sim' : 'Inativo/Não';
      if (val !== undefined && val !== null && val !== '') {
        details.push(`${label}: ${val}`);
      }
    });
    return details.join(', ');
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar logs:', error);
        return;
      }
      
      if (data) {
        console.log(`Logs buscados: ${data.length} registros`);
        setActivityLogs(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar logs:', err);
    }
  };
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    buttonColor: '#2563eb',
    fontFamily: 'Inter',
    fontSize: '14px',
    studentLimit: 25,
    mediatorRatio: 3,
    activeLanguage: 'pt-br'
  });

  // Helper para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const callUpsertUser = async (email: string, name: string, role: string, pass?: string, school_id?: string, municipio_id?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;

      const response = await fetch(
        `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/upsert-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            email,
            password: pass || undefined,
            name: name || 'Usuário',
            role,
            school_id: school_id || user?.schoolId || null,
            municipio_id: municipio_id || user?.municipio_id || null
          })
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Resposta inválida do servidor' }));
        const errorMsg = err.error || err.message || `Erro ${response.status}: ${response.statusText}`;
        console.error(`Erro ao processar ${role} (${email}):`, errorMsg);
        return { error: errorMsg, email };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (e: any) {
      console.error(`Erro na chamada da função para ${email}:`, e);
      return { error: e.message, email };
    }
  };

  // Função para carregar todos os dados necessários de forma resiliente
  const fetchData = useCallback(async () => {
    console.log('fetchData: Iniciando carga de dados resiliente...');

    const safeFetch = async (tables: string | string[], query = '*') => {
      const tableList = Array.isArray(tables) ? tables : [tables];
      for (const table of tableList) {
        try {
          const { data, error } = await supabase.from(table).select(query);
          if (error) {
            console.warn(`fetchData: Tentativa na tabela ${table} falhou ou restrita:`, error.message);
            continue;
          }
          if (data && data.length > 0) return data;
          if (tableList.length > 1) continue;
          return data || [];
        } catch (e) {
          console.error(`fetchData: Erro crítico na tabela ${table}:`, e);
        }
      }
      return [];
    };

    console.log('fetchData: Iniciando carregamento de dados multilingue...');

    const [
      schoolsData,
      studentsData,
      classesData,
      usersData,
      mediatorStudentsData,
      mediationData,
      attendancesData,
      mealsData,
      reportsData,
      lessonPlansData,
      studentRecordsData,
      municipiosData,
      professorDetailsData,
      classTeachersData
    ] = await Promise.all([
      safeFetch(['schools', 'escolas']),
      safeFetch(['students', 'alunos']),
      safeFetch(['classes', 'turmas']),
      safeFetch(['users', 'usuarios']),
      safeFetch(['mediator_students', 'mediadores_alunos', 'vinculo_mediador']),
      safeFetch(['mediator_records', 'mediacao', 'registros_mediacao']),
      safeFetch(['attendance', 'presenca', 'presenca_alunos']),
      safeFetch(['meals', 'refeicoes']),
      safeFetch(['reports', 'relatorios']),
      safeFetch(['lesson_plans', 'planejamento', 'planejamento_diario']),
      safeFetch(['student_records', 'historico_aluno']),
      safeFetch(['municipios', 'escopo_municipal']),
      safeFetch(['professor_details', 'detalhes_professores', 'professores']),
      safeFetch(['class_teachers', 'vinculo_professor_turma', 'professores_turmas'])
    ]);

    // Busca direta e prioritária para logs de auditoria
    const { data: logsData, error: logsError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('criado_em', { ascending: false });

    if (logsError) {
      console.warn('fetchData: Erro ao buscar user_activity_logs:', logsError.message);
    }
    setActivityLogs(logsData || []);

    // Mapeamento resiliente
    setSchools(schoolsData.map(s => ({
      ...s,
      zipCode: s.zip_code,
      principalName: s.principal_name,
      principalEmail: s.principal_email,
      teacherCount: s.teacher_count || 0,
      mediatorCount: s.mediator_count || 0,
      classCount: s.class_count || 0,
      studentCount: s.student_count || 0,
      createdAt: s.created_at
    })) as School[]);

    setStudents(studentsData.map(s => ({
      ...s,
      ra: s.ra || '',
      classId: s.class_id,
      schoolId: s.school_id,
      regentTeacherId: s.main_teacher_id,
      mediatorId: s.mediator_id,
      aee: s.aee || false,
      deficiency: s.deficiency || '',
      schoolRegime: s.school_regime || 'Parcial',
      attendancePeriod: s.attendance_period || 'Manhã',
      turno: s.turno || (s.school_regime ? s.school_regime.toLowerCase() : s.schoolRegime?.toLowerCase()),
      description: s.description || '',
      guardians: s.guardians || [],
      hasMedicalReport: s.has_medical_report || false,
      medicalReportUrl: s.medical_report_url || '',
      diagnosis: s.diagnosis || '',
      grade: s.grade || '',
      classroom: s.classroom || '',
      birthDate: s.birth_date,
      notas: s.notas || {},
      refeicoes: s.refeicoes || {},
      evacuacao: s.evacuacao || {},
      year: s.enrollment_year || s.year || 0
    })) as Student[]);

    setClasses(classesData.map(c => ({
      ...c,
      schoolId: c.school_id,
      teacherId: c.teacher_id,
      mediatorId: c.mediator_id,
      year: c.year // Garantindo uso da coluna 'year'
    })) as Class[]);

    const roleToProfileMap: Record<string, UserProfile> = {
      'admin_geral': UserProfile.ADMIN,
      'secretaria': UserProfile.SECRETARIA,
      'diretor': UserProfile.DIRETOR,
      'professor': UserProfile.PROFESSOR,
      'mediador': UserProfile.MEDIADOR,
      'escola': UserProfile.ESCOLA,
      'admin': UserProfile.ADMIN
    };

    const enrichedUsers = (usersData || []).map(u => {
      const userId = u.id || u.uuid || u.auth_user_id;
      const linkedStudentIds = (mediatorStudentsData || [])
        .filter((ms: any) => {
          const mId = ms.mediator_id || ms.mediador_id;
          return mId === userId || mId === u.auth_user_id;
        })
        .map((ms: any) => ms.student_id || ms.aluno_id);

      // Tentar recuperar municipio_id se estiver faltando, mas houver school_id (aplica-se a professores, mediadores, etc.)
      let userMunicipioId = u.municipio_id || u.municipioId;
      if (!userMunicipioId && (u.school_id || u.schoolId)) {
        const linkedSchool = schoolsData.find((s: any) => (s.id || s.uuid) === (u.school_id || u.schoolId));
        if (linkedSchool) userMunicipioId = linkedSchool.municipio_id;
      }

      const roleKey = (u.role || '').toLowerCase();
      const mappedProfile = roleToProfileMap[roleKey] || (u.profile as UserProfile) || UserProfile.PROFESSOR;

      const nameValue = u.name || u.nome || u.email || 'Usuário';
      return {
        ...u,
        id: userId,
        name: nameValue,
        profile: mappedProfile,
        schoolId: u.school_id || u.schoolId || null,
        municipio_id: userMunicipioId || null,
        studentIds: linkedStudentIds
      };
    }) as User[];

    // Merge with professor_details if they exist but are not in users list
    if (professorDetailsData && professorDetailsData.length > 0) {
      professorDetailsData.forEach((pd: any) => {
        const userId = pd.user_id || pd.id || pd.uuid;
        if (!enrichedUsers.some(u => u.id === userId)) {
          enrichedUsers.push({
            id: userId,
            name: pd.name || pd.nome || 'Professor (Detalhes)',
            email: pd.email || '',
            profile: UserProfile.PROFESSOR,
            schoolId: pd.school_id || pd.schoolId || null,
            municipio_id: pd.municipio_id || null,
            active: pd.active !== false
          } as User);
        } else {
          // Update schoolId if missing in user but present in details
          const idx = enrichedUsers.findIndex(u => u.id === userId);
          if (enrichedUsers[idx] && !enrichedUsers[idx].schoolId) {
            enrichedUsers[idx].schoolId = pd.school_id || pd.schoolId || null;
          }
        }
      });
    }

    // Merge with class_teachers links
    if (classTeachersData && classTeachersData.length > 0) {
      classTeachersData.forEach((ct: any) => {
        const userId = ct.teacher_id || ct.user_id || ct.id;
        const classId = ct.class_id || ct.turma_id;
        if (userId && classId) {
          const linkedClass = classesData.find((c: any) => (c.id || c.uuid) === classId);
          const schoolIdFromClass = linkedClass?.school_id || linkedClass?.schoolId;
          
          if (schoolIdFromClass) {
            const userIdx = enrichedUsers.findIndex(u => u.id === userId);
            if (userIdx !== -1) {
              if (!enrichedUsers[userIdx].schoolId) {
                enrichedUsers[userIdx].schoolId = schoolIdFromClass;
              }
            } else {
              // Create teacher placeholder if not found in users or professor_details
              enrichedUsers.push({
                id: userId,
                name: ct.teacher_name || ct.name || 'Professor (Turma)',
                email: ct.email || '',
                profile: UserProfile.PROFESSOR,
                schoolId: schoolIdFromClass,
                active: true
              } as User);
            }
          }
        }
      });
    }

    setUsersList(enrichedUsers);

    // Sincronizar o usuário logado com os dados enriquecidos
    if (user) {
      const currentUserEnriched = enrichedUsers.find(u => 
        u.id === user.id || 
        u.auth_user_id === user.id ||
        u.email === user.email
      );
      if (currentUserEnriched) {
        setUser(prev => prev ? ({ ...prev, ...currentUserEnriched }) : null);
      }
    }

    setMediationRecords(mediationData.map(r => ({
      ...r,
      studentId: r.student_id,
      classId: r.class_id,
      schoolId: r.school_id,
      authorId: r.mediator_id || r.created_by,
      description: r.notes || r.content || '',
      behaviorStatus: r.behavior_status || 'normal',
      status: r.status || 'finalizado',
      date: r.date || r.created_at
    })) as MediationRecord[]);

    const attendanceRecords = attendancesData.map(a => ({
      ...a,
      studentId: a.student_id,
      classId: a.class_id || '',
      teacherId: a.teacher_id || '',
      schoolId: a.school_id || ''
    })) as Attendance[];

    const presencasFromRecords = (studentRecordsData || [])
      .filter((r: any) => r.record_type === 'presenca')
      .map((r: any) => ({
        id: r.id,
        studentId: r.student_id,
        classId: '',
        teacherId: r.created_by,
        schoolId: '',
        date: r.date,
        status: r.value as 'presente' | 'falta',
        shift: r.shift
      })) as Attendance[];

    // Unificar e remover duplicatas por ID se necessário
    const unifiedAttendances = [...attendanceRecords];
    presencasFromRecords.forEach(p => {
      if (!unifiedAttendances.find(existing => existing.id === p.id)) {
        unifiedAttendances.push(p);
      }
    });

    setAttendances(unifiedAttendances);

    setMeals(mealsData.map(m => ({
      ...m,
      id: m.id || m.id,
      studentId: m.aluno_id || m.student_id,
      date: m.meal_date || m.data || m.date,
      type: m.tipo_refeicao || m.type,
      status: m.status_consumo || m.status,
      sono: m.sono,
      evacuou: m.evacuou,
      observations: m.observacoes || m.observations,
      schoolId: m.school_id || ''
    })) as Meal[]);

    setReports(reportsData.map(r => ({
      ...r,
      studentId: r.student_id,
      schoolId: r.school_id,
      updatedAt: r.updated_at || r.created_at
    })) as Report[]);

    setLessonPlans(lessonPlansData.map(lp => ({
      ...lp,
      schoolId: lp.school_id,
      classId: lp.class_id,
      teacherId: lp.teacher_id,
      temaAula: lp.tema_aula,
      diaDaSemana: lp.dia_da_semana,
      habilidadesBNCC: lp.habilidades_bncc,
      adaptacoesMetodologia: lp.adaptacoes_metodologia,
      description: lp.descricao,
      objetivos: lp.objetivos,
      estrategias: lp.estrategias,
      shared: lp.compartilhado,
      createdAt: lp.criado_em,
      updatedAt: lp.atualizado_em
    })) as LessonPlan[]);

    setStudentRecords(studentRecordsData.map(r => ({
      ...r,
      studentId: r.student_id,
      recordType: r.record_type,
      createdBy: r.created_by,
      createdAt: r.created_at,
      shift: r.shift
    })) as StudentRecord[]);

    setMunicipios(municipiosData as Municipio[]);

    console.log('fetchData: Carga de dados concluída.');
  }, []);

  // Efeito unificado para inicialização e monitoramento de autenticação
  useEffect(() => {
    let mounted = true;

    // Função interna para processar a sessão (agora mais rápida e resiliente)
    const processUserSession = async (session: any) => {
      if (!session?.user || !mounted) return;

      const { user: authUser } = session;
      const metadata = authUser.user_metadata || {};

      console.log('App: Processando sessão rápida via metadados:', authUser.id);

      const roleToProfileMap: Record<string, UserProfile> = {
        'admin_geral': UserProfile.ADMIN,
        'secretaria': UserProfile.SECRETARIA,
        'diretor': UserProfile.DIRETOR,
        'professor': UserProfile.PROFESSOR,
        'mediador': UserProfile.MEDIADOR
      };

      // Define o usuário IMEDIATAMENTE usando metadados do Auth/JWT
      const mappedProfile = roleToProfileMap[metadata.role] || UserProfile.PROFESSOR;
      const initialUser = {
        id: authUser.id, 
        auth_user_id: authUser.id,
        name: metadata.name || 'Usuário',
        role: metadata.role || 'professor',
        profile: mappedProfile,
        schoolId: metadata.school_id,
        municipio_id: metadata.municipio_id,
        themePreference: 'light'
      } as unknown as User;

      setUser(initialUser);
      setIsLoggedIn(true);
      // Se for Admin, sempre vai para admin_total
      if (mappedProfile === UserProfile.ADMIN) {
        setActiveTab('admin_total');
      }
      setLoading(false); // Libera a tela de "Iniciando..." imediatamente

      // Agora, em background, busca o perfil real no banco para dados extras e consistência
      fetchUserProfile(authUser.id).then(userData => {
        if (userData && mounted) {
          const savedTheme = localStorage.getItem(`incluiedutec_theme_user_${userData.id}`) as 'light' | 'dark' | null;
          setUser(prev => {
            const nameValue = userData.name || userData.nome || prev?.name || 'Usuário';
            return {
              ...prev,
              ...userData,
              id: userData.id,
              auth_user_id: userData.auth_user_id || authUser.id,
              name: nameValue,
              schoolId: userData.school_id || userData.schoolId || prev?.schoolId,
              municipio_id: userData.municipio_id || userData.municipioId || prev?.municipio_id,
              profile: (roleToProfileMap[userData.role] || userData.role || prev?.profile || UserProfile.PROFESSOR) as UserProfile,
              themePreference: savedTheme || 'light'
            } as unknown as User;
          });
        }
      });

      // Carrega os dados das tabelas em background
      fetchData();
    };

    const initialize = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await processUserSession(session);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Erro na inicialização:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('App: Evento Auth:', event, '| bypass:', isBypassLogin.current, '| handlingLogin:', isHandlingLogin.current);
      if (!mounted) return;

      // Ignora eventos durante o processamento manual de login
      if (isHandlingLogin.current) {
        console.log('App: Ignorando evento Auth durante handleLogin:', event);
        return;
      }

      // Responde apenas ao login explícito do usuário (não disparado por nossa lógica interna)
      if (event === 'SIGNED_IN' && session) {
        if (isBypassLogin.current) return;
        await processUserSession(session);
        loadSettings();
      } else if (event === 'SIGNED_OUT') {
        if (isBypassLogin.current) return;
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .maybeSingle();

        if (data && !error) {
          setSystemSettings({
            id: data.id,
            buttonColor: data.button_color,
            fontFamily: data.font_family,
            fontSize: data.font_size,
            studentLimit: data.student_limit,
            mediatorRatio: data.mediator_ratio,
            activeLanguage: data.active_language,
            backgroundTheme: data.background_theme,
            interfaceDensity: data.interface_density,
            interfaceStyle: data.interface_style,
            interfaceShadows: data.interface_shadows,
            interfaceAnimations: data.interface_animations
          });
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };

    if (isLoggedIn) {
      fetchData();
      loadSettings();
    }

    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };

    window.addEventListener('changeTab', handleTabChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, [fetchData]);

  // Efeito para aplicar o tema quando o usuário logar ou mudar a preferência
  useEffect(() => {
    if (user?.themePreference) {
      if (user.themePreference === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const handleLogin = async (emailOrName: string, selectedProfile: UserProfile, password?: string) => {
    if (!password) {
      showNotification('A senha é obrigatória.', 'error');
      return;
    }

    isHandlingLogin.current = true;
    isBypassLogin.current = false;
    setLoading(true);

    try {
      const roleToProfileMap: Record<string, UserProfile> = {
        'admin_geral': UserProfile.ADMIN,
        'secretaria': UserProfile.SECRETARIA,
        'diretor': UserProfile.DIRETOR,
        'professor': UserProfile.PROFESSOR,
        'mediador': UserProfile.MEDIADOR,
        'admin': UserProfile.ADMIN
      };

      // 1. Tentar autenticação via Supabase Auth
      let authData: any = null;
      let authError: any = null;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrName.toLowerCase().trim(),
        password: password
      });
      authData = data;
      authError = error;

      // 2. Fallback para senha mestra (Bypass) se o Auth falhar
      if (authError && password === 'Joao@21226900') {
        const { data: adminData } = await supabase
          .from('users')
          .select('*')
          .ilike('email', emailOrName.trim())
          .in('role', ['admin_geral', 'admin'])
          .maybeSingle();

        if (adminData) {
          isBypassLogin.current = true;
          const nameValue = adminData.name || adminData.nome || adminData.email || 'Administradora';
          setUser({
            ...adminData,
            name: nameValue,
            profile: UserProfile.ADMIN,
            schoolId: adminData.school_id,
            municipio_id: adminData.municipio_id,
            themePreference: 'light'
          } as unknown as User);
          setIsLoggedIn(true);
          setActiveTab('admin_total');
          showNotification('Acesso administrativo realizado!', 'success');
          fetchData();
          return;
        }
      }

      if (authError) {
        const errorMsg = authError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : `Erro na autenticação: ${authError.message}`;
        showNotification(errorMsg, 'error');
        return;
      }

      // 3. Buscar dados do usuário no public.users
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user?.id)
        .maybeSingle();

      if (!userData && !userError) {
        const { data: byAuthId, error: authIdError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authData.user?.id)
          .maybeSingle();
        userData = byAuthId;
        userError = authIdError;
      }

      if (userError || !userData) {
        // Se estiver no Auth mas não no users, tenta usar metadados do Auth
        const metadata = authData.user.user_metadata || {};
        const roleFromMeta = metadata.role || 'professor';
        const mappedFromMeta = roleToProfileMap[roleFromMeta];
        
        console.log('[Login] Usuário não encontrado no banco, usando metadados Auth:', { roleFromMeta, mappedFromMeta });

        // Permitir login via metadados para qualquer perfil se o registro no banco falhar
        const userFromMeta = {
          id: authData.user.id,
          auth_user_id: authData.user.id,
          name: metadata.name || authData.user.email?.split('@')[0] || 'Usuário',
          email: authData.user.email,
          role: roleFromMeta,
          profile: mappedFromMeta,
          school_id: metadata.school_id || null,
          schoolId: metadata.school_id || null,
          municipio_id: metadata.municipio_id || null,
          themePreference: 'light'
        } as unknown as User;

        setUser(userFromMeta);
        setIsLoggedIn(true);
        
        // Redirecionamento baseado no perfil
        if (mappedFromMeta === UserProfile.ADMIN) {
          setActiveTab('admin_total');
          showNotification('Login de Administrador (Auth)!', 'success');
        } else if (mappedFromMeta === UserProfile.MEDIADOR) {
          setActiveTab('mediator_dashboard');
          showNotification('Login de Mediador (Auth)!', 'success');
        } else if (mappedFromMeta === UserProfile.SECRETARIA) {
          setActiveTab('secretaria_dashboard');
          showNotification('Login de Secretaria (Auth)!', 'success');
        } else if (mappedFromMeta === UserProfile.DIRETOR) {
          setActiveTab('dashboard');
          showNotification('Login de Diretor (Auth)!', 'success');
        } else {
          setActiveTab('dashboard');
          showNotification('Login realizado via metadados Auth!', 'success');
        }
        
        fetchData();
        return;
      }

      const mappedProfile = roleToProfileMap[userData.role] || UserProfile.PROFESSOR;

      // ── LOGICA DE REDIRECIONAMENTO INTELIGENTE ──
      
      // Se o usuário for um Administrador, ele entra como Admin independente do que selecionou na tela
      if (mappedProfile === UserProfile.ADMIN) {
        showNotification('Login de Administrador realizado com sucesso!', 'success');
        setUser({
          ...userData,
          name: userData.name || userData.nome || 'Admin Geral',
          profile: UserProfile.ADMIN,
          schoolId: userData.school_id,
          municipio_id: userData.municipio_id,
          themePreference: 'light'
        } as unknown as User);
        setIsLoggedIn(true);
        setActiveTab('admin_total');
        fetchData();
        return;
      }

      // Para outros perfis, validamos se selecionou o perfil correto
      if (mappedProfile !== selectedProfile) {
        showNotification(`Este e-mail pertence ao perfil ${mappedProfile}. Selecione-o para entrar.`, 'error');
        await supabase.auth.signOut();
        return;
      }

      // Login normal bem-sucedido
      showNotification('Login realizado com sucesso!', 'success');
      const nameValue = userData.name || userData.nome || userData.email || 'Usuário';
      setUser({
        ...userData,
        auth_user_id: authData.user?.id || userData.auth_user_id,
        name: nameValue,
        profile: mappedProfile,
        schoolId: userData.school_id,
        municipio_id: userData.municipio_id,
        themePreference: 'light'
      } as unknown as User);
      setIsLoggedIn(true);

      // Tab inicial por perfil
      if (mappedProfile === UserProfile.MEDIADOR) {
        setActiveTab('alunos');
      } else if (mappedProfile === UserProfile.PROFESSOR) {
        setActiveTab('turmas');
      } else {
        setActiveTab('dashboard');
      }

      fetchData();

    } catch (error) {
      console.error('Erro ao realizar login:', error);
      showNotification('Ocorreu um erro inesperado durante o login.', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        isHandlingLogin.current = false;
      }, 1000);
    }
  };

  const handleLogout = async () => {
    isBypassLogin.current = false;
    isHandlingLogin.current = false;
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setSelectedSchoolId(null);
    setSelectedMediatorId(null);
    setSelectedTeacherId(null);
    setTeacherToEdit(null);
    setSchoolToEdit(null);
    setClassToEdit(null);
    setIsAddingMediator(false);
    // Limpa classe dark ao sair
    document.documentElement.classList.remove('dark');
  };

  const handleUpdateUserTheme = (newTheme: 'light' | 'dark') => {
    if (!user) return;

    // Simula a gravação no banco (ex.: campo preferencia_tema no Supabase)
    localStorage.setItem(`incluiedutec_theme_user_${user.id}`, newTheme);

    setUser(prev => prev ? { ...prev, themePreference: newTheme } : null);
  };

  const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
    try {
      setLoading(true);
      const dataToSave = {
        button_color: newSettings.buttonColor,
        font_family: newSettings.fontFamily,
        font_size: newSettings.fontSize,
        student_limit: newSettings.studentLimit,
        mediator_ratio: newSettings.mediatorRatio,
        active_language: newSettings.activeLanguage,
        background_theme: newSettings.backgroundTheme,
        interface_density: newSettings.interfaceDensity,
        interface_style: newSettings.interfaceStyle,
        interface_shadows: newSettings.interfaceShadows,
        interface_animations: newSettings.interfaceAnimations,
        updated_at: new Date().toISOString()
      };

      let error;
      if (newSettings.id) {
        const { error: updateError } = await supabase
          .from('system_settings')
          .update(dataToSave)
          .eq('id', newSettings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert([dataToSave]);
        error = insertError;
      }

      if (error) throw error;

      setSystemSettings(newSettings);
      showNotification('Configurações do sistema atualizadas com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      showNotification(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = (attendanceData: any) => {
    // Migrando para student_records
    handleSaveStudentRecord({
      studentId: attendanceData.studentId,
      date: attendanceData.date.split('T')[0],
      recordType: 'presenca',
      value: attendanceData.status,
      createdBy: user?.id,
      shift: attendanceData.shift
    });
  };

  const handleUpdateStudentHealth = async (studentId: string, refeicoes: any[], evacuacao: any[]) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ 
          refeicoes, 
          evacuacao,
          last_monitoring_at: new Date().toISOString()
        })
        .eq('id', studentId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, refeicoes, evacuacao } : s));
        
        // Sincronizar com student_records para o gráfico de evolução
        const today = new Date().toISOString().split('T')[0];
        
        // Se houver refeições consumidas, registrar como 'refeicao' no student_records
        const refeicoesConsumidas = refeicoes.filter(r => r.status !== 'não consumiu');
        if (refeicoesConsumidas.length > 0) {
          await handleSaveStudentRecord({
            studentId,
            date: today,
            recordType: 'refeicao',
            value: `${refeicoesConsumidas.length} refeições`,
            observation: refeicoesConsumidas.map(r => r.tipo).join(', ')
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving student health:', error);
      showNotification('Erro ao salvar registros de saúde.', 'error');
      return false;
    }
  };

  const handleSaveMeal = async (mealData: any) => {
    if (!user) return;
    try {
      const recordToSave = {
        aluno_id: mealData.studentId,
        student_id: mealData.studentId, // Adicionando student_id para paridade e RLS
        meal_date: mealData.date.split('T')[0],
        tipo_refeicao: mealData.type,
        status_consumo: mealData.status,
        sono: mealData.sono || false,
        evacuou: mealData.evacuou || false,
        observacoes: mealData.observations || null
      };

      const { data, error } = await supabase
        .from('meals')
        .upsert([recordToSave], {
          onConflict: 'aluno_id,meal_date,tipo_refeicao'
        })
        .select();

      if (error) throw error;

      if (data) {
        const mapped = {
          id: data[0].id,
          studentId: data[0].aluno_id,
          schoolId: user.schoolId || '',
          date: data[0].meal_date || data[0].data,
          type: data[0].tipo_refeicao,
          status: data[0].status_consumo,
          sono: data[0].sono,
          evacuou: data[0].evacuou,
          observations: data[0].observacoes
        } as Meal;

        setMeals(prev => {
          const filtered = prev.filter(m =>
            !(m.studentId === mapped.studentId && m.date === mapped.date && m.type === mapped.type)
          );
          return [...filtered, mapped];
        });

        // Sincronizar com student_records para o gráfico de evolução
        if (mapped.status !== 'não consumiu') {
          handleSaveStudentRecord({
            studentId: mapped.studentId,
            date: mapped.date,
            recordType: 'refeicao',
            value: mapped.status,
            observation: mapped.type
          });
        }

        setRefreshKey(prev => prev + 1);
        fetchData();
        showNotification('Acompanhamento de saúde registrado com sucesso!', 'success');
      }
    } catch (err: any) {
      console.error('Erro ao salvar refeição da saúde diária:', err);
      showNotification(`Erro ao salvar acompanhamento: ${err.message}`, 'error');
    }
  };

  const handleSaveStudentRecord = async (recordData: Partial<StudentRecord>) => {
    if (!user) return;

    try {
      const recordToSave = {
        student_id: recordData.studentId,
        date: recordData.date || new Date().toISOString().split('T')[0],
        record_type: recordData.recordType,
        value: recordData.value,
        observation: recordData.observation,
        created_by: user.id || user.auth_user_id,
        shift: recordData.shift || null
      };

      const { data, error } = await supabase
        .from('student_records')
        .upsert([recordToSave], {
          onConflict: 'student_id,date,record_type,shift'
        })
        .select();

      if (error) throw error;

      if (data) {
        const mapped = {
          ...data[0],
          studentId: data[0].student_id,
          recordType: data[0].record_type,
          createdBy: data[0].created_by,
          createdAt: data[0].created_at
        } as StudentRecord;

        setStudentRecords(prev => {
          const filtered = prev.filter(r =>
            !(r.studentId === mapped.studentId && r.date === mapped.date && r.recordType === mapped.recordType)
          );
          return [...filtered, mapped];
        });

        // Atualizar também estados legados se necessário
        if (mapped.recordType === 'refeicao') {
          setMeals(prev => {
            const filtered = prev.filter(m =>
              !(m.studentId === mapped.studentId && m.date === mapped.date && m.type === mapped.observation)
            );
            return [...filtered, {
              id: mapped.id,
              studentId: mapped.studentId,
              schoolId: user.schoolId || '',
              date: mapped.date,
              type: mapped.observation || '',
              status: mapped.value
            }];
          });
        }

        if (mapped.recordType === 'presenca') {
          setAttendances(prev => {
            const filtered = prev.filter(a =>
              !(a.studentId === mapped.studentId && a.date === mapped.date)
            );
            return [...filtered, {
              id: mapped.id,
              studentId: mapped.studentId,
              date: mapped.date,
              status: mapped.value as 'presente' | 'falta',
              teacherId: user.id,
              schoolId: user.schoolId || '',
              classId: '' // We might need to look this up
            }];
          });
        }
      }
      setRefreshKey(prev => prev + 1);
      fetchData();
      showNotification('Registro geral do aluno atualizado!', 'success');

      if (user) {
        logActivity(
          'Lançar Registro de Aluno',
          `Lançou registro tipo "${recordData.recordType}" para o aluno ID: ${recordData.studentId}. Valor: ${recordData.value}`,
          user.municipio_id,
          user.schoolId
        );
      }
    } catch (err: any) {
      console.error('Erro ao salvar registro do aluno:', err);
      showNotification(`Erro ao salvar registro: ${err.message}`, 'error');
    }
  };

  const handleSaveMediationRecord = async (recordData: Omit<MediationRecord, 'id'>) => {
    if (!user) return;

    try {
      const recordToInsert = {
        student_id: recordData.studentId,
        class_id: recordData.classId || null,
        school_id: recordData.schoolId || user.schoolId || null,
        mediator_id: user.id || user.auth_user_id,
        notes: recordData.description,
        behavior_status: recordData.behaviorStatus,
        hygiene: recordData.hygiene,
        feeding: recordData.feeding,
        mobility: recordData.mobility,
        interacted_students: recordData.interactedStudents === 'SIM',
        group_activity: recordData.groupActivity === 'SIM',
        eye_contact: recordData.eyeContact === 'SIM',
        status: recordData.status || 'finalizado',
        date: recordData.date || new Date().toISOString()
      };

      if (!recordToInsert.class_id) delete recordToInsert.class_id;

      const { data, error } = await supabase
        .from('mediator_records')
        .insert([recordToInsert])
        .select();

      if (error) {
        console.warn('Erro ao salvar em mediator_records:', error.message);
        
        // Trata erro de RLS (Permissão)
        if (error.message.includes('row-level security policy')) {
           console.log('Tentando fallback para student_records devido a erro de RLS...');
           const { error: srError } = await supabase
             .from('student_records')
             .insert([{
               student_id: recordData.studentId,
               record_type: 'observacao',
               value: recordData.behaviorStatus || 'Monitoramento',
               observation: recordData.description,
               created_by: user.id,
               created_at: recordData.date || new Date().toISOString()
             }]);

           if (srError) {
             console.error('Falha no fallback para student_records:', srError.message);
             showNotification('Erro: Permissão negada no banco de dados para mediação.', 'error');
             throw error;
           } else {
             showNotification('Registro salvo como observação no prontuário do aluno.', 'success');
             const newRecord: MediationRecord = { id: 'fallback-' + Date.now(), ...recordData };
             setMediationRecords(prev => [...prev, newRecord]);
             return newRecord;
           }
        }

        // Trata erro de coluna inexistente
        if (error.message.includes('column')) {
            const fallbackInsert = {
              student_id: recordData.studentId,
              class_id: recordData.classId || null,
              school_id: recordData.schoolId || user.schoolId || null,
              mediator_id: user.id || user.auth_user_id,
              notes: recordData.description,
              behavior_status: recordData.behaviorStatus,
              status: recordData.status || 'finalizado',
              created_at: recordData.date || new Date().toISOString()
            };
            if (!fallbackInsert.class_id) delete fallbackInsert.class_id;
            
            const { data: fbData, error: fbError } = await supabase
              .from('mediator_records')
              .insert([fallbackInsert])
              .select();
              
            if (fbError) throw fbError;
            
            if (fbData && fbData.length > 0) {
              const newRecord: MediationRecord = { ...recordData, id: fbData[0].id };
              setMediationRecords(prev => [...prev, newRecord]);
              showNotification('Monitoramento registrado com sucesso.', 'success');
              return newRecord;
            }
        }

        throw error;
      }

      if (data && data.length > 0) {
        const newRecord: MediationRecord = { ...recordData, id: data[0].id };
        setMediationRecords(prev => [...prev, newRecord]);
        showNotification('Monitoramento registrado com sucesso.', 'success');
        return newRecord;
      }
    } catch (error: any) {
      console.error('Erro final no handleSaveMediationRecord:', error);
      if (!error.message?.includes('row-level security policy')) {
        showNotification('Erro ao salvar registro de mediação: ' + (error.message || 'Erro desconhecido'), 'error');
      }
      throw error;
    }
  };

  const handleSaveSchool = async (newSchoolData: School) => {
    if (!user) return;
    setLoading(true);

    try {
      // RESTRIÇÃO: Apenas Secretaria de Educação ou Admin pode salvar/editar escolas
      if (user.profile !== UserProfile.SECRETARIA && user.profile !== UserProfile.ADMIN) {
        alert('Acesso negado. Apenas a Secretaria de Educação ou Administrador podem gerenciar unidades escolares.');
        setLoading(false);
        return;
      }

      // RESTRIÇÃO MUNICIPAL: Validar se a escola pertence ao município do usuário
      // Na criação (sem ID), vinculamos automaticamente. Na edição, validamos.
      if (schoolToEdit && schoolToEdit.municipio_id !== user.municipio_id && user.profile !== UserProfile.ADMIN) {
        alert('Acesso negado. Você não tem permissão para editar escolas de outro município.');
        setLoading(false);
        return;
      }

      let finalMunicipioId = user.municipio_id;
      if (user.profile === UserProfile.ADMIN) {
        if (schoolToEdit && schoolToEdit.municipio_id) {
          finalMunicipioId = schoolToEdit.municipio_id;
        } else {
          // Na criação (ou edição de uma escola "Não vinculada") por Admin, tenta usar o filtro atual ou busca pelo nome da cidade
          const matchedMunicipio = municipios.find(m => 
            m.nome.toLowerCase() === newSchoolData.city.toLowerCase() || 
            (newSchoolData.city && m.nome.toLowerCase().includes(newSchoolData.city.toLowerCase()))
          );
          finalMunicipioId = selectedMunicipioId || matchedMunicipio?.id || null;
        }
      }

      // 1. Preparar objeto da escola (Mapear camelCase para snake_case)
      // Sincronizar contadores com as listas detalhadas se fornecidas
      const schoolToSave = {
        name: newSchoolData.name,
        inep: newSchoolData.inep,
        address: newSchoolData.address,
        neighborhood: newSchoolData.neighborhood,
        city: newSchoolData.city,
        state: newSchoolData.state,
        zip_code: newSchoolData.zipCode,
        municipio_id: finalMunicipioId,
        principal_name: newSchoolData.principalName,
        principal_email: newSchoolData.principalEmail,
        principal_password: newSchoolData.principalPassword,
        email: newSchoolData.email,
        phone: newSchoolData.phone,
        active: newSchoolData.active,
        type: newSchoolData.type,
        teacher_count: newSchoolData.teachers?.length || newSchoolData.teacherCount || 0,
        mediator_count: newSchoolData.mediators?.length || newSchoolData.mediatorCount || 0,
        class_count: newSchoolData.classes?.length || newSchoolData.classCount || 0,
        student_count: newSchoolData.students?.length || newSchoolData.studentCount || 0,
        observations: newSchoolData.observations
      };

      let currentSchoolId = schoolToEdit?.id;

      // 2. Salvar Escola (Insert ou Update)
      if (schoolToEdit) {
        const { error } = await supabase
          .from('schools')
          .update(schoolToSave)
          .eq('id', schoolToEdit.id);

        if (error) {
          console.error('[handleSaveSchool] Erro ao atualizar escola:', error);
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from('schools')
          .insert([schoolToSave])
          .select();

        if (error) throw error;
        if (data) {
          currentSchoolId = data[0].id;
        }
      }

      if (!currentSchoolId) throw new Error("Falha ao obter ID da escola para salvamento detalhado.");

      // 2.5 Gerenciar Credenciais (Auth + public.users) via Edge Function
      // Agora usamos a função callUpsertUser definida no escopo superior

      // 1. Processar Diretor
      if (newSchoolData.principalEmail) {
        const dirEmail = newSchoolData.principalEmail.trim();
        await callUpsertUser(
          dirEmail,
          newSchoolData.principalName || 'Diretor',
          'diretor',
          newSchoolData.principalPassword || undefined,
          currentSchoolId,
          finalMunicipioId
        );

        // Forçar atualização via tabela (caso a Edge Function ou Trigger falhem em salvar o municipio)
        await supabase
          .from('users')
          .update({ municipio_id: finalMunicipioId, school_id: currentSchoolId })
          .eq('email', dirEmail);
      }

      // 3. Cadastrar Detalhes (Professores, Mediadores, Turmas, Alunos)

      const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

      // Professores
      if (newSchoolData.teachers) {
        // Desvincular professores removidos
        if (schoolToEdit) {
          const incomingTeacherIds = newSchoolData.teachers.filter(t => t.id).map(t => t.id);
          const query = supabase.from('users')
            .update({ school_id: null })
            .eq('school_id', currentSchoolId)
            .eq('role', 'professor');
          
          if (incomingTeacherIds.length > 0) {
            query.not('id', 'in', incomingTeacherIds);
          }
          await query;
        }

        const authPromises = newSchoolData.teachers
          .filter(t => t.contact && isEmail(t.contact))
          .map(async t => {
            const email = t.contact!.trim();
            await callUpsertUser(email, t.name, 'professor', undefined, currentSchoolId, finalMunicipioId);
            await supabase.from('users').update({ municipio_id: finalMunicipioId, school_id: currentSchoolId }).eq('email', email);
          });

        await Promise.all(authPromises);

        for (const t of newSchoolData.teachers) {
          const contact = t.contact?.trim() || '';
          const email = isEmail(contact) ? contact : null;
          const phone = !isEmail(contact) ? contact : null;

          const teacherData = {
            name: t.name,
            role: 'professor',
            school_id: currentSchoolId,
            municipio_id: finalMunicipioId,
            email: email,
            phone_number: phone,
            active: true
          };

          if (t.id) {
            await supabase.from('users').update(teacherData).eq('id', t.id);
          } else {
             const { data: existing } = await supabase.from('users')
               .select('id')
               .eq('email', email)
               .maybeSingle();
             
             if (existing) {
               await supabase.from('users').update(teacherData).eq('id', existing.id);
             } else {
               // Se falhar o insert por causa de trigger, ao menos já tentamos o Auth
               const { error: insErr } = await supabase.from('users').insert([teacherData]);
               if (insErr) console.warn('[handleSaveSchool] Falha ao inserir professor:', insErr.message);
             }
          }
        }
      }

      // Mediadores
      if (newSchoolData.mediators) {
        // ... (lógica de desvínculo permanece igual)
        const medPromises = newSchoolData.mediators
          .filter(m => m.contact && isEmail(m.contact))
          .map(async m => {
            const email = m.contact!.trim();
            await callUpsertUser(email, m.name, 'mediador', undefined, currentSchoolId, finalMunicipioId);
          });

        await Promise.all(medPromises);

        for (const m of newSchoolData.mediators) {
          const contact = m.contact?.trim() || '';
          const email = isEmail(contact) ? contact : null;
          const phone = !isEmail(contact) ? contact : null;

          const mediatorData = {
            name: m.name,
            role: 'mediador',
            school_id: currentSchoolId,
            municipio_id: finalMunicipioId,
            email: email,
            phone_number: phone,
            active: true
          };

          if (m.id) {
            await supabase.from('users').update(mediatorData).eq('id', m.id);
          } else if (email) {
             const { data: existing } = await supabase.from('users')
               .select('id')
               .eq('email', email)
               .maybeSingle();
             
             if (existing) {
               await supabase.from('users').update(mediatorData).eq('id', existing.id);
             } else {
               const { error: insErr } = await supabase.from('users').insert([mediatorData]);
               if (insErr) console.warn('[handleSaveSchool] Falha ao inserir mediador:', insErr.message);
             }
          }
        }
      }

      // Turmas
      if (newSchoolData.classes) {
        // 1. Identificar turmas para manter/atualizar e deletar as que saíram
        if (schoolToEdit) {
          const incomingClassIds = newSchoolData.classes.filter(c => c.id).map(c => c.id);
          if (incomingClassIds.length > 0) {
            await supabase.from('classes')
              .delete()
              .eq('school_id', currentSchoolId)
              .not('id', 'in', incomingClassIds);
          } else {
            // Se a lista veio vazia ou sem IDs, mas havia turmas antes, deletar todas da escola
            await supabase.from('classes')
              .delete()
              .eq('school_id', currentSchoolId);
          }
        }

        const classesToUpsert = newSchoolData.classes.map(c => ({
          id: c.id,
          name: c.name,
          year: c.level, // Mapeando 'level' do form para 'year' no banco
          level: c.level, // Mantendo level também por compatibilidade
          shift: c.shift,
          school_id: currentSchoolId
        }));

        for (const cls of classesToUpsert) {
          if (cls.id) {
            await supabase.from('classes').update(cls).eq('id', cls.id);
          } else {
            // Tentar encontrar por nome se não tiver ID (evitar duplicata acidental)
            // Usamos limit(1) para evitar erro caso já existam duplicatas no banco
            const { data: existing } = await supabase.from('classes')
              .select('id')
              .eq('name', cls.name)
              .eq('school_id', cls.school_id)
              .limit(1)
              .maybeSingle();
            
            if (existing) {
              // Se achou pelo nome, atualiza esse registro em vez de criar outro
              await supabase.from('classes').update(cls).eq('id', existing.id);
            } else {
              const { id, ...insertData } = cls;
              await supabase.from('classes').insert([insertData]);
            }
          }
        }
      }

      // Alunos
      if (newSchoolData.students) {
        // Deletar alunos removidos
        if (schoolToEdit) {
          const incomingStudentIds = newSchoolData.students.filter(s => s.id).map(s => s.id);
          const query = supabase.from('students')
            .delete()
            .eq('school_id', currentSchoolId);
          
          if (incomingStudentIds.length > 0) {
            query.not('id', 'in', incomingStudentIds);
          }
          await query;
        }

        const { data: currentClasses } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', currentSchoolId);

        for (const s of newSchoolData.students) {
          const matchedClass = currentClasses?.find(c => c.name === s.class_name);
          const studentData = {
            name: s.name,
            ra: s.ra,
            school_id: currentSchoolId,
            class_id: matchedClass?.id || null,
            active: true
          };

          if (s.id) {
            await supabase.from('students').update(studentData).eq('id', s.id);
          } else {
             const { data: existing } = await supabase.from('students')
               .select('id')
               .eq('ra', s.ra)
               .maybeSingle();
             
             if (existing) {
               await supabase.from('students').update(studentData).eq('id', existing.id);
             } else {
               await supabase.from('students').insert([studentData]);
             }
          }
        }
      }

      // 4. Finalização
      const roleToProfileMap: Record<string, UserProfile> = {
        'admin_geral': UserProfile.ADMIN,
        'secretaria': UserProfile.SECRETARIA,
        'diretor': UserProfile.DIRETOR,
        'professor': UserProfile.PROFESSOR,
        'mediador': UserProfile.MEDIADOR
      };

      // Recarregar os dados do banco
      const [
        { data: updatedSchools },
        { data: updatedUsers },
        { data: updatedClasses },
        { data: updatedStudents }
      ] = await Promise.all([
        supabase.from('schools').select('*'),
        supabase.from('users').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('students').select('*')
      ]);

      if (updatedSchools) {
        setSchools(updatedSchools.map(s => ({
          ...s,
          zipCode: s.zip_code,
          principalName: s.principal_name,
          principalEmail: s.principal_email,
          principalPassword: s.principal_password,
          teacherCount: s.teacher_count,
          mediatorCount: s.mediator_count,
          classCount: s.class_count,
          studentCount: s.student_count
        })) as School[]);
      }
      if (updatedUsers) {
        setUsersList(updatedUsers.map(u => ({
          ...u,
          profile: roleToProfileMap[u.role] || u.role,
          schoolId: u.school_id
        })) as User[]);
      }
      if (updatedClasses) {
        setClasses(updatedClasses.map(c => ({
          ...c,
          schoolId: c.school_id,
          teacherId: c.teacher_id,
          mediatorId: c.mediator_id
        })) as Class[]);
      }
      if (updatedStudents) {
        setStudents(updatedStudents.map(s => ({
          ...s,
          ra: s.ra,
          classId: s.class_id,
          schoolId: s.school_id,
          regentTeacherId: s.regent_teacher_id,
          mediatorId: s.mediator_id
        })) as Student[]);
      }

      const schoolFields = {
        name: 'Nome',
        inep: 'INEP',
        email: 'E-mail',
        phone: 'Telefone',
        address: 'Endereço',
        principalName: 'Diretor',
        active: 'Status'
      };

      const logDetails = schoolToEdit 
        ? `Editou a escola: ${getDiffLogs(schoolToEdit, newSchoolData, schoolFields)}`
        : `Criou a escola: ${getCreationLogs(newSchoolData, schoolFields)}`;

      await logActivity(
        schoolToEdit ? 'Editar Escola' : 'Criar Escola',
        logDetails,
        schoolToEdit ? user.municipio_id : user.municipio_id,
        currentSchoolId
      );

      showNotification(schoolToEdit ? 'Unidade Escolar atualizada com sucesso!' : 'Unidade Escolar cadastrada com sucesso!', 'success');
      setSchoolToEdit(null);
      setActiveTab('schools');
      setRefreshKey(prev => prev + 1);
      fetchData();

    } catch (error: any) {
      showNotification(`Erro ao salvar dados: ${error.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async (classData: Partial<Class>) => {
    if (!user) return;
    setLoading(true);
    try {

    // Garantir school_id do diretor logado
    const classToSave = {
      ...classData,
      school_id: user.profile === UserProfile.DIRETOR ? user.schoolId : (classData.schoolId || selectedSchoolId)
    };

    if (classData.id) {
      // Modo Edição
      const { data, error } = await supabase
        .from('classes')
        .update({
          name: classToSave.name,
          year: classToSave.year,
          level: classToSave.level,
          shift: classToSave.shift,
          teacher_id: classToSave.teacherId || null,
          mediator_id: classToSave.mediatorId || null,
          school_id: classToSave.school_id
        })
        .eq('id', classData.id)
        .select();

      if (error) {
        console.error('Erro ao atualizar turma:', error);
        showNotification('Erro ao atualizar turma. Verifique sua conexão.', 'error');
        return;
      }

      if (data) {
        setClasses(prev => prev.map(c => c.id === classData.id ? ({
          ...data[0],
          schoolId: data[0].school_id,
          teacherId: data[0].teacher_id,
          mediatorId: data[0].mediator_id,
          level: data[0].level,
          shift: data[0].shift
        } as Class) : c));
        setClassToEdit(null);
        setActiveTab('turmas');
        setRefreshKey(prev => prev + 1);
        const classFields = {
          name: 'Nome da Turma',
          year: 'Ano/Série',
          shift: 'Turno',
          active: 'Status'
        };

        const logDetails = classToEdit
          ? `Editou a turma: ${getDiffLogs(classToEdit, classData, classFields)}`
          : `Criou a turma: ${getCreationLogs(classData, classFields)}`;

        await logActivity(
          'Editar Turma',
          logDetails,
          user.municipio_id,
          data[0].school_id,
          classData.id
        );
        fetchData();
        showNotification('Turma atualizada com sucesso!', 'success');
      }
    } else {
      // Modo Cadastro
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          id: crypto.randomUUID(),
          name: classToSave.name,
          year: classToSave.year,
          level: classToSave.level,
          shift: classToSave.shift,
          teacher_id: classToSave.teacherId || null,
          mediator_id: classToSave.mediatorId || null,
          school_id: classToSave.school_id
        }])
        .select();

      if (error) {
        console.error('Erro ao salvar turma:', error);
        showNotification('Erro ao salvar a nova turma. Verifique os dados.', 'error');
        return;
      }

      if (data) {
        setClasses(prev => [...prev, {
          ...data[0],
          schoolId: data[0].school_id,
          teacherId: data[0].teacher_id,
          mediatorId: data[0].mediator_id,
          level: data[0].level,
          shift: data[0].shift
        } as Class]);
        setActiveTab('turmas');
        setRefreshKey(prev => prev + 1);
        const classFields = {
          name: 'Nome da Turma',
          year: 'Ano/Série',
          shift: 'Turno',
          active: 'Status'
        };

        const logDetails = classToEdit
          ? `Editou a turma: ${getDiffLogs(classToEdit, classData, classFields)}`
          : `Criou a turma: ${getCreationLogs(classData, classFields)}`;

        await logActivity(
          'Criar Turma',
          logDetails,
          user.municipio_id,
          data[0].school_id,
          data[0].id
        );
        fetchData();
        showNotification('Turma cadastrada com sucesso e vinculada à escola!', 'success');
      }
    }
  } catch (err: any) {
    console.error('Erro crítico ao salvar turma:', err);
    showNotification(`Erro ao salvar: ${err.message || 'Erro inesperado'}`, 'error');
  } finally {
    setLoading(false);
  }
};

  const handleDeleteClass = async (classItem: Class) => {
    if (!window.confirm(`Deseja realmente excluir a turma "${classItem.name}"?`)) return;

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classItem.id);

    if (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Certifique-se de que não existem alunos vinculados a ela.');
      return;
    }

    setClasses(prev => prev.filter(c => c.id !== classItem.id));
    setRefreshKey(prev => prev + 1);
    await logActivity(
      'Excluir Turma',
      `Excluiu a turma: ${classItem.name}`,
      user.municipio_id,
      classItem.schoolId
    );
    fetchData();
    showNotification('Turma excluída com sucesso!', 'success');
  };

  const handleDeleteSchool = async (school: School) => {
    if (!window.confirm(`Deseja realmente excluir a unidade escolar "${school.name}"? Esta ação não pode ser desfeita e pode falhar se houverem turmas ou alunos vinculados.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('schools').delete().eq('id', school.id);
      if (error) throw error;
      setSchools(prev => prev.filter(s => s.id !== school.id));
      setRefreshKey(prev => prev + 1);
      await logActivity(
        'Excluir Escola',
        `Excluiu a escola: ${school.name}`,
        school.municipio_id,
        school.id
      );
      fetchData();
      showNotification('Unidade escolar excluída com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao excluir escola:', err);
      showNotification(`Erro ao excluir unidade escolar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    if (!user) return;

    setLoading(true);
    try {
      const studentToSave = {
        ...studentData,
        school_id: user.profile === UserProfile.DIRETOR ? user.schoolId : (studentData.schoolId || selectedSchoolId)
      };

      if (studentData.id) {
        // Modo Edição
        const { data, error } = await supabase
          .from('students')
          .update({
            name: studentToSave.name,
            birth_date: studentToSave.birthDate || null,
            class_id: studentToSave.classId,
            school_id: studentToSave.school_id,
            ra: studentToSave.ra?.trim() || null,
            aee: studentToSave.aee,
            deficiency: studentToSave.deficiency,
            mediator_id: studentToSave.mediatorId || null,
            school_regime: studentToSave.schoolRegime,
            attendance_period: studentToSave.attendancePeriod,
            description: studentToSave.description,
            guardians: studentToSave.guardians,
            has_medical_report: studentToSave.hasMedicalReport,
            medical_report_url: studentToSave.hasMedicalReport ? studentToSave.medicalReportUrl : null,
            diagnosis: studentToSave.diagnosis,
            grade: studentToSave.grade,
            classroom: studentToSave.classroom,
            enrollment_year: studentToSave.enrollment_year || studentToSave.year
          })
          .eq('id', studentData.id)
          .select();

        if (error) throw error;

        if (data) {
          setStudents(prev => prev.map(s => s.id === studentData.id ? ({
            ...data[0],
            schoolId: data[0].school_id,
            classId: data[0].class_id,
            birthDate: data[0].birth_date,
            regentTeacherId: data[0].main_teacher_id,
            mediatorId: data[0].mediator_id,
            schoolRegime: data[0].school_regime,
            attendancePeriod: data[0].attendance_period,
            hasMedicalReport: data[0].has_medical_report,
            medicalReportUrl: data[0].medical_report_url,
            enrollment_year: data[0].enrollment_year
          } as Student) : s));
          setStudentToEdit(null);
          setActiveTab('alunos');
          setRefreshKey(prev => prev + 1);
          const studentFields = {
            name: 'Nome',
            ra: 'RA',
            birthDate: 'Nascimento',
            gender: 'Gênero',
            deficiency: 'Deficiência',
            active: 'Status'
          };

          const logDetails = studentToEdit
            ? `Editou o aluno: ${getDiffLogs(studentToEdit, studentData, studentFields)}`
            : `Criou o aluno: ${getCreationLogs(studentData, studentFields)}`;

          await logActivity(
            'Editar Aluno',
            logDetails,
            user.municipio_id,
            data[0].school_id,
            data[0].id
          );
          fetchData();
          showNotification('Dados do aluno atualizados com sucesso!', 'success');
        }
      } else {
        // Modo Cadastro
        const { data, error } = await supabase
          .from('students')
          .insert([{
            id: crypto.randomUUID(),
            name: studentToSave.name,
            birth_date: studentToSave.birthDate || null,
            class_id: studentToSave.classId,
            school_id: studentToSave.school_id,
            ra: studentToSave.ra?.trim() || null,
            aee: studentToSave.aee,
            deficiency: studentToSave.deficiency,
            mediator_id: studentToSave.mediatorId || null,
            school_regime: studentToSave.schoolRegime,
            attendance_period: studentToSave.attendancePeriod,
            description: studentToSave.description,
            guardians: studentToSave.guardians,
            has_medical_report: studentToSave.hasMedicalReport,
            medical_report_url: studentToSave.hasMedicalReport ? studentToSave.medicalReportUrl : null,
            diagnosis: studentToSave.diagnosis,
            grade: studentToSave.grade,
            classroom: studentToSave.classroom,
            enrollment_year: studentToSave.enrollment_year || studentToSave.year,
            active: true
          }])
          .select();

        if (error) throw error;

        if (data) {
          setStudents(prev => [...prev, {
            ...data[0],
            schoolId: data[0].school_id,
            classId: data[0].class_id,
            birthDate: data[0].birth_date,
            regentTeacherId: data[0].main_teacher_id,
            mediatorId: data[0].mediator_id,
            schoolRegime: data[0].school_regime,
            attendancePeriod: data[0].attendance_period,
            hasMedicalReport: data[0].has_medical_report,
            medicalReportUrl: data[0].medical_report_url,
            enrollment_year: data[0].enrollment_year
          } as Student]);
          setActiveTab('alunos');
          setRefreshKey(prev => prev + 1);
          const studentFields = {
            name: 'Nome',
            ra: 'RA',
            birthDate: 'Nascimento',
            gender: 'Gênero',
            deficiency: 'Deficiência',
            active: 'Status'
          };

          const logDetails = studentToEdit
            ? `Editou o aluno: ${getDiffLogs(studentToEdit, studentData, studentFields)}`
            : `Criou o aluno: ${getCreationLogs(studentData, studentFields)}`;

          await logActivity(
            'Criar Aluno',
            logDetails,
            user.municipio_id,
            data[0].school_id,
            data[0].id
          );
          fetchData();
          showNotification('Matrícula do aluno realizada com sucesso!', 'success');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar aluno:', err);
      let errorMessage = err.message || 'Tente novamente.';
      
      if (err.code === '23505' || (err.message && err.message.includes('unique constraint'))) {
        errorMessage = `O Registro Acadêmico (RA) "${studentData.ra}" já está cadastrado para outro aluno. O RA deve ser único para cada estudante.`;
      }

      alert(`Erro ao salvar aluno: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (s: Student) => {
    if (!window.confirm(`Tem certeza que deseja remover o aluno ${s.name}?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('students').delete().eq('id', s.id);
      if (error) throw error;
      
      setStudents(prev => prev.filter(item => item.id !== s.id));
      setRefreshKey(prev => prev + 1);
      await logActivity(
        'Excluir Aluno',
        `Excluiu o aluno: ${s.name}`,
        user.municipio_id,
        s.schoolId,
        s.id
      );
      fetchData();
      showNotification('Aluno removido com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao excluir aluno:', err);
      showNotification(`Erro ao excluir aluno: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMediator = async (newMediatorData: Partial<User>) => {
    if (!user) return;

    // VALIDAR ROLE E ESCOLA (Diretor só mexe na própria escola)
    if (user.profile === UserProfile.DIRETOR && newMediatorData.schoolId && newMediatorData.schoolId !== user.schoolId) {
      alert('Você só tem permissão para gerenciar mediadores da sua própria escola.');
      return;
    }

    setLoading(true);
    try {
      const mediatorId = newMediatorData.id;

      // Resolver id da escola (Diretor usa o seu próprio, Secretaria/Admin usa a escola selecionada)
      const targetSchoolId = user.profile === UserProfile.DIRETOR ? user.schoolId : (newMediatorData.schoolId || selectedSchoolId);
      
      // Resolver município (Secretaria usa o seu, Admin usa o da escola)
      // Como não temos a escola inteira aqui fácil, podemos buscar na lista de escolas
      const targetSchool = schools.find(s => s.id === targetSchoolId);
      const targetMunicipioId = user.profile === UserProfile.SECRETARIA ? user.municipio_id : (targetSchool?.municipio_id || user.municipio_id);

      let savedUser;
      let finalMediatorId = mediatorId;

      // 1. Processar credenciais no Auth via Edge Function apenas no Modo Criação
      if (!mediatorId && newMediatorData.email) {
        const res = await callUpsertUser(
          newMediatorData.email,
          newMediatorData.name || 'Mediador',
          'mediador',
          newMediatorData.password || undefined,
          targetSchoolId,
          targetMunicipioId
        );

        if (res.error) {
          alert(`Erro ao salvar credenciais do mediador: ${res.error}`);
          setLoading(false);
          return;
        }

        console.log('[App] Resposta Completa da Edge Function:', JSON.stringify(res.data));
        
        // Tenta pegar o ID de todas as formas possíveis que o Supabase/Edge Function podem retornar
        finalMediatorId = 
          res.data?.id || 
          res.data?.user?.id || 
          (res.data?.user && typeof res.data.user === 'string' ? res.data.user : null) ||
          res.data?.data?.id;

        // Se a Edge Function retornou um erro de persistência no objeto 'user', mas o Auth user foi provavelmente criado
        if (!finalMediatorId && res.data?.user?.error && res.data?.success) {
          console.log('[App] Edge Function retornou erro de persistência, tentando recuperar ID...');
        }

        console.log('[App] ID Detectado após Edge Function:', finalMediatorId);

        // Fallback exaustivo: Se ainda não temos o ID, tentamos todas as formas de busca no banco
        if (!finalMediatorId && newMediatorData.email) {
          console.log('[App] Tentando recuperação exaustiva do ID:', newMediatorData.email);
          
          // 1. Buscar por e-mail
          const { data: byEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', newMediatorData.email.trim())
            .maybeSingle();
          
          if (byEmail) {
            finalMediatorId = byEmail.id;
            console.log('[App] ID recuperado por e-mail:', finalMediatorId);
          } else {
            // 2. Se temos auth_user_id da resposta, buscar por ele
            const authIdFromRes = res.data?.auth_user_id || (res.data?.user?.id && typeof res.data.user.id === 'string' ? res.data.user.id : null);
            if (authIdFromRes) {
              const { data: byAuthId } = await supabase
                .from('users')
                .select('id')
                .eq('auth_user_id', authIdFromRes)
                .maybeSingle();
              
              if (byAuthId) {
                finalMediatorId = byAuthId.id;
                console.log('[App] ID recuperado por auth_user_id:', finalMediatorId);
              } else {
                // 3. Se realmente não existe no banco público, TENTA CRIAR agora (sem upsert)
                console.log('[App] Usuário ausente no banco público, criando agora...');
                const { data: created, error: insertErr } = await supabase
                  .from('users')
                  .insert([{
                    auth_user_id: authIdFromRes,
                    email: newMediatorData.email.trim(),
                    name: newMediatorData.name || 'Mediador',
                    role: 'mediador',
                    school_id: targetSchoolId,
                    municipio_id: targetMunicipioId,
                    active: true
                  }])
                  .select()
                  .maybeSingle();
                
                if (created) {
                  finalMediatorId = created.id;
                  console.log('[App] Criado com sucesso manual:', finalMediatorId);
                } else {
                  console.error('[App] Falha na criação manual:', insertErr?.message);
                }
              }
            }
          }
        }
      }

      const userUpdatePayload = {
        name: newMediatorData.name,
        email: newMediatorData.email?.trim(),
        phone_number: newMediatorData.phone?.trim() || null,
        active: newMediatorData.active ?? true,
        school_id: targetSchoolId,
        municipio_id: targetMunicipioId
      };

      if (finalMediatorId) {
        console.log('[App] Atualizando dados do mediador ID:', finalMediatorId);
        // Tenta UPDATE primeiro (mais seguro se o trigger de INSERT estiver quebrado)
        const { data, error: updateError } = await supabase
          .from('users')
          .update(userUpdatePayload)
          .eq('id', finalMediatorId)
          .select()
          .single();

        if (updateError) {
          console.warn('[App] Update falhou, tentando UPSERT por ID:', updateError.message);
          const { data: upsertData, error: upsertError } = await supabase
            .from('users')
            .upsert({ id: finalMediatorId, ...userUpdatePayload })
            .select()
            .single();
          
          if (upsertError) {
            console.warn('[App] UPSERT por ID falhou, tentando UPSERT por e-mail:', upsertError.message);
            const { data: emailUpsertData, error: emailUpsertError } = await supabase
              .from('users')
              .upsert({ ...userUpdatePayload, auth_user_id: res.data?.auth_user_id }, { onConflict: 'email' })
              .select()
              .single();
            
            if (emailUpsertError) {
              console.warn('[App] UPSERT por e-mail falhou, tentando UPSERT por auth_user_id:', emailUpsertError.message);
              const { data: authUpsertData, error: authUpsertError } = await supabase
                .from('users')
                .upsert({ ...userUpdatePayload, auth_user_id: res.data?.auth_user_id }, { onConflict: 'auth_user_id' })
                .select()
                .single();
              
              if (authUpsertError) throw authUpsertError;
              savedUser = authUpsertData;
            } else {
              savedUser = emailUpsertData;
            }
          } else {
            savedUser = upsertData;
          }
        } else {
          savedUser = data;
        }

        // Se houver nova senha em modo edição, atualizar Auth
        if (mediatorId && newMediatorData.password) {
          await callUpsertUser(
            newMediatorData.email!,
            newMediatorData.name || 'Mediador',
            'mediador',
            newMediatorData.password,
            targetSchoolId,
            targetMunicipioId
          );
          
          await supabase.rpc('update_user_password_hash', {
            p_user_id: finalMediatorId,
            p_password: newMediatorData.password
          });
        }

        // Sincronizar mediator_records de forma resiliente
        const { data: existingRecord } = await supabase
          .from('mediator_records')
          .select('id')
          .eq('mediator_id', finalMediatorId)
          .maybeSingle();

        if (existingRecord) {
          await supabase
            .from('mediator_records')
            .update({
              mediator_name: newMediatorData.name,
              mediator_status: newMediatorData.active ? 'Ativo' : 'Inativo'
            })
            .eq('id', existingRecord.id);
        } else {
          await supabase
            .from('mediator_records')
            .insert({
              mediator_id: finalMediatorId,
              mediator_name: newMediatorData.name,
              mediator_status: newMediatorData.active ? 'Ativo' : 'Inativo'
            });
        }
      } else {
        console.error('[App] Falha crítica: finalMediatorId é nulo após todas as tentativas.');
        throw new Error('Não foi possível determinar o ID do mediador para salvar.');
      }

      if (savedUser) {
        const finalMediatorId = savedUser.id;

        // 3. VALIDAR E ATUALIZAR VÍNCULOS (mediator_students)
        const selectedStudentIds = newMediatorData.studentIds || [];

        // Validação de escola: Garante que os alunos vinculados pertencem à escola do mediador
        const invalidStudents = students.filter(s =>
          selectedStudentIds.includes(s.id) && s.schoolId !== (savedUser.school_id || targetSchoolId)
        );

        if (invalidStudents.length > 0) {
          alert(`Erro: Os seguintes alunos não pertencem a esta unidade escolar: ${invalidStudents.map(s => s.name).join(', ')}`);
          setLoading(false);
          return;
        }

        // Sincronização da tabela de junção
        // 3.1 Remover vínculos anteriores
        const { error: deleteError } = await supabase
          .from('mediator_students')
          .delete()
          .eq('mediator_id', finalMediatorId);

        if (deleteError) console.error('Erro ao limpar vínculos anteriores:', deleteError.message);

        // 3.2 Inserir novos vínculos
        if (selectedStudentIds.length > 0) {
          // Limpa vínculos antigos primeiro para evitar duplicatas (Substitui o upsert que falharia)
          await supabase.from('mediator_students').delete().eq('mediator_id', finalMediatorId);

          const newLinks = selectedStudentIds.map(sid => ({
            mediator_id: finalMediatorId,
            student_id: sid
          }));
          const { error: insertError } = await supabase
            .from('mediator_students')
            .insert(newLinks);

          if (insertError) console.error('Erro ao criar novos vínculos:', insertError.message);

          // 3.3 Sincronizar campo mediator_id na tabela students (para compatibilidade e RLS)
          // Primeiro, limpa o mediador de alunos que não estão mais selecionados
          await supabase
            .from('students')
            .update({ mediator_id: null })
            .eq('mediator_id', finalMediatorId);
          
          // Agora, define o mediador para os alunos selecionados
          if (selectedStudentIds.length > 0) {
            await supabase
              .from('students')
              .update({ mediator_id: finalMediatorId })
              .in('id', selectedStudentIds);
          }
        }

        const mappedMediator = {
          ...savedUser,
          profile: savedUser.role as UserProfile,
          email: savedUser.email,
          phone: savedUser.phone_number,
          schoolId: savedUser.school_id || targetSchoolId,
          municipio_id: savedUser.municipio_id || targetMunicipioId,
          studentIds: selectedStudentIds // Persiste localmente para o UI
        } as User;

        // Atualizar lista local em tempo real
        setUsersList(prev => {
          const exists = prev.find(u => u.id === mappedMediator.id);
          if (exists) return prev.map(u => u.id === mappedMediator.id ? mappedMediator : u);
          return [...prev, mappedMediator];
        });

        setIsAddingMediator(false);
        setMediatorToEdit(null);
        setRefreshKey(prev => prev + 1);
        fetchData();

        showNotification(!!mediatorId ? `Dados do(a) mediador(a) atualizados com sucesso!` : `Mediador cadastrado com sucesso!`, 'success');

        const mediatorFields = {
          name: 'Nome',
          email: 'E-mail',
          phone: 'Telefone',
          active: 'Status'
        };

        const logDetails = mediatorId
          ? `Editou o mediador: ${getDiffLogs(mediatorToEdit, newMediatorData, mediatorFields)}`
          : `Criou o mediador: ${getCreationLogs(newMediatorData, mediatorFields)}`;

        logActivity(
          mediatorId ? 'Editar Mediador' : 'Criar Mediador',
          logDetails,
          user.municipio_id,
          mappedMediator.schoolId
        );
      }
    } catch (err: any) {
      console.error('Erro ao salvar mediador:', err);
      alert(`Erro inesperado: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeacher = async (newTeacherData: Partial<User>) => {
    if (!user) return;

    if (teacherToEdit) {
      // Se houver uma nova senha preenchida, chama a edge function para atualizar no Supabase Auth
      if (newTeacherData.password) {
        const authRes = await callUpsertUser(
          teacherToEdit.email!,
          newTeacherData.name || teacherToEdit.name,
          'professor',
          newTeacherData.password,
          user.schoolId,
          user.municipio_id
        );
        if (authRes.error) {
          console.error('Erro ao atualizar senha no Auth:', authRes.error);
          alert('Aviso: Os dados foram atualizados, mas houve falha ao redefinir a senha.');
        }
      }

      // Modo Edição Simples (apenas campos básicos no public.users)
      const { data, error } = await supabase
        .from('users')
        .update({
          name: newTeacherData.name,
          phone_number: newTeacherData.phone,
          active: newTeacherData.active
        })
        .eq('id', teacherToEdit.id)
        .select();

      if (error) {
        console.error('Erro ao atualizar professor:', error);
        alert('Erro ao atualizar no banco.');
        return;
      }

      if (data && data.length > 0) {
        // Atualiza vínculos de turmas
        if (newTeacherData.selectedClassIds) {
          await supabase
            .from('classes')
            .update({ teacher_id: data[0].id })
            .in('id', newTeacherData.selectedClassIds);
        }

        const updatedTeacher = {
          ...data[0],
          profile: data[0].role as UserProfile,
          email: data[0].email
        } as User;
        setUsersList(prev => prev.map(u => u.id === teacherToEdit.id ? updatedTeacher : u));
        setTeacherToEdit(null);
        setActiveTab('teachers');
        setRefreshKey(prev => prev + 1);
        const teacherFields = {
          name: 'Nome',
          phone: 'Telefone',
          active: 'Status'
        };

        await logActivity(
          'Editar Professor',
          `Editou o professor: ${getDiffLogs(teacherToEdit, newTeacherData, teacherFields)}`,
          user.municipio_id,
          updatedTeacher.schoolId
        );
        fetchData();
        showNotification(`Dados do professor ${updatedTeacher.name} atualizados!`, 'success');
      }
    } else {
      // Modo Novo Cadastro ou Atualização via Edge Function (com senha)
      setLoading(true);
      try {
        const res = await callUpsertUser(
          newTeacherData.email!,
          newTeacherData.name || 'Professor',
          'professor',
          newTeacherData.password || undefined, // Só envia se preenchido
          user.schoolId,
          user.municipio_id
        );

        if (res.error) {
          alert(`Erro ao salvar professor: ${res.error}`);
          return;
        }

        // Buscar o registro criado/atualizado para completar os detalhes
        let { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', newTeacherData.email!.trim())
          .maybeSingle();

        let teacherId = userData?.id;

        // Se a Edge Function falhou na persistência mas retornou o ID Auth
        if (!teacherId && res.data?.auth_user_id) {
          console.log('[App] Criando registro de professor na tabela public.users manualmente...');
          const { data: newUser } = await supabase
            .from('users')
            .insert([{
              auth_user_id: res.data.auth_user_id,
              email: newTeacherData.email!.trim(),
              name: newTeacherData.name || 'Professor',
              role: 'professor',
              school_id: user.schoolId,
              municipio_id: user.municipio_id,
              active: true
            }])
            .select()
            .single();
          
          if (newUser) {
            teacherId = newUser.id;
            userData = newUser;
          }
        }

        if (teacherId) {
          // Executa atualizações em paralelo para ganhar performance
          const updatePromises = [
            // 1. Atualizar campos extras em public.users
            supabase
              .from('users')
              .update({
                phone_number: newTeacherData.phone?.trim() || null,
                active: true
              })
              .eq('id', teacherId)
              .select('*')
              .single(),

            // 2. Detalhes complementares em professor_details
            supabase
              .from('professor_details')
              .upsert([{
                user_id: teacherId,
                email_institucional: newTeacherData.email,
                telefone: newTeacherData.phone?.trim() || null
              }])
          ];

          // 3. Vincular turmas (se houver)
          if (newTeacherData.selectedClassIds && newTeacherData.selectedClassIds.length > 0) {
            updatePromises.push(
              supabase
                .from('classes')
                .update({ teacher_id: teacherId })
                .in('id', newTeacherData.selectedClassIds)
            );
          }

          const results = await Promise.all(updatePromises);

          // O primeiro resultado é a atualização do public.users, que retorna o registro completo
          const usersResult = results[0];
          const finalUserData = usersResult.data || userData;

          const firstError = results.find(r => r.error);
          if (firstError) {
            console.error('Erro em uma das operações de salvamento:', firstError.error);
          }

          const savedTeacher = {
            ...finalUserData,
            profile: finalUserData.role as UserProfile,
            email: finalUserData.email || newTeacherData.email,
            phone: finalUserData.phone_number || newTeacherData.phone,
            schoolId: finalUserData.school_id || user.schoolId
          } as User;

          setUsersList(prev => {
            const exists = prev.find(u => u.id === teacherId);
            if (exists) return prev.map(u => u.id === teacherId ? savedTeacher : u);
            return [...prev, savedTeacher];
          });

          // Disparar atualização dos contadores do Dashboard
          setRefreshKey(prev => prev + 1);
          const teacherFields = {
            name: 'Nome',
            email: 'E-mail',
            phone: 'Telefone',
            active: 'Status'
          };

          await logActivity(
            'Criar Professor',
            `Cadastrou o professor: ${getCreationLogs(newTeacherData, teacherFields)}`,
            user.municipio_id,
            savedTeacher.schoolId
          );
          fetchData();

          setTeacherToEdit(null);
          setActiveTab('teachers');
          showNotification('Professor cadastrado com sucesso e credenciais criadas.', 'success');
        }
      } catch (err: any) {
        console.error('Erro crítico ao salvar professor:', err);
        const errorMsg = err.message || err.details || 'Erro desconhecido';
        showNotification(`Erro ao cadastrar professor: ${errorMsg}`, 'error');
        
        // Log de auditoria para falha
        await logActivity(
          'Erro Cadastro Professor',
          `Falha ao tentar cadastrar ${newTeacherData.name}: ${errorMsg}`,
          user.municipio_id,
          user.schoolId
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTeacher = async (teacher: User) => {
    if (!user || user.profile !== UserProfile.DIRETOR) return;

    if (!window.confirm(`Tem certeza que deseja excluir o(a) professor(a) "${teacher.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    try {
      // 1. Limpar referências em turmas
      const { error: classError } = await supabase
        .from('classes')
        .update({ teacher_id: null })
        .eq('teacher_id', teacher.id);

      if (classError) console.warn('Aviso: Erro ao desvincular turmas:', classError.message);

      // 2. Deletar detalhes do professor
      const { error: detailsError } = await supabase
        .from('professor_details')
        .delete()
        .eq('user_id', teacher.id);

      if (detailsError) throw detailsError;

      // 3. Deletar o usuário da tabela pública
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', teacher.id);

      if (userError) throw userError;

      // 4. Atualizar estado local
      setUsersList(prev => prev.filter(u => u.id !== teacher.id));

      showNotification(`Professor(a) ${teacher.name} removido(a) com sucesso!`, 'success');

      // Forçar atualização do dashboard ao voltar
      setRefreshKey(prev => prev + 1);
      await logActivity(
        'Excluir Professor',
        `Removeu o professor: ${teacher.name}`,
        user.municipio_id,
        teacher.schoolId
      );
      fetchData();

    } catch (err: any) {
      console.error('Erro ao excluir professor:', err);
      alert(`Erro ao excluir: ${err.message || 'Ocorreu um erro inesperado.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMediator = async (mediator: User) => {
    if (!user || (user.profile !== UserProfile.DIRETOR && user.profile !== UserProfile.SECRETARIA)) {
      alert('Você não tem permissão para remover mediadores.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja remover o mediador ${mediator.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    try {
      // 1. Limpar dependências em outras tabelas (Foreign Keys)
      
      // 1.1 Desvincular de turmas
      await supabase
        .from('classes')
        .update({ mediator_id: null })
        .eq('mediator_id', mediator.id);

      // 1.2 Desvincular de alunos (coluna direta se houver)
      await supabase
        .from('students')
        .update({ mediator_id: null })
        .eq('mediator_id', mediator.id);

      // 1.3 Limpar registros de mediação
      const { error: recordError } = await supabase
        .from('mediator_records')
        .delete()
        .eq('mediator_id', mediator.id);

      if (recordError) console.warn('Erro ao remover registros:', recordError.message);

      // 1.4 Limpar vínculos na tabela de junção
      const { error: linkageError } = await supabase
        .from('mediator_students')
        .delete()
        .eq('mediator_id', mediator.id);

      if (linkageError) console.warn('Erro ao remover vínculos:', linkageError.message);

      // 2. Remover o usuário da tabela pública
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', mediator.id);

      if (userError) throw userError;

      // 3. Atualizar estado local
      setUsersList(prev => prev.filter(u => u.id !== mediator.id));
      showNotification(`Mediador(a) ${mediator.name} removido(a) com sucesso!`, 'success');
      setRefreshKey(prev => prev + 1);
      await logActivity(
        'Excluir Mediador',
        `Removeu o mediador: ${mediator.name}`,
        user.municipio_id,
        mediator.schoolId
      );
      fetchData();

    } catch (err: any) {
      console.error('Erro ao excluir mediador:', err);
      showNotification(`Falha ao excluir mediador: ${err.message || 'Verifique se existem registros vinculados.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLessonPlan = async (plan: Partial<LessonPlan>) => {
    if (!user) return;

    setLoading(true);
    try {
      const planToSave = {
        school_id: user.schoolId,
        class_id: plan.classId,
        teacher_id: user.id,
        tema_aula: plan.temaAula,
        dia_da_semana: plan.diaDaSemana,
        habilidades_bncc: plan.habilidadesBNCC,
        adaptacoes_metodologia: plan.adaptacoesMetodologia,
        descricao: plan.description,
        objetivos: plan.objetivos,
        estrategias: plan.estrategias,
        compartilhado: plan.shared ?? false,
        atualizado_em: new Date().toISOString()
      };

      let error;
      if (plan.id) {
        const { error: updateError } = await supabase
          .from('lesson_plans')
          .update(planToSave)
          .eq('id', plan.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('lesson_plans')
          .insert([{ ...planToSave, criado_em: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;

      // Sincronizar com student_records como 'atividade' para todos os alunos da turma
      if (!plan.id && plan.classId) {
        const classStudents = students.filter(s => s.classId === plan.classId);
        const today = new Date().toISOString().split('T')[0];
        const authorId = user.id || user.auth_user_id;

        const recordsToSave = classStudents.map(student => ({
          student_id: student.id,
          date: today,
          record_type: 'atividade',
          value: plan.temaAula,
          observation: 'Planejamento Pedagógico: ' + plan.temaAula,
          created_by: authorId
        }));

        if (recordsToSave.length > 0) {
          const { error: bulkError } = await supabase
            .from('student_records')
            .upsert(recordsToSave, {
              onConflict: 'student_id,date,record_type,shift'
            });
          
          if (bulkError) console.error('Erro ao sincronizar atividades em lote:', bulkError);
          // O fetchData() já é chamado abaixo, o que atualizará o estado global
        }
      }

      showNotification(plan.id ? 'Planejamento atualizado com sucesso!' : 'Registro pedagógico salvo com sucesso!', 'success');
      await logActivity(
        plan.id ? 'Editar Planejamento' : 'Criar Planejamento',
        `${plan.id ? 'Editou' : 'Criou'} planejamento: ${plan.temaAula}`,
        user.municipio_id,
        user.schoolId
      );
      fetchData();
      if (user.profile === UserProfile.PROFESSOR) {
        setActiveTab('diario_classe');
        setClassDiaryTab('planejamento');
      } else {
        setActiveTab('registros');
      }
    } catch (err: any) {
      console.error('Erro ao salvar registro pedagógico:', err);
      showNotification(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLessonPlan = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const plan = lessonPlans.find(p => p.id === id);
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showNotification('Planejamento excluído com sucesso!', 'success');
      await logActivity(
        'Excluir Planejamento',
        `Excluiu o planejamento: ${plan?.temaAula || id}`,
        user.municipio_id,
        user.schoolId
      );
      fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir planejamento:', err);
      showNotification(`Erro ao excluir: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderModule = () => {
    if (!user) return null;

    // Se houver um aluno selecionado para visualização, mostrar o perfil independente da aba ativa
    if (selectedStudentIdForView) {
      const student = students.find(s => s.id === selectedStudentIdForView);
      if (student) {
        return (
          <StudentDetailsView
            student={student}
            studentClass={classes.find(c => c.id === student.classId)}
            mediator={usersList.find(u => u.id === student.mediatorId)}
            regentTeacher={usersList.find(u => u.id === student.regentTeacherId)}
            onBack={() => setSelectedStudentIdForView(null)}
            currentUser={user}
            studentRecords={studentRecords}
            onSaveStudentRecord={handleSaveStudentRecord}
            onSaveAttendance={handleSaveAttendance}
          />
        );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            setActiveTab={setActiveTab}
            refreshKey={refreshKey}
            schools={schools}
            students={students}
            classes={classes}
            usersList={usersList}
            reports={reports}
            studentRecords={studentRecords}
            attendances={attendances}
            meals={meals}
            mediationRecords={mediationRecords}
            municipios={municipios}
          />
        );

      case 'admin_total':
        if (user.profile === UserProfile.ADMIN) {
          return (
            <ActivityLogDashboard
              logs={activityLogs}
              municipios={municipios}
              schools={schools}
              users={usersList}
              onRefresh={fetchActivityLogs}
            />
          );
        }
        return null;

      case 'activity_logs':
        return (
          <ActivityLogsTab 
            logs={activityLogs}
            userId={user.id}
          />
        );

      case 'messages':
        return <Messages user={user} />;

      case 'schools':
        if (user.profile === UserProfile.DIRETOR) {
          const mySchool = schools.find(s => s.id === user.schoolId);
          if (!mySchool) {
            return (
              <div className="h-[400px] flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-school-circle-exclamation text-gray-300 text-4xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhuma escola vinculada</h2>
                <p className="text-gray-400 max-w-sm">Seu perfil de Diretor ainda não possui uma unidade escolar atribuída. Entre em contato com a Secretaria de Educação.</p>
              </div>
            );
          }

          return (
            <SchoolDetails
              school={mySchool}
              user={user}
              allClasses={classes}
              allStudents={students}
              allUsers={usersList}
              allMediationRecords={mediationRecords}
              allAttendances={attendances}
              allMeals={meals}
              allReports={reports}
              teachersTable={teachersTable}
              mediatorsTable={mediatorsTable}
              municipios={municipios}
              onBack={() => {}} // Diretor não volta para a lista
              onRefresh={() => { setRefreshKey(prev => prev + 1); }}
              showNotification={showNotification}
            />
          );
        }

        if (!selectedSchoolId) {
          const filteredSchools = schools.filter(s => {
            if (selectedSecretariaId) {
              const sec = usersList.find(u => u.id === selectedSecretariaId);
              return String(s.municipio_id || '').toLowerCase() === String(sec?.municipio_id || '').toLowerCase();
            }
            if (user.profile === UserProfile.ADMIN) {
              if (selectedMunicipioId) return String(s.municipio_id || '').toLowerCase() === String(selectedMunicipioId || '').toLowerCase();
              return true;
            }
            if (user.profile === UserProfile.SECRETARIA) {
              if (!user.municipio_id) return false;
              return s.municipio_id === user.municipio_id;
            }
            return false;
          });

          const selectedSecName = selectedSecretariaId ? usersList.find(u => u.id === selectedSecretariaId)?.name : null;

          return (
            <ModuleWrapper
              title={selectedSecName ? `Escolas — Secretaria ${selectedSecName}` : "Escolas"}
              description={selectedSecName ? `Visualizando unidades vinculadas à secretaria selecionada.` : "Gerenciamento das unidades escolares municipais e monitoramento operacional."}
              onAdd={(user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN) ? () => { setSchoolToEdit(null); setActiveTab('school_registration'); } : undefined}
            >
              <div className="flex flex-col gap-6">
                {user.profile === UserProfile.ADMIN && (
                  <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-location-dot text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtro de Jurisdição</p>
                        <h4 className="font-bold text-gray-800">Filtrar por Município</h4>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                      <select 
                        value={selectedMunicipioId}
                        onChange={(e) => {
                          setSelectedMunicipioId(e.target.value);
                          setSelectedSecretariaId(null); // Resetar filtro de secretaria ao mudar municipio
                        }}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      >
                        <option value="">Todos os Municípios cadastrados</option>
                        {municipios.map(m => (
                          <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                      </select>
                      {selectedSecretariaId && (
                        <button 
                          onClick={() => setSelectedSecretariaId(null)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-xmark"></i>
                          Limpar Filtro de Secretaria
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredSchools.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
                      <i className="fa-solid fa-school-circle-exclamation text-gray-200 text-3xl"></i>
                    </div>
                    <p className="text-gray-400 text-sm font-black uppercase tracking-[0.2em] mb-2">Ops! Unidade não localizada</p>
                    <p className="text-gray-400 text-xs font-medium">
                      {selectedSecretariaId 
                        ? "Nenhuma escola cadastrada para esta secretaria" 
                        : "Nenhum registro encontrado para os critérios selecionados."}
                    </p>
                  </div>
                ) : (
                  <Table<School>
                    data={filteredSchools}
                    onEdit={(user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN) ? (s) => {
                      if (s.municipio_id !== user.municipio_id && user.profile !== UserProfile.ADMIN) {
                        alert('Permissão negada para editar unidades de outro município.');
                        return;
                      }

                      const schoolId = s.id || (s as any).uuid;
                      const hydratedSchool: School = {
                        ...s,
                        id: schoolId,
                        teachers: usersList
                          .filter(u => {
                            const isProfessor = u.profile === UserProfile.PROFESSOR || (u as any).role?.toLowerCase() === 'professor';
                            const isOfSchool = u.schoolId === schoolId || (u as any).school_id === schoolId;
                            const hasClassInSchool = classes.some(c => (c.schoolId === schoolId || (c as any).school_id === schoolId) && (c.teacherId === u.id || (c as any).teacher_id === u.id));
                            return isProfessor && (isOfSchool || hasClassInSchool);
                          })
                          .map(u => ({ id: u.id, name: u.name, subject: 'Geral', contact: u.phone || u.email || '' })), 
                        mediators: usersList
                          .filter(u => {
                            const isMediator = u.profile === UserProfile.MEDIADOR || (u as any).role?.toLowerCase() === 'mediador';
                            const isOfSchool = u.schoolId === schoolId || (u as any).school_id === schoolId;
                            const hasClassInSchool = classes.some(c => (c.schoolId === schoolId || (c as any).school_id === schoolId) && (c.mediatorId === u.id || (c as any).mediator_id === u.id));
                            return isMediator && (isOfSchool || hasClassInSchool);
                          })
                          .map(u => ({ id: u.id, name: u.name, area: 'Inclusão', contact: u.phone || u.email || '' })),
                        classes: classes
                          .filter(c => c.schoolId === schoolId || (c as any).school_id === schoolId)
                          .map(c => ({ id: c.id, name: c.name, level: c.year || c.level, shift: c.shift || '' })),
                        students: students
                          .filter(st => st.schoolId === schoolId || (st as any).school_id === schoolId)
                          .map(st => ({ id: st.id, name: st.name, ra: st.ra, class_name: classes.find(c => c.id === st.classId)?.name || '' }))
                      };

                      setSchoolToEdit(hydratedSchool);
                      setActiveTab('school_registration');
                    } : undefined}
                    onDelete={(user.profile === UserProfile.SECRETARIA || user.profile === UserProfile.ADMIN) ? handleDeleteSchool : undefined}
                    columns={[
                      {
                        header: 'Unidade Escolar',
                        accessor: (s) => (
                          <button
                            onClick={() => setSelectedSchoolId(s.id)}
                            className="font-black text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 group transition-all text-left"
                          >
                            <i className="fa-solid fa-school opacity-30 group-hover:opacity-100 transition-opacity"></i>
                            {s.name}
                          </button>
                        )
                      },
                      ...(user.profile === UserProfile.ADMIN ? [{
                        header: 'Município',
                        accessor: (s: School) => (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-100">
                            {municipios.find(m => m.id === s.municipio_id)?.nome || 'Não vinculado'}
                          </span>
                        )
                      }] : []),
                      { header: 'INEP', accessor: (s) => <span className="font-mono text-xs font-bold text-gray-500">{s.inep}</span> },
                      {
                        header: 'Diretor(a)',
                        accessor: (s) => (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">{s.principalName || 'Não vinculado'}</span>
                            <span className="text-[10px] text-gray-400">{s.principalEmail || '-'}</span>
                          </div>
                        )
                      },
                      { header: 'Endereço', accessor: 'address' },
                      {
                        header: 'Estrutura (P | T | A)',
                        accessor: (s) => (
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5" title="Professores">
                              <i className="fa-solid fa-chalkboard-user text-purple-400 text-[10px]"></i>
                              <span className="text-[10px] font-black text-gray-700">{s.teacherCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Turmas">
                              <i className="fa-solid fa-layer-group text-blue-400 text-[10px]"></i>
                              <span className="text-[10px] font-black text-gray-700">{s.classCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Alunos">
                              <i className="fa-solid fa-graduation-cap text-emerald-400 text-[10px]"></i>
                              <span className="text-[10px] font-black text-gray-700">{s.studentCount || 0}</span>
                            </div>
                          </div>
                        )
                      },
                      {
                        header: 'Status',
                        accessor: (s) => (
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                            <span className={`text-[10px] font-black uppercase ${s.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {s.active ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                        )
                      }
                    ]}
                  />
                )}
              </div>
            </ModuleWrapper>
          );
        }

        const selectedSchool = schools.find(s => s.id === selectedSchoolId);
        if (!selectedSchool) return null;

        return (
          <SchoolDetails
            school={selectedSchool}
            user={user}
            allClasses={classes}
            allStudents={students}
            allUsers={usersList}
            allMediationRecords={mediationRecords}
            allAttendances={attendances}
            allMeals={meals}
            allReports={reports}
            teachersTable={teachersTable}
            mediatorsTable={mediatorsTable}
            municipios={municipios}
            onBack={() => setSelectedSchoolId(null)}
            onRefresh={() => { setRefreshKey(prev => prev + 1); fetchData(); }}
            showNotification={showNotification}
          />
        );

      case 'turmas':
        if (user.profile === UserProfile.SECRETARIA) return null;

        if (selectedClassIdForStudents) {
          const cls = classes.find(c => c.id === selectedClassIdForStudents);
          const classStudents = students.filter(s => s.classId === selectedClassIdForStudents);
          if (cls) {
            return (
              <ModuleWrapper
                title={`Alunos da Turma: ${cls.name}`}
                description={`Lista de alunos matriculados no ano letivo de ${cls.year}.`}
                onAdd={undefined}
              >
                <div className="mb-6">
                  <button
                    onClick={() => setSelectedClassIdForStudents(null)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <i className="fa-solid fa-arrow-left"></i> Voltar para Turmas
                  </button>
                </div>
                <Table<Student>
                  data={classStudents}
                  columns={[
                    { header: 'Nome do Aluno', accessor: 'name' },
                    { header: 'RA', accessor: 'ra' },
                    { header: 'Deficiência', accessor: 'deficiency' },
                    { header: 'AEE', accessor: (s) => s.aee ? <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">SIM</span> : 'NÃO' },
                    { header: 'Data de Nascimento', accessor: (s) => s.birthDate ? new Date(s.birthDate).toLocaleDateString('pt-BR') : 'N/A' }
                  ]}
                />
              </ModuleWrapper>
            );
          }
        }

        const filteredClasses = user.profile === UserProfile.DIRETOR
          ? classes.filter(c => c.schoolId === user.schoolId)
          : user.profile === UserProfile.PROFESSOR
            ? classes.filter(c => c.teacherId === user.id)
            : classes;

        return (
          <ModuleWrapper
            title="Turmas"
            description="Gestão de classes e atribuição de professores e mediadores."
            onAdd={user.profile === UserProfile.DIRETOR ? () => { setClassToEdit(null); setActiveTab('class_registration'); } : undefined}
          >
            <Table<Class>
              data={filteredClasses}
              onRowClick={(c) => setSelectedClassIdForStudents(c.id)}
              onEdit={user.profile === UserProfile.DIRETOR ? (c) => { setClassToEdit(c); setActiveTab('class_registration'); } : undefined}
              onDelete={user.profile === UserProfile.DIRETOR ? handleDeleteClass : undefined}
              columns={[
                { header: 'Turma', accessor: 'name' },
                { header: 'Ano Letivo', accessor: 'year' },
                {
                  header: 'Professor',
                  accessor: (c) => usersList.find(u => u.id === c.teacherId)?.name || 'Não atribuído'
                },
                {
                  header: 'Mediador',
                  accessor: (c) => usersList.find(u => u.id === c.mediatorId)?.name || <span className="text-gray-300 italic">Nenhum</span>
                },
                {
                  header: 'Alunos',
                  accessor: (c) => students.filter(s => s.classId === c.id).length
                }
              ]}
            />
          </ModuleWrapper>
        );

      case 'class_registration':
        return (
          <ClassRegistration
            teachers={usersList.filter(u => u.profile === UserProfile.PROFESSOR && (user.profile === UserProfile.DIRETOR ? u.schoolId === user.schoolId : true))}
            mediators={usersList.filter(u => u.profile === UserProfile.MEDIADOR && (user.profile === UserProfile.DIRETOR ? u.schoolId === user.schoolId : true))}
            onSave={handleSaveClass}
            onCancel={() => { setClassToEdit(null); setActiveTab('turmas'); }}
            initialData={classToEdit}
          />
        );

      case 'teachers':
        if (user.profile === UserProfile.SECRETARIA) return null;
        if (selectedTeacherId && user.profile === UserProfile.DIRETOR) {
          const teacher = usersList.find(u => u.id === selectedTeacherId);
          if (teacher) {
            return (
              <TeacherDetails
                teacher={teacher}
                classes={classes.filter(c => c.teacherId === selectedTeacherId)}
                lessonPlans={lessonPlans.filter(p => p.teacherId === selectedTeacherId)}
                onBack={() => setSelectedTeacherId(null)}
              />
            );
          }
        }

        const schoolTeachers = user.profile === UserProfile.DIRETOR
          ? usersList.filter(u => u.profile === UserProfile.PROFESSOR && (u.schoolId === user.schoolId || classes.some(c => c.teacherId === u.id && c.schoolId === user.schoolId)))
          : usersList.filter(u => u.profile === UserProfile.PROFESSOR);

        return (
          <div className="space-y-6">
              <ModuleWrapper
                title="Corpo Docente"
                description="Visualização e cadastro dos professores regentes da unidade escolar."
                onAdd={user.profile === UserProfile.DIRETOR ? () => { setTeacherToEdit(null); setActiveTab('teacher_registration'); } : undefined}
              >
                <Table<User>
                  data={schoolTeachers}
                  onEdit={user.profile === UserProfile.DIRETOR ? (u) => { setTeacherToEdit(u); setActiveTab('teacher_registration'); } : undefined}
                  onDelete={user.profile === UserProfile.DIRETOR ? handleDeleteTeacher : undefined}
                  columns={[
                    {
                      header: 'Professor(a)', accessor: (u) => (
                        <button
                          onClick={() => setSelectedTeacherId(u.id)}
                          className="flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-2xl transition-all group w-full"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <i className="fa-solid fa-chalkboard-user"></i>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-all">{u.name}</span>
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Clique para ver histórico</span>
                          </div>
                        </button>
                      )
                    },
                    { header: 'E-mail Institucional', accessor: 'email' },
                    {
                      header: 'Turmas / Disciplinas', accessor: (u) => {
                        const linkedClasses = classes.filter(c => c.teacherId === u.id);
                        if (linkedClasses.length === 0) return <span className="text-gray-300 italic">Nenhuma turma</span>;
                        return (
                          <div className="flex flex-wrap gap-1">
                            {linkedClasses.map(c => (
                              <span key={c.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-lg border border-blue-100">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Status', accessor: (u) => (
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>
                      )
                    }
                  ]}
                />
              </ModuleWrapper>
          </div>
        );

      case 'teacher_registration':
        return (
          <TeacherRegistration
            availableClasses={classes.filter(c => user.profile === UserProfile.DIRETOR ? c.schoolId === user.schoolId : true)}
            onSave={handleSaveTeacher}
            onCancel={() => { setTeacherToEdit(null); setActiveTab('teachers'); }}
            onQuickAddClass={() => setActiveTab('class_registration')}
            initialData={teacherToEdit}
            isLoading={loading}
          />
        );

      case 'inclusive_plans':
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherInclusivePlans students={teacherStudents} classes={teacherClasses} user={user} studentRecords={studentRecords} logActivity={logActivity} onBack={() => setActiveTab('dashboard')} />;
        }
        return null;

      case 'alunos':
        if (user.profile === UserProfile.SECRETARIA) return null;

        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherStudents students={teacherStudents} classes={teacherClasses} attendances={attendances} onSaveAttendance={handleSaveAttendance} onSaveStudentRecord={handleSaveStudentRecord} currentUser={user} onViewProfile={setSelectedStudentIdForView} />;
        }
        if (user.profile === UserProfile.MEDIADOR) {
          const mediatorStudents = students.filter(s => s.mediatorId === user.id || user.studentIds?.includes(s.id));
          return <MediatorStudents 
                    students={mediatorStudents} 
                    classes={classes} 
                    attendances={attendances}
                    mediationRecords={mediationRecords}
                    onSaveAttendance={handleSaveAttendance}
                    onSaveMediationRecord={handleSaveMediationRecord}
                    currentUser={user} 
                  />;
        }

        const filteredStudents = user.profile === UserProfile.DIRETOR
          ? students.filter(s => s.schoolId === user.schoolId || classes.find(c => c.id === s.classId)?.schoolId === user.schoolId)
          : students;

        return (
          <ModuleWrapper
            title="Alunos"
            description="Cadastro de alunos e monitoramento de AEE."
            onAdd={user.profile === UserProfile.DIRETOR ? () => { setStudentToEdit(null); setActiveTab('student_registration'); } : undefined}
          >
            <Table<Student>
              data={filteredStudents}
              onEdit={user.profile === UserProfile.DIRETOR ? (s) => { setStudentToEdit(s); setActiveTab('student_registration'); } : undefined}
              onDelete={user.profile === UserProfile.DIRETOR ? handleDeleteStudent : undefined}
              columns={[
                {
                  header: 'Aluno(a)',
                  accessor: (s) => (
                    <button
                      onClick={() => setSelectedStudentIdForView(s.id)}
                      className="flex items-center gap-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-2xl transition-all group w-full"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-all">{s.name}</span>
                        <span className="text-[9px] font-black uppercase text-emerald-500/60 tracking-tighter">Ver perfil completo</span>
                      </div>
                    </button>
                  )
                },
                {
                  header: 'Idade',
                  accessor: (s) => s.birthDate ? `${new Date().getFullYear() - new Date(s.birthDate).getFullYear()} anos` : 'N/A'
                },
                {
                  header: 'Turma',
                  accessor: (s) => classes.find(c => c.id === s.classId)?.name || 'Sem turma'
                },
                {
                  header: 'Status',
                  accessor: () => <span className="text-emerald-500 font-black text-[10px] uppercase">Matriculado</span>
                },
                {
                  header: 'Mediador',
                  accessor: (s) => usersList.find(u => u.id === s.mediatorId)?.name || <span className="text-gray-300 italic">Sem mediador</span>
                }
              ]}
            />
          </ModuleWrapper>
        );

      case 'student_registration':
        return (
          <StudentRegistration
            classes={classes.filter(c => user.profile === UserProfile.DIRETOR ? c.schoolId === user.schoolId : true)}
            mediators={usersList.filter(u => u.profile === UserProfile.MEDIADOR && (user.profile === UserProfile.DIRETOR ? u.schoolId === user.schoolId : true))}
            onSave={handleSaveStudent}
            onCancel={() => { setStudentToEdit(null); setActiveTab('alunos'); }}
            initialData={studentToEdit}
          />
        );

      case 'refeicoes':
        if (user.profile === UserProfile.PROFESSOR || user.profile === UserProfile.MEDIADOR || user.profile === UserProfile.DIRETOR) {
          const profileClasses = user.profile === UserProfile.PROFESSOR 
            ? classes.filter(c => c.teacherId === user.id)
            : user.profile === UserProfile.MEDIADOR 
              ? classes.filter(c => c.mediatorId === user.id)
              : classes.filter(c => c.schoolId === user.schoolId);
          
          const profileStudents = user.profile === UserProfile.PROFESSOR 
            ? students.filter(s => profileClasses.some(c => c.id === s.classId))
            : user.profile === UserProfile.MEDIADOR
              ? students.filter(s => s.mediatorId === user.id || user.studentIds?.includes(s.id))
              : students.filter(s => s.schoolId === user.schoolId);

          return (
            <TeacherMeals 
              students={profileStudents} 
              classes={profileClasses} 
              meals={meals} 
              onSaveMeal={handleSaveMeal}
              onUpdateStudentHealth={handleUpdateStudentHealth} 
              currentUser={user} 
            />
          );
        }
        return null;

      case 'mediation':
        if (user.profile === UserProfile.MEDIADOR) {
          const mediatorStudents = students.filter(s => s.mediatorId === user.id || user.studentIds?.includes(s.id));
          const filteredStudentRecords = studentRecords.filter(r => mediatorStudents.some(s => s.id === r.studentId));
          return <MediatorRecords records={mediationRecords.filter(r => r.authorId === user.id)} studentRecords={filteredStudentRecords} students={mediatorStudents} classes={classes} onViewProfile={setSelectedStudentIdForView} />;
        }

        if (isAddingMediator && user.profile === UserProfile.DIRETOR) {
          const availableStudents = students.filter(s => s.schoolId === user.schoolId || classes.find(c => c.id === s.classId)?.schoolId === user.schoolId);
          return (
            <div className="space-y-6">
              <button
                onClick={() => setIsAddingMediator(false)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i> Voltar para Mediação
              </button>
              <MediatorRegistration
                availableStudents={availableStudents}
                onSave={handleSaveMediator}
                onCancel={() => { setIsAddingMediator(false); setMediatorToEdit(null); }}
                initialData={mediatorToEdit}
                isLoading={loading}
              />
            </div>
          );
        }

        const schoolMediators = user.profile === UserProfile.DIRETOR
          ? usersList.filter(u => u.profile === UserProfile.MEDIADOR && (u.schoolId === user.schoolId || classes.some(c => c.mediatorId === u.id && c.schoolId === user.schoolId)))
          : (user.profile === UserProfile.SECRETARIA
            ? usersList.filter(u => u.profile === UserProfile.MEDIADOR && schools.find(s => s.id === u.schoolId)?.municipio_id === user.municipio_id)
            : usersList.filter(u => u.profile === UserProfile.MEDIADOR));

        const selectedMediator = selectedMediatorId ? usersList.find(u => u.id === selectedMediatorId) : null;
        const filteredMediationRecords = selectedMediatorId 
          ? mediationRecords.filter(r => r.authorId === selectedMediatorId)
          : [];

        return (
          <div className="space-y-8">
            <ModuleWrapper
              title={user.profile === UserProfile.DIRETOR ? "Mediadores da Unidade" : "Mediadores da Rede"}
              description="Gestão do quadro de mediadores e histórico de registros."
              onAdd={user.profile === UserProfile.DIRETOR ? () => setIsAddingMediator(true) : undefined}
            >
              <Table<User>
                data={schoolMediators}
                onEdit={user.profile === UserProfile.DIRETOR ? (u) => { setMediatorToEdit(u); setIsAddingMediator(true); } : undefined}
                onDelete={user.profile === UserProfile.DIRETOR ? handleDeleteMediator : undefined}
                columns={[
                  {
                    header: 'Mediador', accessor: (u) => (
                      <button
                        onClick={() => setSelectedMediatorId(selectedMediatorId === u.id ? null : u.id)}
                        className={`flex items-center gap-3 text-left p-2 rounded-2xl transition-all group w-full ${selectedMediatorId === u.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${selectedMediatorId === u.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold transition-all ${selectedMediatorId === u.id ? 'text-indigo-700' : 'text-gray-800 group-hover:text-indigo-600'}`}>{u.name}</span>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">
                            {selectedMediatorId === u.id ? 'Ocultar Registros' : 'Ver Histórico de Registros'}
                          </span>
                        </div>
                      </button>
                    )
                  },
                  { header: 'E-mail', accessor: 'email' },
                  {
                    header: 'Escola / Unidade',
                    accessor: (u) => {
                      const school = schools.find(s => s.id === u.schoolId);
                      return school ? (
                        <span className="text-gray-600 font-medium">{school.name}</span>
                      ) : <span className="text-gray-300 italic">Não vinculado</span>;
                    }
                  },
                  {
                    header: 'Status', accessor: (u) => (
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    )
                  }
                ]}
              />
            </ModuleWrapper>

            {selectedMediatorId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <ModuleWrapper 
                  title={`Registros de Mediação: ${selectedMediator?.name}`} 
                  description={`Histórico de anotações diárias do(a) mediador(a).`}
                >
                  {filteredMediationRecords.length > 0 ? (
                    <Table<MediationRecord>
                      data={filteredMediationRecords}
                      columns={[
                        { header: 'Data', accessor: (r) => new Date(r.date).toLocaleDateString('pt-BR') },
                        { header: 'Aluno', accessor: (r) => students.find(s => s.id === r.studentId)?.name || 'N/A' },
                        { header: 'Status', accessor: (r) => (
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                            r.status === 'Crítico' || r.status === 'Alerta' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {r.status}
                          </span>
                        )},
                        { header: 'Comportamento', accessor: 'behaviorStatus' },
                        { header: 'Observação', accessor: (r) => <span className="text-xs text-gray-500 italic max-w-xs truncate block" title={r.description}>{r.description}</span> }
                      ]}
                    />
                  ) : (
                    <div className="p-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <i className="fa-solid fa-folder-open text-xl"></i>
                      </div>
                      <p className="text-gray-500 font-bold">Nenhum registro encontrado</p>
                      <p className="text-gray-400 text-xs mt-1">Este mediador ainda não realizou anotações no sistema.</p>
                    </div>
                  )}
                </ModuleWrapper>
              </div>
            )}
          </div>
        );

      case 'db_analysis':
        return <DBAnalysis />;

      case 'registros':
        // Admin vê o painel de cadastro de Municípios e Secretarias
        if (user.profile === UserProfile.ADMIN) {
          return (
            <AdminRegistros 
              onSelectSchool={(id) => { setSelectedSchoolId(id); setActiveTab('schools'); }} 
              onSelectSecretaria={(sec) => {
                setSelectedSecretariaId(sec.id);
                setSelectedMunicipioId(''); // Limpar muni específico para prevalecer o da secretaria
                setActiveTab('schools');
              }}
              logActivity={logActivity}
            />
          );
        }
        // Professor vê seus registros pedagógicos
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherRecords
            students={teacherStudents}
            classes={teacherClasses}
            lessonPlans={lessonPlans}
            initialClassId={selectedClassIdForActivity}
            onSave={handleSaveLessonPlan}
          />;
        }
        return null;

      case 'relatorios':
        if (user.profile === UserProfile.MEDIADOR) {
          return <MediatorReports students={students.filter(s => s.mediatorId === user.id || user.studentIds?.includes(s.id))} classes={classes} />;
        }
        return null;

      case 'configuracoes':
        if (user.profile === UserProfile.PROFESSOR) return <TeacherSettings user={user} setUser={setUser} showNotification={showNotification} />;
        if (user.profile === UserProfile.MEDIADOR) return <MediatorSettings />;
        return (
          <Settings 
            user={user} 
            onUpdateTheme={handleUpdateUserTheme} 
            systemSettings={systemSettings}
            onUpdateSystemSettings={handleUpdateSystemSettings}
            setSystemSettings={setSystemSettings}
          />
        );

      case 'school_registration':
        return (
          <div className="space-y-6">
            <div className="mb-2">
              <button
                onClick={() => { setSchoolToEdit(null); setActiveTab('schools'); }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-arrow-left"></i> Voltar para Escolas
              </button>
            </div>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Cadastrar Nova Unidade</h1>
                <p className="text-gray-500 text-sm">Integração de nova escola à rede municipal de educação.</p>
              </div>
            </header>
            <SchoolRegistration
              onSave={handleSaveSchool}
              onCancel={() => { setSchoolToEdit(null); setActiveTab('schools'); }}
              initialData={schoolToEdit}
            />
          </div>
        );

      case 'curso_inclusao':
        return <CourseTab />;

      case 'help':
        return <HelpGuide />;

      case 'diario_classe':
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          
          return (
            <ClassDiary
              activeSubTab={classDiaryTab}
              onSubTabChange={setClassDiaryTab}
              classesComponent={
                <TeacherClasses 
                  classes={teacherClasses} 
                  students={teacherStudents} 
                  onRegisterActivity={(classId) => {
                    setSelectedClassIdForActivity(classId);
                    setClassDiaryTab('planejamento');
                  }} 
                />
              }
              studentsComponent={
                <TeacherStudents 
                  students={teacherStudents} 
                  classes={teacherClasses} 
                  attendances={attendances} 
                  onSaveAttendance={handleSaveAttendance} 
                  onSaveStudentRecord={handleSaveStudentRecord} 
                  currentUser={user} 
                  onViewProfile={setSelectedStudentIdForView} 
                />
              }
              inclusivePlansComponent={
                <TeacherInclusivePlans 
                  students={teacherStudents} 
                  classes={teacherClasses} 
                  user={user} 
                  studentRecords={studentRecords}
                />
              }
              pedagogicalPlanningComponent={
                <TeacherRecords
                  students={teacherStudents}
                  classes={teacherClasses}
                  lessonPlans={lessonPlans}
                  initialClassId={selectedClassIdForActivity}
                  onSave={handleSaveLessonPlan}
                  onDelete={handleDeleteLessonPlan}
                />
              }
            />
          );
        }
        return null;

      default:
        return (
          <div className="bg-white p-20 rounded-2xl border border-gray-100 text-center">
            <i className="fa-solid fa-hammer text-gray-200 text-6xl mb-6"></i>
            <h2 className="text-xl font-bold text-gray-800">Módulo em Desenvolvimento</h2>
            <p className="text-gray-500">Estamos trabalhando para liberar este recurso em breve.</p>
          </div>
        );
    }
  };
  if (loading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">Iniciando Sistema...</h2>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} isLoading={loading} />;
  }

  // Fallback para caso o perfil demore mas o usuário forçou a entrada
  const effectiveUser = user || {
    id: 'anonymous',
    name: 'Usuário',
    role: 'professor',
    profile: UserProfile.PROFESSOR,
    active: true,
    email: '',
    themePreference: 'light'
  } as User;

  return (
    <Layout 
      user={effectiveUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      backgroundTheme={systemSettings.backgroundTheme}
    >
      <style>{`
        :root {
          --primary-button-color: ${systemSettings.buttonColor || '#2563eb'};
          --system-font-family: ${systemSettings.fontFamily ? `'${systemSettings.fontFamily}', sans-serif` : "'Inter', sans-serif"};
          --system-font-size: ${systemSettings.fontSize || '14px'};
        }
        html {
          font-size: var(--system-font-size);
        }
        body {
          font-family: var(--system-font-family);
        }
        .btn-custom, 
        button:not(.bg-slate-900):not(.bg-red-500):not(.bg-emerald-50):not(.bg-blue-50):not(.bg-rose-50):not(.bg-indigo-50):not(.bg-amber-50):not(.bg-gray-100):not(.bg-white\/10) {
          background-color: var(--primary-button-color) !important;
        }
        /* Corrigir botões específicos para não sobrescrever cores de status */
        .bg-blue-600 { background-color: var(--primary-button-color) !important; }
        .hover\:bg-blue-700:hover { filter: brightness(0.9); }
      `}</style>
      <div className="animate-in fade-in duration-500">
        {renderModule()}
      </div>

      {/* Notificação Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-100'
            : notification.type === 'error'
              ? 'bg-rose-50 border-rose-100 text-rose-800 shadow-rose-100'
              : 'bg-blue-50 border-blue-100 text-blue-800 shadow-blue-100'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
              }`}>
              <i className={`fa-solid ${notification.type === 'success' ? 'fa-check' : notification.type === 'error' ? 'fa-xmark' : 'fa-info'
                } text-white text-sm`}></i>
            </div>
            <p className="font-semibold text-sm">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
