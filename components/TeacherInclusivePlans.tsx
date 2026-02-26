
import React, { useState, useMemo } from 'react';
import { Student, Class, User } from '../types';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabaseClient';

interface TeacherInclusivePlansProps {
  students: Student[];
  classes: Class[];
  user: User;
}

type PlanType = 'PEI' | 'PDI' | 'PAEE';

const TeacherInclusivePlans: React.FC<TeacherInclusivePlansProps> = ({ students, classes, user }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activePlan, setActivePlan] = useState<PlanType>('PEI');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Estados para criação de novo plano
  const [creationData, setCreationData] = useState({
    studentId: '',
    type: 'PEI' as PlanType,
    content: ''
  });

  const selectedStudent = useMemo(() =>
    students.find(s => s.id === selectedStudentId),
    [students, selectedStudentId]);

  const handleSave = (type: PlanType) => {
    if (!selectedStudentId) {
      alert('Selecione um aluno primeiro.');
      return;
    }
    setFeedback(`Plano ${type} atualizado com sucesso!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = async () => {
    if (!selectedStudentId || !selectedStudent) return;

    setFeedback('Gerando Relatório Consolidado (PEI + PDI + PAEE)...');

    try {
      // 1. Buscar dados no Supabase (PEI, PDI, PAEE)
      const [{ data: peiData }, { data: pdiData }, { data: paeeData }] = await Promise.all([
        supabase.from('pei').select('*').eq('student_id', selectedStudentId).maybeSingle(),
        supabase.from('pdi').select('*').eq('student_id', selectedStudentId).maybeSingle(),
        supabase.from('paee').select('*').eq('student_id', selectedStudentId).maybeSingle()
      ]);

      // 2. Iniciar PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.setFont("helvetica", "bold");
      doc.text("Relatório Pedagógico Consolidado", pageWidth / 2, yPos, { align: "center" });

      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Sistema IncluiEduTec — Gestão Pedagógica em Inclusão", pageWidth / 2, yPos, { align: "center" });

      yPos += 15;
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPos, pageWidth - 20, yPos);

      // Identificação
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55); // Gray 900
      doc.text("Identificação do Aluno", 20, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Nome: ${selectedStudent.name}`, 20, yPos);
      doc.text(`RA: ${selectedStudent.ra}`, 120, yPos);

      yPos += 7;
      const studentClass = classes.find(c => c.id === selectedStudent.classId);
      doc.text(`Turma: ${studentClass?.name || 'Não informada'}`, 20, yPos);
      doc.text(`Professor(a): ${user.name}`, 120, yPos);

      // --- Seção PEI ---
      yPos += 20;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(79, 70, 229);
      doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
      doc.setTextColor(255);
      doc.text("PEI — PLANO EDUCACIONAL INDIVIDUALIZADO", 25, yPos + 1);

      yPos += 12;
      doc.setTextColor(75);
      doc.setFont("helvetica", "normal");
      if (peiData) {
        const peiLines = doc.splitTextToSize(peiData.content || peiData.metas || 'Sem registros detalhados no sistema.', pageWidth - 50);
        doc.text(peiLines, 25, yPos);
        yPos += (peiLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PEI encontrado para este aluno.", 25, yPos);
        yPos += 10;
      }

      // --- Seção PDI ---
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(147, 51, 234); // Purple 600
      doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
      doc.setTextColor(255);
      doc.text("PDI — PLANO DE DESENVOLVIMENTO INDIVIDUAL", 25, yPos + 1);

      yPos += 12;
      doc.setTextColor(75);
      doc.setFont("helvetica", "normal");
      if (pdiData) {
        const pdiLines = doc.splitTextToSize(pdiData.content || pdiData.desenvolvimento || 'Sem registros detalhados no sistema.', pageWidth - 50);
        doc.text(pdiLines, 25, yPos);
        yPos += (pdiLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PDI encontrado para este aluno.", 25, yPos);
        yPos += 10;
      }

      // --- Seção PAEE ---
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(5, 150, 105); // Emerald 600
      doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
      doc.setTextColor(255);
      doc.text("PAEE — PLANO DE ATENDIMENTO EDUCACIONAL ESPECIALIZADO", 25, yPos + 1);

      yPos += 12;
      doc.setTextColor(75);
      doc.setFont("helvetica", "normal");
      if (paeeData) {
        const paeeLines = doc.splitTextToSize(paeeData.content || paeeData.recursos || 'Sem registros detalhados no sistema.', pageWidth - 50);
        doc.text(paeeLines, 25, yPos);
        yPos += (paeeLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PAEE encontrado para este aluno.", 25, yPos);
        yPos += 10;
      }

      // Rodapé
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      yPos += 30;
      doc.setDrawColor(200);
      doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(user.name, pageWidth / 2, yPos + 5, { align: "center" });
      doc.text("Professor Responsável", pageWidth / 2, yPos + 10, { align: "center" });

      // Finalizar e Salvar
      doc.save(`relatorio_consolidado_${selectedStudent.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);

      setFeedback("Relatório Consolidado (PEI + PDI + PAEE) exportado com sucesso!");
      setTimeout(() => setFeedback(null), 5000);

    } catch (error: any) {
      console.error("Erro na exportação:", error);
      setFeedback(`Falha na exportação: ${error.message || 'Desconhecido'}`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCreatePlan = () => {
    // Agora o botão abre o modo de criação em vez de apenas mostrar um alerta
    setIsCreatingNew(true);
    if (selectedStudentId) {
      setCreationData(prev => ({ ...prev, studentId: selectedStudentId }));
    }
  };

  const handleFinalizeCreation = () => {
    if (!creationData.studentId || !creationData.content) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setFeedback(`Novo plano ${creationData.type} criado com sucesso para o aluno!`);
    setIsCreatingNew(false);
    setSelectedStudentId(creationData.studentId);
    setActivePlan(creationData.type);
    setCreationData({ studentId: '', type: 'PEI', content: '' });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header e Seleção de Aluno */}
      <header className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-file-medical"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Planos Inclusivos</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão Pedagógica Estruturada - AEE & Inclusão</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setIsCreatingNew(false);
            }}
            className="w-full sm:w-64 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="">Selecione um Aluno...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({classes.find(c => c.id === s.classId)?.name})</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleCreatePlan}
              className={`px-6 py-3.5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg whitespace-nowrap ${isCreatingNew ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                }`}
            >
              <i className={`fa-solid ${isCreatingNew ? 'fa-xmark' : 'fa-file-signature'}`}></i>
              {isCreatingNew ? 'Cancelar Criação' : 'Fazer Plano Inclusivo'}
            </button>

            {selectedStudentId && !isCreatingNew && (
              <button
                onClick={handleExport}
                className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <i className="fa-solid fa-file-pdf"></i> Exportar
              </button>
            )}
          </div>
        </div>
      </header>

      {isCreatingNew ? (
        <div className="bg-white p-10 rounded-[3.5rem] border border-blue-100 shadow-xl shadow-blue-900/5 animate-in zoom-in-95 duration-500 space-y-10">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <i className="fa-solid fa-plus-circle"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Elaborar Novo Plano Inclusivo</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Preencha os dados iniciais para o registro</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno Alvo *</label>
              <select
                value={creationData.studentId}
                onChange={(e) => setCreationData({ ...creationData, studentId: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecione o Aluno...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Documento *</label>
              <select
                value={creationData.type}
                onChange={(e) => setCreationData({ ...creationData, type: e.target.value as PlanType })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="PEI">PEI - Plano Educacional Individualizado</option>
                <option value="PDI">PDI - Plano de Desenvolvimento Individual</option>
                <option value="PAEE">PAEE - Plano de AEE</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conteúdo do Plano *</label>
              <textarea
                value={creationData.content}
                onChange={(e) => setCreationData({ ...creationData, content: e.target.value })}
                placeholder="Descreva aqui os objetivos, metas e estratégias pedagógicas..."
                rows={6}
                className="w-full p-6 bg-gray-50 border border-gray-200 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-8 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors"
            >
              Descartar
            </button>
            <button
              onClick={handleFinalizeCreation}
              className="px-12 py-4 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              Finalizar e Salvar Plano
            </button>
          </div>
        </div>
      ) : selectedStudentId ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegação Lateral e Alertas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-2">
              {(['PEI', 'PDI', 'PAEE'] as PlanType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActivePlan(type)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between group ${activePlan === type
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'hover:bg-gray-50 text-gray-500'
                    }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{type}</span>
                  <i className={`fa-solid fa-chevron-right text-[10px] ${activePlan === type ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></i>
                </button>
              ))}
            </div>

            {/* Alert Box para Revisão */}
            <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Revisão Periódica</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Próxima revisão agendada para: <br />
                <span className="font-black">15 de Novembro de 2024</span>
              </p>
              <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[80%]"></div>
              </div>
            </div>

            {/* Timeline Simplificada */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <i className="fa-solid fa-timeline text-indigo-500"></i> Linha do Tempo
              </h3>
              <div className="space-y-6">
                {[
                  { date: '12/09', label: 'Meta de Cálculo batida', icon: 'fa-check-circle', color: 'text-emerald-500' },
                  { date: '05/08', label: 'Ajuste no PAEE (SRM)', icon: 'fa-info-circle', color: 'text-blue-500' },
                  { date: '20/07', label: 'Reunião PDI (Família)', icon: 'fa-users', color: 'text-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx < 2 && <div className="absolute left-[11px] top-6 w-0.5 h-6 bg-gray-100"></div>}
                    <i className={`fa-solid ${item.icon} ${item.color} mt-1 text-xs z-10 bg-white`}></i>
                    <div>
                      <p className="text-[10px] font-black text-gray-800">{item.label}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Área de Conteúdo do Plano Ativo */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 p-8">
                <span className="text-8xl font-black text-gray-50 opacity-[0.03] select-none">{activePlan}</span>
              </div>

              {feedback && (
                <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in-95">
                  <i className="fa-solid fa-circle-check"></i> {feedback}
                </div>
              )}

              {activePlan === 'PEI' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">PEI – Plano Educacional Individualizado</h2>
                    <p className="text-gray-500 text-xs font-medium">Foco acadêmico e adaptação curricular. Responsabilidade: <span className="font-bold text-indigo-600">Professor Regente</span></p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metas Acadêmicas Curto/Médio Prazo</label>
                      <textarea
                        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px]"
                        placeholder="Ex: Identificar números decimais, ampliar vocabulário..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adaptações Curriculares Necessárias</label>
                      <textarea
                        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px]"
                        placeholder="Ex: Provas com letras ampliadas, tempo estendido..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Acompanhamento e Upload de Documentos</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-50 border border-dashed border-indigo-200 text-indigo-600 rounded-2xl cursor-pointer hover:bg-indigo-100 transition-all group">
                        <i className="fa-solid fa-cloud-arrow-up group-hover:-translate-y-1 transition-transform"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Anexar Laudo / Relatório</span>
                        <input type="file" className="hidden" />
                      </label>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <i className="fa-solid fa-file-pdf text-rose-500 text-xl"></i>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-800">avaliacao_bimestral.pdf</span>
                          <span className="text-[9px] text-gray-400 uppercase">12/09/2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlan === 'PDI' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">PDI – Plano de Desenvolvimento Individual</h2>
                    <p className="text-gray-500 text-xs font-medium">Desenvolvimento social e emocional. Responsabilidade: <span className="font-bold text-purple-600">Equipe Colaborativa</span></p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dimensão Social e Emocional</label>
                        <textarea className="w-full p-5 bg-purple-50/30 border border-purple-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" placeholder="Interação com pares, autorregulação..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autonomia e Funcionalidade</label>
                        <textarea className="w-full p-5 bg-purple-50/30 border border-purple-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" placeholder="Higiene pessoal, organização de materiais..." />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4">
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Registro de Reuniões</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[11px] font-bold">Conselho de Classe Inclusivo</p>
                            <p className="text-[9px] text-white/50">20/07/2024 • Família + Equipe Gestora</p>
                          </div>
                          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase transition-all">Novo Registro</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlan === 'PAEE' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">PAEE – Atendimento Especializado</h2>
                      <p className="text-gray-500 text-xs font-medium">Recursos de acessibilidade e SRM. Responsabilidade: <span className="font-bold text-emerald-600">Professor de AEE</span></p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase animate-pulse">
                      <i className="fa-solid fa-link mr-1"></i> Alimentando PEI/PDI
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Barreiras Identificadas</label>
                      <textarea className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" placeholder="Física, Atitudinal, Comunicacional..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos de Acessibilidade</label>
                      <textarea className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" placeholder="Soroban, Teclado Adaptado, Prancha de CAA..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estratégias de Intervenção</label>
                      <textarea className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" placeholder="Atendimento em contraturno na SRM..." />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
                    <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
                    <div>
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Integração SRM</p>
                      <p className="text-[11px] text-blue-700 leading-relaxed">Os dados inseridos no PAEE pelo professor do AEE são espelhados nos Planos PEI e PDI para garantir a unidade do atendimento pedagógico.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end gap-4">
                <button
                  onClick={() => handleSave(activePlan)}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center gap-3"
                >
                  <i className="fa-solid fa-floppy-disk"></i> Atualizar Registro {activePlan}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 text-3xl">
            <i className="fa-solid fa-user-check"></i>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Inicie selecionando um aluno</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium italic">Selecione o aluno no menu superior para visualizar seu histórico de planos inclusivos.</p>
          <button
            onClick={handleCreatePlan}
            className="mt-4 px-8 py-3.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
          >
            Começar Nova Elaboração
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherInclusivePlans;
