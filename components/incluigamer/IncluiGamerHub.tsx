import React, { useState, useMemo, useEffect } from 'react';
import { Student, Class, User } from '../../types';
import { GAMES_CATALOG, GameDefinition } from './gamesData';
import IncluiGamerMap from './IncluiGamerMap';
import IncluiGamerDashboard from './IncluiGamerDashboard';
import IncluiGamerPlay from './IncluiGamerPlay';

interface IncluiGamerHubProps {
  students: Student[];
  classes: Class[];
  user: User;
  studentRecords?: any[];
}

export default function IncluiGamerHub({ students, classes, user, studentRecords }: IncluiGamerHubProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'mapa' | 'dashboard'>('mapa');
  
  // Acessibilidade gamer
  const [accessibility, setAccessibility] = useState({
    modoCalmante: false,
    altoContraste: false,
    tempoEstendido: false,
    audioDescricao: false,
  });

  // Jogo ativo
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);

  // Selecionar o aluno ativo
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Sincronizar aluno se o professor tiver apenas um aluno
  useEffect(() => {
    if (students.length === 1 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Função para calcular a idade a partir da data de nascimento
  const studentAge = useMemo(() => {
    if (!selectedStudent) return 0;
    const dateStr = selectedStudent.birth_date || selectedStudent.birthDate;
    if (!dateStr) return 0;
    
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [selectedStudent]);

  // Determinar a faixa etária para recomendação da BNCC
  const ageGroupKey = useMemo(() => {
    if (!selectedStudent) return null;
    const age = studentAge;
    
    if (age <= 1.5) return '0-1.5';
    if (age <= 3.9) return '1.5-3';
    if (age <= 5.9) return '4-5';
    // Se o ano de escolaridade tiver "ano" ou "Fundamental"
    const grade = (selectedStudent.grade || '').toLowerCase();
    if (grade.includes('6') || grade.includes('7') || grade.includes('8') || grade.includes('9') || age >= 11) {
      return 'fundamental_finais';
    }
    return 'fundamental_iniciais';
  }, [selectedStudent, studentAge]);

  // Sistema de Recomendação Inteligente e Adaptativo
  const recommendations = useMemo(() => {
    if (!selectedStudent || !ageGroupKey) return [];
    
    // Filtrar primeiro pela faixa etária (BNCC prioritária)
    let list = GAMES_CATALOG.filter(g => g.ageGroup === ageGroupKey);
    
    // Se a lista por faixa etária for vazia, buscar ampla
    if (list.length === 0) {
      list = GAMES_CATALOG;
    }

    // Ordenar de acordo com o diagnóstico/deficiência do aluno
    const deficiency = (selectedStudent.deficiency || '').toLowerCase();
    const diagnosis = (selectedStudent.diagnosis || '').toLowerCase();
    
    return list.map(game => {
      let matchScore = 0;
      let reason = 'Recomendado para a faixa etária da BNCC.';

      // Caso TEA (Autismo) -> Biomas Socioemocional (emocoes) ou Sensorial com Modo Calmante
      if (deficiency.includes('tea') || deficiency.includes('autista') || deficiency.includes('espectro') || diagnosis.includes('f84')) {
        if (game.bioma === 'emocoes') {
          matchScore += 3;
          reason = 'Excelente para estimulação socioemocional e empatia.';
        } else if (game.bioma === 'sensorial') {
          matchScore += 2;
          reason = 'Ótimo estímulo sensorial e controle de ansiedade.';
        }
      }
      
      // Caso TDAH ou Déficit de Atenção -> Foco e Lógica (cognitivo)
      if (deficiency.includes('tdah') || deficiency.includes('atenção') || diagnosis.includes('f90')) {
        if (game.bioma === 'cognitivo' && game.stimuli.includes('Foco')) {
          matchScore += 3;
          reason = 'Desenvolvido especificamente para treinar foco e atenção sustentada.';
        }
      }

      // Caso Deficiência Física/Motora -> Estímulo Tátil facilitado e sensorial
      if (deficiency.includes('física') || deficiency.includes('motora') || deficiency.includes('paralisia')) {
        if (game.bioma === 'sensorial' || game.stimuli.includes('Tátil')) {
          matchScore += 3;
          reason = 'Interface adaptável com alvos grandes e estímulos motores facilitados.';
        }
      }

      // Caso Intelectual ou Atraso Geral -> Reino Matemático adaptativo ou Sensorial
      if (deficiency.includes('intelectual') || deficiency.includes('atraso') || deficiency.includes('down')) {
        if (game.bioma === 'matematico' || game.difficulty === 'Fácil') {
          matchScore += 3;
          reason = 'Lógica simplificada ideal para exercitar números e ordenações básicas.';
        }
      }

      return { game, score: matchScore, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  }, [selectedStudent, ageGroupKey]);

  // Ativar Modo Calmante automaticamente se o aluno tiver TEA
  useEffect(() => {
    if (selectedStudent) {
      const def = (selectedStudent.deficiency || '').toLowerCase();
      const diag = (selectedStudent.diagnosis || '').toLowerCase();
      if (def.includes('tea') || def.includes('autista') || diag.includes('f84')) {
        setAccessibility(prev => ({ ...prev, modoCalmante: true }));
      } else {
        setAccessibility(prev => ({ ...prev, modoCalmante: false }));
      }
    }
  }, [selectedStudent]);

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${
      accessibility.modoCalmante ? 'theme-calm-active' : ''
    }`}>
      {/* Header Premium IncluiGamer */}
      <header className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Glow Decorativo Gamer */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10 w-full lg:w-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-900/30 animate-pulse">
            <i className="fa-solid fa-gamepad"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              IncluiGamer 
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
                Premium
              </span>
            </h1>
            <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.25em]">Motor Cognitivo Adaptativo & Aprendizagem Gamificada</p>
          </div>
        </div>

        {/* Seleção do Aluno */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto z-10">
          <div className="space-y-1 w-full sm:w-64">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Acompanhamento do Aluno</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setActiveGame(null);
              }}
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="">Selecione um Aluno para Jogar...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({classes.find(c => c.id === s.classId)?.name || 'Sem turma'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {activeGame ? (
        /* Seção de Jogo Ativo */
        <IncluiGamerPlay 
          game={activeGame} 
          student={selectedStudent!} 
          user={user}
          accessibility={accessibility}
          onClose={() => {
            setActiveGame(null);
            setActiveSubTab('dashboard'); // Ir para o dashboard ver os resultados após o jogo
          }} 
        />
      ) : selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Painel Lateral: Perfil, Acessibilidade e Recomendações */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Mini Card Aluno */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] text-center space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-indigo-950 border border-indigo-800/50 text-indigo-400 font-black text-xl flex items-center justify-center mx-auto shadow-inner">
                {(selectedStudent.name || 'A').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-black text-sm truncate px-1">{selectedStudent.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                  {classes.find(c => c.id === selectedStudent.classId)?.name || 'Classe AEE'}
                </p>
              </div>

              {selectedStudent.deficiency && (
                <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-black rounded-lg uppercase tracking-wider max-w-full truncate">
                  <i className="fa-solid fa-star-of-life mr-1 text-[8px]"></i>
                  {selectedStudent.deficiency}
                </div>
              )}
            </div>

            {/* Configurações de Acessibilidade Gamer */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-5 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-sliders text-indigo-500"></i> Acessibilidade Adaptativa
              </h4>

              <div className="space-y-3.5">
                {[
                  { key: 'modoCalmante', label: 'Modo Calmante', desc: 'Reduz luzes e remove estímulos agressivos.', icon: 'fa-wind', color: 'text-sky-400' },
                  { key: 'altoContraste', label: 'Alto Contraste', desc: 'Maximiza cores para foco visual ampliado.', icon: 'fa-circle-half-stroke', color: 'text-yellow-400' },
                  { key: 'tempoEstendido', label: 'Tempo Estendido', desc: 'Dobra os contadores e reduz cobrança de tempo.', icon: 'fa-clock', color: 'text-amber-400' },
                  { key: 'audioDescricao', label: 'Suporte por Voz', desc: 'Sintetiza comandos e feedbacks em áudio.', icon: 'fa-volume-high', color: 'text-emerald-400' },
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-all">
                    <div className="flex gap-2.5">
                      <i className={`fa-solid ${item.icon} ${item.color} mt-1 text-xs`}></i>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.label}</p>
                        <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-0.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={(accessibility as any)[item.key]} 
                        onChange={(e) => setAccessibility(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações Inteligentes da BNCC */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-sm">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-brain"></i> Sugestões Inteligentes
              </h4>
              <div className="space-y-3">
                {recommendations.map(({ game, reason }) => (
                  <div 
                    key={game.id} 
                    onClick={() => setActiveGame(game)}
                    className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-850 hover:border-indigo-500/30 rounded-2xl transition-all cursor-pointer group flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-200 group-hover:text-indigo-400 transition-colors truncate w-32">{game.name}</span>
                      <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{game.difficulty}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Área Principal: Abas e Telas */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Navegação entre Mapa e Dashboard */}
            <div className="flex bg-slate-900/60 p-2 rounded-[2rem] border border-slate-800/80 shadow-inner w-full max-w-sm">
              <button
                onClick={() => setActiveSubTab('mapa')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'mapa'
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-map-location-dot text-xs"></i>
                Mapa Gamer
              </button>
              <button
                onClick={() => setActiveSubTab('dashboard')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'dashboard'
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-chart-line text-xs"></i>
                Dashboard Cognitivo
              </button>
            </div>

            {/* Conteúdo Ativo */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl relative min-h-[500px]">
              {activeSubTab === 'mapa' ? (
                <IncluiGamerMap 
                  student={selectedStudent} 
                  ageGroup={ageGroupKey}
                  onSelectGame={setActiveGame} 
                />
              ) : (
                <IncluiGamerDashboard 
                  student={selectedStudent}
                  studentRecords={studentRecords}
                />
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Estado Vazio - Selecione um Aluno */
        <div className="bg-slate-900 border border-slate-800 p-20 rounded-[3.5rem] text-center space-y-6 max-w-2xl mx-auto shadow-xl relative overflow-hidden">
          {/* Decorações Neon Gamer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[2px]"></div>
          
          <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] border border-slate-700 flex items-center justify-center mx-auto text-indigo-400 text-4xl shadow-inner animate-bounce">
            <i className="fa-solid fa-gamepad"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Iniciar Sessão IncluiGamer</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              O IncluiGamer é um módulo de jogos pedagógicos alinhados à BNCC. <br />
              Selecione um dos seus alunos no menu superior para começar a trilha de <br />
              aprendizagem adaptativa e monitorar seu desenvolvimento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
