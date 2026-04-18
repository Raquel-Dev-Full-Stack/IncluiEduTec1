# Documento de Requisitos do Produto (PRD) - IncluiEduTec

## 1. Sumário Executivo
O **IncluiEduTec** é uma plataforma de gestão pedagógica e operacional especializada, projetada para promover a inclusão educacional nas redes municipais de ensino. Ele fornece um hub centralizado para monitorar alunos com necessidades educacionais especiais (AEE), gerenciar equipes especializadas (mediadores e professores) e garantir o desenvolvimento pedagógico baseado em dados.

## 2. Objetivos e Metas
*   **Centralizar Dados de Inclusão**: Fornecer uma fonte única de verdade para registros de alunos, planos inclusivos e diários de classe.
*   **Eficiência Operacional**: Agilizar a alocação de mediadores e a gestão das unidades escolares.
*   **Qualidade Pedagógica**: Facilitate o planejamento de aulas alinhado à BNCC e planos educacionais personalizados (PEI/PDI).
*   **Transparência**: Permitir o monitoramento em tempo real para a Secretaria e Diretores Escolares.

## 3. Público-Alvo (Personas)
| Persona | Descrição do Papel | Necessidades Chave |
| :--- | :--- | :--- |
| **Admin Geral** | Administrador do Sistema | Gestão de multi-tenancy (municípios), configurações globais. |
| **Secretaria** | Gestor da Rede de Ensino | Métricas macro, comparação entre escolas, supervisão de recursos. |
| **Diretor** | Líder da Unidade Escolar | Gestão de equipe, matrícula de alunos, relatórios escolares. |
| **Professor** | Professor Regente | Planejamento de aulas, chamadas, registros pedagógicos. |
| **Mediador** | Profissional de Apoio Especializado | Diários de interação, acompanhamento comportamental/operacional. |

## 4. Requisitos Funcionais

### 4.1. Autenticação e Tenancy
*   **Multi-Tenancy**: Suporte a múltiplos municípios identificados via slug na URL.
*   **Controle de Acesso Baseado em Papéis (RBAC)**: Dashboards e permissões distintas para cada persona.
*   **Autenticação Unificada**: Detecção automática do papel do usuário (Admin, Secretaria, etc.) no banco de dados, simplificando a interface de login e garantindo redirecionamento correto.
*   **Segurança Padronizada**: Login seguro via E-mail e Senha, integrado ao Supabase Auth, com suporte a senha mestra para administração em emergências.

### 4.2. Dashboard (Hub Dinâmico)
*   **Widgets de KPI**: Total de alunos (PCD), mediadores ativos, taxas de conformidade.
*   **Análises**: (Apenas Secretaria) Gráficos de desempenho e mapas de calor de assistência.
*   **Cards de Atalho**: Acesso rápido aos módulos principais conforme o papel do usuário.

### 4.3. Central de Mediação (Mediation Hub)
*   **Gestão de Equipe**: Relação de mediadores com informações de contato e status.
*   **Matriz de Alocação**: Vínculo entre alunos e mediadores com atualizações em tempo real.
*   **Feed de Atividades**: Histórico de registros de mediação (comportamento, higiene, mobilidade).
*   **Filtragem**: Filtros macro e micro por escola e por profissional individual.

### 4.4. Gestão Pedagógica
*   **Planejamento de Aulas**: Modelos alinhados às habilidades da BNCC e adaptações pedagógicas.
*   **Planos Inclusivos**: Módulos específicos para PEI (Plano de Ensino Individualizado), PDI e PAEE.
*   **Linha do Tempo Histórica**: Acompanhamento da evolução do aluno através de diferentes turmas e anos.

### 4.5. Monitoramento Operacional
*   **Controle de Frequência**: Registros diários de presença/falta dos alunos.
*   **Gestão de Merenda**: Acompanhamento das refeições dos alunos para supervisão dietética.
*   **Registros de Mediação**: Acompanhamento detalhado de crises, engajamento e atividades independentes.

### 4.6. Gestão de Escolas e Alunos
*   **Perfil da Escola**: Registros INEP, contagem de equipe e demografia de alunos.
*   **Edição de Unidades**: Possibilidade da Secretaria editar todos os campos cadastrais, incluindo observações internas e status de ativação.
*   **Filtragem por Jurisdição (Admin)**: O Administrador Geral pode filtrar a listagem de todas as escolas da rede por município, facilitando a supervisão de redes multi-municipais.
*   **Visibilidade de Município**: Exibição clara do município vinculado a cada escola na tabela administrativa geral.
*   **Registro de Alunos**: Matrículas RA, upload de laudos médicos e informações de responsáveis.
*   **Gestão de Turmas**: Configuração de ano/turno e atribuição de professores/mediadores.

## 5. Requisitos Não Funcionais
*   **Usability**: Interface intuitiva, de alto contraste e amigável para dispositivos móveis.
*   **Desempenho**: Tempos de carregamento de página inferiores a 2s para dashboards com muitos dados.
*   **Segurança**: Row Level Security (RLS) no banco de dados; conformidade com a LGPD para dados sensíveis.
*   **Estética**: Design inspirado em glassmorphism, micro-animações vibrantes e suporte a modo escuro.

## 6. Stack Técnica
*   **Frontend**: React 19 (Vite/ESM), Tailwind CSS, FontAwesome 6.
*   **Backend**: Supabase (PostgreSQL, Realtime, Storage).
*   **Visualização de Dados**: Recharts para dashboards analíticos.
*   **Tokens de Design**: Família de fontes Inter, paleta de cores personalizada (Esmeralda/Azul/Slate).

## 7. Roadmap e Melhorias Futuras
*   **Assistente Pedagógico IA**: Sugestões automatizadas de adaptações com base no histórico do aluno.
*   **Modo Offline**: Permitir entrada de registros em locais com baixa conectividade (PWA).
*   **Portal dos Responsáveis**: Acesso limitado para pais acompanharem frequência e relatórios. 

---
**Início do Projeto:** 10 de Fevereiro de 2026
**Última Atualização:** 18 de Abril de 2026
 