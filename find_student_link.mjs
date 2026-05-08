import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tables = ['relatorios', 'reports', 'student_records', 'lesson_plans', 'mediation_records', 'pei', 'pdi', 'paee'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('student_id').limit(0);
    if (!error) console.log(`Table '${t}' has 'student_id'`);
    else {
        const { error: error2 } = await supabase.from(t).select('aluno_id').limit(0);
        if (!error2) console.log(`Table '${t}' has 'aluno_id'`);
    }
  }
}

run();
