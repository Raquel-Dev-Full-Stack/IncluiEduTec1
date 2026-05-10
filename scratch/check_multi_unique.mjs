import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking multi-column unique indexes on 'users' table...");
  
  const combos = ['email, school_id', 'name, school_id', 'auth_user_id, email'];
  
  for (const combo of combos) {
      const { error } = await supabase.from('users').upsert([{}], { onConflict: combo });
      if (error && error.message.includes('there is no unique or exclusion constraint')) {
          console.log(`Combo '${combo}': NO UNIQUE CONSTRAINT`);
      } else if (error) {
          console.log(`Combo '${combo}': HAS UNIQUE CONSTRAINT (failed with other error: ${error.message})`);
      } else {
          console.log(`Combo '${combo}': HAS UNIQUE CONSTRAINT (success)`);
      }
  }
}

run();
