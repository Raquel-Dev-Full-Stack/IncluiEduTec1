
import React, { useState } from 'react';
import { School } from '../types';

interface SchoolRegistrationProps {
  onSave: (school: School) => void;
  onCancel: () => void;
  initialData?: School | null;
}

const SchoolRegistration: React.FC<SchoolRegistrationProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<School>>(initialData || {
    name: '',
    inep: '',
    address: '',
    neighborhood: '',
    city: '',
    municipio_id: '',
    state: 'RJ',
    zipCode: '',
    principalName: '',
    principalEmail: '',
    principalPassword: '',
    email: '',
    phone: '',
    active: true,
    type: 'Municipal',
    teacherCount: 0,
    mediatorCount: 0,
    classCount: 0,
    studentCount: 0,
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'O nome da escola é obrigatório.';
    if (!formData.inep) newErrors.inep = 'O código INEP é obrigatório.';
    if (!formData.address) newErrors.address = 'O endereço é obrigatório.';
    if (!formData.address) newErrors.address = 'O endereço é obrigatório.';

    // Validações do Diretor
    if (!formData.principalEmail) {
      newErrors.principalEmail = 'O e-mail do diretor é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.principalEmail)) {
      newErrors.principalEmail = 'Insira um e-mail válido para o diretor.';
    }

    if (!formData.principalPassword && !initialData) {
      newErrors.principalPassword = 'A senha de acesso do diretor é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, active: e.target.value === 'Ativa' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData
      } as School);
    } else {
      const firstError = document.querySelector('.text-rose-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="divide-y divide-gray-100">

        {/* Seção 1: Informações Básicas */}
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-school"></i>
              </div>
              Informações Básicas
            </h3>
            {formData.createdAt && (
              <div className="flex items-center gap-2 text-gray-400">
                <i className="fa-solid fa-calendar-day text-[10px]"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">Criada em: {new Date(formData.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-building text-blue-400"></i> Nome da Unidade Escolar *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Escola Municipal Joana Benedicta Rangel"
                className={`w-full p-3.5 bg-gray-50 border ${errors.name ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-barcode text-blue-400"></i> Código INEP *
              </label>
              <input
                name="inep"
                value={formData.inep}
                onChange={handleChange}
                placeholder="00000000"
                className={`w-full p-3.5 bg-gray-50 border ${errors.inep ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              />
              {errors.inep && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.inep}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-tag text-blue-400"></i> Tipo de Escola
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Municipal">Municipal</option>
                <option value="Estadual">Estadual</option>
                <option value="Privada">Privada</option>
                <option value="Filantrópica">Filantrópica</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-toggle-on text-blue-400"></i> Status da Unidade *
              </label>
              <select
                value={formData.active ? 'Ativa' : 'Inativa'}
                onChange={handleStatusChange}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Ativa">Ativa</option>
                <option value="Inativa">Inativa</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOVA Seção: Acesso do Diretor */}
        <div className="p-8 md:p-12 space-y-8 bg-blue-50/20">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fa-solid fa-user-lock"></i>
            </div>
            Credenciais de Acesso do Diretor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-user-tie text-blue-400"></i> Nome do(a) Diretor(a)
              </label>
              <input
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                placeholder="Nome Completo"
                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-envelope-open-text text-blue-400"></i> E-mail do Diretor *
              </label>
              <input
                name="principalEmail"
                type="email"
                value={formData.principalEmail}
                onChange={handleChange}
                placeholder="diretor@exemplo.com"
                className={`w-full p-3.5 bg-white border ${errors.principalEmail ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
              {errors.principalEmail && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.principalEmail}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-key text-blue-400"></i> Senha de Acesso {initialData ? '(Deixe em branco para manter)' : '*'}
              </label>
              <input
                name="principalPassword"
                type="password"
                value={formData.principalPassword || ''}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full p-3.5 bg-white border ${errors.principalPassword ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
              {errors.principalPassword && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.principalPassword}</p>}
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 font-medium italic">Nota: Apenas a Secretaria pode fornecer estas credenciais. O Diretor utilizará este e-mail e senha para gerir a unidade escolar no portal.</p>
        </div>

        {/* Seção 2: Localização e Contato */}
        <div className="p-8 md:p-12 space-y-8 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                Localização
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço Completo *</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua, Número, Complemento"
                    className={`w-full p-3 bg-white border ${errors.address ? 'border-rose-400' : 'border-gray-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none`}
                  />
                  {errors.address && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bairro</label>
                  <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Bairro" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CEP</label>
                  <input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="00000-000" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="Cidade" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</label>
                  <input name="state" value={formData.state} onChange={handleChange} placeholder="UF" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <i className="fa-solid fa-headset"></i>
                </div>
                Canais de Contato Institucional
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-envelope"></i> E-mail da Escola
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="escola@municipio.rj.gov.br"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-phone"></i> Telefone de Contato
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 0000-0000"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3: Estrutura & Detalhamento */}
        <div className="p-8 md:p-12 space-y-12">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              Estrutura & Detalhamento Completo
            </h3>
            <p className="text-[10px] text-gray-400 font-medium italic">Preencha os números totais e forneça os detalhes de cada categoria abaixo.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-chalkboard-user"></i> Professores
              </label>
              <input name="teacherCount" type="number" min="0" value={formData.teacherCount} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-purple-700 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-hand-holding-heart"></i> Mediadores
              </label>
              <input name="mediatorCount" type="number" min="0" value={formData.mediatorCount} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-purple-700 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-layer-group"></i> Turmas
              </label>
              <input name="classCount" type="number" min="0" value={formData.classCount} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-purple-700 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap"></i> Alunos
              </label>
              <input name="studentCount" type="number" min="0" value={formData.studentCount} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-purple-700 outline-none" />
            </div>
          </div>

          <div className="space-y-8 mt-12">
            {/* SUB-SEÇÃO: PROFESSORES */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-user-group text-slate-400"></i> Detalhes dos Professores
                </h4>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, teachers: [...(prev.teachers || []), { name: '', subject: '', contact: '' }] }))}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Adicionar Professor
                </button>
              </div>
              <div className="space-y-4">
                {(formData.teachers || []).map((t, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <input
                      placeholder="Nome do Professor"
                      value={t.name}
                      onChange={(e) => {
                        const newTeachers = [...formData.teachers!];
                        newTeachers[idx].name = e.target.value;
                        setFormData({ ...formData, teachers: newTeachers });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      placeholder="Disciplina"
                      value={t.subject}
                      onChange={(e) => {
                        const newTeachers = [...formData.teachers!];
                        newTeachers[idx].subject = e.target.value;
                        setFormData({ ...formData, teachers: newTeachers });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Contato (Tel/Email)"
                        value={t.contact}
                        onChange={(e) => {
                          const newTeachers = [...formData.teachers!];
                          newTeachers[idx].contact = e.target.value;
                          setFormData({ ...formData, teachers: newTeachers });
                        }}
                        className="flex-1 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, teachers: prev.teachers?.filter((_, i) => i !== idx) }))}
                        className="p-2.5 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.teachers || formData.teachers.length === 0) && (
                  <p className="text-center text-[10px] text-gray-400 font-medium italic bg-white/50 py-8 rounded-2xl border border-dashed border-gray-200">Nenhum professor detalhado ainda.</p>
                )}
              </div>
            </div>

            {/* SUB-SEÇÃO: MEDIADORES */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-hand-holding-heart text-slate-400"></i> Detalhes dos Mediadores
                </h4>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mediators: [...(prev.mediators || []), { name: '', area: '', contact: '' }] }))}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Adicionar Mediador
                </button>
              </div>
              <div className="space-y-4">
                {(formData.mediators || []).map((m, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <input
                      placeholder="Nome do Mediador"
                      value={m.name}
                      onChange={(e) => {
                        const newMediators = [...formData.mediators!];
                        newMediators[idx].name = e.target.value;
                        setFormData({ ...formData, mediators: newMediators });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      placeholder="Área de Atuação"
                      value={m.area}
                      onChange={(e) => {
                        const newMediators = [...formData.mediators!];
                        newMediators[idx].area = e.target.value;
                        setFormData({ ...formData, mediators: newMediators });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Contato (Tel/Email)"
                        value={m.contact}
                        onChange={(e) => {
                          const newMediators = [...formData.mediators!];
                          newMediators[idx].contact = e.target.value;
                          setFormData({ ...formData, mediators: newMediators });
                        }}
                        className="flex-1 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mediators: prev.mediators?.filter((_, i) => i !== idx) }))}
                        className="p-2.5 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.mediators || formData.mediators.length === 0) && (
                  <p className="text-center text-[10px] text-gray-400 font-medium italic bg-white/50 py-8 rounded-2xl border border-dashed border-gray-200">Nenhum mediador detalhado ainda.</p>
                )}
              </div>
            </div>

            {/* SUB-SEÇÃO: TURMAS */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-slate-400"></i> Detalhes das Turmas
                </h4>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, classes: [...(prev.classes || []), { name: '', level: '', shift: '' }] }))}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Adicionar Turma
                </button>
              </div>
              <div className="space-y-4">
                {(formData.classes || []).map((c, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <input
                      placeholder="Identificação da Turma"
                      value={c.name}
                      onChange={(e) => {
                        const newClasses = [...formData.classes!];
                        newClasses[idx].name = e.target.value;
                        setFormData({ ...formData, classes: newClasses });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      placeholder="Série/Ano"
                      value={c.level}
                      onChange={(e) => {
                        const newClasses = [...formData.classes!];
                        newClasses[idx].level = e.target.value;
                        setFormData({ ...formData, classes: newClasses });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={c.shift}
                        onChange={(e) => {
                          const newClasses = [...formData.classes!];
                          newClasses[idx].shift = e.target.value;
                          setFormData({ ...formData, classes: newClasses });
                        }}
                        className="flex-1 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Turno</option>
                        <option value="Integral">Integral</option>
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noite">Noite</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, classes: prev.classes?.filter((_, i) => i !== idx) }))}
                        className="p-2.5 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.classes || formData.classes.length === 0) && (
                  <p className="text-center text-[10px] text-gray-400 font-medium italic bg-white/50 py-8 rounded-2xl border border-dashed border-gray-200">Nenhuma turma detalhada ainda.</p>
                )}
              </div>
            </div>

            {/* SUB-SEÇÃO: ALUNOS */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-slate-400"></i> Detalhes dos Alunos
                </h4>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, students: [...(prev.students || []), { name: '', ra: '', class_name: '' }] }))}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Adicionar Aluno
                </button>
              </div>
              <div className="space-y-4">
                {(formData.students || []).map((s, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <input
                      placeholder="Nome do Aluno"
                      value={s.name}
                      onChange={(e) => {
                        const newStudents = [...formData.students!];
                        newStudents[idx].name = e.target.value;
                        setFormData({ ...formData, students: newStudents });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      placeholder="Matrícula/RA"
                      value={s.ra}
                      onChange={(e) => {
                        const newStudents = [...formData.students!];
                        newStudents[idx].ra = e.target.value;
                        setFormData({ ...formData, students: newStudents });
                      }}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Turma Vinculada"
                        value={s.class_name}
                        onChange={(e) => {
                          const newStudents = [...formData.students!];
                          newStudents[idx].class_name = e.target.value;
                          setFormData({ ...formData, students: newStudents });
                        }}
                        className="flex-1 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, students: prev.students?.filter((_, i) => i !== idx) }))}
                        className="p-2.5 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.students || formData.students.length === 0) && (
                  <p className="text-center text-[10px] text-gray-400 font-medium italic bg-white/50 py-8 rounded-2xl border border-dashed border-gray-200">Nenhum aluno detalhado ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NOVA Seção: Observações Adicionais */}
        <div className="p-8 md:p-12 space-y-8 bg-gray-50/20">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <i className="fa-solid fa-comment-dots"></i>
            </div>
            Observações Adicionais
          </h3>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-pen"></i> Notas Internas da Secretaria
            </label>
            <textarea
              name="observations"
              value={formData.observations || ''}
              onChange={handleChange}
              placeholder="Digite aqui observações relevantes, histórico ou necessidades específicas desta unidade escolar..."
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-500 outline-none transition-all min-h-[120px] resize-none"
            />
          </div>
        </div>

        {/* Footer: Ações */}
        <div className="p-8 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium italic">* Campos marcados com asterisco são obrigatórios para a conformidade do sistema.</p>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-8 py-3.5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-12 py-3.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check-double"></i>
              {initialData ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SchoolRegistration;
