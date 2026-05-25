export interface GameDefinition {
  id: string; // Slug identificador
  name: string;
  description: string;
  bioma: 'alfabetizacao' | 'cognitivo' | 'emocoes' | 'sensorial' | 'matematico';
  ageGroup: '0-1.5' | '1.5-3' | '4-5' | 'fundamental_iniciais' | 'fundamental_finais';
  ageLabel: string;
  fieldOfExperience?: string; // Educação Infantil
  subject?: string; // Ensino Fundamental
  bnccSkills: string[]; // Códigos de habilidades da BNCC
  pedagogicalObjectives: string[];
  cognitiveLevel: 'Lembrar' | 'Entender' | 'Aplicar' | 'Analisar' | 'Avaliar' | 'Criar';
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Adaptativo';
  stimuli: string[]; // ['Visual', 'Auditivo', 'Tátil', 'Foco', 'Calmante']
  skillsWorked: string[]; // Habilidades estimuladas
}

export const GAMES_CATALOG: GameDefinition[] = [
  // --- 0 a 1 ano e 6 meses (Bebês) ---
  {
    id: 'orquestra_sons',
    name: 'Orquestra dos Sons Sensoriais',
    description: 'Estímulo auditivo e causa-efeito associando toques suaves na tela com sons calmos de animais e instrumentos.',
    bioma: 'sensorial',
    ageGroup: '0-1.5',
    ageLabel: '0 a 1 ano e 6 meses',
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
    skillsWorked: ['Percepção Auditiva', 'Coordenação Motora Fina', 'Relação Causa-Efeito']
  },
  {
    id: 'toque_cores',
    name: 'Floresta de Toques Luminosos',
    description: 'Atividade sensorial onde o toque na tela gera explosões suaves de cores pastéis sem ruídos agressivos, ideal para estimulação visomotora.',
    bioma: 'sensorial',
    ageGroup: '0-1.5',
    ageLabel: '0 a 1 ano e 6 meses',
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
    skillsWorked: ['Foco Visual', 'Coordenação Visomotora', 'Regulação Sensorial']
  },

  // --- 1 ano e 7 meses a 3 anos e 11 meses ---
  {
    id: 'balao_formas',
    name: 'Estourador de Formas Geométricas',
    description: 'Balões flutuam na tela carregando formas simples. O mediador auxilia o aluno a identificar e estourar os balões correspondentes.',
    bioma: 'cognitivo',
    ageGroup: '1.5-3',
    ageLabel: '1 ano e 7 meses a 3 anos e 11 meses',
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
    skillsWorked: ['Classificação de Formas', 'Atenção Sustentada', 'Coordenação Fina']
  },
  {
    id: 'termometro_sentimentos_infantil',
    name: 'Cidade das Emoções: Carinhas Felizes',
    description: 'Exercício lúdico para associar rostos desenhados com sentimentos básicos como alegria, tristeza e surpresa.',
    bioma: 'emocoes',
    ageGroup: '1.5-3',
    ageLabel: '1 ano e 7 meses a 3 anos e 11 meses',
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
    skillsWorked: ['Reconhecimento Facial', 'Empatia', 'Vocabulário Emocional']
  },

  // --- 4 a 5 anos e 11 meses ---
  {
    id: 'termometro_sentimentos',
    name: 'Termômetro das Emoções Adaptativo',
    description: 'Desafio interativo que apresenta situações cotidianas de conflito ou alegria e pede que o aluno selecione a reação emocional correta.',
    bioma: 'emocoes',
    ageGroup: '4-5',
    ageLabel: '4 a 5 anos e 11 meses',
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
    skillsWorked: ['Regulação Emocional', 'Tomada de Decisão Social', 'Comunicação Empática']
  },
  {
    id: 'cacadores_letras_infantil',
    name: 'Caçadores de Letras Iniciais',
    description: 'Encontre e selecione objetos no cenário virtual que começam com a letra indicada, estimulando fonética e vocabulário.',
    bioma: 'alfabetizacao',
    ageGroup: '4-5',
    ageLabel: '4 a 5 anos e 11 meses',
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
    skillsWorked: ['Consciência Fonológica', 'Percepção Visual', 'Vocabulário']
  },

  // --- Ensino Fundamental Anos Iniciais (1º ao 5º ano) ---
  {
    id: 'cacadores_letras',
    name: 'Caçadores de Letras e Grafemas',
    description: 'Complete as lacunas das palavras de maneira dinâmica e interativa escolhendo as combinações de letras corretas sob pressão de tempo adaptada.',
    bioma: 'alfabetizacao',
    ageGroup: 'fundamental_iniciais',
    ageLabel: 'Ensino Fundamental Anos Iniciais',
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
    skillsWorked: ['Ortografia', 'Consciência Silábica', 'Velocidade de Processamento']
  },
  {
    id: 'quebra_cabeca_formas',
    name: 'Laboratório Cognitivo: Quebra-Cabeça de Formas',
    description: 'Ordene e monte formas geométricas complexas e tangram para desvendar imagens abstratas na tela, trabalhando espaço e simetria.',
    bioma: 'cognitivo',
    ageGroup: 'fundamental_iniciais',
    ageLabel: 'Ensino Fundamental Anos Iniciais',
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
    skillsWorked: ['Raciocínio Espacial', 'Resolução de Problemas', 'Simetria e Geometria']
  },
  {
    id: 'reino_numeros',
    name: 'Reino dos Números e Quantidades',
    description: 'Ajude os personagens a alimentar os animais da fazenda dando a quantidade exata de alimentos, trabalhando operações lógicas e contagem.',
    bioma: 'matematico',
    ageGroup: 'fundamental_iniciais',
    ageLabel: 'Ensino Fundamental Anos Iniciais',
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
    skillsWorked: ['Conceito Numérico', 'Adição e Subtração Básicas', 'Correspondência de Grupos']
  },

  // --- Ensino Fundamental Anos Finais (6º ao 9º ano) ---
  {
    id: 'detetive_social',
    name: 'Detetive Social e Cidadania',
    description: 'O aluno assume o papel de um mediador escolar resolvendo dilemas éticos, situações de cooperação e inclusão na sua comunidade escolar.',
    bioma: 'emocoes',
    ageGroup: 'fundamental_finais',
    ageLabel: 'Ensino Fundamental Anos Finais',
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
    skillsWorked: ['Pensamento Crítico', 'Raciocínio Ético', 'Mediação e Socialização']
  },
  {
    id: 'desafio_sequencias',
    name: 'Desafio das Sequências e Lógica Computacional',
    description: 'Ordene blocos lógicos e crie fluxogramas visuais simples para guiar um robozinho até o seu objetivo, estimulando lógica computacional.',
    bioma: 'cognitivo',
    ageGroup: 'fundamental_finais',
    ageLabel: 'Ensino Fundamental Anos Finais',
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
    skillsWorked: ['Lógica Algorítmica', 'Pensamento Estruturado', 'Decomposição de Problemas']
  }
];
