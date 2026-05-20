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
  studentRecords?: any[];
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ student, studentClass, mediator, regentTeacher, onBack, currentUser, studentRecords }) => {
  const [notas, setNotas] = useState<Record<string, any>>(student.notas || {});
  const [isEditingNotas, setIsEditingNotas] = useState(false);
  const [selectedBimestre, setSelectedBimestre] = useState('1º_bimestre');
  const [editForm, setEditForm] = useState({ subject: '', grade: '', obs: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewingReport, setIsPreviewingReport] = useState(false);

  // Estados para o Histórico do Mediador
  const [historico, setHistorico] = useState<any[]>([]);
  const [isEditingHistorico, setIsEditingHistorico] = useState(false);
  const [historicoForm, setHistoricoForm] = useState({ date: new Date().toISOString().split('T')[0], observation: '' });
  const [isSavingHistorico, setIsSavingHistorico] = useState(false);
  const [mediatorStudentId, setMediatorStudentId] = useState<string | null>(null);

  // Estados para o PAEE (Plano de Atendimento Educacional Especializado)
  const [paeeRecord, setPaeeRecord] = useState<any>(null);
  const [loadingPaee, setLoadingPaee] = useState(false);
  const [isSavingPaee, setIsSavingPaee] = useState(false);
  const [isEditingPaee, setIsEditingPaee] = useState(false);
  const [activePaeeTab, setActivePaeeTab] = useState<'dados_escolares' | 'resumo_caso' | 'medicacao' | 'planejamento' | 'avaliacao'>('dados_escolares');
  const [schoolAddress, setSchoolAddress] = useState<string>('');

  const [paeeForm, setPaeeForm] = useState({
    anoEscolar: '',
    professorAEE: '',
    professorClasseComum: regentTeacher?.name || '',
    periodoAtendimento: 'Contraturno',
    diagnosticoClinico: student.diagnosis || '',
    frequentaSalaRecursos: false,
    outrosAtendimentosCheck: {
      psicologia: false,
      fonoaudiologia: false,
      terapiaOcupacional: false,
      fisioterapia: false,
      outros: false,
    },
    outrosAtendimentosDetalhamento: '',
    resumoCaso: {
      cognitivo: { status: 'Em Desenvolvimento', obs: '' },
      motor: { status: 'Em Desenvolvimento', obs: '' },
      comunicacao: { status: 'Em Desenvolvimento', obs: '' },
      social: { status: 'Em Desenvolvimento', obs: '' },
      autonomia: { status: 'Em Desenvolvimento', obs: '' },
    },
    medicacao: [] as Array<{ nome: string; dosagem: string; frequencia: string; horario: string }>,
    barreirasDificuldades: '',
    objetivosAEE: '',
    metodologia: '',
    recursosNecessarios: '',
    dataReavaliacao: '',
    avaliacaoPeriodica: '',
    assinaturas: {
      diretor: currentUser?.profile === UserProfile.DIRETOR ? currentUser.name : '',
      professorAEE: '',
      professorRegente: regentTeacher?.name || '',
      responsavel: student.guardians && student.guardians.length > 0 ? student.guardians[0].name : '',
    }
  });

  useEffect(() => {
    const fetchSchoolAddress = async () => {
      if (!student.schoolId) return;
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('address')
          .eq('id', student.schoolId)
          .single();
        if (error) throw error;
        if (data) {
          setSchoolAddress(data.address);
        }
      } catch (err) {
        console.error('Erro ao buscar endereço da escola:', err);
      }
    };
    fetchSchoolAddress();
  }, [student.schoolId]);

  useEffect(() => {
    const fetchPaeeRecord = async () => {
      if (!student.id) return;
      setLoadingPaee(true);
      try {
        let record = null;
        try {
          const { data, error } = await supabase
            .from('student_records')
            .select('*')
            .eq('student_id', student.id)
            .eq('record_type', 'PAEE')
            .maybeSingle();

          if (error) throw error;
          record = data;
        } catch (supabaseErr) {
          console.warn('Erro ao consultar Supabase diretamente para PAEE, tentando ler do estado local:', supabaseErr);
        }

        // Fallback resiliente usando as props studentRecords se a query do Supabase não retornou nada
        if (!record && studentRecords) {
          const localRecord = studentRecords.find(
            r => r.student_id === student.id && r.record_type === 'PAEE'
          );
          if (localRecord) {
            console.log('PAEE recuperado via fallback local (studentRecords):', localRecord);
            record = localRecord;
          }
        }

        if (record) {
          setPaeeRecord(record);
          try {
            const parsed = JSON.parse(record.observation);
            setPaeeForm(prev => ({
              ...prev,
              ...parsed,
              diagnosticoClinico: parsed.diagnosticoClinico || student.diagnosis || '',
              resumoCaso: {
                ...prev.resumoCaso,
                ...(parsed.resumoCaso || {})
              },
              outrosAtendimentosCheck: {
                ...prev.outrosAtendimentosCheck,
                ...(parsed.outrosAtendimentosCheck || {})
              },
              assinaturas: {
                ...prev.assinaturas,
                ...(parsed.assinaturas || {})
              }
            }));
          } catch (e) {
            console.error('Erro ao processar JSON do PAEE:', e);
          }
        } else {
          setPaeeRecord(null);
        }
      } catch (err) {
        console.error('Erro ao carregar PAEE:', err);
      } finally {
        setLoadingPaee(false);
      }
    };
    fetchPaeeRecord();
  }, [student.id, student.diagnosis, studentRecords]);

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

  const handleSavePaee = async () => {
    setIsSavingPaee(true);
    try {
      const dataToSave = {
        ...paeeForm
      };

      const recordPayload = {
        student_id: student.id,
        record_type: 'PAEE',
        observation: JSON.stringify(dataToSave),
        value: paeeRecord ? 'finalizado' : 'criado',
        date: new Date().toISOString().split('T')[0],
        created_by: currentUser?.id
      } as any;

      if (paeeRecord?.id) {
        recordPayload.id = paeeRecord.id;
      }

      const { data, error } = await supabase
        .from('student_records')
        .upsert(recordPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPaeeRecord(data);
        alert('PAEE salvo com sucesso!');
        setIsEditingPaee(false);
      }
    } catch (err: any) {
      console.error('Erro ao salvar PAEE:', err);
      alert(`Erro ao salvar PAEE: ${err.message}`);
    } finally {
      setIsSavingPaee(false);
    }
  };

  const handleAddMedicacaoRow = () => {
    setPaeeForm(prev => ({
      ...prev,
      medicacao: [...prev.medicacao, { nome: '', dosagem: '', frequencia: '', horario: '' }]
    }));
  };

  const handleRemoveMedicacaoRow = (index: number) => {
    setPaeeForm(prev => ({
      ...prev,
      medicacao: prev.medicacao.filter((_, idx) => idx !== index)
    }));
  };

  const handleMedicacaoChange = (index: number, field: string, value: string) => {
    setPaeeForm(prev => {
      const newMed = [...prev.medicacao];
      newMed[index] = { ...newMed[index], [field]: value };
      return { ...prev, medicacao: newMed };
    });
  };

  const handleAspectChange = (aspect: 'cognitivo' | 'motor' | 'comunicacao' | 'social' | 'autonomia', field: 'status' | 'obs', value: string) => {
    setPaeeForm(prev => ({
      ...prev,
      resumoCaso: {
        ...prev.resumoCaso,
        [aspect]: {
          ...prev.resumoCaso[aspect],
          [field]: value
        }
      }
    }));
  };

  const handleExportPAEEPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Cabeçalho Oficial do PAEE (Cor Emerald: [5, 150, 105])
      doc.setFillColor(5, 150, 105); 
      doc.rect(0, 0, pageWidth, 42, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANO INDIVIDUAL DE ATENDIMENTO EDUCACIONAL ESPECIALIZADO', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('PAEE', pageWidth / 2, 26, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado via Sistema IncluiEduTec em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 34, { align: 'center' });

      let yPos = 52;

      // Seção 1: Identificação do Aluno
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. IDENTIFICAÇÃO E DADOS ESCOLARES', 14, yPos);
      yPos += 6;

      const responsavelNome = student.guardians?.[0]?.name || 'Não informado';
      const responsavelTelefone = student.guardians?.[0]?.phone || 'Não informado';

      const identificacaoData = [
        ['Nome do Aluno', student.name],
        ['Data de Nascimento', formatDate(student.birthDate || student.birth_date)],
        ['Idade', calculateAge(student.birthDate || student.birth_date)],
        ['Registro Acadêmico (RA)', student.ra || 'Não informado'],
        ['Responsável Legal', responsavelNome],
        ['Telefone do Responsável', responsavelTelefone],
        ['Endereço da Unidade Escolar', schoolAddress || 'Não informado'],
        ['Ano Escolar', paeeForm.anoEscolar || 'Não informado'],
        ['Professor(a) do AEE', paeeForm.professorAEE || 'Não informado'],
        ['Professor(a) de Classe Comum', paeeForm.professorClasseComum || 'Não informado'],
        ['Período de Atendimento', paeeForm.periodoAtendimento || 'Não informado'],
      ];

      autoTable(doc, {
        startY: yPos,
        body: identificacaoData,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 253, 244], cellWidth: 55 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Seção 2: Diagnóstico Clínico e Outros Atendimentos
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. DIAGNÓSTICO CLÍNICO E OUTROS ATENDIMENTOS', 14, yPos);
      yPos += 6;

      const atendimentosSelecionados: string[] = [];
      if (paeeForm.outrosAtendimentosCheck.psicologia) atendimentosSelecionados.push('Psicologia');
      if (paeeForm.outrosAtendimentosCheck.fonoaudiologia) atendimentosSelecionados.push('Fonoaudiologia');
      if (paeeForm.outrosAtendimentosCheck.terapiaOcupacional) atendimentosSelecionados.push('Terapia Ocupacional');
      if (paeeForm.outrosAtendimentosCheck.fisioterapia) atendimentosSelecionados.push('Fisioterapia');
      if (paeeForm.outrosAtendimentosCheck.outros) atendimentosSelecionados.push('Outros');

      const diagData = [
        ['Diagnóstico Clínico / CID', paeeForm.diagnosticoClinico || 'Sem CID cadastrado'],
        ['Frequenta Sala de Recursos', paeeForm.frequentaSalaRecursos ? 'Sim' : 'Não'],
        ['Atendimentos Especializados', atendimentosSelecionados.length > 0 ? atendimentosSelecionados.join(', ') : 'Nenhum'],
        ['Detalhamento de Atendimentos', paeeForm.outrosAtendimentosDetalhamento || 'Nenhuma observação cadastrada'],
      ];

      autoTable(doc, {
        startY: yPos,
        body: diagData,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 253, 244], cellWidth: 55 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Seção 3: Resumo do Caso (Aspectos de Desenvolvimento)
      if (yPos > pageHeight - 50) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. ASPECTOS DO DESENVOLVIMENTO (RESUMO DO CASO)', 14, yPos);
      yPos += 6;

      const aspectosBody = [
        ['Aspecto Cognitivo', paeeForm.resumoCaso.cognitivo.status, paeeForm.resumoCaso.cognitivo.obs || '-'],
        ['Aspecto Motor', paeeForm.resumoCaso.motor.status, paeeForm.resumoCaso.motor.obs || '-'],
        ['Aspecto de Comunicação', paeeForm.resumoCaso.comunicacao.status, paeeForm.resumoCaso.comunicacao.obs || '-'],
        ['Aspecto Social / Interação', paeeForm.resumoCaso.social.status, paeeForm.resumoCaso.social.obs || '-'],
        ['Autonomia / Vida Diária', paeeForm.resumoCaso.autonomia.status, paeeForm.resumoCaso.autonomia.obs || '-'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Área de Desenvolvimento', 'Avaliação', 'Observações / Evidências']],
        body: aspectosBody,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 35 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Seção 4: Medicamentos de Uso Contínuo
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. MEDICAMENTOS DE USO CONTÍNUO', 14, yPos);
      yPos += 6;

      const medBody = paeeForm.medicacao.map(med => [
        med.nome || '-',
        med.dosagem || '-',
        med.frequencia || '-',
        med.horario || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Nome do Medicamento', 'Dosagem', 'Frequência', 'Horário']],
        body: medBody.length > 0 ? medBody : [['Não faz uso de medicação contínua', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8.5, cellPadding: 2.5 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Seção 5: Barreiras e Planejamento do AEE
      if (yPos > pageHeight - 60) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('5. PLANEJAMENTO E ESTRATÉGIAS DO AEE', 14, yPos);
      yPos += 6;

      const planejamentoData = [
        ['Dificuldades / Barreiras Identificadas', paeeForm.barreirasDificuldades || 'Não informado'],
        ['Objetivos Pedagógicos do AEE', paeeForm.objetivosAEE || 'Não informado'],
        ['Metodologia Adaptada', paeeForm.metodologia || 'Não informado'],
        ['Recursos Pedagógicos e Tecnológicos', paeeForm.recursosNecessarios || 'Não informado'],
        ['Previsão para Reavaliação', paeeForm.dataReavaliacao ? formatDate(paeeForm.dataReavaliacao) : 'Não informada'],
      ];

      autoTable(doc, {
        startY: yPos,
        body: planejamentoData,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 253, 244], cellWidth: 55 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Seção 6: Avaliação Periódica
      if (yPos > pageHeight - 50) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('6. AVALIAÇÃO DO ATENDIMENTO', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        body: [['Parecer da Avaliação Periódica', paeeForm.avaliacaoPeriodica || 'Nenhuma avaliação registrada até o momento']],
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 253, 244], cellWidth: 55 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;

      // Assinaturas
      if (yPos > pageHeight - 45) { doc.addPage(); yPos = 30; }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DECLARAÇÃO DE CIÊNCIA E ACORDO', 14, yPos);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Os abaixo-assinados declaram estar cientes e de acordo com as ações propostas neste plano de atendimento.', 14, yPos + 4);

      yPos += 20;

      // Linhas de Assinaturas (Alinhadas em duas colunas)
      const colWidth = (pageWidth - 40) / 2;

      // Linha 1 - Diretor
      doc.line(20, yPos, 20 + colWidth, yPos);
      doc.text('Assinatura do(a) Diretor(a)', 20, yPos + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(paeeForm.assinaturas.diretor || 'Nome do(a) Diretor(a)', 20, yPos + 8);
      doc.setFont('helvetica', 'normal');

      // Linha 1 - Professor do AEE
      doc.line(pageWidth - 20 - colWidth, yPos, pageWidth - 20, yPos);
      doc.text('Assinatura do(a) Professor(a) do AEE', pageWidth - 20 - colWidth, yPos + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(paeeForm.assinaturas.professorAEE || 'Nome do(a) Professor(a) do AEE', pageWidth - 20 - colWidth, yPos + 8);
      doc.setFont('helvetica', 'normal');

      yPos += 20;

      // Linha 2 - Professor Regente
      doc.line(20, yPos, 20 + colWidth, yPos);
      doc.text('Assinatura do(a) Professor(a) de Classe Comum', 20, yPos + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(paeeForm.assinaturas.professorRegente || 'Nome do(a) Professor(a) Regente', 20, yPos + 8);
      doc.setFont('helvetica', 'normal');

      // Linha 2 - Responsável
      doc.line(pageWidth - 20 - colWidth, yPos, pageWidth - 20, yPos);
      doc.text('Assinatura do Responsável Legal', pageWidth - 20 - colWidth, yPos + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(paeeForm.assinaturas.responsavel || 'Nome do Responsável', pageWidth - 20 - colWidth, yPos + 8);
      doc.setFont('helvetica', 'normal');

      doc.save(`PAEE_${student.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) {
      console.error('Erro ao gerar PDF do PAEE:', err);
      alert('Falha ao gerar o arquivo PDF. Verifique os dados inseridos.');
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
                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => setIsPreviewingReport(true)}
                      className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-eye"></i>
                      Visualizar Laudo Médico
                    </button>
                    
                    <a
                      href={student.medicalReportUrl}
                      download={`laudo-${student.name.split(' ')[0]}`}
                      className="w-full py-3.5 bg-white border border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-download"></i>
                      Baixar Documento
                    </a>
                  </div>
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

      {/* SEÇÃO PAEE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            PAEE — Plano de Atendimento Educacional Especializado
          </h3>
          <div className="flex items-center gap-3">
            {currentUser?.profile === UserProfile.DIRETOR ? (
              <button
                onClick={() => setIsEditingPaee(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-edit"></i>
                {paeeRecord ? 'Editar PAEE' : 'Elaborar PAEE'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPaee(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-eye"></i>
                Visualizar PAEE
              </button>
            )}
            {paeeRecord && (
              <button
                onClick={handleExportPAEEPDF}
                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-file-pdf"></i>
                Exportar PAEE (PDF)
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-gray-100 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status do Documento</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">
              {paeeRecord ? (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Documento ativo e salvo no banco de dados.
                </span>
              ) : (
                <span className="text-amber-500 font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  PAEE não iniciado para este aluno.
                </span>
              )}
            </p>
          </div>
          {paeeRecord && (
            <div className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Última atualização: {new Date(paeeRecord.date).toLocaleDateString('pt-BR')}
            </div>
          )}
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



      {/* Modal de Visualização de Laudo */}
      {isPreviewingReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setIsPreviewingReport(false)}
          ></div>
          
          <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                  <i className="fa-solid fa-file-medical"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Visualização do Laudo Médico</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={student.medicalReportUrl}
                  download={`laudo-${student.name.split(' ')[0]}`}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm"
                  title="Baixar Documento"
                >
                  <i className="fa-solid fa-download"></i>
                </a>
                <button
                  onClick={() => setIsPreviewingReport(false)}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-rose-500 flex items-center justify-center transition-all shadow-sm"
                  title="Fechar"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-gray-100 dark:bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
              {student.medicalReportUrl ? (
                <iframe
                  src={`${student.medicalReportUrl}#toolbar=0`}
                  className="w-full h-full rounded-xl border-none shadow-inner bg-white"
                  title="Visualizador de Laudo"
                ></iframe>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-xl text-gray-200">
                    <i className="fa-solid fa-file-circle-exclamation text-4xl"></i>
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">Documento não localizado</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                Ambiente Seguro para Visualização de Dados Sensíveis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Elaboração / Edição / Visualização do PAEE */}
      {isEditingPaee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          {/* Glassmorphism Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setIsEditingPaee(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-6xl h-full max-h-[92vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-inner">
                  <i className="fa-solid fa-file-invoice"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {currentUser?.profile === UserProfile.DIRETOR ? (paeeRecord ? 'Editar Formulário PAEE' : 'Elaborar Novo PAEE') : 'Visualizar PAEE Completo'}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-100 uppercase tracking-widest mt-0.5">
                    {student.name} — RA: {student.ra || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {currentUser?.profile === UserProfile.DIRETOR && (
                  <button
                    onClick={handleSavePaee}
                    disabled={isSavingPaee}
                    className="px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-floppy-disk text-sm"></i>
                    {isSavingPaee ? 'Salvando...' : 'Salvar PAEE'}
                  </button>
                )}
                <button
                  onClick={() => setIsEditingPaee(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shadow-sm"
                  title="Fechar"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>

            {/* Abas Internas de Navegação */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setActivePaeeTab('dados_escolares')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activePaeeTab === 'dados_escolares' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-emerald-600 border border-gray-100 dark:border-slate-700'}`}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                1. Identificação
              </button>
              <button
                onClick={() => setActivePaeeTab('resumo_caso')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activePaeeTab === 'resumo_caso' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-emerald-600 border border-gray-100 dark:border-slate-700'}`}
              >
                <i className="fa-solid fa-brain"></i>
                2. Aspectos
              </button>
              <button
                onClick={() => setActivePaeeTab('medicacao')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activePaeeTab === 'medicacao' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-emerald-600 border border-gray-100 dark:border-slate-700'}`}
              >
                <i className="fa-solid fa-pills"></i>
                3. Medicação
              </button>
              <button
                onClick={() => setActivePaeeTab('planejamento')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activePaeeTab === 'planejamento' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-emerald-600 border border-gray-100 dark:border-slate-700'}`}
              >
                <i className="fa-solid fa-calendar-check"></i>
                4. Planejamento AEE
              </button>
              <button
                onClick={() => setActivePaeeTab('avaliacao')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activePaeeTab === 'avaliacao' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-emerald-600 border border-gray-100 dark:border-slate-700'}`}
              >
                <i className="fa-solid fa-signature"></i>
                5. Avaliação e Assinaturas
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50 dark:bg-slate-950/20">
              
              {/* ABA 1: IDENTIFICAÇÃO E DADOS ESCOLARES */}
              {activePaeeTab === 'dados_escolares' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Cards Informativos de Preenchimento Automático */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Identificação do Aluno (Preenchimento Automático)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nome do Aluno</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{student.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Data de Nascimento</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{formatDate(student.birthDate || student.birth_date)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Idade Atual</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{calculateAge(student.birthDate || student.birth_date)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registro Acadêmico (RA)</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{student.ra || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Responsável Legal</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{student.guardians?.[0]?.name || 'Nenhum responsável cadastrado'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Telefone do Responsável</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{student.guardians?.[0]?.phone || 'N/A'}</p>
                      </div>
                      <div className="space-y-1 col-span-full">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Endereço da Unidade Escolar</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{schoolAddress || 'Carregando endereço da escola...'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Campos Editáveis da Seção Escola */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Informações Escolares Adicionais
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano Escolar / Série</label>
                        <input
                          type="text"
                          placeholder="Ex: 5º Ano do Ensino Fundamental"
                          value={paeeForm.anoEscolar}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, anoEscolar: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professor(a) de Classe Comum (Regente)</label>
                        <input
                          type="text"
                          placeholder="Nome do professor regente"
                          value={paeeForm.professorClasseComum}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, professorClasseComum: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professor(a) do AEE</label>
                        <input
                          type="text"
                          placeholder="Nome do professor do AEE"
                          value={paeeForm.professorAEE}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, professorAEE: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Período de Atendimento no AEE</label>
                        <select
                          value={paeeForm.periodoAtendimento}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, periodoAtendimento: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        >
                          <option value="Contraturno">Contraturno Escolar (Recomendado)</option>
                          <option value="Matutino">Período Matutino</option>
                          <option value="Vespertino">Período Vespertino</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2: Diagnóstico e Atendimentos Clínicos */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Diagnóstico Clínico / CID e Histórico de Apoios
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnóstico Detalhado / Código CID</label>
                        <input
                          type="text"
                          placeholder="Digite ou edite o CID e detalhes clínicos..."
                          value={paeeForm.diagnosticoClinico}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, diagnosticoClinico: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        />
                        <p className="text-[9px] text-gray-400 italic">Preenchido inicialmente com o CID de cadastro do aluno.</p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-3">
                            <i className="fa-solid fa-home-user text-emerald-500 text-lg"></i>
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sala de Recursos Multifuncionais</p>
                              <p className="text-xs text-gray-400">O aluno frequenta a Sala de Recursos no contraturno?</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paeeForm.frequentaSalaRecursos}
                              disabled={currentUser?.profile !== UserProfile.DIRETOR}
                              onChange={e => setPaeeForm({ ...paeeForm, frequentaSalaRecursos: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Outros Atendimentos Especializados */}
                      <div className="pt-4 space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outros Atendimentos Clínicos / Especializados</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {Object.keys(paeeForm.outrosAtendimentosCheck).map(key => {
                            const labelMap: Record<string, string> = {
                              psicologia: 'Psicologia',
                              fonoaudiologia: 'Fonoaudiologia',
                              terapiaOcupacional: 'Terapia Ocup.',
                              fisioterapia: 'Fisioterapia',
                              outros: 'Outros'
                            };
                            const k = key as keyof typeof paeeForm.outrosAtendimentosCheck;
                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                  paeeForm.outrosAtendimentosCheck[k]
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 font-bold'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={paeeForm.outrosAtendimentosCheck[k]}
                                  disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                  onChange={e => setPaeeForm({
                                    ...paeeForm,
                                    outrosAtendimentosCheck: {
                                      ...paeeForm.outrosAtendimentosCheck,
                                      [k]: e.target.checked
                                    }
                                  })}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 w-4 h-4"
                                />
                                <span className="text-xs">{labelMap[key]}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalhamento dos Atendimentos Externos</label>
                        <textarea
                          placeholder="Informe horários, clínicas e a frequência destes atendimentos se conhecidos..."
                          value={paeeForm.outrosAtendimentosDetalhamento}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, outrosAtendimentosDetalhamento: e.target.value })}
                          rows={3}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: RESUMO DO CASO (ASPECTOS DE DESENVOLVIMENTO) */}
              {activePaeeTab === 'resumo_caso' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Aspectos do Desenvolvimento do Aluno</h4>
                      <p className="text-xs text-gray-400 mt-1">Preencha detalhadamente a avaliação para cada área do desenvolvimento comportamental e cognitivo do aluno.</p>
                    </div>

                    <div className="space-y-6">
                      {(['cognitivo', 'motor', 'comunicacao', 'social', 'autonomia'] as Array<'cognitivo' | 'motor' | 'comunicacao' | 'social' | 'autonomia'>).map(aspect => {
                        const labelMap: Record<string, string> = {
                          cognitivo: 'Desenvolvimento Cognitivo / Aprendizagem',
                          motor: 'Desenvolvimento Motor e Psicomotricidade',
                          comunicacao: 'Comunicação e Linguagem',
                          social: 'Interação Social e Emocional',
                          autonomia: 'Autonomia, Independência e Atividades Diárias'
                        };
                        return (
                          <div key={aspect} className="p-5 bg-gray-50/50 dark:bg-slate-800/20 rounded-3xl border border-gray-100 dark:border-slate-800/60 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800/80 pb-3">
                              <span className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest">{labelMap[aspect]}</span>
                              <select
                                value={paeeForm.resumoCaso[aspect].status}
                                disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                onChange={e => handleAspectChange(aspect, 'status', e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="Adequado">Adequado para a faixa etária</option>
                                <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                                <option value="Apresenta Dificuldades">Apresenta Dificuldades Significativas</option>
                              </select>
                            </div>
                            <textarea
                              placeholder={`Descreva as evidências observadas e especificidades no aspecto ${aspect}...`}
                              value={paeeForm.resumoCaso[aspect].obs}
                              disabled={currentUser?.profile !== UserProfile.DIRETOR}
                              onChange={e => handleAspectChange(aspect, 'obs', e.target.value)}
                              rows={2.5}
                              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
                            ></textarea>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: MEDICAÇÃO DIÁRIA (REGISTRO DINÂMICO) */}
              {activePaeeTab === 'medicacao' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Medicamentos de Uso Contínuo</h4>
                        <p className="text-xs text-gray-400 mt-1">Registre todas as medicações administradas ou acompanhadas em período escolar/residencial.</p>
                      </div>
                      {currentUser?.profile === UserProfile.DIRETOR && (
                        <button
                          onClick={handleAddMedicacaoRow}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                          Adicionar Linha
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {paeeForm.medicacao.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                          <i className="fa-solid fa-pills text-gray-300 text-3xl mb-3 block"></i>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhuma medicação registrada no formulário</p>
                          <p className="text-[10px] text-gray-400 mt-1">O aluno não faz uso de medicações ou não foram listadas.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-slate-800/50">
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Nome do Medicamento</th>
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Dosagem</th>
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Frequência</th>
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Horário</th>
                                {currentUser?.profile === UserProfile.DIRETOR && <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 text-center">Ações</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {paeeForm.medicacao.map((med, index) => (
                                <tr key={index} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Ex: Ritalina"
                                      value={med.nome}
                                      disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                      onChange={e => handleMedicacaoChange(index, 'nome', e.target.value)}
                                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Ex: 10mg"
                                      value={med.dosagem}
                                      disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                      onChange={e => handleMedicacaoChange(index, 'dosagem', e.target.value)}
                                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Ex: Diário"
                                      value={med.frequencia}
                                      disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                      onChange={e => handleMedicacaoChange(index, 'frequencia', e.target.value)}
                                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Ex: 08:00h"
                                      value={med.horario}
                                      disabled={currentUser?.profile !== UserProfile.DIRETOR}
                                      onChange={e => handleMedicacaoChange(index, 'horario', e.target.value)}
                                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                                    />
                                  </td>
                                  {currentUser?.profile === UserProfile.DIRETOR && (
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleRemoveMedicacaoRow(index)}
                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center mx-auto transition-colors"
                                      >
                                        <i className="fa-solid fa-trash text-xs"></i>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: PLANEJAMENTO DO AEE (RECURSOS E ESTRATÉGIAS) */}
              {activePaeeTab === 'planejamento' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Planejamento do Atendimento, Recursos e Metodologia
                    </h4>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dificuldades / Barreiras Enfrentadas pelo Aluno</label>
                        <textarea
                          placeholder="Liste os principais desafios, barreiras físicas, atitudinais ou de aprendizagem que o aluno apresenta..."
                          value={paeeForm.barreirasDificuldades}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, barreirasDificuldades: e.target.value })}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivos Pedagógicos do AEE</label>
                        <textarea
                          placeholder="Defina as metas e competências a serem estimuladas ou reforçadas no plano de atendimento..."
                          value={paeeForm.objetivosAEE}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, objetivosAEE: e.target.value })}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metodologias de Ensino Adaptadas</label>
                        <textarea
                          placeholder="Descreva as técnicas, organizações diferenciadas de aula e adaptações necessárias..."
                          value={paeeForm.metodologia}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, metodologia: e.target.value })}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos Pedagógicos e Tecnológicos Necessários</label>
                        <textarea
                          placeholder="Especifique pranchas de comunicação, tecnologias assistivas, jogos adaptados ou materiais manipuláveis..."
                          value={paeeForm.recursosNecessarios}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, recursosNecessarios: e.target.value })}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Prevista para Reavaliação</label>
                        <input
                          type="date"
                          value={paeeForm.dataReavaliacao}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({ ...paeeForm, dataReavaliacao: e.target.value })}
                          className="w-full md:w-64 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 5: AVALIAÇÃO E ASSINATURAS */}
              {activePaeeTab === 'avaliacao' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Avaliação Periódica do Plano
                    </h4>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parecer da Avaliação / Resultados Obtidos</label>
                      <textarea
                        placeholder="Descreva a evolução do estudante, aspectos superados e reajustes nas metas do AEE..."
                        value={paeeForm.avaliacaoPeriodica}
                        disabled={currentUser?.profile !== UserProfile.DIRETOR}
                        onChange={e => setPaeeForm({ ...paeeForm, avaliacaoPeriodica: e.target.value })}
                        rows={5}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-slate-800 font-bold resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Assinaturas da Ficha */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Assinaturas / Signatários de Ciência do Plano
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diretor(a) Responsável</label>
                        <input
                          type="text"
                          placeholder="Nome do Diretor(a)"
                          value={paeeForm.assinaturas.diretor}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({
                            ...paeeForm,
                            assinaturas: { ...paeeForm.assinaturas, diretor: e.target.value }
                          })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold disabled:opacity-75"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professor(a) do AEE</label>
                        <input
                          type="text"
                          placeholder="Nome do Professor(a) do AEE"
                          value={paeeForm.assinaturas.professorAEE}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({
                            ...paeeForm,
                            assinaturas: { ...paeeForm.assinaturas, professorAEE: e.target.value }
                          })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold disabled:opacity-75"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professor(a) Regente de Classe</label>
                        <input
                          type="text"
                          placeholder="Nome do Professor(a) Regente"
                          value={paeeForm.assinaturas.professorRegente}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({
                            ...paeeForm,
                            assinaturas: { ...paeeForm.assinaturas, professorRegente: e.target.value }
                          })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold disabled:opacity-75"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável Legal do Estudante</label>
                        <input
                          type="text"
                          placeholder="Nome do Responsável Legal"
                          value={paeeForm.assinaturas.responsavel}
                          disabled={currentUser?.profile !== UserProfile.DIRETOR}
                          onChange={e => setPaeeForm({
                            ...paeeForm,
                            assinaturas: { ...paeeForm.assinaturas, responsavel: e.target.value }
                          })}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold disabled:opacity-75"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                Validação de Ciência do PAEE no Servidor Oficial
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingPaee(false)}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  Fechar
                </button>
                {currentUser?.profile === UserProfile.DIRETOR && (
                  <button
                    onClick={handleSavePaee}
                    disabled={isSavingPaee}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-200 dark:shadow-none"
                  >
                    {isSavingPaee ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailsView;
