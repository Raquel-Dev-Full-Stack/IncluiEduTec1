import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tables, error } = await supabase.rpc('get_tables_info'); // If exists
  
  // Try to query common tables to see which ones exist
  const tablesToTry = ['pei', 'pdi', 'paee', 'reports', 'relatorios'];
  
  for (const table of tablesToTry) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}' error: ${error.message}`);
    } else {
      console.log(`Table '${table}' exists!`);
    }
  }
}

run();
