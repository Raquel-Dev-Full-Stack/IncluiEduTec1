
import React, { useState } from 'react';

const MediatorSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reports: true
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-white text-2xl shadow-xl shadow-slate-100">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configurações de Acesso</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão de credenciais e preferências de notificação</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Segurança */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-key text-lg"></i>
            </div>
            Credenciais de Segurança
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail Institucional *</label>
              <input 
                type="email" 
                defaultValue="mariana.med@escola.br"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha de Acesso *</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmar Nova Senha</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="w-full py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-100 transition-all active:scale-95">
              Atualizar Credenciais
            </button>
          </div>
        </section>

        {/* Notificações */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <i className="fa-solid fa-bell text-lg"></i>
            </div>
            Preferências de Alerta
          </h3>
          <div className="space-y-4">
            {[
              { id: 'email', label: 'Notificações por E-mail', desc: 'Resumo semanal de mediação', icon: 'fa-envelope-open-text' },
              { id: 'push', label: 'Alertas no Navegador', desc: 'Novas mensagens da Secretaria', icon: 'fa-window-maximize' },
              { id: 'reports', label: 'Relatórios Mensais', desc: 'Aviso de geração automática', icon: 'fa-file-invoice' },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${pref.icon} text-rose-500`}></i>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">{pref.label}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-black">{pref.desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-300 animate-in fade-in ${
                    (notifications as any)[pref.id] ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {(notifications as any)[pref.id] ? 'Ativo' : 'Não ativo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={(notifications as any)[pref.id]} 
                      onChange={() => setNotifications({ ...notifications, [pref.id]: !(notifications as any)[pref.id] })}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-rose-500/10 border border-rose-500/35 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-rose-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/35 peer-checked:after:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            ))}
            
            <div className="p-6 bg-indigo-900 rounded-[2rem] text-white">
               <p className="text-[11px] font-bold leading-relaxed opacity-80 mb-4 uppercase tracking-tighter">Status da Conta</p>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-sm font-black uppercase tracking-widest">Mediador Ativo na Rede</span>
               </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between shadow-2xl">
        <div>
          <h4 className="text-xl font-black tracking-tight">Deseja aplicar estas mudanças?</h4>
          <p className="text-slate-400 text-xs font-medium">As alterações de e-mail e senha serão auditadas pela Secretaria Municipal.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-10 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediatorSettings;
