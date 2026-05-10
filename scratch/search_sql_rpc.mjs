import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Searching for any RPC that can execute SQL...");
  
  // Try to find a function that takes 'sql' or 'query'
  // We can't query pg_proc directly via PostgREST, but we can try common names again.
  const rpcs = ['exec', 'execute', 'run', 'sql', 'query', 'db_query', 'admin_query'];
  
  for (const rpc of rpcs) {
      const { error } = await supabase.rpc(rpc, { query: 'SELECT 1', sql: 'SELECT 1' });
      if (error && error.code !== 'PGRST202') { // PGRST202 means function not found
          console.log(`Found possible RPC '${rpc}': ${error.message} (${error.code})`);
      } else if (!error) {
          console.log(`RPC '${rpc}' EXISTS and worked!`);
          return;
      }
  }
  console.log("No common SQL RPCs found.");
}

run();
