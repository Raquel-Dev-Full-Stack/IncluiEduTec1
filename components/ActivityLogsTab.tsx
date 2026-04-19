
import React from 'react';
import { ActivityLog } from '../types';
import Table from './Table';
import ModuleWrapper from './ModuleWrapper';

interface ActivityLogsTabProps {
    logs: ActivityLog[];
    userId: string;
}

const ActivityLogsTab: React.FC<ActivityLogsTabProps> = ({ logs, userId }) => {
    const userLogs = logs.filter(log => log.user_id === userId);

    return (
        <ModuleWrapper 
            title="Meu Histórico de Atividades" 
            description="Visualize todas as suas ações recentes realizadas no sistema."
        >
            {userLogs.length > 0 ? (
                <Table<ActivityLog>
                    data={userLogs}
                    columns={[
                        { 
                            header: 'Data/Hora', 
                            accessor: (log) => new Date(log.criado_em).toLocaleString('pt-BR') 
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
                            accessor: (log) => (
                                <div className="max-w-md text-[11px] text-gray-700 dark:text-slate-200">
                                    {typeof log.detalhes === 'string' ? log.detalhes : JSON.stringify(log.detalhes)}
                                </div>
                            )
                        }
                    ]}
                />
            ) : (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                        <i className="fa-solid fa-clock-rotate-left text-2xl text-gray-300 dark:text-slate-700"></i>
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-bold">Nenhuma atividade registrada</h3>
                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Suas ações no sistema aparecerão aqui automaticamente.</p>
                </div>
            )
}
        </ModuleWrapper>
    );
};

export default ActivityLogsTab;
