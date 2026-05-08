import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const columnsToTry = ['student_id', 'aluno_id', 'school_id', 'escola_id', 'title', 'titulo', 'type', 'tipo', 'status'];
  
  for (const col of columnsToTry) {
    const { error } = await supabase.from('relatorios').select(col).limit(1);
    if (error) {
      console.log(`Column '${col}': ERROR (${error.code})`);
    } else {
      console.log(`Column '${col}': EXISTS`);
    }
  }
}

run();
