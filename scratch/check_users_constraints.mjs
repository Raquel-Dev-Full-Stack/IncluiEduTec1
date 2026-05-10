import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking constraints on 'users' table...");
  
  const testEmail = 'test_constraint@example.com';
  
  // 1. Clean up
  await supabase.from('users').delete().eq('email', testEmail);
  
  // 2. Insert once
  const { error: err1 } = await supabase.from('users').insert([{
    name: 'Test 1',
    email: testEmail,
    role: 'professor'
  }]);
  
  if (err1) {
    console.error("Initial insert failed:", err1);
    return;
  }
  
  // 3. Insert again with same email
  const { error: err2 } = await supabase.from('users').insert([{
    name: 'Test 2',
    email: testEmail,
    role: 'professor'
  }]);
  
  if (err2) {
    console.log("Second insert failed (expected if UNIQUE):", err2.message, err2.code);
  } else {
    console.log("Second insert SUCCEEDED. This means there is NO UNIQUE constraint on 'email'!");
  }
  
  // 4. Try upsert with ON CONFLICT (email)
  const { error: err3 } = await supabase.from('users').upsert({
    name: 'Test Upsert',
    email: testEmail,
    role: 'professor'
  }, { onConflict: 'email' });
  
  if (err3) {
    console.log("Upsert with ON CONFLICT 'email' failed:", err3.message, err3.code);
  } else {
    console.log("Upsert with ON CONFLICT 'email' succeeded.");
  }

  // Cleanup
  await supabase.from('users').delete().eq('email', testEmail);
}

run();
