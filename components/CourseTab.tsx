import React, { useState } from 'react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: 'video' | 'leitura' | 'atividade' | 'quiz';
  completed: boolean;
  description: string;
}

interface Module {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  description: string;
  objectives: string[];
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'Módulo 1',
    subtitle: 'Fundamentos da Inclusão Escolar',
    icon: 'fa-book-open',
    color: 'from-blue-600 to-blue-800',
    description:
      'Compreenda os princípios históricos e filosóficos da educação inclusiva, a evolução das políticas públicas no Brasil e os marcos legislativos que garantem o direito à educação de todos.',
    objectives: [
      'Conhecer a história da educação especial no Brasil',
      'Compreender os princípios da Declaração de Salamanca',
      'Identificar a legislação vigente: LDB, LDBEN e a Lei Brasileira de Inclusão',
      'Refletir sobre o paradigma da integração x inclusão',
    ],
    lessons: [
      { id: 1, title: 'Histórico da Educação Especial no Brasil', duration: '20 min', type: 'leitura', completed: true, description: 'Evolução das políticas de educação especial desde a criação do INES até os dias atuais.' },
      { id: 2, title: 'Declaração de Salamanca e seus impactos', duration: '25 min', type: 'video', completed: true, description: 'Como o documento internacional de 1994 transformou a visão sobre a inclusão mundial.' },
      { id: 3, title: 'LBI — Lei Brasileira de Inclusão', duration: '30 min', type: 'leitura', completed: false, description: 'Análise aprofundada da Lei 13.146/2015 e seus reflexos no cotidiano escolar.' },
      { id: 4, title: 'Integração vs. Inclusão: qual a diferença?', duration: '15 min', type: 'video', completed: false, description: 'Distinção conceitual e prática entre os dois paradigmas educacionais.' },
      { id: 5, title: 'Quiz — Fundamentos Legislativos', duration: '10 min', type: 'quiz', completed: false, description: 'Avalie seu aprendizado sobre os marcos legais da inclusão.' },
    ],
  },
  {
    id: 2,
    title: 'Módulo 2',
    subtitle: 'Deficiências e Necessidades Educacionais Especiais',
    icon: 'fa-heart-pulse',
    color: 'from-emerald-600 to-emerald-800',
    description:
      'Aprofunde-se nas principais deficiências e NEEs presentes nas salas de aula inclusivas, compreendendo características, diagnósticos e estratégias pedagógicas adequadas para cada perfil.',
    objectives: [
      'Identificar os diferentes tipos de deficiência e NEE',
      'Compreender o espectro autista (TEA) e suas implicações pedagógicas',
      'Conhecer estratégias para deficiências físicas, visuais e auditivas',
      'Desenvolver sensibilidade clínica sem substituir o diagnóstico médico',
    ],
    lessons: [
      { id: 1, title: 'Mapeando as Necessidades Educacionais Especiais', duration: '25 min', type: 'leitura', completed: false, description: 'Panorama das principais NEEs e como elas se manifestam no ambiente escolar.' },
      { id: 2, title: 'Transtorno do Espectro Autista (TEA) na escola', duration: '35 min', type: 'video', completed: false, description: 'Características do TEA, níveis de suporte e como o professor pode apoiar o desenvolvimento.' },
      { id: 3, title: 'Deficiência Intelectual: estratégias de ensino', duration: '30 min', type: 'leitura', completed: false, description: 'Adaptações curriculares e metodológicas para alunos com DI.' },
      { id: 4, title: 'Deficiências Sensoriais: visual e auditiva', duration: '30 min', type: 'video', completed: false, description: 'Recursos de acessibilidade e comunicação alternativa para alunos com deficiência visual ou auditiva.' },
      { id: 5, title: 'TDAH e Dislexia: identificação e suporte', duration: '20 min', type: 'leitura', completed: false, description: 'Como reconhecer sinais de TDAH e dislexia e adaptar a prática pedagógica.' },
      { id: 6, title: 'Atividade Prática: perfil do aluno', duration: '20 min', type: 'atividade', completed: false, description: 'Elabore o perfil de um aluno fictício com NEE e proponha três estratégias de suporte.' },
    ],
  },
  {
    id: 3,
    title: 'Módulo 3',
    subtitle: 'Práticas Pedagógicas Inclusivas',
    icon: 'fa-chalkboard-user',
    color: 'from-violet-600 to-violet-800',
    description:
      'Transforme sua sala de aula com metodologias ativas, Desenho Universal para a Aprendizagem (DUA) e estratégias de diferenciação que beneficiam todos os alunos, com ou sem deficiência.',
    objectives: [
      'Aplicar os princípios do Desenho Universal para a Aprendizagem (DUA)',
      'Planejar aulas diferenciadas que contemplem diferentes estilos de aprendizagem',
      'Utilizar recursos de tecnologia assistiva em sala de aula',
      'Desenvolver avaliações inclusivas e formativas',
    ],
    lessons: [
      { id: 1, title: 'Desenho Universal para a Aprendizagem (DUA)', duration: '30 min', type: 'video', completed: false, description: 'Os três princípios do DUA: múltiplos meios de representação, ação e expressão, e engajamento.' },
      { id: 2, title: 'Diferenciação Pedagógica na prática', duration: '25 min', type: 'leitura', completed: false, description: 'Como planejar aulas que atendam diferentes ritmos e estilos de aprendizagem.' },
      { id: 3, title: 'Tecnologia Assistiva em sala de aula', duration: '35 min', type: 'video', completed: false, description: 'Softwares de comunicação alternativa, apps e ferramentas digitais para inclusão.' },
      { id: 4, title: 'Avaliação Inclusiva e Formativa', duration: '25 min', type: 'leitura', completed: false, description: 'Adaptações nos instrumentos e critérios de avaliação sem perda de qualidade.' },
      { id: 5, title: 'Atividade: Plano de Aula Inclusivo', duration: '40 min', type: 'atividade', completed: false, description: 'Crie um plano de aula aplicando os princípios do DUA para uma turma com perfis variados.' },
      { id: 6, title: 'Quiz — Práticas Inclusivas', duration: '10 min', type: 'quiz', completed: false, description: 'Teste seus conhecimentos sobre as metodologias estudadas neste módulo.' },
    ],
  },
  {
    id: 4,
    title: 'Módulo 4',
    subtitle: 'Colaboração, Família e Rede de Apoio',
    icon: 'fa-people-group',
    color: 'from-amber-500 to-orange-700',
    description:
      'A inclusão é construída coletivamente. Aprenda a fortalecer a parceria entre escola e família, a trabalhar em equipe multiprofissional e a articular serviços de saúde, assistência social e educação.',
    objectives: [
      'Construir uma relação colaborativa e acolhedora com as famílias',
      'Trabalhar em equipe com mediadores, psicólogos e terapeutas',
      'Articular a rede de proteção social em torno do aluno',
      'Conduzir reuniões de equipe de forma produtiva e ética',
    ],
    lessons: [
      { id: 1, title: 'Família como parceira da inclusão', duration: '25 min', type: 'video', completed: false, description: 'Como estabelecer uma comunicação efetiva e empática com as famílias de alunos com NEE.' },
      { id: 2, title: 'O papel do professor de AEE', duration: '20 min', type: 'leitura', completed: false, description: 'Atribuições do Atendimento Educacional Especializado e sua articulação com a sala regular.' },
      { id: 3, title: 'Trabalho colaborativo com mediadores', duration: '25 min', type: 'leitura', completed: false, description: 'Como professores e mediadores podem co-planejar para maximizar o desenvolvimento do aluno.' },
      { id: 4, title: 'Rede intersetorial: saúde, assistência e educação', duration: '30 min', type: 'video', completed: false, description: 'Como acionar e integrar os serviços disponíveis no município para o aluno com deficiência.' },
      { id: 5, title: 'Atividade: Roteiro de reunião com família', duration: '30 min', type: 'atividade', completed: false, description: 'Elabore um roteiro de reunião com a família de um aluno com TEA, priorizando escuta ativa e plano de ação.' },
    ],
  },
  {
    id: 5,
    title: 'Módulo 5',
    subtitle: 'Documentação, PEI e Avaliação de Impacto',
    icon: 'fa-file-medical',
    color: 'from-rose-600 to-rose-800',
    description:
      'Domine a elaboração do Plano Educacional Individualizado (PEI), aprenda a registrar o desenvolvimento do aluno de forma sistemática e avalie o impacto das práticas inclusivas adotadas.',
    objectives: [
      'Elaborar um Plano Educacional Individualizado (PEI) completo',
      'Registrar observações pedagógicas de forma sistemática',
      'Usar indicadores para avaliar o progresso do aluno',
      'Conhecer as diretrizes do MEC 2026 para documentação inclusiva',
    ],
    lessons: [
      { id: 1, title: 'O que é o PEI e por que ele importa', duration: '20 min', type: 'video', completed: false, description: 'Conceito, estrutura e importância do Plano Educacional Individualizado no contexto da LBI.' },
      { id: 2, title: 'Como elaborar um PEI efetivo', duration: '40 min', type: 'leitura', completed: false, description: 'Passo a passo para construir um PEI com metas funcionais, acadêmicas e socioemocionais.' },
      { id: 3, title: 'Registros pedagógicos diários e seu valor', duration: '20 min', type: 'leitura', completed: false, description: 'Instrumentos de observação e registro que alimentam o PEI e comunicam progresso à família.' },
      { id: 4, title: 'Avaliação de impacto das práticas inclusivas', duration: '25 min', type: 'video', completed: false, description: 'Indicadores qualitativos e quantitativos para medir o sucesso da inclusão na sua turma.' },
      { id: 5, title: 'Diretrizes MEC 2026 para Educação Inclusiva', duration: '30 min', type: 'leitura', completed: false, description: 'Atualização sobre as orientações nacionais mais recentes para a implementação da inclusão.' },
      { id: 6, title: 'Atividade Final: Elabore um PEI completo', duration: '60 min', type: 'atividade', completed: false, description: 'Exercício integrador: construa um PEI completo para um aluno fictício utilizando os conhecimentos de todos os módulos.' },
      { id: 7, title: 'Quiz Final — Certificação do Curso', duration: '20 min', type: 'quiz', completed: false, description: 'Avaliação final para obtenção do certificado de conclusão do curso.' },
    ],
  },
];

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  video:      { icon: 'fa-play-circle',   label: 'Vídeo',     color: 'bg-blue-100 text-blue-700' },
  leitura:    { icon: 'fa-book',          label: 'Leitura',   color: 'bg-emerald-100 text-emerald-700' },
  atividade:  { icon: 'fa-pencil',        label: 'Atividade', color: 'bg-amber-100 text-amber-700' },
  quiz:       { icon: 'fa-circle-question',label: 'Quiz',     color: 'bg-violet-100 text-violet-700' },
};

