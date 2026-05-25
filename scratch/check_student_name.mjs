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

  console.log("Login efetuado com sucesso! Fazendo busca dos alunos...");
  const { data: students, error: studentError } = await client
    .from('students')
    .select('*');

  if (studentError) {
    console.error("Erro ao buscar alunos (RLS):", studentError.message);
    return;
  }

  console.log(`Total de alunos retornados para Tais: ${students.length}`);
  const filtered = students.filter(s => 
    s.name.toLowerCase().includes('josé') || 
    s.name.toLowerCase().includes('jose') || 
    s.name.toLowerCase().includes('philipe') ||
    s.name.toLowerCase().includes('filipe')
  );

  console.log(`Alunos filtrados (${filtered.length}):`);
  filtered.forEach(s => {
    console.log(`ID: ${s.id}, Nome: ${s.name}, Turma ID: ${s.class_id || s.classId}, Escola ID: ${s.school_id || s.schoolId}`);
  });
}

run();
