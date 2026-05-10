import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Searching for alternative user saving RPCs...");
  
  const rpcs = ['save_user', 'upsert_user', 'create_user', 'register_user', 'add_user'];
  
  for (const rpc of rpcs) {
      const { error } = await supabase.rpc(rpc, { p_email: 'test@test.com' });
      if (error && error.code !== 'PGRST202') {
          console.log(`Found RPC '${rpc}': ${error.message} (${error.code})`);
      } else if (!error) {
          console.log(`RPC '${rpc}' EXISTS!`);
      }
  }
}

run();
