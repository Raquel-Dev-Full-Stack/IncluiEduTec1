import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Buscar todos os alunos cadastrados no banco
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id, name, diagnosis, ra');

  if (studentError) {
    console.error("Erro ao buscar alunos:", studentError);
    return;
  }

  console.log("TODOS OS ALUNOS NO BANCO:");
  console.table(students);

  // 2. Buscar TODOS os registros do tipo PAEE no banco
  const { data: records, error: recordError } = await supabase
    .from('student_records')
    .select('*')
    .eq('record_type', 'PAEE');

  if (recordError) {
    console.error("Erro ao buscar registros PAEE:", recordError);
    return;
  }

  console.log("\nTODOS OS REGISTROS PAEE NO BANCO:");
  console.log(JSON.stringify(records, null, 2));
}

run();
