import { UserProfile, User, School, Class, Student, Report, Meal, MediationRecord, BNCCSkill, LessonPlan, Message } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Ricardo Santos', email: 'ricardo@marica.rj.gov.br', profile: UserProfile.ADMIN, municipio_id: 'm1', active: true },
  { id: '2', name: 'Ana Souza', email: 'ana.direcao@escola.br', profile: UserProfile.DIRETOR, municipio_id: 'm1', schoolId: 's1', active: true },
  { id: '3', name: 'Carlos Lima', email: 'carlos.prof@escola.br', profile: UserProfile.PROFESSOR, municipio_id: 'm1', schoolId: 's1', active: true },
  { id: '4', name: 'Mariana Silva', email: 'mariana.med@escola.br', profile: UserProfile.MEDIADOR, municipio_id: 'm1', schoolId: 's1', active: true },
  { id: '5', name: 'João Medeiros', email: 'joao.med@escola.br', profile: UserProfile.MEDIADOR, municipio_id: 'm1', schoolId: 's1', active: true },
  { id: 'prof_raquel', name: 'raquelelezabcd', email: 'raquel.prof@escola.br', profile: UserProfile.PROFESSOR, municipio_id: 'm1', schoolId: 's1', active: true },
];

export const MOCK_SCHOOLS: School[] = [
  { id: 's1', name: 'Escola Municipal Joana Benedicta Rangel', inep: '33012456', address: 'Centro, Maricá', municipio_id: 'm1' },
  { id: 's2', name: 'C.E.M. Felisberto Rodrigues da Cunha', inep: '33012888', address: 'Itaipuaçu, Maricá', municipio_id: 'm1' },
  { id: 's3', name: 'E.M. Darcy Ribeiro', inep: '33012999', address: 'Inoã, Maricá', municipio_id: 'm2' },
];

export const MOCK_CLASSES: Class[] = [
  { id: 'c1', name: '101 - Fundamental I', schoolId: 's1', teacherId: 'prof_raquel', mediatorId: '4', year: '2024' },
  { id: 'c2', name: '202 - Fundamental I', schoolId: 's1', teacherId: 'prof_raquel', year: '2024' },
  { id: 'c3', name: '301 - Fundamental I', schoolId: 's2', teacherId: '3', year: '2024' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'st1', name: 'João Victor Silva', ra: '123456', classId: 'c1', aee: true, deficiency: 'Autismo (TEA)' },
  { id: 'st2', name: 'Beatriz Costa', ra: '789012', classId: 'c1', aee: true, deficiency: 'Deficiência Intelectual' },
  { id: 'st3', name: 'Lucas Oliveira', ra: '345678', classId: 'c2', aee: false, deficiency: 'Nenhuma' },
  { id: 'st4', name: 'Maria Eduarda', ra: '901234', classId: 'c3', aee: true, deficiency: 'Baixa Visão' },
  { id: 'st5', name: 'João da Silva', ra: '555444', classId: 'c1', aee: false, deficiency: 'Nenhuma' },
  { id: 'st6', name: 'Pedro Henrique Souza', ra: '111222', classId: 'c1', aee: false, deficiency: 'Nenhuma' },
  { id: 'st7', name: 'Ana Clara Santos', ra: '333444', classId: 'c1', aee: true, deficiency: 'TDAH' },
  { id: 'st8', name: 'Gustavo Mendonça', ra: '555666', classId: 'c2', aee: false, deficiency: 'Nenhuma' },
  { id: 'st9', name: 'Camila Bueno', ra: '777888', classId: 'c2', aee: true, deficiency: 'Deficiência Física' },
  { id: 'st10', name: 'Rafael Guimarães', ra: '999000', classId: 'c1', aee: false, deficiency: 'Nenhuma' },
  { id: 'st11', name: 'Juliana Paes', ra: '222333', classId: 'c2', aee: false, deficiency: 'Nenhuma' },
  { id: 'st12', name: 'Thiago Lacerda', ra: '444555', classId: 'c1', aee: false, deficiency: 'Nenhuma' },
  { id: 'st13', name: 'Manuela Lima', ra: '666777', classId: 'c2', aee: false, deficiency: 'Nenhuma' },
];

