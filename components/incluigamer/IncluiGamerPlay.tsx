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
  const [gameVolume, setGameVolume] = useState<number>(0.6); // Inicia em 60%

  // Síntese Dinâmica de Efeitos Sonoros lúdicos (Web Audio API)
  const playSynthesizedSound = (soundType: 'chuva' | 'passaro' | 'mar' | 'acerto' | 'erro') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const temHipersensibilidadeSonora = preProfile?.sensorial.hipersensibilidadeSonora;
      // Hipersensibilidade sonora omite efeitos sonoros da natureza para conforto sensorial
      if (temHipersensibilidadeSonora && soundType !== 'acerto' && soundType !== 'erro') {
        console.log("[ACE Audio] Hipersensibilidade sonora ativa. Omitindo som lúdico.");
        return;
      }

      const volumeNode = ctx.createGain();
      // Calibração de volume para evitar sobrecarga auditiva, controlado pelo slider do usuário
      const calibraçãoAcessibilidade = temHipersensibilidadeSonora ? 0.25 : (accessibility.modoCalmante ? 0.5 : 1.0);
      const volumeFinal = gameVolume * calibraçãoAcessibilidade * 0.75; 
      volumeNode.gain.setValueAtTime(volumeFinal, ctx.currentTime);
      volumeNode.connect(ctx.destination);
      
      if (soundType === 'acerto') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.connect(volumeNode);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } 
      else if (soundType === 'erro') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);
        gain.connect(volumeNode);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
      else if (soundType === 'chuva') {
        const bufferSize = ctx.sampleRate * 2.0; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(0.6, ctx.currentTime);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        
        noiseSource.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(volumeNode);
        noiseSource.start();
      } 
      else if (soundType === 'passaro') {
        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startTime = now + i * 0.18;
          
          osc.frequency.setValueAtTime(1400 + Math.random() * 300, startTime);
          osc.frequency.exponentialRampToValueAtTime(2800 + Math.random() * 400, startTime + 0.1);
          
          gain.connect(volumeNode);
          osc.connect(gain);
          gain.gain.setValueAtTime(0.06, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
          
          osc.start(startTime);
          osc.stop(startTime + 0.12);
        }
      } 
      else if (soundType === 'mar') {
        const bufferSize = ctx.sampleRate * 3.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        
        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.001, ctx.currentTime);
        waveGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.0);
        waveGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
        
        noiseSource.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(volumeNode);
        
        noiseSource.start();
      }
    } catch (err) {
      console.warn("[ACE Audio] Falha silenciosa ao sintetizar áudio nativo:", err);
    }
  };

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

  // Silenciar áudio ao fechar/desmontar o componente do jogo
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

    if (!accessibility.audioDescricao) {
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.volume = gameVolume; // Sincroniza com o volume do jogo!
        utterance.onerror = (e) => {
          console.warn("[ACE Speech] Erro na síntese nativa, acionando fallback:", e);
          playFallbackTTS(text);
        };
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[ACE Speech] Exceção na síntese nativa, acionando fallback:", err);
        playFallbackTTS(text);
      }
    } else {
      playFallbackTTS(text);
    }
  };

  const playFallbackTTS = (text: string) => {
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=${encodeURIComponent(text)}`;
      const audio = new Audio(ttsUrl);
      audio.volume = gameVolume;
      audio.play().catch(err => {
        console.warn("[ACE Fallback TTS] Navegador bloqueou áudio do fallback:", err);
      });
    } catch (fallbackErr) {
      console.error("[ACE Fallback TTS] Falha ao executar áudio de fallback:", fallbackErr);
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
      const gameId = game.id;

      // ----------------------------------------------------
      // JOGO: Som das Palavras (som_palavras)
      // ----------------------------------------------------
      if (gameId === 'som_palavras') {
        if (lvl === 1) {
          const sonsDB = [
            { prompt: 'Qual letra tem o som de /aaa/ como no início de "Abelha"? 🐝', correta: 'A', incorretas: ['E', 'O', 'I'] },
            { prompt: 'Qual letra tem o som de /ooo/ como no início de "Ovo"? 🥚', correta: 'O', incorretas: ['A', 'U', 'E'] },
            { prompt: 'Qual letra inicia o som de "Igreja"? ⛪', correta: 'I', incorretas: ['E', 'A', 'U'] },
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '_', tipo: 'letras' });
        } 
        else if (lvl === 2) {
          const sonsDB = [
            { prompt: 'Qual som silábico inicia a palavra "Bola"? ⚽', correta: 'BO', incorretas: ['PA', 'LI', 'MA'] },
            { prompt: 'Qual som silábico inicia a palavra "Cachorro"? 🐶', correta: 'CA', incorretas: ['GA', 'TO', 'BE'] },
            { prompt: 'Qual som silábico inicia a palavra "Gato"? 🐱', correta: 'GA', incorretas: ['MI', 'RU', 'PE'] },
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '_ _', tipo: 'letras' });
        } 
        else {
          const sonsDB = [
            { prompt: 'Qual o som final que você escuta na palavra "Gato"? 🐱', correta: 'TO', incorretas: ['GA', 'ME', 'LO'] },
            { prompt: 'Qual o som final que você escuta na palavra "Mesa"? 🪑', correta: 'SA', incorretas: ['ME', 'TA', 'PA'] },
            { prompt: 'Qual o som final que você escuta na palavra "Sapo"? 🐸', correta: 'PO', incorretas: ['SA', 'TO', 'NE'] },
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '_ _', tipo: 'letras' });
        }
      }
      // ----------------------------------------------------
      // JOGO: Formando Sílabas (formando_silabas)
      // ----------------------------------------------------
      else if (gameId === 'formando_silabas') {
        if (lvl === 1) {
          const silabasDB = [
            { prompt: 'Junte as sílabas e descubra a palavra: BA + LÃO 🎈', correta: 'BALÃO 🎈', incorretas: ['BOLO 🎂', 'BALA 🍬', 'BOTA 🥾'] },
            { prompt: 'Junte as sílabas e descubra a palavra: CA + SA 🏠', correta: 'CASA 🏠', incorretas: ['CAMA 🛏️', 'COLA 🧪', 'CABO 🔌'] },
            { prompt: 'Junte as sílabas e descubra a palavra: DO + CE 🍬', correta: 'DOCE 🍬', incorretas: ['DADO 🎲', 'DONO 👤', 'DEDO ☝️'] },
          ];
          const item = silabasDB[(roundNum - 1) % silabasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'letras' });
        } 
        else if (lvl === 2) {
          const silabasDB = [
            { lacuna: '___ + TO = GATO 🐱', correta: 'GA', incorretas: ['MA', 'PA', 'LA'] },
            { lacuna: '___ + LO = BOLO 🎂', correta: 'BO', incorretas: ['CO', 'MO', 'SO'] },
            { lacuna: '___ + PO = SAPO 🐸', correta: 'SA', incorretas: ['PA', 'LA', 'MA'] },
          ];
          const item = silabasDB[(roundNum - 1) % silabasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Complete a palavra de forma correta: ${item.lacuna}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, incompleta: item.lacuna, tipo: 'letras' });
        } 
        else {
          const silabasDB = [
            { lacuna: 'CA + NE + ___ = CANETA 🖊️', correta: 'TA', incorretas: ['LO', 'RA', 'PE'] },
            { lacuna: 'PI + PA + ___ = PIPOCA 🍿', correta: 'CA', incorretas: ['TE', 'DA', 'NO'] },
            { lacuna: 'SA + PA + ___ = SAPATO 👟', correta: 'TO', incorretas: ['CO', 'DO', 'LE'] },
          ];
          const item = silabasDB[(roundNum - 1) % silabasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Complete a palavra de três sílabas: ${item.lacuna}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, incompleta: item.lacuna, tipo: 'letras' });
        }
      }
      // ----------------------------------------------------
      // JOGO: Palavras Ocultas (palavras_ocultas)
      // ----------------------------------------------------
      else if (gameId === 'palavras_ocultas') {
        if (lvl === 1) {
          const ocultasDB = [
            { frase: 'O macaco 🐒 come banana no galho.', prompt: 'Qual animal come banana na frase?', correta: 'macaco 🐒', incorretas: ['galho 🌿', 'banana 🍌', 'leão 🦁'] },
            { frase: 'O peixe 🐟 nada feliz no lago azul.', prompt: 'Quem nada feliz no lago azul?', correta: 'peixe 🐟', incorretas: ['lago 🌊', 'azul 🎨', 'sapo 🐸'] },
            { frase: 'A menina 👧 lê um livro na biblioteca.', prompt: 'Quem lê um livro na biblioteca?', correta: 'menina 👧', incorretas: ['livro 📚', 'biblioteca 🏛️', 'escola 🏫'] },
          ];
          const item = ocultasDB[(roundNum - 1) % ocultasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.frase + " " + item.prompt);
          setGameState({ prompt: `${item.frase} -> ${item.prompt}`, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'frase' });
        } 
        else if (lvl === 2) {
          const ocultasDB = [
            { frase: 'O carro corre rápido na ___ 🛣️', correta: 'pista 🛣️', incorretas: ['lua 🌙', 'mesa 🪑', 'parede 🧱'] },
            { frase: 'A bola rolou para debaixo da ___ 🛏️', correta: 'cama 🛏️', incorretas: ['nuvem ☁️', 'porta 🚪', 'árvore 🌳'] },
            { frase: 'O passarinho voou alto no ___ ☁️', correta: 'céu ☁️', incorretas: ['mar 🌊', 'chão 🪵', 'armário 🚪'] },
          ];
          const item = ocultasDB[(roundNum - 1) % ocultasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Descubra a palavra oculta para completar a frase:`;
          speakCommand(item.frase);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, frase: item.frase, tipo: 'frase' });
        } 
        else {
          const ocultasDB = [
            { frase: 'A professora escreve na ___ com giz 🏫', correta: 'lousa 🏫', incorretas: ['mochila 🎒', 'janela 🪟', 'água 💧'] },
            { frase: 'Eu uso escova de dentes para limpar a ___ 🪥', correta: 'boca 👄', incorretas: ['mão ✋', 'orelha 👂', 'roupa 👕'] },
            { frase: 'Comemos sopa quente com uma ___ 🥣', correta: 'colher 🥣', incorretas: ['faca 🔪', 'caneta 🖊️', 'chave 🔑'] },
          ];
          const item = ocultasDB[(roundNum - 1) % ocultasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Descubra a palavra oculta de sentido mais complexo:`;
          speakCommand(item.frase);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, frase: item.frase, tipo: 'frase' });
        }
      }
      // ----------------------------------------------------
      // JOGO: Desafio das Frases (desafio_frases)
      // ----------------------------------------------------
      else if (gameId === 'desafio_frases') {
        if (lvl === 1) {
          const frasesDB = [
            { prompt: 'Ordene as palavras: "gosta - O - leite - de - gato 🐱"', correta: 'O gato gosta de leite. 🐱', incorretas: ['Leite de gosta o gato.', 'Gato o gosta de leite.', 'Gosta gato de leite o.'] },
            { prompt: 'Ordene as palavras: "sol - O - brilha - no - céu ☀️"', correta: 'O sol brilha no céu. ☀️', incorretas: ['Céu no brilha o sol.', 'O brilha sol no céu.', 'Sol o brilha céu no.'] },
            { prompt: 'Ordene as palavras: "bola - A - caiu - no - quintal ⚽"', correta: 'A bola caiu no quintal. ⚽', incorretas: ['Caiu no quintal a bola.', 'A quintal caiu no bola.', 'Bola a quintal caiu no.'] },
          ];
          const item = frasesDB[(roundNum - 1) % frasesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'frase' });
        } 
        else if (lvl === 2) {
          const frasesDB = [
            { prompt: 'Qual pontuação completa a frase de admiração: "Que dia maravilhoso___" ☀️', correta: 'Que dia maravilhoso! ☀️', incorretas: ['Que dia maravilhoso? ☀️', 'Que dia maravilhoso. ☀️', 'Que dia maravilhoso, ☀️'] },
            { prompt: 'Qual pontuação completa a frase de pergunta: "Você quer brincar comigo___" 🧸', correta: 'Você quer brincar comigo? 🧸', incorretas: ['Você quer brincar comigo! 🧸', 'Você quer brincar comigo. 🧸', 'Você quer brincar comigo, 🧸'] },
            { prompt: 'Qual pontuação completa a frase informativa: "Hoje vou estudar na escola___" 🏫', correta: 'Hoje vou estudar na escola. 🏫', incorretas: ['Hoje vou estudar na escola? 🏫', 'Hoje vou estudar na escola! 🏫', 'Hoje vou estudar na escola, 🏫'] },
          ];
          const item = frasesDB[(roundNum - 1) % frasesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'frase' });
        } 
        else {
          const frasesDB = [
            { prompt: 'Escolha a frase escrita e pontuada de forma 100% correta: ✍️', correta: 'Onde está o meu estojo azul? 🖊️', incorretas: ['onde esta o meu estojo azul.', 'Onde está o meu estojo azul!', 'Onde esta, o meu estojo azul?'] },
            { prompt: 'Escolha a frase escrita e pontuada de forma 100% correta: ✍️', correta: 'Cuidado! A sopa está muito quente. 🥣', incorretas: ['cuidado a sopa esta muito quente?', 'Cuidado, a sopa esta muito quente', 'Cuidado! a sopa está muito quente.'] },
            { prompt: 'Escolha a frase escrita e pontuada de forma 100% correta: ✍️', correta: 'Eu gosto de ler livros de mistério. 📚', incorretas: ['Eu gosto de ler livros de mistério?', 'eu gosto de ler livros de mistério!', 'Eu gosto, de ler livros de mistério.'] },
          ];
          const item = frasesDB[(roundNum - 1) % frasesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'frase' });
        }
      }
      // ----------------------------------------------------
      // JOGOS LEGADOS (CACADORES DE LETRAS / GRAFEMAS)
      // ----------------------------------------------------
      else if (gameId === 'cacadores_letras_infantil') {
        if (lvl === 1) {
          // Detetive das Vogais (faixa 4-5 anos)
          const infantilDB = [
            { prompt: 'Qual imagem começa com a letra A? 🐝', correta: '🐝 Abelha', incorretas: ['🧸 Urso', '🐱 Gato', '🎈 Balão'] },
            { prompt: 'Qual imagem começa com a letra O? 🥚', correta: '🥚 Ovo', incorretas: ['🐶 Cachorro', '🏠 Casa', '🥛 Leite'] },
            { prompt: 'Qual imagem começa com a letra I? ⛪', correta: '⛪ Igreja', incorretas: ['🚗 Carro', '🍉 Melancia', '👟 Sapato'] }
          ];
          const item = infantilDB[(roundNum - 1) % infantilDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'letras' });
        }
        else if (lvl === 2) {
          // Par de Sílabas (faixa 4-5 anos)
          const infantilDB = [
            { prompt: 'Qual imagem começa com a sílaba BO? ⚽', correta: '⚽ Bola', incorretas: ['🍬 Bala', '🍇 Uva', '🏠 Casa'] },
            { prompt: 'Qual imagem começa com a sílaba CA? 🏠', correta: '🏠 Casa', incorretas: ['🥛 Leite', '🐱 Gato', '🌸 Flor'] },
            { prompt: 'Qual imagem começa com a sílaba PA? 🦆', correta: '🦆 Pato', incorretas: ['⚽ Bola', '🚗 Carro', '🥚 Ovo'] }
          ];
          const item = infantilDB[(roundNum - 1) % infantilDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, incompleta: '?', tipo: 'letras' });
        }
        else {
          // Frase Lúdica Lacunada (faixa 4-5 anos)
          const infantilDB = [
            { frase: 'O jacaré mora na ___ 🌊', correta: 'lagoa 🌊', incorretas: ['árvore 🌳', 'nuvem ☁️', 'mesa 🪑'] },
            { frase: 'O macaco adora comer ___ 🍌', correta: 'banana 🍌', incorretas: ['pedra 🪨', 'queijo 🧀', 'pipoca 🍿'] },
            { frase: 'A abelha faz mel gostoso na ___ 🐝', correta: 'colmeia 🐝', incorretas: ['escola 🏫', 'grama 🌿', 'rua 🛣️'] }
          ];
          const item = infantilDB[(roundNum - 1) % infantilDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Complete a frase de forma lúdica:`;
          speakCommand(item.frase);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, frase: item.frase, tipo: 'frase' });
        }
      }
      else {
        if (lvl === 1) {
          // Mecânica: caça_letras (Caçadores de Letras e Grafemas - 6-8 anos)
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
          // Mecânica: montar_silabas (Caçadores de Letras e Grafemas - 6-8 anos)
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
          // Mecânica: completar_frases (Caçadores de Letras e Grafemas - 6-8 anos)
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
    }
    else if (bioma === 'cognitivo') {
      const gameId = game.id;

      if (gameId === 'logica_espacial') {
        if (lvl === 1) {
          // Tangram / Rotação Espacial
          const rotacoesDB = [
            { prompt: 'Se girarmos um triângulo do Tangram ▲ apontando para cima meia volta para a direita, como ele fica?', correta: 'Apontando para a direita ▶️', incorretas: ['Apontando para a esquerda ◀️', 'Apontando para baixo 🔽', 'Apontando para cima 🔼'] },
            { prompt: 'Se girarmos uma seta apontando para cima 🔼 meia volta completa (180 graus), ela passa a apontar para onde?', correta: 'Para baixo 🔽', incorretas: ['Para a direita ▶️', 'Para a esquerda ◀️', 'Para cima 🔼'] },
            { prompt: 'Se rotacionarmos um quadrado ⬛ em qualquer direção, qual forma geométrica ele continua parecendo?', correta: 'Quadrado ⬛', incorretas: ['Triângulo 🔺', 'Círculo 🔵', 'Estrela ⭐'] },
          ];
          const item = rotacoesDB[(roundNum - 1) % rotacoesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, molde: item.correta, tipo: 'formas' });
        } 
        else if (lvl === 2) {
          // Trilha sequencial de formas abstratas
          const sequenciasDB = [
            { sequencia: '▲  ▲  ●  ●  ▲  ▲  ?', correta: '●', incorretas: ['▲', '■', '★'] },
            { sequencia: '⭐  ⬛  ⭐  ⬛  ⭐  ?', correta: '⬛', incorretas: ['⭐', '●', '▲'] },
            { sequencia: '🟢  🔵  🟢  🔵  🟢  ?', correta: '🔵', incorretas: ['🟢', '🔴', '🟡'] },
          ];
          const item = sequenciasDB[(roundNum - 1) % sequenciasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Observe o padrão visual do Tangram e responda: qual figura completa a sequência?`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'sequencia' });
        } 
        else {
          // Memória de Tangram
          const memoriasDB = [
            { sequencia: '📐  🔺  🔷', correta: '📐', incorretas: ['🔺', '🔷', '⭐'] },
            { sequencia: '🔴  🟩  🟡', correta: '🔴', incorretas: ['🟩', '🟡', '🔵'] },
            { sequencia: '⭐️  🔺  ⬛️', correta: '⭐️', incorretas: ['🔺', '⬛️', '🔵'] },
          ];
          const item = memoriasDB[(roundNum - 1) % memoriasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Memorize o padrão do Tangram que vai aparecer por um instante: ${item.sequencia}`;
          speakCommand(prompt);
          
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'memoria_piscar' });
          
          setTimeout(() => {
            setGameState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                prompt: 'Qual figura do Tangram apareceu na primeira posição da sequência que você acabou de ver?',
                tipo: 'memoria_perguntar'
              };
            });
            speakCommand("Qual figura do Tangram apareceu na primeira posição?");
          }, 2200);
        }
      }
      else if (gameId === 'balao_formas') {
        if (lvl === 1) {
          // Pareamento de Formas Planas Simples (faixa 0-3 anos)
          const formasDB = [
            { prompt: 'Ache o Círculo Vermelho 🔴', correta: '🔴 Círculo', incorretas: ['🔺 Triângulo', '⬛ Quadrado', '⭐ Estrela'] },
            { prompt: 'Ache o Quadrado Azul 🟦', correta: '🟦 Quadrado', incorretas: ['🟡 Círculo', '🔺 Triângulo', '🌸 Flor'] },
            { prompt: 'Ache o Triângulo Verde 💚', correta: '🔺 Triângulo', incorretas: ['🔵 Círculo', '⬛ Quadrado', '⭐ Estrela'] }
          ];
          const item = formasDB[(roundNum - 1) % formasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, molde: item.correta, tipo: 'formas' });
        }
        else if (lvl === 2) {
          // Padrões de Cores e Formas Super Simples
          const sequenciasDB = [
            { sequencia: '🔴  🔵  🔴  ?', correta: '🔵', incorretas: ['🔴', '🔺', '⬛'] },
            { sequencia: '💛  💚  💛  ?', correta: '💚', incorretas: ['💛', '💙', '💜'] },
            { sequencia: '⭐️  🎈  ⭐️  ?', correta: '🎈', incorretas: ['⭐️', '🚗', '🐱'] }
          ];
          const item = sequenciasDB[(roundNum - 1) % sequenciasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Descubra qual figura completa a fileira simples:`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'sequencia' });
        }
        else {
          // Onde está o brinquedo (Memória visual primária)
          const memoriasDB = [
            { sequencia: 'Caixa 📦  Urso 🧸  Caixa 📦', correta: 'Urso 🧸 (Caixa do Meio)', incorretas: ['Caixa da Esquerda 📦', 'Caixa da Direita 📦', 'Nenhuma 📦'] },
            { sequencia: 'Gato 🐱  Caixa 📦  Caixa 📦', correta: 'Gato 🐱 (Caixa da Esquerda)', incorretas: ['Caixa do Meio 📦', 'Caixa da Direita 📦', 'Nenhuma 📦'] },
            { sequencia: 'Caixa 📦  Caixa 📦  Bola ⚽', correta: 'Bola ⚽ (Caixa da Direita)', incorretas: ['Caixa da Esquerda 📦', 'Caixa do Meio 📦', 'Nenhuma 📦'] }
          ];
          const item = memoriasDB[(roundNum - 1) % memoriasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Memorize a posição do brinquedo: ${item.sequencia}`;
          speakCommand(prompt);
          
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'memoria_piscar' });
          
          setTimeout(() => {
            setGameState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                prompt: 'Em qual caixa estava escondido o brinquedo que você acabou de ver?',
                tipo: 'memoria_perguntar'
              };
            });
            speakCommand("Em qual caixa estava escondido o brinquedo?");
          }, 2200);
        }
      }
      else if (gameId === 'desafio_sequencias') {
        if (lvl === 1) {
          // Lógica Algorítmica e Foco Computacional (9-12 anos)
          const comandosDB = [
            { prompt: 'Para o robô andar para frente 3 passos e virar para cima, qual a sequência correta?', correta: '▶️ ▶️ ▶️ 🔼', incorretas: ['▶️ 🔼 ◀️ 🔽', '🔼 🔼 🔼 ▶️', '🔽 🔽 ▶️ 🔼'] },
            { prompt: 'Para o robô dar ré 2 passos e virar para baixo, qual a sequência?', correta: '◀️ ◀️ 🔽', incorretas: ['▶️ ▶️ 🔼', '◀️ 🔼 🔽', '🔽 🔽 ◀️'] },
            { prompt: 'Para o robô dar um giro em formato de U (sobe, vira para a direita, desce), qual a ordem?', correta: '🔼 ▶️ 🔽', incorretas: ['🔽 ◀️ 🔼', '▶️ 🔼 ◀️', '🔼 🔼 🔽'] }
          ];
          const item = comandosDB[(roundNum - 1) % comandosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, molde: item.correta, tipo: 'formas' });
        }
        else if (lvl === 2) {
          // Lógica Condicional de Fluxogramas
          const fluxosDB = [
            { prompt: 'Se a luz estiver VERMELHA 🔴, o robô para. Se estiver VERDE 🟢, o robô avança. A luz ficou verde! O robô deve...', correta: 'Avançar 🟢', incorretas: ['Parar 🔴', 'Recuar ◀️', 'Girar 🔄'] },
            { prompt: 'Se o sensor detectar obstáculo 🧱, o robô vira para a direita. Se o caminho estiver livre, ele segue reto. Detectou obstáculo! O robô deve...', correta: 'Virar para a direita ➡️', incorretas: ['Seguir reto ⬆️', 'Parar 🛑', 'Recuar ⬇️'] },
            { prompt: 'Se a bateria estiver menor que 20% 🪫, o robô vai para a base de recarga. A bateria está em 15%! O robô deve...', correta: 'Ir para a base de recarga ⚡', incorretas: ['Continuar limpando 🧹', 'Gritar por socorro 🗣️', 'Desligar no meio da sala 💤'] }
          ];
          const item = fluxosDB[(roundNum - 1) % fluxosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, sequencia: '💻 IF/ELSE', tipo: 'formas' });
        }
        else {
          // Algoritmo de memória de comandos rápidos
          const memoriasDB = [
            { sequencia: '🔼  ▶️  🔽', correta: '🔼', incorretas: ['▶️', '🔽', '◀️'] },
            { sequencia: '◀️  🔼  ▶️', correta: '◀️', incorretas: ['🔼', '▶️', '🔽'] },
            { sequencia: '🔽  ◀️  🔼', correta: '🔽', incorretas: ['◀️', '🔼', '▶️'] }
          ];
          const item = memoriasDB[(roundNum - 1) % memoriasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Memorize a sequência de comandos algorítmicos rápidos: ${item.sequencia}`;
          speakCommand(prompt);
          
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'memoria_piscar' });
          
          setTimeout(() => {
            setGameState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                prompt: 'Qual foi o primeiro comando da sequência algorítmica que você acabou de ver?',
                tipo: 'memoria_perguntar'
              };
            });
            speakCommand("Qual foi o primeiro comando da sequência algorítmica?");
          }, 2200);
        }
      }
      else {
        // quebra_cabeca_formas (Caçadores de Formas - 6-8 anos) - Fallback original
        if (lvl === 1) {
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
    }
    // ==========================================
    // 3. BIOMA: EMOÇÕES
    // ==========================================
    else if (bioma === 'emocoes') {
      const gameId = game.id;

      if (gameId === 'empatia_autorregulacao') {
        if (lvl === 1) {
          // Detetive das Carinhas Mistas
          const mistasDB = [
            { prompt: 'Seu amigo está de braços cruzados, bochechas vermelhas e olhando para o chão. Como ele se sente?', correta: '😡 Bravo ou chateado', incorretas: ['😊 Feliz e alegre', '😢 Muito triste', '😱 Assustado'] },
            { prompt: 'Seu colega está com os olhos bem abertos, boca em formato de "O" e mãos nas bochechas. Como ele está?', correta: '😱 Surpreso ou assustado', incorretas: ['😊 Feliz e sorridente', '😢 Triste', '😡 Bravo'] },
            { prompt: 'Seu amigo está com um sorriso tímido no rosto, mas encolhendo os ombros ao apresentar o desenho para a sala. Ele está...', correta: '🫣 Envergonhado ou tímido', incorretas: ['😡 Com muita raiva', '😢 Chorando de tristeza', '😱 Apavorado'] }
          ];
          const item = mistasDB[(roundNum - 1) % mistasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, emoji: '👥', tipo: 'emocoes' });
        } 
        else if (lvl === 2) {
          // Mediação no Recreio Escolar
          const situacoesDB = [
            { dilema: 'Durante o recreio, um colega escorrega e derruba o lanche no chão. A atitude mais empática é...', correta: 'Ajudar a limpar e oferecer compartilhar o seu lanche 🤝', incorretas: ['Ignorar e continuar brincando com os outros 🏃', 'Rir do tombo dele e contar para a turma 🗣️'] },
            { dilema: 'Seu amigo quer jogar bola, mas você quer brincar de balanço. O que fazer?', correta: 'Combinar de brincar um pouco de cada coisa juntos 🧸', incorretas: ['Gritar e ir embora para casa sem falar nada 😡', 'Insistir que só vale a sua brincadeira 🔒'] },
            { dilema: 'Um colega novo na escola está sentado sozinho na hora do recreio. Você pode...', correta: 'Convidá-lo para se juntar à sua brincadeira 🤝', incorretas: ['Ficar olhando de longe sem falar nada 👀', 'Dizer para os outros não brincarem com ele 🤫'] }
          ];
          const item = situacoesDB[(roundNum - 1) % situacoesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.dilema);
          setGameState({ prompt: item.dilema, respostaCorreta: item.correta, opcoes, dilema: item.dilema, tipo: 'sentimentos' });
        } 
        else {
          // Respirando com as Estrelas
          const respiracaoDB = [
            { dilema: 'Quando sentimos frustração ou raiva ao perder um jogo, a melhor técnica de autorregulação é...', correta: 'Respirar fundo devagar e contar até 5 calmamente 🌬️', incorretas: ['Jogar os controles no chão e gritar 😡', 'Guardar a raiva para si sem falar com ninguém 🤐'] },
            { dilema: 'Se você está muito ansioso para a sua vez de apresentar um trabalho, você pode...', correta: 'Inspirar pelo nariz como se cheirasse uma flor e expirar pela boca soprando uma vela 🌬️', incorretas: ['Ficar roendo as unhas e reclamando com todos 😬', 'Chorar e se recusar a ir para a sala 😢'] },
            { dilema: 'Quando sentimos o corpo tenso por causa de uma prova difícil, ajuda bastante...', correta: 'Alongar os braços, respirar fundo e relaxar os ombros 🧘', incorretas: ['Apertar o lápis até quebrar com raiva ✏️', 'Discutir com o professor e sair da sala 🚪'] }
          ];
          const item = respiracaoDB[(roundNum - 1) % respiracaoDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.dilema);
          setGameState({ prompt: item.dilema, respostaCorreta: item.correta, opcoes, dilema: item.dilema, tipo: 'sentimentos' });
        }
      }
      else if (gameId === 'termometro_sentimentos_infantil') {
        if (lvl === 1) {
          // Expressões Básicas por Bichinhos (0-3 anos)
          const infantilDB = [
            { prompt: 'O cachorrinho está abanando o rabo e latindo alegre 🐶. Como ele se sente?', correta: '😊 Feliz', incorretas: ['😢 Triste', '😡 Bravo', '😱 Assustado'] },
            { prompt: 'O gatinho está encolhido chorando baixinho no canto 🐱. Como ele se sente?', correta: '😢 Triste', incorretas: ['😊 Feliz', '😡 Bravo', '😱 Assustado'] },
            { prompt: 'O leãozinho ouviu um trovão muito forte e se escondeu 🦁. Como ele está?', correta: '😱 Assustado', incorretas: ['😊 Feliz', '😢 Triste', '😡 Bravo'] }
          ];
          const item = infantilDB[(roundNum - 1) % infantilDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, emoji: '🐾', tipo: 'emocoes' });
        }
        else if (lvl === 2) {
          // Carrossel de Situações Simples
          const situacoesDB = [
            { prompt: 'Ganhei um abraço bem quentinho da vovó 🤗. Eu me sinto...', correta: '😊 Feliz e amado', incorretas: ['😢 Triste e sozinho', '😡 Com muita raiva'] },
            { prompt: 'O meu sorvete gostoso caiu na areia 🍦. Eu fico...', correta: '😢 Triste e chateado', incorretas: ['😊 Feliz e contente', '😡 Muito bravo'] }
          ];
          const item = situacoesDB[(roundNum - 1) % situacoesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, dilema: item.prompt, tipo: 'sentimentos' });
        }
        else {
          // Escolhas de Carinho Primárias
          const escolhasDB = [
            { prompt: 'Seu irmãozinho está chorando porque perdeu a chupeta. O que você faz?', correta: 'Dou um abraço e ajudo a procurar 🧸', incorretas: ['Dou risada dele 🤪', 'Grito bem alto perto dele 😡'] },
            { prompt: 'Sua mãe preparou um lanche gostoso. A melhor atitude é...', correta: 'Agradecer com carinho e dar um beijo 🤗', incorretas: ['Reclamar e jogar o prato no chão 😡'] }
          ];
          const item = escolhasDB[(roundNum - 1) % escolhasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, dilema: item.prompt, tipo: 'sentimentos' });
        }
      }
      else if (gameId === 'detetive_social') {
        if (lvl === 1) {
          // Expressões Complexas de Adolescentes (13+ anos)
          const complexasDB = [
            { prompt: 'Um colega diz "tudo bem" com a voz baixa e ombros caídos após a nota da prova. Ele está...', correta: 'Frustrado e desanimado com o resultado 😔', incorretas: ['Muito entusiasmado e alegre 😄', 'Completamente indiferente 😐', 'Extremamente furioso 😡'] },
            { prompt: 'Sua colega está rindo alto enquanto morde os lábios e bate o pé freneticamente na fila. Ela demonstra...', correta: 'Ansiedade e agitação interna ⚡', incorretas: ['Paz e tranquilidade profunda 🧘', 'Tristeza e isolamento 😢', 'Tédio absoluto 😑'] }
          ];
          const item = complexasDB[(roundNum - 1) % complexasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, emoji: '💬', tipo: 'emocoes' });
        }
        else if (lvl === 2) {
          // Dilemas Éticos e Mediação Escolar
          const dilemasDB = [
            { prompt: 'Dois colegas estão discutindo asperamente por causa de um projeto em grupo. Como mediador escolar, o ideal é...', correta: 'Ouvir os dois lados com calma e buscar um acordo justo 🤝', incorretas: ['Ficar do lado do meu melhor amigo sem ouvir o outro 👈', 'Deixar que briguem e não me envolver 🏃', 'Gritar mais alto que eles para fazê-los parar 😡'] },
            { prompt: 'Um amigo seu confidenciou que está sofrendo exclusão deliberada no grupo de esportes da escola. A melhor atitude é...', correta: 'Apoiar o amigo e conversar com o grupo para integrá-lo 🤝', incorretas: ['Dizer que a culpa é dele e não me meter 🤫', 'Rir e compartilhar os boatos do grupo 📱'] }
          ];
          const item = dilemasDB[(roundNum - 1) % dilemasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, dilema: item.prompt, tipo: 'sentimentos' });
        }
        else {
          // Cidadania Ativa e Bullying Digital
          const cidadaniaDB = [
            { prompt: 'Alguns alunos criaram um perfil falso para divulgar apelidos maldosos de um colega na internet. A atitude ética é...', correta: 'Apoiar o colega, repudiar a página e denunciar aos responsáveis 🛡️', incorretas: ['Seguir e curtir os posts para não parecer excluído 📱', 'Ignorar por completo, pois não é comigo 🤫', 'Comentar na foto dele rindo do apelido 🗣️'] },
            { prompt: 'Você presencia um colega com deficiência física tendo dificuldades para subir a rampa da biblioteca. A melhor atitude cidadã é...', correta: 'Aproximar-me com respeito e perguntar se ele gostaria de ajuda 🤝', incorretas: ['Empurrar a cadeira dele sem pedir permissão 🦽', 'Passar direto fingindo que não vi 🏃'] }
          ];
          const item = cidadaniaDB[(roundNum - 1) % cidadaniaDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, dilema: item.prompt, tipo: 'sentimentos' });
        }
      }
      else {
        // termometro_sentimentos (Termômetro das Emoções Adaptativo - 4-5 anos) - Fallback original
        if (lvl === 1) {
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
    }
    // ==========================================
    // 4. BIOMA: SENSORIAL
    // ==========================================
    else if (bioma === 'sensorial') {
      const gameId = game.id;

      if (gameId === 'percepcao_sonora_motora') {
        if (lvl === 1) {
          // Sons da Natureza Rítmicos
          const sonsDB = [
            { som: 'Folhas de árvore balançando ao vento suave 🍃', correta: '🍃 Som do Vento', incorretas: ['⚡ Trovão Forte', '🎺 Corneta Barulhenta'], audioKey: 'chuva' as const },
            { som: 'Sapo coaxando calmamente no lago 🐸', correta: '🐸 Som de Sapo', incorretas: ['🦁 Rugido de Leão', '🚓 Sirene Alta'], audioKey: 'passaro' as const },
            { som: 'Ondas do mar batendo de leve na areia 🌊', correta: '🌊 Ondas do Mar', incorretas: ['💥 Explosão Forte', '🔔 Despertador Alto'], audioKey: 'mar' as const },
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Toque no botão para orquestrar o som de: ${item.som}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.som, tipo: 'sons', audioKey: item.audioKey });
          
          setTimeout(() => {
            playSynthesizedSound(item.audioKey);
          }, 1400);
        } 
        else if (lvl === 2) {
          // Paleta Cromática Pastel
          const coresDB = [
            { pedido: 'Toque na cor pastel que transmite mais calma e paz 🟢', correta: '🟢 Verde Erva Doce', incorretas: ['🔴 Vermelho Neon', '⚡ Amarelo Elétrico'] },
            { pedido: 'Toque na cor que parece o céu limpo e tranquilo 🔵', correta: '🔵 Azul Suave', incorretas: ['⚫ Preto Escuro', '🟧 Laranja Vibrante'] },
            { pedido: 'Toque na cor que lembra um abraço caloroso e confortável 🌸', correta: '🌸 Rosa Claro', incorretas: ['🟤 Marrom Opaco', '💀 Roxo Vibrante'] },
          ];
          const item = coresDB[(roundNum - 1) % coresDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = item.pedido;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.pedido, tipo: 'sons' });
        } 
        else {
          // Guia de Borboletas Suaves
          const alvosDB = [
            { instrucao: 'Ajude a borboleta dourada a pousar com cuidado na flor rosa mais próxima! 🦋', correta: '🌸 Ir para a flor rosa com calma 🦋', incorretas: ['🌪️ Voar na ventania forte 💨', '🪵 Bater no galho seco 🍂'] },
            { instrucao: 'Toque na bolha de sabão brilhante que flutua bem devagar na tela... 🫧', correta: '🫧 Bolha Lenta de Sabão', incorretas: ['⚡ Raio Piscante', '🧱 Tijolo Pesado'] },
            { instrucao: 'Pegue a estrela cadente que brilha suavemente no céu! 🌠', correta: '🌠 Estrela Cadente Suave', incorretas: ['🔥 Fogo Quente', '💣 Alvo Rápido'] }
          ];
          const item = alvosDB[(roundNum - 1) % alvosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = item.instrucao;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.instrucao, tipo: 'sons' });
        }
      }
      else if (gameId === 'orquestra_sons') {
        if (lvl === 1) {
          // Instrumentos de Causa-Efeito (0-3 anos)
          const sonsDB = [
            { som: 'Sons suaves de uma harpa dedilhada 🎵', correta: '🎵 Harpa Suave', incorretas: ['🥁 Tambor Forte', '🎺 Corneta Alta'], audioKey: 'mar' as const },
            { som: 'Sons mágicos de um xilofone lúdico 🎼', correta: '🎼 Xilofone Mágico', incorretas: ['🔔 Alarme Barulhento', '💥 Ruído Alto'], audioKey: 'passaro' as const }
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Toque no botão para orquestrar o som de: ${item.som}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.som, tipo: 'sons', audioKey: item.audioKey });
          
          setTimeout(() => {
            playSynthesizedSound(item.audioKey);
          }, 1400);
        }
        else if (lvl === 2) {
          // Sons de animais do cotidiano
          const sonsDB = [
            { som: 'Gatinho miando querendo carinho 🐱', correta: '🐱 Miau do Gatinho', incorretas: ['🦁 Rugido de Leão', '🐕 Latido Alto'], audioKey: 'passaro' as const },
            { som: 'Passarinho cantando feliz na árvore 🐦', correta: '🐦 Canto de Passarinho', incorretas: ['🐍 Coaxar Alto', '🦈 Mar Revolto'], audioKey: 'passaro' as const }
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Identifique o som de carinho correspondente: ${item.som}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.som, tipo: 'sons', audioKey: item.audioKey });
        }
        else {
          // Estrelas cadentes em movimento rápido
          const alvosDB = [
            { instrucao: 'Toque na estrela azul mágica e rápida! ✨', correta: '✨ Estrela Mágica Rápida', incorretas: ['✨ Estrela Parada', '☁️ Nuvem Cinza'] },
            { instrucao: 'Toque na nuvem de algodão que brilha suavemente! ☁️', correta: '☁️ Nuvem de Algodão', incorretas: ['🪨 Pedra Escura', '🔥 Fogueira'] }
          ];
          const item = alvosDB[(roundNum - 1) % alvosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = item.instrucao;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.instrucao, tipo: 'sons' });
        }
      }
      else {
        // toque_cores (Floresta de Toques Luminosos - 0-3 anos) - Fallback original
        if (lvl === 1) {
          const sonsDB = [
            { som: 'Chuva caindo de mansinho 🌧️', correta: '🌧️ Som de Chuva', incorretas: ['🐦 Canto de Pássaro', '🌊 Ondas do Mar'], audioKey: 'chuva' as const },
            { som: 'Canto alegre de um passarinho 🐦', correta: '🐦 Canto de Pássaro', incorretas: ['🌧️ Som de Chuva', '🌊 Ondas do Mar'], audioKey: 'passaro' as const },
            { som: 'Ondas do mar que vêm e vão 🌊', correta: '🌊 Ondas do Mar', incorretas: ['🌧️ Som de Chuva', '🐦 Canto de Pássaro'], audioKey: 'mar' as const },
          ];
          const item = sonsDB[(roundNum - 1) % sonsDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Toque no botão correspondente para orquestrar o som de: ${item.som}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, molde: item.som, tipo: 'sons', audioKey: item.audioKey });
          
          setTimeout(() => {
            playSynthesizedSound(item.audioKey);
          }, 1400);
        } 
        else if (lvl === 2) {
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
    }
    // ==========================================
    // 5. BIOMA: MATEMÁTICO
    // ==========================================
    else {
      const gameId = game.id;

      if (gameId === 'desafio_multiplicacao') {
        if (lvl === 1) {
          // Agrupador de Cestas de Frutas
          const objetosDB = [
            { prompt: 'Se temos 3 cestas e cada cesta tem 2 maçãs 🍎🍎, qual o total de maçãs?', correta: '6 maçãs (3 x 2) 🍎', incorretas: ['5 maçãs', '4 maçãs', '8 maçãs'] },
            { prompt: 'Se temos 2 ninhos e cada ninho tem 3 passarinhos 🐥🐥🐥, quantos passarinhos há ao todo?', correta: '6 passarinhos (2 x 3) 🐥', incorretas: ['5 passarinhos', '8 passarinhos', '4 passarinhos'] },
            { prompt: 'Se temos 4 saquinhos e cada saquinho tem 2 doces 🍬🍬, quantos doces temos no total?', correta: '8 doces (4 x 2) 🍬', incorretas: ['6 doces', '10 doces', '7 doces'] }
          ];
          const item = objetosDB[(roundNum - 1) % objetosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.prompt);
          setGameState({ prompt: item.prompt, respostaCorreta: item.correta, opcoes, conjunto: '🧺', tipo: 'matematica' });
        } 
        else if (lvl === 2) {
          // Trilha do Multiplicador Espacial
          const sequenciasDB = [
            { sequencia: '2,  4,  6,  ?,  10', correta: '8', incorretas: ['7', '9', '12'] },
            { sequencia: '3,  6,  9,  ?,  15', correta: '12', incorretas: ['10', '11', '14'] },
            { sequencia: '5,  10,  15,  ?,  25', correta: '20', incorretas: ['18', '22', '30'] }
          ];
          const item = sequenciasDB[(roundNum - 1) % sequenciasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Complete a trilha da tabuada: ${item.sequencia}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'matematica' });
        } 
        else {
          // Desafios da Fazenda Multiplicativa
          const operacoesDB = [
            { desafio: 'Na fazenda, cada ovelha tem 4 patas. Se temos 3 ovelhas correndo no pasto, quantas patas temos no total?', correta: '12 patas (3 x 4) 🐑', incorretas: ['10 patas', '8 patas', '16 patas'] },
            { desafio: 'Cada caixa de ovos da fazenda vem com 6 ovos. Se o fazendeiro colheu 2 caixas cheias, quantos ovos ele tem?', correta: '12 ovos (2 x 6) 🥚', incorretas: ['10 ovos', '8 ovos', '18 ovos'] },
            { desafio: 'Se plantamos 5 fileiras de cenouras e cada fileira tem 3 cenouras, quantas cenouras colheremos?', correta: '15 cenouras (5 x 3) 🥕', incorretas: ['12 cenouras', '10 cenouras', '18 cenouras'] }
          ];
          const item = operacoesDB[(roundNum - 1) % operacoesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.desafio);
          setGameState({ prompt: item.desafio, respostaCorreta: item.correta, opcoes, desafio: item.desafio, tipo: 'sentimentos' });
        }
      }
      else {
        // reino_numeros (Reino dos Números e Quantidades - 6-8 anos) - Fallback original
        if (lvl === 1) {
          // Contagem de Animais da Fazenda (Ilustrado)
          const objetosDB = [
            { conjunto: '🦆  🦆  🦆', quantidade: '3 patinhos 🦆', incorretas: ['2 patinhos', '4 patinhos', '5 patinhos'] },
            { conjunto: '🐖  🐖  🐖  🐖', quantidade: '4 porquinhos 🐖', incorretas: ['3 porquinhos', '5 porquinhos', '2 porquinhos'] },
            { conjunto: '🐑  🐑', quantidade: '2 ovelhas 🐑', incorretas: ['1 ovelha', '3 ovelhas', '4 ovelhas'] },
          ];
          const item = objetosDB[(roundNum - 1) % objetosDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.quantidade].sort(() => Math.random() - 0.5);
          const prompt = `Contagem na fazenda: quantos animais estão no cercado? ${item.conjunto}`;
          speakCommand("Quantos animais estão no cercado?");
          setGameState({ prompt, respostaCorreta: item.quantidade, opcoes, conjunto: item.conjunto, tipo: 'matematica' });
        } 
        else if (lvl === 2) {
          // Trilha Sequencial de Adição Fácil
          const sequenciasDB = [
            { sequencia: '2,  4,  6,  ?,  10', correta: '8', incorretas: ['7', '9', '11'] },
            { sequencia: '1,  3,  5,  ?,  9', correta: '7', incorretas: ['6', '8', '10'] },
            { sequencia: '5,  10,  15,  ?,  25', correta: '20', incorretas: ['16', '18', '22'] },
          ];
          const item = sequenciasDB[(roundNum - 1) % sequenciasDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          const prompt = `Complete o número que falta na trilha de contagem: ${item.sequencia}`;
          speakCommand(prompt);
          setGameState({ prompt, respostaCorreta: item.correta, opcoes, sequencia: item.sequencia, tipo: 'matematica' });
        } 
        else {
          // Alimentar Animais: Soma Ilustrada com Frutas
          const operacoesDB = [
            { desafio: 'O coelhinho comeu 3 cenouras de manhã 🥕🥕🥕 e mais 3 cenouras à tarde 🥕🥕🥕. Quantas cenouras ele comeu no total?', correta: '6 cenouras 🥕', incorretas: ['5 cenouras', '7 cenouras', '9 cenouras'] },
            { desafio: 'Temos 4 maçãs vermelhas 🍎🍎🍎🍎 e colhemos mais 2 maçãs verdes 🍏🍏. Quantas frutas temos ao todo?', correta: '6 frutas 🍎🍏', incorretas: ['5 frutas', '7 frutas', '8 frutas'] },
            { desafio: 'O cavalinho ganhou 5 torrões de açúcar 🍬🍬🍬🍬🍬 e comeu 2 🍬🍬. Quantos torrões sobraram?', correta: '3 torrões 🍬', incorretas: ['2 torrões', '4 torrões', '5 torrões'] },
          ];
          const item = operacoesDB[(roundNum - 1) % operacoesDB.length];
          const opcoes = [...item.incorretas.slice(0, numOptions - 1), item.correta].sort(() => Math.random() - 0.5);
          speakCommand(item.desafio);
          setGameState({ prompt: item.desafio, respostaCorreta: item.correta, opcoes, desafio: item.desafio, tipo: 'sentimentos' });
        }
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
      // Tocar som sintetizado de acerto
      playSynthesizedSound('acerto');
      
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
      // Tocar som sintetizado de erro
      playSynthesizedSound('erro');
      
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

  const handlePreviousRound = () => {
    if (currentRound <= 1) return;
    
    const targetRound = currentRound - 1;
    
    // Tenta reverter os impactos da rodada anterior nas métricas
    const lastResponseIndex = metrics.current.respostas.findIndex(r => r.rodada === targetRound);
    if (lastResponseIndex >= 0) {
      const resp = metrics.current.respostas[lastResponseIndex];
      // Descontar das métricas
      if (resp.correta) {
        metrics.current.acertos = Math.max(0, metrics.current.acertos - 1);
        metrics.current.acertosSeguidos = Math.max(0, metrics.current.acertosSeguidos - 1);
      } else {
        metrics.current.erros = Math.max(0, metrics.current.erros - 1);
        metrics.current.errosSeguidos = Math.max(0, metrics.current.errosSeguidos - 1);
      }
      metrics.current.tempoTotalMs = Math.max(0, metrics.current.tempoTotalMs - resp.tempoReacaoMs);
      
      // Remover das respostas
      metrics.current.respostas.splice(lastResponseIndex, 1);
    }
    
    // Recalcular pontuação com base nas respostas que restaram
    let newScore = 0;
    metrics.current.respostas.forEach(r => {
      if (r.correta) {
        newScore += Math.max(10, 50 - Math.floor(r.tempoReacaoMs / 1000) * 2);
      }
    });
    setScore(newScore);
    
    // Resetar o feedback
    setFeedbackMsg({ text: '', type: null });
    
    // Atualizar a rodada atual
    setCurrentRound(targetRound);
    
    // Gerar novamente a rodada anterior
    generateNewRound(targetRound, levelInterno, difficultyModulation.numeroOpcoes);
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

    // =========================================================================
    // SALVAMENTO LOCAL INCONDICIONAL (GARANTIA ABSOLUTA DE DADOS DO ALUNO)
    // =========================================================================
    try {
      console.log("[ACE Play] Salvando progresso e pontuacao localmente...");
      
      // 1. Salvar progresso de nível dos jogos
      const localProgressKey = `incluigamer_progress_map_${student.id}`;
      const localProgress = localStorage.getItem(localProgressKey);
      let progressMap: Record<string, any> = {};
      if (localProgress) progressMap = JSON.parse(localProgress);
      const currentLocal = progressMap[game.id] || { current_level: 1, stars_earned: 0, completed: false };
      progressMap[game.id] = { 
        current_level: Math.max(currentLocal.current_level, progressPayload.current_level), 
        stars_earned: Math.max(currentLocal.stars_earned, progressPayload.stars_earned), 
        completed: progressPayload.completed || currentLocal.current_level >= 3 
      };
      localStorage.setItem(localProgressKey, JSON.stringify(progressMap));
      
      // 2. Salvar logs de comportamento localmente
      const localLogsKey = `incluigamer_progress_${student.id}`;
      const oldProgress = JSON.parse(localStorage.getItem(localLogsKey) || '[]');
      oldProgress.push(behaviorLogPayload);
      localStorage.setItem(localLogsKey, JSON.stringify(oldProgress));

      // 3. Salvar pontuação cognitiva (scoresPayload) no LocalStorage (Garante exibição imediata no Dashboard)
      const localScoresKey = `incluigamer_scores_${student.id}`;
      const existingLocalScore = JSON.parse(localStorage.getItem(localScoresKey) || 'null');
      
      let mergedScoresPayload = { ...scoresPayload };
      if (existingLocalScore) {
        const oldSkills = Array.isArray(existingLocalScore.skills_developed) ? existingLocalScore.skills_developed : [];
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
        
        mergedScoresPayload = {
          ...scoresPayload,
          foco: Math.round((existingLocalScore.foco + scoresPayload.foco) / 2),
          autonomia: Math.round((existingLocalScore.autonomia + scoresPayload.autonomia) / 2),
          emocional: Math.round((existingLocalScore.emocional + scoresPayload.emocional) / 2),
          coordenacao: Math.round((existingLocalScore.coordenacao + scoresPayload.coordenacao) / 2),
          engajamento: Math.round((existingLocalScore.engajamento + scoresPayload.engajamento) / 2),
          desenvolvimento_pedagogico: Math.round((existingLocalScore.desenvolvimento_pedagogico + scoresPayload.desenvolvimento_pedagogico) / 2),
          total_play_time: (existingLocalScore.total_play_time || 0) + scoresPayload.total_play_time,
          skills_developed: mergedSkills
        };
      }
      localStorage.setItem(localScoresKey, JSON.stringify(mergedScoresPayload));

      // 4. Salvar na nova tabela gamer_records localmente (Garantia de histórico unificado local)
      const localRecordsKey = `incluigamer_records_${student.id}`;
      const localRecords = JSON.parse(localStorage.getItem(localRecordsKey) || '[]');
      const gamerRecordPayload = {
        student_id: student.id,
        school_id: user.schoolId || student.schoolId || null,
        activity_name: game.name,
        xp_earned: score,
        level: levelInterno,
        progress_bncc: Math.round(aproveitamento),
        cognitive_seals: badges,
        heatmap_axes: {
          'Alfabetização': game.bioma === 'alfabetizacao' ? Math.round(desenvolvimento) : Math.round(coordenacao),
          'Raciocínio Lógico': game.bioma === 'matematico' ? Math.round(desenvolvimento) : Math.round((foco + desenvolvimento) / 2),
          'Socioemocional': game.bioma === 'emocoes' ? Math.round(desenvolvimento) : Math.round(emocional),
          'Percepção Sensorial': game.bioma === 'sensorial' ? Math.round(desenvolvimento) : Math.round(coordenacao * 0.9 + 5),
          'Coordenação Visomotora': Math.round(coordenacao)
        },
        date_played: new Date().toISOString(),
        status: 'concluído',
        notes: `Atividade concluída com sucesso. Foco: ${Math.round(foco)}%, Autonomia: ${Math.round(autonomia)}%, Coordenação: ${Math.round(coordenacao)}%.`
      };
      localRecords.push({ ...gamerRecordPayload, id: crypto.randomUUID() });
      localStorage.setItem(localRecordsKey, JSON.stringify(localRecords));

      console.log("[ACE Play] Salvamento local concluido com sucesso.");
    } catch (e) {
      console.error("[ACE Play] Falha critica ao salvar dados localmente no LocalStorage:", e);
    }

    // =========================================================================
    // TENTATIVA DE SINCRONIZAÇÃO EM NUVEM (SUPABASE - ESTRUTURA EXPANDIDA E INTEGRADA)
    // =========================================================================
    try {
      console.log("[ACE Play] Tentando sincronizar dados expandidos com a nuvem (Supabase)...");
      
      // Gravação na tabela gamer_records
      const { error: recErr } = await supabase.from('gamer_records').insert([
        {
          student_id: student.id,
          school_id: user.schoolId || student.schoolId || null,
          activity_name: game.name,
          xp_earned: score,
          level: levelInterno,
          progress_bncc: Math.round(aproveitamento),
          cognitive_seals: badges,
          heatmap_axes: {
            'Alfabetização': game.bioma === 'alfabetizacao' ? Math.round(desenvolvimento) : Math.round(coordenacao),
            'Raciocínio Lógico': game.bioma === 'matematico' ? Math.round(desenvolvimento) : Math.round((foco + desenvolvimento) / 2),
            'Socioemocional': game.bioma === 'emocoes' ? Math.round(desenvolvimento) : Math.round(emocional),
            'Percepção Sensorial': game.bioma === 'sensorial' ? Math.round(desenvolvimento) : Math.round(coordenacao * 0.9 + 5),
            'Coordenação Visomotora': Math.round(coordenacao)
          },
          date_played: new Date().toISOString(),
          status: 'concluído',
          notes: `Atividade concluída com sucesso. Foco: ${Math.round(foco)}%, Autonomia: ${Math.round(autonomia)}%, Coordenação: ${Math.round(coordenacao)}%.`
        }
      ]);
      if (recErr) {
        console.warn("[ACE Play] Erro ao gravar gamer_records no Supabase:", recErr.message);
      } else {
        console.log("[ACE Play] gamer_records persistido com sucesso no Supabase.");
      }

      // 1. Persistir no novo histórico de sessões (game_sessions)
      const gameSessionsPayload = {
        student_id: student.id,
        teacher_id: user.id,
        school_id: user.schoolId || null,
        game_id: game.id,
        game_name: game.name,
        game_category: game.bioma,
        started_at: new Date(startTime.current).toISOString(),
        finished_at: new Date().toISOString(),
        duration_seconds: Math.round(metrics.current.tempoTotalMs / 1000),
        score: score,
        xp_earned: score,
        level_reached: levelInterno,
        cognitive_score: Math.round(desenvolvimento),
        emotional_score: Math.round(emocional),
        engagement_score: Math.round(engajamento),
        focus_score: Math.round(foco),
        frustration_score: Math.round(100 - emocional),
        completed: aproveitamento >= 60,
        municipio_id: user.municipio_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: sessErr } = await supabase.from('game_sessions').insert([gameSessionsPayload]);
      if (sessErr) {
        console.warn("[ACE Play] Omitindo gravacao direta em game_sessions:", sessErr.message);
      }

      // 2. Persistir no Perfil Cognitivo Pré-Jogo (gamer_pre_profiles)
      if (preProfile) {
        const gamerPreProfilesPayload = {
          student_id: student.id,
          teacher_id: user.id,
          session_id: null,
          is_verbal: preProfile.comunicacao.verbal,
          uses_aac: preProfile.comunicacao.alternativa,
          understands_commands_level: preProfile.comunicacao.compreensao,
          echolalia: preProfile.comunicacao.ecolalia,
          sound_sensitivity: preProfile.sensorial.hipersensibilidadeSonora,
          visual_sensitivity: preProfile.sensorial.hipersensibilidadeVisual,
          stimulus_tolerance: preProfile.sensorial.toleranciaEstimulos,
          fine_motor_level: preProfile.coordenacao.motoraFina,
          input_preference: preProfile.coordenacao.touchscreen ? 'touchscreen' : 'mouse',
          knows_letters: preProfile.cognitivo.letras,
          knows_numbers: preProfile.cognitivo.numeros,
          knows_shapes: preProfile.cognitivo.formas,
          knows_colors: preProfile.cognitivo.cores,
          logical_association: preProfile.cognitivo.associacaoLogica,
          focus_minutes: preProfile.comportamental.tempoFocoMinutos,
          frustration_level: preProfile.comportamental.frustracaoAlta ? 'alta' : 'baixa',
          needs_positive_reinforcement: preProfile.comportamental.reforcoPositivo,
          autonomy_level: preProfile.comportamental.autonomia,
          municipio_id: user.municipio_id,
          school_id: user.schoolId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { error: profErr } = await supabase.from('gamer_pre_profiles').insert([gamerPreProfilesPayload]);
        if (profErr) {
          console.warn("[ACE Play] Omitindo gravacao direta em gamer_pre_profiles:", profErr.message);
        }
      }

      // 3. Persistir no Sistema de Progressão de Níveis (game_progression)
      const gameProgressionPayload = {
        student_id: student.id,
        game_id: game.id,
        current_level: proxNivelLiberado,
        max_level: 3,
        xp_total: score,
        stars: estrelas,
        unlocked_worlds: [game.bioma],
        last_played_at: new Date().toISOString(),
        municipio_id: user.municipio_id,
        school_id: user.schoolId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: existingProgression, error: selectProgressionError } = await supabase
        .from('game_progression')
        .select('id, current_level, stars')
        .eq('student_id', student.id)
        .eq('game_id', game.id)
        .maybeSingle();

      if (!selectProgressionError) {
        if (existingProgression) {
          await supabase
            .from('game_progression')
            .update({ 
              current_level: Math.max(existingProgression.current_level, gameProgressionPayload.current_level), 
              stars: Math.max(existingProgression.stars, gameProgressionPayload.stars), 
              xp_total: score,
              last_played_at: gameProgressionPayload.last_played_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgression.id);
        } else {
          await supabase.from('game_progression').insert([gameProgressionPayload]);
        }
      }

      // 4. Persistir logs de decisões do motor adaptativo (adaptive_engine_logs)
      const adaptiveEngineLogsPayload = {
        student_id: student.id,
        session_id: crypto.randomUUID(),
        decision_type: difficultyModulation.tamanhoAlvo === 'grande' ? 'facilitação_motora_alvo_grande' : 'modulação_cognitiva_opções',
        previous_state: { numeroOpcoes: 3, tamanhoAlvo: 'normal' },
        new_state: { numeroOpcoes: difficultyModulation.numeroOpcoes, tamanhoAlvo: difficultyModulation.tamanhoAlvo },
        reason: `ACE calibrou a jogabilidade de ${student.name} baseado no perfil comportamental (tempo de foco ${preProfile?.comportamental.tempoFocoMinutos}m, frustração ${preProfile?.comportamental.frustracaoAlta ? 'alta' : 'baixa'}).`,
        created_at: new Date().toISOString()
      };
      const { error: logErr } = await supabase.from('adaptive_engine_logs').insert([adaptiveEngineLogsPayload]);
      if (logErr) {
        console.warn("[ACE Play] Omitindo gravacao direta em adaptive_engine_logs:", logErr.message);
      }

      // =========================================================================
      // RETROCOMPATIBILIDADE (Para manter os dashboards e recursos legados funcionando perfeitamente)
      // =========================================================================
      const { data: existingProgress, error: selectProgError } = await supabase
        .from('game_progress')
        .select('id, current_level, stars_earned')
        .eq('student_id', student.id)
        .eq('game_id', game.id)
        .maybeSingle();
        
      if (selectProgError) throw selectProgError;

      if (existingProgress) {
        const { error: updateProgError } = await supabase
          .from('game_progress')
          .update({ 
            current_level: Math.max(existingProgress.current_level, progressPayload.current_level), 
            stars_earned: Math.max(existingProgress.stars_earned, progressPayload.stars_earned), 
            completed: progressPayload.completed || existingProgress.current_level >= 3, 
            last_played_at: progressPayload.last_played_at 
          })
          .eq('id', existingProgress.id);
        if (updateProgError) throw updateProgError;
      } else {
        const { error: insertProgError } = await supabase.from('game_progress').insert([progressPayload]);
        if (insertProgError) throw insertProgError;
      }
      
      const { error: insertLogError } = await supabase.from('player_behavior_logs').insert([behaviorLogPayload]);
      if (insertLogError) throw insertLogError;

      const { data: existingScore, error: selectScoreError } = await supabase
        .from('cognitive_scores')
        .select('id, skills_developed')
        .eq('student_id', student.id)
        .maybeSingle();

      if (selectScoreError) throw selectScoreError;

      if (existingScore) {
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
        
        const { error: updateScoreError } = await supabase
          .from('cognitive_scores')
          .update({ ...scoresPayload, skills_developed: mergedSkills })
          .eq('id', existingScore.id);
        if (updateScoreError) throw updateScoreError;
      } else {
        const { error: insertScoreError } = await supabase.from('cognitive_scores').insert([scoresPayload]);
        if (insertScoreError) throw insertScoreError;
      }
      
      console.log("[ACE Play] Sincronizacao em nuvem concluida.");
    } catch (err) {
      console.warn("[ACE Play] Erro ou tabela nao criada no Supabase (Modulo Premium). A sincronizacao em nuvem foi omitida com sucesso, mantendo o funcionamento autonomo local.", err);
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

        <div className="flex items-center gap-4 flex-wrap">
          {/* Slider de Volume Premium */}
          <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850/60 px-3 py-1.5 rounded-xl shadow-inner">
            <i className="fa-solid fa-volume-high text-xs text-indigo-400"></i>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">Volume</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={gameVolume}
              onChange={(e) => setGameVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 outline-none"
              title="Ajustar Volume do Exercício"
            />
            <span className="text-[9px] font-black text-indigo-300 w-8 text-right">{Math.round(gameVolume * 100)}%</span>
          </div>

          {currentRound > 1 && (
            <button
              onClick={handlePreviousRound}
              className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i> Voltar Atividade
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
          >
            <i className="fa-solid fa-xmark text-[10px]"></i> Cancelar Atividade
          </button>
        </div>
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

              {gameState.tipo === 'frase' && (
                <div className="text-2xl font-black text-indigo-350 max-w-lg mx-auto leading-relaxed bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-inner">
                  "{gameState.frase}"
                </div>
              )}

              {gameState.tipo === 'sons' && (
                <div className="space-y-4">
                  <button
                    onClick={() => playSynthesizedSound(gameState.audioKey)}
                    className="group relative text-5xl font-black text-emerald-400 bg-slate-900 border border-emerald-500/20 hover:border-emerald-400/50 p-6 rounded-3xl w-28 h-28 mx-auto shadow-inner flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Clique para ouvir o som novamente"
                  >
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="group-hover:animate-pulse">
                      {gameState.molde.slice(-2)}
                    </span>
                    <i className="fa-solid fa-volume-high text-xs text-emerald-500 absolute bottom-2 right-2 opacity-50 group-hover:opacity-100"></i>
                  </button>
                  <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest">Toque para escutar 🔊</p>
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
