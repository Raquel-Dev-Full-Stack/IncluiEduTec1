import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
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
import Settings from './components/Settings';
import DBAnalysis from './components/DBAnalysis';
import ModuleWrapper from './components/ModuleWrapper';
import Table from './components/Table';
import { User, UserProfile, School, Student, MediationRecord, Class, LessonPlan, Attendance, Meal } from './types';
import { MOCK_USERS, MOCK_SCHOOLS, MOCK_STUDENTS, MOCK_MEDIATION_RECORDS, MOCK_CLASSES, MOCK_LESSON_PLANS, MOCK_MEALS } from './constants';
import { supabase } from './lib/supabaseClient';

// Função para buscar perfil do usuário no public.users via auth_user_id
const fetchUserProfile = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
  return data;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teacherSubTab, setTeacherSubTab] = useState<'list' | 'records'>('list');

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
  const [teachersTable, setTeachersTable] = useState<any[]>([]);
  const [mediatorsTable, setMediatorsTable] = useState<any[]>([]);
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

  // Helper para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const callUpsertUser = async (email: string, name: string, role: string, pass?: string, school_id?: string) => {
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
            school_id: school_id || user?.schoolId,
            municipio_id: user?.municipio_id
          })
        }
      );
      if (!response.ok) {
        const err = await response.json();
        console.error(`Erro ao processar ${role} (${email}):`, err.error);
        return { error: err.error, email };
      }
      return { success: true };
    } catch (e: any) {
      console.error(`Erro na chamada da função para ${email}:`, e);
      return { error: e.message, email };
    }
  };

  // Função para carregar todos os dados necessários de forma resiliente
  const fetchData = useCallback(async () => {
    console.log('fetchData: Iniciando carga de dados resiliente...');

    // Função auxiliar para busca segura
    const safeFetch = async (table: string, query = '*') => {
      try {
        const { data, error } = await supabase.from(table).select(query);
        if (error) {
          console.error(`fetchData: Erro na tabela ${table}:`, error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error(`fetchData: Falha crítica na tabela ${table}:`, err);
        return [];
      }
    };

    const schoolsData = (await safeFetch('schools')) as any[];
    const studentsData = (await safeFetch('students')) as any[];
    const classesData = (await safeFetch('classes')) as any[];
    const usersData = (await safeFetch('users')) as any[];
    const mediatorStudentsData = (await safeFetch('mediator_students')) as any[];
    const mediationData = (await safeFetch('mediator_records')) as any[];
    const attendancesData = (await safeFetch('attendance')) as any[];
    const mealsData = (await safeFetch('meals')) as any[];
    const reportsData = (await safeFetch('reports')) as any[];
    const lessonPlansData = (await safeFetch('lesson_plans')) as any[];

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
      description: s.description || '',
      guardians: s.guardians || [],
      hasMedicalReport: s.has_medical_report || false,
      medicalReportUrl: s.medical_report_url || '',
      year: s.enrollment_year || s.year || 0
    })) as Student[]);

    setClasses(classesData.map(c => ({
      ...c,
      schoolId: c.school_id,
      teacherId: c.teacher_id,
      mediatorId: c.mediator_id,
      year: c.year // Garantindo uso da coluna 'year'
    })) as Class[]);

    if (usersData.length > 0) {
      const roleToProfileMap: Record<string, UserProfile> = {
        'admin_geral': UserProfile.ADMIN,
        'secretaria': UserProfile.SECRETARIA,
        'diretor': UserProfile.DIRETOR,
        'professor': UserProfile.PROFESSOR,
        'mediador': UserProfile.MEDIADOR
      };

      setUsersList(usersData.map(u => {
        // Agrupar IDs de alunos da tabela de junção mediator_students
        const linkedStudentIds = mediatorStudentsData
          .filter((ms: any) => ms.mediator_id === u.id)
          .map((ms: any) => ms.student_id);

        return {
          ...u,
          profile: roleToProfileMap[u.role] || UserProfile.PROFESSOR,
          schoolId: u.school_id,
          studentIds: linkedStudentIds // Agora vindo da tabela de junção
        };
      }) as User[]);
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

    setAttendances(attendancesData.map(a => ({
      ...a,
      studentId: a.student_id,
      classId: a.class_id || '',
      teacherId: a.teacher_id || '',
      schoolId: a.school_id || ''
    })) as Attendance[]);

    setMeals(mealsData.map(m => ({
      ...m,
      studentId: m.student_id,
      schoolId: m.school_id
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
      habilidadesBNCC: lp.habilidades_bncc,
      adaptacoesMetodologia: lp.adaptacoes_metodologia,
      createdAt: lp.criado_em,
      updatedAt: lp.atualizado_em
    })) as LessonPlan[]);

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
      const initialUser = {
        id: authUser.id, // Fallback se não encontrar o ID do public.users
        auth_user_id: authUser.id,
        name: metadata.name || 'Usuário',
        role: metadata.role || 'professor',
        profile: roleToProfileMap[metadata.role] || UserProfile.PROFESSOR,
        schoolId: metadata.school_id,
        municipio_id: metadata.municipio_id,
        themePreference: 'light' // Padrão inicial
      } as unknown as User;

      setUser(initialUser);
      setIsLoggedIn(true);
      setLoading(false); // Libera a tela de "Iniciando..." imediatamente

      // Agora, em background, busca o perfil real no banco para dados extras e consistência
      fetchUserProfile(authUser.id).then(userData => {
        if (userData && mounted) {
          const savedTheme = localStorage.getItem(`incluiedutec_theme_user_${userData.id}`) as 'light' | 'dark' | null;
          setUser(prev => ({
            ...prev,
            ...userData,
            profile: roleToProfileMap[userData.role] || userData.role,
            themePreference: savedTheme || 'light'
          } as unknown as User));
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
      console.log('App: Evento Auth:', event);
      if (!mounted) return;

      // Responde apenas ao login explícito do usuário
      if (event === 'SIGNED_IN' && session) {
        await processUserSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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

  const handleLogin = async (emailOrName: string, profile: UserProfile, password?: string) => {
    if (!password) {
      showNotification('A senha é obrigatória.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Validar e Autenticar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailOrName,
        password: password
      });

      if (authError) {
        const errorMsg = authError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : `Erro na autenticação: ${authError.message}`;
        showNotification(errorMsg, 'error');
        setLoading(false);
        return;
      }

      // 2. Buscar perfil detalhado no RPC/Table para validar perfil (role)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user?.id)
        .maybeSingle();

      if (userError || !userData) {
        await supabase.auth.signOut();
        showNotification('Perfil não encontrado no sistema.', 'error');
        setLoading(false);
        return;
      }

      const roleToProfileMap: Record<string, UserProfile> = {
        'admin_geral': UserProfile.ADMIN,
        'secretaria': UserProfile.SECRETARIA,
        'diretor': UserProfile.DIRETOR,
        'professor': UserProfile.PROFESSOR,
        'mediador': UserProfile.MEDIADOR
      };

      const mappedProfile = roleToProfileMap[userData.role];
      if (mappedProfile !== profile) {
        showNotification(`Perfil selecionado (${profile}) não corresponde ao seu registro (${mappedProfile}).`, 'error');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // O onAuthStateChange cuidará de setar o usuário e carregar dados
      // Mas podemos redirecionar imediatamente aqui
      if (mappedProfile === UserProfile.MEDIADOR) setActiveTab('alunos');
      else if (mappedProfile === UserProfile.PROFESSOR) setActiveTab('turmas');
      else setActiveTab('dashboard');

      showNotification('Login realizado com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao realizar login:', error);
      showNotification('Ocorreu um erro inesperado durante o login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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

  const handleSaveAttendance = (attendanceData: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      ...attendanceData,
      id: `att_${Date.now()}`
    };
    setAttendances(prev => {
      // Remove registro anterior se houver para o mesmo aluno e mesma data (YYYY-MM-DD)
      const existingRemoved = prev.filter(a =>
        !(a.studentId === attendanceData.studentId && a.date.startsWith(attendanceData.date.split('T')[0]))
      );
      return [...existingRemoved, newAttendance];
    });
  };

  const handleSaveMeal = (mealData: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMeals(prev => {
      // Remove registro anterior para o mesmo aluno, data e tipo de refeição
      const filtered = prev.filter(m =>
        !(m.studentId === mealData.studentId &&
          m.date.startsWith(mealData.date.split('T')[0]) &&
          m.type === mealData.type)
      );
      return [...filtered, newMeal];
    });
  };

  const handleSaveMediationRecord = (recordData: Omit<MediationRecord, 'id'>) => {
    const newRecord: MediationRecord = {
      ...recordData,
      id: `med_${Date.now()}`
    };
    setMediationRecords(prev => [...prev, newRecord]);
  };

  const handleSaveSchool = async (newSchoolData: School) => {
    if (!user) return;

    // RESTRIÇÃO: Apenas Secretaria de Educação pode salvar/editar escolas
    if (user.profile !== UserProfile.SECRETARIA) {
      alert('Acesso negado. Apenas a Secretaria de Educação pode gerenciar unidades escolares.');
      return;
    }

    // RESTRIÇÃO MUNICIPAL: Validar se a escola pertence ao município do usuário
    // Na criação (sem ID), vinculamos automaticamente. Na edição, validamos.
    if (schoolToEdit && schoolToEdit.municipio_id !== user.municipio_id && user.profile !== UserProfile.ADMIN) {
      alert('Acesso negado. Você não tem permissão para editar escolas de outro município.');
      return;
    }

    setLoading(true);

    try {
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
        municipio_id: user.municipio_id,
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

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('schools')
          .insert([schoolToSave])
          .select();

        if (error) throw error;
        if (data) currentSchoolId = data[0].id;
      }

      if (!currentSchoolId) throw new Error("Falha ao obter ID da escola para salvamento detalhado.");

      // 2.5 Gerenciar Credenciais (Auth + public.users) via Edge Function
      // Agora usamos a função callUpsertUser definida no escopo superior

      // 1. Processar Diretor
      if (newSchoolData.principalEmail) {
        const res = await callUpsertUser(
          newSchoolData.principalEmail,
          newSchoolData.principalName || 'Diretor',
          'diretor',
          newSchoolData.principalPassword || undefined,
          currentSchoolId
        );
        if (res.error) {
          showNotification(`Escola salva! Mas erro nas credenciais do diretor: ${res.error}`, 'error');
        }
      }

      // 3. Cadastrar Detalhes (Professores, Mediadores, Turmas, Alunos)

      const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

      // Professores
      if (newSchoolData.teachers && newSchoolData.teachers.length > 0) {
        // Primeiro salvamos em public.users via Edge Function se tiver email para garantir Auth
        // Se não tiver email, o upsert bulk normal resolve.
        const authPromises = newSchoolData.teachers
          .filter(t => t.contact && isEmail(t.contact))
          .map(t => callUpsertUser(t.contact!.trim(), t.name, 'professor', undefined, currentSchoolId));

        await Promise.all(authPromises);

        // Upsert bulk para garantir que todos (com ou sem email) estejam no public.users do município
        const teachersToInsert = newSchoolData.teachers.map(t => {
          const contact = t.contact?.trim() || '';
          const email = isEmail(contact) ? contact : null;
          const phone = !isEmail(contact) ? contact : null;

          return {
            name: t.name,
            role: 'professor',
            school_id: currentSchoolId,
            municipio_id: user.municipio_id,
            email: email,
            phone_number: phone,
            active: true
          };
        });
        const { error: teacherError } = await supabase.from('users').upsert(teachersToInsert, { onConflict: 'name, school_id' });
        if (teacherError) throw teacherError;
      }

      // Mediadores
      if (newSchoolData.mediators && newSchoolData.mediators.length > 0) {
        const authPromises = newSchoolData.mediators
          .filter(m => m.contact && isEmail(m.contact))
          .map(m => callUpsertUser(m.contact!.trim(), m.name, 'mediador'));

        await Promise.all(authPromises);

        const mediatorsToInsert = newSchoolData.mediators.map(m => {
          const contact = m.contact?.trim() || '';
          const email = isEmail(contact) ? contact : null;
          const phone = !isEmail(contact) ? contact : null;

          return {
            name: m.name,
            role: 'mediador',
            school_id: currentSchoolId,
            municipio_id: user.municipio_id,
            email: email,
            phone_number: phone,
            active: true
          };
        });
        const { error: mediatorError } = await supabase.from('users').upsert(mediatorsToInsert, { onConflict: 'name, school_id' });
        if (mediatorError) throw mediatorError;
      }


      // Turmas
      if (newSchoolData.classes && newSchoolData.classes.length > 0) {
        const classesToInsert = newSchoolData.classes.map(c => ({
          name: c.name,
          level: c.level,
          shift: c.shift,
          school_id: currentSchoolId
        }));
        const { error: classError } = await supabase.from('classes').upsert(classesToInsert, { onConflict: 'name, school_id' });
        if (classError) throw classError;
      }

      // Alunos
      if (newSchoolData.students && newSchoolData.students.length > 0) {
        // Primeiro, precisamos buscar as turmas recém-criadas/atualizadas para ter os IDs corretos
        const { data: currentClasses } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', currentSchoolId);

        const studentsToInsert = newSchoolData.students.map(s => {
          // Tenta encontrar o ID da turma pelo nome informado no formulário
          const matchedClass = currentClasses?.find(c => c.name === s.class_name);

          return {
            name: s.name,
            ra: s.ra,
            school_id: currentSchoolId,
            class_id: matchedClass?.id || null, // Vincula se encontrar, senão deixa nulo
            active: true
          };
        });
        const { error: studentError } = await supabase.from('students').upsert(studentsToInsert, { onConflict: 'ra' });
        if (studentError) throw studentError;
      }

      // 4. Finalização
      // Recarregar os dados do banco para garantir que as listas (professores, turmas, alunos) estejam sincronizadas
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

      if (updatedSchools) setSchools(updatedSchools.map(s => ({
        ...s,
        zipCode: s.zip_code,
        principalName: s.principal_name,
        principalEmail: s.principal_email,
        teacherCount: s.teacher_count,
        mediatorCount: s.mediator_count,
        classCount: s.class_count,
        studentCount: s.student_count,
        createdAt: s.created_at
      })) as School[]);

      if (updatedUsers) {
        const roleToProfileMap: Record<string, UserProfile> = {
          'admin_geral': UserProfile.ADMIN,
          'secretaria': UserProfile.SECRETARIA,
          'diretor': UserProfile.DIRETOR,
          'professor': UserProfile.PROFESSOR,
          'mediador': UserProfile.MEDIADOR
        };
        setUsersList(updatedUsers.map(u => ({
          ...u,
          profile: roleToProfileMap[u.role] || u.role,
          schoolId: u.school_id
        })) as User[]);
      }

      if (updatedClasses) setClasses(updatedClasses.map(c => ({
        ...c,
        schoolId: c.school_id,
        teacherId: c.teacher_id,
        mediatorId: c.mediator_id
      })) as Class[]);

      if (updatedStudents) setStudents(updatedStudents.map(s => ({
        ...s,
        ra: s.ra,
        classId: s.class_id,
        schoolId: s.school_id,
        regentTeacherId: s.regent_teacher_id,
        mediatorId: s.mediator_id
      })) as Student[]);


      setSchoolToEdit(null);
      setActiveTab('schools');
      showNotification("Unidade Escolar atualizada com sucesso! Todos os perfis e turmas foram vinculados.", 'success');

    } catch (error: any) {
      console.error('Erro no fluxo de salvamento:', error);
      showNotification(`Erro ao salvar dados: ${error.message || 'Tente novamente.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async (classData: Partial<Class>) => {
    if (!user) return;

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
        alert('Erro ao atualizar turma. Tente novamente.');
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
        alert('Turma atualizada com sucesso!');
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
        alert('Erro ao salvar turma. Tente novamente.');
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
        alert('Turma cadastrada com sucesso!');
      }
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
    alert('Turma excluída com sucesso!');
  };

  const handleDeleteSchool = async (school: School) => {
    if (!window.confirm(`Deseja realmente excluir a unidade escolar "${school.name}"? Esta ação não pode ser desfeita e pode falhar se houverem turmas ou alunos vinculados.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);

      if (error) {
        console.error('Erro ao excluir escola:', error);
        alert('Erro ao excluir unidade escolar. Certifique-se de que não existem turmas, alunos ou registros vinculados a ela.');
        return;
      }

      setSchools(prev => prev.filter(s => s.id !== school.id));
      alert('Unidade escolar excluída com sucesso!');
    } catch (err) {
      console.error('Erro inesperado ao excluir escola:', err);
      alert('Ocorreu um erro inesperado ao tentar excluir a unidade escolar.');
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
            birth_date: studentToSave.birthDate,
            class_id: studentToSave.classId,
            school_id: studentToSave.school_id,
            ra: studentToSave.ra,
            aee: studentToSave.aee,
            deficiency: studentToSave.deficiency,
            mediator_id: studentToSave.mediatorId || null,
            school_regime: studentToSave.schoolRegime,
            attendance_period: studentToSave.attendancePeriod,
            description: studentToSave.description,
            guardians: studentToSave.guardians,
            has_medical_report: studentToSave.hasMedicalReport,
            medical_report_url: studentToSave.hasMedicalReport ? studentToSave.medicalReportUrl : null
          })
          .eq('id', studentData.id)
          .select();

        if (error) throw error;

        if (data) {
          setStudents(prev => prev.map(s => s.id === studentData.id ? ({
            ...data[0],
            schoolId: data[0].school_id,
            classId: data[0].class_id,
            birthDate: data[0].birth_date
          } as Student) : s));
          setStudentToEdit(null);
          setActiveTab('alunos');
          showNotification('Dados do aluno atualizados com sucesso!', 'success');
        }
      } else {
        // Modo Cadastro
        const { data, error } = await supabase
          .from('students')
          .insert([{
            id: crypto.randomUUID(),
            name: studentToSave.name,
            birth_date: studentToSave.birthDate,
            class_id: studentToSave.classId,
            school_id: studentToSave.school_id,
            ra: studentToSave.ra,
            aee: studentToSave.aee,
            deficiency: studentToSave.deficiency,
            mediator_id: studentToSave.mediatorId || null,
            school_regime: studentToSave.schoolRegime,
            attendance_period: studentToSave.attendancePeriod,
            description: studentToSave.description,
            guardians: studentToSave.guardians,
            has_medical_report: studentToSave.hasMedicalReport,
            medical_report_url: studentToSave.hasMedicalReport ? studentToSave.medicalReportUrl : null,
            active: true
          }])
          .select();

        if (error) throw error;

        if (data) {
          setStudents(prev => [...prev, {
            ...data[0],
            schoolId: data[0].school_id,
            classId: data[0].class_id,
            birthDate: data[0].birth_date
          } as Student]);
          setActiveTab('alunos');
          showNotification('Matrícula do aluno realizada com sucesso!', 'success');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar aluno:', err);
      alert(`Erro ao salvar aluno: ${err.message || 'Tente novamente.'} ${err.details || ''}`);
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
      // 1. Processar credenciais no Auth via Edge Function (se houver email/senha)
      if (newMediatorData.email) {
        const res = await callUpsertUser(
          newMediatorData.email,
          newMediatorData.name || 'Mediador',
          'mediador',
          newMediatorData.password || undefined,
          user.schoolId
        );

        if (res.error) {
          alert(`Erro ao salvar credenciais do mediador: ${res.error}`);
          setLoading(false);
          return;
        }
      }

      // 2. Atualizar dados no public.users (incluindo senha_hash via RPC se houver senha)
      const mediatorId = newMediatorData.id;

      const userUpdatePayload = {
        name: newMediatorData.name,
        email: newMediatorData.email,
        phone_number: newMediatorData.phone?.trim() || null,
        active: newMediatorData.active ?? true,
        school_id: user.schoolId
      };

      let savedUser;

      if (mediatorId) {
        // MODO EDIÇÃO
        const { data, error } = await supabase
          .from('users')
          .update(userUpdatePayload)
          .eq('id', mediatorId)
          .select()
          .single();

        if (error) throw error;
        savedUser = data;

        // Se houver nova senha, atualizar senha_hash
        if (newMediatorData.password) {
          const { error: pwdError } = await supabase.rpc('update_user_password_hash', {
            p_user_id: mediatorId,
            p_password: newMediatorData.password
          });
          if (pwdError) console.error('Aviso: Erro ao gerar hash da nova senha:', pwdError.message);
        }

        // Sincronizar dados denormalizados em mediator_records
        await supabase
          .from('mediator_records')
          .update({
            mediator_name: newMediatorData.name,
            mediator_status: newMediatorData.active ? 'Ativo' : 'Inativo'
          })
          .eq('mediator_id', mediatorId);

      } else {
        // MODO NOVO CADASTRO
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', newMediatorData.email!)
          .maybeSingle();

        if (error) throw error;
        savedUser = data;
      }

      if (savedUser) {
        const finalMediatorId = savedUser.id;

        // 3. VALIDAR E ATUALIZAR VÍNCULOS (mediator_students)
        const selectedStudentIds = newMediatorData.studentIds || [];

        // Validação de escola: Garante que os alunos vinculados pertencem à escola do mediador
        const invalidStudents = students.filter(s =>
          selectedStudentIds.includes(s.id) && s.schoolId !== (savedUser.school_id || user.schoolId)
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
          const newLinks = selectedStudentIds.map(sid => ({
            mediator_id: finalMediatorId,
            student_id: sid
          }));
          const { error: insertError } = await supabase
            .from('mediator_students')
            .insert(newLinks);

          if (insertError) console.error('Erro ao criar novos vínculos:', insertError.message);
        }

        const mappedMediator = {
          ...savedUser,
          profile: savedUser.role as UserProfile,
          email: savedUser.email,
          phone: savedUser.phone_number,
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

        showNotification(`Dados do(a) mediador(a) ${mappedMediator.name} salvos com sucesso!`, 'success');
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
      // Modo Edição Simples (apenas campos básicos)
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
          user.schoolId
        );

        if (res.error) {
          alert(`Erro ao salvar professor: ${res.error}`);
          return;
        }

        // Buscar o registro criado/atualizado para completar os detalhes
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', newTeacherData.email!)
          .maybeSingle();

        const teacherId = userData?.id;

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
            email: finalUserData.email,
            phone: finalUserData.phone_number
          } as User;

          setUsersList(prev => {
            const exists = prev.find(u => u.id === teacherId);
            if (exists) return prev.map(u => u.id === teacherId ? savedTeacher : u);
            return [...prev, savedTeacher];
          });

          // Disparar atualização dos contadores do Dashboard
          setRefreshKey(prev => prev + 1);

          setTeacherToEdit(null);
          setActiveTab('teachers');
          showNotification(`Professor ${savedTeacher.name} salvo com sucesso!`, 'success');
        }
      } catch (err) {
        console.error('Erro ao salvar professor:', err);
        alert('Ocorreu um erro inesperado.');
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
      fetchData();

    } catch (err: any) {
      console.error('Erro ao excluir professor:', err);
      alert(`Erro ao excluir: ${err.message || 'Ocorreu um erro inesperado.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMediator = async (mediator: User) => {
    if (!user || user.profile !== UserProfile.DIRETOR) return;

    if (!window.confirm(`Tem certeza que deseja remover o mediador ${mediator.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    try {
      // 1. Limpar registros de mediação e vínculos
      const { error: recordError } = await supabase
        .from('mediator_records')
        .delete()
        .eq('mediator_id', mediator.id);

      if (recordError) {
        console.warn('Aviso: Erro ao remover registros de mediação:', recordError.message);
      }

      const { error: linkageError } = await supabase
        .from('mediator_students')
        .delete()
        .eq('mediator_id', mediator.id);

      if (linkageError) {
        console.warn('Aviso: Erro ao remover vínculos de alunos:', linkageError.message);
      }

      // 2. Remover o usuário
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', mediator.id)
        .eq('school_id', user.schoolId); // Segurança extra

      if (userError) throw userError;

      // 3. Atualizar estado local
      setUsersList(prev => prev.filter(u => u.id !== mediator.id));
      showNotification(`Mediador(a) ${mediator.name} removido(a) com sucesso!`, 'success');

      // Forçar atualização do dashboard
      setRefreshKey(prev => prev + 1);

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
        habilidades_bncc: plan.habilidadesBNCC,
        adaptacoes_metodologia: plan.adaptacoesMetodologia,
        descricao: plan.description,
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

      showNotification('Registro pedagógico salvo com sucesso!', 'success');
      fetchData();
      setActiveTab('registros');
    } catch (err: any) {
      console.error('Erro ao salvar registro pedagógico:', err);
      showNotification(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderModule = () => {
    if (!user) return null;

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
          />
        );

      case 'messages':
        return <Messages user={user} />;

      case 'schools':
        if (!selectedSchoolId) {
          // FILTRO POR MUNICÍPIO E PERFIL
          // Secretaria vê apenas escolas do SEU município
          // Diretor vê apenas a SUA escola
          const filteredSchools = schools.filter(s => {
            if (user.profile === UserProfile.ADMIN) return true;
            if (user.profile === UserProfile.SECRETARIA) return s.municipio_id === user.municipio_id;
            if (user.profile === UserProfile.DIRETOR) return s.id === user.schoolId;
            return false;
          });

          return (
            <ModuleWrapper
              title="Escolas"
              description="Gerenciamento das unidades escolares municipais e monitoramento operacional."
              onAdd={user.profile === UserProfile.SECRETARIA ? () => { setSchoolToEdit(null); setActiveTab('school_registration'); } : undefined}
            >
              <Table<School>
                data={filteredSchools}
                onEdit={user.profile === UserProfile.SECRETARIA ? (s) => {
                  if (s.municipio_id !== user.municipio_id && user.profile !== UserProfile.ADMIN) {
                    alert('Permissão negada para editar unidades de outro município.');
                    return;
                  }

                  // HIDRATAÇÃO: Anexar dados relacionados para que apareçam no formulário
                  const hydratedSchool: School = {
                    ...s,
                    teachers: usersList
                      .filter(u => u.schoolId === s.id && u.profile === UserProfile.PROFESSOR)
                      .map(u => ({ name: u.name, subject: 'Geral', contact: u.phone || '' })), // Mapeamento básico
                    mediators: usersList
                      .filter(u => u.schoolId === s.id && u.profile === UserProfile.MEDIADOR)
                      .map(u => ({ name: u.name, area: 'Inclusão', contact: u.phone || '' })),
                    classes: classes
                      .filter(c => c.schoolId === s.id)
                      .map(c => ({ name: c.name, level: c.year, shift: c.shift || '' })),
                    students: students
                      .filter(st => st.schoolId === s.id)
                      .map(st => ({ name: st.name, ra: st.ra, class_name: '' }))
                  };

                  setSchoolToEdit(hydratedSchool);
                  setActiveTab('school_registration');
                } : undefined}
                onDelete={user.profile === UserProfile.SECRETARIA ? handleDeleteSchool : undefined}
                columns={[
                  {
                    header: 'Unidade Escolar',
                    accessor: (s) => (
                      <button
                        onClick={() => setSelectedSchoolId(s.id)}
                        className="font-black text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 group transition-all"
                      >
                        <i className="fa-solid fa-school opacity-30 group-hover:opacity-100 transition-opacity"></i>
                        {s.name}
                      </button>
                    )
                  },
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
            onBack={() => setSelectedSchoolId(null)}
          />
        );

      case 'turmas':
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          return <TeacherClasses
            classes={teacherClasses}
            students={students}
            onRegisterActivity={(classId) => {
              setSelectedClassIdForActivity(classId);
              setActiveTab('registros');
            }}
          />;
        }
        if (user.profile === UserProfile.MEDIADOR) {
          const mediatorClasses = classes.filter(c => c.mediatorId === user.id || students.filter(s => user.studentIds?.includes(s.id)).some(s => s.classId === c.id));
          return <MediatorClasses classes={mediatorClasses} students={students.filter(s => user.studentIds?.includes(s.id))} />;
        }

        const filteredClasses = user.profile === UserProfile.DIRETOR
          ? classes.filter(c => c.schoolId === user.schoolId)
          : (user.profile === UserProfile.SECRETARIA
            ? classes.filter(c => schools.find(s => s.id === c.schoolId)?.municipio_id === user.municipio_id)
            : classes);

        return (
          <ModuleWrapper
            title="Turmas"
            description="Gestão de classes e atribuição de professores e mediadores."
            onAdd={user.profile === UserProfile.DIRETOR ? () => { setClassToEdit(null); setActiveTab('class_registration'); } : undefined}
          >
            <Table<Class>
              data={filteredClasses}
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
          ? usersList.filter(u => u.profile === UserProfile.PROFESSOR && u.schoolId === user.schoolId)
          : (user.profile === UserProfile.SECRETARIA
            ? usersList.filter(u => u.profile === UserProfile.PROFESSOR && schools.find(s => s.id === u.schoolId)?.municipio_id === user.municipio_id)
            : usersList.filter(u => u.profile === UserProfile.PROFESSOR));

        return (
          <div className="space-y-6">
            {/* Sub-abas exclusivas para o Diretor */}
            {user.profile === UserProfile.DIRETOR && (
              <div className="flex bg-white p-1 rounded-2xl border border-gray-100 w-fit shadow-sm">
                <button
                  onClick={() => setTeacherSubTab('list')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${teacherSubTab === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Corpo Docente
                </button>
                <button
                  onClick={() => setTeacherSubTab('records')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${teacherSubTab === 'records' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Registros Pedagógicos
                </button>
              </div>
            )}

            {teacherSubTab === 'list' ? (
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
            ) : (
              <DirectorTeacherRecords
                user={user}
                lessonPlans={lessonPlans}
                usersList={usersList}
                classes={classes}
                students={students}
              />
            )}
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
          />
        );

      case 'inclusive_plans':
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherInclusivePlans students={teacherStudents} classes={teacherClasses} user={user} />;
        }
        return null;

      case 'alunos':
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherStudents students={teacherStudents} classes={teacherClasses} attendances={attendances} onSaveAttendance={handleSaveAttendance} currentUser={user} />;
        }
        if (user.profile === UserProfile.MEDIADOR) {
          const mediatorStudents = students.filter(s => user.studentIds?.includes(s.id));
          return (
            <MediatorStudents
              students={mediatorStudents}
              classes={classes}
              attendances={attendances}
              mediationRecords={mediationRecords}
              onSaveAttendance={handleSaveAttendance}
              onSaveMediationRecord={handleSaveMediationRecord}
              currentUser={user}
            />
          );
        }

        const filteredStudents = user.profile === UserProfile.DIRETOR
          ? students.filter(s => s.schoolId === user.schoolId || classes.find(c => c.id === s.classId)?.schoolId === user.schoolId)
          : (user.profile === UserProfile.SECRETARIA
            ? students.filter(s => schools.find(sch => sch.id === s.schoolId)?.municipio_id === user.municipio_id)
            : students);

        return (
          <ModuleWrapper
            title="Alunos"
            description="Cadastro de alunos e monitoramento de AEE."
            onAdd={user.profile === UserProfile.DIRETOR ? () => { setStudentToEdit(null); setActiveTab('student_registration'); } : undefined}
          >
            <Table<Student>
              data={filteredStudents}
              onEdit={user.profile === UserProfile.DIRETOR ? (s) => { setStudentToEdit(s); setActiveTab('student_registration'); } : undefined}
              onDelete={user.profile === UserProfile.DIRETOR ? async (s) => {
                if (window.confirm(`Tem certeza que deseja remover o aluno ${s.name}?`)) {
                  const { error } = await supabase.from('students').delete().eq('id', s.id);
                  if (error) alert('Erro ao excluir aluno.');
                  else setStudents(prev => prev.filter(item => item.id !== s.id));
                }
              } : undefined}
              columns={[
                { header: 'Nome', accessor: (s) => <span className="font-bold text-gray-800">{s.name}</span> },
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
        if (user.profile === UserProfile.PROFESSOR) {
          const teacherClasses = classes.filter(c => c.teacherId === user.id);
          const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));
          return <TeacherMeals students={teacherStudents} classes={teacherClasses} meals={meals} onSaveMeal={handleSaveMeal} currentUser={user} />;
        }
        return null;

      case 'mediation':
        if (user.profile === UserProfile.MEDIADOR) {
          return <MediatorRecords records={mediationRecords.filter(r => r.authorId === user.id)} students={students} classes={classes} />;
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
              />
            </div>
          );
        }

        if (selectedMediatorId && user.profile === UserProfile.DIRETOR) {
          const mediator = usersList.find(u => u.id === selectedMediatorId);
          if (mediator) {
            return (
              <MediatorDetails
                mediator={mediator}
                students={students}
                records={mediationRecords.filter(r => r.authorId === selectedMediatorId)}
                onBack={() => setSelectedMediatorId(null)}
              />
            );
          }
        }

        const schoolMediators = user.profile === UserProfile.DIRETOR
          ? usersList.filter(u => u.profile === UserProfile.MEDIADOR && u.schoolId === user.schoolId)
          : [];

        return (
          <div className="space-y-8">
            {user.profile === UserProfile.DIRETOR && (
              <ModuleWrapper
                title="Mediadores da Unidade"
                description="Gestão do quadro de mediadores e credenciais de acesso."
                onAdd={() => setIsAddingMediator(true)}
              >
                <Table<User>
                  data={schoolMediators}
                  onEdit={(u) => { setMediatorToEdit(u); setIsAddingMediator(true); }}
                  onDelete={handleDeleteMediator}
                  columns={[
                    {
                      header: 'Mediador', accessor: (u) => (
                        <button
                          onClick={() => setSelectedMediatorId(u.id)}
                          className="flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-2xl transition-all group w-full"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition-all">{u.name}</span>
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Ver Histórico de Registros</span>
                          </div>
                        </button>
                      )
                    },
                    { header: 'E-mail', accessor: 'email' },
                    {
                      header: 'Turma',
                      accessor: (u) => {
                        const mediatorClass = classes.find(c => c.mediatorId === u.id);
                        return mediatorClass ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-lg border border-blue-100">
                            {mediatorClass.name}
                          </span>
                        ) : <span className="text-gray-300 italic">Não vinculado</span>;
                      }
                    },
                    {
                      header: 'Alunos Vinculados', accessor: (u) => {
                        const linked = students.filter(s => u.studentIds?.includes(s.id));
                        if (linked.length === 0) return <span className="text-gray-300 italic">Nhum vínculo</span>;
                        return (
                          <div className="flex flex-wrap gap-1">
                            {linked.map(s => (
                              <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-lg border border-indigo-100">
                                {s.name.split(' ')[0]}
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
            )}

            <ModuleWrapper title="Registros de Mediação" description="Anotações diárias de acompanhamento inclusivo.">
              <Table<MediationRecord>
                data={mediationRecords}
                columns={[
                  { header: 'Data', accessor: (r) => new Date(r.date).toLocaleDateString('pt-BR') },
                  { header: 'Aluno', accessor: (r) => students.find(s => s.id === r.studentId)?.name || 'N/A' },
                  { header: 'Status', accessor: (r) => <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase">{r.status}</span> },
                  { header: 'Comportamento', accessor: 'behaviorStatus' }
                ]}
              />
            </ModuleWrapper>
          </div>
        );

      case 'db_analysis':
        return <DBAnalysis />;

      case 'registros':
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
          return <MediatorReports students={students.filter(s => user.studentIds?.includes(s.id))} classes={classes} />;
        }
        return null;

      case 'configuracoes':
        if (user.profile === UserProfile.PROFESSOR) return <TeacherSettings />;
        if (user.profile === UserProfile.MEDIADOR) return <MediatorSettings />;
        return <Settings user={user} onUpdateTheme={handleUpdateUserTheme} />;

      case 'school_registration':
        return (
          <div className="space-y-6">
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
    <Layout user={effectiveUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
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
