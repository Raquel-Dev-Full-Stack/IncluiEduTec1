import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tablesToTry = ['users', 'students', 'classes', 'schools', 'mediation_records', 'attendance', 'meals', 'student_records', 'municipios', 'reports', 'pei', 'pdi', 'paee'];
  
  for (const table of tablesToTry) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
       console.log(`Table '${table}': ${error.message} (${error.code})`);
    } else {
       console.log(`Table '${table}': EXISTS`);
    }
  }
}

run();
