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

async function testWrongConflict() {
    console.log('Testing wrong conflict...');
    const { error } = await supabase.from('students').upsert([{}], { onConflict: 'ra,name' });
    if (error) {
        console.log('Error message:', error.message);
    }
}

testWrongConflict();
