import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking unique indexes on 'students' table...");
  
  const columns = ['ra', 'id'];
  
  for (const col of columns) {
      const { error } = await supabase.from('students').upsert([{}], { onConflict: col });
      if (error && error.message.includes('there is no unique or exclusion constraint')) {
          console.log(`Column '${col}': NO UNIQUE CONSTRAINT`);
      } else if (error) {
          console.log(`Column '${col}': HAS UNIQUE CONSTRAINT (failed with other error: ${error.message})`);
      } else {
          console.log(`Column '${col}': HAS UNIQUE CONSTRAINT (success)`);
      }
  }
}

run();
