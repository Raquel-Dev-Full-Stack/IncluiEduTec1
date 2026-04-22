
import React, { useState, useMemo } from 'react';
import { ActivityLog, Municipio, School, User } from '../types';
import Table from './Table';
import ModuleWrapper from './ModuleWrapper';

interface ActivityLogDashboardProps {
    logs: ActivityLog[];
    municipios: Municipio[];
    schools: School[];
    users: User[];
    onRefresh?: () => void;
}

const ActivityLogDashboard: React.FC<ActivityLogDashboardProps> = ({
    logs = [],
    municipios = [],
    schools = [],
    users = [],
    onRefresh
}) => {
    const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [municipioFilter, setMunicipioFilter] = useState<string>('');
    const [schoolFilter, setSchoolFilter] = useState<string>('');
    const [activeMode, setActiveMode] = useState<'audit' | 'system'>('audit');

    const filteredLogs = useMemo(() => {
        let result = logs ? [...logs] : [];

        // Filtro de Período
        if (periodFilter && periodFilter !== 'all') {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            result = result.filter(log => {
                if (!log.criado_em) return false;
                const logDate = new Date(log.criado_em);
                
                if (periodFilter === 'today') {
                    return logDate >= startOfToday;
                } else if (periodFilter === 'week') {
                    const lastWeek = new Date(now);
                    lastWeek.setDate(now.getDate() - 7);
                    return logDate >= lastWeek;
                } else if (periodFilter === 'month') {
                    const lastMonth = new Date(now);
                    lastMonth.setMonth(now.getMonth() - 1);
                    return logDate >= lastMonth;
                }
                return true;
            });
        }

        // Filtro de Município
        if (municipioFilter && municipioFilter !== "" && municipioFilter !== "all") {
            result = result.filter(log => log.municipio_id === municipioFilter);
        }

        // Filtro de Escola
        if (schoolFilter && schoolFilter !== "" && schoolFilter !== "all") {
            result = result.filter(log => log.school_id === schoolFilter);
        }

        return result;
    }, [logs, periodFilter, municipioFilter, schoolFilter]);

    // Otimização de "Joins" para exibição de nomes
    const userMap = useMemo(() => {
        const map: Record<string, string> = {};
        users.forEach(u => { if (u?.id) map[u.id] = u.name; });
        return map;
    }, [users]);

    const municipioMap = useMemo(() => {
        const map: Record<string, string> = {};
        municipios.forEach(m => { if (m?.id) map[m.id] = m.nome; });
        return map;
    }, [municipios]);

    const schoolMap = useMemo(() => {
        const map: Record<string, string> = {};
        schools.forEach(s => { if (s?.id) map[s.id] = s.name; });
        return map;
    }, [schools]);

    const profileMap: Record<string, string> = {
        'admin_geral': 'Administrador Geral',
        'secretaria': 'Secretaria de Educação',
        'diretor': 'Diretor Principal',
        'professor': 'Professor Oficial',
        'mediador': 'Mediador Oficial',
        'escola': 'Login da Escola'
    };

    return (
        <div className="space-y-6">
            <header className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl border border-slate-800 dark:border-slate-900">
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1 bg-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest text-white">Logs de Auditoria</span>
                    <span className="text-slate-400 text-[10px] uppercase font-black">Registros de Uso do Sistema</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">Registro de Atividades</h1>
                <p className="text-slate-400 text-sm mt-2">Monitore todas as ações realizadas por todos os perfis na plataforma.</p>
            </header>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 mb-2 ml-1">Período</label>
                        <select 
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value as any)}
                            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-black text-slate-950 dark:text-white"
                        >
                            <option value="all">Todos os Registros</option>
                            <option value="today">Hoje</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mês</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 mb-2 ml-1">Município</label>
                        <select 
                            value={municipioFilter}
                            onChange={(e) => setMunicipioFilter(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-black text-slate-950 dark:text-white"
                        >
                            <option value="">Todos os Municípios</option>
                            {municipios.map(m => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 mb-2 ml-1">Escola</label>
                        <select 
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-black text-slate-950 dark:text-white"
                        >
                            <option value="">Todas as Escolas</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({municipioMap[s.municipio_id || ''] || 'S/M'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3 pt-2">
                        <button 
                            onClick={() => {
                                setPeriodFilter('all');
                                setMunicipioFilter('');
                                setSchoolFilter('');
                            }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            <i className="fa-solid fa-filter-circle-xmark"></i>
                            Limpar Filtros e Ver Todos os Registros
                        </button>
                    </div>
                </div>
            </div>

            <ModuleWrapper 
                title="Lista de Atividades" 
                description={`Exibindo ${filteredLogs.length} registros encontrados no sistema.`}
            >
                {filteredLogs.length > 0 ? (
                    <Table<ActivityLog>
                        data={filteredLogs}
                        columns={[
                            { 
                                header: 'Data/Hora', 
                                accessor: (log) => <span className="text-slate-900 dark:text-slate-100 font-black text-xs">{new Date(log.criado_em).toLocaleString('pt-BR')}</span>
                            },
                            { 
                                header: 'Usuário', 
                                accessor: (log) => <span className="text-slate-900 dark:text-slate-100 font-black">{userMap[log.user_id] || 'Usuário Desconhecido'}</span>
                            },
                            { 
                                header: 'Perfil', 
                                accessor: (log) => {
                                    const profileLabel = profileMap[log.perfil] || log.perfil || 'Não Definido';
                                    return <span className="text-slate-800 dark:text-slate-300 font-black">{profileLabel}</span>
                                }
                            },
                            { 
                                header: 'Ação', 
                                accessor: (log) => {
                                    const action = log.acao.toLowerCase();
                                    let colorClass = 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
                                    if (action.includes('criar') || action.includes('cadastrar') || action.includes('lançar')) colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
                                    else if (action.includes('editar') || action.includes('atualizar')) colorClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                                    else if (action.includes('excluir') || action.includes('remover')) colorClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                                    else if (action.includes('exportar') || action.includes('pdf')) colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                                    
                                    return (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
                                            {log.acao}
                                        </span>
                                    );
                                }
                            },
                            { 
                                header: 'Detalhes', 
                                accessor: (log) => {
                                    const detailText = typeof log.detalhes === 'string' ? log.detalhes : JSON.stringify(log.detalhes);
                                    return (
                                        <div className="max-w-md break-words text-[12px] text-slate-800 dark:text-slate-200 font-bold leading-tight" title={detailText}>
                                            {detailText}
                                        </div>
                                    );
                                }
                            },
                            {
                                header: 'Município / Origem',
                                accessor: (log) => (
                                    <span className="text-slate-800 dark:text-slate-300 text-xs font-black">
                                        {log.municipio_id ? (municipioMap[log.municipio_id] || 'Externo') : 'Sistema Central'}
                                    </span>
                                )
                            },
                            {
                                header: 'Escola / Unidade',
                                accessor: (log) => (
                                    <span className="text-slate-800 dark:text-slate-300 text-xs font-black">
                                        {log.school_id ? (schoolMap[log.school_id] || 'Unidade N/I') : <span className="text-slate-500 dark:text-slate-400 italic">Rede Municipal</span>}
                                    </span>
                                )
                            }
                        ]}
                    />
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                            <i className="fa-solid fa-clock-rotate-left text-2xl text-gray-300"></i>
                        </div>
                        <h3 className="text-slate-950 dark:text-white font-black text-lg">Nenhuma atividade registrada</h3>
                        <p className="text-slate-800 dark:text-slate-300 text-sm mt-1 font-bold">Realize ações no sistema para visualizar os logs ou ajuste os filtros.</p>
                    </div>
                )}
            </ModuleWrapper>
        </div>
    );
};

export default ActivityLogDashboard;
