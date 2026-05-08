import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('users').select('id').limit(1); // Check if we can reach the DB
  if (error) {
    console.error("DB Connection Error:", error);
    return;
  }
  
  // Use a raw SQL query if possible, but RPC is safer if configured
  // For now, let's try to find tables by trial and error since I can't use information_schema directly via PostgREST usually
  const tablesToTry = ['relatorios', 'alunos', 'usuarios', 'escolas', 'turmas', 'presenca', 'refeicoes', 'pei', 'pdi', 'paee', 'reports'];
  
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
