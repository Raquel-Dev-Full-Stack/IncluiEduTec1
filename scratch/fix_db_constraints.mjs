import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Attempting to fix constraints on 'users' table...");
  
  // Try to use a common RPC for SQL if it exists
  const sql = "ALTER TABLE users ADD CONSTRAINT users_email_unique_new UNIQUE (email)";
  
  // I'll try to see if there's an RPC like 'exec_sql' or 'execute_sql'
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql'];
  for (const rpc of rpcs) {
      console.log(`Trying RPC '${rpc}'...`);
      const { data, error } = await supabase.rpc(rpc, { sql_query: sql, query: sql });
      if (error) {
          console.log(`RPC '${rpc}' failed:`, error.message);
      } else {
          console.log(`RPC '${rpc}' SUCCEEDED!`);
          break;
      }
  }
}

run();
