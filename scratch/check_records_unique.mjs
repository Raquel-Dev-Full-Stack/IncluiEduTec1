import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking multi-column unique indexes on 'meals' and 'student_records'...");
  
  const tests = [
      { table: 'meals', combo: 'aluno_id,meal_date,tipo_refeicao' },
      { table: 'student_records', combo: 'student_id,date,record_type,shift' }
  ];
  
  for (const test of tests) {
      const { error } = await supabase.from(test.table).upsert([{}], { onConflict: test.combo });
      if (error && error.message.includes('there is no unique or exclusion constraint')) {
          console.log(`Table '${test.table}' Combo '${test.combo}': NO UNIQUE CONSTRAINT`);
      } else if (error) {
          console.log(`Table '${test.table}' Combo '${test.combo}': HAS UNIQUE CONSTRAINT (failed with other error: ${error.message})`);
      } else {
          console.log(`Table '${test.table}' Combo '${test.combo}': HAS UNIQUE CONSTRAINT (success)`);
      }
  }
}

run();
