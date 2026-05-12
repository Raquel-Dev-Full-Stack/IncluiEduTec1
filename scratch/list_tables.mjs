import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk1MjEsImV4cCI6MjA4NTQyNTUyMX0.pRC7Z9GG8bjt2Ve9Y2vhJG7mgaz76k6Qh1YVqfgNR6U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist, but let's try a direct query
  
  // Try a common way to list tables in Postgres if RPC fails
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (tableError) {
    console.error('Error fetching tables:', tableError);
    // Fallback: try to select from 'users' again but without filter
    const { data: users } = await supabase.from('users').select('count');
    console.log('Users count:', users);
  } else {
    console.log('Tables:', JSON.stringify(tables, null, 2));
  }
}

check();