// Dados simulados de registros de professores para o Diretor
export const MOCK_PEDAGOGICAL_RECORDS = [
  { id: 'pr1', date: '2024-06-15', classId: 'c1', studentId: 'st1', content: 'Atividade de leitura concluída com sucesso. Aluno demonstrou evolução na fonética.', codigoBNCC: 'EF15LP01', teacherId: 'prof_raquel' },
  { id: 'pr2', date: '2024-06-14', classId: 'c1', studentId: null, content: 'Aula de introdução às formas geométricas. Turma muito participativa.', codigoBNCC: 'EF01MA01', teacherId: 'prof_raquel' },
  { id: 'pr3', date: '2024-06-13', classId: 'c2', studentId: 'st3', content: 'Desenvolvimento de raciocínio lógico através de jogos de tabuleiro.', codigoBNCC: 'EF02MA01', teacherId: 'prof_raquel' },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    remetente_id: '2',
    remetente_email: 'ana.direcao@escola.br',
    destinatario_id: '1',
    destinatario_email: 'ricardo@marica.rj.gov.br',
    conteudo: 'Bom dia. Gostaríamos de solicitar reforço na medição para o 3º ano da unidade Joana Benedicta.',
    data_envio: '2024-06-14T09:00:00Z',
    lido: false,
    municipio_id: 'm1'
  },
  {
    id: 'msg_2',
    remetente_id: '1',
    remetente_email: 'ricardo@marica.rj.gov.br',
    destinatario_id: '2',
    destinatario_email: 'ana.direcao@escola.br',
    conteudo: 'Recebido, Ana. Analisaremos o quadro de funcionários e daremos um retorno na próxima segunda.',
    data_envio: '2024-06-14T10:30:00Z',
    lido: true,
    municipio_id: 'm1'
  },
];

export const MOCK_BNCC: BNCCSkill[] = [
  { id: 'b1', code: 'EF15LP01', description: 'Identificar a função social de textos que circulam em campos da vida social.' },
  { id: 'b2', code: 'EF01LP01', description: 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo.' },
  { id: 'b3', code: 'EF15AR01', description: 'Identificar e apreciar formas distintas das artes visuais tradicionais e contemporâneas.' },
  { id: 'b4', code: 'EF02MA01', description: 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal.' },
  { id: 'b5', code: 'EF03CI01', description: 'Produzir diferentes sons a partir da vibração de variados objetos e identificar variáveis que influenciam nesse fenômeno.' },
  { id: 'b6', code: 'EF04GE01', description: 'Selecionar, em seus lugares de vivência e em redes sociais, características das relações entre campo e cidade.' },
];

export const MOCK_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp1',
    teacherId: 'prof_raquel',
    teacherName: 'raquelelezabcd',
    schoolId: 's1',
    theme: 'Introdução à Leitura Dinâmica',
    skills: [MOCK_BNCC[0], MOCK_BNCC[1]],
    adaptations: 'Utilização de cartões visuais e apoio individualizado para alunos TEA.',
    createdAt: '2024-06-12'
  }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'PEI - 1º Semestre',
    type: 'PEI',
    studentId: 'st1',
    status: 'finalizado',
    schoolId: 's1',
    updatedAt: '2024-05-15',
    description: 'O Plano Educacional Individualizado do aluno demonstra progressos significativos na área de comunicação e interação social. Foram aplicadas metodologias baseadas em reforço positivo e suportes visuais. Recomenda-se continuidade no processo de mediação escolar intensiva.'
  },
  {
    id: 'r2',
    title: 'PDI - Acompanhamento',
    type: 'PDI',
    studentId: 'st2',
    status: 'rascunho',
    schoolId: 's1',
    updatedAt: '2024-06-01',
    description: 'Relatório parcial de desenvolvimento. A aluna tem participado das atividades em grupo com auxílio do mediador. Notou-se melhora na autonomia motora básica. O plano de metas para o próximo mês foca em raciocínio lógico-matemático simplificado.'
  },
  {
    id: 'r3',
    title: 'PAEE - Planejamento',
    type: 'PAEE',
    studentId: 'st4',
    status: 'finalizado',
    schoolId: 's2',
    updatedAt: '2024-06-10',
    description: 'Planejamento de Atendimento Educacional Especializado. Foco em recursos de tecnologia assistiva para baixa visão. A equipe docente recebeu orientação técnica para adaptação curricular.'
  },
];

