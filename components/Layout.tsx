
import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import RoboChat from './RoboChat';
import GuidedTour from './GuidedTour';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  backgroundTheme?: string;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeTab, setActiveTab, children, backgroundTheme = 'padrao' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  React.useEffect(() => {
    const handleStartTour = () => setIsTourOpen(true);
    window.addEventListener('startTour', handleStartTour);
    return () => window.removeEventListener('startTour', handleStartTour);
  }, []);

  const getBackgroundClass = (theme: string) => {
    switch (theme) {
      case 'gradiente': return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-100';
      case 'dark-blue': return 'bg-slate-950 text-slate-200';
      case 'glass': return 'bg-gradient-to-tr from-slate-100 to-white/80 backdrop-blur-xl bg-fixed';
      case 'minimal': return 'bg-white';
      case 'soft': return 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-50/30 via-white to-orange-50/20';
      default: return 'bg-gray-50';
    }
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: string;
    adminOnly?: boolean;
    profileOnly?: UserProfile[];
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-house',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR, UserProfile.PROFESSOR, UserProfile.MEDIADOR]
    },
    {
      id: 'admin_total',
      label: 'Sistema',
      icon: 'fa-shield-halved',
      profileOnly: [UserProfile.ADMIN]
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: 'fa-comments',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR]
    },
    {
      id: 'schools',
      label: user.profile === UserProfile.DIRETOR ? 'Minha Escola' : 'Escolas',
      icon: 'fa-school',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR]
    },
    {
      id: 'diario_classe',
      label: 'Diário de Classe',
      icon: 'fa-book-open-reader',
      profileOnly: [UserProfile.PROFESSOR]
    },
    {
      id: 'turmas',
      label: 'Turmas',
      icon: 'fa-users-rectangle',
      profileOnly: [UserProfile.DIRETOR]
    },
    {
      id: 'teachers',
      label: 'Professores',
      icon: 'fa-chalkboard-user',
      profileOnly: [UserProfile.DIRETOR]
    },
    {
      id: 'alunos',
      label: 'Alunos',
      icon: 'fa-children',
      profileOnly: [UserProfile.DIRETOR, UserProfile.MEDIADOR]
    },
    {
      id: 'refeicoes',
      label: 'Refeições',
      icon: 'fa-utensils',
      profileOnly: [UserProfile.PROFESSOR]
    },
    {
      id: 'inclusive_plans',
      label: 'Planos Inclusivos',
      icon: 'fa-file-medical',
      profileOnly: []
    },
    {
      id: 'mediation',
      label: user.profile === UserProfile.MEDIADOR ? 'Registros de Mediação' : 'Mediação',
      icon: 'fa-hand-holding-heart',
      profileOnly: [UserProfile.DIRETOR, UserProfile.MEDIADOR]
    },
    {
      id: 'db_analysis',
      label: 'Análise de BD',
      icon: 'fa-database',
      profileOnly: [UserProfile.ADMIN]
    },
    {
      id: 'registros',
      label: user.profile === UserProfile.ADMIN ? 'Secretarias de Educação' : 'Registros',
      icon: 'fa-book',
      profileOnly: [UserProfile.ADMIN]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: 'fa-file-invoice',
      profileOnly: [UserProfile.MEDIADOR]
    },
    {
      id: 'activity_logs',
      label: 'Registro de Atividades',
      icon: 'fa-clock-rotate-left',
      profileOnly: [UserProfile.DIRETOR]
    },
    {
      id: 'curso_inclusao',
      label: 'Curso de Inclusão',
      icon: 'fa-graduation-cap',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR, UserProfile.PROFESSOR, UserProfile.MEDIADOR]
    },
    {
      id: 'help',
      label: 'Como Usar',
      icon: 'fa-circle-question',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR, UserProfile.PROFESSOR, UserProfile.MEDIADOR]
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: 'fa-gear',
      profileOnly: [UserProfile.ADMIN, UserProfile.SECRETARIA, UserProfile.DIRETOR, UserProfile.PROFESSOR, UserProfile.MEDIADOR]
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user.profile !== UserProfile.ADMIN) return false;
    if (item.profileOnly && !item.profileOnly.includes(user.profile)) return false;
    return true;
  });

  const handleTabSelection = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-['Inter'] transition-colors duration-500 ${getBackgroundClass(backgroundTheme)}`}>
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        id="tour-sidebar"
        className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-40 transition-transform duration-300 transform
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex-shrink-0
      `}>
        <div className="p-6 border-b border-slate-800 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center shadow-lg shadow-blue-900/40">
              <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
            </div>
            <span className="font-bold text-white tracking-tight">IncluiEduTec</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-slate-500 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabSelection(item.id)}
              id={`tour-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-left ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
            </button>
          ))}
        </nav>

        <div id="tour-user" className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {(user.name || 'Usuário').charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase truncate font-bold">{user.profile}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-blue-600"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span className="hidden sm:inline">Portal</span>
              <i className="fa-solid fa-chevron-right text-[10px] hidden sm:inline"></i>
              <span className="text-gray-900 font-bold">
                {menuItems.find(m => m.id === activeTab)?.label || 'Sistema'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xs:flex items-center gap-2 text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {user.municipality}
            </div>
            <button className="text-gray-400 hover:text-blue-600 transition-colors relative p-2">
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
        <RoboChat activeTab={activeTab} userName={user.name} />
        <GuidedTour 
          isOpen={isTourOpen} 
          onClose={() => setIsTourOpen(false)} 
          menuItems={filteredMenuItems}
        />
      </main>
    </div>
  );
};

export default Layout;
