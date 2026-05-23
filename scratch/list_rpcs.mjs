async function run() {
  const supabaseUrl = 'https://njquazlszkqfzkybifsu.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcXVhemxzemtxZnpreWJpZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTUyMSwiZXhwIjoyMDg1NDI1NTIxfQ.SIEtXNW-iulID42gH1zJCDL8wBO6uAPj1JPnkNK1ZFE';

  const url = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const schema = await response.json();
  console.log("FUNÇÕES / RPCS DISPONÍVEIS:");
  if (schema.paths) {
    const rpcs = Object.keys(schema.paths).filter(path => path.startsWith('/rpc/'));
    console.log(rpcs);
    
    // Ver definições de alguns rpc interessantes se houver
    rpcs.forEach(rpc => {
      console.log(`\nRPC: ${rpc}`);
      console.log(JSON.stringify(schema.paths[rpc], null, 2));
    });
  } else {
    console.log("Não foi possível listar os paths do schema.");
  }
}

run();
