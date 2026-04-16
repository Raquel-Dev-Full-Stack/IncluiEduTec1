import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users, error } = await supabase.from('users').select('*').limit(2);
  console.log('users:', users, error);

  if (users && users.length > 0) {
    const userId = users[0].id;
    console.log('Testing RPC for user', userId);
    const { error: rpcError } = await supabase.rpc('admin_update_user_credentials', {
      p_user_id: userId,
      p_new_email: 'test@test.com',
      p_new_password: null
    });
    console.log('RPC error:', rpcError);
  }
}

test();
