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

async function testUserConstraint() {
    console.log('Testing users constraints...');
    const combos = [
        'name,school_id',
        'name,municipio_id,school_id',
        'email',
        'auth_user_id'
    ];

    for (const c of combos) {
        const { error } = await supabase.from('users').upsert([{}], { onConflict: c });
        if (error && error.message.includes('unique or exclusion constraint')) {
            console.log(`[FAIL] ${c}`);
        } else {
            console.log(`[SUCCESS/OTHER] ${c}: ${error ? error.message.substring(0, 30) : 'OK'}`);
        }
    }
}

testUserConstraint();
