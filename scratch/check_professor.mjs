import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  // 1. Procurar na tabela public.users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'taisprof@altivocesar.com');

  if (error) {
    console.error("Erro ao buscar na public.users:", error);
    return;
  }

  console.log("PROFESSORAS ENCONTRADAS NA TABELA public.users:");
  console.log(users);

  // 2. Listar todas as colunas da tabela student_records
  const { data: studentsRecords, error: srError } = await supabase
    .from('student_records')
    .select('*')
    .limit(1);

  if (srError) {
    console.error("Erro ao buscar student_records:", srError);
  } else {
    console.log("EXEMPLO DE REGISTRO DA STUDENT_RECORDS:");
    console.log(studentsRecords);
  }
}

run();
