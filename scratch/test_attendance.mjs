import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Simulating teacher taisprof@altivocesar.com login...");
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'taisprof@altivocesar.com')
    .maybeSingle();

  if (userError || !user) {
    console.error("Error finding teacher Tais:", userError);
    return;
  }

  console.log("Teacher found:", { name: user.name, id: user.id });

  // Get a student from her school or any student in the db
  console.log("Looking up students...");
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('*')
    .limit(5);

  if (studentError) {
    console.error("Error finding students:", studentError);
    return;
  }

  console.log("Students found in DB:", students.map(s => ({ id: s.id, name: s.name, school_id: s.school_id, schoolId: s.schoolId })));

  if (!students || students.length === 0) {
    console.error("No students found in the database.");
    return;
  }

  const student = students[0];
  console.log("Testing with student:", student.name, "ID:", student.id);

  const today = new Date().toISOString().split('T')[0];
  const recordToSave = {
    student_id: student.id,
    date: today,
    record_type: 'presenca',
    value: 'presente',
    observation: 'Teste automatizado de presenca',
    created_by: user.id, // Using user.id as corrected in App.tsx
    shift: 'Manhã'
  };

  console.log("Attempting to insert/upsert into student_records:", recordToSave);
  
  const { data, error } = await supabase
    .from('student_records')
    .upsert([recordToSave], {
      onConflict: 'student_id,date,record_type,shift'
    })
    .select();

  if (error) {
    console.error("TEST FAILED: Error inserting attendance:", error.message);
  } else {
    console.log("TEST SUCCESSFUL! Attendance registered perfectly:", data);
  }
}

run();
