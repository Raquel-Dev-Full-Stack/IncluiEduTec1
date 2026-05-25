import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const targetId = '7830ece4-228e-4f1e-88d8-3be8e44a69b6';

  console.log("Checking if targetId exists in public.users (id)...");
  const { data: byId } = await supabase.from('users').select('*').eq('id', targetId);
  console.log("Result by id:", byId);

  console.log("Checking if targetId exists in public.users (auth_user_id)...");
  const { data: byAuthId } = await supabase.from('users').select('*').eq('auth_user_id', targetId);
  console.log("Result by auth_user_id:", byAuthId);
}

run();
