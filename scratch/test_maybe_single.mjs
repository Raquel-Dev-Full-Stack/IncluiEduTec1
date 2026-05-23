import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  const newPassword = 'Paulo@123456!';

  console.log("1. Login como Paulo...");
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: 'paulodiretor@altivocesar.com',
    password: newPassword
  });

  if (signInError) {
    console.error("Erro ao fazer login:", signInError.message);
    return;
  }
  console.log("Login realizado com sucesso!");

  const sessionClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session.access_token}`
      }
    }
  });

  console.log("\n2. Fazendo SELECT com maybeSingle()...");
  const { data, error } = await sessionClient
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471')
    .eq('record_type', 'PAEE')
    .maybeSingle();

  if (error) {
    console.error("Erro no maybeSingle():", error);
  } else {
    console.log("Resultado do maybeSingle():", data);
  }
}

run();
