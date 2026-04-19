
import React, { useState, useEffect } from 'react';
import { User, SystemSettings } from '../types';

interface SettingsProps {
  user: User;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (settings: SystemSettings) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateTheme, systemSettings, onUpdateSystemSettings }) => {
  const [language, setLanguage] = useState(systemSettings.activeLanguage || 'pt-br');
  const [notifications, setNotifications] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados locais para edição das configurações do sistema
  const [localButtonColor, setLocalButtonColor] = useState(systemSettings.buttonColor);
  const [localFontFamily, setLocalFontFamily] = useState(systemSettings.fontFamily);
  const [localFontSize, setLocalFontSize] = useState(systemSettings.fontSize);
  const [localStudentLimit, setLocalStudentLimit] = useState(systemSettings.studentLimit);
  const [localMediatorRatio, setLocalMediatorRatio] = useState(systemSettings.mediatorRatio);

  useEffect(() => {
    setLocalButtonColor(systemSettings.buttonColor);
    setLocalFontFamily(systemSettings.fontFamily);
    setLocalFontSize(systemSettings.fontSize);
    setLocalStudentLimit(systemSettings.studentLimit);
    setLocalMediatorRatio(systemSettings.mediatorRatio);
    setLanguage(systemSettings.activeLanguage);
  }, [systemSettings]);

  const currentTheme = user.themePreference || 'light';

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExport = (format: string) => {
    setExportFormat(format);
    showFeedback(`Gerando arquivo ${format.toUpperCase()}... O download começará em breve.`);
  };

  const handleAdjustCalendar = () => {
    showFeedback('Sincronizando dias letivos, feriados e recessos municipais com a base central da Secretaria de Educação...');
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onUpdateTheme(theme);
    showFeedback(`Tema ${theme === 'light' ? 'Claro' : 'Escuro'} aplicado e salvo em suas preferências.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-white text-2xl shadow-xl shadow-slate-100">
            <i className="fa-solid fa-gears"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configurações do Sistema</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Personalize sua experiência e gerencie parâmetros da unidade</p>
          </div>
        </div>
        {feedback && (
          <div className="max-w-xs px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest animate-bounce shadow-lg flex items-center gap-3">
            <i className="fa-solid fa-circle-info text-base"></i>
            <span>{feedback}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Acesso e Segurança */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-key text-lg"></i>
            </div>
            Acesso e Segurança
          </h3>
          <div className="space-y-4">
            <button 
              onClick={() => showFeedback('Redirecionando para o portal de alteração de senha segura...')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-amber-50 rounded-2xl border border-transparent hover:border-amber-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-lock text-amber-500"></i>
                <span className="text-sm font-bold text-gray-700">Alterar senha do Diretor</span>
              </div>
              <i className="fa-solid fa-chevron-right text-xs text-gray-300 group-hover:text-amber-500"></i>
            </button>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail de Acesso</label>
              <input 
                type="email" 
                defaultValue={user.email}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Autenticação 2FA</span>
                  <span className="text-[9px] text-slate-400 uppercase font-black">Camada extra de proteção</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* 2. Personalização */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-palette text-lg"></i>
            </div>
            Personalização
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${currentTheme === 'light' ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-100' : 'bg-gray-50 border-gray-100 hover:border-indigo-200'}`}
              >
                <i className="fa-solid fa-sun text-amber-500 text-xl"></i>
                <span className={`text-[10px] font-black uppercase ${currentTheme === 'light' ? 'text-indigo-600' : 'text-gray-400'}`}>Tema Claro</span>
              </button>
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${currentTheme === 'dark' ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-900' : 'bg-gray-50 border-gray-100 hover:border-indigo-200'}`}
              >
                <i className="fa-solid fa-moon text-indigo-300 text-xl"></i>
                <span className={`text-[10px] font-black uppercase ${currentTheme === 'dark' ? 'text-white' : 'text-gray-400'}`}>Tema Escuro</span>
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Idioma Preferencial</label>
              <select 
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  showFeedback(`Idioma alterado para ${e.target.value === 'pt-br' ? 'Português' : 'o selecionado'}`);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="pt-br">Português (Brasil)</option>
                <option value="en">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cor Global dos Botões</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={localButtonColor}
                    onChange={(e) => setLocalButtonColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">{localButtonColor.toUpperCase()}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Seletor de cor hexadecimal</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fonte do Sistema</label>
                  <select 
                    value={localFontFamily}
                    onChange={(e) => setLocalFontFamily(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Inter">Inter (Padrão)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tamanho da Fonte</label>
                  <select 
                    value={localFontSize}
                    onChange={(e) => setLocalFontSize(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="12px">Pequena (12px)</option>
                    <option value="14px">Média (14px)</option>
                    <option value="16px">Grande (16px)</option>
                    <option value="18px">Extra (18px)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => showFeedback('Interface de customização de widgets ativada. Arraste os elementos para reorganizar.')}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2"
              >
                Ajustar Layout da Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* 3. Gestão Escolar */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-school-circle-check text-lg"></i>
            </div>
            Gestão Escolar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limite de Alunos / Turma</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localStudentLimit}
                  onChange={(e) => setLocalStudentLimit(parseInt(e.target.value))}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">MAX</span>
              </div>
              <p className="text-[9px] text-gray-400 font-medium italic">Capacidade física máxima recomendada por sala de aula.</p>
            </div>
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ratio Mediador/Aluno</label>
                <div className="relative group/tooltip">
                  <i className="fa-solid fa-circle-question text-gray-300 hover:text-blue-500 cursor-help transition-colors text-[10px]"></i>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-slate-900 text-white text-[9px] rounded-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed border border-slate-700">
                    <p className="font-black text-blue-400 mb-1 uppercase tracking-widest">O que isso faz?</p>
                    Este parâmetro define a capacidade máxima de alunos acompanhados por cada mediador na unidade. O padrão recomendado é 1:3 para garantir a qualidade do suporte inclusivo individualizado.
                  </div>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={localMediatorRatio}
                  onChange={(e) => setLocalMediatorRatio(parseInt(e.target.value))}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">1:N</span>
              </div>
              <p className="text-[9px] text-gray-400 font-medium italic">Limite de suporte individualizado por mediador escolar.</p>
            </div>
            <div className="flex flex-col justify-end space-y-2">
              <div className="relative group/btn-tooltip">
                <button 
                  onClick={handleAdjustCalendar}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-calendar-days"></i>
                  Ajustar Calendário Escolar
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-slate-900 text-white text-[9px] rounded-2xl opacity-0 group-hover/btn-tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed border border-slate-700">
                  <p className="font-black text-blue-400 mb-1 uppercase tracking-widest">O que isso faz?</p>
                  Sincroniza os feriados municipais, recessos e dias letivos da unidade com a base de dados oficial da Secretaria de Educação para 2024.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Comunicação */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <i className="fa-solid fa-envelope-circle-check text-lg"></i>
            </div>
            Comunicação
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-bell text-rose-500"></i>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Notificações Internas</span>
                  <span className="text-[9px] text-gray-400 uppercase font-black">Mensagens e alertas</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => {
                    setNotifications(!notifications);
                    showFeedback(notifications ? 'Notificações silenciadas.' : 'Notificações ativadas.');
                  }}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail para Relatórios</label>
              <input 
                type="email" 
                placeholder="institucional@escola.br"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* 5. Relatórios e Exportações */}
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-file-export text-lg"></i>
            </div>
            Relatórios e Exportações
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={() => handleExport('pdf')}
                className={`flex-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === 'pdf' ? 'bg-emerald-50 border-emerald-600 text-emerald-600 ring-2 ring-emerald-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
              >
                PDF (Oficial)
              </button>
              <button 
                onClick={() => handleExport('excel')}
                className={`flex-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === 'excel' ? 'bg-emerald-50 border-emerald-600 text-emerald-600 ring-2 ring-emerald-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
              >
                Excel (Tabelas)
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relatórios Automáticos</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="none">Desativado</option>
                <option value="weekly">Semanal (Segunda-feira)</option>
                <option value="monthly">Mensal (Todo dia 01)</option>
              </select>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2">
              <i className="fa-solid fa-circle-info mr-1 text-emerald-400"></i> Formatos compatíveis com a Secretaria de Educação
            </p>
          </div>
        </section>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between shadow-2xl shadow-blue-900/40">
        <div>
          <h4 className="text-xl font-black tracking-tight">Salvar Alterações?</h4>
          <p className="text-slate-400 text-xs font-medium">As mudanças serão aplicadas globalmente na sua unidade.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setLocalButtonColor(systemSettings.buttonColor);
              setLocalFontFamily(systemSettings.fontFamily);
              setLocalFontSize(systemSettings.fontSize);
              setLocalStudentLimit(systemSettings.studentLimit);
              setLocalMediatorRatio(systemSettings.mediatorRatio);
              setLanguage(systemSettings.activeLanguage);
              showFeedback('Alterações descartadas.');
            }}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={async () => {
              await onUpdateSystemSettings({
                ...systemSettings,
                buttonColor: localButtonColor,
                fontFamily: localFontFamily,
                fontSize: localFontSize,
                studentLimit: localStudentLimit,
                mediatorRatio: localMediatorRatio,
                activeLanguage: language
              });
              showFeedback('Configurações aplicadas com sucesso!');
            }}
            className="px-10 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
          >
            Aplicar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;