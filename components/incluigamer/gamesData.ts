export interface GameLevelDefinition {
  level: number; // 1, 2, 3
  name: string; // Ex: "Nível 1 - Caça Vogais"
  objective: string; // Objetivo cognitivo específico
  mechanic: 'caca_letras' | 'montar_silabas' | 'completar_frases' |
            'atencao_seletiva' | 'sequencia_logica' | 'memoria_visual' |
            'reconhecimento_facial' | 'interpretacao_emocional' | 'empatia_guiada' |
            'causa_efeito_sonora' | 'cores_sensoriais' | 'coordenacao_motora' |
            'contar_objetos' | 'sequencia_numerica' | 'mini_desafios';
  bnccSkills: string[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface GameDefinition {
  id: string; // Slug identificador
  name: string;
  description: string;
  bioma: 'alfabetizacao' | 'cognitivo' | 'emocoes' | 'sensorial' | 'matematico';
  ageGroup: '0-3' | '4-5' | '6-8' | '9-12' | '13+';
  ageLabel: string;
  fieldOfExperience?: string; // Educação Infantil
  subject?: string; // Ensino Fundamental
  bnccSkills: string[]; // Códigos de habilidades da BNCC
  pedagogicalObjectives: string[];
  cognitiveLevel: 'Lembrar' | 'Entender' | 'Aplicar' | 'Analisar' | 'Avaliar' | 'Criar';
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Adaptativo';
  stimuli: string[]; // ['Visual', 'Auditivo', 'Tátil', 'Foco', 'Calmante']
  skillsWorked: string[]; // Habilidades estimuladas
  levels: GameLevelDefinition[]; // Níveis pedagógicos de progressão
}

export const GAMES_CATALOG: GameDefinition[] = [
  // --- 0 a 3 anos (Bebês e Crianças bem pequenas) ---
  {
    id: 'orquestra_sons',
    name: 'Orquestra dos Sons Sensoriais',
    description: 'Estímulo auditivo e causa-efeito associando toques suaves na tela com sons calmos de animais e instrumentos.',
    bioma: 'sensorial',
    ageGroup: '0-3',
    ageLabel: '0 a 3 anos',
    fieldOfExperience: 'Traços, sons, cores e formas',
    bnccSkills: ['EI01TS01', 'EI01TS03'],
    pedagogicalObjectives: [
      'Explorar sons e fontes sonoras diversas.',
      'Perceber a relação de causa e efeito (toque e som).',
      'Estimular a atenção auditiva primária.'
    ],
    cognitiveLevel: 'Lembrar',
    difficulty: 'Fácil',
    stimuli: ['Auditivo', 'Visual', 'Calmante'],
    skillsWorked: ['Percepção Auditiva', 'Coordenação Motora Fina', 'Relação Causa-Efeito'],
    levels: [
      { level: 1, name: 'Toques Musicais Suaves', objective: 'Perceber relação de causa-efeito sonora primária', mechanic: 'causa_efeito_sonora', bnccSkills: ['EI01TS01'], difficulty: 'Fácil' },
      { level: 2, name: 'Tons de Calmaria e Instrumentos', objective: 'Discriminação de tons calmos de instrumentos', mechanic: 'cores_sensoriais', bnccSkills: ['EI01TS03'], difficulty: 'Médio' },
      { level: 3, name: 'Estrelas Sonoras no Espaço', objective: 'Rastrear e tocar alvos sonoros em movimento rápido', mechanic: 'coordenacao_motora', bnccSkills: ['EI01CG05'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'toque_cores',
    name: 'Floresta de Toques Luminosos',
    description: 'Atividade sensorial onde o toque na tela gera explosões suaves de cores pastéis sem ruídos agressivos, ideal para estimulação visomotora.',
    bioma: 'sensorial',
    ageGroup: '0-3',
    ageLabel: '0 a 3 anos',
    fieldOfExperience: 'Corpo, gestos e movimentos',
    bnccSkills: ['EI01CG05', 'EI01TS02'],
    pedagogicalObjectives: [
      'Estimular o rastreamento visual e foco.',
      'Desenvolver a coordenação olho-mão primária.',
      'Proporcionar estímulo relaxante visual.'
    ],
    cognitiveLevel: 'Lembrar',
    difficulty: 'Fácil',
    stimuli: ['Visual', 'Tátil', 'Calmante'],
    skillsWorked: ['Foco Visual', 'Coordenação Visomotora', 'Regulação Sensorial'],
    levels: [
      { level: 1, name: 'Ecos de Causa e Efeito', objective: 'Interação táctil e resposta luminosa suave', mechanic: 'causa_efeito_sonora', bnccSkills: ['EI01TS02'], difficulty: 'Fácil' },
      { level: 2, name: 'Pareamento de Cores Pastéis', objective: 'Diferenciação cromática visual calma', mechanic: 'cores_sensoriais', bnccSkills: ['EI01CG05'], difficulty: 'Médio' },
      { level: 3, name: 'Capturador de Pirilampos', objective: 'Foco táctil e coordenação de alvos móveis', mechanic: 'coordenacao_motora', bnccSkills: ['EI01CG05'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'balao_formas',
    name: 'Estourador de Formas Geométricas',
    description: 'Balões flutuam na tela carregando formas simples. O mediador auxilia o aluno a identificar e estourar os balões correspondentes.',
    bioma: 'cognitivo',
    ageGroup: '0-3',
    ageLabel: '0 a 3 anos',
    fieldOfExperience: 'Espaços, tempos, quantidades, relações e transformações',
    bnccSkills: ['EI02ET05', 'EI02ET01'],
    pedagogicalObjectives: [
      'Identificar e diferenciar formas geométricas planas simples.',
      'Estimular a velocidade de reação e precisão motora.',
      'Reforçar vocabulário de cores e formas.'
    ],
    cognitiveLevel: 'Entender',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Auditivo', 'Foco'],
    skillsWorked: ['Classificação de Formas', 'Atenção Sustentada', 'Coordenação Fina'],
    levels: [
      { level: 1, name: 'Pareamento de Formas Planas', objective: 'Identificar formas idênticas ao molde', mechanic: 'atencao_seletiva', bnccSkills: ['EI02ET05'], difficulty: 'Fácil' },
      { level: 2, name: 'Padrões de Cores e Formas', objective: 'Identificar padrões simples de repetição lógica', mechanic: 'sequencia_logica', bnccSkills: ['EI02ET01'], difficulty: 'Médio' },
      { level: 3, name: 'Esconderijo das Formas', objective: 'Memorização rápida de posições que desaparecem', mechanic: 'memoria_visual', bnccSkills: ['EI02ET05'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'termometro_sentimentos_infantil',
    name: 'Cidade das Emoções: Carinhas Felizes',
    description: 'Exercício lúdico para associar rostos desenhados com sentimentos básicos como alegria, tristeza e surpresa.',
    bioma: 'emocoes',
    ageGroup: '0-3',
    ageLabel: '0 a 3 anos',
    fieldOfExperience: 'O eu, o outro e o nós',
    bnccSkills: ['EI02EO01', 'EI02EO04'],
    pedagogicalObjectives: [
      'Reconhecer e nomear expressões faciais de emoções básicas.',
      'Desenvolver a empatia e a autocompreensão.',
      'Fomentar a comunicação afetiva.'
    ],
    cognitiveLevel: 'Entender',
    difficulty: 'Médio',
    stimuli: ['Visual', 'Calmante'],
    skillsWorked: ['Reconhecimento Facial', 'Empatia', 'Vocabulário Emocional'],
    levels: [
      { level: 1, name: 'Espelho das Expressões', objective: 'Identificar sentimentos básicos por rostos desenhados', mechanic: 'reconhecimento_facial', bnccSkills: ['EI02EO04'], difficulty: 'Fácil' },
      { level: 2, name: 'Carrossel das Situações', objective: 'Relacionar sentimentos à contextos lúdicos cotidianos', mechanic: 'interpretacao_emocional', bnccSkills: ['EI02EO01'], difficulty: 'Médio' },
      { level: 3, name: 'Amigo no Parquinho', objective: 'Escolhas primárias de atitude e empatia', mechanic: 'empatia_guiada', bnccSkills: ['EI02EO01'], difficulty: 'Difícil' }
    ]
  },

  // --- 4 a 5 anos (Crianças pequenas - Pré-Escola) ---
  {
    id: 'termometro_sentimentos',
    name: 'Termômetro das Emoções Adaptativo',
    description: 'Desafio interativo que apresenta situações cotidianas de conflito ou alegria e pede que o aluno selecione a reação emocional correta.',
    bioma: 'emocoes',
    ageGroup: '4-5',
    ageLabel: '4 a 5 anos',
    fieldOfExperience: 'O eu, o outro e o nós',
    bnccSkills: ['EI03EO01', 'EI03EO02', 'EI03EO04'],
    pedagogicalObjectives: [
      'Demonstrar empatia pelos sentimentos alheios em contextos sociais.',
      'Identificar estratégias de regulação emocional.',
      'Estimular a comunicação expressiva sobre emoções.'
    ],
    cognitiveLevel: 'Aplicar',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Auditivo', 'Calmante'],
    skillsWorked: ['Regulação Emocional', 'Tomada de Decisão Social', 'Comunicação Empática'],
    levels: [
      { level: 1, name: 'Reconhecimento de Sentimentos', objective: 'Identificar emoções complexas por imagens expressivas', mechanic: 'reconhecimento_facial', bnccSkills: ['EI03EO04'], difficulty: 'Fácil' },
      { level: 2, name: 'Empatia e Resoluções', objective: 'Avaliar sentimentos de colegas em situações comuns', mechanic: 'interpretacao_emocional', bnccSkills: ['EI03EO01'], difficulty: 'Médio' },
      { level: 3, name: 'Dilemas Éticos do Recreio', objective: 'Decisões comportamentais autônomas e generosas', mechanic: 'empatia_guiada', bnccSkills: ['EI03EO02'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'cacadores_letras_infantil',
    name: 'Caçadores de Letras Iniciais',
    description: 'Encontre e selecione objetos no cenário virtual que começam com a letra indicada, estimulando fonética e vocabulário.',
    bioma: 'alfabetizacao',
    ageGroup: '4-5',
    ageLabel: '4 a 5 anos',
    fieldOfExperience: 'Escuta, fala, pensamento e imaginação',
    bnccSkills: ['EI03EF09', 'EI03EF03'],
    pedagogicalObjectives: [
      'Associar o som inicial da palavra falada com a letra escrita correspondente.',
      'Ampliar o vocabulário por meio de categorias visuais.',
      'Estimular a discriminação auditiva e visual.'
    ],
    cognitiveLevel: 'Aplicar',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Auditivo', 'Foco'],
    skillsWorked: ['Consciência Fonológica', 'Percepção Visual', 'Vocabulário'],
    levels: [
      { level: 1, name: 'Detetive das Vogais', objective: 'Identificar a vogal inicial correta de objetos', mechanic: 'caca_letras', bnccSkills: ['EI03EF09'], difficulty: 'Fácil' },
      { level: 2, name: 'Par de Sílabas', objective: 'Identificar a sílaba inicial das figuras', mechanic: 'montar_silabas', bnccSkills: ['EI03EF03'], difficulty: 'Médio' },
      { level: 3, name: 'Frase Lúdica Lacunada', objective: 'Completar palavras fáceis na frase falada', mechanic: 'completar_frases', bnccSkills: ['EI03EF09'], difficulty: 'Difícil' }
    ]
  },

  // --- 6 a 8 anos (Ensino Fundamental Anos Iniciais - Ciclo de Alfabetização) ---
  {
    id: 'cacadores_letras',
    name: 'Caçadores de Letras e Grafemas',
    description: 'Complete as lacunas das palavras de maneira dinâmica e interativa escolhendo as combinações de letras corretas sob pressão de tempo adaptada.',
    bioma: 'alfabetizacao',
    ageGroup: '6-8',
    ageLabel: '6 a 8 anos',
    subject: 'Língua Portuguesa',
    bnccSkills: ['EF15LP18', 'EF01LP08', 'EF01LP09'],
    pedagogicalObjectives: [
      'Reforçar o reconhecimento de grafemas e fonemas na estrutura da palavra.',
      'Estimular a ortografia correta e segmentação silábica.',
      'Fomentar a leitura autônoma e compreensão textual rápida.'
    ],
    cognitiveLevel: 'Aplicar',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Foco'],
    skillsWorked: ['Ortografia', 'Consciência Silábica', 'Velocidade de Processamento'],
    levels: [
      { level: 1, name: 'Completar Vogais e Consoantes', objective: 'Identificar a letra correta que falta na palavra escrita', mechanic: 'caca_letras', bnccSkills: ['EF01LP08'], difficulty: 'Fácil' },
      { level: 2, name: 'União de Sílabas e Ortografia', objective: 'Encaixar a sílaba correta faltante na palavra', mechanic: 'montar_silabas', bnccSkills: ['EF15LP18'], difficulty: 'Médio' },
      { level: 3, name: 'Completar Frase e Conexão de Sentido', objective: 'Escolher o substantivo/verbo que faz sentido na frase', mechanic: 'completar_frases', bnccSkills: ['EF01LP09'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'quebra_cabeca_formas',
    name: 'Laboratório Cognitivo: Quebra-Cabeça de Formas',
    description: 'Ordene e monte formas geométricas complexas e tangram para desvendar imagens abstratas na tela, trabalhando espaço e simetria.',
    bioma: 'cognitivo',
    ageGroup: '6-8',
    ageLabel: '6 a 8 anos',
    subject: 'Matemática',
    bnccSkills: ['EF15AR02', 'EF01MA14', 'EF02MA15'],
    pedagogicalObjectives: [
      'Reconhecer e representar figuras geométricas espaciais e planas.',
      'Estimular o raciocínio lógico-espacial e rotação mental de objetos.',
      'Desenvolver a resiliência cognitiva na resolução de problemas complexos.'
    ],
    cognitiveLevel: 'Analisar',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Foco', 'Tátil'],
    skillsWorked: ['Raciocínio Espacial', 'Resolução de Problemas', 'Simetria e Geometria'],
    levels: [
      { level: 1, name: 'Pareamento Geométrico Plano', objective: 'Identificar a forma espacial ou tangram plano correto', mechanic: 'atencao_seletiva', bnccSkills: ['EF01MA14'], difficulty: 'Fácil' },
      { level: 2, name: 'Simetria e Matriz de Formas', objective: 'Completar padrões bidimensionais de formas espaciais', mechanic: 'sequencia_logica', bnccSkills: ['EF02MA15'], difficulty: 'Médio' },
      { level: 3, name: 'Desafio Mental da Memória de Formas', objective: 'Memorização e cliques na ordem de formas que somem', mechanic: 'memoria_visual', bnccSkills: ['EF15AR02'], difficulty: 'Difícil' }
    ]
  },
  {
    id: 'reino_numeros',
    name: 'Reino dos Números e Quantidades',
    description: 'Ajude os personagens a alimentar os animais da fazenda dando a quantidade exata de alimentos, trabalhando operações lógicas e contagem.',
    bioma: 'matematico',
    ageGroup: '6-8',
    ageLabel: '6 a 8 anos',
    subject: 'Matemática',
    bnccSkills: ['EF01MA01', 'EF01MA04', 'EF02MA01'],
    pedagogicalObjectives: [
      'Associar numerais escritos com suas quantidades correspondentes.',
      'Realizar operações matemáticas básicas de adição e subtração com apoio visual.',
      'Estimular a contagem ascendente e descendente.'
    ],
    cognitiveLevel: 'Aplicar',
    difficulty: 'Médio',
    stimuli: ['Visual', 'Auditivo', 'Foco'],
    skillsWorked: ['Conceito Numérico', 'Adição e Subtração Básicas', 'Correspondência de Grupos'],
    levels: [
      { level: 1, name: 'Contagem de Animais da Fazenda', objective: 'Associar elementos visuais ilustrados ao numeral exato', mechanic: 'contar_objetos', bnccSkills: ['EF01MA01'], difficulty: 'Fácil' },
      { level: 2, name: 'Trilha Sequencial Matemática', objective: 'Identificar números faltantes na ordem numérica', mechanic: 'sequencia_numerica', bnccSkills: ['EF02MA01'], difficulty: 'Médio' },
      { level: 3, name: 'Alimentar Animais: Soma Visual', objective: 'Operação simples ilustrada com apoio e somas', mechanic: 'mini_desafios', bnccSkills: ['EF01MA04'], difficulty: 'Difícil' }
    ]
  },

  // --- 9 a 12 anos (Ensino Fundamental - Anos Intermediários) ---
  {
    id: 'desafio_sequencias',
    name: 'Desafio das Sequências e Lógica Computacional',
    description: 'Ordene blocos lógicos e crie fluxogramas visuais simples para guiar um robozinho até o seu objetivo, estimulando lógica computacional.',
    bioma: 'cognitivo',
    ageGroup: '9-12',
    ageLabel: '9 a 12 anos',
    subject: 'Matemática',
    bnccSkills: ['EF06MA09', 'EF08MA11'],
    pedagogicalObjectives: [
      'Identificar e criar sequências numéricas e lógicas baseadas em regras.',
      'Introduzir conceitos de lógica algorítmica e estruturas de decisão visuais.',
      'Reforçar o raciocínio hipotético-dedutivo.'
    ],
    cognitiveLevel: 'Criar',
    difficulty: 'Difícil',
    stimuli: ['Visual', 'Foco'],
    skillsWorked: ['Lógica Algorítmica', 'Pensamento Estruturado', 'Decomposição de Problemas'],
    levels: [
      { level: 1, name: 'Atenção e Foco Computacional', objective: 'Filtro e atenção a blocos de comando geométricos', mechanic: 'atencao_seletiva', bnccSkills: ['EF06MA09'], difficulty: 'Fácil' },
      { level: 2, name: 'Fluxograma Algorítmico e Padrões', objective: 'Montar regras ordenadas sequenciais lógicas', mechanic: 'sequencia_logica', bnccSkills: ['EF08MA11'], difficulty: 'Médio' },
      { level: 3, name: 'Memória e Raciocínio Sequencial', objective: 'Memorização de pilhas de sequências lógicas rápidas', mechanic: 'memoria_visual', bnccSkills: ['EF06MA09'], difficulty: 'Difícil' }
    ]
  },

  // --- 13+ anos (Ensino Fundamental II - Anos Finais) ---
  {
    id: 'detetive_social',
    name: 'Detetive Social e Cidadania',
    description: 'O aluno assume o papel de um mediador escolar resolvendo dilemas éticos, situações de cooperação e inclusão na sua comunidade escolar.',
    bioma: 'emocoes',
    ageGroup: '13+',
    ageLabel: '13 anos ou mais',
    subject: 'Desenvolvimento Cognitivo e Social',
    bnccSkills: ['EF06ER07', 'EF08ER04', 'EF09ER01'],
    pedagogicalObjectives: [
      'Analisar relações interpessoais e formular resoluções pacíficas de conflitos.',
      'Debater sobre diversidade, respeito e inclusão na sociedade.',
      'Fortalecer a tomada de decisão ética sob múltiplos pontos de vista.'
    ],
    cognitiveLevel: 'Avaliar',
    difficulty: 'Adaptativo',
    stimuli: ['Visual', 'Foco', 'Calmante'],
    skillsWorked: ['Pensamento Crítico', 'Raciocínio Ético', 'Mediação e Socialização'],
    levels: [
      { level: 1, name: 'Reconhecimento Social e Expressões', objective: 'Identificar a intenção/sentimento alheio em discussões', mechanic: 'reconhecimento_facial', bnccSkills: ['EF06ER07'], difficulty: 'Fácil' },
      { level: 2, name: 'Análise de Conflitos e Empatia', objective: 'Interpretar sentimentos em contextos de conflito', mechanic: 'interpretacao_emocional', bnccSkills: ['EF08ER04'], difficulty: 'Médio' },
      { level: 3, name: 'Cidadania Ativa e Escolhas Éticas', objective: 'Dilemas éticos complexos com escolhas inclusivas', mechanic: 'empatia_guiada', bnccSkills: ['EF09ER01'], difficulty: 'Difícil' }
    ]
  }
];
