import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const schoolId = 'a8c60061-482c-4ba9-bd8f-261147144333';
  
  console.log("1. Buscando escola original...");
  const { data: school, error: fetchErr } = await supabase
    .from('schools')
    .select('name')
    .eq('id', schoolId)
    .single();
    
  if (fetchErr) {
    console.error("Erro ao buscar escola:", fetchErr);
    return;
  }
  
  const originalName = school.name;
  console.log(`Nome original: "${originalName}"`);
  
  const testName = `${originalName} (Test Realtime)`;
  console.log(`2. Atualizando nome da escola para: "${testName}"...`);
  const { error: updateErr1 } = await supabase
    .from('schools')
    .update({ name: testName })
    .eq('id', schoolId);
    
  if (updateErr1) {
    console.error("Erro no primeiro update:", updateErr1);
    return;
  }
  
  console.log("Primeiro update concluído com sucesso!");
  
  // Aguarda 2 segundos para o realtime propagar e então restaura o nome original
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`3. Restaurando nome original da escola para: "${originalName}"...`);
  const { error: updateErr2 } = await supabase
    .from('schools')
    .update({ name: originalName })
    .eq('id', schoolId);
    
  if (updateErr2) {
    console.error("Erro ao restaurar nome original:", updateErr2);
    return;
  }
  
  console.log("Restauração de nome concluída com sucesso! Teste de Realtime finalizado.");
}

run();
