
import React, { useState } from 'react';
import { Student, Class, User, Guardian } from '../types';

interface StudentRegistrationProps {
  onSave: (newStudent: Partial<Student>) => void;
  onCancel: () => void;
  classes: Class[];
  mediators: User[];
  initialData?: Student | null;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ onSave, onCancel, classes, mediators, initialData }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    birthDate: '',
    classId: '',
    ra: '',
    deficiency: '',
    aee: false,
    mediatorId: '',
    schoolRegime: 'Parcial',
    attendancePeriod: 'Manhã',
    description: '',
    hasMedicalReport: false,
    medicalReportUrl: '',
    guardians: [{ name: '', relation: 'Mãe', phone: '', email: '' }],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome do aluno é obrigatório.';
    if (!formData.classId) newErrors.classId = 'Selecione uma turma.';
    // mediatorId is now optional, no longer added to errors here

    if (!formData.guardians || formData.guardians.length === 0) {
      newErrors.guardians = 'É necessário pelo menos um responsável.';
    } else {
      const firstGuardian = formData.guardians[0];
      if (!firstGuardian.name?.trim() || !firstGuardian.phone?.trim()) {
        newErrors.guardians = 'O primeiro responsável deve ter nome e telefone preenchidos.';
      }
    }

    if (formData.hasMedicalReport && !formData.medicalReportUrl) {
      newErrors.medicalReport = 'Por favor, anexe o documento do laudo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, medicalReportUrl: reader.result as string });
        // Limpa erro de laudo se o usuário anexou
        if (errors.medicalReport) {
          setErrors(prev => {
            const { medicalReport, ...rest } = prev;
            return rest;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addGuardian = () => {
    setFormData({
      ...formData,
      guardians: [...(formData.guardians || []), { name: '', relation: 'Mãe', phone: '', email: '' }]
    });
  };

  const removeGuardian = (index: number) => {
    const newGuardians = [...(formData.guardians || [])];
    newGuardians.splice(index, 1);
    setFormData({ ...formData, guardians: newGuardians });
  };

  const updateGuardian = (index: number, field: keyof Guardian, value: string) => {
    const newGuardians = [...(formData.guardians || [])];
    newGuardians[index] = { ...newGuardians[index], [field]: value };
    setFormData({ ...formData, guardians: newGuardians });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    } else {
      const missingFields = [];
      if (!formData.name?.trim()) missingFields.push('Nome');
      if (!formData.classId) missingFields.push('Turma');
      const firstGuardian = formData.guardians?.[0];
      if (!firstGuardian?.name?.trim() || !firstGuardian?.phone?.trim()) missingFields.push('Dados do Responsável');
      if (formData.hasMedicalReport && !formData.medicalReportUrl) missingFields.push('Documento do Laudo');

      alert(`Por favor, preencha os campos obrigatórios: ${missingFields.join(', ')}.`);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <form onSubmit={handleSubmit}>
        {/* Cabeçalho */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{initialData ? 'Editar Cadastro de Aluno' : 'Novo Cadastro de Aluno'}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Gestão Pedagógica Inclusiva</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-rose-500 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Seção 1: Dados Pessoais */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200"></span>
              01. Dados Pessoais do Aluno
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-user text-emerald-400"></i> Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do aluno"
                  className={`w-full p-3.5 bg-gray-50 border ${errors.name ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-calendar text-emerald-400"></i> Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-barcode text-emerald-400"></i> Registro Acadêmico (RA)
                </label>
                <input
                  type="text"
                  value={formData.ra}
                  onChange={(e) => setFormData({ ...formData, ra: e.target.value })}
                  placeholder="000000"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
                <p className="text-[9px] text-gray-400 font-medium italic mt-1 px-1">O RA deve ser único. Deixe em branco se não possuir.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-users-rectangle text-emerald-400"></i> Turma Selecionada *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className={`w-full p-3.5 bg-gray-50 border ${errors.classId ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer`}
                >
                  <option value="">Selecione a Turma</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.year}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-virus text-emerald-400"></i> Deficiência Principal
                </label>
                <input
                  type="text"
                  value={formData.deficiency}
                  onChange={(e) => setFormData({ ...formData, deficiency: e.target.value })}
                  placeholder="Ex: TEA, DI, Baixa Visão"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa- stethoscope text-emerald-400"></i> Diagnóstico (CID)
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Ex: F84.0 ou descrição detalhada"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-layer-group text-emerald-400"></i> Série / Ano
                </label>
                <input
                   type="text"
                   value={formData.grade}
                   onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                   placeholder="Ex: 1º Ano, Pré-II"
                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-door-open text-emerald-400"></i> Sala de Aula
                </label>
                <input
                   type="text"
                   value={formData.classroom}
                   onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                   placeholder="Ex: Sala 04, Bloco B"
                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-calendar-check text-emerald-400"></i> Ano de Matrícula
                </label>
                <input
                   type="number"
                   value={formData.enrollment_year || formData.year}
                   onChange={(e) => setFormData({ ...formData, enrollment_year: parseInt(e.target.value) || undefined })}
                   placeholder="2026"
                   className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Seção 2: Apoio e Regime */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200"></span>
              02. Apoio Especializado e Regime
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-hand-holding-heart text-blue-400"></i> Mediador Responsável (Opcional)
                </label>
                <select
                  value={formData.mediatorId}
                  onChange={(e) => setFormData({ ...formData, mediatorId: e.target.value })}
                  className={`w-full p-3.5 bg-white border ${errors.mediatorId ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer`}
                >
                  <option value="">Selecione o Mediador (Pode preencher depois)</option>
                  {mediators.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-clock text-blue-400"></i> Regime Escolar
                </label>
                <select
                  value={formData.schoolRegime}
                  onChange={(e) => setFormData({ ...formData, schoolRegime: e.target.value as 'Integral' | 'Parcial' })}
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Integral">Integral</option>
                  <option value="Parcial">Parcial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-sun text-blue-400"></i> Período de Frequência
                </label>
                <select
                  value={formData.attendancePeriod}
                  onChange={(e) => setFormData({ ...formData, attendancePeriod: e.target.value as 'Manhã' | 'Tarde' })}
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <input
                type="checkbox"
                id="aee-toggle"
                checked={formData.aee}
                onChange={(e) => setFormData({ ...formData, aee: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="aee-toggle" className="text-xs font-bold text-blue-800 cursor-pointer">
                Atendimento Educacional Especializado (AEE) Ativo?
              </label>
            </div>
          </section>

          {/* Seção 3: Grupo Familiar */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-px bg-gray-200"></span>
                03. Grupo Familiar / Responsáveis
              </h4>
              <button
                type="button"
                onClick={addGuardian}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <i className="fa-solid fa-plus-circle"></i> Adicionar Responsável
              </button>
            </div>

            {errors.guardians && <p className="text-[10px] text-rose-500 font-bold uppercase mb-4">{errors.guardians}</p>}

            <div className="space-y-4">
              {formData.guardians?.map((guardian, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 relative group">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeGuardian(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <i className="fa-solid fa-times text-xs"></i>
                    </button>
                  )}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Nome do Responsável *</label>
                    <input
                      type="text"
                      value={guardian.name}
                      onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                      placeholder="Nome Completo"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Parentesco / Vínculo *</label>
                    <select
                      value={guardian.relation}
                      onChange={(e) => updateGuardian(index, 'relation', e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avô">Avô</option>
                      <option value="Avó">Avó</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Telefone *</label>
                    <input
                      type="text"
                      value={guardian.phone}
                      onChange={(e) => updateGuardian(index, 'phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">E-mail (Opcional)</label>
                    <input
                      type="email"
                      value={guardian.email}
                      onChange={(e) => updateGuardian(index, 'email', e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 4: Laudo e Descrição */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200"></span>
              04. Laudo Médico e Observações
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Possui Laudo Médico (CID)?</label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasMedicalReport: true })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.hasMedicalReport ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Sim, Possui
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasMedicalReport: false, medicalReportUrl: '' })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.hasMedicalReport ? 'bg-white text-rose-600 shadow-sm border border-rose-100' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Não Possui
                  </button>
                </div>

                {formData.hasMedicalReport && (
                  <div className="mt-6 animate-in fade-in zoom-in-95 duration-300 p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3">Documento do Laudo</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-indigo-200 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-all group">
                        <i className="fa-solid fa-cloud-arrow-up text-indigo-500 group-hover:scale-110 transition-transform"></i>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                          {formData.medicalReportUrl ? 'Alterar PDF/IMG' : 'Anexar Laudo'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,image/*"
                        />
                      </label>
                      {formData.medicalReportUrl && (
                        <a
                          href={formData.medicalReportUrl}
                          download={`laudo-${formData.name?.split(' ')[0] || 'aluno'}`}
                          className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                          title="Baixar Laudo"
                        >
                          <i className="fa-solid fa-download"></i>
                        </a>
                      )}
                    </div>
                    {formData.medicalReportUrl && (
                      <p className="text-[9px] text-emerald-600 font-black uppercase mt-3 flex items-center gap-1.5 px-1">
                        <i className="fa-solid fa-circle-check"></i> Arquivo pronto para envio
                      </p>
                    )}
                    {errors.medicalReport && <p className="text-[9px] text-rose-500 font-bold uppercase mt-2">{errors.medicalReport}</p>}
                  </div>
                )}
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-align-left text-indigo-400"></i> Breve Descrição do Aluno
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva aqui características comportamentais, necessidades específicas ou pontos de atenção..."
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-3xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-sm"
                ></textarea>
              </div>
            </div>
          </section>
        </div>

        {/* Footer: Ações */}
        <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-3 border border-emerald-400/20"
          >
            <i className="fa-solid fa-check-double text-xs"></i>
            Finalizar Matrícula
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;
