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
        duration: '45 min', 
        type: 'leitura', 
        completed: false, 
        description: 'A evolução do olhar sobre a deficiência e a indissociabilidade do cuidado.',
        content: `### O Paradigma da Inclusão Radical
A trajetória da educação especial no Brasil evoluiu de um modelo de segregação para um paradigma de inclusão radical. Segundo o Guia MEC 2026, a verdadeira inclusão ocorre quando há o rompimento das barreiras pedagógicas e atitudinais, permitindo que o estudante pertença e participe ativamente.

### O Binômio Educar-Cuidar
Superar a dicotomia entre o "educar" e o "cuidar" é central. A teoria postula que cada momento de interação, como a alimentação ou higiene, é uma oportunidade pedagógica para trabalhar autonomia e comunicação, fundamentais para a dignidade humana.

### Avaliação para Aprendizagem
O cuidado não é uma interrupção, mas uma base ética de suporte. Ao cuidar, estabelece-se um vínculo de confiança onde a aprendizagem floresce. Sem segurança emocional, o acesso cognitivo torna-se extremamente dificultado.

### Atitude Mediadora Humanizadora
Reconhecer o aluno como sujeito de direitos e olhar para as potencialidades, além do diagnóstico clínico. O foco muda de "o que o aluno não consegue" para "como podemos organizar o ambiente para que ele consiga".

### Planejamento Colaborativo
A gestão deve garantir espaços para o diálogo entre professores e mediadores. Quando a equipe fala a mesma língua pedagógica, a mediação torna-se uma ponte eficaz para a equidade e autonomia do estudante.

**Integração BNCC:**
* **Código:** \`EF01HI01\` - Identificar aspectos do seu crescimento por meio do registro das lembranças de sua memória...
* **Estratégia DUA:** No pilar da **Representação**, utilize objetos táteis e registros sonoros além de fotos. Isso permite que alunos com deficiência visual ou intelectual acessem a noção de tempo de forma concreta.`
      },
      { 
        id: 2, 
        title: 'Mediação Humanizadora na Prática', 
        duration: '40 min', 
        type: 'leitura', 
        completed: false, 
        description: 'Estratégias de Scaffolding (andaime) e a Zona de Desenvolvimento Proximal (ZPD).',
        content: `### Expansão do Potencial
A mediação fundamenta-se na ideia de que a inteligência pode ser expandida através da interação qualificada. O mediador atua na ZPD, oferecendo o "andaime" (scaffolding) necessário para novos níveis de autonomia.

### Intencionalidade e Ajuste
Diferente de apenas vigiar, o mediador humanizador atua com intencionalidade, provocando reflexão. A "Avaliação para Aprendizagem" (MEC 2026) exige ajustes de suporte em tempo real, celebrando microevoluções.

### Escuta Sensível e Invisibilidade
O mediador deve traduzir linguagens não verbais e gestos, garantindo que o aluno se sinta parte do grupo. É um ato de resistência contra a invisibilidade, reafirmando o lugar de aprender de todos.

### Barreiras Atitudinais e Cooperação
O foco deve estar na remoção de preconceitos, incentivando a turma a respeitar diferentes ritmos. Quando bem-sucedida, a mediação promove interação independente com o conhecimento e com os pares.

### Rede de Apoio e Transdisciplinaridade
A mediação faz parte de uma rede que envolve professor regente, AEE e família. O diálogo transdisciplinar garante que o suporte seja articulado com o currículo oficial e as necessidades do estudante.

**Integração BNCC:**
* **Código:** \`EF01GE01\` - Descrever características de seus lugares de vivência (moradia, escola etc.)...
* **Estratégia DUA:** No pilar de **Ação e Expressão**, permita o uso de mapas táteis ou fotografias digitais. Múltiplas linguagens garantem que alunos com dificuldades motoras ou de fala expressem sua percepção do espaço.`
      },
      { 
        id: 3, 
        title: 'Atividade de Reflexão: Prática Diária', 
        duration: '20 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Transformando momentos de rotina em oportunidades pedagógicas.',
        content: `### O Motor da Transformação
A reflexão sobre a prática diária impede que o automatismo bloqueie as oportunidades de mediação. Analise momentos da rotina sob a lente do Educar-Cuidar: onde há real promoção de aprendizado?

### Autoavaliação Docente
Praticar a "Avaliação para a Aprendizagem" de si mesmo envolve identificar barreiras criadas inconscientemente e buscar caminhos variados para o engajamento de todos os alunos.

### Engajamento Afetivo
A aprendizagem é emocional. Se o aluno não se sente seguro e valorizado, o processo cognitivo será superficial. Questione-se: "Meu aluno sentiu que sua presença fez diferença hoje?".

### Diálogo e Formação Coletiva
O compartilhamento de desafios entre mediador e professor regente fortalece a intervenção. A inclusão é trabalho de equipe e a reflexão compartilhada gera conhecimento prático vivo na escola.

### Intencionalidade em Transições
Escolha um momento de transição (como a chegada, o recreio ou a saída) e planeje uma intencionalidade pedagógica para ele. Como esse momento de "cuidado" ou "rotina" pode ser transformado em uma experiência de autonomia e descoberta para o aluno com deficiência?

**Integração BNCC:**
* **Código:** \`EF15AR01\` - Identificar e apreciar formas distintas das artes visuais...
* **Estratégia DUA:** No pilar do **Engajamento**, promova uma "galeria de sensações" (tato, som, aroma). Isso permite que alunos com deficiências sensoriais se envolvam profundamente com a apreciação artística.`
      },
      {
        id: 4,
        title: 'Quiz: Fundamentos da Inclusão',
        duration: '15 min',
        type: 'quiz',
        completed: false,
        description: 'Avaliação de conhecimentos sobre o binômio Educar-Cuidar e a mediação humanizadora.',
        content: `### Quiz - Módulo 1: Fundamentos da Inclusão
Responda mentalmente ou anote suas respostas:

**1. O que representa o binômio "Educar-Cuidar" na educação inclusiva?**
a) A divisão de tarefas onde o professor educa e o mediador apenas cuida do bem-estar físico.
b) A compreensão de que as ações de cuidado (alimentação, higiene) são indissociáveis do ato educativo e promovem autonomia.
c) A priorização das necessidades médicas e de saúde em detrimento das atividades de aprendizagem pedagógica.

**2. A atuação do mediador na Zona de Desenvolvimento Proximal (ZPD) caracteriza-se por:**
a) Realizar a tarefa pelo aluno para evitar frustrações.
b) Oferecer o suporte temporário e ajustado ("andaime" ou scaffolding) para que o aluno desenvolva autonomia.
c) Deixar o aluno realizar as atividades sem intervenção, estimulando a autodescoberta pura.

*Gabarito: 1-b, 2-b*`
      }
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
        id: 5, 
        title: 'Alfabetização Inclusiva e a Lei 15.247/2025', 
        duration: '30 min', 
        type: 'leitura', 
        completed: false, 
        description: 'A obrigatoriedade de garantir meios para que todos acessem o código escrito.',
        content: `### O Direito Inalienável à Escrita
A Lei 15.247/2025 reafirma o direito de todo estudante à alfabetização. A escola deve garantir meios e adaptações curriculares para que o aluno percorra o ciclo de alfabetização junto aos seus pares cronológicos, invertendo a lógica da "eterna prontidão".

### Abordagens Multissensoriais
Para alunos com TEA, dislexia ou DI, abordagens que estimulem múltiplos sentidos são cruciais. O uso de letras de lixa, escrita na areia e o método fônico-gestual garante que o cérebro processe a informação por diversos caminhos.

### Ferramenta de Libertação
O Guia MEC 2026 propõe que a avaliação foque nos processos de construção da hipótese de escrita. Compreender a função social do texto é tão vital quanto a decodificação, exigindo flexibilidade sem abrir mão de altas expectativas.

### Formação e DUA
A alfabetização inclusiva beneficia toda a turma ao tornar o método regular acessível. Quando se usa imagens, sons e movimentos, respeita-se a diversidade de estilos de aprendizagem, elevando a qualidade do ensino para todos os estudantes.

### Combatendo Mitos de Incapacidade
A lei é categórica: o fracasso na alfabetização de um aluno PCD é um fracasso dos suportes oferecidos pela escola. Garantir o ler e escrever é garantir cidadania, autonomia e acesso ao patrimônio cultural da humanidade.

**Integração BNCC:**
* **Código:** \`EF01LP02\` - Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética...
* **Estratégia DUA:** No pilar da **Representação**, use letras móveis magnéticas coloridas e softwares de síntese de voz. O feedback instantâneo por múltiplos canais facilita a associação fonema-grafema.`
      },
      { 
        id: 6, 
        title: 'Implementando o AEE sem Laudo', 
        duration: '20 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Plano de ação para suporte imediato ao aluno.',
        content: `### Fim da Barreira Clínica
O Marco Legal 2025/2026 extingue a obrigatoriedade do laudo médico como condição para o AEE. Se a equipe escolar identifica barreiras pedagógicas significativas, o suporte especializado deve ser iniciado imediatamente.

### Foco na Funcionalidade
O AEE é um serviço pedagógico, não clínico. O foco está nas barreiras de atenção, comunicação e motricidade. Relatórios de Identificação de Necessidades Pedagógicas assinados pela escola passam a ter validade legal para recursos.

### O Professor como Detetive de Barreiras
O professor regente assume papel ativo na identificação de travas no aprendizado através da observação sistemática. O diagnóstico pedagógico oferece caminhos práticos de intervenção muito mais eficazes que um CID clínico isolado.

### Agilidade e Gestão de Rede
Essa mudança permite que a gestão municipal responda rapidamente à demanda real das escolas, sem os gargalos do sistema de saúde. A autonomia escolar é fortalecida, separando os tempos da burocracia dos tempos da aprendizagem.

### Justiça Educacional e Autonomia
Implementar o AEE sem laudo reconhece a soberania da escola sobre as necessidades de seus alunos. O IncluiEduTec apoia esse fluxo, documentando necessidades e garantindo que nenhum aluno espere por diagnósticos para aprender.

**Integração BNCC:**
* **Código:** \`EF15LP03\` - Localizar informações explícitas em textos.
* **Estratégia DUA:** No pilar da **Representação**, use marcadores físicos ou digitais coloridos. Se o aluno não decodifica, ele busca a informação em um texto lido pelo mediador, apontando a ilustração correspondente.`
      },
      {
        id: 7,
        title: 'Quiz: O Novo Marco Legal',
        duration: '15 min',
        type: 'quiz',
        completed: false,
        description: 'Avaliação de conhecimentos sobre a Lei 15.247/2025 e o AEE sem laudo.',
        content: `### Quiz - Módulo 2: O Novo Marco Legal
Responda mentalmente ou anote suas respostas:

**1. Segundo a Lei nº 15.247/2025, qual documento é obrigatório para iniciar o AEE na escola?**
a) Laudo médico com CID específico emitido por neuropediatra.
b) O laudo médico deixa de ser obrigatório; basta a identificação de barreiras pedagógicas pela escola.
c) Encaminhamento assinado pelo Ministério Público ou Conselho Tutelar.

**2. Qual o foco principal do Atendimento Educacional Especializado (AEE)?**
a) O tratamento clínico das patologias do desenvolvimento.
b) A eliminação de barreiras pedagógicas, de comunicação e atitudinais para garantir acessibilidade ao currículo.
c) A aceleração de conteúdos para que o aluno alcance a seriação regular mais rápido.

*Gabarito: 1-b, 2-b*`
      }
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
        id: 8, 
        title: 'Os 3 Princípios do DUA', 
        duration: '45 min', 
        type: 'leitura', 
        completed: false, 
        description: 'Engajamento, Representação e Ação/Expressão.',
        content: `### A Estrutura da Acessibilidade
O DUA permite transformar a inclusão em realidade técnica. Planejamos desde o início para a diversidade. O primeiro princípio é o **Engajamento** (o "porquê"): focar em despertar o interesse, oferecer escolhas e conexão com a realidade.

### Representação (O "Quê")
Reconhece que os alunos percebem informações de formas diferentes. Exige conteúdos em múltiplos formatos: texto, vídeo, áudio, objetos concretos. A avaliação deve verificar se a forma de entrega não foi a barreira.

### Ação e Expressão (O "Como")
Permite que os alunos demonstrem o que aprenderam de formas variadas (computador, mapa mental, oral). A flexibilização dos meios de resposta garante que avaliamos o conhecimento, não a habilidade motora ou escrita.

### Currículo Flexível vs. Deficiência
A deficiência não está no aluno, mas no currículo inflexível. O DUA reduz a necessidade de PEIs complexos, pois o plano geral já contempla a maioria das necessidades, beneficiando alunos com e sem deficiência.

### Criatividade e Rigor
O educador deve abrir múltiplas portas de entrada para o conteúdo. A "Avaliação para Aprendizagem" torna-se análise de acessibilidade. Essa abordagem tira o peso do fracasso do aluno e foca na inovação docente.

**Integração BNCC:**
* **Código:** \`EF01MA01\` - Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas...
* **Estratégia DUA:** No pilar de **Engajamento**, use situações reais como numeração de salas ou códigos de barras. Materiais manipuláveis facilitam a conceituação para alunos com dificuldades de abstração.`
      },
      { 
        id: 9, 
        title: 'Planejamento Proativo', 
        duration: '40 min', 
        type: 'atividade', 
        completed: false, 
        description: 'Criando aulas que não precisam de adaptações posteriores.',
        content: `### Alma do DUA: Antecipação
O planejamento proativo antecipa barreiras e já inclui suportes no design da aula. É a diferença entre projetar um edifício com acessibilidade universal desde a fundação versus colocar uma rampa improvisada depois.

### Cuidado Pedagógico
Alinha-se ao binômio 'Educar e Cuidar'. Garante que o aluno não se sinta um "corpo estranho". Quando ferramentas de acessibilidade são para toda a turma, o aluno PCD não é estigmatizado, promovendo segurança psicológica.

### Dados e Evidências
O planejamento deve ser baseado na "Avaliação para Aprendizagem". Se há alunos que precisam de rotinas visuais, o cronograma já deve estar no quadro. O planejamento deixa de ser burocracia e vira mapa de sucessos.

### Colaboração Estreita
Exige diálogo com o mediador. Antes de desenhar a aula, questione as barreiras previstas. Essa inteligência compartilhada cria suportes que potencializam a ação de "ponte" pedagógica do mediador.

### Excelência e Respeito
Um planejamento proativo é robusto e respeita a inteligência de cada estudante. É a afirmação de que ninguém é "menos" e que a escola está pronta para acolher a todos com o mesmo nível de dedicação.

**Integração BNCC:**
* **Código:** \`EF01CI01\` - Comparar características de diferentes materiais do cotidiano quanto a sua forma, textura, dureza, cor e brilho.
* **Estratégia DUA:** No pilar de **Ação e Expressão**, organize uma "caixa de mistérios" para classificar materiais pelo tato. É equidade total para deficientes visuais e facilita a conceituação concreta para alunos com TEA.`
      },
      {
        id: 10,
        title: 'Quiz: Desenho Universal para a Aprendizagem (DUA)',
        duration: '15 min',
        type: 'quiz',
        completed: false,
        description: 'Avaliação de conhecimentos sobre os pilares do DUA.',
        content: `### Quiz - Módulo 3: Desenho Universal para a Aprendizagem
Responda mentalmente ou anote suas respostas:

**1. Quais são os três pilares fundamentais do DUA?**
a) Representação, Ação e Expressão, e Engajamento.
b) Diagnóstico, Medicação e Adaptação Individualizada.
c) Didática, Avaliação Tradicional e Atividades Complementares.

**2. Na perspectiva do DUA, a flexibilidade curricular deve ser planejada:**
a) Apenas quando o aluno com deficiência apresentar dificuldades extremas na aula.
b) De forma proativa desde a concepção do plano de aula, beneficiando todos os estudantes.
c) Reduzindo as expectativas e o nível de exigência para os alunos PCD.

*Gabarito: 1-a, 2-b*`
      }
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
        id: 11, 
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
      {
        id: 12,
        title: 'Quiz: Avaliação Formativa e Estudo de Caso',
        duration: '15 min',
        type: 'quiz',
        completed: false,
        description: 'Avaliação de conhecimentos sobre o Estudo de Caso e Avaliação Formativa.',
        content: `### Quiz - Módulo 4: Avaliação Formativa e Estudo de Caso
Responda mentalmente ou anote suas respostas:

**1. De acordo com o Guia MEC 2026, qual é a primeira etapa na elaboração do Estudo de Caso?**
a) A definição da medicação escolar.
b) A identificação das barreiras que impedem a participação ativa do estudante.
c) A reprovação ou aprovação direta do ano letivo.

**2. A "Avaliação para a Aprendizagem" se diferencia da avaliação tradicional pois:**
a) Não gera relatórios formais e foca apenas na observação informal.
b) É diagnóstica, processual e serve para ajustar os suportes pedagógicos em tempo real.
c) Elimina qualquer critério de avaliação, aprovando todos de forma automática.

*Gabarito: 1-b, 2-b*`
      }
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
        id: 13, 
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
        id: 14, 
        title: 'Quiz Final e Certificação', 
        duration: '20 min', 
        type: 'quiz', 
        completed: false, 
        description: 'Avaliação final integradora.',
        content: `### Verificação de Conhecimentos
Responda mentalmente ou anote suas respostas para validar seu aprendizado:

**1. Segundo a Lei 15.247/2025, qual é o pré-requisito para iniciar o AEE?**
a) Laudo médico com CID.
b) Identificação de barreiras pedagógicas pelo professor.
c) Autorização da Secretaria Estadual.

**2. O binômio "Educar e Cuidar" significa:**
a) Que o mediador cuida e o professor educa.
b) Que o cuidado é parte integrante e indissociável do processo pedagógico.
c) Que as atividades de higiene devem ser feitas fora do horário de aula.

**3. No DUA, oferecer um texto em braille e em áudio atende a qual pilar?**
a) Engajamento.
b) Ação e Expressão.
c) Representação.

### Conclusão do Módulo
Parabéns! Você completou o Módulo 5. Avance para o próximo módulo para concluir sua formação.`
      },
    ],
  },
  {
    id: 6,
    title: 'Módulo 6',
    subtitle: 'Atualizações Legislativas e Diretrizes Inclusivas 2025',
    icon: 'fa-scale-balanced',
    color: 'from-indigo-600 to-indigo-800',
    description: 'Capacitar professores e gestores escolares sobre as novas políticas e decretos de inclusão publicados pelo MEC em 2025, com foco na aplicação prática das normativas na escola.',
    objectives: [
      'Compreender as diretrizes da Portaria MEC nº 421/2025 para o AEE',
      'Analisar o impacto do Decreto nº 12.686/2025 (PNEEI) na escola',
      'Promover equidade, acessibilidade e combate ao capacitismo',
      'Aplicar o checklist de conformidade e o uso de tecnologias assistivas',
    ],
    lessons: [
      {
        id: 15,
        title: 'Diretrizes e Decretos da Inclusão 2025',
        duration: '40 min',
        type: 'leitura',
        completed: false,
        description: 'Apresentação detalhada da Portaria MEC nº 421/2025 e do Decreto nº 12.686/2025.',
        content: `### Portaria MEC nº 421/2025
A Portaria nº 421/2025 estabelece novas orientações operacionais para o funcionamento das salas de recursos multifuncionais e para a atuação do profissional do AEE. Ela enfatiza a importância de um trabalho integrado com o professor de classe comum, superando o modelo de atendimento isolado no contraturno.

### Decreto nº 12.686/2025 e a PNEEI
O Decreto nº 12.686/2025 consolida a Política Nacional de Educação Especial Inclusiva (PNEEI), reafirmando o compromisso do Estado brasileiro com sistemas de ensino plenamente inclusivos. O foco é a remoção de barreiras arquitetônicas, pedagógicas, atitudinais e tecnológicas nas escolas públicas e privadas.

### Equidade e Acessibilidade
O MEC define equidade como a oferta de recursos diferenciados para atender às necessidades específicas de cada estudante, garantindo condições de igualdade para o aprendizado. A acessibilidade deve ser pensada sob o prisma da diversidade humana, combatendo de maneira veemente qualquer prática de capacitismo no ambiente escolar.

### Tecnologias Assistivas e Práticas Inclusivas
A utilização de leitores de tela, teclados adaptados, softwares de comunicação alternativa e recursos de baixo custo é incentivada de forma integrada ao planejamento da BNCC.

**Integração BNCC:**
* **Código:** \`EF02LP01\` - Expressar-se em situações de intercâmbio oral com clareza...
* **Estratégia DUA:** No pilar de **Ação e Expressão**, incentive o uso de pranchas de Comunicação Alternativa e Ampliada (CAA) físicas ou digitais. Isso garante que alunos não-verbais participem ativamente dos momentos de expressão oral.`
      },
      {
        id: 16,
        title: 'Aplicando as Novas Normas na Escola',
        duration: '30 min',
        type: 'atividade',
        completed: false,
        description: 'Estratégias de implementação prática do AEE e checklist de conformidade.',
        content: `### Estudo Prático de Caso
Imagine uma escola que recebe um novo aluno com paralisia cerebral severa. De acordo com as diretrizes de 2025, o primeiro passo deve ser a formação de uma comissão colaborativa (professor regente, AEE, equipe de gestão e mediador) para realizar a avaliação functional inicial e elaborar o PEI, sem dependência prévia de laudos clínicos.

### Checklist de Conformidade Escolar
* **Acessibilidade física e arquitetônica** garantida em todos os espaços de vivência.
* **Planejamento docente** baseado nos princípios do DUA.
* **AEE de suporte articulado** com o professor da sala de aula comum.
* **Ações escolares integradas** para combate ao capacitismo.

### Atividade Prática de Implementação
Elabore um checklist de conformidade contendo 5 pontos críticos a serem avaliados na sua escola para atender à Portaria nº 421/2025. Proponha uma ação imediata de conscientização atitudinal a ser realizada com o conselho escolar sobre o combate ao capacitismo.

**Integração BNCC:**
* **Código:** \`EF03MA05\` - Utilizar diferentes procedimentos de cálculo mental e escrito...
* **Estratégia DUA:** No pilar de **Engajamento**, apresente desafios matemáticos contextualizados com jogos acessíveis em software inclusivo. A gamificação estimula a persistência e o foco de forma flexível.`
      },
      {
        id: 17,
        title: 'Quiz final e Certificação do Curso',
        duration: '20 min',
        type: 'quiz',
        completed: false,
        description: 'Avaliação final integradora sobre a legislação 2025 e conformidade inclusiva.',
        content: `### Quiz - Módulo 6: Atualizações 2025
Responda mentalmente ou anote suas respostas:

**1. Qual o foco principal do Decreto nº 12.686/2025 (PNEEI)?**
a) A criação de escolas especiais exclusivas para alunos com deficiência.
b) O fortalecimento de sistemas de ensino plenamente inclusivos com remoção sistemática de barreiras pedagógicas e tecnológicas.
c) A transferência da responsabilidade educacional exclusivamente para as famílias.

**2. A Portaria MEC nº 421/2025 orienta que o trabalho do AEE deve ser:**
a) Desenvolvido de forma isolada, sem contato com o planejamento da sala comum.
b) Integrado e articulado com o professor de classe comum, visando ao coplanejamento.
c) Restrito apenas ao preenchimento de relatórios administrativos.

*Gabarito: 1-b, 2-b*

### Conclusão do Curso
Parabéns! Você completou a formação **Inclusão na Prática**. Aplique esses conceitos no seu dia a dia e utilize as ferramentas do IncluiEduTec para documentar a evolução dos seus alunos. Seu certificado de formação continuada de Educação Inclusiva (MEC 2026/2025) estará disponível assim que marcar todas as lições como concluídas.`
      }
    ],
  }
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
              <span className="text-blue-100">6 Módulos</span>
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

          {/* Card de certificado se módulo 6 */}
          {activeModule.id === 6 && (
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
