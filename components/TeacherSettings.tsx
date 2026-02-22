
import React, { useState } from 'react';

const TeacherSettings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gray-800 flex items-center justify-center text-white text-2xl shadow-xl shadow-gray-100">
            <i className="fa-solid fa-user-gear"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configurações de Perfil</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gerencie seu acesso e preferências de notificação</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            Acesso e Segurança
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail de Acesso</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue="professor@escola.br"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nova Senha</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              </div>
            </div>
            <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-100 transition-all active:scale-95">
              Atualizar Credenciais
            </button>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-bell text-lg"></i>
            </div>
            Notificações e Preferências
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope-open-text text-amber-500"></i>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Alertas por E-mail</span>
                  <span className="text-[9px] text-gray-400 uppercase font-black">Resumo diário de turmas</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
               <p className="text-[10px] text-indigo-700 font-bold leading-relaxed uppercase tracking-tighter">
                 <i className="fa-solid fa-circle-info mr-2"></i>
                 Suas preferências de visualização influenciam apenas no seu portal individual.
               </p>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between shadow-2xl shadow-blue-900/40">
        <div>
          <h4 className="text-xl font-black tracking-tight">Salvar Alterações?</h4>
          <p className="text-slate-400 text-xs font-medium">As mudanças nas notificações e e-mail serão aplicadas imediatamente.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-10 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
            Aplicar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
