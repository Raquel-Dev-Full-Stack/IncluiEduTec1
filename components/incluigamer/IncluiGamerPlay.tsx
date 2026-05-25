import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Student, User } from '../../types';
import { GameDefinition } from './gamesData';
import { supabase } from '../../lib/supabaseClient';
import { PreGamerProfile } from './IncluiGamerPreProfile';

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
  preProfile?: PreGamerProfile | null;
  onClose: () => void;
  ageGroup?: string;
  level: number; // Nível ativo selecionado no Hub (Fase 5)
}

export default function IncluiGamerPlay({ game, student, user, accessibility, preProfile, onClose, ageGroup, level }: IncluiGamerPlayProps) {
  // Estados do Jogo
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [aceLevel, setAceLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });

  // Questão/Cenário atual do Jogo
  const [gameState, setGameState] = useState<any>(null);

  // Motor Etário Pedagógico (Fase 4): Timer Competitivo
  const [timeLeft, setTimeLeft] = useState<number>(12);

  // Evolução e Nível Interno Reativo (Fase 5)
  const [levelInterno, setLevelInterno] = useState<number>(level || 1);
  const [aproveitamentoFinal, setAproveitamentoFinal] = useState<number>(0);
  const [estrelasConquistadas, setEstrelasConquistadas] = useState<number>(0);
  const [badgesConquistadas, setBadgesConquistadas] = useState<string[]>([]);

  useEffect(() => {
    setLevelInterno(level || 1);
  }, [level]);

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

  // Falar comando se áudio descrição estiver ativa (respeitando hipersensibilidade sonora)
  const speakCommand = (text: string) => {
    const temHipersensibilidadeSonora = preProfile?.sensorial.hipersensibilidadeSonora;
    if (temHipersensibilidadeSonora) {
      console.log("[ACE] Hipersensibilidade sonora detectada. Omitindo comando sonoro.");
      return;
    }

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

    const bioma = game.bioma;
    const lvl = levelInterno;

    // ==========================================
    // 1. BIOMA: ALFABETIZAÇÃO
    // ==========================================
    if (bioma === 'alfabetizacao') {
      if (lvl === 1) {
        // Mecânica: caça_letras
        const palavrasDB = [
          { incompleta: 'B_LA', correta: 'O', incorretas: ['A', 'E', 'I'] },
          { incompleta: 'C_SA', correta: 'A', incorretas: ['E', 'I', 'O'] },
          { incompleta: 'L_VRO', correta: 'I', incorretas: ['A', 'E', 'U'] },
          { incompleta: 'F_LIZ', correta: 'E', incorretas: ['A', 'I', 'O'] },
        ];
        const item = palavrasDB[(roundNum - 1) % palavrasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Qual vogal completa a palavra ${item.incompleta}?`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, incompleta: item.incompleta, tipo: 'letras' });
      } 
      else if (lvl === 2) {
        // Mecânica: montar_silabas
        const silabasDB = [
          { palavra: 'CASA', lacuna: 'CA_ _', correta: 'SA', incorretas: ['TA', 'BA', 'LA'] },
          { palavra: 'BOLA', lacuna: 'BO_ _', correta: 'LA', incorretas: ['MA', 'CA', 'RA'] },
          { palavra: 'GATO', lacuna: 'GA_ _', correta: 'TO', incorretas: ['DO', 'PO', 'MO'] },
          { palavra: 'LADO', lacuna: 'LA_ _', correta: 'DO', incorretas: ['TE', 'PO', 'VE'] },
        ];
        const item = silabasDB[(roundNum - 1) % silabasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Complete o pedacinho (sílaba) que falta para formar a palavra ${item.palavra}: ${item.lacuna}`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, incompleta: item.lacuna, tipo: 'letras' });
      } 
      else {
        // Mecânica: completar_frases
        const frasesDB = [
          { frase: 'O gato gosta de beber ___', correta: 'leite 🥛', incorretas: ['pedra 🪨', 'papel 📄', 'tinta 🎨'] },
          { frase: 'O sol brilha forte no ___', correta: 'céu ☀️', incorretas: ['mar 🌊', 'chão 🪵', 'armário 🚪'] },
          { frase: 'Eu uso os meus ___ para ler livros.', correta: 'olhos 👀', incorretas: ['pés 👣', 'dentes 🦷', 'cabelos 💇'] },
        ];
        const item = frasesDB[(roundNum - 1) % frasesDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Escolha a palavra que faz mais sentido para completar a frase:`;
        speakCommand(item.frase);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, frase: item.frase, tipo: 'frase' });
      }
    }
    // ==========================================
    // 2. BIOMA: COGNITIVO
    // ==========================================
    else if (bioma === 'cognitivo') {
      if (lvl === 1) {
        // Mecânica: atencao_seletiva
        const formasDB = [
          { molde: '▲ Triângulo', correta: '▲', incorretas: ['●', '■', '★', '♥'] },
          { molde: '● Círculo', correta: '●', incorretas: ['▲', '■', '★', '♥'] },
          { molde: '■ Quadrado', correta: '■', incorretas: ['●', '▲', '★', '♥'] },
          { molde: '★ Estrela', correta: '★', incorretas: ['●', '■', '▲', '♥'] },
        ];
        const item = formasDB[(roundNum - 1) % formasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Ache a forma geométrica idêntica ao molde: ${item.molde}`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.molde, tipo: 'formas' });
      } 
      else if (lvl === 2) {
        // Mecânica: sequencia_logica
        const padroesDB = [
          { sequencia: '▲  ●  ▲  ●  ?', correta: '▲', incorretas: ['●', '■', '★'] },
          { sequencia: '■  ■  ★  ■  ■  ?', correta: '★', incorretas: ['■', '●', '▲'] },
          { sequencia: '🍎  🍌  🍎  🍌  ?', correta: '🍎', incorretas: ['🍌', '🍊', '🍇'] },
          { sequencia: '🟢  🔴  🟢  🔴  ?', correta: '🟢', incorretas: ['🔴', '🟡', '🔵'] },
        ];
        const item = padroesDB[(roundNum - 1) % padroesDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Observe o padrão visual e responda: qual figura completa a sequência?`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'sequencia' });
      } 
      else {
        // Mecânica: memoria_visual
        const memoriasDB = [
          { sequencia: '★  ●  ■', correta: '★', incorretas: ['●', '■', '▲'] },
          { sequencia: '🍎  🍌  🍊', correta: '🍎', incorretas: ['🍌', '🍊', '🍇'] },
          { sequencia: '▲  ■  ●', correta: '▲', incorretas: ['■', '●', '★'] },
        ];
        const item = memoriasDB[(roundNum - 1) % memoriasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Memorize a sequência que vai aparecer por um instante: ${item.sequencia}`;
        speakCommand(prompt);
        
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'memoria_piscar' });
        
        setTimeout(() => {
          setGameState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              prompt: 'Qual figura apareceu na primeira posição da sequência que você acabou de ver?',
              tipo: 'memoria_perguntar'
            };
          });
          speakCommand("Qual figura apareceu na primeira posição?");
        }, 2200);
      }
    }
    // ==========================================
    // 3. BIOMA: EMOÇÕES
    // ==========================================
    else if (bioma === 'emocoes') {
      if (lvl === 1) {
        // Mecânica: reconhecimento_facial
        const carinhasDB = [
          { emoji: '😊', correta: '😊 Feliz', incorretas: ['😢 Triste', '😡 Bravo', '😱 Assustado'] },
          { emoji: '😢', correta: '😢 Triste', incorretas: ['😊 Feliz', '😡 Bravo', '😱 Assustado'] },
          { emoji: '😡', correta: '😡 Bravo', incorretas: ['😊 Feliz', '😢 Triste', '😱 Assustado'] },
          { emoji: '😱', correta: '😱 Assustado', incorretas: ['😊 Feliz', '😢 Triste', '😡 Bravo'] },
        ];
        const item = carinhasDB[(roundNum - 1) % carinhasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Qual sentimento esta carinha representa? ${item.emoji}`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, emoji: item.emoji, tipo: 'emocoes' });
      } 
      else if (lvl === 2) {
        // Mecânica: interpretacao_emocional
        const sentimentosDB = [
          { situacao: 'Quando ganho um abraço de um amigo, eu me sinto...', correta: '😊 Feliz', incorretas: ['😢 Triste', '😡 Bravo', '😱 Assustado'] },
          { situacao: 'Quando meu brinquedo favorito quebra, eu fico...', correta: '😢 Triste', incorretas: ['😊 Feliz', '😡 Bravo', '😱 Assustado'] },
          { situacao: 'Se escuto um barulho muito forte no escuro, eu fico...', correta: '😱 Assustado', incorretas: ['😊 Feliz', '😢 Triste', '😡 Bravo'] },
          { situacao: 'Quando alguém pega meu lápis sem pedir, eu fico...', correta: '😡 Bravo', incorretas: ['😊 Feliz', '😢 Triste', '😱 Assustado'] },
        ];
        const item = sentimentosDB[(roundNum - 1) % sentimentosDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = item.situacao;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, situacao: item.situacao, tipo: 'sentimentos' });
      } 
      else {
        // Mecânica: empatia_guiada
        const escolhasDB = [
          { dilema: 'Se vejo um amigo cair e se machucar no parquinho, eu devo...', correta: 'Ajudá-lo a levantar e chamar ajuda 🤝', incorretas: ['Ignorar e continuar correndo 🏃', 'Dar risada do tropeço dele 🗣️'] },
          { dilema: 'Se um colega quer brincar com o mesmo brinquedo que eu, eu posso...', correta: 'Propor brincar juntos ou dividir o tempo 🧸', incorretas: ['Esconder o brinquedo para brincar só 🔒', 'Gritar que o brinquedo é meu 😡'] },
          { dilema: 'Se eu quebro um objeto de um amigo sem querer, eu devo...', correta: 'Pedir desculpas e contar a verdade 🤝', incorretas: ['Esconder o objeto quebrado 🤫', 'Culpar outra pessoa que estava perto 👈'] },
        ];
        const item = escolhasDB[(roundNum - 1) % escolhasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = item.dilema;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, dilema: item.dilema, tipo: 'sentimentos' });
      }
    }
    // ==========================================
    // 4. BIOMA: SENSORIAL
    // ==========================================
    else if (bioma === 'sensorial') {
      if (lvl === 1) {
        // Mecânica: causa_efeito_sonora
        const sonsDB = [
          { som: 'Chuva caindo de mansinho 🌧️', correta: '🌧️ Som de Chuva', incorretas: ['🐦 Canto de Pássaro', '🌊 Ondas do Mar'] },
          { som: 'Canto alegre de um passarinho 🐦', correta: '🐦 Canto de Pássaro', incorretas: ['🌧️ Som de Chuva', '🌊 Ondas do Mar'] },
          { som: 'Ondas do mar que vêm e vão 🌊', correta: '🌊 Ondas do Mar', incorretas: ['🌧️ Som de Chuva', '🐦 Canto de Pássaro'] },
        ];
        const item = sonsDB[(roundNum - 1) % sonsDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Toque no botão correspondente para orquestrar o som de: ${item.som}`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.som, tipo: 'sons' });
      } 
      else if (lvl === 2) {
        // Mecânica: cores_sensoriais
        const coresDB = [
          { pedido: 'Toque na cor que transmite mais calma e paz 🟢', correta: '🟢 Verde Pastel', incorretas: ['🔴 Vermelho Forte', '⚡ Amarelo Piscante'] },
          { pedido: 'Toque na cor que parece o céu limpo e tranquilo 🔵', correta: '🔵 Azul Suave', incorretas: ['⚫ Preto Escuro', '🟧 Laranja Vibrante'] },
          { pedido: 'Toque na cor que lembra um abraço caloroso e confortável 🌸', correta: '🌸 Rosa Claro', incorretas: ['🟤 Marrom Opaco', '💀 Roxo Elétrico'] },
        ];
        const item = coresDB[(roundNum - 1) % coresDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = item.pedido;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.pedido, tipo: 'sons' });
      } 
      else {
        // Mecânica: coordenacao_motora
        const alvosDB = [
          { instrucao: 'Tente tocar no balão azul que está flutuando bem alto! 🎈', correta: '🎈 Balão Azul Alto', incorretas: ['🎈 Balão Pequeno', '🎈 Balão Lento'] },
          { instrucao: 'Toque na bolha brilhante que pisca rápido! 🫧', correta: '🫧 Bolha Rápida', incorretas: ['🫧 Bolha Parada', '🫧 Bolha Lenta'] },
          { instrucao: 'Pegue a estrela cadente dourada! 🌠', correta: '🌠 Estrela Cadente', incorretas: ['🌠 Estrela Parada', '🌠 Nuvem Parada'] },
        ];
        const item = alvosDB[(roundNum - 1) % alvosDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = item.instrucao;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.instrucao, tipo: 'sons' });
      }
    }
    // ==========================================
    // 5. BIOMA: MATEMÁTICO
    // ==========================================
    else {
      if (lvl === 1) {
        // Mecânica: contar_objetos
        const objetosDB = [
          { conjunto: '♥  ♥  ♥', quantidade: '3', incorretas: ['2', '4', '5'] },
          { conjunto: '⭐  ⭐  ⭐  ⭐', quantidade: '4', incorretas: ['3', '5', '2'] },
          { conjunto: '🍎  🍎', quantidade: '2', incorretas: ['1', '3', '4'] },
          { conjunto: '🍎  🍎  🍎  🍎  🍎', quantidade: '5', incorretas: ['4', '3', '6'] },
        ];
        const item = objetosDB[(roundNum - 1) % objetosDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.quantidade].sort(() => Math.random() - 0.5);
        const prompt = `Quantos elementos lúdicos estão desenhados na caixa:  ${item.conjunto} ?`;
        speakCommand("Quantos elementos estão desenhados?");
        setGameState({ prompt, respostaCorreta: item.quantidade, opcoes, conjunto: item.conjunto, tipo: 'matematica' });
      } 
      else if (lvl === 2) {
        // Mecânica: sequencia_numerica
        const sequenciasDB = [
          { sequencia: '1,  2,  ?,  4,  5', correta: '3', incorretas: ['0', '5', '6'] },
          { sequencia: '4,  5,  6,  ?,  8', correta: '7', incorretas: ['3', '8', '9'] },
          { sequencia: '2,  4,  ?,  8,  10', correta: '6', incorretas: ['5', '7', '9'] },
          { sequencia: '10,  9,  ?,  7,  6', correta: '8', incorretas: ['9', '7', '5'] },
        ];
        const item = sequenciasDB[(roundNum - 1) % sequenciasDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = `Qual número completa a trilha numérica: ${item.sequencia}`;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'matematica' });
      } 
      else {
        // Mecânica: mini_desafios
        const operacoesDB = [
          { desafio: 'Se eu tenho 2 maçãs 🍎🍎 e ganho mais 1 maçã 🍎, com quantas maçãs eu fico?', correta: '3 maçãs 🍎🍎🍎', incorretas: ['2 maçãs 🍎🍎', '4 maçãs 🍎🍎🍎🍎'] },
          { desafio: 'Tenho 3 estrelas ⭐⭐⭐ e ganho mais 2 estrelas ⭐⭐, qual o total?', correta: '5 estrelas ⭐⭐⭐⭐⭐', incorretas: ['4 estrelas ⭐⭐⭐⭐', '6 estrelas ⭐⭐⭐⭐⭐⭐'] },
          { desafio: 'Se eu tenho 4 corações ♥♥♥♥ e perco 1 coração ♥, com quantos eu fico?', correta: '3 corações ♥♥♥', incorretas: ['2 corações ♥♥', '4 corações ♥♥♥•'] },
        ];
        const item = operacoesDB[(roundNum - 1) % operacoesDB.length];
        const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
        const prompt = item.desafio;
        speakCommand(prompt);
        setGameState({ prompt, respostaCorreta: item.correta, opcoes, desafio: item.desafio, tipo: 'sentimentos' });
      }
    }
  };

  useEffect(() => {
    let opcoesIniciais = 3;
    let tamanho = 'normal';
    let ajusteVisual = false;
    let tempoLimite = accessibility.tempoEstendido ? 20 : 12;
    let rodadasCalculadas = 5;

    const activeAgeGroup = ageGroup || game.ageGroup;
    const lvl = levelInterno;
    
    if (activeAgeGroup === '0-3') {
      rodadasCalculadas = 3;
      opcoesIniciais = 2;
      tamanho = 'grande';
    } else if (activeAgeGroup === '4-5') {
      rodadasCalculadas = 3;
      opcoesIniciais = 3;
    } else if (activeAgeGroup === '6-8') {
      rodadasCalculadas = 5;
      opcoesIniciais = 3;
    } else if (activeAgeGroup === '9-12') {
      rodadasCalculadas = 7;
      opcoesIniciais = 4;
    } else if (activeAgeGroup === '13+') {
      rodadasCalculadas = 7;
      opcoesIniciais = 4;
    }

    setTotalRounds(rodadasCalculadas);

    if (preProfile) {
      const sensorVisual = preProfile.sensorial.hipersensibilidadeVisual;
      const toleranciaEstimulos = preProfile.sensorial.toleranciaEstimulos;
      ajusteVisual = sensorVisual || toleranciaEstimulos <= 2;
      const motoraFina = preProfile.coordenacao.motoraFina;
      const touchscreen = preProfile.coordenacao.touchscreen;
      const mouse = preProfile.coordenacao.mouse;
      tamanho = (motoraFina < 3 || (!touchscreen && mouse)) ? 'grande' : (activeAgeGroup === '0-3' ? 'grande' : 'normal');

      if (preProfile.comunicacao.compreensao <= 2) opcoesIniciais = Math.min(opcoesIniciais, 2);
      const tempoFoco = preProfile.comportamental.tempoFocoMinutos;
      const frustracaoAlta = preProfile.comportamental.frustracaoAlta;
      
      if (tempoFoco < 5) setTotalRounds(3);
      tempoLimite = (accessibility.tempoEstendido || tempoFoco < 5 || frustracaoAlta) ? 25 : (activeAgeGroup === '9-12' || activeAgeGroup === '13+' ? 15 : 12);
      ajusteVisual = ajusteVisual || frustracaoAlta;
    } else {
      if (activeAgeGroup === '9-12' || activeAgeGroup === '13+') tempoLimite = 15;
    }

    setDifficultyModulation({
      numeroOpcoes: opcoesIniciais,
      tempoLimiteS: tempoLimite,
      tamanhoAlvo: tamanho,
      ajusteVisualExtra: ajusteVisual,
    });

    generateNewRound(1, lvl, opcoesIniciais);
  }, [preProfile, accessibility.tempoEstendido, ageGroup, game.ageGroup, levelInterno]);

  const activeAgeGroup = ageGroup || game.ageGroup;
  const hideTimer = activeAgeGroup === '0-3' || activeAgeGroup === '4-5' || accessibility.modoCalmante;

  useEffect(() => {
    if (gameFinished || hideTimer) return;
    setTimeLeft(difficultyModulation.tempoLimiteS);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentRound, difficultyModulation.tempoLimiteS, gameFinished, hideTimer, levelInterno]);

  useEffect(() => {
    if (timeLeft === 0 && !gameFinished && !hideTimer) {
      metrics.current.erros++;
      metrics.current.errosSeguidos++;
      metrics.current.acertosSeguidos = 0;
      errorsInCurrentRound.current++;
      setFeedbackMsg({ text: 'Tempo esgotado! Vamos tentar outra questão.', type: 'info' });
      speakCommand("O tempo acabou. Vamos tentar mais uma vez.");
      setTimeout(() => {
        setFeedbackMsg({ text: '', type: null });
        if (currentRound < totalRounds) {
          setCurrentRound(prev => prev + 1);
          generateNewRound(currentRound + 1, levelInterno, difficultyModulation.numeroOpcoes);
        } else {
          finishGame();
        }
      }, 2000);
    }
  }, [timeLeft, gameFinished, hideTimer]);

  const handleSelectOption = (opcao: string) => {
    metrics.current.cliquesEfetuados++;
    const tempoReacao = Date.now() - startTime.current;
    const ehCorreta = opcao === gameState.respostaCorreta;
    if (ehCorreta) {
      metrics.current.acertos++;
      metrics.current.acertosSeguidos++;
      metrics.current.errosSeguidos = 0;
      setScore(prev => prev + Math.max(10, 50 - Math.floor(tempoReacao / 1000) * 2));
      const msgReforco = preProfile?.comportamental.reforcoPositivo ? 'Incrível! Você é uma estrela brilhante! ⭐🎉' : 'Excelente! Resposta correta! 🎉';
      speakCommand(preProfile?.comportamental.reforcoPositivo ? "Incrível! Você acertou e brilhou!" : "Muito bem! Acertou.");
      setFeedbackMsg({ text: msgReforco, type: 'success' });
      metrics.current.respostas.push({ rodada: currentRound, correta: true, tempoReacaoMs: tempoReacao, errosTentativa: errorsInCurrentRound.current });
      metrics.current.tempoTotalMs += tempoReacao;
      let novoNumOpcoes = difficultyModulation.numeroOpcoes;
      if (metrics.current.acertosSeguidos >= 3) {
        if (difficultyModulation.numeroOpcoes < 5) novoNumOpcoes = difficultyModulation.numeroOpcoes + 1;
        setAceLevel(prev => prev + 1);
        metrics.current.acertosSeguidos = 0;
      }
      setDifficultyModulation(prev => ({ ...prev, numeroOpcoes: novoNumOpcoes, ajusteVisualExtra: false }));
      setTimeout(() => {
        setFeedbackMsg({ text: '', type: null });
        if (currentRound < totalRounds) {
          setCurrentRound(prev => prev + 1);
          generateNewRound(currentRound + 1, levelInterno, novoNumOpcoes);
        } else {
          finishGame();
        }
      }, 1500);
    } else {
      metrics.current.erros++;
      metrics.current.errosSeguidos++;
      metrics.current.acertosSeguidos = 0;
      errorsInCurrentRound.current++;
      const msgFrustracao = preProfile?.comportamental.frustracaoAlta ? 'Tudo bem errar! Vamos tentar juntos novamente? ✨' : 'Ops! Vamos tentar de novo? Você consegue!';
      speakCommand(preProfile?.comportamental.frustracaoAlta ? "Sem problemas. Vamos tentar juntos." : "Tente mais uma vez.");
      setFeedbackMsg({ text: msgFrustracao, type: 'error' });
      let novoNumOpcoes = difficultyModulation.numeroOpcoes;
      let novoTamanho = difficultyModulation.tamanhoAlvo;
      let visualExtra = difficultyModulation.ajusteVisualExtra;
      if (metrics.current.errosSeguidos >= 2 || errorsInCurrentRound.current >= 2) {
        if (difficultyModulation.numeroOpcoes > 2) novoNumOpcoes = difficultyModulation.numeroOpcoes - 1;
        novoTamanho = 'grande';
        visualExtra = true;
        metrics.current.errosSeguidos = 0;
      }
      setDifficultyModulation(prev => ({ ...prev, numeroOpcoes: novoNumOpcoes, tamanhoAlvo: novoTamanho, ajusteVisualExtra: visualExtra }));
      setTimeout(() => {
        setFeedbackMsg({ text: '', type: null });
        setGameState(prev => {
          if (!prev) return null;
          const incorretas = prev.opcoes.filter((o: string) => o !== prev.respostaCorreta);
          const novasIncorretas = incorretas.slice(0, novoNumOpcoes - 1);
          const novasOpcoes = [...novasIncorretas, prev.respostaCorreta].sort(() => Math.random() - 0.5);
          return { ...prev, opcoes: novasOpcoes };
        });
      }, 1500);
    }
  };

  const finishGame = async () => {
    setGameFinished(true);
    speakCommand("Parabéns! Atividade concluída com sucesso.");
    const totalReaction = metrics.current.respostas.reduce((acc, r) => acc + r.tempoReacaoMs, 0);
    const avgReactionS = metrics.current.respostas.length > 0 ? (totalReaction / metrics.current.respostas.length / 1000) : 5;
    let engajamento = Math.max(30, 100 - (metrics.current.erros * 8) - (avgReactionS * 3));
    let foco = Math.max(20, 100 - (errorsInCurrentRound.current * 10) - (metrics.current.erros * 5));
    let autonomia = Math.max(30, 100 - (difficultyModulation.tamanhoAlvo === 'grande' ? 25 : 0) - (metrics.current.erros * 4));
    let coordenacao = Math.max(40, 100 - (avgReactionS * 6) - (errorsInCurrentRound.current * 4));
    let emocional = Math.max(50, 100 - (metrics.current.errosSeguidos * 15));
    const aproveitamento = (metrics.current.acertos / totalRounds) * 100;
    setAproveitamentoFinal(Math.round(aproveitamento));
    let desenvolvimento = Math.max(10, aproveitamento);

    let estrelas = 1;
    if (aproveitamento >= 85) estrelas = 3;
    else if (aproveitamento >= 60) estrelas = 2;
    setEstrelasConquistadas(estrelas);

    const badges: string[] = [];
    const bioma = game.bioma;
    if (aproveitamento >= 60) {
      if (bioma === 'alfabetizacao') badges.push(levelInterno === 3 ? '🏆 Mestre das Palavras 📚' : 'Consciência Fonológica 🗣️');
      else if (bioma === 'cognitivo') badges.push(levelInterno === 3 ? '🏆 Detetive da Lógica 🧠' : 'Mente de Aço ⚡');
      else if (bioma === 'emocoes') badges.push(levelInterno === 3 ? '🏆 Embaixador da Empatia 🤝' : 'Guardião Socioemocional ❤️');
      else if (bioma === 'sensorial') badges.push(levelInterno === 3 ? '🏆 Precisão Táctil 🎯' : 'Harmonia Sensorial 🎵');
      else badges.push(levelInterno === 3 ? '🏆 Pensador Matemático 📐' : 'Explorador dos Números 🔢');
    }
    setBadgesConquistadas(badges);

    const developedSkills = game.bnccSkills.map(code => ({ code, proficiency: Math.round(desenvolvimento), date: new Date().toISOString().split('T')[0] }));
    const scoresPayload = {
      student_id: student.id, foco: Math.round(foco), autonomia: Math.round(autonomia), emocional: Math.round(emocional), coordenacao: Math.round(coordenacao), engajamento: Math.round(engajamento), desenvolvimento_pedagogico: Math.round(desenvolvimento), total_play_time: Math.round(metrics.current.tempoTotalMs / 1000), skills_developed: developedSkills, last_updated: new Date().toISOString(), municipio_id: user.municipio_id, school_id: user.schoolId
    };
    const behaviorLogPayload = {
      student_id: student.id, game_id: game.id, session_id: crypto.randomUUID(), event_type: 'sessao_concluida', event_data: { acertos: metrics.current.acertos, erros: metrics.current.erros, tempoTotalMs: metrics.current.tempoTotalMs, level_final: levelInterno, aproveitamento, estrelas, scores: scoresPayload }, created_by: user.id, municipio_id: user.municipio_id, school_id: user.schoolId
    };
    const proxNivelLiberado = aproveitamento >= 60 ? Math.min(3, levelInterno + 1) : levelInterno;
    const progressPayload = { student_id: student.id, game_id: game.id, current_level: proxNivelLiberado, stars_earned: estrelas, completed: proxNivelLiberado === 3 && aproveitamento >= 60, last_played_at: new Date().toISOString(), municipio_id: user.municipio_id, school_id: user.schoolId };

    try {
      const { data: existingProgress } = await supabase.from('game_progress').select('id, current_level, stars_earned').eq('student_id', student.id).eq('game_id', game.id).maybeSingle();
      if (existingProgress) await supabase.from('game_progress').update({ current_level: Math.max(existingProgress.current_level, progressPayload.current_level), stars_earned: Math.max(existingProgress.stars_earned, progressPayload.stars_earned), completed: progressPayload.completed || existingProgress.current_level >= 3, last_played_at: progressPayload.last_played_at }).eq('id', existingProgress.id);
      else await supabase.from('game_progress').insert([progressPayload]);
      await supabase.from('player_behavior_logs').insert([behaviorLogPayload]);
      const { data: existingScore } = await supabase.from('cognitive_scores').select('id, skills_developed').eq('student_id', student.id).maybeSingle();
      if (existingScore) {
        const oldSkills = Array.isArray(existingScore.skills_developed) ? existingScore.skills_developed : [];
        const mergedSkills = [...oldSkills];
        developedSkills.forEach(newSkill => {
          const idx = mergedSkills.findIndex(s => s.code === newSkill.code);
          if (idx >= 0) mergedSkills[idx] = { ...mergedSkills[idx], proficiency: Math.round((mergedSkills[idx].proficiency + newSkill.proficiency) / 2), date: newSkill.date };
          else mergedSkills.push(newSkill);
        });
        await supabase.from('cognitive_scores').update({ ...scoresPayload, skills_developed: mergedSkills }).eq('id', existingScore.id);
      } else await supabase.from('cognitive_scores').insert([scoresPayload]);
    } catch (err) {
      const localProgressKey = `incluigamer_progress_map_${student.id}`;
      const localProgress = localStorage.getItem(localProgressKey);
      let progressMap: Record<string, any> = {};
      if (localProgress) progressMap = JSON.parse(localProgress);
      const currentLocal = progressMap[game.id] || { current_level: 1, stars_earned: 0, completed: false };
      progressMap[game.id] = { current_level: Math.max(currentLocal.current_level, progressPayload.current_level), stars_earned: Math.max(currentLocal.stars_earned, progressPayload.stars_earned), completed: progressPayload.completed || currentLocal.current_level >= 3 };
      localStorage.setItem(localProgressKey, JSON.stringify(progressMap));
      const localLogsKey = `incluigamer_progress_${student.id}`;
      const oldProgress = JSON.parse(localStorage.getItem(localLogsKey) || '[]');
      oldProgress.push(behaviorLogPayload);
      localStorage.setItem(localLogsKey, JSON.stringify(oldProgress));
    }
  };

  return (
    <div className={`p-10 rounded-[3rem] border shadow-2xl relative overflow-hidden transition-colors duration-500 ${
      accessibility.modoCalmante 
        ? 'bg-slate-950/90 border-slate-900 text-slate-300' 
        : activeAgeGroup === '0-3'
          ? 'bg-[#0f1b29] border-sky-950/30 text-sky-200'
          : activeAgeGroup === '9-12' || activeAgeGroup === '13+'
            ? 'bg-slate-950 border-purple-500/25 shadow-purple-500/5 text-purple-100'
            : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
        activeAgeGroup === '0-3'
          ? 'bg-sky-500/5'
          : activeAgeGroup === '9-12' || activeAgeGroup === '13+'
            ? 'bg-purple-600/10'
            : 'bg-gradient-to-tr from-indigo-500/10 to-purple-500/10'
      }`}></div>

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
                Nível ACE: <span className="text-purple-400">{aceLevel}</span>
              </span>
            </div>
            
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              Pontuação: <span className="text-amber-400">{score} XP</span>
            </div>
          </div>

          {/* Barra Dinâmica do Timer Competitivo (Fase 4) */}
          {!hideTimer && (
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / difficultyModulation.tempoLimiteS) * 100}%` }}
              ></div>
            </div>
          )}

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
            <div className="p-8 bg-slate-950/60 border border-slate-850 rounded-[2.5rem] text-center space-y-6 shadow-inner">
              
              {/* Renderizadores de Caixas lúdicas especializadas por tipo de mecânica (Fase 5) */}
              {gameState.tipo === 'letras' && (
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

              {gameState.tipo === 'formas' && (
                <div className="text-6xl font-black text-indigo-400 bg-slate-900 border border-slate-800 p-6 rounded-3xl w-28 h-28 mx-auto shadow-inner flex items-center justify-center">
                  {gameState.molde.split(' ')[0]}
                </div>
              )}

              {gameState.tipo === 'sequencia' && (
                <div className="text-4xl font-black text-indigo-350 max-w-md mx-auto bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-inner tracking-wider flex items-center justify-center">
                  {gameState.sequencia}
                </div>
              )}

              {gameState.tipo === 'memoria_piscar' && (
                <div className="text-5xl font-black text-purple-300 max-w-md mx-auto bg-purple-950/20 border border-purple-500/25 p-6 rounded-3xl shadow-inner tracking-widest flex items-center justify-center animate-pulse">
                  {gameState.sequencia}
                </div>
              )}

              {gameState.tipo === 'memoria_perguntar' && (
                <div className="text-5xl font-black text-slate-500 max-w-md mx-auto bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-inner tracking-widest flex items-center justify-center">
                  🔒 Ocultado!
                </div>
              )}

              {gameState.tipo === 'emocoes' && (
                <div className="text-7xl font-black bg-slate-900 border border-slate-800 w-28 h-28 rounded-3xl mx-auto shadow-inner flex items-center justify-center animate-bounce">
                  {gameState.emoji}
                </div>
              )}

              {gameState.tipo === 'sentimentos' && (
                <div className="text-2xl font-black text-indigo-300 max-w-lg mx-auto leading-relaxed">
                  "{gameState.prompt}"
                </div>
              )}

              {gameState.tipo === 'sons' && (
                <div className="text-5xl font-black text-emerald-400 bg-slate-900 border border-slate-800 p-6 rounded-3xl w-28 h-28 mx-auto shadow-inner flex items-center justify-center">
                  {gameState.molde.slice(-2)}
                </div>
              )}

              {gameState.tipo === 'matematica' && (
                <div className="text-3xl font-black text-amber-300 max-w-md mx-auto bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-inner tracking-wider flex flex-col gap-2 items-center justify-center">
                  {gameState.conjunto || gameState.sequencia}
                </div>
              )}

              <p className="text-slate-350 font-bold text-sm leading-relaxed max-w-xl mx-auto pt-2">
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
                    className={`py-4 px-6 rounded-2xl font-black text-sm text-center transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                      accessibility.altoContraste 
                        ? 'border-yellow-400 text-yellow-300 bg-black hover:bg-yellow-400 hover:text-black font-extrabold text-base border-2' 
                        : activeAgeGroup === '0-3'
                          ? 'bg-sky-950/40 hover:bg-sky-900/60 border-sky-900/50 text-sky-200 hover:border-sky-400/40 border'
                          : activeAgeGroup === '9-12' || activeAgeGroup === '13+'
                            ? 'bg-slate-950/60 hover:bg-purple-950/20 border-slate-800 hover:border-purple-500/50 hover:shadow-purple-500/10 text-purple-200/90 border'
                            : ehOpcaoCorreta(opcao) && hasAjuste 
                              ? 'border-indigo-500/70 text-indigo-300 bg-indigo-950/20 border' 
                              : 'bg-slate-850/60 hover:bg-slate-800 border border-slate-800 text-white hover:border-indigo-500/40 hover:text-indigo-400'
                    } ${
                      isGrande ? 'py-6 px-8 text-base md:text-lg border-2' : ''
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
        /* Tela de Conclusão do Jogo (Evolução Premium - Fase 5) */
        <div className="text-center space-y-8 z-10 relative animate-in zoom-in-95 duration-500 max-w-lg mx-auto py-8">
          
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-900 text-3xl shadow-xl shadow-amber-500/15 mx-auto animate-bounce">
            <i className="fa-solid fa-trophy"></i>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Atividade Concluída!</h2>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
              {student.name} finalizou {game.name} — Nível {levelInterno}
            </p>
          </div>

          {/* Placar XP & Estrelas */}
          <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-[2.5rem] max-w-xs mx-auto shadow-inner space-y-3">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Avaliação do Desempenho</span>
            
            {/* Estrelas conquistadas */}
            <div className="flex gap-2 justify-center text-3xl text-amber-400">
              {Array.from({ length: 3 }).map((_, idx) => (
                <i 
                  key={idx} 
                  className={`fa-star transition-all duration-705 ${
                    idx < estrelasConquistadas ? 'fa-solid scale-110 animate-bounce' : 'fa-regular opacity-30'
                  }`}
                ></i>
              ))}
            </div>

            <span className="text-3xl font-black text-amber-400 tracking-tight block">{score} XP</span>
          </div>

          {/* Metodologia de Habilidades BNCC Conquistadas */}
          <div className="bg-slate-950/40 p-5 border border-slate-850 rounded-2xl text-left space-y-3">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Competências Curriculares</span>
            
            {/* Barra de Progresso da BNCC */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">Progresso Curricular BNCC</span>
                <span className="text-indigo-400 font-black">{aproveitamentoFinal}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${aproveitamentoFinal}%` }}
                ></div>
              </div>
            </div>

            {/* Badges de Conquistas e Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {game.bnccSkills.map(code => (
                <span key={code} className="bg-indigo-950 text-indigo-300 border border-indigo-900/35 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">{code}</span>
              ))}
              
              {badgesConquistadas.map(badge => (
                <span key={badge} className="bg-purple-950/40 text-purple-300 border border-purple-500/20 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <i className="fa-solid fa-medal"></i> {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4 w-full flex-col sm:flex-row">
            <button
              onClick={() => {
                setGameFinished(false);
                setCurrentRound(1);
                setScore(0);
                metrics.current = {
                  acertos: 0,
                  erros: 0,
                  tempoTotalMs: 0,
                  respostas: [],
                  cliquesEfetuados: 0,
                  errosSeguidos: 0,
                  acertosSeguidos: 0,
                };
                generateNewRound(1, levelInterno, 3);
              }}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-750 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-left"></i> Jogar de Novo
            </button>

            {aproveitamentoFinal >= 60 && levelInterno < 3 ? (
              <button
                onClick={() => {
                  const proximoLvl = levelInterno + 1;
                  setLevelInterno(proximoLvl);
                  setGameFinished(false);
                  setCurrentRound(1);
                  setScore(0);
                  metrics.current = {
                    acertos: 0,
                    erros: 0,
                    tempoTotalMs: 0,
                    respostas: [],
                    cliquesEfetuados: 0,
                    errosSeguidos: 0,
                    acertosSeguidos: 0,
                  };
                  generateNewRound(1, proximoLvl, 3);
                }}
                className="flex-1 py-4 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-900/15 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-angles-right"></i> Avançar para o Nível {levelInterno + 1}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-900/15 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check animate-bounce"></i> Fechar e Voltar
              </button>
            )}
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
