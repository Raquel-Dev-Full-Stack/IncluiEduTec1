
import React, { useState, useEffect, useRef } from 'react';

interface RoboChatProps {
  activeTab: string;
  userName: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  actions?: { label: string; action: () => void; icon?: string }[];
}

const RoboChat: React.FC<RoboChatProps> = ({ activeTab, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(`Olá, ${userName}! Sou o Edu, seu assistente virtual. Como posso te ajudar hoje?`, [
        { label: 'Dicas desta tela', action: () => showContextualTips(), icon: 'fa-lightbulb' },
        { label: 'Consultar BNCC', action: () => openBNCC(), icon: 'fa-book-open' },
        { label: 'Iniciar Tour', action: () => startTour(), icon: 'fa-play' }
      ]);
    }
    scrollToBottom();
  }, [isOpen, messages]);

  const addBotMessage = (text: string, actions?: any[]) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender: 'bot',
      timestamp: new Date(),
      actions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    processUserMessage(text);
  };

  const processUserMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    setTimeout(() => {
      if (lowerText.includes('dashboard')) {
        addBotMessage('O Dashboard é seu painel principal. Lá você encontra indicadores de presença, total de alunos e atalhos para suas turmas. Quer ver mais detalhes?', [
          { label: 'Ver Dashboard', action: () => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'dashboard' })) }
        ]);
      } else if (lowerText.includes('planejamento') || lowerText.includes('plano')) {
        addBotMessage('No Planejamento Pedagógico, você pode criar aulas integradas à BNCC. Basta escolher a turma, selecionar as competências e salvar. Deseja iniciar um agora?', [
          { label: 'Criar Planejamento', action: () => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'registros' })) },
          { label: 'Dicas BNCC', action: () => addBotMessage('Dica: Use palavras-chave como "alfabetização" ou "números" na busca da BNCC para encontrar códigos rapidamente.') }
        ]);
      } else if (lowerText.includes('relatório')) {
        addBotMessage('Os relatórios são gerados automaticamente a partir dos seus registros diários. Você pode acessá-los no menu lateral para exportar em PDF.');
      } else if (lowerText.includes('aluno') || lowerText.includes('turma')) {
        addBotMessage('Você pode gerenciar seus alunos e turmas nos respectivos menus. Lá é possível ver o histórico completo, faltas e avaliações.');
      } else if (lowerText.includes('bncc')) {
        addBotMessage('A BNCC está integrada em todo o sistema. Posso te ajudar a encontrar um código específico?', [
          { label: 'Consultar BNCC', action: () => openBNCC() }
        ]);
      } else {
        addBotMessage('Entendi! Posso te ajudar com o Dashboard, Planejamentos, Relatórios, Alunos ou BNCC. O que prefere saber primeiro?');
      }
    }, 1000);
  };

  const showContextualTips = () => {
    const tips: Record<string, string> = {
      'dashboard': 'No Dashboard, você pode clicar nos cards para filtrar as estatísticas. Use o gráfico de evolução para acompanhar o progresso das turmas.',
      'admin_total': 'Aqui você gerencia toda a rede. Lembre-se de verificar se há pendências de novos cadastros de secretarias.',
      'messages': 'Dica: Você pode filtrar mensagens por escola ou secretaria para agilizar sua comunicação.',
      'schools': 'Nesta tela, use a busca para encontrar unidades específicas. Clique em uma escola para ver o quadro de funcionários.',
      'turmas': 'Você pode exportar a lista de chamada e o horário da turma diretamente daqui.',
      'teachers': 'Gerencie o vínculo dos professores com as turmas. Certifique-se de que todos tenham e-mails válidos para acesso.',
      'alunos': 'Dica: O ícone de estetoscópio indica alunos com laudo médico. Clique no aluno para ver o PDI/PEI.',
      'refeicoes': 'Registre a aceitação alimentar. Isso ajuda a secretaria a planejar o cardápio e evitar desperdícios.',
      'inclusive_plans': 'Os planos (PEI/PDI) são salvos automaticamente como rascunho. Não esqueça de finalizá-los para gerar o PDF.',
      'mediation': 'Registre as intercorrências do dia. Esses dados alimentam os relatórios trimestrais automaticamente.',
      'db_analysis': 'Cuidado: Esta é uma área técnica. Use-a apenas para conferência de integridade dos dados.',
      'registros': 'Ao criar planejamentos, use a busca da BNCC por palavras-chave como "números" ou "identidade".',
      'relatorios': 'Você pode gerar relatórios individuais ou coletivos. Escolha o período desejado e clique em Gerar PDF.',
      'activity_logs': 'Use os filtros de data e usuário para localizar ações específicas realizadas no sistema.',
      'curso_inclusao': 'Aproveite os vídeos e materiais de apoio para aprimorar suas práticas de educação inclusiva.',
      'help': 'Nesta tela você encontra o passo a passo completo. Explore cada card para virar um mestre no sistema!',
      'diario_classe': 'No Diário de Classe, você tem tudo em um só lugar: Chamada, Planos Inclusivos e seu Planejamento Pedagógico. Use as abas no topo para alternar.',
      'configuracoes': 'Aqui você pode mudar para o Modo Escuro, que cansa menos a vista durante o planejamento noturno.'
    };

    const currentTip = tips[activeTab] || 'Esta tela é fundamental para a gestão escolar. Use os botões de ação e filtros para facilitar seu trabalho.';
    addBotMessage(currentTip);
  };

  const openBNCC = () => {
    addBotMessage('Aqui está o link para consulta rápida da BNCC. No sistema, você também pode buscar diretamente nos campos de planejamento.', [
      { label: 'Abrir Guia BNCC', action: () => window.open('https://basenacionalcomum.mec.gov.br/abase/', '_blank') }
    ]);
  };

  const startTour = () => {
    addBotMessage('Iniciando o Tour Guiado! Observe os destaques na tela.');
    window.dispatchEvent(new CustomEvent('startTour'));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addUserMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Edu - Assistente Virtual</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Online Agora</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.action}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm flex items-center gap-2"
                      >
                        {btn.icon && <i className={`fa-solid ${btn.icon}`}></i>}
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua dúvida aqui..."
                className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen 
          ? 'bg-white text-gray-800 rotate-90' 
          : 'bg-blue-600 text-white shadow-blue-500/40'
        }`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'}`}></i>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default RoboChat;
