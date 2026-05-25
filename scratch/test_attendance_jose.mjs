import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Simulating teacher taisprof@altivocesar.com login...");
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'taisprof@altivocesar.com')
    .maybeSingle();

  console.log("Teacher found:", { name: user.name, id: user.id });

  // Look up student José Philipe
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('name', 'José Philipe')
    .maybeSingle();

  console.log("José Philipe found:", { name: students.name, id: students.id });

  const today = new Date().toISOString().split('T')[0];
  const recordToSave = {
    student_id: students.id,
    date: today,
    record_type: 'presenca',
    value: 'presente',
    observation: 'Teste de presenca para Jose Philipe',
    created_by: user.id, // Using user.id as corrected in App.tsx
    shift: 'Manhã'
  };

  console.log("Attempting to insert/upsert into student_records for Jose Philipe:", recordToSave);
  
  const { data, error } = await supabase
    .from('student_records')
    .upsert([recordToSave], {
      onConflict: 'student_id,date,record_type,shift'
    })
    .select();

  if (error) {
    console.error("TEST FAILED: Error inserting attendance for Jose Philipe:", error.message);
  } else {
    console.log("TEST SUCCESSFUL! Attendance registered perfectly for Jose Philipe:", data);
  }
}

run();
