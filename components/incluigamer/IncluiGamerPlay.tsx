import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Student, User } from '../../types';
import { GameDefinition } from './gamesData';
import { supabase } from '../../lib/supabaseClient';

interface IncluiGamerPlayProps {
  game: GameDefinition;
  student: Student;
  user: User;
  accessibility: {
    modoCalmante: boolean;
    altoContraste: boolean;
    tempoEstendido: boolean;
    audioDescricao: boolean;
  };
  onClose: () => void;
}

export default function IncluiGamerPlay({ game, student, user, accessibility, onClose }: IncluiGamerPlayProps) {
  // Estados do Jogo
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds] = useState<number>(5);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });

  // Questão/Cenário atual do Jogo
  const [gameState, setGameState] = useState<any>(null);

  // Métricas do Adaptive Cognitive Engine (ACE)
  const metrics = useRef({
    acertos: 0,
    erros: 0,
    tempoTotalMs: 0,
    respostas: [] as Array<{
      rodada: number;
      correta: boolean;
      tempoReacaoMs: number;
      errosTentativa: number;
    }>,
    cliquesEfetuados: 0,
    errosSeguidos: 0,
    acertosSeguidos: 0,
  });

  // Temporizadores para medir tempo de reação
  const startTime = useRef<number>(Date.now());
  const errorsInCurrentRound = useRef<number>(0);

  // Motor Inteligente: Adaptive Cognitive Engine (ACE)
  const [difficultyModulation, setDifficultyModulation] = useState({
    numeroOpcoes: 3, // Inicia com 3 opções
    tempoLimiteS: accessibility.tempoEstendido ? 20 : 10,
    tamanhoAlvo: 'normal', // 'normal' | 'grande' (para facilitação motora)
    ajusteVisualExtra: false,
  });

  // Falar comando se áudio descrição estiver ativa
  const speakCommand = (text: string) => {
    if (accessibility.audioDescricao && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Gerar o cenário de jogo com base na dificuldade do ACE e no tipo de jogo
  const generateNewRound = (roundNum: number, currentLevel: number, numOptions: number) => {
    startTime.current = Date.now();
    errorsInCurrentRound.current = 0;

    const gameSlug = game.id.toLowerCase();

    // 1. Minijogo: Caçadores de Letras
    if (gameSlug.includes('letras')) {
      const palavrasDB = [
        { palavra: 'BOLA', incompleta: 'B_LA', correta: 'O', incorretas: ['A', 'U', 'E', 'I', 'M'] },
        { palavra: 'CASA', incompleta: 'CA_A', correta: 'S', incorretas: ['Z', 'X', 'V', 'T', 'L'] },
        { palavra: 'ESCOLA', incompleta: 'ESC_LA', correta: 'O', incorretas: ['A', 'E', 'U', 'I', 'P'] },
        { palavra: 'AMIGO', incompleta: 'AM_GO', correta: 'I', incorretas: ['E', 'Y', 'O', 'A', 'U'] },
        { palavra: 'LIVRO', incompleta: 'LIV_O', correta: 'R', incorretas: ['L', 'N', 'M', 'S', 'P'] },
        { palavra: 'FELIZ', incompleta: 'FEL_Z', correta: 'I', incorretas: ['E', 'A', 'U', 'O', 'Y'] },
      ];

      // Escolhe palavra baseado na rodada
      const item = palavrasDB[(roundNum - 1) % palavrasDB.length];
      const opcoesFiltradas = item.incorretas.slice(0, numOptions - 1);
      const opcoes = [...opcoesFiltradas, item.correta].sort(() => Math.random() - 0.5);

      const prompt = `Qual letra completa a palavra ${item.incompleta}?`;
      speakCommand(prompt);

      setGameState({
        prompt,
        incompleta: item.incompleta,
        respostaCorreta: item.correta,
        opcoes,
        palavraCompleta: item.palavra
      });
    }
    // 2. Minijogo: Quebra-Cabeça / Formas
    else if (gameSlug.includes('formas')) {
      const formasDB = [
        { molde: '▲ Triângulo', correta: '▲', incorretas: ['●', '■', '★', '♥', '♦'] },
        { molde: '● Círculo', correta: '●', incorretas: ['▲', '■', '★', '♥', '♦'] },
        { molde: '■ Quadrado', correta: '■', incorretas: ['●', '▲', '★', '♥', '♦'] },
        { molde: '★ Estrela', correta: '★', incorretas: ['●', '■', '▲', '♥', '♦'] },
        { molde: '♥ Coração', correta: '♥', incorretas: ['●', '■', '★', '▲', '♦'] },
      ];

      const item = formasDB[(roundNum - 1) % formasDB.length];
      const opcoesFiltradas = item.incorretas.slice(0, numOptions - 1);
      const opcoes = [...opcoesFiltradas, item.correta].sort(() => Math.random() - 0.5);

      const prompt = `Encontre a forma geométrica idêntica ao molde: ${item.molde}.`;
      speakCommand(prompt);

      setGameState({
        prompt,
        molde: item.molde,
        respostaCorreta: item.correta,
        opcoes
      });
    }
    // 3. Minijogo: Cidade das Emoções / Termômetro dos Sentimentos
    else {
      const sentimentosDB = [
        { situacao: 'Quando ganho um abraço de um amigo, eu me sinto...', correta: '😊 Feliz', incorretas: ['😢 Triste', '😡 Bravo', '😱 Assustado', '😴 Cansado'] },
        { situacao: 'Quando meu brinquedo favorito quebra, eu fico...', correta: '😢 Triste', incorretas: ['😊 Feliz', '😡 Bravo', '😱 Assustado', '😴 Cansado'] },
        { situacao: 'Se escuto um barulho muito forte no escuro, eu fico...', correta: '😱 Assustado', incorretas: ['😊 Feliz', '😢 Triste', '😡 Bravo', '😴 Cansado'] },
        { situacao: 'Quando alguém pega meu lápis sem pedir, eu posso ficar...', correta: '😡 Bravo', incorretas: ['😊 Feliz', '😢 Triste', '😱 Assustado', '😴 Cansado'] },
        { situacao: 'Depois de correr e brincar bastante no pátio, eu me sinto...', correta: '😴 Cansado', incorretas: ['😊 Feliz', '😢 Triste', '😡 Bravo', '😱 Assustado'] },
      ];

      const item = sentimentosDB[(roundNum - 1) % sentimentosDB.length];
      const opcoesFiltradas = item.incorretas.slice(0, numOptions - 1);
      const opcoes = [...opcoesFiltradas, item.correta].sort(() => Math.random() - 0.5);

      const prompt = item.situacao;
      speakCommand(prompt);

      setGameState({
        prompt,
        situacao: item.situacao,
        respostaCorreta: item.correta,
        opcoes
      });
    }
  };

  // Gerar primeira rodada ao montar
  useEffect(() => {
    generateNewRound(1, level, difficultyModulation.numeroOpcoes);
  }, []);

  // Tratar resposta do Aluno
  const handleSelectOption = (opcao: string) => {
    metrics.current.cliquesEfetuados++;
    const tempoReacao = Date.now() - startTime.current;
    
    const ehCorreta = opcao === gameState.respostaCorreta;

    if (ehCorreta) {
      metrics.current.acertos++;
      metrics.current.acertosSeguidos++;
      metrics.current.errosSeguidos = 0;
      setScore(prev => prev + Math.max(10, 50 - Math.floor(tempoReacao / 1000) * 2));

      // Feedback Auditivo Suave
      speakCommand("Muito bem! Acertou.");
      setFeedbackMsg({ text: 'Excelente! Resposta correta! 🎉', type: 'success' });

      // Registrar métrica da rodada
      metrics.current.respostas.push({
        rodada: currentRound,
        correta: true,
        tempoReacaoMs: tempoReacao,
        errosTentativa: errorsInCurrentRound.current
      });
      metrics.current.tempoTotalMs += tempoReacao;

      // --- Lógica do Adaptive Cognitive Engine (ACE) ---
      // Se estiver indo super bem (3 acertos seguidos), aumentar dificuldade
      let novoNumOpcoes = difficultyModulation.numeroOpcoes;
      let novoTamanho = difficultyModulation.tamanhoAlvo;
      
      if (metrics.current.acertosSeguidos >= 3) {
        if (difficultyModulation.numeroOpcoes < 5) {
          novoNumOpcoes = difficultyModulation.numeroOpcoes + 1;
        }
        setLevel(prev => prev + 1);
        metrics.current.acertosSeguidos = 0;
      }

      setDifficultyModulation(prev => ({
        ...prev,
        numeroOpcoes: novoNumOpcoes,
        tamanhoAlvo: novoTamanho,
        ajusteVisualExtra: false
      }));

      // Avançar rodada ou terminar jogo
      setTimeout(() => {
        setFeedbackMsg({ text: '', type: null });
        if (currentRound < totalRounds) {
          setCurrentRound(prev => prev + 1);
          generateNewRound(currentRound + 1, level, novoNumOpcoes);
        } else {
          finishGame();
        }
      }, 1500);

    } else {
      // Resposta incorreta
      metrics.current.erros++;
      metrics.current.errosSeguidos++;
      metrics.current.acertosSeguidos = 0;
      errorsInCurrentRound.current++;

      speakCommand("Tente mais uma vez.");
      setFeedbackMsg({ text: 'Ops! Vamos tentar de novo? Você consegue!', type: 'error' });

      // --- Lógica do Adaptive Cognitive Engine (ACE) para Modulação e Facilitação ---
      // Se errar duas vezes seguidas ou tiver muitos erros na rodada, diminuir opções (facilitação cognitiva)
      let novoNumOpcoes = difficultyModulation.numeroOpcoes;
      let novoTamanho = difficultyModulation.tamanhoAlvo;
      let visualExtra = difficultyModulation.ajusteVisualExtra;

      if (metrics.current.errosSeguidos >= 2 || errorsInCurrentRound.current >= 2) {
        if (difficultyModulation.numeroOpcoes > 2) {
          novoNumOpcoes = difficultyModulation.numeroOpcoes - 1; // Reduz opções para escolha
        }
        novoTamanho = 'grande'; // Aumenta alvos visuais para facilitação motora
        visualExtra = true; // Aplica bordas e contrastes de auxílio
        metrics.current.errosSeguidos = 0;
      }

      setDifficultyModulation(prev => ({
        ...prev,
        numeroOpcoes: novoNumOpcoes,
        tamanhoAlvo: novoTamanho,
        ajusteVisualExtra: visualExtra
      }));

      // Regenera a rodada atual com as facilidades do ACE mantendo a mesma pergunta
      setTimeout(() => {
        setFeedbackMsg({ text: '', type: null });
        setGameState(prev => {
          if (!prev) return null;
          // Filtrar as opções removendo uma incorreta para diminuir complexidade
          const incorretas = prev.opcoes.filter((o: string) => o !== prev.respostaCorreta);
          const novasIncorretas = incorretas.slice(0, novoNumOpcoes - 1);
          const novasOpcoes = [...novasIncorretas, prev.respostaCorreta].sort(() => Math.random() - 0.5);
          return {
            ...prev,
            opcoes: novasOpcoes
          };
        });
      }, 1500);
    }
  };

  // Calcular e salvar analytics cognitivo no Supabase/LocalStorage
  const finishGame = async () => {
    setGameFinished(true);
    speakCommand("Parabéns! Atividade concluída com sucesso.");

    // Cálculo das Notas Cognitivas baseadas nas métricas do ACE
    const totalReaction = metrics.current.respostas.reduce((acc, r) => acc + r.tempoReacaoMs, 0);
    const avgReactionS = metrics.current.respostas.length > 0 ? (totalReaction / metrics.current.respostas.length / 1000) : 5;
    
    // 1. Engajamento (Cliques / Erros / Tempo)
    let engajamento = Math.max(30, 100 - (metrics.current.erros * 8) - (avgReactionS * 3));
    
    // 2. Foco (erros na rodada e tempo de reação)
    let foco = Math.max(20, 100 - (errorsInCurrentRound.current * 10) - (metrics.current.erros * 5));
    
    // 3. Autonomia (se precisou diminuir opções ou facilitação)
    let autonomia = Math.max(30, 100 - (difficultyModulation.tamanhoAlvo === 'grande' ? 25 : 0) - (metrics.current.erros * 4));
    
    // 4. Coordenação Visomotora (tempo de reação e erros de clique)
    let coordenacao = Math.max(40, 100 - (avgReactionS * 6) - (errorsInCurrentRound.current * 4));
    
    // 5. Emocional / Resiliência (erros seguidos e desistências)
    let emocional = Math.max(50, 100 - (metrics.current.errosSeguidos * 15));
    
    // 6. Desenvolvimento Pedagógico (acertos)
    let desenvolvimento = Math.max(10, (metrics.current.acertos / totalRounds) * 100);

    // Mapeamento de Habilidades BNCC trabalhadas
    const developedSkills = game.bnccSkills.map(code => ({
      code,
      proficiency: Math.round(desenvolvimento),
      date: new Date().toISOString().split('T')[0]
    }));

    const scoresPayload = {
      student_id: student.id,
      foco: Math.round(foco),
      autonomia: Math.round(autonomia),
      emocional: Math.round(emocional),
      coordenacao: Math.round(coordenacao),
      engajamento: Math.round(engajamento),
      desenvolvimento_pedagogico: Math.round(desenvolvimento),
      total_play_time: Math.round(metrics.current.tempoTotalMs / 1000),
      skills_developed: developedSkills,
      last_updated: new Date().toISOString(),
      municipio_id: user.municipio_id,
      school_id: user.schoolId
    };

    const behaviorLogPayload = {
      student_id: student.id,
      game_id: game.id,
      session_id: crypto.randomUUID(),
      event_type: 'sessao_concluida',
      event_data: {
        acertos: metrics.current.acertos,
        erros: metrics.current.erros,
        tempoTotalMs: metrics.current.tempoTotalMs,
        level_final: level,
        scores: scoresPayload
      },
      created_by: user.id,
      municipio_id: user.municipio_id,
      school_id: user.schoolId
    };

    // --- Salvamento Híbrido Resiliente ---
    try {
      console.log("[ACE Híbrido] Tentando persistir no Supabase...");
      
      // 1. Salva log de comportamento
      const { error: logErr } = await supabase
        .from('player_behavior_logs')
        .insert([behaviorLogPayload]);
        
      if (logErr) throw logErr;

      // 2. Salva ou atualiza scores cognitivos
      const { data: existingScore } = await supabase
        .from('cognitive_scores')
        .select('id, skills_developed')
        .eq('student_id', student.id)
        .maybeSingle();

      if (existingScore) {
        // Mesclar habilidades desenvolvidas
        const oldSkills = Array.isArray(existingScore.skills_developed) ? existingScore.skills_developed : [];
        const mergedSkills = [...oldSkills];

        developedSkills.forEach(newSkill => {
          const idx = mergedSkills.findIndex(s => s.code === newSkill.code);
          if (idx >= 0) {
            mergedSkills[idx] = {
              ...mergedSkills[idx],
              proficiency: Math.round((mergedSkills[idx].proficiency + newSkill.proficiency) / 2),
              date: newSkill.date
            };
          } else {
            mergedSkills.push(newSkill);
          }
        });

        await supabase
          .from('cognitive_scores')
          .update({
            ...scoresPayload,
            skills_developed: mergedSkills
          })
          .eq('id', existingScore.id);
      } else {
        await supabase
          .from('cognitive_scores')
          .insert([scoresPayload]);
      }

      console.log("[ACE Híbrido] Sucesso ao persistir no Supabase.");

    } catch (err) {
      console.warn("[ACE Híbrido] Falha ao persistir no Supabase. Chaveando para LocalStorage Fallback.", err);
      
      // Fallback para LocalStorage
      const localProgressKey = `incluigamer_progress_${student.id}`;
      const localScoresKey = `incluigamer_scores_${student.id}`;

      // Salvar logs de progresso
      const oldProgress = JSON.parse(localStorage.getItem(localProgressKey) || '[]');
      oldProgress.push(behaviorLogPayload);
      localStorage.setItem(localProgressKey, JSON.stringify(oldProgress));

      // Salvar ou atualizar scores
      const existingLocalScores = JSON.parse(localStorage.getItem(localScoresKey) || 'null');
      let finalLocalScores = scoresPayload;

      if (existingLocalScores) {
        const oldSkills = Array.isArray(existingLocalScores.skills_developed) ? existingLocalScores.skills_developed : [];
        const mergedSkills = [...oldSkills];

        developedSkills.forEach(newSkill => {
          const idx = mergedSkills.findIndex(s => s.code === newSkill.code);
          if (idx >= 0) {
            mergedSkills[idx] = {
              ...mergedSkills[idx],
              proficiency: Math.round((mergedSkills[idx].proficiency + newSkill.proficiency) / 2),
              date: newSkill.date
            };
          } else {
            mergedSkills.push(newSkill);
          }
        });

        finalLocalScores = {
          ...scoresPayload,
          foco: Math.round((existingLocalScores.foco + foco) / 2),
          autonomia: Math.round((existingLocalScores.autonomia + autonomia) / 2),
          emocional: Math.round((existingLocalScores.emocional + emocional) / 2),
          coordenacao: Math.round((existingLocalScores.coordenacao + coordenacao) / 2),
          engajamento: Math.round((existingLocalScores.engajamento + engajamento) / 2),
          desenvolvimento_pedagogico: Math.round((existingLocalScores.desenvolvimento_pedagogico + desenvolvimento) / 2),
          total_play_time: existingLocalScores.total_play_time + Math.round(metrics.current.tempoTotalMs / 1000),
          skills_developed: mergedSkills
        };
      }
      
      localStorage.setItem(localScoresKey, JSON.stringify(finalLocalScores));
      console.log("[ACE Híbrido] Sucesso ao persistir em LocalStorage.");
    }
  };

  return (
    <div className={`p-10 rounded-[3rem] border shadow-2xl relative overflow-hidden transition-colors duration-500 ${
      accessibility.modoCalmante 
        ? 'bg-slate-950/90 border-slate-900 text-slate-300' 
        : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header do Jogo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6 mb-8 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <i className="fa-solid fa-gamepad"></i>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wide">{game.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Aluno: {student.name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
        >
          <i className="fa-solid fa-xmark text-[10px]"></i> Cancelar Atividade
        </button>
      </div>

      {!gameFinished ? (
        /* Tela de Execução da Rodada */
        <div className="space-y-8 z-10 relative">
          
          {/* Status Bar */}
          <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Rodada: <span className="text-indigo-400">{currentRound} / {totalRounds}</span>
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Nível ACE: <span className="text-purple-400">{level}</span>
              </span>
            </div>
            
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              Pontuação: <span className="text-amber-400">{score} XP</span>
            </div>
          </div>

          {/* Feedback reativo visual */}
          {feedbackMsg.text && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-300 ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' 
                : 'bg-rose-500/15 border-rose-500/25 text-rose-400'
            }`}>
              <i className={`fa-solid ${feedbackMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
              {feedbackMsg.text}
            </div>
          )}

          {/* Prompt/Pergunta do Jogo */}
          {gameState && (
            <div className="p-8 bg-slate-950/60 border border-slate-850 rounded-[2.5rem] text-center space-y-6">
              
              {/* Moldura ou lacuna visual do jogo */}
              {game.id.includes('letras') && (
                <div className="text-6xl font-black text-white tracking-widest bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xs mx-auto shadow-inner flex items-center justify-center gap-1">
                  {gameState.incompleta.split('').map((char: string, i: number) => (
                    <span 
                      key={i} 
                      className={`${char === '_' ? 'text-indigo-400 border-b-4 border-indigo-500/60 pb-1 px-2' : ''}`}
                    >
                      {char === '_' ? '?' : char}
                    </span>
                  ))}
                </div>
              )}

              {game.id.includes('formas') && (
                <div className="text-6xl font-black text-indigo-400 bg-slate-900 border border-slate-800 p-6 rounded-3xl w-28 h-28 mx-auto shadow-inner flex items-center justify-center">
                  {gameState.molde.split(' ')[0]}
                </div>
              )}

              {game.id.includes('sentimentos') && (
                <div className="text-3xl font-black text-indigo-300 max-w-lg mx-auto leading-relaxed">
                  "{gameState.situacao}"
                </div>
              )}

              <p className="text-slate-300 font-bold text-sm leading-relaxed max-w-xl mx-auto">
                {gameState.prompt}
              </p>
            </div>
          )}

          {/* Opções de Resposta Adaptativas */}
          {gameState && (
            <div className={`grid gap-4 max-w-md mx-auto ${
              difficultyModulation.numeroOpcoes >= 4 ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {gameState.opcoes.map((opcao: string, i: number) => {
                const isGrande = difficultyModulation.tamanhoAlvo === 'grande';
                const hasAjuste = difficultyModulation.ajusteVisualExtra;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opcao)}
                    className={`py-4 px-6 bg-slate-850/60 hover:bg-slate-800 border rounded-2xl font-black text-sm text-center transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                      accessibility.altoContraste 
                        ? 'border-yellow-400 text-yellow-300 bg-black hover:bg-yellow-400 hover:text-black font-extrabold text-base' 
                        : ehOpcaoCorreta(opcao) && hasAjuste 
                          ? 'border-indigo-500/70 text-indigo-300 bg-indigo-950/20' 
                          : 'border-slate-800 text-white hover:border-indigo-500/40 hover:text-indigo-400'
                    } ${
                      isGrande ? 'py-6 text-base md:text-lg border-2' : ''
                    }`}
                  >
                    {opcao}
                  </button>
                );
              })}
            </div>
          )}

          {/* Indicador de Modulação do ACE */}
          <div className="text-center pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/5 text-indigo-400/80 text-[8px] font-black uppercase rounded-lg border border-indigo-500/10 tracking-widest">
              <i className="fa-solid fa-microchip animate-spin duration-1000"></i>
              Adaptive Cognitive Engine (ACE) — Monitorando tempo e foco
            </span>
          </div>

        </div>
      ) : (
        /* Tela de Conclusão do Jogo (Resultados) */
        <div className="text-center space-y-8 z-10 relative animate-in zoom-in-95 duration-500 max-w-lg mx-auto py-8">
          
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-900 text-3xl shadow-xl shadow-amber-500/15 mx-auto animate-bounce">
            <i className="fa-solid fa-trophy"></i>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Atividade Concluída!</h2>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
              {student.name} finalizou {game.name}.
            </p>
          </div>

          {/* Placar XP */}
          <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-[2.5rem] max-w-xs mx-auto shadow-inner space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">XP Total Obtido</span>
            <span className="text-4xl font-black text-amber-400 tracking-tight">{score} XP</span>
          </div>

          {/* Métricas do Relatório de Sessão */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 bg-slate-850/50 border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Acertos / Erros</span>
              <span className="text-sm font-black text-slate-200">
                <span className="text-emerald-400">{metrics.current.acertos}</span>
                <span className="text-slate-600"> / </span>
                <span className="text-rose-400">{metrics.current.erros}</span>
              </span>
            </div>
            <div className="p-4 bg-slate-850/50 border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Tempo de Jogo</span>
              <span className="text-sm font-black text-slate-200">
                {Math.round(metrics.current.tempoTotalMs / 1000)} segundos
              </span>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4 w-full">
            <button
              onClick={() => {
                setGameFinished(false);
                setCurrentRound(1);
                setScore(0);
                setLevel(1);
                metrics.current = {
                  acertos: 0,
                  erros: 0,
                  tempoTotalMs: 0,
                  respostas: [],
                  cliquesEfetuados: 0,
                  errosSeguidos: 0,
                  acertosSeguidos: 0,
                };
                generateNewRound(1, 1, 3);
              }}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-750 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-left"></i> Jogar de Novo
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-900/15 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-chart-pie"></i> Ver Evolução
            </button>
          </div>

        </div>
      )}
    </div>
  );

  // Auxiliares internos para validação visual adaptativa
  function ehOpcaoCorreta(opcao: string): boolean {
    return gameState && opcao === gameState.respostaCorreta;
  }
}
