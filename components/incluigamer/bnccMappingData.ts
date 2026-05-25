export interface BnccMapping {
  id: string; // Habilidade principal BNCC
  gameId: string;
  faixaEtaria: string;
  etapaEnsino: 'Educação Infantil' | 'Ensino Fundamental I' | 'Ensino Fundamental II';
  habilidadeBncc: string;
  descricaoBncc: string;
  campoExperiencia?: string; // Para Educação Infantil
  subject?: string; // Para Ensino Fundamental
  eixoCognitivo: 'Alfabetização' | 'Raciocínio Lógico' | 'Socioemocional' | 'Percepção Sensorial' | 'Coordenação Visomotora';
  nivelDificuldade: 'Fácil' | 'Médio' | 'Difícil' | 'Adaptativo';
  tagsPedagogicas: string[];
}

export const BNCC_MAPPING_DATA: BnccMapping[] = [
  // --- Bebês (0 a 1 ano e 6 meses) ---
  {
    id: 'EI01TS01',
    gameId: 'orquestra_sons',
    faixaEtaria: '0-1.5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI01TS01',
    descricaoBncc: 'Explorar sons produzidos com o próprio corpo e com objetos do ambiente.',
    campoExperiencia: 'Traços, sons, cores e formas',
    eixoCognitivo: 'Percepção Sensorial',
    nivelDificuldade: 'Fácil',
    tagsPedagogicas: ['Estímulo Sonoro', 'Estímulo Tátil', 'Causa e Efeito']
  },
  {
    id: 'EI01TS03',
    gameId: 'orquestra_sons',
    faixaEtaria: '0-1.5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI01TS03',
    descricaoBncc: 'Explorar diferentes fontes sonoras e materiais para acompanhar ritmos musicais.',
    campoExperiencia: 'Traços, sons, cores e formas',
    eixoCognitivo: 'Percepção Sensorial',
    nivelDificuldade: 'Fácil',
    tagsPedagogicas: ['Musicalização', 'Atenção Auditiva', 'Calmante']
  },
  {
    id: 'EI01CG05',
    gameId: 'toque_cores',
    faixaEtaria: '0-1.5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI01CG05',
    descricaoBncc: 'Utilizar os movimentos de preensão, encaixe e lançamento, ampliando suas possibilidades de manuseio de diferentes materiais.',
    campoExperiencia: 'Corpo, gestos e movimentos',
    eixoCognitivo: 'Coordenação Visomotora',
    nivelDificuldade: 'Fácil',
    tagsPedagogicas: ['Precisão de Toque', 'Visomotor', 'Calmante']
  },
  {
    id: 'EI01TS02',
    gameId: 'toque_cores',
    faixaEtaria: '0-1.5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI01TS02',
    descricaoBncc: 'Traçar marcas gráficas sobre diferentes superfícies, utilizando elementos visuais (ponto, linha, forma e cor).',
    campoExperiencia: 'Traços, sons, cores e formas',
    eixoCognitivo: 'Percepção Sensorial',
    nivelDificuldade: 'Fácil',
    tagsPedagogicas: ['Rastreamento Visual', 'Cromoterapia', 'Regulação Sensorial']
  },

  // --- Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses) ---
  {
    id: 'EI02ET05',
    gameId: 'balao_formas',
    faixaEtaria: '1.5-3',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI02ET05',
    descricaoBncc: 'Classificar objetos, considerando determinado atributo (tamanho, peso, cor, forma etc.).',
    campoExperiencia: 'Espaços, tempos, quantidades, relações e transformações',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Diferenciação de Formas', 'Pareamento Visual', 'Geometria Espacial']
  },
  {
    id: 'EI02ET01',
    gameId: 'balao_formas',
    faixaEtaria: '1.5-3',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI02ET01',
    descricaoBncc: 'Compartilhar com outras crianças a exploração de espaços e de objetos com diferentes características.',
    campoExperiencia: 'Espaços, tempos, quantidades, relações e transformações',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Atenção Sustentada', 'Exploração Ativa', 'Coordenação Fina']
  },
  {
    id: 'EI02EO01',
    gameId: 'termometro_sentimentos_infantil',
    faixaEtaria: '1.5-3',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI02EO01',
    descricaoBncc: 'Demonstrar atitudes de cuidado e solidariedade na interação com crianças e adultos.',
    campoExperiencia: 'O eu, o outro e o nós',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Médio',
    tagsPedagogicas: ['Empatia', 'Autocuidado', 'Inteligência Emocional']
  },
  {
    id: 'EI02EO04',
    gameId: 'termometro_sentimentos_infantil',
    faixaEtaria: '1.5-3',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI02EO04',
    descricaoBncc: 'Comunicar-se com colegas e adultos, buscando ajuda e expressando sentimentos, necessidades e opiniões.',
    campoExperiencia: 'O eu, o outro e o nós',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Médio',
    tagsPedagogicas: ['Reconhecimento Facial', 'Comunicação Afetiva', 'Autoexpressão']
  },

  // --- Crianças pequenas (4 a 5 anos e 11 meses) ---
  {
    id: 'EI03EO01',
    gameId: 'termometro_sentimentos',
    faixaEtaria: '4-5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI03EO01',
    descricaoBncc: 'Demonstrar empatia pelos outros, percebendo que as pessoas têm diferentes sentimentos, necessidades e maneiras de pensar e agir.',
    campoExperiencia: 'O eu, o outro e o nós',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Empatia', 'Perspectiva Social', 'Regulação Emocional']
  },
  {
    id: 'EI03EO02',
    gameId: 'termometro_sentimentos',
    faixaEtaria: '4-5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI03EO02',
    descricaoBncc: 'Agir de maneira independente, com confiança em suas capacidades, reconhecendo suas conquistas e limitações.',
    campoExperiencia: 'O eu, o outro e o nós',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Autoestima', 'Resiliência', 'Tomada de Decisão']
  },
  {
    id: 'EI03EF09',
    gameId: 'cacadores_letras_infantil',
    faixaEtaria: '4-5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI03EF09',
    descricaoBncc: 'Recorrer a estratégias diversas para pautar a escrita espontânea, mostrando interesse em escrever palavras e textos.',
    campoExperiencia: 'Escuta, fala, pensamento e imaginação',
    eixoCognitivo: 'Alfabetização',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Alfabetização Inicial', 'Escrita Espontânea', 'Fonemas']
  },
  {
    id: 'EI03EF03',
    gameId: 'cacadores_letras_infantil',
    faixaEtaria: '4-5',
    etapaEnsino: 'Educação Infantil',
    habilidadeBncc: 'EI03EF03',
    descricaoBncc: 'Escolher e folhear livros, mostrando preferência por gêneros, temas e ilustrações, e identificando seus autores.',
    campoExperiencia: 'Escuta, fala, pensamento e imaginação',
    eixoCognitivo: 'Alfabetização',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Consciência Fonológica', 'Vocabulário', 'Foco Atento']
  },

  // --- Ensino Fundamental I (Anos Iniciais) ---
  {
    id: 'EF15LP18',
    gameId: 'cacadores_letras',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF15LP18',
    descricaoBncc: 'Relacionar elementos sonoros (sílabas, fonemas, partes de palavras) com sua representação escrita.',
    subject: 'Língua Portuguesa',
    eixoCognitivo: 'Alfabetização',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Ortografia', 'Consciência Silábica', 'Grafofônica']
  },
  {
    id: 'EF01LP08',
    gameId: 'cacadores_letras',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF01LP08',
    descricaoBncc: 'Relacionar elementos sonoros de palavras com sua representação escrita.',
    subject: 'Língua Portuguesa',
    eixoCognitivo: 'Alfabetização',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Leitura Autônoma', 'Associação Grafema-Fonema', 'Segmentação']
  },
  {
    id: 'EF15AR02',
    gameId: 'quebra_cabeca_formas',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF15AR02',
    descricaoBncc: 'Explorar e reconhecer elementos constitutivos das artes visuais (ponto, linha, forma, cor, espaço, movimento etc.).',
    subject: 'Artes',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Tangram', 'Rotação Mental', 'Simetria']
  },
  {
    id: 'EF01MA14',
    gameId: 'quebra_cabeca_formas',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF01MA14',
    descricaoBncc: 'Identificar e nomear figuras geométricas planas (círculo, quadrado, retângulo e triângulo) em desenhos e objetos.',
    subject: 'Matemática',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Geometria Plana', 'Resolução de Problemas', 'Foco']
  },
  {
    id: 'EF01MA01',
    gameId: 'reino_numeros',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF01MA01',
    descricaoBncc: 'Utilizar números naturais como indicadores de quantidade ou de ordem em diferentes situações cotidianas.',
    subject: 'Matemática',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Médio',
    tagsPedagogicas: ['Contagem Ativa', 'Conceito Numérico', 'Correspondência']
  },
  {
    id: 'EF01MA04',
    gameId: 'reino_numeros',
    faixaEtaria: 'fundamental_iniciais',
    etapaEnsino: 'Ensino Fundamental I',
    habilidadeBncc: 'EF01MA04',
    descricaoBncc: 'Contar a quantidade de objetos de coleções de até 20 elementos e apresentar o resultado por registros verbais e simbólicos.',
    subject: 'Matemática',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Médio',
    tagsPedagogicas: ['Adição Básica', 'Associação de Grupos', 'Subtração Ilustrada']
  },

  // --- Ensino Fundamental II (Anos Finais) ---
  {
    id: 'EF06ER07',
    gameId: 'detetive_social',
    faixaEtaria: 'fundamental_finais',
    etapaEnsino: 'Ensino Fundamental II',
    habilidadeBncc: 'EF06ER07',
    descricaoBncc: 'Avaliar e exercitar caminhos éticos para a convivência social em comunidades pluralistas e inclusivas.',
    subject: 'Ensino Religioso / Socioemocional',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Ética', 'Cidadania', 'Inclusão Social']
  },
  {
    id: 'EF08ER04',
    gameId: 'detetive_social',
    faixaEtaria: 'fundamental_finais',
    etapaEnsino: 'Ensino Fundamental II',
    habilidadeBncc: 'EF08ER04',
    descricaoBncc: 'Debater sobre a diversidade cultural e o respeito às diferenças individuais como base democrática.',
    subject: 'Ensino Religioso / Socioemocional',
    eixoCognitivo: 'Socioemocional',
    nivelDificuldade: 'Adaptativo',
    tagsPedagogicas: ['Respeito à Diversidade', 'Pensamento Crítico', 'Cooperação']
  },
  {
    id: 'EF06MA09',
    gameId: 'desafio_sequencias',
    faixaEtaria: 'fundamental_finais',
    etapaEnsino: 'Ensino Fundamental II',
    habilidadeBncc: 'EF06MA09',
    descricaoBncc: 'Resolver e elaborar problemas que envolvam números fracionários ou sequências recursivas estruturadas.',
    subject: 'Matemática',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Difícil',
    tagsPedagogicas: ['Lógica Algorítmica', 'Pensamento Sequencial', 'Decomposição']
  },
  {
    id: 'EF08MA11',
    gameId: 'desafio_sequencias',
    faixaEtaria: 'fundamental_finais',
    etapaEnsino: 'Ensino Fundamental II',
    habilidadeBncc: 'EF08MA11',
    descricaoBncc: 'Identificar e criar expressões que descrevam regularidades em sequências de figuras ou padrões numéricos.',
    subject: 'Matemática',
    eixoCognitivo: 'Raciocínio Lógico',
    nivelDificuldade: 'Difícil',
    tagsPedagogicas: ['Reconhecimento de Padrões', 'Estruturas de Decisão', 'Tangível']
  }
];
