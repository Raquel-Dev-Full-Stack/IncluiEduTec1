import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Use a query that will definitely fail if the table doesn't have the column, 
  // but let's try to get the column list from a successful select * if possible
  // Since it's empty, we'll try to insert a row with many potential columns and see the error
  const { error } = await supabase.from('relatorios').insert({ 
    test_col: 1,
    student_id: 'test',
    aluno_id: 'test',
    school_id: 'test',
    escola_id: 'test'
  });
  
  if (error) {
    console.log(error.message);
  }
}

run();
