
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Class, LessonPlan } from '../types';
import { jsPDF } from 'jspdf';

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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    temaAula: '',
    classId: initialClassId || '',
    studentId: '', // Ainda mantido para registros individuais se necessário
    description: '',
    habilidadesBNCC: '',
    adaptacoesMetodologia: '',
    objetivos: '',
    estrategias: '',
    shared: false
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
      id: editingId || undefined,
      classId: formData.classId,
      temaAula: formData.temaAula,
      description: formData.description,
      habilidadesBNCC: formData.habilidadesBNCC ? [formData.habilidadesBNCC] : [],
      adaptacoesMetodologia: formData.adaptacoesMetodologia,
      objetivos: formData.objetivos,
      estrategias: formData.estrategias,
      shared: formData.shared
    });

    setIsAdding(false);
    setEditingId(null);
    setFormData({
      temaAula: '',
      classId: '',
      studentId: '',
      description: '',
      habilidadesBNCC: '',
      adaptacoesMetodologia: '',
      objetivos: '',
      estrategias: '',
      shared: false
    });
  };

  const handleEdit = (lesson: LessonPlan) => {
    setFormData({
      temaAula: lesson.temaAula,
      classId: lesson.classId,
      studentId: '',
      description: lesson.description || '',
      habilidadesBNCC: lesson.habilidadesBNCC?.[0] || '',
      adaptacoesMetodologia: lesson.adaptacoesMetodologia || '',
      objetivos: lesson.objetivos || '',
      estrategias: lesson.estrategias || '',
      shared: lesson.shared || false
    });
    setEditingId(lesson.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = (lesson: LessonPlan) => {
    const doc = new jsPDF();
    const className = classes.find(c => c.id === lesson.classId)?.name || 'N/A';
    
    // Configurações de cores e fontes
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('Planejamento Pedagógico', 15, 25);
    
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    let y = 50;
    const drawSection = (title: string, content: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 15, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content || 'Não informado', 180);
      doc.text(lines, 15, y);
      y += (lines.length * 7) + 10;
    };

    // Card de Informações
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(15, y, 180, 25, 3, 3);
    doc.text(`DATA: ${new Date(lesson.createdAt).toLocaleDateString('pt-BR')}`, 20, y + 10);
    doc.text(`TURMA: ${className}`, 20, y + 17);
    doc.text(`TEMA: ${lesson.temaAula}`, 100, y + 10);
    if (lesson.habilidadesBNCC?.[0]) {
      doc.text(`BNCC: ${lesson.habilidadesBNCC[0]}`, 100, y + 17);
    }
    y += 35;

    drawSection('Objetivos da Aprendizagem', lesson.objetivos);
    drawSection('Estratégias de Ensino', lesson.estrategias);
    drawSection('Desenvolvimento / Conteúdo', lesson.description);
    
    if (lesson.adaptacoesMetodologia) {
      doc.setTextColor(79, 70, 229);
      drawSection('Adaptações Metodológicas', lesson.adaptacoesMetodologia);
    }
    
    doc.save(`planejamento_${lesson.temaAula.replace(/\s+/g, '_')}.pdf`);
  };

  const handleToggleShare = (lesson: LessonPlan) => {
    onSave({
      ...lesson,
      shared: !lesson.shared
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
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Planejamento Pedagógico</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão completa de planos de aula e marcos de ensino</p>
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
          {isAdding ? 'Cancelar Planejamento' : 'Novo Plano de Aula'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-900/5 animate-in zoom-in-95 duration-300">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            {editingId ? 'Editar Planejamento' : 'Novo Plano de Aula'}
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Objetivos da Aprendizagem</label>
                <textarea
                  value={formData.objetivos}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                  placeholder="Quais os objetivos principais desta aula?"
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estratégias de Ensino</label>
                <textarea
                  value={formData.estrategias}
                  onChange={(e) => setFormData({ ...formData, estrategias: e.target.value })}
                  placeholder="Quais métodos e ferramentas serão utilizados?"
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição do Registro / Conteúdo *</label>
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

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.shared}
                    onChange={(e) => setFormData({ ...formData, shared: e.target.checked })}
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${formData.shared ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.shared ? 'translate-x-7' : ''}`}></div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                    Compartilhar com a Coordenação
                  </span>
                  <p className="text-[9px] text-gray-400">Torna este planejamento visível para a escola</p>
                </div>
              </label>

              <button
                type="submit"
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                Salvar {editingId ? 'Alterações' : 'Planejamento'}
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
            <div key={lesson.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden">
              {lesson.shared && (
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-500 text-white text-[8px] font-black uppercase py-1 px-4 rounded-bl-xl tracking-tighter">
                    Compartilhado
                  </div>
                </div>
              )}

              <div className="md:w-48 flex-shrink-0 space-y-3">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{new Date(lesson.createdAt).toLocaleDateString('pt-BR')}</p>
                <h4 className="text-sm font-bold text-gray-800">{classes.find(c => c.id === lesson.classId)?.name || 'Turma N/A'}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100">
                    {lesson.temaAula}
                  </span>
                  {lesson.habilidadesBNCC && lesson.habilidadesBNCC.length > 0 && (
                    <span
                      className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100 cursor-help"
                      title={bnccData.find(b => b.codigo === lesson.habilidadesBNCC[0])?.descricao || ''}
                    >
                      BNCC: {lesson.habilidadesBNCC[0]}
                    </span>
                  )}
                </div>

                <div className="pt-2 grid grid-cols-1 gap-2">
                  <button
                    onClick={() => onSave({ ...lesson, shared: true })}
                    disabled={lesson.shared}
                    className={`w-full py-2 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${lesson.shared
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                      }`}
                  >
                    <i className="fa-solid fa-share-nodes"></i>
                    {lesson.shared ? 'Compartilhado' : 'Compartilhar'}
                  </button>

                  <button
                    onClick={() => handleEdit(lesson)}
                    className="w-full py-2 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    Editar
                  </button>

                  <button
                    onClick={() => handleExport(lesson)}
                    className="w-full py-2 px-3 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    Exportar
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Desenvolvimento / Conteúdo</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">"{lesson.description}"</p>
                  </div>

                  {lesson.objetivos && (
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Objetivos da Aprendizagem</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">"{lesson.objetivos}"</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {lesson.estrategias && (
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Estratégias de Ensino</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">"{lesson.estrategias}"</p>
                    </div>
                  )}

                  {lesson.adaptacoesMetodologia && (
                    <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100">
                      <p className="text-[9px] font-black text-indigo-500 uppercase mb-2">Adaptações de Acessibilidade</p>
                      <p className="text-xs text-indigo-900 leading-relaxed font-semibold italic">"{lesson.adaptacoesMetodologia}"</p>
                    </div>
                  )}
                </div>
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
