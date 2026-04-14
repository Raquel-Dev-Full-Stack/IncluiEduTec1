
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (email: string, profile: UserProfile, password?: string) => void;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('last_login_email') || '');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<UserProfile>(UserProfile.SECRETARIA);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isLoading) {
      localStorage.setItem('last_login_email', email);
      onLogin(email, profile, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* ... Presentation column ... */}
      <div className="md:w-1/2 bg-blue-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-800 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-700 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-3">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-graduation-cap text-blue-900 text-2xl"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight">IncluiEduTec</span>
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl font-medium text-blue-200">Educação Pública Inteligente</h2>
            <h1 className="text-4xl font-extrabold leading-tight">
              IncluiEduTec - Gestão Pedagógica Inclusiva
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed opacity-90">
              Plataforma institucional para a gestão educacional inclusiva, alinhada à BNCC e às políticas públicas de educação.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default group">
              <i className="fa-solid fa-book-open text-blue-300 mb-3 block group-hover:scale-110 transition-transform"></i>
              <h3 className="font-bold text-xs uppercase tracking-wider">BASE NORMATIVA BNCC</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default group">
              <i className="fa-solid fa-hands-holding-child text-blue-300 mb-3 block group-hover:scale-110 transition-transform"></i>
              <h3 className="font-bold text-xs uppercase tracking-wider">APOIO AO AEE</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default group">
              <i className="fa-solid fa-file-signature text-blue-300 mb-3 block group-hover:scale-110 transition-transform"></i>
              <h3 className="font-bold text-xs uppercase tracking-wider">PEI, PDI E PAEE</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default group">
              <i className="fa-solid fa-shield-lock text-blue-300 mb-3 block group-hover:scale-110 transition-transform"></i>
              <h3 className="font-bold text-xs uppercase tracking-wider">COMUNICAÇÃO SEGURA</h3>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 mt-12 flex items-center gap-4">
          <div className="w-12 h-1 border-t-2 border-blue-400"></div>
          <p className="italic text-blue-200 font-light">"A inclusão acontece quando todos aprendem juntos."</p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-blue-100 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Portal de Acesso</h2>
            <p className="text-gray-500 text-sm mt-1">Gestão Pedagógica Inclusiva</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Município de Acesso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-location-dot text-blue-500"></i>
                </div>
                <input
                  type="text"
                  disabled
                  value="Maricá - RJ"
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-700 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Perfil Institucional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-building text-blue-500"></i>
                </div>
                <select
                  value={profile}
                  onChange={(e) => setProfile(e.target.value as UserProfile)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none outline-none transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value={UserProfile.ADMIN}>{UserProfile.ADMIN}</option>
                  <option value={UserProfile.SECRETARIA}>{UserProfile.SECRETARIA}</option>
                  <option value={UserProfile.DIRETOR}>{UserProfile.DIRETOR}</option>
                  <option value={UserProfile.PROFESSOR}>{UserProfile.PROFESSOR}</option>
                  <option value={UserProfile.MEDIADOR}>{UserProfile.MEDIADOR}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-chevron-down text-gray-300 text-xs"></i>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="exemplo@marica.rj.gov.br"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Acessar Sistema</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Dificuldade no acesso? Entrar via e-mail
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
            <i className="fa-solid fa-circle-check text-emerald-500"></i>
            Conexão Segura Auditada
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
