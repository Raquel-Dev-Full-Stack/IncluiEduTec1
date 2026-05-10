
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envVars = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    acc[key] = value;
  }
  return acc;
}, {});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function findFunctions() {
  console.log('Searching for upsert functions...');
  
  // We can't run arbitrary SQL, but we can try to guess names or use a metadata RPC if it exists.
  // Let's try to call execute_user_upsert with minimal params to see if it exists and what error it gives.
  
  const names = ['execute_user_upsert', 'execute_user_upsert_v2', 'execute_user_upsert_v3'];
  for (const name of names) {
      try {
          const { data, error } = await supabase.rpc(name, {
              p_auth_id: '00000000-0000-0000-0000-000000000000',
              p_name: 'test',
              p_email: 'test@example.com',
              p_role: 'mediador',
              p_school_id: null,
              p_municipio_id: null,
              p_password: null
          });
          if (error) {
              console.log(`Function ${name} error:`, error.message, 'Code:', error.code);
          } else {
              console.log(`Function ${name} SUCCESS! Return data:`, JSON.stringify(data));
          }
      } catch (e) {
          console.log(`Function ${name} critical error:`, e.message);
      }
  }
}

findFunctions();
