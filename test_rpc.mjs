import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envVars = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  await supabase.auth.signInWithPassword({
    email: 'admingeral@demo.com',
    password: '12345'
  });
  
  const { data: secs, error } = await supabase.from('users').select('*').eq('role', 'secretaria');
  console.log('Secretarias encontradas:', secs.length);
  for (const sec of secs) {
     if (!sec.auth_user_id) {
         console.log('Deleting zombie user:', sec.name);
         await supabase.from('users').delete().eq('id', sec.id);
     }
  }
}

test();
