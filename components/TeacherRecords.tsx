
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Class, LessonPlan } from '../types';

interface BNCCData {
  codigo: string;
  descricao: string;
  componente: string;
}

interface TeacherRecordsProps {
  students: Student[];
  classes: Class[];
  lessonPlans: LessonPlan[];
  initialClassId?: string | null;
  onSave: (plan: Partial<LessonPlan>) => void;
}

const TeacherRecords: React.FC<TeacherRecordsProps> = ({
  students,
  classes,
  lessonPlans,
  initialClassId,
  onSave
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isAdding, setIsAdding] = useState(!!initialClassId);
  const [bnccData, setBnccData] = useState<BNCCData[]>([]);
  const [isLoadingBNCC, setIsLoadingBNCC] = useState(true);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    temaAula: '',
    classId: initialClassId || '',
    studentId: '', // Ainda mantido para registros individuais se necessário
    description: '',
    habilidadesBNCC: '',
    adaptacoesMetodologia: ''
  });

  // Atualiza turma inicial se o prop mudar
  useEffect(() => {
    if (initialClassId) {
      setFormData(prev => ({ ...prev, classId: initialClassId }));
      setIsAdding(true);
    }
  }, [initialClassId]);

  // Carregamento banco BNCC
  useEffect(() => {
    fetch('./bncc.json')
      .then(res => res.json())
      .then(data => {
        setBnccData(data);
        setIsLoadingBNCC(false);
      })
      .catch(err => {
        console.error("Erro ao carregar banco BNCC:", err);
        setIsLoadingBNCC(false);
      });
  }, []);

  const groupedBNCC = useMemo(() => {
    return bnccData.reduce((acc, curr) => {
      if (!acc[curr.componente]) acc[curr.componente] = [];
      acc[curr.componente].push(curr);
      return acc;
    }, {} as Record<string, BNCCData[]>);
  }, [bnccData]);

  const filteredStudentsForForm = useMemo(() => {
    if (!formData.classId) return [];
    return students.filter(s => s.classId === formData.classId);
  }, [students, formData.classId]);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.description || !formData.temaAula) {
      alert('Por favor, preencha a turma, o tema e o conteúdo do registro.');
      return;
    }

    onSave({
      classId: formData.classId,
      temaAula: formData.temaAula,
      description: formData.description,
      habilidadesBNCC: formData.habilidadesBNCC ? [formData.habilidadesBNCC] : [],
      adaptacoesMetodologia: formData.adaptacoesMetodologia
    });

    setIsAdding(false);
    setFormData({
      temaAula: '',
      classId: '',
      studentId: '',
      description: '',
      habilidadesBNCC: '',
      adaptacoesMetodologia: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-book"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Histórico de Registros</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Todas as suas anotações pedagógicas organizadas</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterPeriod === period
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isAdding
              ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          {isAdding ? 'Cancelar Registro' : 'Adicionar Novo Registro'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-900/5 animate-in zoom-in-95 duration-300">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            Novo Registro Pedagógico
          </h3>

          <form onSubmit={handleSaveSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tema da Aula *</label>
                <input
                  type="text"
                  value={formData.temaAula}
                  onChange={(e) => setFormData({ ...formData, temaAula: e.target.value })}
                  placeholder="Ex: Formas Geométricas"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turma *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value, studentId: '' })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecione a Turma...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Habilidade BNCC</label>
                <select
                  value={formData.habilidadesBNCC}
                  onChange={(e) => setFormData({ ...formData, habilidadesBNCC: e.target.value })}
                  disabled={isLoadingBNCC}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">{isLoadingBNCC ? 'Carregando BNCC...' : 'Selecione um código BNCC...'}</option>
                  {(Object.entries(groupedBNCC) as [string, BNCCData[]][]).map(([componente, skills]) => (
                    <optgroup key={componente} label={componente}>
                      {skills.map(skill => (
                        <option key={skill.codigo} value={skill.codigo} title={skill.descricao}>
                          [{skill.codigo}] {skill.descricao.substring(0, 60)}...
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição do Registro *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva aqui o desenvolvimento da aula..."
                  rows={4}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-indigo-600">Adaptações Metodológicas (Inclusão)</label>
                <textarea
                  value={formData.adaptacoesMetodologia}
                  onChange={(e) => setFormData({ ...formData, adaptacoesMetodologia: e.target.value })}
                  placeholder="Descreva adaptações para alunos com deficiência..."
                  rows={4}
                  className="w-full p-4 bg-indigo-50/30 border border-indigo-100 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4">
              <button
                type="submit"
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                Salvar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {lessonPlans.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center">
            <i className="fa-solid fa-folder-open text-gray-100 text-6xl mb-6 block"></i>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum registro encontrado no sistema.</p>
          </div>
        ) : (
          lessonPlans.map((lesson) => (
            <div key={lesson.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8">
              <div className="md:w-48 flex-shrink-0 space-y-2">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{new Date(lesson.createdAt).toLocaleDateString('pt-BR')}</p>
                <h4 className="text-sm font-bold text-gray-800">{classes.find(c => c.id === lesson.classId)?.name || 'Turma N/A'}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100">
                    {lesson.temaAula}
                  </span>
                  {lesson.habilidadesBNCC && lesson.habilidadesBNCC.length > 0 && (
                    <span
                      className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100 cursor-help"
                      title={bnccData.find(b => b.codigo === lesson.habilidadesBNCC[0])?.descricao}
                    >
                      BNCC: {lesson.habilidadesBNCC[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Desenvolvimento Pedagógico</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">"{lesson.description}"</p>
                </div>
                {lesson.adaptacoesMetodologia && (
                  <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase mb-2">Adaptações de Acessibilidade</p>
                    <p className="text-xs text-indigo-900 leading-relaxed font-semibold italic">"{lesson.adaptacoesMetodologia}"</p>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherRecords;
