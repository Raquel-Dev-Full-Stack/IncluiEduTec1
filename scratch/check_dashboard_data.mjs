
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  const { data: schools } = await supabase.from('schools').select('*');
  const { data: students } = await supabase.from('students').select('*');
  const { data: users } = await supabase.from('users').select('*');

  console.log('Schools:', schools.length);
  schools.forEach(school => {
    const studentsInSchool = students.filter(s => s.school_id === school.id).length;
    const mediatorsInSchool = users.filter(u => u.role === 'mediador' && u.active && u.school_id === school.id).length;
    const ratio = mediatorsInSchool > 0 ? (studentsInSchool / mediatorsInSchool) : studentsInSchool;
    console.log(`School: ${school.name}, Students: ${studentsInSchool}, Mediators: ${mediatorsInSchool}, Ratio: ${ratio.toFixed(1)}`);
  });
}

checkData();
