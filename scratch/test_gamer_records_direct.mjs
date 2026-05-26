import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE'; // service_role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Iniciando teste de conexão e tabelas...");
  
  // Testar conexão
  const { data: userData, error: userError } = await supabase.from('users').select('id').limit(1);
  if (userError) {
    console.error("Erro ao conectar com o Supabase:", userError.message);
    return;
  }
  console.log("Conectado com sucesso ao Supabase!");

  // Testar existência de gamer_records
  const { data: recData, error: recError } = await supabase.from('gamer_records').select('*').limit(1);
  if (recError) {
    console.log(`\nTabela 'gamer_records' não encontrada ou não pôde ser lida: ${recError.message}`);
    console.log("Lembre-se de que é necessário executar o script SQL de migração no painel do Supabase para criar a tabela.");
  } else {
    console.log(`\nTabela 'gamer_records' EXISTE e está pronta para uso! Registros encontrados: ${recData.length}`);
  }
}

run();
