import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: rows, error } = await supabase.from('schools').select('*').limit(1);
  if (error) {
    console.error("Error reading schools:", error);
    return;
  }
  
  if (rows && rows.length > 0) {
    console.log("COLUMNS FOUND IN schools ROW:", Object.keys(rows[0]));
    console.log("ROW SAMPLE DATA:", rows[0]);
  } else {
    console.log("Table schools is empty. Finding columns via common names...");
    // Let's query information_schema or similar if RPC is not available
  }
}

run();
