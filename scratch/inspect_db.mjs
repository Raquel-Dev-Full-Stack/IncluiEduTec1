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

async function inspectTable(tableName) {
    console.log(`\nInspecting table: ${tableName}`);
    // Try to get a single row to see columns
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.log(`Error reading ${tableName}: ${error.message}`);
        return;
    }
    const cols = data && data.length > 0 ? Object.keys(data[0]) : 'unknown';
    console.log(`Columns: ${cols}`);

    // Try various onConflict to see what works
    const combinations = [
        'id',
        'name',
        'email',
        'ra',
        'name,school_id',
        'email,school_id',
        'name,municipio_id',
        'auth_user_id'
    ];

    for (const combo of combinations) {
        // Skip combos with missing columns
        const needed = combo.split(',');
        if (cols !== 'unknown' && !needed.every(c => cols.includes(c))) continue;

        const { error: upsertErr } = await supabase.from(tableName).upsert([{}], { onConflict: combo });
        if (upsertErr) {
            if (upsertErr.message.includes('unique or exclusion constraint')) {
                // Not a constraint
            } else {
                console.log(`[VALID CONSTRAINT] ${combo} (Proceeded with: ${upsertErr.message.substring(0, 50)}...)`);
            }
        } else {
            console.log(`[VALID CONSTRAINT] ${combo} (Success)`);
        }
    }
}

async function main() {
    await inspectTable('users');
    await inspectTable('classes');
    await inspectTable('students');
}

main();
