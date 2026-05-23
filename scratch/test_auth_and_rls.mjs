import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  const pauloAuthUserId = '9b233782-a0f3-4330-b41d-ef7b5800801e';
  const newPassword = 'Paulo@123456!';

  console.log("1. Atualizando a senha do Paulo via Admin API...");
  const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
    pauloAuthUserId,
    { password: newPassword }
  );

  if (updateError) {
    console.error("Erro ao atualizar senha:", updateError.message);
    return;
  }
  console.log("Senha atualizada com sucesso!");

  console.log("\n2. Tentando login como Paulo no cliente anon...");
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: 'paulodiretor@altivocesar.com',
    password: newPassword
  });

  if (signInError) {
    console.error("Erro ao fazer login:", signInError.message);
    return;
  }
  console.log("Login realizado com sucesso! Token JWT obtido.");

  const sessionClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session.access_token}`
      }
    }
  });

  console.log("\n3. Fazendo SELECT na tabela student_records para o aluno José Philipe...");
  const { data: records, error: recordError } = await sessionClient
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471')
    .eq('record_type', 'PAEE');

  if (recordError) {
    console.error("Erro no SELECT (RLS/DB):", recordError.message);
  } else {
    console.log("Registros PAEE retornados para o Paulo:", records);
  }
}

run();
