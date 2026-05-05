import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const adminClient = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Validar JWT manualmente para contornar o erro do API Gateway
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Token JWT não fornecido');
    }
    
    const { data: { user: jwtUser }, error: jwtError } = await adminClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (jwtError || !jwtUser) {
      throw new Error('Não autorizado (JWT inválido ou expirado)');
    }

    const { email, password, name, school_id, municipio_id, role } = await req.json();
    console.log(`[upsert-user] Processando ${email} para role ${role} by user ${jwtUser.id}`);

    if (!email || !role) throw new Error('Email e role são obrigatórios');

    // 1. Gerenciar Supabase Auth
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    let authUser = usersData?.users?.find(u => u.email === email);
    let authUserId: string;

    if (authUser) {
      console.log(`[upsert-user] Atualizando Auth User ${email}`);
      const updatePayload: any = {
        user_metadata: { name, role, school_id, municipio_id }
      };
      if (password) updatePayload.password = password;
      const { data: updated, error } = await adminClient.auth.admin.updateUserById(authUser.id, updatePayload);
      if (error) throw error;
      authUserId = updated.user!.id;
    } else {
      console.log(`[upsert-user] Criando Auth User ${email}`);
      const { data: created, error } = await adminClient.auth.admin.createUser({
        email,
        password: password || 'Mudar@123',
        email_confirm: true,
        user_metadata: { name, role, school_id, municipio_id }
      });
      if (error) throw error;
      authUserId = created.user!.id;
    }

    console.log(`[upsert-user] Persistindo em public.users com crypt()`);
    
    const { data: upsertedResult, error: upsertErr } = await adminClient.rpc('execute_user_upsert', {
      p_auth_id: authUserId,
      p_name: name || 'Usuário',
      p_email: email,
      p_role: role,
      p_school_id: school_id || null,
      p_municipio_id: municipio_id || null,
      p_password: password || null
    });

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ success: true, user: upsertedResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err: any) {
    console.error(`[upsert-user] Erro: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
