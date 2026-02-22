<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Cabeçalho -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Painel da Secretaria</h1>
        <p class="text-gray-500 text-sm">Gestão educacional e comunicação direta com a rede.</p>
      </div>
      <div class="flex gap-2">
        <div class="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
          <i class="fa-solid fa-building-columns text-blue-500"></i>
          <span class="text-xs font-black text-blue-800 uppercase tracking-tighter">{{ userMunicipality }}</span>
        </div>
      </div>
    </header>

    <!-- Navegação por Abas -->
    <div class="flex border-b border-gray-200">
      <button 
        @click="activeTab = 'reports'" 
        class="px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2"
        :class="activeTab === 'reports' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        <i class="fa-solid fa-file-lines mr-2"></i> Relatórios Recebidos
      </button>
      <button 
        @click="activeTab = 'messages'" 
        class="px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative"
        :class="activeTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        <i class="fa-solid fa-comments mr-2"></i> Mensagens
        <span v-if="unreadCount > 0" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>

    <!-- Conteúdo da Aba: Relatórios Recebidos -->
    <section v-if="activeTab === 'reports'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-50 bg-gray-50/30">
        <h2 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <i class="fa-solid fa-filter text-blue-500"></i>
          Filtros de Busca
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="flex flex-col space-y-1">
            <label class="text-[9px] font-bold text-gray-400 uppercase">Escola</label>
            <select v-model="filters.school" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Todas as Escolas</option>
              <option v-for="school in schools" :key="school" :value="school">{{ school }}</option>
            </select>
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-[9px] font-bold text-gray-400 uppercase">Diretor</label>
            <input v-model="filters.director" type="text" placeholder="Nome do Diretor" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-[9px] font-bold text-gray-400 uppercase">Status</label>
            <select v-model="filters.status" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-[9px] font-bold text-gray-400 uppercase">Data Inicial</label>
            <input v-model="filters.dateStart" type="date" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-[9px] font-bold text-gray-400 uppercase">Data Final</label>
            <input v-model="filters.dateEnd" type="date" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
              <th class="px-6 py-4">Relatório</th>
              <th class="px-6 py-4">Diretor</th>
              <th class="px-6 py-4">Unidade Escolar</th>
              <th class="px-6 py-4 text-center">Data</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 bg-white">
            <tr v-for="report in filteredReports" :key="report.id" class="hover:bg-blue-50/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-gray-800">{{ report.title }}</span>
                  <span class="text-[9px] text-gray-400 font-medium">ID: {{ report.id.substring(0,8) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-medium text-gray-600">{{ report.director }}</td>
              <td class="px-6 py-4 text-xs font-bold text-blue-600">{{ report.school }}</td>
              <td class="px-6 py-4 text-center text-xs font-medium text-gray-500">
                {{ new Date(report.date).toLocaleDateString('pt-BR') }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-1 rounded-full text-[9px] font-black uppercase border"
                  :class="{
                    'bg-amber-50 text-amber-600 border-amber-100': report.status === 'Pendente',
                    'bg-blue-50 text-blue-600 border-blue-100': report.status === 'Em Análise',
                    'bg-emerald-50 text-emerald-600 border-emerald-100': report.status === 'Arquivado'
                  }"
                >
                  {{ report.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredReports.length === 0" class="py-20 text-center space-y-4">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 text-3xl">
            <i class="fa-solid fa-folder-open"></i>
          </div>
          <p class="text-gray-400 text-xs italic font-medium">Nenhum relatório encontrado para os filtros selecionados.</p>
        </div>
      </div>
    </section>

    <!-- Conteúdo da Aba: Mensagens -->
    <section v-if="activeTab === 'messages'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
      <!-- Painel de Envio (Tabela: mensagens) -->
      <div class="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
        <h2 class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <i class="fa-solid fa-paper-plane"></i>
          Enviar Mensagem (Tabela Mensagens)
        </h2>
        
        <form @submit.prevent="sendMessage" class="space-y-4">
          <div class="flex flex-col space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destinatário (Diretor)</label>
            <select v-model="messageForm.destinatario_id" required class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner">
              <option value="">Selecione um Diretor...</option>
              <option v-for="director in directors" :key="director.id" :value="director.id">
                {{ director.name }} - {{ director.school }}
              </option>
            </select>
          </div>
          
          <div class="flex flex-col space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conteúdo</label>
            <textarea 
              v-model="messageForm.conteudo" 
              required
              rows="5" 
              placeholder="Digite sua mensagem institucional..."
              class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-sm"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-paper-plane"></i>
            Enviar
          </button>
        </form>
      </div>

      <!-- Histórico de Conversas (Tabela: conversas) -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
        <div class="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <i class="fa-solid fa-history text-blue-500"></i>
            Histórico de Conversas (Município: {{ userMunicipalityId }})
          </h2>
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Ordem Cronológica ASC</span>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 custom-scrollbar">
          <div v-if="filteredConversas.length === 0" class="py-20 text-center space-y-4">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 text-3xl">
              <i class="fa-solid fa-message"></i>
            </div>
            <p class="text-gray-400 text-xs italic font-medium">Nenhuma mensagem encontrada para este município.</p>
          </div>

          <div 
            v-for="msg in filteredConversas" 
            :key="msg.id" 
            class="flex flex-col animate-in slide-in-from-left-4 duration-300"
            :class="msg.remetente_id === secretaryId ? 'items-end' : 'items-start'"
          >
            <div 
              class="max-w-[85%] p-4 rounded-2xl shadow-sm border relative group transition-all"
              :class="msg.remetente_id === secretaryId ? 'bg-blue-600 border-blue-700 text-white rounded-tr-none' : 'bg-white border-gray-100 text-gray-700 rounded-tl-none hover:shadow-md'"
            >
              <div class="flex justify-between items-start mb-1 gap-4">
                <span class="text-[9px] font-black uppercase tracking-tighter opacity-70">
                  De: {{ msg.remetente_email }}
                </span>
                <span class="text-[8px] font-medium opacity-60">
                  {{ new Date(msg.data_envio).toLocaleString('pt-BR') }}
                </span>
              </div>
              <p class="text-xs font-medium leading-relaxed">{{ msg.conteudo }}</p>
              
              <!-- Footer da Mensagem -->
              <div class="mt-2 flex items-center justify-between border-t border-current border-opacity-10 pt-2">
                <span class="text-[8px] font-bold uppercase tracking-widest opacity-60">
                  Para: {{ msg.destinatario_email }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-if="msg.lido" class="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-emerald-400/20 px-1.5 rounded text-emerald-200">
                    <i class="fa-solid fa-check-double"></i> Lido
                  </span>
                  <button 
                    v-if="!msg.lido && msg.remetente_id !== secretaryId" 
                    @click="markAsRead(msg.id)"
                    class="text-[8px] font-black uppercase tracking-widest bg-amber-400 hover:bg-amber-500 text-white px-2 py-1 rounded-md transition-all shadow-sm active:scale-95"
                  >
                    Marcar como lida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// --- CONFIGURAÇÕES DE IDENTIDADE ---
const secretaryId = 'sec_01';
const secretaryEmail = 'secretaria@marica.rj.gov.br';
const userMunicipalityId = 'mun_01';
const userMunicipality = 'Maricá - RJ';

// --- ESTADOS ---
const activeTab = ref('reports');

// Mock de Diretores
const directors = [
  { id: 'dir_01', name: 'Ana Souza', school: 'E.M. Joana Benedicta Rangel', email: 'ana.direcao@escola.br' },
  { id: 'dir_02', name: 'Carlos Lima', school: 'C.E.M. Felisberto Rodrigues', email: 'carlos.direcao@escola.br' }
];

// Mock da tabela "conversas"
const conversas = ref([
  { 
    id: 1, 
    remetente_id: 'dir_01', 
    remetente_email: 'ana.direcao@escola.br', 
    destinatario_id: 'sec_01', 
    destinatario_email: 'secretaria@marica.rj.gov.br', 
    conteudo: 'Bom dia. Gostaríamos de solicitar reforço na medição para o 3º ano.', 
    data_envio: '2024-06-14T09:00:00Z', 
    lido: false, 
    municipio_id: 'mun_01' 
  },
  { 
    id: 2, 
    remetente_id: 'sec_01', 
    remetente_email: 'secretaria@marica.rj.gov.br', 
    destinatario_id: 'dir_01', 
    destinatario_email: 'ana.direcao@escola.br', 
    conteudo: 'Recebido, Ana. Analisaremos o quadro de funcionários na próxima segunda.', 
    data_envio: '2024-06-14T10:30:00Z', 
    lido: true, 
    municipio_id: 'mun_01' 
  },
  { 
    id: 3, 
    remetente_id: 'dir_02', 
    remetente_email: 'carlos.direcao@escola.br', 
    destinatario_id: 'sec_01', 
    destinatario_email: 'secretaria@marica.rj.gov.br', 
    conteudo: 'Relatório de merenda escolar disponível para conferência.', 
    data_envio: '2024-06-15T14:00:00Z', 
    lido: false, 
    municipio_id: 'mun_01' 
  }
]);

const messageForm = reactive({
  destinatario_id: '',
  conteudo: ''
});

// --- LÓGICA DE RELATÓRIOS ---
const schools = [
  'Escola Municipal Joana Benedicta Rangel',
  'C.E.M. Felisberto Rodrigues da Cunha',
  'E.M. Darcy Ribeiro'
];

const reports = ref([
  { id: 'rep_01', title: 'Relatório Trimestral AEE', director: 'Ana Souza', school: 'Escola Municipal Joana Benedicta Rangel', status: 'Pendente', date: '2024-06-10' },
  { id: 'rep_02', title: 'Manutenção Predial - Bloco B', director: 'Carlos Lima', school: 'C.E.M. Felisberto Rodrigues da Cunha', status: 'Em Análise', date: '2024-06-12' },
]);

const filters = reactive({
  school: '', director: '', status: '', dateStart: '', dateEnd: ''
});

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    const matchSchool = !filters.school || r.school === filters.school;
    const matchDirector = !filters.director || r.director.toLowerCase().includes(filters.director.toLowerCase());
    const matchStatus = !filters.status || r.status === filters.status;
    const matchDateStart = !filters.dateStart || r.date >= filters.dateStart;
    const matchDateEnd = !filters.dateEnd || r.date <= filters.dateEnd;
    return matchSchool && matchDirector && matchStatus && matchDateStart && matchDateEnd;
  });
});

// --- LÓGICA DE MENSAGENS (Tabela Conversas) ---
const filteredConversas = computed(() => {
  return conversas.value
    .filter(m => m.municipio_id === userMunicipalityId)
    .sort((a, b) => new Date(a.data_envio) - new Date(b.data_envio)); // Ordem Cronológica ASC
});

const unreadCount = computed(() => {
  return conversas.value.filter(m => !m.lido && m.destinatario_id === secretaryId).length;
});

// --- ENVIAR MENSAGEM (Tabela Mensagens) ---
const sendMessage = async () => {
  if (!messageForm.destinatario_id || !messageForm.conteudo) return;

  const targetDirector = directors.find(d => d.id === messageForm.destinatario_id);
  
  const newMessageObj = {
    id: Date.now(),
    remetente_id: secretaryId,
    remetente_email: secretaryEmail,
    destinatario_id: messageForm.destinatario_id,
    destinatario_email: targetDirector.email,
    conteudo: messageForm.conteudo,
    data_envio: new Date().toISOString(),
    lido: false,
    municipio_id: userMunicipalityId
  };

  // Simulação de insert no Supabase na tabela "mensagens"
  try {
    console.log('INSERT INTO "mensagens" (remetente_id, destinatario_id, municipio_id, conteudo) VALUES (...)', newMessageObj);
    
    // Atualiza o estado local (conversas) para refletir o envio
    conversas.value.push(newMessageObj);
    
    // Limpar formulário
    messageForm.destinatario_id = '';
    messageForm.conteudo = '';
    
    alert('Mensagem enviada com sucesso!');
  } catch (err) {
    console.error('Erro ao enviar mensagem para a tabela "mensagens":', err);
  }
};

// --- ATUALIZAR STATUS LIDO ---
const markAsRead = (msgId) => {
  const msg = conversas.value.find(m => m.id === msgId);
  if (msg) {
    console.log(`UPDATE "mensagens" SET lido = true WHERE id = ${msgId}`);
    msg.lido = true;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>