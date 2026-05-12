
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function checkUser() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'secretarianiteroi@teste.com').single();
  console.log('User:', JSON.stringify(user, null, 2));
  
  if (user && user.municipio_id) {
    const { data: schools } = await supabase.from('schools').select('*').eq('municipio_id', user.municipio_id);
    console.log('Schools in Municipio:', schools.length);
    schools.forEach(s => console.log(`- ${s.name} (${s.id})`));
    
    const { data: students } = await supabase.from('students').select('*').in('school_id', schools.map(s => s.id));
    console.log('Students in Municipio:', students.length);
    
    const { data: records } = await supabase.from('student_records').select('*').in('student_id', students.map(s => s.id));
    console.log('Records for these students:', records.length);
  }
}

checkUser();
