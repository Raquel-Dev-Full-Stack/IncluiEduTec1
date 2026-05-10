import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking for triggers on 'users' table...");
  
  // We can try to see if there is an RPC that lists triggers or just try to guess.
  // Actually, I'll try to insert a user and see if it triggers anything (like a log entry or a count update).
  
  const testEmail = 'trigger_test@example.com';
  const { error } = await supabase.from('users').insert([{
      name: 'Trigger Test',
      email: testEmail,
      role: 'mediador'
  }]);
  
  if (error) {
      console.log("Insert failed:", error.message);
  } else {
      console.log("Insert succeeded.");
      // Check if any other table got updated
      const { data: logs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(1);
      console.log("Last activity log:", logs);
  }
  
  await supabase.from('users').delete().eq('email', testEmail);
}

run();