export const MOCK_MEALS: Meal[] = [
  { id: 'm1', studentId: 'st1', schoolId: 's1', date: '2024-06-14T12:00:00Z', type: 'Almoço', status: 'Comeu tudo' },
  { id: 'm2', studentId: 'st2', schoolId: 's1', date: '2024-06-14T12:00:00Z', type: 'Almoço', status: 'Comeu metade' },
  { id: 'm4', studentId: 'st1', schoolId: 's1', date: '2024-06-14T15:30:00Z', type: 'Lanche', status: 'Não comeu' },
  { id: 'm5', studentId: 'st5', schoolId: 's1', date: '2026-02-08T08:00:00Z', type: 'Café da Manhã', status: 'Comeu tudo' },
  { id: 'm6', studentId: 'st5', schoolId: 's1', date: '2026-02-08T12:00:00Z', type: 'Almoço', status: 'Comeu metade' },
];

export const MOCK_MEDIATION_RECORDS: MediationRecord[] = [
  {
    id: 'med1',
    studentId: 'st1',
    date: '2024-06-14',
    description: 'O aluno demonstrou bom engajamento nas atividades propostas hoje.',
    authorId: '4',
    status: 'Estável',
    behaviorStatus: 'Engajado',
    hygiene: 'Fez sozinho',
    feeding: 'Fez sozinho',
    mobility: 'Fez sozinho',
    medication: 'Fez sozinho',
    interactedStudents: 'Sim',
    groupActivity: 'Sim',
    eyeContact: 'Sim'
  },
  {
    id: 'med2',
    studentId: 'st2',
    date: '2024-06-14',
    description: 'Necessitou de suporte extra para locomoção durante o recreio.',
    authorId: '5',
    status: 'Alerta',
    behaviorStatus: 'Agitado',
    hygiene: 'Fez sozinho',
    feeding: 'Fez sozinho',
    mobility: 'Com auxílio',
    medication: 'Com auxílio',
    interactedStudents: 'Não',
    groupActivity: 'Não',
    eyeContact: 'Sim'
  }
];

export const DB_METRICS = [
  { name: 'Uso de CPU', color: 'blue', icon: 'fa-microchip', value: 42, unit: '%', total: 100 },
  { name: 'Memória RAM', color: 'purple', icon: 'fa-memory', value: 3.2, unit: 'GB', total: 8 },
  { name: 'Armazenamento', color: 'emerald', icon: 'fa-database', value: 124, unit: 'GB', total: 500 },
  { name: 'Conexões Ativas', color: 'orange', icon: 'fa-network-wired', value: 18, unit: '', total: 100 },
];

export const STORAGE_DISTRIBUTION = [
  { name: 'Arquivos PEI/PDI', value: 4500, color: '#3b82f6' },
  { name: 'Banco de Dados', value: 1200, color: '#f59e0b' },
  { name: 'Mídias e Anexos', value: 3200, color: '#8b5cf6' },
  { name: 'Registros de Mediação', value: 2100, color: '#10b981' },
];

export const SYSTEM_POLICIES = [
  { label: 'Retenção de Dados', value: '5 Anos' },
  { label: 'Backup Automático', value: 'Diário' },
  { label: 'Criptografia em Repouso', value: 'AES-256' },
  { label: 'Nível de Conformidade', value: 'LGPD N3' },
];