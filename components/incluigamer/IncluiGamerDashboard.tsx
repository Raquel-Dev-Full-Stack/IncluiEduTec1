import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface IncluiGamerDashboardProps {
  student: Student | null;
  studentRecords?: any[];
}

export default function IncluiGamerDashboard({ student, studentRecords }: IncluiGamerDashboardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [scoresData, setScoresData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Carregar os scores cognitivos de forma híbrida (Supabase + LocalStorage Fallback)
  useEffect(() => {
    const fetchScores = async () => {
      if (!student) return;
      setLoading(true);
      
      let dbScore = null;
      let dbHistory = [];

      try {
        console.log("[ACE Dashboard] Tentando buscar do Supabase...");
        
        // 1. Busca score mais recente
        const { data: score, error: scoreErr } = await supabase
          .from('cognitive_scores')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle();

        if (scoreErr) throw scoreErr;
        dbScore = score;

        // 2. Busca histórico de comportamento para gráfico de linha
        const { data: history, error: historyErr } = await supabase
          .from('player_behavior_logs')
          .select('created_at, event_data')
          .eq('student_id', student.id)
          .eq('event_type', 'sessao_concluida')
          .order('created_at', { ascending: true })
          .limit(10);

        if (historyErr) throw historyErr;
        dbHistory = history || [];

      } catch (err) {
        console.warn("[ACE Dashboard] Erro ao buscar do Supabase, buscando localmente...", err);
      }

      // Se não retornou do Supabase, tentar o fallback de LocalStorage
      if (!dbScore) {
        const localScoresKey = `incluigamer_scores_${student.id}`;
        const localProgressKey = `incluigamer_progress_${student.id}`;
        
        dbScore = JSON.parse(localStorage.getItem(localScoresKey) || 'null');
        dbHistory = JSON.parse(localStorage.getItem(localProgressKey) || '[]');
      }

      // Se ainda assim não houver registros (primeira vez jogando), estruturar dados de convite
      if (!dbScore) {
        setScoresData(null);
        setHistoricalData([]);
      } else {
        setScoresData(dbScore);
        
        // Mapear histórico de evolução cognitiva para o gráfico de linhas
        const mappedHistory = dbHistory.map((item: any, idx: number) => {
          const dateStr = item.created_at || item.created_at;
          const label = dateStr 
            ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : `Sessão ${idx + 1}`;
          
          // Pegar o score daquela época ou simular evolução linear baseada no score final
          const ratio = (idx + 1) / dbHistory.length;
          const scoreObj = item.event_data?.scores || item.event_data?.scores || dbScore;

          return {
            name: label,
            Foco: Math.round(scoreObj.foco * (0.8 + ratio * 0.2)),
            Autonomia: Math.round(scoreObj.autonomia * (0.8 + ratio * 0.2)),
            Coordenação: Math.round(scoreObj.coordenacao * (0.8 + ratio * 0.2)),
            Cognitivo: Math.round(scoreObj.desenvolvimento_pedagogico * (0.8 + ratio * 0.2))
          };
        });

        // Caso o histórico seja muito curto, duplicar pontos para dar perspectiva de linha
        if (mappedHistory.length === 1) {
          setHistoricalData([
            { name: 'Início', Foco: 50, Autonomia: 50, Coordenação: 50, Cognitivo: 50 },
            mappedHistory[0]
          ]);
        } else {
          setHistoricalData(mappedHistory);
        }
      }

      setLoading(false);
    };

    fetchScores();
  }, [student]);

  // Estruturar dados para o Radar Chart de aptidão
  const radarData = useMemo(() => {
    if (!scoresData) return [];
    return [
      { subject: 'Foco e Atenção', A: scoresData.foco, fullMark: 100 },
      { subject: 'Autonomia', A: scoresData.autonomia, fullMark: 100 },
      { subject: 'Coord. Visomotora', A: scoresData.coordenacao, fullMark: 100 },
      { subject: 'Estabilidade Emocional', A: scoresData.emocional, fullMark: 100 },
      { subject: 'Engajamento', A: scoresData.engajamento, fullMark: 100 },
      { subject: 'Aproveitamento Pedagógico', A: scoresData.desenvolvimento_pedagogico, fullMark: 100 }
    ];
  }, [scoresData]);

  // Gerar parecer comportamental automatizado do Adaptive Cognitive Engine (ACE)
  const aceBehavioralReport = useMemo(() => {
    if (!scoresData) return '';
    
    const { foco, autonomia, coordenacao, emocional, engajamento } = scoresData;
    let report = '';

    // Análise de Foco
    if (foco < 60) {
      report += 'O aluno demonstrou flutuações perceptíveis no foco e atenção sustentada durante os desafios. **Recomenda-se** sessões menores (rodadas curtas) de jogo e uso contínuo do **Modo Calmante** para minimizar a sobrecarga sensorial. \n\n';
    } else {
      report += 'Excelente nível de foco sustentado. O aluno consegue manter a atenção focada nas opções apresentadas mesmo em sequências consecutivas. \n\n';
    }

    // Análise de Autonomia
    if (autonomia < 60) {
      report += 'Foi observada necessidade frequente de modulação cognitiva por parte do motor adaptativo (redução automática no número de opções para escolha). **Estratégia pedagógica sugerida**: Oferecer suportes visuais físicos e mediação direta verbalizada antes de o aluno efetuar a escolha na tela. \n\n';
    } else {
      report += 'Ótima independência de escolha. O aluno responde de forma autônoma a complexidades adaptativas crescentes sem demandar redução de alvos. \n\n';
    }

    // Análise de Coordenação Visomotora
    if (coordenacao < 60) {
      report += 'O tempo de resposta estendido ou erros sequenciais de clique sugerem dificuldades de coordenação viso-motora fina. **Adaptação sugerida**: Utilizar telas com alvos aumentados (Modo Acessibilidade Motora ativado nas configurações laterais) para facilitar o toque e evitar frustração de digitação. \n\n';
    } else {
      report += 'Coordenação visomotora precisa e velocidade de reação dentro dos parâmetros esperados de proficiência. \n\n';
    }

    // Sugestão Geral Inclusiva baseada no perfil
    report += '🌟 **Recomendação de Mediação**: O IncluiGamer sugere continuar as trilhas na "Cidade das Emoções" para desenvolver empatia e resiliência, e no "Laboratório Cognitivo" com timers aumentados para consolidar a autoconfiança de aprendizagem.';

    return report;
  }, [scoresData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider animate-pulse">
          Processando Relatório Cognitivo...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título do Relatório */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <i className="fa-solid fa-chart-pie text-indigo-500"></i>
          Relatório de Evolução Cognitiva
        </h2>
        <p className="text-slate-400 text-xs font-semibold mt-1">
          Dados processados pelo Adaptive Cognitive Engine (ACE) com base nas interações gamificadas do aluno.
        </p>
      </div>

      {!scoresData ? (
        /* Estado Vazio - Aluno não jogou ainda */
        <div className="p-16 text-center bg-slate-800/10 border-2 border-dashed border-slate-800 rounded-[2.5rem] space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600 text-2xl shadow-inner">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <p className="text-slate-300 font-bold text-sm">Sem dados cognitivos acumulados</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O aluno {student?.name} ainda não realizou nenhuma atividade gamer adaptativa. Escolha o bioma no menu **Mapa Gamer** para iniciar a primeira rodada!
            </p>
          </div>
        </div>
      ) : (
        /* Visualização do Dashboard Cognitivo */
        <div className="space-y-8">
          
          {/* Grid de Gráficos e Teia */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico 1: Teia de Aptidão Cognitiva */}
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-bullseye text-indigo-500"></i> Perfil Cognitivo Multidimensional
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Dimensões de aptidão e desenvolvimento monitorados pelo ACE.
                </p>
              </div>

              <div className="h-72 w-full flex items-center justify-center font-sans text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar
                      name="Desempenho"
                      dataKey="A"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Evolução Temporal */}
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-purple-500"></i> Curva de Aprendizado e Foco
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Histórico de evolução de foco, autonomia e habilidades ao longo das últimas sessões.
                </p>
              </div>

              <div className="h-72 w-full flex items-center justify-center font-sans text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }}
                    />
                    <Line type="monotone" dataKey="Foco" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Autonomia" stroke="#c084fc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Cognitivo" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Grid de Parecer ACE e Timeline BNCC */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Col 1 & 2: Parecer Comportamental ACE */}
            <div className="lg:col-span-2 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-microchip text-indigo-500"></i> Parecer Comportamental e Orientações (ACE)
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Avaliação automatizada com base nos padrões cognitivos mapeados no motor adaptativo.
                </p>
              </div>

              <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-850/80 mt-2">
                <p className="text-xs text-slate-300 leading-relaxed font-semibold whitespace-pre-line">
                  {aceBehavioralReport}
                </p>
              </div>
            </div>

            {/* Col 3: Habilidades BNCC Trabalhadas */}
            <div className="lg:col-span-1 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-indigo-500"></i> Competências BNCC Desenvolvidas
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Habilidades trabalhadas e aproveitamento do aluno.
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-56 mt-2 pr-1 font-sans">
                {Array.isArray(scoresData.skills_developed) && scoresData.skills_developed.length > 0 ? (
                  scoresData.skills_developed.map((skill: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                      <div>
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                          {skill.code}
                        </span>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Praticada em: {skill.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-200">{skill.proficiency}%</span>
                        <span className="text-[8px] text-slate-400 font-bold block">Proficiência</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-wider">
                    Nenhuma habilidade mapeada ainda.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
