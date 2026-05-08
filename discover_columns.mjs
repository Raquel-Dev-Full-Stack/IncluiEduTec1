import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name_param: 'relatorios' });
  if (error) {
    console.log("RPC Error (maybe not defined):", error.message);
    // Fallback: try to insert a dummy row and see what error we get, or use a known list
  } else {
    console.log("COLUMNS FOR relatorios:", data);
  }
  
  // Try another way:
  const { data: cols, error: err2 } = await supabase
    .from('relatorios')
    .select('*')
    .limit(0);
    
  if (err2) {
     console.log("Select error:", err2.message);
  } else {
     console.log("Success! Columns (if any):", cols);
  }
}

run();
