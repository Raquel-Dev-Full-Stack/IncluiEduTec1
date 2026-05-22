
import React, { useState, useMemo } from 'react';
import { Student, Class, User } from '../types';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabaseClient';

const mergeDeep = (target: any, source: any): any => {
  if (!source) return target;
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
};

const getDefaultPeiData = (studentId: string, student: any) => ({
  student_id: studentId,
  // 1. Identificação
  nomeCompleto: student?.name || '',
  dataNascimento: student?.birthDate || student?.birth_date || '',
  sexo: '',
  filiacao: '',
  responsavel: student?.guardians?.[0]?.name || '',
  endereco: '',
  telefone: student?.guardians?.[0]?.phone || '',
  contatoEmergencia: '',

  // 2. Escolaridade
  escolaOrigem: '',
  turno: '',
  turma: '',
  anoEscolaridade: student?.grade || '',
  publicoAlvo: {
    intelectual: false,
    visual: false,
    multipla: false,
    fisica: false,
    auditiva: false,
    surdocegueira: false,
    altasHabilidades: false,
    tea: student?.deficiency?.toLowerCase().includes('tea') || student?.deficiency?.toLowerCase().includes('espectro') || student?.deficiency?.toLowerCase().includes('autista') || false,
  },
  observacoesEscola: '',
  modalidadeAtendimento: 'regular',
  servicosApoio: {
    aee: false,
    itinerancia: false,
    interprete: false,
    instrutor: false,
    aaee: false,
    outros: false,
  },
  profissionaisUnidade: {
    regular: '',
    coordenacao: '',
    direcao: '',
    aee: '',
  },
  dataHorarioAtendimento: '',

  // 3. Entrevista
  entrevista: {
    desenvolvimento: '',
    comunicacao: '',
    locomocao: '',
    autonomia: '',
    interesses: '',
    relacaoFamiliar: '',
    idadeEscolar: '',
    regrasLimites: '',
    hospitalizacoes: '',
    alergias: '',
    alimentacao: '',
    convulsoes: '',
    medicacao: '',
    atendimentosClinicosText: '',
    bpc: false,
  },
  atendimentosClinicos: [
    { especialidade: '', local: '', profissional: '', dia: '', horario: '', contato: '' }
  ],
  observacoesGeraisEntrevista: '',

  // 4. Levantamento Pedagógico
  levantamento: {
    habilidades: '',
    necessidades: '',
    assinaturas: '',
  },

  // 5. Tabelas de Desenvolvimento
  tabelasDesenvolvimento: {
    cognitivas: { status: 'Não Avaliado', obs: '' },
    metacognitivas: { status: 'Não Avaliado', obs: '' },
    socioemocionais: { status: 'Não Avaliado', obs: '' },
    comunicacionais: { status: 'Não Avaliado', obs: '' },
    motoras: { status: 'Não Avaliado', obs: '' },
    cotidiano: { status: 'Não Avaliado', obs: '' },
  },

  // 6. Planejamento Pedagógico
  planejamento: {
    segmento: 'Fundamental', // Fundamental, EJA, Infantil
    areaEspecifica: '',
    objetivos: '',
    conteudos: '',
    estrategias: '',
    recursos: '',
    rubricas: '',
    assinaturaProfessor: '',
    assinaturaCoordenador: '',
  },

  // 7. Relatório de Avaliação
  relatorioAvaliacao: {
    unidadeEscolar: '',
    periodoLetivo: '',
    desenvolvimentoPedagogico: '',
    observacoesResponsavel: '',
  },

  // Anexos
  anexo1: {
    solicitado: false,
    justificativa: '',
    detalhes: '',
  },
  anexo2: {
    informacoesSaude: '',
    assinaturas: '',
  }
});

interface TeacherInclusivePlansProps {
  students: Student[];
  classes: Class[];
  user: User;
  logActivity?: (log: any) => void;
  onBack?: () => void;
}

type PlanType = 'PEI' | 'PDI' | 'PAEE';