const CourseTab: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>(MODULES);

  const activeModule = modules.find(m => m.id === activeModuleId)!;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const globalProgress = Math.round((completedLessons / totalLessons) * 100);

  const moduleProgress = (mod: Module) => {
    const done = mod.lessons.filter(l => l.completed).length;
    return Math.round((done / mod.lessons.length) * 100);
  };

  const toggleLesson = (lessonId: number) => {
    setExpandedLessonId(prev => (prev === lessonId ? null : lessonId));
  };

  const toggleComplete = (moduleId: number, lessonId: number) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l) }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-graduation-cap text-2xl text-white" />
            </div>
            <div>
              <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest">Formação Continuada</p>
              <h1 className="text-2xl font-black leading-tight">Inclusão na Prática</h1>
              <p className="text-blue-200 text-sm">Da Legislação ao Chão da Escola</p>
            </div>
          </div>

          {/* Barra de progresso global */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-200">{completedLessons} de {totalLessons} aulas concluídas</span>
              <span className="font-bold text-white">{globalProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-layer-group text-blue-300" />
              <span className="text-blue-100">5 Módulos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-clock text-blue-300" />
              <span className="text-blue-100">~8h de conteúdo</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-certificate text-blue-300" />
              <span className="text-blue-100">Certificado de Conclusão</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-landmark text-blue-300" />
              <span className="text-blue-100">Alinhado às diretrizes MEC 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Módulos */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 mb-3">Módulos do Curso</p>
          {modules.map(mod => {
            const prog = moduleProgress(mod);
            const isActive = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => { setActiveModuleId(mod.id); setExpandedLessonId(null); }}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 border-slate-700 shadow-lg'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center flex-shrink-0`}>
                    <i className={`fa-solid ${mod.icon} text-white text-xs`} />
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-bold ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>{mod.title}</p>
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>{mod.subtitle}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`w-full rounded-full h-1.5 ${isActive ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${mod.color} transition-all duration-500`}
                      style={{ width: `${prog}%` }}
                    />
                  </div>
                  <p className={`text-[10px] mt-1 ${isActive ? 'text-slate-400' : 'text-gray-400'}`}>
                    {mod.lessons.filter(l => l.completed).length}/{mod.lessons.length} aulas · {prog}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conteúdo do Módulo Ativo */}
        <div className="lg:col-span-3 space-y-4">
          {/* Cabeçalho do módulo */}
          <div className={`bg-gradient-to-r ${activeModule.color} rounded-2xl p-6 text-white`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className={`fa-solid ${activeModule.icon} text-xl`} />
              </div>
              <div>
                <p className="text-white/70 text-sm font-semibold uppercase tracking-widest">{activeModule.title}</p>
                <h2 className="text-xl font-black mb-2">{activeModule.subtitle}</h2>
                <p className="text-white/80 text-sm leading-relaxed">{activeModule.description}</p>
              </div>
            </div>

            {/* Objetivos */}
            <div className="mt-5 bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                <i className="fa-solid fa-bullseye mr-2" />Objetivos de Aprendizagem
              </p>
              <ul className="space-y-1.5">
                {activeModule.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                    <i className="fa-solid fa-check-circle text-white/60 mt-0.5 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-800">
                <i className="fa-solid fa-list-ul mr-2 text-gray-400" />
                Aulas do Módulo
              </h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold">
                {activeModule.lessons.length} aulas
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {activeModule.lessons.map((lesson, idx) => {
                const tc = typeConfig[lesson.type];
                const isExpanded = expandedLessonId === lesson.id;
                return (
                  <div key={lesson.id} className={`transition-colors ${lesson.completed ? 'bg-emerald-50/30' : 'bg-white hover:bg-gray-50/50'}`}>
                    <button
                      className="w-full px-6 py-4 flex items-center gap-4 text-left"
                      onClick={() => toggleLesson(lesson.id)}
                    >
                      {/* Número / check */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleComplete(activeModule.id, lesson.id); }}
                        className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          lesson.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-200 hover:border-emerald-400'
                        }`}
                        title={lesson.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
                      >
                        {lesson.completed
                          ? <i className="fa-solid fa-check text-white text-xs" />
                          : <span className="text-gray-400 text-xs font-bold">{idx + 1}</span>
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${lesson.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.color}`}>
                            <i className={`fa-solid ${tc.icon} mr-1`} />{tc.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            <i className="fa-regular fa-clock mr-1" />{lesson.duration}
                          </span>
                        </div>
                      </div>

                      <i className={`fa-solid fa-chevron-down text-gray-300 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-6 pb-4 ml-12">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{lesson.description}</p>
                        <button
                          onClick={() => toggleComplete(activeModule.id, lesson.id)}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                            lesson.completed
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          <i className={`fa-solid ${lesson.completed ? 'fa-rotate-left' : 'fa-check'} mr-2`} />
                          {lesson.completed ? 'Desfazer conclusão' : 'Marcar como concluída'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card de certificado se módulo 5 */}
          {activeModule.id === 5 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200">
                <i className="fa-solid fa-award text-white text-2xl" />
              </div>
              <div>
                <h4 className="font-black text-amber-900">Certificado de Conclusão</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Conclua todas as aulas e o quiz final para receber seu certificado de formação continuada em Educação Inclusiva, alinhado às diretrizes MEC 2026.
                </p>
                <div className="mt-3">
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${moduleProgress(activeModule)}%` }}
                    />
                  </div>
                  <p className="text-xs text-amber-600 mt-1">{moduleProgress(activeModule)}% concluído neste módulo</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseTab;
