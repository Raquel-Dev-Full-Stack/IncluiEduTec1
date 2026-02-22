<template>
  <div class="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <!-- Cabeçalho -->
    <header>
      <h1 class="text-2xl font-bold text-gray-800">Canal de Comunicação Direta</h1>
      <p class="text-gray-500 text-sm">Envio formal de documentos e relatórios para a Secretaria de Educação.</p>
    </header>

    <!-- Formulário de Envio -->
    <div class="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
      <div class="p-8 space-y-8">
        <h2 class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
          <i class="fa-solid fa-paper-plane"></i>
          Enviar Novo Relatório
        </h2>

        <form @submit.prevent="sendReport" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Título -->
            <div class="flex flex-col space-y-2">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título do Relatório</label>
              <input 
                v-model="form.title" 
                type="text" 
                required 
                placeholder="Ex: Relatório Mensal de Merenda"
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            <!-- Data -->
            <div class="flex flex-col space-y-2">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data do Documento</label>
              <input 
                v-model="form.date" 
                type="date" 
                required
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="flex flex-col space-y-2">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conteúdo / Descrição Detalhada</label>
            <textarea 
              v-model="form.content" 
              rows="8" 
              required
              placeholder="Descreva aqui o conteúdo do relatório ou anexe informações relevantes..."
              class="px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-sm"
            ></textarea>
          </div>

          <!-- Status / Categoria -->
          <div class="flex flex-col space-y-2">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status / Prioridade</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" v-model="form.status" value="Pendente" class="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span class="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-600 transition-colors">Normal</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="radio" v-model="form.status" value="Urgente" class="w-4 h-4 text-rose-600 focus:ring-rose-500" />
                <span class="text-[10px] font-black uppercase text-gray-400 group-hover:text-rose-600 transition-colors text-rose-400">Urgente</span>
              </label>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              @click="resetForm" 
              class="px-6 py-3 text-gray-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Limpar Campos
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fa-solid fa-circle-notch animate-spin"></i>
              <i v-else class="fa-solid fa-paper-plane"></i>
              {{ loading ? 'Enviando...' : 'Enviar para Secretaria' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Informativo -->
    <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
      <i class="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
      <div class="space-y-1">
        <p class="text-xs font-bold text-blue-800">Informações de Protocolo</p>
        <p class="text-[10px] text-blue-600 leading-relaxed">
          Ao enviar este relatório, ele será automaticamente protocolado no sistema da Secretaria de Educação. 
          Você poderá acompanhar o status da análise através do histórico de envios da sua unidade escolar.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const loading = ref(false);

const form = reactive({
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  status: 'Pendente'
});

const resetForm = () => {
  if (confirm('Deseja limpar todos os dados digitados?')) {
    form.title = '';
    form.content = '';
    form.date = new Date().toISOString().split('T')[0];
    form.status = 'Pendente';
  }
};

const sendReport = async () => {
  loading.value = true;
  
  // Estrutura para envio ao Supabase
  try {
    const reportPayload = {
      title: form.title,
      content: form.content,
      date: form.date,
      status: form.status,
      director: 'Ana Souza', // Idealmente viria do estado global do usuário
      school: 'Escola Municipal Joana Benedicta Rangel', // Idealmente viria do estado global do usuário
      created_at: new Date().toISOString()
    };

    console.log('Enviando para o Supabase:', reportPayload);

    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    /*
    const { data, error } = await supabase
      .from('reports')
      .insert([reportPayload]);
    
    if (error) throw error;
    */

    alert('Relatório enviado com sucesso à Secretaria de Educação!');
    
    // Reset após sucesso
    form.title = '';
    form.content = '';
  } catch (err) {
    alert('Erro ao enviar relatório. Verifique sua conexão.');
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>