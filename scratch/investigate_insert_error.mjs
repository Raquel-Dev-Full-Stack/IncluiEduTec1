import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Investigating server-side error during insert...");
  
  // Try to insert a record with a known-unique email and see the error again.
  const testEmail = `test_${Date.now()}@example.com`;
  const { error } = await supabase.from('users').insert([{
      name: 'Jorge Silva Test',
      email: testEmail,
      role: 'mediador'
  }]);
  
  if (error) {
      console.log("ERROR DETAILS:", JSON.stringify(error, null, 2));
  } else {
      console.log("INSERT WORKED! (Wait, then why did it fail before?)");
  }
}

run();
