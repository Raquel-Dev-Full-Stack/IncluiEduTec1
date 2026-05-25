import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const envContent = fs.readFileSync('c:\\Users\\RAQUEL\\Desktop\\Projetos MicroSaas\\5Projeto IncluiEdutec5\\IncluiEduTec1\\.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const anonKey = envVars.VITE_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, anonKey);

async function run() {
  const email = 'taisprof@altivocesar.com';
  const password = '123456';

  console.log(`Tentando login como Tais (${email})...`);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    console.error("Erro ao fazer login:", error?.message);
    return;
  }

  console.log("Login efetuado com sucesso!");

  // Fazer consulta na tabela student_records para o José Philipe
  const { data: records, error: recordError } = await client
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471')
    .eq('record_type', 'PAEE');

  if (recordError) {
    console.error("Erro RLS/Banco ao buscar student_records para Tais:", recordError.message);
  } else {
    console.log("Resultado da busca de PAEE para Tais:", records);
  }
}

run();