const TeacherInclusivePlans: React.FC<TeacherInclusivePlansProps> = ({ students, classes, user, logActivity, onBack }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activePlan, setActivePlan] = useState<PlanType>('PEI');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activePeiTab, setActivePeiTab] = useState<string>('identificacao');

  const [creationData, setCreationData] = useState({
    studentId: '',
    type: 'PEI' as PlanType,
    content: ''
  });

  // Estados para dados carregados do banco
  const [peiData, setPeiData] = useState<any>(null);
  const [pdiData, setPdiData] = useState<any>(null);
  const [paeeData, setPaeeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Efeito para carregar dados do aluno
  React.useEffect(() => {
    const fetchPlans = async () => {
      if (!selectedStudentId) {
        setPeiData(null);
        setPdiData(null);
        setPaeeData(null);
        return;
      }

      setLoading(true);
      try {
        const { data: allRecords, error } = await supabase
          .from('student_records')
          .select('*')
          .eq('student_id', selectedStudentId)
          .in('record_type', ['PEI', 'PDI', 'PAEE']);

        if (error) throw error;

        const peiRec = allRecords?.find(r => r.record_type === 'PEI');
        const pdiRec = allRecords?.find(r => r.record_type === 'PDI');
        const paeeRec = allRecords?.find(r => r.record_type === 'PAEE');

        const parseData = (record: any, defaultData: any) => {
          if (!record) return defaultData;
          try {
            const parsed = JSON.parse(record.observation);
            return mergeDeep(defaultData, { ...parsed, id: record.id });
          } catch {
            return { ...defaultData, content: record.observation, id: record.id };
          }
        };

        const currentStudent = students.find(s => s.id === selectedStudentId);
        setPeiData(parseData(peiRec, getDefaultPeiData(selectedStudentId, currentStudent)));
        setPdiData(parseData(pdiRec, { student_id: selectedStudentId, content: '', desenvolvimento: '', social: '', autonomia: '' }));
        setPaeeData(parseData(paeeRec, { student_id: selectedStudentId, content: '', recursos: '', barreiras: '', estrategias: '' }));
      } catch (error) {
        console.error("Erro ao carregar planos de student_records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedStudentId]);

  const selectedStudent = useMemo(() =>
    students.find(s => s.id === selectedStudentId),
    [students, selectedStudentId]);

  const handleAddAtendimentoRow = () => {
    if (!peiData) return;
    const atendimentos = [...(peiData.atendimentosClinicos || [])];
    atendimentos.push({ especialidade: '', local: '', profissional: '', dia: '', horario: '', contato: '' });
    setPeiData({ ...peiData, atendimentosClinicos: atendimentos });
  };

  const handleRemoveAtendimentoRow = (index: number) => {
    if (!peiData) return;
    const atendimentos = [...(peiData.atendimentosClinicos || [])];
    atendimentos.splice(index, 1);
    setPeiData({ ...peiData, atendimentosClinicos: atendimentos });
  };

  const handleAtendimentoChange = (index: number, field: string, value: string) => {
    if (!peiData) return;
    const atendimentos = [...(peiData.atendimentosClinicos || [])];
    atendimentos[index] = { ...atendimentos[index], [field]: value };
    setPeiData({ ...peiData, atendimentosClinicos: atendimentos });
  };

  const handlePublicoAlvoChange = (key: string, value: boolean) => {
    if (!peiData) return;
    setPeiData({
      ...peiData,
      publicoAlvo: {
        ...(peiData.publicoAlvo || {}),
        [key]: value
      }
    });
  };

  const handleServicoApoioChange = (key: string, value: boolean) => {
    if (!peiData) return;
    setPeiData({
      ...peiData,
      servicosApoio: {
        ...(peiData.servicosApoio || {}),
        [key]: value
      }
    });
  };

  const handleTabelaDesenvolvimentoChange = (aspect: string, field: 'status' | 'obs', value: string) => {
    if (!peiData) return;
    setPeiData({
      ...peiData,
      tabelasDesenvolvimento: {
        ...(peiData.tabelasDesenvolvimento || {}),
        [aspect]: {
          ...((peiData.tabelasDesenvolvimento?.[aspect]) || { status: 'Não Avaliado', obs: '' }),
          [field]: value
        }
      }
    });
  };

  const handlePeiNestedChange = (parent: string, child: string, value: any) => {
    if (!peiData) return;
    setPeiData({
      ...peiData,
      [parent]: {
        ...(peiData[parent] || {}),
        [child]: value
      }
    });
  };

  const handleExportPEIPDF = async () => {
    if (!selectedStudentId || !selectedStudent || !peiData) return;

    setFeedback('Gerando PEI Oficial...');

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 15;

      const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - 15) {
          doc.addPage();
          drawHeader();
          yPos = 38;
        }
      };

      const drawHeader = () => {
        // Faixa azul royal superior
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 10, pageWidth - 30, 4, 'F');

        // Faixa dourada fina
        doc.setFillColor(217, 119, 6);
        doc.rect(15, 14, pageWidth - 30, 1.5, 'F');

        // Texto institucional
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("SISTEMA DE ENSINO INTEGRADO", pageWidth / 2, 22, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("SECRETARIA MUNICIPAL DE EDUCAÇÃO", pageWidth / 2, 26, { align: "center" });
        doc.text("SUBSECRETARIA DE ENSINO - COORDENADORIA DE EDUCAÇÃO ESPECIAL", pageWidth / 2, 30, { align: "center" });

        // Linha divisória
        doc.setDrawColor(229, 231, 235);
        doc.line(15, 33, pageWidth - 15, 33);
      };

      const drawSectionHeader = (title: string, r: number, g: number, b: number) => {
        checkPageBreak(12);
        doc.setFillColor(r, g, b);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(title.toUpperCase(), 20, yPos + 5.5);
        yPos += 13;
      };

      const drawDataRow = (label: string, val: string, height = 7) => {
        checkPageBreak(height);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(70);
        doc.text(label + ":", 18, yPos + 3);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);
        
        const lines = doc.splitTextToSize(val || 'Não informado', pageWidth - 70);
        doc.text(lines, 65, yPos + 3);
        yPos += (lines.length * 4) + 2;
      };

      // Capa inicial / Header da página 1
      drawHeader();
      yPos = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)", pageWidth / 2, yPos, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("MODELO OFICIAL DE ATENDIMENTO E DIRETRIZES DA REDE MUNICIPAL", pageWidth / 2, yPos + 4, { align: "center" });
      yPos += 12;

      // 1. Identificação
      drawSectionHeader("1. Identificação do(a) Aluno(a)", 109, 40, 217); // Roxo
      drawDataRow("Nome Completo", peiData.nomeCompleto);
      drawDataRow("Data de Nascimento", peiData.dataNascimento ? new Date(peiData.dataNascimento).toLocaleDateString('pt-BR') : '');
      drawDataRow("Sexo", peiData.sexo);
      drawDataRow("Filiação", peiData.filiacao);
      drawDataRow("Responsável Legal", peiData.responsavel);
      drawDataRow("Endereço Residencial", peiData.endereco);
      drawDataRow("Telefone Contato", peiData.telefone);
      drawDataRow("Emergência / Contato", peiData.contatoEmergencia);
      yPos += 4;

      // 2. Escolaridade
      drawSectionHeader("2. Histórico Escolar e Atendimento", 217, 119, 6); // Laranja
      drawDataRow("Escola de Origem", peiData.escolaOrigem);
      drawDataRow("Turno Escolar", peiData.turno);
      drawDataRow("Turma Oficial", peiData.turma);
      drawDataRow("Ano / Série", peiData.anoEscolaridade);
      
      const publicoText = Object.entries(peiData.publicoAlvo || {})
        .filter(([_, checked]) => checked)
        .map(([key]) => key.toUpperCase())
        .join(', ') || 'Nenhum selecionado';
      drawDataRow("Público-Alvo Ed. Especial", publicoText);
      drawDataRow("Modalidade Atendimento", peiData.modalidadeAtendimento);
      
      const apoiosText = Object.entries(peiData.servicosApoio || {})
        .filter(([_, checked]) => checked)
        .map(([key]) => key.toUpperCase())
        .join(', ') || 'Nenhum selecionado';
      drawDataRow("Serviços de Apoio", apoiosText);
      drawDataRow("Data/Horário SRM", peiData.dataHorarioAtendimento);
      
      // Profissionais
      yPos += 2;
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30);
      doc.text("Equipe Escolar de Referência:", 18, yPos);
      yPos += 5;
      drawDataRow("Regular / Regente", peiData.profissionaisUnidade?.regular);
      drawDataRow("Professor(a) AEE", peiData.profissionaisUnidade?.aee);
      drawDataRow("Coordenação Pedagógica", peiData.profissionaisUnidade?.coordenacao);
      drawDataRow("Direção Escolar", peiData.profissionaisUnidade?.direcao);
      yPos += 4;

      // 3. Entrevista
      drawSectionHeader("3. Entrevista Inclusiva e Informações Clínicas", 37, 99, 235); // Azul
      const ent = peiData.entrevista || {};
      drawDataRow("Desenvolvimento Geral", ent.desenvolvimento);
      drawDataRow("Comunicação / Expressão", ent.comunicacao);
      drawDataRow("Locomoção e Mobilidade", ent.locomocao);
      drawDataRow("Autonomia e Independência", ent.autonomia);
      drawDataRow("Interesses e Hobbies", ent.interesses);
      drawDataRow("Dinâmica Familiar", ent.relacaoFamiliar);
      drawDataRow("Beneficiário BPC", ent.bpc ? 'Sim' : 'Não');
      
      // Saúde
      yPos += 2;
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138);
      doc.text("Perfil de Saúde e Medicamentos:", 18, yPos);
      yPos += 5;
      drawDataRow("Hospitalizações", ent.hospitalizacoes);
      drawDataRow("Alergias Alimentares/Med.", ent.alergias);
      drawDataRow("Crises Convulsivas", ent.convulsoes);
      drawDataRow("Medicamentos Contínuos", ent.medicacao);
      yPos += 4;

      // Tabela de atendimentos clínicos
      if (peiData.atendimentosClinicos && peiData.atendimentosClinicos.length > 0) {
        checkPageBreak(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(30);
        doc.text("Cronograma de Acompanhamentos Clínicos:", 18, yPos);
        yPos += 4;

        peiData.atendimentosClinicos.forEach((clin: any, i: number) => {
          if (clin.especialidade) {
            drawDataRow(`Clin. ${i+1} (${clin.especialidade})`, `${clin.profissional || 'Sem prof.'} - ${clin.local || 'Local'} - ${clin.dia || 'Dia'} ${clin.horario || 'H.'}`);
          }
        });
        yPos += 4;
      }

      // 4. Levantamento Pedagógico
      drawSectionHeader("4. Levantamento Pedagógico", 5, 150, 105); // Verde
      const lev = peiData.levantamento || {};
      drawDataRow("Habilidades e Potencialidades", lev.habilidades);
      drawDataRow("Pontos de Atenção / Desenvolver", lev.necessidades);
      yPos += 4;

      // 5. Desenvolvimento do Aluno
      drawSectionHeader("5. Habilidades e Desenvolvimento Inclusivo", 139, 92, 246); // Violeta
      const tabDes = peiData.tabelasDesenvolvimento || {};
      const aspectosMap = {
        cognitivas: 'Habilidades Cognitivas',
        metacognitivas: 'Habilidades Metacognitivas',
        socioemocionais: 'Habilidades Socioemocionais',
        comunicacionais: 'Habilidades Comunicacionais',
        motoras: 'Habilidades Motoras',
        cotidiano: 'Vida Cotidiana'
      };
      
      Object.entries(aspectosMap).forEach(([key, label]) => {
        const item = tabDes[key] || { status: 'Não Avaliado', obs: '' };
        drawDataRow(label, `[${item.status}] - ${item.obs || 'Nenhuma observação registrada'}`);
      });
      yPos += 4;

      // 6. Planejamento
      drawSectionHeader("6. Planejamento Pedagógico e Metas Curriculares", 249, 115, 22); // Coral
      const plan = peiData.planejamento || {};
      drawDataRow("Segmento Letivo", plan.segmento);
      drawDataRow("Área Específica / Componente", plan.areaEspecifica);
      drawDataRow("Objetivos do PEI", plan.objetivos);
      drawDataRow("Conteúdos Programáticos", plan.conteudos);
      drawDataRow("Estratégias / Adaptações", plan.estrategias);
      drawDataRow("Recursos Pedagógicos", plan.recursos);
      drawDataRow("Instrumentos de Avaliação", plan.rubricas);
      yPos += 4;

      // 7. Relatório de Avaliação
      drawSectionHeader("7. Relatório Pedagógico de Avaliação", 79, 70, 229); // Indigo
      const rel = peiData.relatorioAvaliacao || {};
      drawDataRow("Unidade de Avaliação", rel.unidadeEscolar);
      drawDataRow("Período Letivo / Bimestre", rel.periodoLetivo);
      drawDataRow("Avaliação de Ensino-Aprendizagem", rel.desenvolvimentoPedagogico);
      drawDataRow("Feedback do Responsável", rel.observacoesResponsavel);
      yPos += 4;

      // 8. Anexos
      drawSectionHeader("8. Solicitações de Apoio e Anexos", 13, 148, 136); // Teal
      const anx1 = peiData.anexo1 || {};
      const anx2 = peiData.anexo2 || {};
      drawDataRow("Apoio Especializado (Anexo 1)", anx1.solicitado ? 'SOLICITADO' : 'NÃO SOLICITADO');
      if (anx1.solicitado) {
        drawDataRow("Justificativa da Solicitação", anx1.justificativa);
        drawDataRow("Detalhes Complementares", anx1.detalhes);
      }
      drawDataRow("Info Complementares Saúde (Anexo 2)", anx2.informacoesSaude);
      yPos += 15;

      // Assinaturas
      checkPageBreak(30);
      doc.setDrawColor(200);
      doc.line(20, yPos + 10, 80, yPos + 10);
      doc.line(130, yPos + 10, 190, yPos + 10);
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Assinatura do Professor(a)", 50, yPos + 14, { align: "center" });
      doc.text("Assinatura do Coordenador(a)", 160, yPos + 14, { align: "center" });

      doc.save(`PEI_OFICIAL_${selectedStudent.name.replace(/\s+/g, '_').toUpperCase()}.pdf`);
      setFeedback("PEI Oficial exportado em PDF com sucesso!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error("Erro ao gerar PDF do PEI:", err);
      setFeedback("Falha ao exportar PDF.");
    }
  };

  const handleSave = async (type: PlanType) => {
    if (!selectedStudentId) {
      alert('Selecione um aluno primeiro.');
      return;
    }

    setFeedback(`Salvando Plano ${type}...`);
    
    try {
      let dataToSave = type === 'PEI' ? peiData : type === 'PDI' ? pdiData : paeeData;
      
      // Proteção de robustez caso o estado de dados ainda não esteja inicializado
      if (!dataToSave) {
        const targetStud = students.find(s => s.id === selectedStudentId);
        if (type === 'PEI') {
          dataToSave = getDefaultPeiData(selectedStudentId, targetStud);
        } else if (type === 'PDI') {
          dataToSave = { student_id: selectedStudentId, content: '', desenvolvimento: '', social: '', autonomia: '' };
        } else {
          dataToSave = { student_id: selectedStudentId, content: '', recursos: '', barreiras: '', estrategias: '' };
        }
      }
      
      const recordPayload: any = {
        student_id: selectedStudentId,
        record_type: type,
        observation: JSON.stringify(dataToSave),
        value: 'finalizado',
        date: new Date().toISOString().split('T')[0],
        created_by: user.id
      };

      // Apenas envia o ID se ele de fato já existir e for uma atualização de registro existente
      if (dataToSave && dataToSave.id) {
        recordPayload.id = dataToSave.id;
      }
      
      const { data, error } = await supabase
        .from('student_records')
        .upsert(recordPayload)
        .select('*');

      if (error) throw error;

      // Se for um novo registro criado, atualiza o estado local com o ID retornado pelo banco
      const savedRecord = data?.[0];
      if (savedRecord && savedRecord.id) {
        const updatedWithId = { ...dataToSave, id: savedRecord.id };
        if (type === 'PEI') setPeiData(updatedWithId);
        else if (type === 'PDI') setPdiData(updatedWithId);
        else if (type === 'PAEE') setPaeeData(updatedWithId);
      }

      setFeedback(`Plano ${type} atualizado com sucesso!`);
      
      if (logActivity) {
        logActivity(
          `Atualizar Plano ${type}`,
          `Atualizou o plano ${type} para o aluno ID: ${selectedStudentId}`,
          user.municipio_id,
          user.schoolId
        );
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setFeedback(`Erro ao salvar: ${error.message}`);
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = async () => {
    if (!selectedStudentId || !selectedStudent) return;

    setFeedback('Gerando Relatório Consolidado (PEI + PDI + PAEE)...');

    try {
      // Usar os dados do estado (real-time) em vez de buscar no banco novamente
      // Isso garante que o que o professor escreveu agora saia no PDF

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
      
      const peiText = [
        peiData?.metas ? `METAS: ${peiData.metas}` : '',
        peiData?.adaptacoes ? `ADAPTAÇÕES: ${peiData.adaptacoes}` : '',
        peiData?.content ? `OBSERVAÇÕES: ${peiData.content}` : ''
      ].filter(Boolean).join('\n\n');

      if (peiText) {
        const peiLines = doc.splitTextToSize(peiText, pageWidth - 50);
        doc.text(peiLines, 25, yPos);
        yPos += (peiLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PEI preenchido para este aluno.", 25, yPos);
        yPos += 10;
      }

      // --- Seção PDI ---
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(147, 51, 234); // Purple 600
      doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
      doc.setTextColor(255);
      doc.text("PDI — PLANO DE DESENVOLVIMENTO INDIVIDUAL", 25, yPos + 1);

      yPos += 12;
      doc.setTextColor(75);
      doc.setFont("helvetica", "normal");

      const pdiText = [
        pdiData?.social ? `DIMENSÃO SOCIAL: ${pdiData.social}` : '',
        pdiData?.autonomia ? `AUTONOMIA: ${pdiData.autonomia}` : '',
        pdiData?.content ? `DESENVOLVIMENTO: ${pdiData.content}` : ''
      ].filter(Boolean).join('\n\n');

      if (pdiText) {
        const pdiLines = doc.splitTextToSize(pdiText, pageWidth - 50);
        doc.text(pdiLines, 25, yPos);
        yPos += (pdiLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PDI preenchido para este aluno.", 25, yPos);
        yPos += 10;
      }

      // --- Seção PAEE ---
      if (yPos > 220) { doc.addPage(); yPos = 20; }
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(5, 150, 105); // Emerald 600
      doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
      doc.setTextColor(255);
      doc.text("PAEE — PLANO DE ATENDIMENTO EDUCACIONAL ESPECIALIZADO", 25, yPos + 1);

      yPos += 12;
      doc.setTextColor(75);
      doc.setFont("helvetica", "normal");

      const paeeText = [
        paeeData?.barreiras ? `BARREIRAS: ${paeeData.barreiras}` : '',
        paeeData?.recursos ? `RECURSOS: ${paeeData.recursos}` : '',
        paeeData?.estrategias ? `ESTRATÉGIAS: ${paeeData.estrategias}` : '',
        paeeData?.content ? `DETALHES: ${paeeData.content}` : ''
      ].filter(Boolean).join('\n\n');

      if (paeeText) {
        const paeeLines = doc.splitTextToSize(paeeText, pageWidth - 50);
        doc.text(paeeLines, 25, yPos);
        yPos += (paeeLines.length * 6) + 5;
      } else {
        doc.text("Nenhum registro de PAEE preenchido para este aluno.", 25, yPos);
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

      setFeedback("Relatório Consolidado exportado com sucesso!");

      if (logActivity) {
        logActivity(
          'Exportar Relatório Consolidado',
          `Exportou PDF consolidado para o aluno: ${selectedStudent.name}`,
          user.municipio_id,
          user.schoolId
        );
      }

      setTimeout(() => setFeedback(null), 5000);

    } catch (error: any) {
      console.error("Erro na exportação:", error);
      setFeedback(`Falha na exportação: ${error.message || 'Desconhecido'}`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCreatePlan = () => {
    setIsCreatingNew(true);
    // Sincroniza o aluno selecionado no cabeçalho com o formulário de criação
    setCreationData(prev => ({ 
      ...prev, 
      studentId: selectedStudentId || prev.studentId 
    }));
  };

  const handleFinalizeCreation = async () => {
    if (!creationData.studentId || !creationData.content) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setFeedback(`Criando novo plano ${creationData.type}...`);

    console.log("Iniciando salvamento do plano na tabela student_records:", { 
      studentId: creationData.studentId, 
      type: creationData.type
    });

    try {
      const targetStud = students.find(s => s.id === creationData.studentId);
      const obsValue = creationData.type === 'PEI' 
        ? mergeDeep(getDefaultPeiData(creationData.studentId, targetStud), { content: creationData.content }) 
        : { content: creationData.content };
        
      const { error } = await supabase
        .from('student_records')
        .upsert({
          student_id: creationData.studentId,
          record_type: creationData.type,
          observation: JSON.stringify(obsValue),
          value: 'finalizado',
          date: new Date().toISOString().split('T')[0],
          created_by: user.id
        });

      if (error) {
        console.error("Erro Supabase:", error);
        throw error;
      }

      console.log("Plano salvo com sucesso!");
      setFeedback(`Novo plano ${creationData.type} criado com sucesso!`);
      
      // Delay para o usuário ver o feedback antes de fechar
      setTimeout(() => {
        setIsCreatingNew(false);
        const tempId = creationData.studentId;
        setSelectedStudentId('');
        setTimeout(() => {
          setSelectedStudentId(tempId);
          setActivePlan(creationData.type);
        }, 50);
        setCreationData({ studentId: '', type: 'PEI', content: '' });
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao criar plano:", error);
      setFeedback(`Erro ao criar: ${error.message || 'Verifique sua conexão'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
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
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-colors mb-3 group"
              >
                <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
                Voltar ao Portal
              </button>
            )}
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
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-800">Elaborar Novo Plano Inclusivo</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Preencha os dados iniciais para o registro</p>
            </div>
            {feedback && (
              <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-100">
                <i className="fa-solid fa-circle-info mr-2"></i> {feedback}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno Alvo *</label>
              <select
                value={creationData.studentId}
                onChange={(e) => {
                  setCreationData({ ...creationData, studentId: e.target.value });
                  if (e.target.value) setSelectedStudentId(e.target.value);
                }}
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
              disabled={loading}
              className={`px-12 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 shadow-xl ${
                loading 
                  ? 'bg-gray-400 cursor-wait shadow-gray-100' 
                  : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
              }`}
            >
              <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-cloud-arrow-up'}`}></i>
              {loading ? 'Salvando...' : 'Finalizar e Salvar Plano'}
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">PEI – Plano Educacional Individualizado</h2>
                      <p className="text-gray-500 text-xs font-medium">Modelo Oficial Digitalizado — <span className="font-bold text-indigo-600">Educação Especial e Inclusiva</span></p>
                    </div>
                    {peiData && (
                      <button
                        type="button"
                        onClick={handleExportPEIPDF}
                        className="self-start md:self-center px-5 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-2"
                      >
                        <i className="fa-solid fa-file-pdf"></i> Exportar PEI Oficial
                      </button>
                    )}
                  </div>

                  {/* Navegação de Abas do PEI Oficial */}
                  <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-100">
                    {[
                      { id: 'identificacao', label: '1. Identificação', icon: 'fa-user' },
                      { id: 'escolaridade', label: '2. Escolaridade', icon: 'fa-graduation-cap' },
                      { id: 'entrevista', label: '3. Entrevista e Saúde', icon: 'fa-comments' },
                      { id: 'levantamento', label: '4. Levantamento', icon: 'fa-clipboard-question' },
                      { id: 'desenvolvimento', label: '5. Desenvolvimento', icon: 'fa-chart-line' },
                      { id: 'planejamento', label: '6. Planejamento', icon: 'fa-calendar-check' },
                      { id: 'relatorio', label: '7. Relatório', icon: 'fa-file-invoice' },
                      { id: 'anexos', label: '8. Anexos', icon: 'fa-paperclip' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePeiTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                          activePeiTab === tab.id
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm shadow-indigo-100/50'
                            : 'hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Aba 1: Identificação */}
                  {activePeiTab === 'identificacao' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-user text-indigo-500"></i>
                          1. Identificação do(a) Aluno(a)
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Dados pessoais oficiais do estudante</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo</label>
                          <input
                            type="text"
                            value={peiData?.nomeCompleto || ''}
                            onChange={(e) => setPeiData({ ...peiData, nomeCompleto: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome oficial"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data de Nascimento</label>
                          <input
                            type="date"
                            value={peiData?.dataNascimento || ''}
                            onChange={(e) => setPeiData({ ...peiData, dataNascimento: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sexo</label>
                          <select
                            value={peiData?.sexo || ''}
                            onChange={(e) => setPeiData({ ...peiData, sexo: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                          >
                            <option value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filiação</label>
                          <input
                            type="text"
                            value={peiData?.filiacao || ''}
                            onChange={(e) => setPeiData({ ...peiData, filiacao: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome dos pais ou genitores"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável Legal</label>
                          <input
                            type="text"
                            value={peiData?.responsavel || ''}
                            onChange={(e) => setPeiData({ ...peiData, responsavel: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome do responsável"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone de Contato</label>
                          <input
                            type="text"
                            value={peiData?.telefone || ''}
                            onChange={(e) => setPeiData({ ...peiData, telefone: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="(XX) XXXXX-XXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contato de Emergência</label>
                          <input
                            type="text"
                            value={peiData?.contatoEmergencia || ''}
                            onChange={(e) => setPeiData({ ...peiData, contatoEmergencia: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome/Telefone de emergência"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Endereço Residencial</label>
                          <input
                            type="text"
                            value={peiData?.endereco || ''}
                            onChange={(e) => setPeiData({ ...peiData, endereco: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Rua, Número, Bairro, Cidade, CEP"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 2: Escolaridade */}
                  {activePeiTab === 'escolaridade' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                          2. Histórico Escolar e Atendimento
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Escolaridade, SRM e Equipe de Referência</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escola de Origem</label>
                          <input
                            type="text"
                            value={peiData?.escolaOrigem || ''}
                            onChange={(e) => setPeiData({ ...peiData, escolaOrigem: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome da unidade escolar anterior"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno Escolar</label>
                          <select
                            value={peiData?.turno || ''}
                            onChange={(e) => setPeiData({ ...peiData, turno: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                          >
                            <option value="">Selecione...</option>
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Integral">Integral</option>
                            <option value="Noite">Noite</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turma Oficial</label>
                          <input
                            type="text"
                            value={peiData?.turma || ''}
                            onChange={(e) => setPeiData({ ...peiData, turma: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Ex: 1502, 1201"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano / Série de Escolaridade</label>
                          <input
                            type="text"
                            value={peiData?.anoEscolaridade || ''}
                            onChange={(e) => setPeiData({ ...peiData, anoEscolaridade: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Ex: 5º ano, 2º ano"
                          />
                        </div>
                      </div>

                      {/* Público Alvo */}
                      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] block">
                          Público-Alvo da Educação Especial
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { key: 'tea', label: 'Autismo (TEA)' },
                            { key: 'intelectual', label: 'Intelectual' },
                            { key: 'fisica', label: 'Física' },
                            { key: 'visual', label: 'Visual' },
                            { key: 'auditiva', label: 'Auditiva' },
                            { key: 'multipla', label: 'Múltipla' },
                            { key: 'surdocegueira', label: 'Surdocegueira' },
                            { key: 'altasHabilidades', label: 'Altas Habilidades' },
                          ].map(target => (
                            <label key={target.key} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 select-none hover:text-indigo-600 transition-colors">
                              <input
                                type="checkbox"
                                checked={peiData?.publicoAlvo?.[target.key] || false}
                                onChange={(e) => handlePublicoAlvoChange(target.key, e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 border-gray-300"
                              />
                              {target.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modalidade de Atendimento</label>
                          <select
                            value={peiData?.modalidadeAtendimento || ''}
                            onChange={(e) => setPeiData({ ...peiData, modalidadeAtendimento: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                          >
                            <option value="regular">Regular</option>
                            <option value="srm">SRM (Sala de Recursos Multifuncionais)</option>
                            <option value="classeEspecial">Classe Especial</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data / Horário de Atendimento SRM</label>
                          <input
                            type="text"
                            value={peiData?.dataHorarioAtendimento || ''}
                            onChange={(e) => setPeiData({ ...peiData, dataHorarioAtendimento: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Ex: Terças e Quintas - 14:00"
                          />
                        </div>
                      </div>

                      {/* Serviços de Apoio */}
                      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] block">
                          Serviços de Apoio Pedagógico e Acessibilidade
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { key: 'aee', label: 'AEE (SRM)' },
                            { key: 'itinerancia', label: 'Itinerância' },
                            { key: 'interprete', label: 'Intérprete' },
                            { key: 'instrutor', label: 'Instrutor' },
                            { key: 'aaee', label: 'Agente de Apoio (AAEE)' },
                            { key: 'outros', label: 'Outros Serviços' },
                          ].map(target => (
                            <label key={target.key} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 select-none hover:text-indigo-600 transition-colors">
                              <input
                                type="checkbox"
                                checked={peiData?.servicosApoio?.[target.key] || false}
                                onChange={(e) => handleServicoApoioChange(target.key, e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 border-gray-300"
                              />
                              {target.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Equipe Escolar */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                          Equipe Escolar de Referência
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Professor(a) Regente (Regular)</label>
                            <input
                              type="text"
                              value={peiData?.profissionaisUnidade?.regular || ''}
                              onChange={(e) => handlePeiNestedChange('profissionaisUnidade', 'regular', e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                              placeholder="Nome do docente da turma"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Professor(a) AEE</label>
                            <input
                              type="text"
                              value={peiData?.profissionaisUnidade?.aee || ''}
                              onChange={(e) => handlePeiNestedChange('profissionaisUnidade', 'aee', e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                              placeholder="Professor do AEE/SRM"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Coordenação Pedagógica</label>
                            <input
                              type="text"
                              value={peiData?.profissionaisUnidade?.coordenacao || ''}
                              onChange={(e) => handlePeiNestedChange('profissionaisUnidade', 'coordenacao', e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                              placeholder="Coordenador de referência"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Diretor(a) Escolar</label>
                            <input
                              type="text"
                              value={peiData?.profissionaisUnidade?.direcao || ''}
                              onChange={(e) => handlePeiNestedChange('profissionaisUnidade', 'direcao', e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                              placeholder="Nome do Diretor"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 3: Entrevista e Saúde */}
                  {activePeiTab === 'entrevista' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-comments text-indigo-500"></i>
                          3. Entrevista Inclusiva e Informações Clínicas
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Aspectos familiares, de autonomia e cronograma de saúde</p>
                      </div>

                      {/* Entrevista Inclusiva */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desenvolvimento e Histórico do Aluno</label>
                          <textarea
                            value={peiData?.entrevista?.desenvolvimento || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'desenvolvimento', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Como foi o desenvolvimento motor e cognitivo na infância..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comunicação e Expressão</label>
                          <textarea
                            value={peiData?.entrevista?.comunicacao || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'comunicacao', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Como se comunica (fala, gestos, CAA, escrita)..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Locomoção e Mobilidade</label>
                          <textarea
                            value={peiData?.entrevista?.locomocao || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'locomocao', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Caminha com autonomia, necessita de apoio, cadeirante..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autonomia e Atividades Diárias</label>
                          <textarea
                            value={peiData?.entrevista?.autonomia || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'autonomia', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Alimentação, higiene, vestuário, organização..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interesses, Hobbies e Brincadeiras</label>
                          <textarea
                            value={peiData?.entrevista?.interesses || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'interesses', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Atividades favoritas, hiperfoco, preferências..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dinâmica e Relacionamento Familiar</label>
                          <textarea
                            value={peiData?.entrevista?.relacaoFamiliar || ''}
                            onChange={(e) => handlePeiNestedChange('entrevista', 'relacaoFamiliar', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Composição do lar, cooperação com a escola, rotinas..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <input
                          type="checkbox"
                          id="bpc_checkbox"
                          checked={peiData?.entrevista?.bpc || false}
                          onChange={(e) => handlePeiNestedChange('entrevista', 'bpc', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="bpc_checkbox" className="text-xs font-bold text-indigo-800 cursor-pointer select-none">
                          Beneficiário do BPC (Benefício de Prestação Continuada)
                        </label>
                      </div>

                      {/* Histórico de Saúde */}
                      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] block">
                          Perfil de Saúde e Medicamentos
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Hospitalizações / Cirurgias</label>
                            <textarea
                              value={peiData?.entrevista?.hospitalizacoes || ''}
                              onChange={(e) => handlePeiNestedChange('entrevista', 'hospitalizacoes', e.target.value)}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[70px] resize-none"
                              placeholder="Histórico clínico relevante"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Alergias Alimentares / Medicamentosas</label>
                            <textarea
                              value={peiData?.entrevista?.alergias || ''}
                              onChange={(e) => handlePeiNestedChange('entrevista', 'alergias', e.target.value)}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[70px] resize-none"
                              placeholder="Quais alergias conhecidas e cuidados"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Crises Convulsivas / Epilepsia</label>
                            <textarea
                              value={peiData?.entrevista?.convulsoes || ''}
                              onChange={(e) => handlePeiNestedChange('entrevista', 'convulsoes', e.target.value)}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[70px] resize-none"
                              placeholder="Frequência, gatilhos, condutas de emergência"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Medicamentos de Uso Contínuo</label>
                            <textarea
                              value={peiData?.entrevista?.medicacao || ''}
                              onChange={(e) => handlePeiNestedChange('entrevista', 'medicacao', e.target.value)}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[70px] resize-none"
                              placeholder="Nome dos remédios, dosagens, horários na escola"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cronograma Clínico Dinâmico */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Acompanhamentos Clínicos e Terapêuticos
                            </label>
                            <p className="text-[9px] text-gray-400">Cronograma de atendimentos especializados fora do ambiente escolar</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddAtendimentoRow}
                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100"
                          >
                            <i className="fa-solid fa-plus text-[9px]"></i>
                            Adicionar Atendimento
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Especialidade</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Local / Clínica</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Profissional</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Dia</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Horário</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider">Contato</th>
                                <th className="py-2.5 px-3 text-[9px] font-black text-gray-400 uppercase tracking-wider text-center w-12">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(peiData?.atendimentosClinicos || []).map((clin: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.especialidade || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'especialidade', e.target.value)}
                                      placeholder="Ex: Fonoaudiologia"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.local || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'local', e.target.value)}
                                      placeholder="Clínica / CAPS"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.profissional || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'profissional', e.target.value)}
                                      placeholder="Dr(a). Nome"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.dia || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'dia', e.target.value)}
                                      placeholder="Segunda-feira"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.horario || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'horario', e.target.value)}
                                      placeholder="08:30"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={clin.contato || ''}
                                      onChange={(e) => handleAtendimentoChange(idx, 'contato', e.target.value)}
                                      placeholder="Telefone"
                                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAtendimentoRow(idx)}
                                      disabled={(peiData?.atendimentosClinicos || []).length <= 1}
                                      className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center mx-auto transition-colors disabled:opacity-30 disabled:hover:bg-rose-50"
                                    >
                                      <i className="fa-solid fa-trash text-xs"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 4: Levantamento Pedagógico */}
                  {activePeiTab === 'levantamento' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-clipboard-question text-indigo-500"></i>
                          4. Levantamento Pedagógico
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Potencialidades, habilidades e necessidades prioritárias</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Habilidades, Potencialidades e Facilidades Cognitivas/Sociais
                          </label>
                          <textarea
                            value={peiData?.levantamento?.habilidades || ''}
                            onChange={(e) => handlePeiNestedChange('levantamento', 'habilidades', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[160px] font-semibold"
                            placeholder="O que o aluno consegue fazer com autonomia? Quais são seus canais preferenciais de aprendizagem e pontos fortes (ex: memória visual, facilidade em desenho, interesses marcantes)?"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Pontos de Atenção e Necessidades de Desenvolvimento Pedagógico
                          </label>
                          <textarea
                            value={peiData?.levantamento?.necessidades || ''}
                            onChange={(e) => handlePeiNestedChange('levantamento', 'necessidades', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[160px] font-semibold"
                            placeholder="Quais são as principais barreiras enfrentadas? Quais conteúdos, habilidades motoras ou relacionais demandam maior suporte ou adaptações curriculares urgentes?"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 5: Habilidades e Desenvolvimento */}
                  {activePeiTab === 'desenvolvimento' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-chart-line text-indigo-500"></i>
                          5. Habilidades e Desenvolvimento Inclusivo
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Status e análise detalhada por aspecto de desenvolvimento</p>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto font-sans">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-1/3">Aspecto de Desenvolvimento</th>
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-1/4">Status / Parecer</th>
                                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-5/12">Observações Detalhadas / Evidências</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { key: 'cognitivas', label: 'Habilidades Cognitivas', desc: 'Atenção, memória, raciocínio lógico, abstração' },
                                { key: 'metacognitivas', label: 'Habilidades Metacognitivas', desc: 'Autoavaliação, organização de rotina, planejamento' },
                                { key: 'socioemocionais', label: 'Habilidades Socioemocionais', desc: 'Socialização, controle de frustração, empatia' },
                                { key: 'comunicacionais', label: 'Habilidades Comunicacionais', desc: 'Uso da linguagem oral, escrita, gestual, CAA' },
                                { key: 'motoras', label: 'Habilidades Motoras', desc: 'Coordenação motora fina (escrita) e ampla (locomoção)' },
                                { key: 'cotidiano', label: 'Vida Cotidiana / Prática', desc: 'Higiene, alimentação autônoma, independência no pátio' },
                              ].map(aspect => {
                                const item = peiData?.tabelasDesenvolvimento?.[aspect.key] || { status: 'Não Avaliado', obs: '' };
                                return (
                                  <tr key={aspect.key} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all">
                                    <td className="p-4">
                                      <span className="text-xs font-black text-gray-800 block">{aspect.label}</span>
                                      <span className="text-[9px] text-gray-400 font-semibold uppercase">{aspect.desc}</span>
                                    </td>
                                    <td className="p-4">
                                      <select
                                        value={item.status}
                                        onChange={(e) => handleTabelaDesenvolvimentoChange(aspect.key, 'status', e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                                      >
                                        <option value="Não Avaliado">Não Avaliado</option>
                                        <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                                        <option value="Adquirido">Adquirido</option>
                                        <option value="Apresenta Dificuldade">Apresenta Dificuldade</option>
                                      </select>
                                    </td>
                                    <td className="p-4">
                                      <textarea
                                        value={item.obs}
                                        onChange={(e) => handleTabelaDesenvolvimentoChange(aspect.key, 'obs', e.target.value)}
                                        placeholder="Descreva comportamentos observados e suportes necessários..."
                                        rows={2}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner font-medium"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 6: Planejamento Pedagógico */}
                  {activePeiTab === 'planejamento' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-calendar-check text-indigo-500"></i>
                          6. Planejamento Pedagógico e Metas Curriculares
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Estratégias, objetivos e adaptações curriculares propostas</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Segmento Letivo</label>
                          <select
                            value={peiData?.planejamento?.segmento || 'Fundamental'}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'segmento', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                          >
                            <option value="Infantil">Educação Infantil</option>
                            <option value="Fundamental">Ensino Fundamental</option>
                            <option value="EJA">Educação de Jovens e Adultos (EJA)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Área Específica / Componente Curricular</label>
                          <input
                            type="text"
                            value={peiData?.planejamento?.areaEspecifica || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'areaEspecifica', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Ex: Alfabetização, Matemática, Geral"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivos de Aprendizagem e Desenvolvimento do PEI</label>
                          <textarea
                            value={peiData?.planejamento?.objetivos || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'objetivos', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] font-semibold"
                            placeholder="Quais competências e habilidades curriculares o aluno deve atingir neste período?"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conteúdos Programáticos Adaptados</label>
                          <textarea
                            value={peiData?.planejamento?.conteudos || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'conteudos', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] font-semibold"
                            placeholder="Que temas e conteúdos serão ensinados com a devida flexibilização/redução de complexidade?"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estratégias Pedagógicas e de Acessibilidade</label>
                          <textarea
                            value={peiData?.planejamento?.estrategias || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'estrategias', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] font-semibold"
                            placeholder="Metodologias ativas, tempo estendido, provas orais, mediação dirigida..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos Tecnológicos, Didáticos ou de Apoio</label>
                          <textarea
                            value={peiData?.planejamento?.recursos || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'recursos', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] font-semibold"
                            placeholder="Materiais concretos, computadores, prancha de comunicação, softwares específicos..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrumentos e Rubricas de Avaliação</label>
                          <textarea
                            value={peiData?.planejamento?.rubricas || ''}
                            onChange={(e) => handlePeiNestedChange('planejamento', 'rubricas', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] font-semibold"
                            placeholder="Como a aprendizagem será avaliada? Relatório descritivo, portfólio, observação participativa..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 7: Relatório Pedagógico */}
                  {activePeiTab === 'relatorio' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-file-invoice text-indigo-500"></i>
                          7. Relatório Pedagógico de Avaliação
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Balanço do aprendizado e feedback da família</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade Escolar de Avaliação</label>
                          <input
                            type="text"
                            value={peiData?.relatorioAvaliacao?.unidadeEscolar || ''}
                            onChange={(e) => handlePeiNestedChange('relatorioAvaliacao', 'unidadeEscolar', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Nome da escola avaliadora"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Período Letivo / Bimestre</label>
                          <input
                            type="text"
                            value={peiData?.relatorioAvaliacao?.periodoLetivo || ''}
                            onChange={(e) => handlePeiNestedChange('relatorioAvaliacao', 'periodoLetivo', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                            placeholder="Ex: 3º Bimestre / 2026"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avaliação do Processo de Ensino-Aprendizagem</label>
                          <textarea
                            value={peiData?.relatorioAvaliacao?.desenvolvimentoPedagogico || ''}
                            onChange={(e) => handlePeiNestedChange('relatorioAvaliacao', 'desenvolvimentoPedagogico', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[160px] font-semibold"
                            placeholder="Descreva de forma descritiva e qualitativa as conquistas acadêmicas, avanços de socialização e dificuldades que persistem no aluno."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações e Feedback do Responsável Legal</label>
                          <textarea
                            value={peiData?.relatorioAvaliacao?.observacoesResponsavel || ''}
                            onChange={(e) => handlePeiNestedChange('relatorioAvaliacao', 'observacoesResponsavel', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] font-semibold"
                            placeholder="Registro do posicionamento dos pais ou responsáveis em relação ao PEI e desenvolvimento do filho."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aba 8: Solicitações e Anexos */}
                  {activePeiTab === 'anexos' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-gray-50 pb-4 mb-4">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-paperclip text-indigo-500"></i>
                          8. Solicitações de Apoio e Anexos de Saúde
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Anexos e demandas de apoio complementar</p>
                      </div>

                      {/* Anexo 1: Apoio Especializado */}
                      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="anexo1_solicitado"
                            checked={peiData?.anexo1?.solicitado || false}
                            onChange={(e) => handlePeiNestedChange('anexo1', 'solicitado', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 border-gray-300 cursor-pointer"
                          />
                          <label htmlFor="anexo1_solicitado" className="text-xs font-black text-indigo-800 cursor-pointer select-none">
                            SOLICITAR APOIO ESPECIALIZADO DE TERCEIROS (ANEXO 1)
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed pl-8">
                          Marque este campo caso o aluno necessite de suporte profissional direto na unidade escolar (agente de apoio, tradutor-intérprete ou mediador de saúde).
                        </p>

                        {peiData?.anexo1?.solicitado && (
                          <div className="space-y-4 pl-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Justificativa Detalhada da Necessidade</label>
                              <textarea
                                value={peiData?.anexo1?.justificativa || ''}
                                onChange={(e) => handlePeiNestedChange('anexo1', 'justificativa', e.target.value)}
                                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none font-semibold"
                                placeholder="Fundamente com base no levantamento pedagógico o porquê da necessidade de agente de apoio..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Detalhes Complementares da Demanda</label>
                              <textarea
                                value={peiData?.anexo1?.detalhes || ''}
                                onChange={(e) => handlePeiNestedChange('anexo1', 'detalhes', e.target.value)}
                                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] resize-none font-semibold"
                                placeholder="Especificações técnicas, frequência ou carga horária sugerida"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Anexo 2: Saúde */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm font-sans">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                          Informações Complementares de Saúde (Anexo 2)
                        </label>
                        <div className="space-y-2">
                          <textarea
                            value={peiData?.anexo2?.informacoesSaude || ''}
                            onChange={(e) => handlePeiNestedChange('anexo2', 'informacoesSaude', e.target.value)}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] font-semibold"
                            placeholder="Registro de outras condições médicas crônicas relevantes, restrições alimentares severas, laudos clínicos anexados ou orientações de profissionais de saúde externos."
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                        <textarea 
                          value={pdiData?.social || ''}
                          onChange={(e) => setPdiData({ ...pdiData, social: e.target.value })}
                          className="w-full p-5 bg-purple-50/30 border border-purple-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" 
                          placeholder="Interação com pares, autorregulação..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autonomia e Funcionalidade</label>
                        <textarea 
                          value={pdiData?.autonomia || ''}
                          onChange={(e) => setPdiData({ ...pdiData, autonomia: e.target.value })}
                          className="w-full p-5 bg-purple-50/30 border border-purple-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" 
                          placeholder="Higiene pessoal, organização de materiais..." 
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso / Desenvolvimento Geral</label>
                        <textarea 
                          value={pdiData?.content || pdiData?.desenvolvimento || ''}
                          onChange={(e) => setPdiData({ ...pdiData, content: e.target.value })}
                          className="w-full p-5 bg-purple-50/30 border border-purple-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]" 
                          placeholder="Observações sobre o desenvolvimento global..." 
                        />
                      </div>
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
                      <textarea 
                        value={paeeData?.barreiras || ''}
                        onChange={(e) => setPaeeData({ ...paeeData, barreiras: e.target.value })}
                        className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" 
                        placeholder="Física, Atitudinal, Comunicacional..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos de Acessibilidade</label>
                      <textarea 
                        value={paeeData?.recursos || ''}
                        onChange={(e) => setPaeeData({ ...paeeData, recursos: e.target.value })}
                        className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" 
                        placeholder="Soroban, Teclado Adaptado, Prancha de CAA..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estratégias de Intervenção</label>
                      <textarea 
                        value={paeeData?.estrategias || ''}
                        onChange={(e) => setPaeeData({ ...paeeData, estrategias: e.target.value })}
                        className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]" 
                        placeholder="Atendimento em contraturno na SRM..." 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conteúdo Detalhado PAEE</label>
                    <textarea 
                      value={paeeData?.content || ''}
                      onChange={(e) => setPaeeData({ ...paeeData, content: e.target.value })}
                      className="w-full p-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]" 
                      placeholder="Outros detalhes sobre o atendimento..." 
                    />
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
        <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600 text-4xl shadow-inner">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pronto para elaborar um plano?</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Você pode selecionar um aluno no menu superior para ver o histórico <br />
              ou clicar no botão abaixo para criar um novo plano do zero.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCreatePlan}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-plus-circle"></i>
              Criar Novo Plano Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherInclusivePlans;
