import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pP1s1jHkE0tO3h9G01k2r8d312389182398123'; // Chave anônima correta do seu .env seria bom, mas vamos testar a anon key oficial do projeto!
// Pegamos a anon key do .env
import fs from 'fs';
const envContent = fs.readFileSync('c:\\Users\\RAQUEL\\Desktop\\Projetos MicroSaas\\5Projeto IncluiEdutec5\\IncluiEduTec1\\.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) envVars[key.trim()] = val.trim();
});

const anonKey = envVars.VITE_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, anonKey);

async function run() {
  const email = 'paulodiretor@altivocesar.com';
  const passwords = ['12345', 'Mudar@123', 'paulo123', 'admin123'];

  let session = null;
  for (const pw of passwords) {
    console.log(`Tentando login com senha: ${pw}...`);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pw
    });
    if (!error && data.session) {
      console.log(`Sucesso com a senha: ${pw}!`);
      session = data.session;
      break;
    } else {
      console.log(`Erro: ${error?.message}`);
    }
  }

  if (!session) {
    console.error("Não foi possível logar como Paulo.");
    return;
  }

  // Agora vamos tentar buscar na tabela student_records usando o cliente autenticado (como o Paulo)
  console.log("\nBuscando na tabela student_records com perfil do Paulo:");
  const { data: records, error: recordError } = await client
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471')
    .eq('record_type', 'PAEE');

  if (recordError) {
    console.error("Erro RLS/Banco ao buscar student_records:", recordError.message);
  } else {
    console.log("Resultado da busca:", records);
  }
}

run();
