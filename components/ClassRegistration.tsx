
import React, { useState } from 'react';
import { Class, User, UserProfile } from '../types';

interface ClassRegistrationProps {
  onSave: (newClass: Partial<Class>) => void;
  onCancel: () => void;
  teachers: User[];
  mediators: User[];
  initialData?: Class | null;
}

const ClassRegistration: React.FC<ClassRegistrationProps> = ({ onSave, onCancel, teachers, mediators, initialData }) => {
  const [formData, setFormData] = useState<Partial<Class>>(initialData ? {
    ...initialData,
    teacherId: initialData.teacherId || '',
    mediatorId: initialData.mediatorId || ''
  } : {
    name: '',
    year: new Date().getFullYear().toString(),
    teacherId: '',
    mediatorId: '',
    level: '',
    shift: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.year || !formData.level || !formData.shift) {
      alert('Os campos Nome da Turma, Ano Letivo, Nível e Turno são obrigatórios.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-users-rectangle"></i>
          </div>
          {initialData ? 'Editar Turma' : 'Nova Turma'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Turma *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: 101 - Fundamental I"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ano Letivo *</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nível / Segmento *</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione o Nível</option>
              <option value="Educação Infantil">Educação Infantil</option>
              <option value="Fundamental I">Fundamental I</option>
              <option value="Fundamental II">Fundamental II</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="EJA">EJA</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turno *</label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione o Turno</option>
              <option value="Integral">Integral</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professor Responsável (Opcional)</label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione o Professor</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mediador (Opcional)</label>
            <select
              value={formData.mediatorId}
              onChange={(e) => setFormData({ ...formData, mediatorId: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione o Mediador</option>
              {mediators.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-10 py-3.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check"></i>
            Salvar Turma
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassRegistration;
