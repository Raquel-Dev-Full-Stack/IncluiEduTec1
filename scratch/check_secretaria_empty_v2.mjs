
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'secretarianiteroi@teste.com').maybeSingle();
  console.log('User:', JSON.stringify(user, null, 2));
  
  if (user && user.municipio_id) {
    const { data: schools } = await supabase.from('schools').select('*').eq('municipio_id', user.municipio_id);
    console.log('Schools in Municipio:', schools?.length || 0);
    schools?.forEach(s => console.log(`- ${s.name} (${s.id})`));
    
    if (schools && schools.length > 0) {
        const { data: students } = await supabase.from('students').select('*').in('school_id', schools.map(s => s.id));
        console.log('Students in Municipio:', students?.length || 0);
        
        if (students && students.length > 0) {
            const { data: records } = await supabase.from('student_records').select('*').in('student_id', students.map(s => s.id));
            console.log('Records for these students:', records?.length || 0);
        }
    }
  }
}

checkUser();
