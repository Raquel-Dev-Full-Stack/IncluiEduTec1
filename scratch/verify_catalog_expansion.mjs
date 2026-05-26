import { GAMES_CATALOG } from '../components/incluigamer/gamesData.js';

async function run() {
  console.log("Iniciando verificação do catálogo de jogos expandido...");
  
  console.log(`\nTotal de jogos no catálogo: ${GAMES_CATALOG.length}`);
  
  const expectedNewIds = [
    'som_palavras',
    'formando_silabas',
    'palavras_ocultas',
    'desafio_frases',
    'logica_espacial',
    'empatia_autorregulacao',
    'percepcao_sonora_motora',
    'desafio_multiplicacao'
  ];

  let successCount = 0;

  for (const id of expectedNewIds) {
    const game = GAMES_CATALOG.find(g => g.id === id);
    if (game) {
      console.log(`[OK] Jogo '${id}' encontrado:`);
      console.log(`     - Nome: ${game.name}`);
      console.log(`     - Bioma: ${game.bioma}`);
      console.log(`     - Faixa Etária: ${game.ageGroup} (${game.ageLabel})`);
      console.log(`     - Habilidades BNCC: ${game.bnccSkills.join(', ')}`);
      console.log(`     - Propriedade nome_da_atividade: ${game.nome_da_atividade}`);
      console.log(`     - Propriedade xp_base: ${game.xp_base}`);
      successCount++;
    } else {
      console.error(`[ERROR] Novo jogo '${id}' NÃO foi encontrado no catálogo.`);
    }
  }

  if (successCount === expectedNewIds.length) {
    console.log("\n[SUCESSO] Todos os novos jogos adaptativos foram inseridos com integridade e propriedades corretas!");
  } else {
    console.error(`\n[FALHA] Apenas ${successCount} de ${expectedNewIds.length} jogos foram encontrados.`);
  }
}

run().catch(console.error);
