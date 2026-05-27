import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (email: string, profile: UserProfile, password?: string) => void;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('last_login_email') || '');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<UserProfile>(UserProfile.SECRETARIA);
  const [speech, setSpeech] = useState('Olá! Bem-vindo ao IncluiEduTec! Escolha seu perfil de acesso e venha ver nossas novidades gamificadas! 🚀');

  // Atualizar a fala do mascote Edu com base no perfil selecionado
  useEffect(() => {
    switch (profile) {
      case UserProfile.PROFESSOR:
        setSpeech('🎉 Olá, Professor(a)! Pronto para gerenciar suas turmas e guiar os alunos em missões com XP e selos cognitivos? Acesse agora!');
        break;
      case UserProfile.MEDIADOR:
        setSpeech('🤝 Oi, Mediador(a)! O progresso de cada aluno do AEE é uma grande vitória. Vamos registrar as evoluções cognitivas de hoje?');
        break;
      case UserProfile.DIRETOR:
        setSpeech('🏫 Boas-vindas, Diretor(a)! Pronto para acompanhar os relatórios inteligentes de inclusão e as medalhas da sua escola?');
        break;
      case UserProfile.SECRETARIA:
        setSpeech('📈 Olá, Gestor(a)! Vamos analisar o mapa de calor pedagógico e gerenciar o Nível de Inclusão Coletivo da nossa rede!');
        break;
      default:
        setSpeech('🚀 Olá! Selecione seu Perfil Institucional abaixo e vamos iniciar nossa jornada inclusiva e gamificada!');
    }
  }, [profile]);

  // Sintetizador de Áudio Suave para Hover (Web Audio API)
  const playHoverSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignorar erros silenciosamente se bloqueado por políticas do navegador
    }
  };

  // Sintetizador de Áudio Suave para Clique (Web Audio API)
  const playClickSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Ignorar erros silenciosamente
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isLoading) {
      playClickSound();
      const normalizedEmail = email.toLowerCase().trim();
      localStorage.setItem('last_login_email', normalizedEmail);
      
      // Auto-seleção para Perfil Admin Geral via credenciais diretas
      if (normalizedEmail === 'raquelelizabcd@gmail.com' && password === 'Joao@21226900') {
        onLogin(normalizedEmail, UserProfile.ADMIN, password);
      } else {
        onLogin(normalizedEmail, profile, password);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Estilos customizados injetados para animações premium */}
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gamerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.7)); }
        }
        @keyframes bookOpenSwing {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(-10deg) scale(1.08); }
          66% { transform: rotate(10deg) scale(1.08); }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.22); }
          40% { transform: scale(1.05); }
          60% { transform: scale(1.25); filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.6)); }
        }
        @keyframes floatMascot {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes neonGlow {
          0%, 100% { 
            text-shadow: 0 0 6px rgba(34, 211, 238, 0.4), 0 0 12px rgba(99, 102, 241, 0.2);
          }
          50% { 
            text-shadow: 0 0 12px rgba(34, 211, 238, 0.8), 0 0 24px rgba(99, 102, 241, 0.5); 
          }
        }
        @keyframes pulseComplementary {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.008); filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.3)); }
        }
        .neon-slogan {
          animation: neonGlow 3.5s infinite ease-in-out;
        }
        .pulse-complementary {
          animation: pulseComplementary 4s infinite ease-in-out;
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #0f172a, #1e3a8a, #4c1d95, #3b0764, #172554);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
        .pulse-gamer {
          animation: gamerPulse 2s infinite ease-in-out;
          display: inline-block;
        }
        .book-swing {
          animation: bookOpenSwing 2.8s infinite ease-in-out;
          display: inline-block;
        }
        .heart-beat {
          animation: heartBeat 1.3s infinite cubic-bezier(0.25, 0.8, 0.25, 1);
          display: inline-block;
        }
        .float-mascot {
          animation: floatMascot 4s infinite ease-in-out;
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(255, 255, 255, 0.1) 48%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.1) 52%,
            transparent 55%
          );
          transform: rotate(45deg);
          transition: transform 0.5s ease;
          pointer-events: none;
          opacity: 0;
        }
        .btn-shimmer:hover::after {
          opacity: 1;
          transform: translate(50%, 50%) rotate(45deg);
          transition: transform 0.8s ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* 1. BARRA SUPERIOR DE XP COLETIVO DA REDE & MEDALHAS */}
      <div className="w-full bg-slate-900 border-b border-slate-800 py-3 px-6 flex flex-col lg:flex-row items-center justify-between relative z-20 gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-indigo-400/30 tracking-wider shadow-lg shadow-indigo-500/10">
            Nível de Inclusão da Escola
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100">Rede Pública Municipal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Nível 8 (XP Coletivo)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Barra de Progresso */}
          <div className="flex items-center gap-2.5 flex-1 lg:w-80">
            <div className="w-full bg-slate-950/80 rounded-full h-3.5 border border-slate-800 p-0.5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 shadow-md shadow-indigo-500/30"
                style={{ width: '74%' }}
              ></div>
            </div>
            <span className="text-[10px] font-mono font-black text-cyan-400 whitespace-nowrap bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-800/20">
              18.450 / 25.000 XP
            </span>
          </div>

          {/* Medalhas Escolares BNCC */}
          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
            <div 
              className="relative cursor-pointer group" 
              title="Medalha de Ouro: Musicalização Creche 100%!"
              onMouseEnter={playHoverSound}
            >
              <span className="text-xl filter drop-shadow-[0_2px_5px_rgba(234,179,8,0.3)] hover:scale-125 transition-transform duration-200 block">🥇</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-slate-900 border border-amber-500/30 text-white text-[10px] p-2 rounded-xl shadow-xl z-50 text-center">
                <span className="font-extrabold text-amber-400 block">Medalha de Ouro BNCC</span>
                Musicalização Creche 100% atingida na rede!
              </div>
            </div>

            <div 
              className="relative cursor-pointer group" 
              title="Medalha de Prata: Atividades 4-6 anos integradas!"
              onMouseEnter={playHoverSound}
            >
              <span className="text-xl filter drop-shadow-[0_2px_5px_rgba(148,163,184,0.3)] hover:scale-125 transition-transform duration-200 block">🥈</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-slate-900 border border-slate-400/30 text-white text-[10px] p-2 rounded-xl shadow-xl z-50 text-center">
                <span className="font-extrabold text-slate-300 block">Medalha de Prata BNCC</span>
                Atividades de Alfabetização 4-6 anos mapeadas.
              </div>
            </div>

            <div 
              className="relative cursor-pointer group" 
              title="Medalha de Bronze: +50 PDIs finalizados!"
              onMouseEnter={playHoverSound}
            >
              <span className="text-xl filter drop-shadow-[0_2px_5px_rgba(180,83,9,0.3)] hover:scale-125 transition-transform duration-200 block">🥉</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-slate-900 border border-amber-800/30 text-white text-[10px] p-2 rounded-xl shadow-xl z-50 text-center">
                <span className="font-extrabold text-amber-700 block">Medalha de Bronze BNCC</span>
                Mais de 50 Relatórios Pedagógicos no sistema.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* COLUNA ESQUERDA: APRESENTAÇÃO INSTITUCIONAL E CARDS GAMIFICADOS */}
        <div className="md:w-1/2 animated-gradient text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-y-auto custom-scrollbar max-h-[calc(100vh-60px)]">
          {/* Luzes de Fundo para Elegância Visual */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

          <div className="relative z-10 space-y-8">
            {/* Cabeçalho da Plataforma */}
            <div className="flex items-center gap-3.5">
              <div className="bg-white/10 backdrop-blur-md w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
                <i className="fa-solid fa-graduation-cap text-cyan-300 text-2xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  IncluiEduTec
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Gestão Pedagógica Gamificada
                </span>
              </div>
            </div>

            {/* Títulos Principais & Slogans Neon */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-3 py-1 rounded-md border border-cyan-500/20 inline-block">
                Educação Pública Inteligente
              </h2>
              <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                IncluiEduTec - Gestão Pedagógica Inclusiva
              </h1>
              
              {/* Slogan Oficial */}
              <div className="py-1">
                <h2 className="text-lg lg:text-xl font-extrabold text-cyan-300 tracking-tight neon-slogan">
                  “Tecnologia Cognitiva Gamificada para Educação Inclusiva”
                </h2>
              </div>

              {/* Mensagem Complementar */}
              <div className="py-1">
                <p className="text-xs lg:text-sm font-extrabold text-indigo-200 leading-relaxed pulse-complementary italic bg-indigo-950/30 py-2.5 px-4 rounded-xl border border-indigo-500/25 inline-block shadow-inner">
                  “Mais que gestão escolar. Uma nova geração de educação inclusiva.”
                </p>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed opacity-95 font-semibold">
                Plataforma institucional para a gestão educacional inclusiva, alinhada à BNCC e às políticas públicas de educação.
              </p>
            </div>

            {/* SELO DE CONFORMIDADE MEC (ALINHADO AO DECRETO) */}
            <div className="bg-emerald-950/35 border border-emerald-500/25 rounded-2xl p-4 flex items-start gap-3.5 shadow-md shadow-emerald-950/20">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <i className="fa-solid fa-file-shield text-emerald-400 text-sm"></i>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Diretrizes Oficiais de Inclusão</span>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  Plataforma alinhada ao <strong>novo decreto de inclusão do MEC</strong>, atendendo plenamente às diretrizes oficiais de inclusão educacional do Ministério da Educação.
                </p>
              </div>
            </div>

            {/* SEÇÃO 1: CARDS INSTITUCIONAIS ATUAIS (MANTIDOS E MICRO-ANIMADOS) */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Elementos de Gestão e Inclusão
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div 
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default group hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                  onMouseEnter={playHoverSound}
                >
                  <i className="fa-solid fa-book-open text-blue-300 mb-3 text-lg block book-swing"></i>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">BASE NORMATIVA BNCC</h3>
                  <p className="text-[10px] text-slate-300 mt-1 opacity-80">Mapeamento e estruturação de habilidades curriculares.</p>
                </div>

                <div 
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default group hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-0.5"
                  onMouseEnter={playHoverSound}
                >
                  <i className="fa-solid fa-hands-holding-child text-rose-300 mb-3 text-lg block heart-beat"></i>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">APOIO AO AEE</h3>
                  <p className="text-[10px] text-slate-300 mt-1 opacity-80">Atendimento Educacional Especializado centrado no aluno.</p>
                </div>

                <div 
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default group hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5"
                  onMouseEnter={playHoverSound}
                >
                  <i className="fa-solid fa-file-signature text-cyan-300 mb-3 text-lg block group-hover:scale-110 transition-transform"></i>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">PEI, PDI E PAEE</h3>
                  <p className="text-[10px] text-slate-300 mt-1 opacity-80">Planejamento e Plano de Desenvolvimento Individualizados.</p>
                </div>

                <div 
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default group hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                  onMouseEnter={playHoverSound}
                >
                  <i className="fa-solid fa-shield-lock text-emerald-300 mb-3 text-lg block group-hover:rotate-12 transition-transform"></i>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">COMUNICAÇÃO SEGURA</h3>
                  <p className="text-[10px] text-slate-300 mt-1 opacity-80">Conexão auditada e proteção de dados sensíveis LGPD.</p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: HIERARQUIA DE PERFIS CONECTADOS ("ECO-REDE") */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> Eco-Rede de Perfis Conectados
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Cada perfil do sistema desempenha um propósito e todos atuam integrados de forma conectada e colaborativa:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Secretaria */}
                <div 
                  className="bg-slate-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 flex items-start gap-3 group"
                  onMouseEnter={playHoverSound}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-600/10">
                    <i className="fa-solid fa-map text-indigo-300 group-hover:text-white text-xs"></i>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-black text-indigo-200">Secretaria de Educação</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">Visão macro analítica e gestão ativa das políticas públicas municipais.</p>
                  </div>
                </div>

                {/* 2. Escola / Diretor */}
                <div 
                  className="bg-slate-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 flex items-start gap-3 group"
                  onMouseEnter={playHoverSound}
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 transition-all duration-300 shadow-lg shadow-cyan-600/10">
                    <i className="fa-solid fa-school text-cyan-300 group-hover:text-white text-xs"></i>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-black text-cyan-200">Perfil Escola (Diretor)</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">Acompanhamento institucional e pedagógico das metas da unidade.</p>
                  </div>
                </div>

                {/* 3. Professor */}
                <div 
                  className="bg-slate-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 flex items-start gap-3 group"
                  onMouseEnter={playHoverSound}
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-600/10">
                    <i className="fa-solid fa-chalkboard-user text-purple-300 group-hover:text-white text-xs"></i>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-black text-purple-200">Perfil Professor</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">Criação, planejamento e aplicação das missões curriculares gamificadas.</p>
                  </div>
                </div>

                {/* 4. Mediador */}
                <div 
                  className="bg-slate-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-pink-500/10 hover:border-pink-500/30 transition-all duration-300 flex items-start gap-3 group"
                  onMouseEnter={playHoverSound}
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-600 transition-all duration-300 shadow-lg shadow-pink-600/10">
                    <i className="fa-solid fa-hands-holding-child text-pink-300 group-hover:text-white text-xs"></i>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-black text-pink-200">Perfil Mediador</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">Apoio direto ao aluno no AEE e registro de acompanhamento individualizado.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 3: RECURSOS DO MOTOR COGNITIVO (MANTIDOS E MICRO-ANIMADOS) */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Recursos do Motor Cognitivo Gamificado
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div 
                  className="bg-purple-950/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/20 hover:bg-purple-950/30 hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
                  onMouseEnter={playHoverSound}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <i className="fa-solid fa-gamepad text-purple-300 pulse-gamer"></i>
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-purple-100">IncluiGamer</h3>
                  </div>
                  <p className="text-[10px] text-purple-200/90 leading-relaxed font-medium">
                    Transforme cada atividade em uma missão divertida! Ganhe XP, conquiste selos cognitivos e acompanhe o progresso BNCC em tempo real.
                  </p>
                </div>

                <div 
                  className="bg-pink-950/20 backdrop-blur-sm p-4 rounded-2xl border border-pink-500/20 hover:bg-pink-950/30 hover:border-pink-500/40 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/10"
                  onMouseEnter={playHoverSound}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center">
                      <i className="fa-solid fa-music text-pink-300 pulse-gamer"></i>
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-pink-100">Musicalização Infantil</h3>
                  </div>
                  <p className="text-[10px] text-pink-200/90 leading-relaxed font-medium">
                    Explore sons, cores e movimentos com atividades baseadas na BNCC para crianças de 0 a 3 anos (sensorial e cognitiva).
                  </p>
                </div>

                <div 
                  className="bg-cyan-950/20 backdrop-blur-sm p-4 rounded-2xl border border-cyan-500/20 hover:bg-cyan-950/30 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10"
                  onMouseEnter={playHoverSound}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <i className="fa-solid fa-fire text-amber-300 pulse-gamer"></i>
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-cyan-100">Relatórios Inteligentes</h3>
                  </div>
                  <p className="text-[10px] text-cyan-200/90 leading-relaxed font-medium">
                    Visualize o desempenho dos alunos com mapas de calor pedagógicos e indicadores de aprendizado adaptativos.
                  </p>
                </div>

                <div 
                  className="bg-emerald-950/20 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/20 hover:bg-emerald-950/30 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10"
                  onMouseEnter={playHoverSound}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <i className="fa-solid fa-chalkboard-user text-emerald-300 book-swing"></i>
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-100">Portal do Educador</h3>
                  </div>
                  <p className="text-[10px] text-emerald-200/90 leading-relaxed font-medium">
                    Acesse planos de aula unificados, relatórios de evolução e missões gamificadas adaptativas para cada turma.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RODAPÉ INSTITUCIONAL (ATUALIZADO CONFORME REQUISITOS) */}
          <div className="relative z-10 pt-6 border-t border-white/10 mt-10 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-[3px] bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
              <p className="italic text-cyan-200 text-xs font-bold font-mono">"A inclusão acontece quando todos aprendem juntos."</p>
            </div>
            
            <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
              <p className="font-extrabold text-slate-300">IncluiEduTec © 2026 – Motor Cognitivo IncluiGamer | Tecnologia Assistiva | BNCC Adaptativa</p>
              <p className="font-mono text-[9px] opacity-80">Versão 2.0 – Alinhado às Diretrizes do Novo Decreto de Inclusão do MEC</p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: MASCOTE LÚDICO E FORMULÁRIO DE LOGIN */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-slate-900 border-l border-slate-800 overflow-y-auto custom-scrollbar">
          
          {/* MASCOTE EDU: FLUTUANTE E DIALOGANDO DINAMICAMENTE */}
          <div className="w-full max-w-md flex items-center gap-4 bg-slate-950/80 border border-indigo-500/20 p-4 rounded-3xl mb-6 shadow-xl relative overflow-hidden float-mascot">
            {/* Brilho de fundo no mascote */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Desenho do Mascote Edu em SVG */}
            <div className="flex-shrink-0" onMouseEnter={playHoverSound}>
              <svg viewBox="0 0 120 120" className="w-20 h-20 drop-shadow-[0_4px_10px_rgba(99,102,241,0.2)]">
                <defs>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
                
                {/* Propulsor flutuante */}
                <ellipse cx="60" cy="100" rx="15" ry="5" fill="#e2e8f0" opacity="0.3" />
                <path d="M52 82 L60 98 L68 82 Z" fill="url(#visorGradient)" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
                </path>
                
                {/* Braços */}
                <rect x="25" y="55" width="10" height="20" rx="5" fill="#6366f1" />
                <rect x="85" y="55" width="10" height="20" rx="5" fill="#6366f1" />
                <circle cx="30" cy="78" r="4" fill="#a855f7" />
                <circle cx="90" cy="78" r="4" fill="#a855f7" />
                
                {/* Corpo */}
                <rect x="35" y="40" width="50" height="45" rx="20" fill="url(#bodyGradient)" stroke="#ffffff" strokeWidth="2.5" />
                
                {/* Tela do Rosto */}
                <rect x="42" y="47" width="36" height="24" rx="8" fill="url(#faceGradient)" />
                
                {/* Visor de Leds (Olhos / Sorriso) */}
                <circle cx="50" cy="56" r="3" fill="#22d3ee" />
                <circle cx="70" cy="56" r="3" fill="#22d3ee" />
                <path d="M54 62 Q60 67 66 62" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" fill="none" />
                
                {/* Antena */}
                <line x1="60" y1="40" x2="60" y2="28" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="60" cy="25" r="5" fill="#f43f5e">
                  <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
                </circle>
                
                {/* Fones de ouvido de inclusão */}
                <path d="M32 55 A 28 28 0 0 1 88 55" stroke="#f43f5e" strokeWidth="3" fill="none" />
                <rect x="28" y="50" width="8" height="14" rx="4" fill="#f43f5e" />
                <rect x="84" y="50" width="8" height="14" rx="4" fill="#f43f5e" />
              </svg>
            </div>

            {/* Balão de diálogo dinâmico */}
            <div className="flex-1">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest block mb-0.5">Edu • Guia da Inclusão</span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {speech}
              </p>
            </div>
          </div>

          {/* FORMULÁRIO DE LOGIN INSTITUCIONAL */}
          <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Detalhe estético de borda colorida superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600"></div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center justify-center gap-2">
                Portal de Acesso <span className="text-sm font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">v2.0</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">Insira suas credenciais para gerenciar a rede</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropdown de Perfil */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Perfil Institucional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-building text-indigo-400"></i>
                  </div>
                  <select
                    value={profile}
                    onChange={(e) => {
                      playHoverSound();
                      setProfile(e.target.value as UserProfile);
                    }}
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none outline-none transition-all cursor-pointer disabled:opacity-50 text-sm"
                  >
                    <option value={UserProfile.SECRETARIA}>{UserProfile.SECRETARIA}</option>
                    <option value={UserProfile.DIRETOR}>{UserProfile.DIRETOR}</option>
                    <option value={UserProfile.PROFESSOR}>{UserProfile.PROFESSOR}</option>
                    <option value={UserProfile.MEDIADOR}>{UserProfile.MEDIADOR}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-chevron-down text-slate-500 text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Input E-mail */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-envelope text-slate-500"></i>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="exemplo@marica.rj.gov.br"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 font-bold placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Input Senha */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-slate-500"></i>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 font-bold placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Botão Acessar Sistema (Shimmer e Pulsante no Hover) */}
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={playHoverSound}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-900/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm btn-shimmer border border-indigo-400/20"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin text-lg text-white"></i>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Sistema</span>
                    <i className="fa-solid fa-arrow-right-to-bracket text-xs text-indigo-200"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button 
                onMouseEnter={playHoverSound}
                className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Dificuldade no acesso? Entrar via e-mail
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-slate-500 uppercase tracking-[0.25em] font-black border-t border-slate-900 pt-5">
              <i className="fa-solid fa-circle-check text-emerald-500 animate-pulse"></i>
              Conexão Segura Auditada
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
