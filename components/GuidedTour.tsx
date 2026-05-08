
import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface Step {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, menuItems }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Descrições personalizadas para cada módulo
  const getStepContent = (id: string, label: string) => {
    switch (id) {
      case 'dashboard': return 'Visualize indicadores de desempenho, frequência e atalhos rápidos para sua rotina.';
      case 'admin_total': return 'Gerencie as configurações globais do sistema e usuários.';
      case 'messages': return 'Troque mensagens com outros profissionais da rede de ensino.';
      case 'schools': return 'Gerencie os dados, turmas e professores da unidade escolar.';
      case 'turmas': return 'Visualize e gerencie suas turmas, horários e alunos vinculados.';
      case 'teachers': return 'Gestão completa do quadro de professores da escola.';
      case 'alunos': return 'Acesse a ficha completa dos alunos, histórico médico e portfólio digital.';
      case 'refeicoes': return 'Registre a alimentação diária e acompanhe a nutrição dos alunos.';
      case 'inclusive_plans': return 'Crie e acompanhe Planos de Ensino Individualizados (PEI) e PAEE.';
      case 'mediation': return 'Registre o acompanhamento diário de mediação e inclusão.';
      case 'db_analysis': return 'Ferramentas avançadas para análise técnica do banco de dados.';
      case 'registros': return 'Crie seus planejamentos pedagógicos integrados à BNCC.';
      case 'relatorios': return 'Gere relatórios automatizados de evolução e desempenho.';
      case 'activity_logs': return 'Acompanhe todas as ações realizadas no sistema para auditoria.';
      case 'curso_inclusao': return 'Acesse materiais de capacitação e cursos sobre educação inclusiva.';
      case 'help': return 'Guia interativo com instruções detalhadas sobre cada recurso.';
      case 'configuracoes': return 'Personalize sua experiência, tema e dados de perfil.';
      default: return `Acesse o módulo de ${label} para gerenciar seus dados de forma eficiente.`;
    }
  };

  const steps: Step[] = [
    // Passo inicial: Sidebar geral
    {
      target: '#tour-sidebar',
      title: 'Menu Principal',
      content: 'Este é o seu menu de navegação. Aqui você encontra todas as ferramentas disponíveis para o seu perfil.',
      position: 'right'
    },
    // Passos dinâmicos baseados nos itens do menu
    ...menuItems.map(item => ({
      target: `#tour-${item.id}`,
      title: item.label,
      content: getStepContent(item.id, item.label),
      position: 'right' as const
    })),
    // Passo final: Perfil do Usuário
    {
      target: '#tour-user',
      title: 'Perfil e Acesso',
      content: 'Aqui você visualiza seus dados de acesso e pode sair do sistema com segurança.',
      position: 'top'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); // Reiniciar tour ao abrir
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
    }
    return () => window.removeEventListener('resize', updateCoords);
  }, [isOpen, currentStep, menuItems]);

  const updateCoords = () => {
    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const getTooltipStyle = () => {
    const gap = 15;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    // Ajuste básico de posição para não sair da tela
    let top = coords.top;
    let left = coords.left + coords.width + gap;

    if (step.position === 'top') {
      top = coords.top - tooltipHeight - gap;
      left = coords.left;
    } else if (step.position === 'bottom') {
      top = coords.top + coords.height + gap;
      left = coords.left;
    } else if (step.position === 'left') {
      top = coords.top;
      left = coords.left - tooltipWidth - gap;
    }

    // Prevenir que saia da tela verticalmente
    if (top + tooltipHeight > window.innerHeight + window.scrollY) {
      top = window.innerHeight + window.scrollY - tooltipHeight - 20;
    }
    if (top < window.scrollY) {
      top = window.scrollY + 20;
    }

    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-slate-900/60 pointer-events-auto"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      ></div>

      {/* Highlight Border */}
      <div 
        className="absolute border-4 border-blue-500 rounded-xl transition-all duration-300"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
        }}
      ></div>

      {/* Tooltip */}
      <div 
        className="absolute w-80 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-300 border border-blue-100 dark:border-slate-700"
        style={getTooltipStyle()}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Explorando: {currentStep + 1} / {steps.length}
          </span>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">{step.title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{step.content}</p>
        
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
          <button 
            onClick={onClose}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors tracking-widest"
          >
            Sair do Tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}
            <button 
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
