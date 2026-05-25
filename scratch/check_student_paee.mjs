import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const studentId = 'dd76da72-b04c-4140-b6f6-799f7c568471'; // José Philipe

  console.log("Checking all student_records for student José Philipe...");
  const { data, error } = await supabase
    .from('student_records')
    .select('*')
    .eq('student_id', studentId);

  if (error) {
    console.error("Error fetching records:", error);
    return;
  }

  console.log("Found", data.length, "records:");
  data.forEach(r => {
    console.log(`- Type: ${r.record_type}, Value: ${r.value}, Date: ${r.date}, ID: ${r.id}`);
    if (r.record_type === 'PAEE') {
      console.log("  Observation sample:", r.observation.substring(0, 200) + "...");
    }
  });
}

run();
