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

  console.log("Login efetuado com sucesso! Fazendo busca dos registros de student_records...");
  const { data: records, error: recordError } = await client
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471');

  if (recordError) {
    console.error("Erro ao buscar registros (RLS):", recordError.message);
    return;
  }

  console.log(`Total de registros para José Philipe: ${records.length}`);
  records.forEach((r, idx) => {
    console.log(`\n--- Registro ${idx + 1} ---`);
    console.log(`ID: ${r.id}`);
    console.log(`Data: ${r.date}`);
    console.log(`Record Type: ${r.record_type}`);
    console.log(`Value: ${r.value}`);
    console.log(`Created By: ${r.created_by}`);
    console.log(`Observation: ${r.observation}`);
  });
}

run();
