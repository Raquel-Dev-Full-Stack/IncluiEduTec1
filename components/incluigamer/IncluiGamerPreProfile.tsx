import React, { useState } from 'react';
import { Student } from '../../types';
import { GameDefinition } from './gamesData';

export interface PreGamerProfile {
  comunicacao: {
    verbal: boolean;
    alternativa: boolean;
    compreensao: number; // 1 a 5
    ecolalia: boolean;
  };
  sensorial: {
    hipersensibilidadeSonora: boolean;
    hipersensibilidadeVisual: boolean;
    toleranciaEstimulos: number; // 1 a 5
  };
  coordenacao: {
    mouse: boolean;
    touchscreen: boolean;
    motoraFina: number; // 1 a 5
  };
  cognitivo: {
    letras: boolean;
    numeros: boolean;
    formas: boolean;
    cores: boolean;
    associacaoLogica: boolean;
  };
  comportamental: {
    tempoFocoMinutos: number; // 1 a 15
    frustracaoAlta: boolean;
    reforcoPositivo: boolean;
    autonomia: number; // 1 a 5
  };
}

interface IncluiGamerPreProfileProps {
  student: Student;
  game: GameDefinition;
  onConfirm: (profile: PreGamerProfile) => void;
  onCancel: () => void;
}

export default function IncluiGamerPreProfile({ student, game, onConfirm, onCancel }: IncluiGamerPreProfileProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Estado inicial calibrado baseado em defaults seguros e no diagnóstico básico do aluno
  const [profile, setProfile] = useState<PreGamerProfile>({
    comunicacao: {
      verbal: true,
      alternativa: false,
      compreensao: 4,
      ecolalia: false,
    },
    sensorial: {
      hipersensibilidadeSonora: false,
      hipersensibilidadeVisual: false,
      toleranciaEstimulos: 4,
    },
    coordenacao: {
      mouse: true,
      touchscreen: true,
      motoraFina: 4,
    },
    cognitivo: {
      letras: true,
      numeros: true,
      formas: true,
      cores: true,
      associacaoLogica: true,
    },
    comportamental: {
      tempoFocoMinutos: 8,
      frustracaoAlta: false,
      reforcoPositivo: true,
      autonomia: 3,
    }
  });

  const nextStep = () => {
    if (step < totalSteps) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleConfirm = () => {
    onConfirm(profile);
  };

  // Helper para renderizar a barra de progresso / stepper
  const stepsMeta = [
    { id: 1, label: 'Comunicação', icon: 'fa-comments' },
    { id: 2, label: 'Sensorial', icon: 'fa-eye' },
    { id: 3, label: 'Coordenação', icon: 'fa-hand' },
    { id: 4, label: 'Cognitivo', icon: 'fa-brain' },
    { id: 5, label: 'Comportamental', icon: 'fa-heart' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
      {/* Background glow sutil */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header com Stepper */}
      <div className="space-y-6 mb-8 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
            Passo Obrigatório Pré-Jogo
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 leading-none">
            <i className="fa-solid fa-user-gear text-indigo-500"></i> Calibração Cognitiva Inicial
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Preencha o perfil rápido para que o **Adaptive Cognitive Engine** calibre os estímulos para **{student.name}**.
          </p>
        </div>

        {/* Stepper Wizard Horizontal */}
        <div className="flex justify-between items-center relative px-2">
          {stepsMeta.map((item, idx) => (
            <React.Fragment key={item.id}>
              {/* Conector */}
              {idx > 0 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  step >= item.id ? 'bg-indigo-600' : 'bg-slate-850'
                }`}></div>
              )}
              {/* Círculo do Passo */}
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                  step === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 scale-110 border border-indigo-500' 
                    : step > item.id 
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                      : 'bg-slate-900 text-slate-600 border border-slate-850'
                }`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon} text-xs`}></i>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Conteúdo dos Passos */}
      <div className="min-h-[220px] flex flex-col justify-between py-2">
        
        {/* PASSO 1: COMUNICAÇÃO */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">🗣️ Perfil de Comunicação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Aluno Verbal</p>
                  <p className="text-[9px] text-slate-500 font-medium">Usa fala articulada para se expressar.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.comunicacao.verbal ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.comunicacao.verbal ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.comunicacao.verbal}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        comunicacao: { ...prev.comunicacao, verbal: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Comunicação Alternativa (CAA)</p>
                  <p className="text-[9px] text-slate-500 font-medium">Necessita de figuras/pranchas de apoio.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.comunicacao.alternativa ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.comunicacao.alternativa ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.comunicacao.alternativa}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        comunicacao: { ...prev.comunicacao, alternativa: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Compreensão de Comandos</p>
                      <p className="text-[9px] text-slate-500 font-medium">Capacidade de entender orientações verbais básicas.</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-black px-2 py-0.5 rounded-lg">
                      Nível {profile.comunicacao.compreensao} / 5
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={profile.comunicacao.compreensao}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setProfile(prev => ({ 
                        ...prev, 
                        comunicacao: { ...prev.comunicacao, compreensao: val } 
                      }));
                    }}
                    className="w-full accent-indigo-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer appearance-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div>
                  <p className="text-xs font-bold text-slate-200">Ecolalia Presente</p>
                  <p className="text-[9px] text-slate-500 font-medium">Repete palavras ou frases de forma involuntária.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.comunicacao.ecolalia ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.comunicacao.ecolalia ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.comunicacao.ecolalia}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        comunicacao: { ...prev.comunicacao, ecolalia: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: SENSORIAL */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">🎨 Perfil Sensorial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Hipersensibilidade Sonora</p>
                  <p className="text-[9px] text-slate-500 font-medium">Desconforto com sons altos ou agudos.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.sensorial.hipersensibilidadeSonora ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.sensorial.hipersensibilidadeSonora ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.sensorial.hipersensibilidadeSonora}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        sensorial: { ...prev.sensorial, hipersensibilidadeSonora: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Hipersensibilidade Visual</p>
                  <p className="text-[9px] text-slate-500 font-medium">Desconforto com flashes ou alta luminosidade.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.sensorial.hipersensibilidadeVisual ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.sensorial.hipersensibilidadeVisual ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.sensorial.hipersensibilidadeVisual}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        sensorial: { ...prev.sensorial, hipersensibilidadeVisual: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Tolerância a Estímulos Coletivos</p>
                      <p className="text-[9px] text-slate-500 font-medium">Resiliência a múltiplos sons e animações concorrentes.</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-black px-2 py-0.5 rounded-lg">
                      Nível {profile.sensorial.toleranciaEstimulos} / 5
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={profile.sensorial.toleranciaEstimulos}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setProfile(prev => ({ 
                        ...prev, 
                        sensorial: { ...prev.sensorial, toleranciaEstimulos: val } 
                      }));
                    }}
                    className="w-full accent-indigo-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: COORDENAÇÃO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">👐 Perfil de Coordenação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Usa Mouse</p>
                  <p className="text-[9px] text-slate-500 font-medium">Consegue guiar e clicar usando mouse.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.coordenacao.mouse ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.coordenacao.mouse ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.coordenacao.mouse}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        coordenacao: { ...prev.coordenacao, mouse: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Usa Touchscreen</p>
                  <p className="text-[9px] text-slate-500 font-medium">Consegue tocar diretamente em alvos na tela.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.coordenacao.touchscreen ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.coordenacao.touchscreen ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.coordenacao.touchscreen}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        coordenacao: { ...prev.coordenacao, touchscreen: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Coordenação Motora Fina</p>
                      <p className="text-[9px] text-slate-500 font-medium">Precisão e firmeza do toque em alvos pequenos.</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-black px-2 py-0.5 rounded-lg">
                      Nível {profile.coordenacao.motoraFina} / 5
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={profile.coordenacao.motoraFina}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setProfile(prev => ({ 
                        ...prev, 
                        coordenacao: { ...prev.coordenacao, motoraFina: val } 
                      }));
                    }}
                    className="w-full accent-indigo-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: COGNITIVO */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">🧠 Reconhecimento Pedagógico</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">Selecione abaixo as competências que o aluno já demonstra dominar ativamente:</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'letras' as const, label: 'Letras e Alfabeto', desc: 'Reconhece e nomeia grafemas.' },
                { key: 'numeros' as const, label: 'Números e Contagem', desc: 'Identifica algarismos escritos.' },
                { key: 'formas' as const, label: 'Formas Geométricas', desc: 'Identifica círculos, quadrados, etc.' },
                { key: 'cores' as const, label: 'Cores Básicas', desc: 'Reconhece e nomeia tons.' },
                { key: 'associacaoLogica' as const, label: 'Associação Lógica', desc: 'Pareia objetos semelhantes.' },
              ].map(item => (
                <div 
                  key={item.key}
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    cognitivo: { ...prev.cognitivo, [item.key]: !prev.cognitivo[item.key] }
                  }))}
                  className={`p-4 border rounded-2xl transition-all cursor-pointer group flex flex-col justify-between min-h-[90px] ${
                    profile.cognitivo[item.key]
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-950/20'
                      : 'bg-slate-850/45 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-200">{item.label}</span>
                    {profile.cognitivo[item.key] && (
                      <i className="fa-solid fa-circle-check text-xs text-indigo-400"></i>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-normal mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 5: COMPORTAMENTAL */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">🏃 Perfil Comportamental</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Tempo Médio de Foco</p>
                      <p className="text-[9px] text-slate-500 font-medium">Tempo contínuo que o aluno costuma sustentar em uma tarefa.</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-black px-2 py-0.5 rounded-lg">
                      {profile.comportamental.tempoFocoMinutos} minutos
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    value={profile.comportamental.tempoFocoMinutos}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setProfile(prev => ({ 
                        ...prev, 
                        comportamental: { ...prev.comportamental, tempoFocoMinutos: val } 
                      }));
                    }}
                    className="w-full accent-indigo-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer appearance-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Alta Frustração</p>
                  <p className="text-[9px] text-slate-500 font-medium">Irrita-se facilmente diante de erros.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.comportamental.frustracaoAlta ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.comportamental.frustracaoAlta ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.comportamental.frustracaoAlta}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        comportamental: { ...prev.comportamental, frustracaoAlta: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Reforço Positivo Frequente</p>
                  <p className="text-[9px] text-slate-500 font-medium">Necessita de estímulos e aplausos constantes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                    profile.comportamental.reforcoPositivo ? 'text-emerald-400' : 'text-rose-500'
                  }`}>
                    {profile.comportamental.reforcoPositivo ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={profile.comportamental.reforcoPositivo}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        comportamental: { ...prev.comportamental, reforcoPositivo: e.target.checked } 
                      }))}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-850/50 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Nível de Autonomia Geral</p>
                      <p className="text-[9px] text-slate-500 font-medium">Independência e iniciativa em atividades estruturadas.</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-black px-2 py-0.5 rounded-lg">
                      Nível {profile.comportamental.autonomia} / 5
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={profile.comportamental.autonomia}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setProfile(prev => ({ 
                        ...prev, 
                        comportamental: { ...prev.comportamental, autonomia: val } 
                      }));
                    }}
                    className="w-full accent-indigo-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Botões do Stepper */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6 mt-8">
        <button
          onClick={onCancel}
          className="px-5 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
        >
          Cancelar
        </button>

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-chevron-left"></i> Voltar
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-indigo-900/15"
            >
              Avançar <i className="fa-solid fa-chevron-right"></i>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <i className="fa-solid fa-play"></i> Iniciar Jogo Adaptado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
