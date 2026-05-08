
import React from 'react';
import ModuleWrapper from './ModuleWrapper';

const HelpGuide: React.FC = () => {
  const steps = [
    {
      title: '1. Visão Geral',
      icon: 'fa-eye',
      color: 'blue',
      description: 'O IncluiEduTec é uma plataforma completa desenvolvida para simplificar a rotina pedagógica e automatizar tarefas burocráticas.',
      details: [
        'Centralização de informações dos alunos.',
        'Automação de registros diários e relatórios.',
        'Monitoramento contínuo da inclusão escolar.',
        'Facilitação da comunicação entre a equipe pedagógica.'
      ]
    },
    {
      title: '2. Dashboard',
      icon: 'fa-chart-pie',
      color: 'indigo',
      description: 'Sua central de controle personalizada. Aqui você tem uma visão rápida de tudo o que está acontecendo.',
      details: [
        'Indicadores em tempo real sobre frequência e desempenho.',
        'Atalhos rápidos para as funções mais utilizadas.',
        'Alertas e notificações importantes.',
        'Resumo visual da sua carga horária e turmas.'
      ]
    },
    {
      title: '3. Planejamento',
      icon: 'fa-calendar-check',
      color: 'emerald',
      description: 'Crie seus planos de aula e planejamentos pedagógicos de forma integrada e inteligente.',
      details: [
        'Integração automática com os códigos BNCC.',
        'Criação de Planos Inclusivos (PEI, PDI, PAEE) personalizados.',
        'Compartilhamento de materiais com outros professores.',
        'Histórico completo de planejamentos anteriores.'
      ]
    },
    {
      title: '4. Relatórios',
      icon: 'fa-file-signature',
      color: 'amber',
      description: 'Gere documentos oficiais e pedagógicos com apenas alguns cliques.',
      details: [
        'Registro de evidências individuais detalhadas.',
        'Geração automatizada de relatórios trimestrais e anuais.',
        'Exportação em formatos profissionais para impressão.',
        'Assinatura digital e validação de documentos.'
      ]
    },
    {
      title: '5. Portfólio Digital',
      icon: 'fa-images',
      color: 'rose',
      description: 'Documente a trajetória de cada aluno através de uma galeria rica em evidências.',
      details: [
        'Upload de fotos e vídeos das atividades.',
        'Registro de observações contínuas e marcos de desenvolvimento.',
        'Linha do tempo visual do progresso do aluno.',
        'Espaço seguro para armazenamento de documentos sensíveis.'
      ]
    }
  ];

  return (
    <ModuleWrapper 
      title="Como Usar o Sistema" 
      description="Guia interativo para você aproveitar ao máximo todos os recursos do IncluiEduTec."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl bg-${step.color}-50 dark:bg-${step.color}-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <i className={`fa-solid ${step.icon} text-2xl text-${step.color}-600 dark:text-${step.color}-400`}></i>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              {step.description}
            </p>
            <ul className="space-y-3">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-gray-600 dark:text-slate-300">
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full bg-${step.color}-500 shrink-0`}></div>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-robot text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Precisa de ajuda agora?</h3>
            <p className="text-sm text-blue-100 leading-relaxed mb-6">
              Nosso assistente inteligente (RoboChat) está disponível no canto inferior da tela para responder suas dúvidas em tempo real.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('startTour'))}
            className="bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-900/20"
          >
            Iniciar Tour do Sistema
            <i className="fa-solid fa-play"></i>
          </button>
        </div>
      </div>

      <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-black mb-4">Dica de Ouro: Integração BNCC</h2>
            <p className="text-slate-400 leading-relaxed">
              Ao criar seus planejamentos, o sistema sugere automaticamente os códigos da Base Nacional Comum Curricular baseados na sua disciplina e ano letivo. Isso economiza até 70% do tempo gasto em documentação.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center w-32">
              <div className="text-2xl font-black text-blue-400 mb-1">+70%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Agilidade</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center w-32">
              <div className="text-2xl font-black text-emerald-400 mb-1">100%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Conformidade</div>
            </div>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default HelpGuide;
