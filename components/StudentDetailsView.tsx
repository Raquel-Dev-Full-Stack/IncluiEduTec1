import React, { useState, useEffect } from 'react';
import { Student, Class, User, Guardian, UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentDetailsViewProps {
  student: Student;
  studentClass: Class | undefined;
  mediator: User | undefined;
  regentTeacher?: User;
  onBack: () => void;
  currentUser?: User;
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ student, studentClass, mediator, regentTeacher, onBack, currentUser }) => {
  const [notas, setNotas] = useState<Record<string, any>>(student.notas || {});
  const [isEditingNotas, setIsEditingNotas] = useState(false);
  const [selectedBimestre, setSelectedBimestre] = useState('1º_bimestre');
  const [editForm, setEditForm] = useState({ subject: '', grade: '', obs: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Estados para o Histórico do Mediador
  const [historico, setHistorico] = useState<any[]>([]);
  const [isEditingHistorico, setIsEditingHistorico] = useState(false);
  const [historicoForm, setHistoricoForm] = useState({ date: new Date().toISOString().split('T')[0], observation: '' });
  const [isSavingHistorico, setIsSavingHistorico] = useState(false);
  const [mediatorStudentId, setMediatorStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        // 1. Buscar da tabela legada mediator_students
        const { data: legacyData } = await supabase
          .from('mediator_students')
          .select('*')
          .eq('student_id', student.id)
          .limit(1);
        
        let mergedHistorico: any[] = [];
        if (legacyData && legacyData.length > 0) {
          setMediatorStudentId(legacyData[0].id);
          mergedHistorico = legacyData[0].historico || [];
        }

        // 2. Buscar da nova tabela mediator_records
        const { data: newRecords } = await supabase
          .from('mediator_records')
          .select('*')
          .eq('student_id', student.id);

        // 3. Buscar da tabela student_records (fallback de observações)
        const { data: fallbackRecords } = await supabase
          .from('student_records')
          .select('*')
          .eq('student_id', student.id)
          .eq('record_type', 'observacao');

        let finalHistory = [...mergedHistorico];

        if (newRecords) {
           newRecords.forEach(r => {
             finalHistory.push({
               id: r.id,
               date: r.date,
               observation: r.notes || 'Registro de monitoramento',
               mediatorName: r.mediator_name || 'Mediador',
               behaviorStatus: r.behavior_status,
               hygiene: r.hygiene,
               feeding: r.feeding,
               mobility: r.mobility,
               interactedStudents: r.interacted_students,
               groupActivity: r.group_activity,
               eyeContact: r.eye_contact,
               isNewSystem: true
             });
           });
        }

        if (fallbackRecords) {
          fallbackRecords.forEach(r => {
            finalHistory.push({
              id: r.id,
              date: r.created_at || r.date,
              observation: r.observation || r.value,
              mediatorName: 'Sistema (Resiliente)',
              isFallback: true
            });
          });
        }

        // Remover duplicados e ordenar
        const uniqueFinal = Array.from(new Map(finalHistory.map(item => [item.id || item.createdAt || Math.random(), item])).values());
        setHistorico(uniqueFinal.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      } catch (err) {
        console.error('Erro ao buscar histórico do mediador:', err);
      }
    };
    fetchHistorico();
  }, [student.id]);

  const bimesters = ['1º_bimestre', '2º_bimestre', '3º_bimestre', '4º_bimestre'];

  const getNotaValue = (val: any) => {
    if (!val) return 0;
    const target = Array.isArray(val) ? val[0] : val;
    if (typeof target === 'object' && target !== null) {
      return Number(target.nota || target.Nota || target.grade || 0);
    }
    return Number(target || 0);
  };

  const getNotaObs = (val: any) => {
    if (!val) return '';
    const target = Array.isArray(val) ? val[0] : val;
    if (typeof target === 'object' && target !== null) {
      return target.observacao || target.obs || target.observation || target.Observações || '';
    }
    return '';
  };

  const chartData = bimesters.map(bim => {
    const bimData = notas[bim] || {};
    const subjects = Object.keys(bimData);
    if (subjects.length === 0) return { name: bim.replace('_', ' '), media: null };
    
    const sum = subjects.reduce((acc, sub) => acc + getNotaValue(bimData[sub]), 0);
    return { name: bim.replace('_', ' '), media: Number((sum / subjects.length).toFixed(1)) };
  });

  const getAnnualAverage = () => {
    const validMedias = chartData.filter(d => d.media !== null).map(d => d.media!);
    if (validMedias.length === 0) return { avg: 0, count: 0 };
    const sum = validMedias.reduce((a, b) => a + b, 0);
    return { avg: Number((sum / validMedias.length).toFixed(1)), count: validMedias.length };
  };

  const { avg: annualAvg, count: validBimestersCount } = getAnnualAverage();
  const finalStatus = validBimestersCount === 0 ? 'Sem notas' : (annualAvg >= 6.0 ? 'Aprovado' : 'Recuperação');

  const handleAddNota = async () => {
    if (!editForm.subject || !editForm.grade) return;
    setIsSaving(true);
    
    const newNotas = { ...notas };
    if (!newNotas[selectedBimestre]) newNotas[selectedBimestre] = {};
    
    newNotas[selectedBimestre][editForm.subject] = {
      nota: Number(editForm.grade),
      obs: editForm.obs
    };

    try {
      const { error } = await supabase
        .from('students')
        .update({ notas: newNotas })
        .eq('id', student.id);

      if (error) throw error;
      
      setNotas(newNotas);
      setEditForm({ subject: '', grade: '', obs: '' });
      // Updates local App state if passed down, but for now it's okay because StudentDetailsView fetches initially.
      student.notas = newNotas;
    } catch (err) {
      console.error('Erro ao salvar nota:', err);
      alert('Erro ao salvar nota.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNota = async (subject: string) => {
    if (!confirm(`Deseja remover a nota de ${subject}?`)) return;
    
    const newNotas = { ...notas };
    delete newNotas[selectedBimestre][subject];
    
    try {
      const { error } = await supabase
        .from('students')
        .update({ notas: newNotas })
        .eq('id', student.id);

      if (error) throw error;
      setNotas(newNotas);
      student.notas = newNotas;
    } catch (err) {
      console.error('Erro ao remover nota:', err);
      alert('Erro ao remover nota.');
    }
  };

  const handleAddHistorico = async () => {
    if (!historicoForm.date || !historicoForm.observation) return;
    setIsSavingHistorico(true);

    const newRecord = {
      id: crypto.randomUUID(),
      date: historicoForm.date,
      observation: historicoForm.observation,
      mediatorName: currentUser?.name || 'Mediador',
      createdAt: new Date().toISOString()
    };

    const newHistorico = [newRecord, ...historico].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      if (mediatorStudentId) {
        const { error } = await supabase
          .from('mediator_students')
          .update({ historico: newHistorico })
          .eq('id', mediatorStudentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('mediator_students')
          .insert({
            student_id: student.id,
            mediator_id: currentUser?.id,
            historico: newHistorico
          })
          .select()
          .single();
        if (error) throw error;
        if (data) setMediatorStudentId(data.id);
      }
      
      setHistorico(newHistorico);
      setHistoricoForm({ date: new Date().toISOString().split('T')[0], observation: '' });
      setIsEditingHistorico(false);
    } catch (err) {
      console.error('Erro ao salvar histórico:', err);
      alert('Erro ao salvar histórico do mediador.');
    } finally {
      setIsSavingHistorico(false);
    }
  };

  const handleDeleteHistorico = async (id: string) => {
    if (!confirm('Deseja remover este registro do histórico?')) return;
    if (!mediatorStudentId) return;

    const newHistorico = historico.filter(h => h.id !== id);

    try {
      const { error } = await supabase
        .from('mediator_students')
        .update({ historico: newHistorico })
        .eq('id', mediatorStudentId);

      if (error) throw error;
      setHistorico(newHistorico);
    } catch (err) {
      console.error('Erro ao remover histórico:', err);
      alert('Erro ao remover histórico.');
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleExportPDF = () => {
    try {
      console.log('Exporting PDF for student:', student.name);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título e Header
      doc.setFillColor(31, 41, 55); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHA INDIVIDUAL DO ALUNO', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });

      let yPos = 50;

      // Seção 1: Dados Pessoais
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. DADOS PESSOAIS', 14, yPos);
      yPos += 10;

      const personalBody = [
        ['Nome Completo', String(student?.name || 'N/A')],
        ['RA (Registro Acadêmico)', String(student?.ra || 'N/A')],
        ['Data de Nascimento', String(formatDate(student?.birthDate || student?.birth_date))],
        ['Idade', String(calculateAge(student?.birthDate || student?.birth_date))],
        ['Turma', String(studentClass?.name || 'Não vinculada')],
        ['Série/Ano', String(student?.grade || studentClass?.level || 'N/A')],
        ['Atendimento AEE', student?.aee ? 'Sim' : 'Não'],
        ['Situação de Matrícula', student?.active !== false ? 'Ativa' : 'Inativa'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Campo', 'Informação']],
        body: personalBody,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Seção 2: Perfil Clínico e Equipe
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. PERFIL CLÍNICO E APOIO', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Campo', 'Informação']],
        body: [
          ['Deficiência Principal', String(student?.deficiency || 'Não informada')],
          ['Diagnóstico/CID', String(student?.diagnosis || 'Pendente')],
          ['Possui Laudo Médico', student?.hasMedicalReport ? 'Sim' : 'Não'],
          ['Mediador Responsável', String(mediator?.name || 'Sem mediador')],
          ['Professor Regente', String(regentTeacher?.name || 'Não identificado')],
        ],
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Seção 3: Responsáveis Familiares
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. RESPONSÁVEIS FAMILIARES', 14, yPos);
      yPos += 10;

      const guardianData = Array.isArray(student?.guardians) ? student.guardians.map(g => [
        String(g.relation || '-'), 
        String(g.name || '-'), 
        String(g.phone || '-'), 
        String(g.email || '-')
      ]) : [];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Parentesco', 'Nome', 'Telefone', 'E-mail']],
        body: guardianData.length > 0 ? guardianData : [['-', 'Nenhum cadastrado', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Seção 4: Histórico Pedagógico (Notas)
      if (yPos > 230) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('4. DESEMPENHO ACADÊMICO (NOTAS)', 14, yPos);
      yPos += 10;

      const allGrades: any[] = [];
      const safeNotas = notas || {};
      ['1º_bimestre', '2º_bimestre', '3º_bimestre', '4º_bimestre'].forEach(bim => {
        const bimNotas = safeNotas[bim] || {};
        Object.keys(bimNotas).forEach(sub => {
          const val = bimNotas[sub];
          const notaVal = getNotaValue(val);
          allGrades.push([
            String(bim.replace('_', ' ')), 
            String(sub), 
            typeof notaVal === 'number' ? notaVal.toFixed(1) : '0.0', 
            String(getNotaObs(val) || '-')
          ]);
        });
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Bimestre', 'Disciplina', 'Nota', 'Observação']],
        body: allGrades.length > 0 ? allGrades : [['-', 'Sem notas lançadas', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Seção 5: Histórico de Saúde e Refeições
      if (yPos > 230) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('5. HISTÓRICO DE SAÚDE E REFEIÇÕES', 14, yPos);
      yPos += 10;

      const safeRefeicoes = Array.isArray(student?.refeicoes) ? student.refeicoes : [];
      const safeEvacuacao = Array.isArray(student?.evacuacao) ? student.evacuacao : [];

      const healthHistory = safeRefeicoes
        .filter(r => r && r.data)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 20)
        .map(r => {
          const evac = safeEvacuacao.find(e => e.data === r.data);
          return [
            String(formatDate(r.data)),
            String(r.cafe_da_manha || r.tipo_refeicao === 'Café da Manhã' ? r.status_consumo || 'Sim' : '-'),
            String(r.almoco || r.tipo_refeicao === 'Almoço' ? r.status_consumo || 'Sim' : '-'),
            String(r.lanche || r.tipo_refeicao === 'Lanche' ? r.status_consumo || 'Sim' : '-'),
            r.dormiu ? 'Sim' : 'Não',
            evac?.evacuou ? 'Sim' : 'Não'
          ];
        });

      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Café', 'Almoço', 'Lanche', 'Dormiu?', 'Evacuou?']],
        body: healthHistory.length > 0 ? healthHistory : [['-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 8 }
      });

      doc.save(`Ficha_Aluno_${(student?.name || 'Aluno').replace(/\s+/g, '_')}.pdf`);
    } catch (error: any) {
      console.error('Erro detalhado ao gerar PDF:', error);
      alert(`Houve um problema técnico ao gerar o PDF: ${error.message || 'Erro desconhecido'}. Tente atualizar a página.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Botão Voltar e Exportar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-all shadow-sm">
            <i className="fa-solid fa-arrow-left"></i>
          </div>
          Voltar para Lista de Alunos
        </button>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-sm group"
        >
          <i className="fa-solid fa-file-pdf text-rose-500 text-lg group-hover:scale-110 transition-transform"></i>
          Exportar Ficha em PDF
        </button>
      </div>

      {/* Header do Perfil */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-200 dark:shadow-none shrink-0 mt-2">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{student.name}</h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.aee ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  {student.aee ? 'Atendimento AEE Ativo' : 'Sem AEE'}
                </span>
                {student.active !== false && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    Matrícula Ativa
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-barcode text-emerald-500"></i> Registro Acadêmico
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{student.ra || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-cake-candles text-emerald-500"></i> Nascimento
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{calculateAge(student.birthDate || student.birth_date)} ({formatDate(student.birthDate || student.birth_date)})</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-school text-emerald-500"></i> Turma Oficial
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{studentClass?.name || 'Não vinculada'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-layer-group text-emerald-500"></i> Série / Ano
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{student.grade || studentClass?.level || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Detalhamento Pedagógico e Clínico */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seção 1: Corpo Docente e Apoio */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Equipe de Apoio e Responsáveis Pedagógicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mediador(a) Inclusivo</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{mediator?.name || 'Sem mediador atribuído'}</p>
                </div>
              </div>
              <div className="p-5 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-lg shadow-purple-200 dark:shadow-none shrink-0">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Professor(a) Regente</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{regentTeacher?.name || 'Não identificado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Diagnóstico e Deficiência */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Perfil Clínico e Diagnóstico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deficiência Principal</p>
                <div className="p-5 bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                  <p className="text-sm font-black text-rose-600 dark:text-rose-400">{student.deficiency || 'Não informada'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Diagnóstico Detalhado (CID)</p>
                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-500">{student.diagnosis || 'Pendente de preenchimento'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Responsáveis */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Grupo Familiar / Responsáveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.guardians && student.guardians.length > 0 ? (
                student.guardians.map((guardian, idx) => (
                  <div key={idx} className="p-6 bg-gray-50/50 dark:bg-slate-800/40 rounded-[2rem] border border-gray-100 dark:border-slate-800/60 shadow-sm transition-all hover:border-emerald-200 dark:hover:border-emerald-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-user-group"></i>
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{guardian.relation}</span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-800 dark:text-white capitalize mb-3 italic">{guardian.name}</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-50 dark:border-slate-700 shadow-sm">
                        <i className="fa-solid fa-phone text-emerald-500"></i>
                        <span className="font-bold">{guardian.phone}</span>
                      </div>
                      {guardian.email && (
                        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-50 dark:border-slate-700 shadow-sm overflow-hidden">
                          <i className="fa-solid fa-envelope text-blue-500"></i>
                          <span className="truncate">{guardian.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                  <i className="fa-solid fa-users-slash text-gray-300 text-3xl mb-3 block"></i>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhum responsável cadastrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção 4: Descrição Pedagógica */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Observações e Descrição Pedagógica
            </h3>
            <div className="p-8 bg-gray-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-gray-100 dark:border-slate-800 italic text-gray-600 dark:text-slate-400 leading-relaxed text-sm relative">
               <div className="absolute top-4 left-4 text-gray-200 dark:text-slate-700 text-4xl opacity-50">
                  <i className="fa-solid fa-quote-left"></i>
               </div>
               <p className="relative z-10 px-6">
                {student.description || 'Nenhuma descrição detalhada disponível para este aluno no momento.'}
               </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Laudo e Dados do Sistema */}
        <div className="space-y-6">
          {/* Seção 5: Documentação */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Documentação Médica
            </h3>
            
            <div className={`p-8 rounded-[2rem] border-2 border-dashed ${student.hasMedicalReport ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800'}`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${student.hasMedicalReport ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-100' : 'bg-gray-200 dark:bg-slate-800 text-gray-400'}`}>
                  <i className={`fa-solid ${student.hasMedicalReport ? 'fa-file-medical' : 'fa-file-circle-xmark'}`}></i>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                    {student.hasMedicalReport ? 'Laudo Médico (CID)' : 'Laudo não anexado'}
                  </p>
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 mt-1 uppercase font-black tracking-widest">
                    {student.hasMedicalReport ? 'Documento PDF/IMG' : 'Pendente de validação'}
                  </p>
                </div>
                
                {student.hasMedicalReport && student.medicalReportUrl && (
                  <a
                    href={student.medicalReportUrl}
                    download={`laudo-${student.name.split(' ')[0]}`}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-download"></i>
                    Baixar Documento
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Seção 5: Regime e Matrícula */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200 dark:bg-slate-800"></span>
              Metadados do Sistema
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-clock text-blue-400"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Regime</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.schoolRegime || 'Parcial'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-sun text-amber-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Período</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.attendancePeriod || 'N/A'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-calendar-check text-emerald-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ano Matrícula</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{student.enrollment_year || student.year || '2026'}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-magnifying-glass-chart text-indigo-500"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monitoramento</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{formatDate(student.last_monitoring_at) || 'Sem data'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nova Seção: Evolução do Aluno */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-8 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            Evolução do Aluno
          </h3>
          {(currentUser?.profile === UserProfile.PROFESSOR || currentUser?.profile === UserProfile.ADMIN) && (
            <button
              onClick={() => setIsEditingNotas(!isEditingNotas)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isEditingNotas ? 'Fechar Edição' : 'Lançar Notas'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Seletor de Bimestre */}
            <div className="flex gap-2">
              {bimesters.map(bim => (
                <button
                  key={bim}
                  onClick={() => setSelectedBimestre(bim)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedBimestre === bim ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400'}`}
                >
                  {bim.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Tabela de Notas */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50">
                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Disciplina</th>
                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Nota</th>
                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Observações</th>
                    {isEditingNotas && <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(notas[selectedBimestre] || {}).map(sub => {
                    const val = notas[selectedBimestre][sub];
                    return (
                      <tr key={sub} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-gray-800 dark:text-slate-200 text-sm">{sub}</td>
                        <td className="p-4 font-black text-indigo-600 dark:text-indigo-400">{getNotaValue(val).toFixed(1)}</td>
                        <td className="p-4 text-gray-500 dark:text-slate-400 text-xs italic">{getNotaObs(val) || '-'}</td>
                        {isEditingNotas && (
                          <td className="p-4">
                            <button onClick={() => handleDeleteNota(sub)} className="text-rose-500 hover:text-rose-600 text-sm">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {Object.keys(notas[selectedBimestre] || {}).length === 0 && !isEditingNotas && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest font-bold">
                        Nenhuma nota lançada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Formulário de Edição */}
            {isEditingNotas && (
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                <h4 className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">Adicionar / Editar Nota</h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Disciplina (ex: Matemática)"
                    value={editForm.subject}
                    onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Nota (0-10)"
                    value={editForm.grade}
                    onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full md:w-32 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Observações (Opcional)"
                  value={editForm.obs}
                  onChange={e => setEditForm({ ...editForm, obs: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddNota}
                  disabled={isSaving || !editForm.subject || !editForm.grade}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Nota'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="bg-gray-50 dark:bg-slate-800/40 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumo Geral</h4>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-600 dark:text-slate-300">Média Anual</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{annualAvg.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 dark:text-slate-300">Situação Parcial</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  finalStatus === 'Aprovado' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  finalStatus === 'Recuperação' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-gray-200 text-gray-500 dark:bg-slate-700'
                }`}>
                  {finalStatus}
                </span>
              </div>
            </div>

            {/* Gráfico de Evolução */}
            <div className="bg-gray-50 dark:bg-slate-800/40 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 h-64">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Evolução de Média</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="media" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Nova Seção: Histórico do Mediador */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-8 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
            Histórico do Mediador
          </h3>
          {(currentUser?.profile === UserProfile.MEDIADOR || currentUser?.profile === UserProfile.ADMIN) && (
            <button
              onClick={() => setIsEditingHistorico(!isEditingHistorico)}
              className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isEditingHistorico ? 'Fechar Edição' : 'Novo Registro'}
            </button>
          )}
        </div>

        {/* Formulário de Adição de Registro */}
        {isEditingHistorico && (
          <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 space-y-4">
            <h4 className="text-xs font-black text-purple-800 dark:text-purple-400 uppercase tracking-widest">Adicionar Observação</h4>
            <div className="flex flex-col gap-4">
              <input
                type="date"
                value={historicoForm.date}
                onChange={e => setHistoricoForm({ ...historicoForm, date: e.target.value })}
                className="w-full md:w-48 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="Descreva as observações pedagógicas e comportamentais do aluno..."
                value={historicoForm.observation}
                onChange={e => setHistoricoForm({ ...historicoForm, observation: e.target.value })}
                rows={4}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              ></textarea>
            </div>
            <button
              onClick={handleAddHistorico}
              disabled={isSavingHistorico || !historicoForm.observation || !historicoForm.date}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              {isSavingHistorico ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        )}

        {/* Lista Cronológica */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-slate-700 before:to-transparent">
          {historico.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest font-bold">
              Nenhum registro no histórico
            </div>
          ) : (
            historico.map((record, idx) => (
              <div key={record.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-purple-100 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <i className="fa-solid fa-check text-xs"></i>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </div>
                    {(currentUser?.profile === UserProfile.ADMIN || isEditingHistorico) && (
                      <button onClick={() => handleDeleteHistorico(record.id)} className="text-gray-400 hover:text-rose-500 transition-colors">
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-2">
                    {record.mediatorName || 'Mediador'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed italic mb-4">
                    "{record.observation}"
                  </p>

                  {/* Detalhes Adicionais do Novo Sistema */}
                  {record.isNewSystem && (
                    <div className="space-y-3 pt-3 border-t border-gray-50 dark:border-slate-700/50">
                      {/* Estado Comportamental */}
                      {record.behaviorStatus && (
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest w-20">Comportamento:</span>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                            record.behaviorStatus === 'CALMO' ? 'bg-emerald-50 text-emerald-600' :
                            record.behaviorStatus === 'AGITADO' ? 'bg-amber-50 text-amber-600' :
                            record.behaviorStatus === 'EM CRISE' ? 'bg-rose-50 text-rose-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {record.behaviorStatus}
                          </span>
                        </div>
                      )}

                      {/* Interação Social */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest w-full mb-1">Interação Social:</span>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.interactedStudents ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 opacity-50'}`}>
                          <i className="fa-solid fa-users"></i> Interação Colegas
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.groupActivity ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 opacity-50'}`}>
                          <i className="fa-solid fa-people-group"></i> Atividade Coletiva
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.eyeContact ? 'bg-cyan-50 text-cyan-600' : 'bg-gray-50 text-gray-400 opacity-50'}`}>
                          <i className="fa-solid fa-eye"></i> Contato Visual
                        </div>
                      </div>

                      {/* Autonomia / Assistência Física */}
                      {(record.hygiene || record.feeding || record.mobility) && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest w-full mb-1">Assistência Física:</span>
                          {record.hygiene && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.hygiene === 'AUTÔNOMO' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              <i className="fa-solid fa-soap"></i> Higiene: {record.hygiene}
                            </div>
                          )}
                          {record.feeding && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.feeding === 'AUTÔNOMO' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              <i className="fa-solid fa-utensils"></i> Alimento: {record.feeding}
                            </div>
                          )}
                          {record.mobility && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold ${record.mobility === 'AUTÔNOMO' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              <i className="fa-solid fa-person-walking"></i> Mobilidade: {record.mobility}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEÇÃO REFEIÇÕES E SAÚDE */}
      <div className="bg-[#1a1b2e] p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl shadow-indigo-900/20 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-indigo-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
              <i className="fa-solid fa-utensils"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Refeições e Saúde Diária</h3>
              <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Acompanhamento nutricional</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-950/50 border-b border-indigo-500/20">
                <th className="px-6 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Café da Manhã</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Colação</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Almoço</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Lanche</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Janta</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Dormiu?</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center">Evacuou?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/10">
              {!student.refeicoes || student.refeicoes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-indigo-400 font-bold uppercase text-xs tracking-widest">
                    Nenhum registro de alimentação encontrado.
                  </td>
                </tr>
              ) : (
                [...(student.refeicoes || [])].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((r, i) => {
                  const todayEvac = (student.evacuacao || []).find(e => e.data === r.data);
                  const formatMeal = (status: string) => {
                    if (status === 'tudo') return <span className="text-emerald-400">Comeu tudo</span>;
                    if (status === 'metade') return <span className="text-amber-400">Comeu pouco</span>;
                    if (status === 'repeticao') return <span className="text-blue-400">Repetiu</span>;
                    if (status === 'nao_comeu') return <span className="text-rose-400">Não comeu</span>;
                    return <span className="text-slate-500">--</span>;
                  };

                  return (
                    <tr key={i} className="hover:bg-indigo-900/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">
                        {r.data ? new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-center">{formatMeal(r.cafe_da_manha)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-center">{formatMeal(r.colacao)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-center">{formatMeal(r.almoco)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-center">{formatMeal(r.lanche)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-center">{formatMeal(r.janta)}</td>
                      <td className="px-4 py-4 text-center">
                        {r.dormiu ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                            <i className="fa-solid fa-bed"></i> Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-black uppercase">
                            Não
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {todayEvac?.evacuou ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                            Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-black uppercase">
                            Não
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StudentDetailsView;
