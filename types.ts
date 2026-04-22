
export enum UserProfile {
  ADMIN = 'Administrador Geral',
  SECRETARIA = 'Secretaria de Educação',
  DIRETOR = 'Diretor Principal',
  PROFESSOR = 'Professor Oficial',
  MEDIADOR = 'Mediador Oficial',
  ESCOLA = 'Login da Escola'
}

export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  municipio_id?: string;
  schoolId?: string;
  classId?: string;
  studentIds?: string[];
  active?: boolean;
  password?: string;
  phone?: string;
  cpf?: string;
  observations?: string;
  themePreference?: 'light' | 'dark';
  selectedClassIds?: string[];
  buttonColor?: string;
  fontFamily?: string;
  fontSize?: string;
}

export interface SystemSettings {
  id?: string;
  buttonColor: string;
  fontFamily: string;
  fontSize: string;
  studentLimit: number;
  mediatorRatio: number;
  activeLanguage: string;
  backgroundTheme?: string;
  interfaceDensity?: string;
  interfaceStyle?: string;
  interfaceShadows?: string;
  interfaceAnimations?: string;
}

export interface Message {
  id: string;
  remetente_id: string;
  remetente_email: string;
  destinatario_id: string;
  destinatario_email: string;
  conteudo: string;
  data_envio: string;
  lido: boolean;
  municipio_id: string;
}

export interface SchoolTeacherDetail {
  id?: string;
  name: string;
  subject: string;
  contact: string;
}

export interface SchoolMediatorDetail {
  id?: string;
  name: string;
  area: string;
  contact: string;
}

export interface SchoolClassDetail {
  id?: string;
  name: string;
  level: string;
  shift: string;
}

export interface SchoolStudentDetail {
  id?: string;
  name: string;
  ra: string;
  class_name: string;
}

export interface Municipio {
  id: string;
  nome: string;
  created_at?: string;
}

export interface School {
  id: string;
  name: string;
  inep: string;
  address: string;
  neighborhood?: string;
  city?: string;
  municipality?: string;
  municipio_id?: string;
  state?: string;
  zipCode?: string;
  principalName?: string;
  principalEmail?: string;
  principalPassword?: string;
  email?: string;
  phone?: string;
  type?: string;
  active?: boolean;
  teacherCount?: number;
  mediatorCount?: number;
  classCount?: number;
  studentCount?: number;
  observations?: string;
  createdAt?: string;
  teachers?: SchoolTeacherDetail[];
  mediators?: SchoolMediatorDetail[];
  classes?: SchoolClassDetail[];
  students?: SchoolStudentDetail[];
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  teacherId: string;
  mediatorId?: string;
  year: string;
  shift?: string;
  level?: string;
}

export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface Student {
  id: string;
  name: string;
  ra: string;
  classId: string;
  schoolId?: string;
  aee: boolean;
  deficiency: string;
  birth_date?: string; // Mapeado do banco
  birthDate?: string;  // Legado usado no app
  regentTeacherId?: string;
  mediatorId?: string;
  schoolRegime?: 'Integral' | 'Parcial';
  attendancePeriod?: 'Manhã' | 'Tarde';
  turno?: 'parcial' | 'integral';
  description?: string;
  guardians?: Guardian[];
  hasMedicalReport?: boolean;
  medicalReportUrl?: string;
  diagnosis?: string;
  grade?: string;
  classroom?: string;
  active?: boolean;
  enrollment_year?: number;
  year?: number;
  created_at?: string;
  last_monitoring_at?: string;
  notas?: Record<string, Record<string, number>>;
  refeicoes?: any[];
  evacuacao?: any[];
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  teacherId: string;
  schoolId: string;
  date: string;
  status: 'presente' | 'falta';
  shift?: string;
}

// Added missing Meal interface to support student meal tracking data
export interface Meal {
  id: string;
  studentId: string;
  schoolId: string;
  date: string;
  type: string;
  status: string;
  sono?: boolean;
  evacuou?: boolean;
  observations?: string;
}

export interface MediationRecord {
  id: string;
  studentId: string;
  schoolId?: string;
  classId?: string;
  date: string;
  description: string;
  authorId: string;
  status: string;
  behaviorStatus: string; // CALMO, AGITADO, EM CRISE, ENGAJADO
  hygiene: string; // FEZ SOZINHO, COM AUXÍLIO
  feeding: string; // FEZ SOZINHO, COM AUXÍLIO
  mobility: string; // FEZ SOZINHO, COM AUXÍLIO
  medication: string; // FEZ SOZINHO, COM AUXÍLIO
  interactedStudents: string; // SIM, NÃO
  groupActivity: string; // SIM, NÃO
  eyeContact: string; // SIM, NÃO
  type?: 'Pedagógica' | 'Comportamental' | 'Familiar' | 'Social';
}

export interface Report {
  id: string;
  title: string;
  type: 'PEI' | 'PDI' | 'PAEE';
  studentId: string;
  schoolId: string;
  status: 'rascunho' | 'finalizado';
  updatedAt: string;
  description?: string;
}

export interface BNCCSkill {
  id: string;
  code: string;
  description: string;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  classId: string;
  schoolId: string;
  temaAula: string;
  habilidadesBNCC: any;
  adaptacoesMetodologia: string;
  description?: string;
  objetivos?: string;
  estrategias?: string;
  shared?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentRecord {
  id: string;
  studentId: string;
  date: string;
  recordType: 'presenca' | 'refeicao' | 'atividade' | 'observacao';
  value: string;
  observation?: string;
  createdBy: string;
  createdAt: string;
  shift?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  perfil: string;
  acao: string;
  detalhes: any;
  municipio_id?: string;
  school_id?: string;
  criado_em: string;
}