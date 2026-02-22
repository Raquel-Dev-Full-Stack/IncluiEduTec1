<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Cabeçalho com Ações Principais -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Elaboração de Plano de Aula</h1>
        <p class="text-gray-500 text-sm">Vincule competências da BNCC e personalize suas estratégias de ensino.</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="cancelar" 
          class="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
        >
          Cancelar
        </button>
        <button 
          @click="salvarPlano" 
          class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <i class="fa-solid fa-save"></i>
          Salvar Plano
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Coluna de Configuração do Plano (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
          
          <!-- Campo: Tema da Aula -->
          <div class="flex flex-col space-y-2">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tema da Aula</label>
            <input 
              v-model="temaAula" 
              type="text" 
              placeholder="Ex: Explorando Frações no Cotidiano"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <!-- Visualização de Habilidades Selecionadas -->
          <div class="flex flex-col space-y-3">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Habilidades Vinculadas ({{ selectedCodes.length }})</label>
            <div class="min-h-[140px] p-5 border-2 border-dashed border-gray-200 rounded-2xl flex flex-wrap gap-2 content-start bg-gray-50/30">
              <div v-if="selectedCodes.length === 0" class="w-full py-8 text-center text-gray-400 text-xs italic flex flex-col items-center gap-2">
                <i class="fa-solid fa-layer-group text-2xl opacity-20"></i>
                Nenhuma habilidade selecionada. Utilize o buscador lateral para vincular itens.
              </div>
              <div 
                v-for="code in selectedCodes" 
                :key="code"
                class="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-[10px] font-black border border-blue-100 group animate-in zoom-in-95 duration-200"
              >
                <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[8px]">{{ code }}</span>
                <span class="max-w-[200px] truncate" :title="getSkillDescription(code)">{{ getSkillDescription(code) }}</span>
                <button @click="removeSkill(code)" class="text-blue-300 hover:text-rose-500 transition-colors ml-1">
                  <i class="fa-solid fa-circle-xmark text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Campo: Adaptações Metodológicas -->
          <div class="flex flex-col space-y-2">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adaptações para Metodologia Ativa</label>
            <textarea 
              v-model="adaptacoes" 
              rows="6" 
              placeholder="Descreva aqui os recursos pedagógicos, tecnologias assistivas e estratégias de diferenciação..."
              class="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-sm"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-start">
          <button 
            @click="limparCampos" 
            class="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            <i class="fa-solid fa-broom"></i>
            Limpar Campos
          </button>
        </div>
      </div>

      <!-- Coluna de Seleção BNCC (1/3) -->
      <div class="space-y-4">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
          <h3 class="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-blue-500"></i>
            Repositório BNCC
          </h3>
          
          <!-- Campo de Busca Reativa -->
          <div class="relative mb-6">
            <input 
              v-model="busca" 
              type="text" 
              placeholder="Buscar por código, descrição ou componente..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
            <i class="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
          </div>

          <!-- Listagem Dinâmica -->
          <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <div 
              v-for="item in filteredBNCC" 
              :key="item.codigo"
              @click="toggleCode(item.codigo)"
              class="p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden"
              :class="selectedCodes.includes(item.codigo) ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-md'"
            >
              <div class="flex items-start gap-3 relative z-10">
                <input 
                  type="checkbox" 
                  v-model="selectedCodes" 
                  :value="item.codigo" 
                  @click.stop
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <div class="space-y-2 flex-1">
                  <div class="flex justify-between items-center">
                    <span class="text-[9px] font-black px-2 py-0.5 rounded tracking-tighter" :class="selectedCodes.includes(item.codigo) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'">
                      {{ item.codigo }}
                    </span>
                  </div>
                  <p class="text-[11px] font-semibold text-gray-600 leading-relaxed truncate group-hover:whitespace-normal transition-all">
                    {{ item.descricao }}
                  </p>
                  <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                    {{ item.componente }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Estado Vazio da Busca -->
            <div v-if="filteredBNCC.length === 0" class="py-16 text-center">
              <i class="fa-solid fa-magnifying-glass-chart text-gray-100 text-5xl mb-3"></i>
              <p class="text-gray-400 text-xs italic px-4">Não encontramos resultados para sua busca.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import bnccData from './bncc.json'; // Fonte dinâmica única de dados

// Estados Reativos (v-model)
const temaAula = ref('');
const adaptacoes = ref('');
const selectedCodes = ref([]);
const busca = ref('');

// Lógica de filtragem reativa baseada no input de busca (código, descrição ou componente)
const filteredBNCC = computed(() => {
  const query = busca.value.toLowerCase().trim();
  if (!query) return bnccData;
  return bnccData.filter(item => 
    item.codigo.toLowerCase().includes(query) ||
    item.descricao.toLowerCase().includes(query) ||
    item.componente.toLowerCase().includes(query)
  );
});

// Helper para obter a descrição curta de um código selecionado
const getSkillDescription = (code) => {
  const skill = bnccData.find(s => s.codigo === code);
  return skill ? skill.descricao : '';
};

// Alternar seleção de um código na lista (click no card)
const toggleCode = (code) => {
  const index = selectedCodes.value.indexOf(code);
  if (index > -1) {
    selectedCodes.value.splice(index, 1);
  } else {
    selectedCodes.value.push(code);
  }
};

// Remover habilidade específica da seleção (click no X)
const removeSkill = (code) => {
  selectedCodes.value = selectedCodes.value.filter(c => c !== code);
};

// Resetar todo o formulário (Limpar Campos)
const limparCampos = () => {
  if (confirm('Deseja realmente limpar todas as informações deste planejamento?')) {
    temaAula.value = '';
    adaptacoes.value = '';
    selectedCodes.value = [];
    busca.value = '';
  }
};

// Ação do botão Cancelar
const cancelar = () => {
  if (confirm('Deseja descartar as alterações?')) {
    alert('Operação cancelada.');
  }
};

// Finalizar e montar objeto para persistência no Supabase
const salvarPlano = () => {
  if (!temaAula.value) {
    alert('O Tema da Aula é obrigatório para salvar o plano.');
    return;
  }
  if (selectedCodes.value.length === 0) {
    alert('Selecione ao menos uma habilidade da BNCC para prosseguir.');
    return;
  }

  // Objeto estruturado pronto para envio ao Supabase
  const planoFinalizado = {
    tema_aula: temaAula.value,
    adaptacoes_metodologia: adaptacoes.value,
    habilidades: selectedCodes.value.map(code => {
      const item = bnccData.find(b => b.codigo === code);
      return {
        codigo: item.codigo,
        descricao: item.descricao,
        componente: item.componente
      };
    }),
    criado_em: new Date().toISOString()
  };

  console.log('Payload pronto para o Supabase:', planoFinalizado);
  alert('Plano de aula salvo com sucesso e vinculado à BNCC!');
};
</script>

<style scoped>
/* Estilização da scrollbar lateral */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Animações simples de entrada */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
