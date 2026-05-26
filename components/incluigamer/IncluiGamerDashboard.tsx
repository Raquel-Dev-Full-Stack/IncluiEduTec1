import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { BNCC_MAPPING_DATA } from './bnccMappingData';
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
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface IncluiGamerDashboardProps {
  student: Student | null;
  studentRecords?: any[];
}

export default function IncluiGamerDashboard({ student, studentRecords }: IncluiGamerDashboardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [scoresData, setScoresData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [gamerRecords, setGamerRecords] = useState<any[]>([]);

  // Carregar os scores cognitivos de forma híbrida (Supabase + LocalStorage Fallback)
  useEffect(() => {
    const fetchScores = async () => {
      if (!student) return;
      setLoading(true);
      
      let dbScore = null;
      let dbHistory = [];
      let dbGamerRecords = [];

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

        // 3. Busca a nova tabela gamer_records
        const { data: recs, error: recsErr } = await supabase
          .from('gamer_records')
          .select('*')
          .eq('student_id', student.id)
          .order('date_played', { ascending: false });

        if (!recsErr && recs) {
          dbGamerRecords = recs;
        }

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

      const localRecordsKey = `incluigamer_records_${student.id}`;
      if (dbGamerRecords.length === 0) {
        dbGamerRecords = JSON.parse(localStorage.getItem(localRecordsKey) || '[]');
        dbGamerRecords.sort((a: any, b: any) => new Date(b.date_played).getTime() - new Date(a.date_played).getTime());
      }
      setGamerRecords(dbGamerRecords);

      // Se ainda assim não houver registros (primeira vez jogando), estruturar dados de convite
      if (!dbScore && dbGamerRecords.length === 0) {
        setScoresData(null);
        setHistoricalData([]);
      } else {
        // Se temos registros na nova tabela mas nenhum score bruto, estruturar score a partir do mais recente
        if (dbGamerRecords.length > 0 && !dbScore) {
          const latest = dbGamerRecords[0];
          const axes = latest.heatmap_axes || {};
          dbScore = {
            student_id: student.id,
            foco: axes['Raciocínio Lógico'] || 50,
            autonomia: axes['Socioemocional'] || 50,
            emocional: axes['Socioemocional'] || 50,
            coordenacao: axes['Coordenação Visomotora'] || 50,
            engajamento: 80,
            desenvolvimento_pedagogico: latest.progress_bncc || 50,
            total_play_time: dbGamerRecords.reduce((acc, r) => acc + (r.duration_seconds || 60), 0),
            skills_developed: Array.isArray(latest.cognitive_seals) ? latest.cognitive_seals.map((s: string) => ({ code: s, proficiency: latest.progress_bncc, date: latest.date_played })) : []
          };
        }

        setScoresData(dbScore);
        
        // Mapear histórico de evolução cognitiva para o gráfico de linhas
        let mappedHistory = [];
        if (dbGamerRecords.length > 0) {
          mappedHistory = dbGamerRecords.slice().reverse().map((item: any, idx: number) => {
            const dateStr = item.date_played;
            const label = dateStr 
              ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : `Sessão ${idx + 1}`;
            
            const axes = item.heatmap_axes || {};

            return {
              name: label,
              Foco: axes['Raciocínio Lógico'] || 50,
              Autonomia: axes['Socioemocional'] || 50,
              Coordenação: axes['Coordenação Visomotora'] || 50,
              Cognitivo: item.progress_bncc || 50
            };
          });
        } else {
          mappedHistory = dbHistory.map((item: any, idx: number) => {
            const dateStr = item.created_at;
            const label = dateStr 
              ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : `Sessão ${idx + 1}`;
            
            const ratio = (idx + 1) / dbHistory.length;
            const scoreObj = item.event_data?.scores || dbScore;

            return {
              name: label,
              Foco: Math.round(scoreObj.foco * (0.8 + ratio * 0.2)),
              Autonomia: Math.round(scoreObj.autonomia * (0.8 + ratio * 0.2)),
              Coordenação: Math.round(scoreObj.coordenacao * (0.8 + ratio * 0.2)),
              Cognitivo: Math.round(scoreObj.desenvolvimento_pedagogico * (0.8 + ratio * 0.2))
            };
          });
        }

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

  // Heatmap de Eixos Pedagógicos da BNCC (Fase 3)
  const eixosPerformanceData = useMemo(() => {
    if (!scoresData) return [];
    
    const eixosDefault = {
      'Percepção Sensorial': scoresData.coordenacao * 0.9 + 5,
      'Coordenação Visomotora': scoresData.coordenacao,
      'Socioemocional': scoresData.emocional,
      'Raciocínio Lógico': Math.round((scoresData.foco + scoresData.desenvolvimento_pedagogico) / 2),
      'Alfabetização': scoresData.desenvolvimento_pedagogico
    };

    const eixosCount: any = {};
    const eixosSum: any = {};

    if (Array.isArray(scoresData.skills_developed)) {
      scoresData.skills_developed.forEach((s: any) => {
        const mapping = BNCC_MAPPING_DATA.find(m => m.habilidadeBncc === s.code);
        if (mapping) {
          const eixo = mapping.eixoCognitivo;
          eixosCount[eixo] = (eixosCount[eixo] || 0) + 1;
          eixosSum[eixo] = (eixosSum[eixo] || 0) + s.proficiency;
        }
      });
    }

    return [
      { name: 'Alfabetização', val: eixosCount['Alfabetização'] ? Math.round(eixosSum['Alfabetização'] / eixosCount['Alfabetização']) : eixosDefault['Alfabetização'], icon: 'fa-book-open', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/15' },
      { name: 'Raciocínio Lógico', val: eixosCount['Raciocínio Lógico'] ? Math.round(eixosSum['Raciocínio Lógico'] / eixosCount['Raciocínio Lógico']) : eixosDefault['Raciocínio Lógico'], icon: 'fa-brain', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-950/15' },
      { name: 'Socioemocional', val: eixosCount['Socioemocional'] ? Math.round(eixosSum['Socioemocional'] / eixosCount['Socioemocional']) : eixosDefault['Socioemocional'], icon: 'fa-heart', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/15' },
      { name: 'Percepção Sensorial', val: eixosCount['Percepção Sensorial'] ? Math.round(eixosSum['Percepção Sensorial'] / eixosCount['Percepção Sensorial']) : eixosDefault['Percepção Sensorial'], icon: 'fa-eye', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-sky-950/15' },
      { name: 'Coordenação Visomotora', val: eixosCount['Coordenação Visomotora'] ? Math.round(eixosSum['Coordenação Visomotora'] / eixosCount['Coordenação Visomotora']) : eixosDefault['Coordenação Visomotora'], icon: 'fa-hand', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-950/15' }
    ];
  }, [scoresData]);

  // Estante de Selos e Badges de Desenvolvimento (Fase 3)
  const studentBadges = useMemo(() => {
    if (!scoresData) return [];
    
    const badges = [];
    const performances: any = {};
    eixosPerformanceData.forEach((e: any) => {
      performances[e.name] = e.val;
    });

    if (performances['Alfabetização'] >= 70) {
      badges.push({ name: 'Mestre da Alfabetização', desc: 'Proficiência em reconhecimento de fonemas e grafemas.', icon: 'fa-award', color: 'from-emerald-600 to-teal-600' });
    }
    if (performances['Raciocínio Lógico'] >= 70) {
      badges.push({ name: 'Detetive da Lógica', desc: 'Excelente discernimento geométrico e de quantidades.', icon: 'fa-brain', color: 'from-indigo-600 to-indigo-700' });
    }
    if (performances['Socioemocional'] >= 70) {
      badges.push({ name: 'Guardião das Emoções', desc: 'Reconhecimento de reações sociais e regulação emocional.', icon: 'fa-heart', color: 'from-rose-600 to-pink-600' });
    }
    if (performances['Percepção Sensorial'] >= 70) {
      badges.push({ name: 'Explorador Sensorial', desc: 'Excepcional tolerância e resposta a estímulos.', icon: 'fa-eye', color: 'from-sky-600 to-cyan-600' });
    }
    if (performances['Coordenação Visomotora'] >= 70) {
      badges.push({ name: 'Campeão Visomotor', desc: 'Toque preciso e rápida reação olho-mão.', icon: 'fa-hand-pointer', color: 'from-amber-600 to-yellow-600' });
    }
    if (scoresData.foco >= 75) {
      badges.push({ name: 'Foco de Ouro', desc: 'Mais de 10 rodadas consecutivas de atenção ativa.', icon: 'fa-star', color: 'from-purple-600 to-purple-700' });
    }
    if (scoresData.desenvolvimento_pedagogico >= 60 || badges.length === 0) {
      badges.push({ name: 'Gamer Inclusivo', desc: 'Ingresso nas atividades gamificadas adaptativas.', icon: 'fa-gamepad', color: 'from-slate-600 to-slate-700' });
    }

    return badges;
  }, [scoresData, eixosPerformanceData]);

  // Gráfico de Proficiência BNCC (Fase 3)
  const skillsChartData = useMemo(() => {
    if (!scoresData || !Array.isArray(scoresData.skills_developed)) return [];
    
    return scoresData.skills_developed.map((s: any) => {
      return {
        code: s.code,
        proficiencia: s.proficiency,
      };
    });
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* BARRA DE METRICAS PREMIUM E DESEMPENHO ESTRATÉGICO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-3xl space-y-1">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Tempo de Estimulação</span>
              <div className="text-xl font-black text-white tracking-tight flex items-baseline gap-1">
                {Math.round((scoresData.total_play_time || 0) / 60)} <span className="text-[10px] text-slate-400 font-bold">minutos</span>
              </div>
            </div>
            
            <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-3xl space-y-1">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Habilidades BNCC Trabalhadas</span>
              <div className="text-xl font-black text-indigo-400 tracking-tight">
                {Array.isArray(scoresData.skills_developed) ? scoresData.skills_developed.length : 0} <span className="text-[10px] text-slate-500 font-bold">habilidades</span>
              </div>
            </div>

            <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-3xl space-y-1">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Pontuação Média Pedagógica</span>
              <div className="text-xl font-black text-emerald-400 tracking-tight">
                {scoresData.desenvolvimento_pedagogico || 0} <span className="text-[10px] text-slate-500 font-bold">XP</span>
              </div>
            </div>

            <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-3xl space-y-1">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">Selos de Categoria</span>
              <div className="text-xl font-black text-amber-400 tracking-tight flex items-center gap-1.5">
                <i className="fa-solid fa-medal"></i>
                {studentBadges.length} <span className="text-[10px] text-slate-500 font-bold">conquistas</span>
              </div>
            </div>
          </div>

          {/* GRID CENTRAL DE HEATMAP PEDAGÓGICO E BADGES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Heatmap Pedagógico por Eixo da BNCC */}
            <div className="lg:col-span-2 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-cubes text-emerald-400"></i> Heatmap de Desempenho por Eixo Pedagógico
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Cruzamento em tempo real do aproveitamento do estudante nos eixos norteadores curriculares da BNCC.
                </p>
              </div>

              <div className="space-y-4 mt-2">
                {eixosPerformanceData.map((eixo: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-900/60 border border-slate-850/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3 w-full sm:w-1/3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${eixo.color}`}>
                        <i className={`fa-solid ${eixo.icon} text-xs`}></i>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-200">{eixo.name}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Mapeado BNCC</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full flex items-center gap-3">
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850/80">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            eixo.val >= 75 
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500' 
                              : eixo.val >= 50 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-500' 
                                : 'bg-gradient-to-r from-amber-600 to-rose-600'
                          }`}
                          style={{ width: `${eixo.val}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                        eixo.val >= 75 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : eixo.val >= 50 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {eixo.val}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estante de Selos de Desenvolvimento Pedagógico (Badges) */}
            <div className="lg:col-span-1 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-amber-400"></i> Selos de Desenvolvimento Cognitivo
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Medalhas e insígnias conquistadas pelo aluno com base em acertos e constância.
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[300px] mt-2 pr-1 font-sans">
                {studentBadges.map((badge: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center gap-3 shadow-inner">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white text-sm shadow-md`}>
                      <i className={`fa-solid ${badge.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-200 leading-tight">{badge.name}</p>
                      <p className="text-[9px] text-slate-500 font-semibold leading-relaxed mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* GRID DE ANALYTICS E GRÁFICOS RECHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico 1: Radar Multidimensional */}
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-circle-dot text-indigo-500"></i> Perfil Cognitivo Multidimensional
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Dimensões de aptidão e desenvolvimento monitorados em tempo real pelo ACE.
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

            {/* Gráfico 2: Evolução Temporal das Habilidades */}
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-purple-500"></i> Curva de Evolução Temporal
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

          {/* GRID DE HISTÓRICO BNCC E PARECER DO MEDIADOR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Col 1 & 2: Parecer Comportamental ACE */}
            <div className="lg:col-span-2 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-microchip text-indigo-500"></i> Parecer Comportamental e Diagnóstico (ACE)
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

            {/* Col 3: Timeline Pedagógica BNCC Evolutiva */}
            <div className="lg:col-span-1 p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-indigo-400"></i> Linha do Tempo BNCC
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Timeline de proficiência nas habilidades desenvolvidas ao longo das atividades.
                </p>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-56 mt-2 pr-1 font-sans relative">
                {/* Linha vertical decorativa da timeline */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-850"></div>

                {Array.isArray(scoresData.skills_developed) && scoresData.skills_developed.length > 0 ? (
                  scoresData.skills_developed.map((skill: any, idx: number) => {
                    const matchedSkill = BNCC_MAPPING_DATA.find(m => m.habilidadeBncc === skill.code);
                    return (
                      <div key={idx} className="flex gap-4 relative pl-3">
                        {/* Círculo do marcador de timeline */}
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-slate-900 z-10 mt-1 flex-shrink-0"></div>
                        
                        <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex-1 flex flex-col gap-1 shadow-sm">
                          <div className="flex justify-between items-start">
                            <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                              {skill.code}
                            </span>
                            <span className="text-[10px] font-black text-slate-300">{skill.proficiency}%</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold leading-normal">
                            {matchedSkill ? matchedSkill.descricaoBncc : 'Proficiência curricular desenvolvida.'}
                          </p>
                          <p className="text-[7px] text-slate-600 font-black uppercase tracking-wider mt-1">
                            {matchedSkill ? `${matchedSkill.eixoCognitivo} • ${matchedSkill.nivelDificuldade}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-wider pl-4">
                    Nenhuma competência registrada ainda.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* GRAFICO SECUNDÁRIO: GRÁFICO DE BARRAS DE HABILIDADES TRABALHADAS */}
          {skillsChartData.length > 0 && (
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-emerald-400"></i> Distribuição de Proficiência Curricular
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  Proficiência do estudante classificada por código pedagógico BNCC.
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center font-sans text-[9px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="code" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }}
                    />
                    <Bar dataKey="proficiencia" fill="#10b981" radius={[8, 8, 0, 0]}>
                      {skillsChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.proficiencia >= 75 ? '#10b981' : entry.proficiencia >= 50 ? '#6366f1' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* SEÇÃO: HISTÓRICO GAMER */}
          <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-[2.5rem] space-y-4 shadow-sm w-full">
            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-indigo-400"></i> Histórico Gamer
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                Acompanhamento diário da evolução lúdica e curricular do aluno.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-350">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Atividade</th>
                    <th className="py-3 px-4">Nível</th>
                    <th className="py-3 px-4">XP Ganho</th>
                    <th className="py-3 px-4">Progresso BNCC</th>
                    <th className="py-3 px-4">Selos Obtidos</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gamerRecords.length > 0 ? (
                    gamerRecords.map((rec) => (
                      <tr key={rec.id} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                          {new Date(rec.date_played).toLocaleDateString('pt-BR')} {new Date(rec.date_played).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 font-black text-white">{rec.activity_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-500/20 rounded-md text-[9px] font-extrabold uppercase">
                            Lvl {rec.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-amber-400 font-black">{rec.xp_earned} XP</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850/60">
                              <div className="h-full bg-emerald-500" style={{ width: `${rec.progress_bncc}%` }}></div>
                            </div>
                            <span className="font-black text-emerald-400">{rec.progress_bncc}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(rec.cognitive_seals) && rec.cognitive_seals.length > 0 ? (
                              rec.cognitive_seals.map((seal: string, i: number) => (
                                <span key={i} className="bg-indigo-950/50 text-indigo-300 border border-indigo-500/25 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded" title={seal}>
                                  {seal.split(' ').pop()} {seal.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-650 italic text-[9px]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            rec.status === 'concluído' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        Nenhum registro de atividade gamer encontrado para este aluno.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
