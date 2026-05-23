import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log('Listing all users in public.users using service_role:');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(50);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total users found: ${data.length}`);
    console.log('Users:', JSON.stringify(data, null, 2));
  }
}

check();
