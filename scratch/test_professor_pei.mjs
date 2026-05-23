import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  const email = 'taisprof@altivocesar.com';
  const password = '123456';
  const studentId = 'dd76da72-b04c-4140-b6f6-799f7c568471'; // José Philipe

  console.log(`1. Tentando realizar login como Professora Taís (${email})...`);
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Erro ao fazer login:", signInError.message);
    return;
  }
  console.log("Login realizado com sucesso! Token JWT obtido.");
  
  const authUser = signInData.user;
  console.log(`User ID do Auth: ${authUser.id}`);

  // Cliente autenticado com a sessão da Taís
  const sessionClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session.access_token}`
      }
    }
  });

  // RESOLVER ID INTERNO DO PROFESSOR (Igual implementado no TeacherInclusivePlans.tsx)
  console.log("\n2. Resolvendo o ID do professor no banco público.users...");
  let finalTeacherId = authUser.id;
  const { data: dbUser, error: dbUserError } = await sessionClient
    .from('users')
    .select('id')
    .or(`auth_user_id.eq.${authUser.id},email.eq.${email}`)
    .maybeSingle();

  if (dbUserError) {
    console.error("Erro ao buscar professor:", dbUserError.message);
  } else if (dbUser && dbUser.id) {
    finalTeacherId = dbUser.id;
    console.log(`ID público da Taís resolvido com sucesso: ${finalTeacherId}`);
  }

  console.log("\n3. Buscando se já existe registro de PEI para o aluno José Philipe...");
  const { data: records, error: recordError } = await sessionClient
    .from('student_records')
    .select('*')
    .eq('student_id', studentId)
    .eq('record_type', 'PEI');

  if (recordError) {
    console.error("Erro ao ler registro PEI (RLS/DB):", recordError.message);
    return;
  }

  const peiRec = records?.[0];
  if (peiRec) {
    console.log(`Registro de PEI existente encontrado! ID: ${peiRec.id}`);
  } else {
    console.log("Nenhum registro de PEI existente encontrado para este aluno.");
  }

  // 4. Simular preenchimento / salvamento de PEI com a nossa nova lógica resiliente
  console.log("\n4. Simulando preparação de dados e Upsert do PEI...");
  
  let peiData = peiRec 
    ? JSON.parse(peiRec.observation) 
    : {
        student_id: studentId,
        nomeCompleto: "José Philipe",
        turno: "Manhã",
        turma: "201",
        filiacao: "Genitores do José Philipe",
        responsavel: "Responsável Legal do José",
        escolaOrigem: "Escola Municipal Altivo César",
        publicoAlvo: { tea: true },
        entrevista: { bpc: false, desenvolvimento: "Simulação de histórico de desenvolvimento para testes." },
        atendimentosClinicos: [{ especialidade: "Psicopedagogia", profissional: "Profissional de Teste", local: "Clínica de AEE", dia: "Segunda", horario: "14:00", contato: "(21) 99999-9999" }]
      };

  if (peiRec) {
    peiData.id = peiRec.id;
  }

  // Injetar uma modificação na observação para provar o salvamento
  peiData.observacoesGeraisEntrevista = `Modificado em teste de RLS às: ${new Date().toLocaleString('pt-BR')}`;

  const recordPayload = {
    student_id: studentId,
    record_type: 'PEI',
    observation: JSON.stringify(peiData),
    value: 'finalizado',
    date: new Date().toISOString().split('T')[0],
    created_by: finalTeacherId
  };

  if (peiData && peiData.id) {
    recordPayload.id = peiData.id;
  }

  console.log("Enviando upsert com payload para o Supabase...");
  const { data: upsertResult, error: upsertError } = await sessionClient
    .from('student_records')
    .upsert(recordPayload)
    .select('*');

  if (upsertError) {
    console.error("Erro ao salvar PEI no Supabase (RLS bloqueou ou erro de constraint):", upsertError.message);
  } else {
    console.log("PEI SALVO COM ABSOLUTO SUCESSO!");
    console.log("Dados do registro salvo no Supabase:", upsertResult?.[0]);
  }
}

run();
