import React, { useState, useEffect } from 'react';
import { User, UserProfile, Class } from '../types';

interface TeacherRegistrationProps {
  onSave: (teacher: Partial<User>) => void;
  onCancel: () => void;
  onQuickAddClass: () => void;
  availableClasses: Class[];
  initialData?: User | null;
  isLoading?: boolean;
}

const TeacherRegistration: React.FC<TeacherRegistrationProps> = ({ onSave, onCancel, onQuickAddClass, availableClasses, initialData, isLoading }) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    phone: '',
    active: true,
    profile: UserProfile.PROFESSOR,
    classId: ''
  });

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Efeito para carregar dados em caso de edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '' // Não mostramos a senha atual por segurança, se ficar vazio mantém a antiga
      });

      // No mock, identificamos as turmas vinculadas ao professor
      const linkedClasses = availableClasses
        .filter(c => c.teacherId === initialData.id)
        .map(c => c.id);

      setSelectedClassIds(linkedClasses);
    }
  }, [initialData, availableClasses]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Nome completo é obrigatório.';
    if (!formData.email) {
      newErrors.email = 'E-mail institucional é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido.';
    }

    // Senha só é obrigatória em novos cadastros
    if (!isEditing && !formData.password) {
      newErrors.password = 'A senha de acesso é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Se estiver editando e a senha estiver vazia, removemos a chave para o App.tsx não sobrescrever com vazio
      const dataToSave = { ...formData };
      if (isEditing && !dataToSave.password) {
        delete dataToSave.password;
      }

      onSave({
        ...dataToSave,
        selectedClassIds: selectedClassIds
      });
    }
  };

  const toggleClass = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleQuickAddClass = () => {
    onQuickAddClass();
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <i className={`fa-solid ${isEditing ? 'fa-user-pen' : 'fa-chalkboard-user'}`}></i>
          </div>
          {isEditing ? 'Editar Registro de Professor' : 'Novo Cadastro de Professor'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-user text-blue-400"></i> Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do Professor"
              className={`w-full p-3.5 bg-gray-50 border ${errors.name ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            />
            {errors.name && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-phone text-blue-400"></i> Número de Contato
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className={`w-full p-3.5 bg-gray-50 border ${errors.phone ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            />
            {errors.phone && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-envelope text-blue-400"></i> E-mail Institucional *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="professor@escola.br"
              className={`w-full p-3.5 bg-gray-50 border ${errors.email ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            />
            {errors.email && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-lock text-blue-400"></i> {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha Provisória *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full p-3.5 bg-gray-50 border ${errors.password ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            />
            {errors.password && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Atual</label>
            <select
              value={formData.active ? 'Ativo' : 'Inativo'}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === 'Ativo' })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            <span>Vincular Turmas / Disciplinas (Opcional)</span>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
              {selectedClassIds.length} selecionada(s)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {availableClasses.map(c => (
              <div
                key={c.id}
                onClick={() => toggleClass(c.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedClassIds.includes(c.id)
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                  : 'bg-gray-50 border-gray-100 hover:border-blue-100'
                  }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedClassIds.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                  }`}>
                  {selectedClassIds.includes(c.id) && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 truncate">{c.name}</span>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{c.year}</span>
                </div>
              </div>
            ))}
            <div
              onClick={handleQuickAddClass}
              className="p-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100 transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[50px] shadow-sm shadow-blue-900/5"
            >
              <i className="fa-solid fa-plus-circle text-blue-500 group-hover:scale-110 transition-transform"></i>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center">Cadastrar nova turma</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-10 py-3.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin' : (isEditing ? 'fa-check' : 'fa-save')}`}></i>
            {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Professor')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherRegistration;