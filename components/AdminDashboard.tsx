
import React, { useState } from 'react';
import { School, Class, User, Student, Attendance, Meal, MediationRecord, Report, UserProfile } from '../types';
import Table from './Table';
import ModuleWrapper from './ModuleWrapper';

interface AdminDashboardProps {
    escolas: School[];
    turmas: Class[];
    professores: User[];
    alunos: Student[];
    presencas: Attendance[];
    refeicoes: Meal[];
    mediacao: MediationRecord[];
    relatorios: Report[];
    modo: "total";
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    escolas,
    turmas,
    professores,
    alunos,
    presencas,
    refeicoes,
    mediacao,
    relatorios
}) => {
    const [activeTab, setActiveTab] = useState('escolas');

    const tabs = [
        { id: 'escolas', label: 'Escolas', icon: 'fa-school' },
        { id: 'turmas', label: 'Turmas', icon: 'fa-layer-group' },
        { id: 'professores', label: 'Professores', icon: 'fa-chalkboard-user' },
        { id: 'alunos', label: 'Alunos', icon: 'fa-graduation-cap' },
        { id: 'presencas', label: 'Presenças', icon: 'fa-calendar-check' },
        { id: 'refeicoes', label: 'Refeições', icon: 'fa-plate-wheat' },
        { id: 'mediacao', label: 'Mediação', icon: 'fa-hand-holding-heart' },
        { id: 'relatorios', label: 'Relatórios', icon: 'fa-file-lines' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'escolas':
                return (
                    <Table<School>
                        data={escolas}
                        columns={[
                            { header: 'Nome', accessor: 'name' },
                            { header: 'INEP', accessor: 'inep' },
                            { header: 'Cidade', accessor: 'city' },
                            { header: 'Status', accessor: (s) => s.active ? 'Ativa' : 'Inativa' }
                        ]}
                    />
                );
            case 'turmas':
                return (
                    <Table<Class>
                        data={turmas}
                        columns={[
                            { header: 'Turma', accessor: 'name' },
                            { header: 'Ano', accessor: 'year' },
                            { header: 'Escola ID', accessor: 'schoolId' }
                        ]}
                    />
                );
            case 'professores':
                return (
                    <Table<User>
                        data={professores.filter(u => u.profile === UserProfile.PROFESSOR)}
                        columns={[
                            { header: 'Nome', accessor: 'name' },
                            { header: 'E-mail', accessor: 'email' },
                            { header: 'Escola ID', accessor: 'schoolId' }
                        ]}
                    />
                );
            case 'alunos':
                return (
                    <Table<Student>
                        data={alunos}
                        columns={[
                            { header: 'Nome', accessor: 'name' },
                            { header: 'RA', accessor: 'ra' },
                            { header: 'Escola ID', accessor: 'schoolId' }
                        ]}
                    />
                );
            case 'presencas':
                return (
                    <Table<Attendance>
                        data={presencas}
                        columns={[
                            { header: 'Data', accessor: (a) => new Date(a.date).toLocaleDateString('pt-BR') },
                            { header: 'Aluno ID', accessor: 'studentId' },
                            { header: 'Status', accessor: 'status' }
                        ]}
                    />
                );
            case 'refeicoes':
                return (
                    <Table<Meal>
                        data={refeicoes}
                        columns={[
                            { header: 'Data', accessor: (m) => new Date(m.date).toLocaleDateString('pt-BR') },
                            { header: 'Aluno ID', accessor: 'studentId' },
                            { header: 'Tipo', accessor: 'type' },
                            { header: 'Status', accessor: 'status' }
                        ]}
                    />
                );
            case 'mediacao':
                return (
                    <Table<MediationRecord>
                        data={mediacao}
                        columns={[
                            { header: 'Data', accessor: (r) => new Date(r.date).toLocaleDateString('pt-BR') },
                            { header: 'Aluno ID', accessor: 'studentId' },
                            { header: 'Status', accessor: 'status' },
                            { header: 'Comportamento', accessor: 'behaviorStatus' }
                        ]}
                    />
                );
            case 'relatorios':
                return (
                    <Table<Report>
                        data={relatorios}
                        columns={[
                            { header: 'Título', accessor: 'title' },
                            { header: 'Tipo', accessor: 'type' },
                            { header: 'Status', accessor: 'status' }
                        ]}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl border border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1 bg-rose-600 text-[10px] font-black uppercase rounded-full tracking-widest">Painel Admin Geral</span>
                    <span className="text-slate-400 text-[10px] uppercase font-black">Acesso Total (CRUD)</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">Gestão Centralizada do Sistema</h1>
                <p className="text-slate-400 text-sm mt-2">Visão completa e irrestrita de todas as tabelas e registros da rede.</p>
            </header>

            <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <ModuleWrapper
                title={tabs.find(t => t.id === activeTab)?.label || ''}
                description={`Gerenciamento completo da tabela de ${activeTab}.`}
            >
                {renderContent()}
            </ModuleWrapper>
        </div>
    );
};

export default AdminDashboard;
