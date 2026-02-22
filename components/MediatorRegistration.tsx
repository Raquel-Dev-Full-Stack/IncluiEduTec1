
import React, { useState } from 'react';
import { User, UserProfile, Student } from '../types';

interface MediatorRegistrationProps {
  onSave: (mediator: Partial<User>) => void;
  onCancel: () => void;
  availableStudents: Student[];
  initialData?: User | null;
}

const MediatorRegistration: React.FC<MediatorRegistrationProps> = ({ onSave, onCancel, availableStudents, initialData }) => {
  const [formData, setFormData] = useState<Partial<User>>(initialData ? {
    ...initialData,
    phone: initialData.phone_number || initialData.phone || '',
    password: '' // Senha fica vazia na edição a menos que queira trocar
  } : {
    name: '',
    email: '',
    password: '',
    phone: '',
    active: true,
    profile: UserProfile.MEDIADOR,
    studentIds: []
  });

  const [isEditing] = useState(!!initialData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Nome: Pelo menos duas palavras
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome completo é obrigatório.';
    } else if (formData.name.trim().split(/\s+/).length < 2) {
      newErrors.name = 'Insira o nome completo (pelo menos duas palavras).';
    }

    if (!formData.phone?.trim()) newErrors.phone = 'Número de contato é obrigatório.';

    // E-mail: Regex mais rigoroso
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email?.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'E-mail inválido.';
    }

    // Senha: Mínimo 6 caracteres se for novo ou se estiver trocando
    if (!isEditing && !formData.password) {
      newErrors.password = 'A senha de acesso é obrigatória.';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
    }

    const selectedCount = formData.studentIds?.length || 0;
    if (selectedCount === 0) {
      newErrors.students = 'Selecione pelo menos 1 aluno para acompanhamento.';
    } else if (selectedCount > 3) {
      newErrors.students = 'Selecione no máximo 3 alunos por mediador.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleStudent = (studentId: string) => {
    const currentIds = formData.studentIds || [];
    if (currentIds.includes(studentId)) {
      setFormData({ ...formData, studentIds: currentIds.filter(id => id !== studentId) });
    } else {
      if (currentIds.length < 3) {
        setFormData({ ...formData, studentIds: [...currentIds, studentId] });
      } else {
        alert('Limite máximo de 3 alunos atingido.');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <i className={`fa-solid ${isEditing ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
          </div>
          {isEditing ? 'Editar Mediador' : 'Novo Mediador & Vínculo de Alunos'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-user text-indigo-400"></i> Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do Mediador"
              className={`w-full p-3.5 bg-gray-50 border ${errors.name ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
            {errors.name && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-phone text-indigo-400"></i> Número de Contato *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className={`w-full p-3.5 bg-gray-50 border ${errors.phone ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
            {errors.phone && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-envelope text-indigo-400"></i> E-mail de Acesso *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mediador@exemplo.com"
              className={`w-full p-3.5 bg-gray-50 border ${errors.email ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
            {errors.email && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-lock text-indigo-400"></i> {isEditing ? 'Nova Senha (Opcional)' : 'Senha Provisória *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full p-3.5 bg-gray-50 border ${errors.password ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
            {errors.password && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Inicial</label>
            <select
              value={formData.active ? 'Ativo' : 'Inativo'}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === 'Ativo' })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        {/* Seleção de Alunos */}
        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            <span>Selecionar Alunos para Acompanhamento (Até 3) *</span>
            <span className={`font-black ${formData.studentIds?.length === 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              {formData.studentIds?.length || 0} / 3 selecionados
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {availableStudents.map(student => (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${formData.studentIds?.includes(student.id)
                  ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                  : 'bg-gray-50 border-gray-100 hover:border-indigo-100'
                  }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.studentIds?.includes(student.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                  }`}>
                  {formData.studentIds?.includes(student.id) && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 truncate">{student.name}</span>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter truncate">{student.deficiency}</span>
                </div>
              </div>
            ))}
          </div>
          {errors.students && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.students}</p>}
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
            className="px-10 py-3.5 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-save"></i>
            {isEditing ? 'Salvar Alterações' : 'Salvar Mediador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MediatorRegistration;
