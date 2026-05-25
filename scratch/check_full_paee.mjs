import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data } = await supabase
    .from('student_records')
    .select('*')
    .eq('student_id', 'dd76da72-b04c-4140-b6f6-799f7c568471')
    .eq('record_type', 'PAEE')
    .maybeSingle();

  console.log("FULL PAEE JSON FOR JOSÉ PHILIPE:");
  console.log(data ? JSON.stringify(JSON.parse(data.observation), null, 2) : "NOT FOUND");
}

run();
