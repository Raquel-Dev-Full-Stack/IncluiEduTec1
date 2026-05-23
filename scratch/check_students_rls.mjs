import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  const password = 'Paulo@123456!';

  console.log("1. Login como Paulo...");
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: 'paulodiretor@altivocesar.com',
    password: password
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

  console.log("\n2. Buscando alunos da tabela 'students' como Paulo...");
  const { data: students, error: studentsError } = await sessionClient
    .from('students')
    .select('*');

  if (studentsError) {
    console.error("Erro ao buscar alunos:", studentsError.message);
  } else {
    console.log(`Total de alunos retornados do banco: ${students.length}`);
    const jose = students.find(s => s.name.includes("Philipe") || s.id === 'dd76da72-b04c-4140-b6f6-799f7c568471');
    if (jose) {
      console.log("SUCESSO: José Philipe foi retornado pelo banco!", {
        id: jose.id,
        name: jose.name,
        school_id: jose.school_id,
        class_id: jose.class_id
      });
    } else {
      console.log("FALHA: José Philipe NÃO foi retornado pelo banco!");
      console.log("Alunos retornados:", students.map(s => ({ id: s.id, name: s.name, school_id: s.school_id })));
    }
  }
}

run();
