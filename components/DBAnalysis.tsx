
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DB_METRICS, STORAGE_DISTRIBUTION, SYSTEM_POLICIES } from '../constants';

const DBAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [liveMetrics, setLiveMetrics] = useState(DB_METRICS);

  // Simulação de logs de auditoria em tempo real
  useEffect(() => {
    const events = [
      "Backup diário concluído com sucesso.",
      "Check de integridade: 0 inconsistências encontradas.",
      "Acesso administrativo detectado: Protocolo IP-192.168.0.1",
      "Sincronização com Secretaria concluída.",
      "Otimização de índices SQL finalizada.",
      "Alerta: Pico de requisições no módulo 'Matrícula'.",
      "Criptografia de repouso validada (AES-256).",
      "Sessão administrativa expirada para User_09."
    ];
    
    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      setLogs(prev => [`[${timestamp}] ${randomEvent}`, ...prev].slice(0, 8));
      
      // Flutuação leve nas métricas para dar vida ao painel
      setLiveMetrics(prev => prev.map(m => ({
        ...m,
        value: m.name === 'Conexões Ativas' 
          ? Math.max(10, Math.min(95, m.value + (Math.random() > 0.5 ? 1 : -1)))
          : m.value
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
  };
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50/10',
    purple: 'bg-purple-50/10',
    emerald: 'bg-emerald-50/10',
    orange: 'bg-orange-50/10',
  };
  const textMap: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Futurista */}
      <header className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="px-4 py-1.5 bg-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-blue-500/20">Acesso Restrito: SysAdmin</span>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Servidor: MAR-RJ-PRIMARY</span>
             </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Análise de Infraestrutura & BD</h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Monitoramento técnico de baixo nível, integridade de dados e políticas de segurança da rede IncluiEduTec.
          </p>
        </div>

        {/* Terminal de Logs */}
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 min-w-[320px] w-full lg:w-auto shadow-inner">
           <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-terminal"></i> Eventos do Sistema
              </p>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Live Stream</span>
           </div>
           <div className="space-y-2 h-32 overflow-hidden">
             {logs.length === 0 ? (
               <p className="text-xs text-slate-600 animate-pulse font-mono">Estabelecendo conexão segura...</p>
             ) : (
               logs.map((log, i) => (
                 <p key={i} className="text-[9px] font-mono text-slate-300 truncate opacity-80 border-l-2 border-blue-500/30 pl-2 animate-in slide-in-from-left duration-300">
                   {log}
                 </p>
               ))
             )}
           </div>
        </div>
      </header>

      {/* Grade de Métricas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {liveMetrics.map((metric) => (
          <div key={metric.name} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${bgMap[metric.color] || 'bg-gray-50'} ${textMap[metric.color] || 'text-gray-600'} group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${metric.icon} text-2xl`}></i>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Health Score</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">98%</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{metric.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{metric.value}</span>
                <span className="text-sm font-bold text-gray-400">{metric.unit}</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 text-gray-500">
                <span>Carga: {Math.round((metric.value / metric.total) * 100)}%</span>
                <span className="opacity-40">Teto: {metric.total}{metric.unit}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${colorMap[metric.color] || 'bg-gray-500'} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                  style={{ width: `${(metric.value / metric.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribuição Volumétrica de Dados */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                 <i className="fa-solid fa-chart-pie"></i>
              </div>
              Armazenamento por Objeto
            </h2>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-gray-50 dark:bg-slate-900 text-[8px] font-black text-gray-400 uppercase rounded-full">Atualizado: Agora</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STORAGE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1500}
                  stroke="none"
                >
                  {STORAGE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', 
                    padding: '15px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: '#0f172a',
                    color: '#fff'
                  }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Políticas de Segurança e Compliance */}
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 flex flex-col text-white">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
               <i className="fa-solid fa-shield-halved"></i>
            </div>
            Protocolos Ativos
          </h2>
          
          <div className="space-y-2 flex-1">
            {SYSTEM_POLICIES.map((policy) => (
              <div key={policy.label} className="flex justify-between items-center py-5 border-b border-slate-800 last:border-0 group">
                <div className="flex flex-col">
                   <span className="text-sm text-slate-200 font-black group-hover:text-blue-400 transition-colors">{policy.label}</span>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Gestão Automática</span>
                </div>
                <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-4 py-2 rounded-2xl uppercase tracking-widest border border-blue-400/20 shadow-lg shadow-blue-500/5">
                  {policy.value}
                </span>
              </div>
            ))}
            
            <div className="mt-auto pt-8">
              <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-xl shadow-blue-600/20 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-xl flex-shrink-0 shadow-lg">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-white font-black uppercase tracking-widest">Supabase Integrity</p> 
                    <p className="text-[10px] text-blue-100 leading-relaxed font-medium">
                      O sistema opera em modo de isolamento de linhas (RLS). Nenhum usuário acessa dados fora de sua jurisdição.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBAnalysis;
