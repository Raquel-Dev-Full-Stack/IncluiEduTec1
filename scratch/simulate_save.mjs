import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env', 'utf-8').split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateSave() {
    const currentSchoolId = '00000000-0000-0000-0000-000000000000'; // Dummy ID
    
    console.log('Simulating classes upsert...');
    const classesToInsert = [{
        name: '101',
        level: 'Fundamental 1',
        shift: 'Manhã',
        school_id: currentSchoolId
    }];
    const { error: classError } = await supabase.from('classes').upsert(classesToInsert, { onConflict: 'name,school_id' });
    if (classError) console.log('Classes Error:', classError.message);
    else console.log('Classes: OK (or FK error which is fine)');

    console.log('\nSimulating students upsert...');
    const studentsToInsert = [{
        name: 'Fernando',
        ra: '0123456',
        school_id: currentSchoolId,
        class_id: null,
        active: true
    }];
    const { error: studentError } = await supabase.from('students').upsert(studentsToInsert, { onConflict: 'ra' });
    if (studentError) console.log('Students Error:', studentError.message);
    else console.log('Students: OK (or FK error which is fine)');
}

simulateSave();
