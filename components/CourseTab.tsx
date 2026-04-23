import React, { useState } from 'react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: 'leitura' | 'atividade' | 'quiz';
  completed: boolean;
  description: string;
  content?: string;
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
      'Compreenda os princípios históricos e filosóficos da educação inclusiva e o binômio Educar e Cuidar.',
    objectives: [
      'Conhecer a história da educação especial no Brasil',
      'Compreender o binômio Educar e Cuidar',
      'Refletir sobre a Mediação Humanizadora',
      'Identificar a legislação histórica e fundamentos',
    ],
    lessons: [
      { 
        id: 1, 
        title: 'Histórico e o Binômio Educar-Cuidar', 
        duration: '20 min', 
        type: 'leitura', 
        completed: true, 
        description: 'Evolução histórica e a indissociabilidade entre o educar e o cuidar.',
        content: `### Resumo Teórico
Historicamente, passamos da exclusão para a inclusão. O binômio **Educar e Cuidar** é indissociável: o cuidado garante a dignidade e a prontidão para o aprender. A **Mediação Humanizadora** atua como a ponte entre o aluno e o conhecimento.

### Diretriz MEC 2026
O suporte à vida escolar (higiene, locomoção) é parte integrante do projeto pedagógico, não devendo ser separado das atividades de ensino.

### Exemplo Prático (BNCC: EI03EO01)
*Habilidade:* Demonstrar empatia pelos outros.
*Flexibilização:* Para um aluno com TEA, use cartões visuais com fotos reais dos colegas. O professor narra as emoções: "O Pedro está sorrindo porque gostou da brincadeira".`
      },
      { 
        id: 2, 
        title: 'Mediação Humanizadora na Prática', 
        duration: '25 min', 
        type: 'leitura', 
        completed: true, 
        description: 'Como atuar como mediador do conhecimento respeitando a singularidade.',
        content: `A mediação baseia-se na zona de desenvolvimento proximal. O professor não apenas entrega o conteúdo, mas cria estratégias para que o aluno com NEE acesse o mesmo objetivo que a turma, com suportes específicos.`
      },
      { 
        id: 3, 
        title: 'Atividade de Reflexão: Prática Diária', 
        duration: '15 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Reflexão sobre a integração do educar e cuidar no seu cotidiano.',
        content: `**Desafio:** Liste três momentos do seu dia onde o "cuidar" pareceu interromper o "educar". Como você pode transformar esses momentos em oportunidades de aprendizagem social ou de autonomia?`
      },
    ],
  },
  {
    id: 2,
    title: 'Módulo 2',
    subtitle: 'O Novo Marco Legal (Lei 15.247/2025)',
    icon: 'fa-landmark',
    color: 'from-emerald-600 to-emerald-800',
    description:
      'Conheça a Lei 15.247/2025, o Compromisso Nacional Criança Alfabetizada e o fim da exigência de laudo para o AEE.',
    objectives: [
      'Entender a Lei nº 15.247/2025',
      'Conhecer o Compromisso Nacional Criança Alfabetizada',
      'Aplicar o fim da exigência de laudo para início do AEE',
      'Alfabetizar na perspectiva inclusiva',
    ],
    lessons: [
      { 
        id: 4, 
        title: 'Alfabetização Inclusiva e a Lei 15.247/2025', 
        duration: '30 min', 
        type: 'leitura', 
        completed: false, 
        description: 'A obrigatoriedade de garantir meios para que todos acessem o código escrito.',
        content: `### Resumo Teórico
A Lei 15.247/2025 combate a ideia de que alunos com deficiência "não alfabetizam". Todos devem acessar o código escrito até o final do 2º ano.

### Diretriz MEC 2026
**Fim da exigência de laudo:** O AEE deve ser iniciado com base nas barreiras identificadas pelo professor, sem aguardar diagnósticos clínicos.

### Exemplo Prático (BNCC: EF01LP01)
*Habilidade:* Reconhecer a direção da escrita.
*Flexibilização:* Use "janelas de leitura" (vazadores de papel) que isolam a linha, facilitando o foco para alunos com Deficiência Intelectual ou TDAH.`
      },
      { 
        id: 5, 
        title: 'Implementando o AEE sem Laudo', 
        duration: '20 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Plano de ação para suporte imediato ao aluno.',
        content: `Como sua escola pode organizar o suporte pedagógico imediato? Crie um fluxo de encaminhamento interno baseado na observação do professor regente.`
      },
    ],
  },
  {
    id: 3,
    title: 'Módulo 3',
    subtitle: 'Desenho Universal para a Aprendizagem (DUA)',
    icon: 'fa-chalkboard-user',
    color: 'from-violet-600 to-violet-800',
    description:
      'Aplique os 3 princípios do DUA para tornar qualquer código da BNCC acessível a todos os alunos.',
    objectives: [
      'Dominar os 3 pilares do DUA',
      'Projetar aulas proativamente acessíveis',
      'Diferenciar representação, ação e engajamento',
    ],
    lessons: [
      { 
        id: 6, 
        title: 'Os 3 Princípios do DUA', 
        duration: '30 min', 
        type: 'leitura', 
        completed: false, 
        description: 'Engajamento, Representação e Ação/Expressão.',
        content: `### Resumo Teórico
1. **Engajamento:** O Porquê (interesse).
2. **Representação:** O Quê (múltiplos formatos).
3. **Ação e Expressão:** O Como (diversas formas de demonstrar aprendizado).

### Exemplo Prático (BNCC: EF03MA06)
*Habilidade:* Resolver problemas de adição/subtração.
*DUA:* Apresentar o problema em áudio, texto e material concreto (ábaco). O aluno pode responder gravando áudio ou manipulando objetos.`
      },
      { 
        id: 7, 
        title: 'Planejamento Proativo', 
        duration: '40 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Criando aulas que não precisam de adaptações posteriores.',
        content: `Escolha um objetivo da BNCC e desenhe três formas diferentes de representação para ele.`
      },
    ],
  },
  {
    id: 4,
    title: 'Módulo 4',
    subtitle: 'Avaliação Formativa e Estudo de Caso',
    icon: 'fa-clipboard-check',
    color: 'from-amber-500 to-orange-700',
    description:
      'As 4 etapas do Estudo de Caso do novo Guia e como documentar o progresso contínuo.',
    objectives: [
      'Realizar o Estudo de Caso em 4 etapas',
      'Mapear barreiras e potencialidades',
      'Implementar a Avaliação para a Aprendizagem',
    ],
    lessons: [
      { 
        id: 8, 
        title: 'As 4 Etapas do Estudo de Caso', 
        duration: '35 min', 
        type: 'leitura', 
        completed: false, 
        description: 'O fluxo de avaliação do Guia MEC 2026.',
        content: `### Etapas do Guia MEC 2026
1. **Identificação das Barreiras:** O que impede a participação?
2. **Mapeamento de Potencialidades:** O que o aluno já sabe?
3. **Plano de Intervenção:** Estratégias e recursos.
4. **Reavaliação:** O plano funcionou?

### Exemplo Prático (BNCC: EF02CI01)
*Habilidade:* Identificar materiais dos objetos.
*Inclusão:* Para aluno com barreira motora, a avaliação é sensorial (caixa misteriosa), focando no progresso da percepção científica.`
      },
    ],
  },
  {
    id: 5,
    title: 'Módulo 5',
    subtitle: 'Planejamento Prático e PEI',
    icon: 'fa-file-signature',
    color: 'from-rose-600 to-rose-800',
    description:
      'Transforme objetivos da BNCC em metas específicas para o Plano Educacional Individualizado (PEI).',
    objectives: [
      'Construir metas SMART no PEI',
      'Flexibilizar habilidades complexas da BNCC',
      'Garantir a colaboração no planejamento',
    ],
    lessons: [
      { 
        id: 9, 
        title: 'Transformando BNCC em Metas PEI', 
        duration: '45 min', 
        type: 'leitura', 
        completed: false, 
        description: 'Como ajustar a complexidade sem perder o objetivo central.',
        content: `### Exemplo Prático (BNCC: EF05HI01)
*Habilidade:* Formação das culturas e povos.
*Meta PEI (D.I.):* Identificar 3 elementos culturais (comida, música, roupa) através de imagens, relacionando-os ao clima. A meta é derivada da BNCC, mas funcional para o aluno.`
      },
      { 
        id: 10, 
        title: 'Quiz Final e Certificação', 
        duration: '20 min', 
        type: 'quiz', 
        completed: false, 
        description: 'Avaliação final integradora.',
        content: `Parabéns por chegar até aqui! Este quiz validará seus conhecimentos sobre o Marco Legal 2026 e as práticas de DUA/PEI.`
      },
    ],
  },
];

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  
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
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-book-open text-blue-500" /> Conteúdo da Lição
                          </p>
                          <div className="prose prose-slate prose-sm max-w-none">
                            {lesson.content ? (
                              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                {lesson.content.split('\n').map((line, i) => {
                                  if (line.startsWith('###')) {
                                    return <h3 key={i} className="text-lg font-black text-slate-900 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                                  }
                                  if (line.startsWith('*')) {
                                    return <li key={i} className="ml-4 mb-1 list-disc">{line.replace('* ', '')}</li>;
                                  }
                                  return <p key={i} className="mb-2">{line}</p>;
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 leading-relaxed italic">Conteúdo em desenvolvimento para esta lição.</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => toggleComplete(activeModule.id, lesson.id)}
                            className={`text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all ${
                              lesson.completed
                                ? 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-100'
                            }`}
                          >
                            <i className={`fa-solid ${lesson.completed ? 'fa-rotate-left' : 'fa-check'} mr-2`} />
                            {lesson.completed ? 'Desfazer conclusão' : 'Concluir Lição'}
                          </button>
                        </div>
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
