import React, { useState, useMemo, useEffect } from 'react';
import { Student, Class, User } from '../../types';
import { GAMES_CATALOG, GameDefinition } from './gamesData';
import IncluiGamerMap from './IncluiGamerMap';
import IncluiGamerDashboard from './IncluiGamerDashboard';
import IncluiGamerPlay from './IncluiGamerPlay';
import IncluiGamerPreProfile, { PreGamerProfile } from './IncluiGamerPreProfile';
import { BNCC_MAPPING_DATA } from './bnccMappingData';
import { supabase } from '../../lib/supabaseClient';

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
  const [pendingGame, setPendingGame] = useState<GameDefinition | null>(null);
  const [preProfile, setPreProfile] = useState<PreGamerProfile | null>(null);
  const [latestPreProfile, setLatestPreProfile] = useState<PreGamerProfile | null>(null);

  // Expansão Pedagógica BNCC (Fase 3)
  const [ageWarningGame, setAgeWarningGame] = useState<GameDefinition | null>(null);
  const [ageBlockGame, setAgeBlockGame] = useState<GameDefinition | null>(null);
  const [cognitiveScore, setCognitiveScore] = useState<any>(null);

  // Progressão e Níveis (Fase 5)
  const [gameProgress, setGameProgress] = useState<Record<string, { current_level: number; stars_earned: number; completed: boolean }>>({});
  const [levelSelectorGame, setLevelSelectorGame] = useState<GameDefinition | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Carregamento de Scores Cognitivos Históricos
  useEffect(() => {
    if (!selectedStudentId) {
      setCognitiveScore(null);
      return;
    }
    
    const loadScores = async () => {
      try {
        const { data, error } = await supabase
          .from('cognitive_scores')
          .select('*')
          .eq('student_id', selectedStudentId)
          .maybeSingle();
          
        if (data) {
          setCognitiveScore(data);
          return;
        }
      } catch (e) {
        console.warn("[ACE Hub] Falha ao ler scores Supabase, buscando em LocalStorage.");
      }
      
      const local = localStorage.getItem(`incluigamer_scores_${selectedStudentId}`);
      if (local) {
        setCognitiveScore(JSON.parse(local));
      } else {
        setCognitiveScore({
          foco: 50,
          autonomia: 50,
          emocional: 50,
          coordenacao: 50,
          engajamento: 50,
          desenvolvimento_pedagogico: 50
        });
      }
    };
    
    loadScores();
  }, [selectedStudentId]);

  // Carregar perfil cognitivo pré-jogo mais recente (reutilização rápida)
  useEffect(() => {
    if (!selectedStudentId) {
      setLatestPreProfile(null);
      return;
    }
    
    const loadLatestProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('gamer_pre_profiles')
          .select('*')
          .eq('student_id', selectedStudentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (data) {
          const mappedProfile = {
            comunicacao: {
              verbal: data.is_verbal,
              alternativa: data.uses_aac,
              compreensao: data.understands_commands_level,
              ecolalia: data.echolalia
            },
            sensorial: {
              hipersensibilidadeSonora: data.sound_sensitivity,
              hipersensibilidadeVisual: data.visual_sensitivity,
              toleranciaEstimulos: data.stimulus_tolerance
            },
            coordenacao: {
              mouse: data.input_preference === 'mouse',
              touchscreen: data.input_preference === 'touchscreen' || data.input_preference === 'ambos',
              fine_motor_level: data.fine_motor_level
            },
            cognitivo: {
              letras: data.knows_letters,
              numeros: data.knows_numbers,
              formas: data.knows_shapes,
              cores: data.knows_colors,
              associacaoLogica: data.logical_association
            },
            comportamental: {
              tempoFocoMinutos: data.focus_minutes,
              frustracaoAlta: data.frustration_level === 'alta',
              reforcoPositivo: data.needs_positive_reinforcement,
              autonomia: data.autonomy_level
            }
          } as any;
          setLatestPreProfile(mappedProfile);
          return;
        }
      } catch (e) {
        console.warn("[ACE Hub] Falha ao ler perfil Supabase, buscando local.");
      }
      
      const local = localStorage.getItem(`incluigamer_latest_preprofile_${selectedStudentId}`);
      if (local) {
        setLatestPreProfile(JSON.parse(local));
      } else {
        setLatestPreProfile(null);
      }
    };
    
    loadLatestProfile();
  }, [selectedStudentId]);

  // Carregamento reativo de Progresso de Jogos / Níveis (Fase 5)
  const loadProgress = async () => {
    if (!selectedStudentId) {
      setGameProgress({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('game_id, current_level, stars_earned, completed')
        .eq('student_id', selectedStudentId);

      if (data && data.length > 0) {
        const progressMap: Record<string, any> = {};
        data.forEach(item => {
          progressMap[item.game_id] = {
            current_level: item.current_level,
            stars_earned: item.stars_earned,
            completed: item.completed
          };
        });
        setGameProgress(progressMap);
        return;
      }
    } catch (e) {
      console.warn("[ACE Hub] Falha ao ler progresso Supabase, buscando local.");
    }

    const local = localStorage.getItem(`incluigamer_progress_map_${selectedStudentId}`);
    if (local) {
      setGameProgress(JSON.parse(local));
    } else {
      const initialMap: Record<string, any> = {};
      GAMES_CATALOG.forEach(g => {
        initialMap[g.id] = {
          current_level: 1,
          stars_earned: 0,
          completed: false
        };
      });
      setGameProgress(initialMap);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [selectedStudentId]);

  const handleLaunchGame = (game: GameDefinition) => {
    if (!ageGroupKey) {
      setLevelSelectorGame(game);
      return;
    }

    const AGE_GROUPS_ORDER = ['0-3', '4-5', '6-8', '9-12', '13+'];
    const studentIdx = AGE_GROUPS_ORDER.indexOf(ageGroupKey);
    const gameIdx = AGE_GROUPS_ORDER.indexOf(game.ageGroup);

    if (studentIdx === -1 || gameIdx === -1) {
      setLevelSelectorGame(game);
      return;
    }

    // Regra 1: Bloqueio Pedagógico Absoluto (diferença de 2 faixas etárias ou mais para cima)
    if (gameIdx - studentIdx >= 2) {
      setAgeBlockGame(game);
      return;
    }

    // Regra 2: Alerta de Mediação / Subestimulação (studentIdx > gameIdx) ou Pequeno Desvio Superior (gameIdx - studentIdx === 1)
    if (studentIdx > gameIdx || gameIdx - studentIdx === 1) {
      setAgeWarningGame(game);
      return;
    }

    // Regra 3: Faixa etária correspondente exata -> Abrir seletor de nível
    setLevelSelectorGame(game);
  };

  const handleForceLaunchGame = (game: GameDefinition) => {
    setAgeWarningGame(null);
    setLevelSelectorGame(game);
  };

  const handleSelectLevelAndLaunch = (game: GameDefinition, levelNum: number) => {
    setSelectedLevel(levelNum);
    setLevelSelectorGame(null);
    setPendingGame(game);
  };

  const handleConfirmPreProfile = (profile: PreGamerProfile) => {
    setPreProfile(profile);
    setLatestPreProfile(profile);
    if (selectedStudentId) {
      localStorage.setItem(`incluigamer_latest_preprofile_${selectedStudentId}`, JSON.stringify(profile));
    }
    setActiveGame(pendingGame);
    setPendingGame(null);
  };

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
    
    if (age <= 3.9) return '0-3';
    if (age <= 5.9) return '4-5';
    if (age <= 8.9) return '6-8';
    if (age <= 12.9) return '9-12';
    return '13+';
  }, [selectedStudent, studentAge]);

  // Sistema de Recomendação Pedagógica Inteligente Local (Expansão Fase 3)
  const recommendations = useMemo(() => {
    if (!selectedStudent || !ageGroupKey) return [];
    
    let list = GAMES_CATALOG;
    
    // Obter deficiência e dados históricos de scores
    const deficiency = (selectedStudent.deficiency || '').toLowerCase();
    const diagnosis = (selectedStudent.diagnosis || '').toLowerCase();
    const scores = cognitiveScore || {
      foco: 50,
      autonomia: 50,
      emocional: 50,
      coordenacao: 50,
      engajamento: 50,
      desenvolvimento_pedagogico: 50
    };

    return list.map(game => {
      let matchScore = 0;
      let reasons: string[] = [];
      let isClinica = false;

      // Pegar mapeamentos BNCC deste jogo
      const bnccMappings = BNCC_MAPPING_DATA.filter(m => m.gameId === game.id);
      const eixos = bnccMappings.map(m => m.eixoCognitivo);

      // Regra 1: Alinhamento de Faixa Etária BNCC
      if (game.ageGroup === ageGroupKey) {
        matchScore += 4;
        reasons.push('Ideal para a faixa etária curricular BNCC.');
      } else {
        matchScore -= 2;
      }

      // Regra 2: Recomendação Clínica por Dificuldades Históricas (Aproveitamento Cognitivo)
      if (scores.coordenacao < 50 && (eixos.includes('Percepção Sensorial') || eixos.includes('Coordenação Visomotora'))) {
        matchScore += 6;
        isClinica = true;
        reasons.push('Estimulação recomendada para desenvolvimento de Coordenação Visomotora.');
      }

      if (scores.foco < 50 && game.stimuli.includes('Foco')) {
        matchScore += 5;
        isClinica = true;
        reasons.push('Treino cognitivo para aumento do tempo sustentado de Foco.');
      }

      if (scores.autonomia < 50 && eixos.includes('Socioemocional')) {
        matchScore += 4;
        isClinica = true;
        reasons.push('Exercício socioemocional focado em reforço de Autonomia.');
      }

      if (scores.desenvolvimento_pedagogico < 50 && eixos.includes('Alfabetização')) {
        matchScore += 5;
        isClinica = true;
        reasons.push('Reforço pedagógico de letramento e consciência silábica.');
      }

      // Regra 3: Recomendações Clínicas por Deficiência/Diagnóstico
      if (deficiency.includes('tea') || deficiency.includes('autista') || diagnosis.includes('f84')) {
        if (eixos.includes('Socioemocional') || game.bioma === 'emocoes') {
          matchScore += 3;
          reasons.push('Estímulo de empatia e reconhecimento emocional para TEA.');
        }
        if (game.stimuli.includes('Calmante')) {
          matchScore += 2;
          reasons.push('Ambiente seguro e regulador contra sobrecarga sensorial.');
        }
      }

      if (deficiency.includes('tdah') || deficiency.includes('atenção') || diagnosis.includes('f90')) {
        if (game.stimuli.includes('Foco')) {
          matchScore += 3;
          reasons.push('Treinamento lúdico de atenção alternada.');
        }
      }

      if (deficiency.includes('física') || deficiency.includes('motora') || deficiency.includes('paralisia')) {
        if (eixos.includes('Percepção Sensorial') || game.stimuli.includes('Tátil')) {
          matchScore += 4;
          reasons.push('Interações físicas e estímulos visomotores simplificados.');
        }
      }

      return { 
        game, 
        score: matchScore, 
        reason: reasons[0] || 'Atividade lúdica recomendada.',
        isClinica: isClinica && game.ageGroup === ageGroupKey
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  }, [selectedStudent, ageGroupKey, cognitiveScore]);

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
          preProfile={preProfile}
          ageGroup={ageGroupKey || undefined}
          level={selectedLevel}
          onClose={() => {
            setActiveGame(null);
            setPreProfile(null);
            loadProgress(); // Atualiza os níveis na gaveta reativamente
            setActiveSubTab('dashboard'); // Ir para o dashboard ver os resultados após o jogo
          }} 
        />
      ) : pendingGame ? (
        /* Stepper de Perfil Cognitivo Pré-Jogo Obrigatório */
        <IncluiGamerPreProfile
          student={selectedStudent!}
          game={pendingGame}
          onConfirm={handleConfirmPreProfile}
          onCancel={() => setPendingGame(null)}
          latestProfile={latestPreProfile}
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
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-305 animate-in fade-in ${
                        (accessibility as any)[item.key] ? 'text-emerald-400' : 'text-rose-500'
                      }`}>
                        {(accessibility as any)[item.key] ? 'Ativo' : 'Não ativo'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer mt-0.5 select-none">
                        <input 
                          type="checkbox" 
                          checked={(accessibility as any)[item.key]} 
                          onChange={(e) => setAccessibility(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-rose-950/20 border border-rose-500/30 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/20 peer-checked:border-emerald-500/30 peer-checked:after:bg-emerald-400"></div>
                      </label>
                    </div>
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
                {recommendations.map(({ game, reason, isClinica }) => (
                  <div 
                    key={game.id} 
                    onClick={() => handleLaunchGame(game)}
                    className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-850 hover:border-indigo-500/30 rounded-2xl transition-all cursor-pointer group flex flex-col gap-1.5 relative overflow-hidden"
                  >
                    {isClinica && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-200 group-hover:text-indigo-400 transition-colors truncate w-32">{game.name}</span>
                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${
                        isClinica 
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}>{isClinica ? 'Clínico' : game.difficulty}</span>
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
                  onSelectGame={handleLaunchGame} 
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
      {/* Modal de Alerta Pedagógico de Faixa Etária BNCC */}
      {ageWarningGame && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-6 relative overflow-hidden">
            {/* Glow Decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-2xl animate-pulse">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Adequação Pedagógica</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Esta atividade é classificada para a faixa de <span className="text-amber-400 font-bold">{ageWarningGame.ageLabel}</span>. 
                O aluno selecionado, <span className="text-indigo-400 font-bold">{selectedStudent?.name}</span> ({studentAge} anos), possui perfil correspondente à faixa <span className="text-indigo-400 font-bold">{ageGroupKey}</span>.
              </p>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-2xl text-left space-y-2">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Habilidade BNCC Requerida</p>
              {BNCC_MAPPING_DATA.filter(m => m.gameId === ageWarningGame.id).slice(0, 1).map(item => (
                <div key={item.id} className="text-xs space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black rounded-md uppercase tracking-wider">{item.habilidadeBncc}</span>
                  <p className="text-slate-300 font-semibold leading-relaxed text-[11px]">{item.descricaoBncc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setAgeWarningGame(null)}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-750 shadow-md"
              >
                Voltar ao Mapa (Recomendado)
              </button>
              
              <button
                onClick={() => handleForceLaunchGame(ageWarningGame)}
                className="w-full py-3.5 bg-gradient-to-tr from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-950/20"
              >
                Forçar Inicialização (Mediação)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueio Pedagógico Absoluto por Faixa Etária BNCC */}
      {ageBlockGame && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-6 relative overflow-hidden">
            {/* Glow Decorativo Vermelho */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-2xl animate-bounce">
              <i className="fa-solid fa-ban"></i>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Atividade Restrita</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Complexidade cognitiva incompatível com a etapa de desenvolvimento do aluno.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                O aluno <span className="text-indigo-400 font-bold">{selectedStudent?.name}</span> ({studentAge} anos) está na faixa <span className="text-indigo-400 font-bold">{ageGroupKey}</span>.
                O jogo <span className="text-rose-400 font-bold">{ageBlockGame.name}</span> é exclusivo para a faixa de <span className="text-rose-400 font-bold">{ageBlockGame.ageLabel}</span>.
              </p>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-2xl text-left space-y-2">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Habilidade BNCC Requerida</p>
              {BNCC_MAPPING_DATA.filter(m => m.gameId === ageBlockGame.id).slice(0, 1).map(item => (
                <div key={item.id} className="text-xs space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black rounded-md uppercase tracking-wider">{item.habilidadeBncc}</span>
                  <p className="text-slate-300 font-semibold leading-relaxed text-[11px]">{item.descricaoBncc}</p>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => setAgeBlockGame(null)}
                className="w-full py-3.5 bg-gradient-to-tr from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-950/20"
              >
                Voltar ao Mapa (Recomendado)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Seletor de Níveis Pedagógicos Premium (Fase 5) */}
      {levelSelectorGame && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl max-w-lg w-full text-center space-y-6 relative overflow-hidden">
            {/* Glow Decorativo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">{levelSelectorGame.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{levelSelectorGame.ageLabel} • Bioma: {levelSelectorGame.bioma.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setLevelSelectorGame(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((lvlNum) => {
                const lvlDef = levelSelectorGame.levels.find(l => l.level === lvlNum);
                if (!lvlDef) return null;

                const progress = gameProgress[levelSelectorGame.id] || { current_level: 1, stars_earned: 0, completed: false };
                const isDesbloqueado = lvlNum <= progress.current_level;
                
                // Exibir estrelas se concluído
                const estrelas = lvlNum < progress.current_level 
                  ? progress.stars_earned 
                  : lvlNum === progress.current_level && progress.completed 
                    ? progress.stars_earned 
                    : 0;

                return (
                  <div 
                    key={lvlNum}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left relative overflow-hidden ${
                      isDesbloqueado 
                        ? 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/30 shadow-inner' 
                        : 'bg-slate-900/20 border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-indigo-400">Nível {lvlNum}</span>
                        <h4 className="text-xs font-black text-white">{lvlDef.name}</h4>
                        
                        {/* Estrelas obtidas no nível */}
                        {isDesbloqueado && estrelas > 0 && (
                          <div className="flex gap-0.5 text-xs text-amber-400">
                            {Array.from({ length: estrelas }).map((_, idx) => (
                              <i key={idx} className="fa-solid fa-star"></i>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-semibold">{lvlDef.objective}</p>
                      
                      <div className="flex gap-1.5 items-center mt-1 flex-wrap">
                        <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-900/35 px-1.5 py-0.5 rounded font-extrabold uppercase">{lvlDef.bnccSkills[0]}</span>
                        <span className="text-[8px] bg-slate-850 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-black uppercase">{lvlDef.difficulty}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto self-stretch sm:self-center flex items-center justify-end">
                      {isDesbloqueado ? (
                        <button
                          onClick={() => handleSelectLevelAndLaunch(levelSelectorGame, lvlNum)}
                          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-play"></i> Iniciar
                        </button>
                      ) : (
                        <span className="text-[8px] font-black uppercase bg-slate-950 text-slate-500 border border-slate-850 px-3 py-2 rounded-xl flex items-center gap-1.5 w-full sm:w-auto justify-center">
                          <i className="fa-solid fa-lock text-[9px]"></i> Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
