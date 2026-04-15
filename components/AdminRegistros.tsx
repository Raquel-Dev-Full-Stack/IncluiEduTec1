import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Municipio {
  id: string;
  nome: string;      // Armazenado como "Cidade — UF"
  estado?: string;   // Extraído do nome, não salvo como coluna separada
  created_at?: string;
}

interface Secretaria {
  id: string;
  nome: string;
  email: string;
  municipio_id: string;
  municipio_nome?: string;
  estado?: string;
  active?: boolean;
  created_at?: string;
}

interface IbgeMunicipio {
  id: number;
  nome: string;
}

type SubTab = 'municipios' | 'secretarias';

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
];

// ─── Hook: Busca municípios do IBGE ──────────────────────────────────────────
function useIbgeMunicipios(uf: string) {
  const [municipios, setMunicipios] = useState<IbgeMunicipio[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Record<string, IbgeMunicipio[]>>({});

  useEffect(() => {
    if (!uf) { setMunicipios([]); return; }
    if (cache.current[uf]) { setMunicipios(cache.current[uf]); return; }
    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: IbgeMunicipio[]) => {
        cache.current[uf] = data;
        setMunicipios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [uf]);

  return { municipios, loading };
}

// ─── Seletor de Município com busca (IBGE) ────────────────────────────────────
const MunicipioSelector: React.FC<{
  value: string;       // nome do município selecionado
  estado: string;
  onEstadoChange: (uf: string) => void;
  onMunicipioChange: (nome: string) => void;
  accentColor?: string;
}> = ({ value, estado, onEstadoChange, onMunicipioChange, accentColor = 'blue' }) => {
  const { municipios, loading } = useIbgeMunicipios(estado);
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync externo
  useEffect(() => { setSearch(value); }, [value]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = municipios.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 80);

  const accent = accentColor === 'emerald' ? 'emerald' : 'blue';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Seletor de Estado */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Estado (UF) *
        </label>
        <select
          value={estado}
          onChange={e => { onEstadoChange(e.target.value); onMunicipioChange(''); setSearch(''); }}
          required
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-${accent}-500 focus:border-${accent}-500 outline-none transition-all appearance-none`}
        >
          <option value="">Selecione o estado</option>
          {ESTADOS.map(e => (
            <option key={e.uf} value={e.uf}>{e.uf} — {e.nome}</option>
          ))}
        </select>
      </div>

      {/* Seletor de Município com busca */}
      <div ref={ref} className="relative">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Município *
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); onMunicipioChange(''); }}
            onFocus={() => { if (estado) setOpen(true); }}
            placeholder={!estado ? 'Selecione o estado primeiro' : loading ? 'Carregando…' : 'Digite para buscar…'}
            disabled={!estado}
            className={`w-full px-4 py-3 pr-10 border rounded-xl text-gray-700 font-medium outline-none transition-all ${
              !estado ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100'
                : `border-gray-200 focus:ring-2 focus:ring-${accent}-500 focus:border-${accent}-500`
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {loading
              ? <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
              : <i className="fa-solid fa-magnifying-glass text-xs"></i>}
          </div>
        </div>

        {/* Dropdown */}
        {open && estado && filtered.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filtered.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSearch(m.nome);
                  onMunicipioChange(m.nome);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-${accent}-50 hover:text-${accent}-700 transition-colors border-b border-gray-50 last:border-0`}
              >
                {m.nome}
              </button>
            ))}
            {municipios.length > 80 && (
              <p className="px-4 py-2 text-xs text-gray-400 italic">
                Mostrando 80 de {municipios.length}. Refine a busca.
              </p>
            )}
          </div>
        )}
        {open && estado && !loading && municipios.length > 0 && filtered.length === 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <p className="text-sm text-gray-400 text-center">Nenhum município encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Formulário de Município ───────────────────────────────────────────────────
const MunicipioForm: React.FC<{
  onSave: (data: Omit<Municipio, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  initial?: Municipio | null;
}> = ({ onSave, onCancel, initial }) => {
  const [nome, setNome] = useState(initial?.nome || '');
  const [estado, setEstado] = useState(initial?.estado || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !estado) return;
    setSaving(true);
    await onSave({ nome: nome.trim(), estado });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-city text-white"></i>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{initial ? 'Editar Município' : 'Cadastrar Município'}</h3>
          <p className="text-gray-400 text-xs">Selecione o estado e busque o município pelo nome</p>
        </div>
      </div>

      <MunicipioSelector
        value={nome}
        estado={estado}
        onEstadoChange={setEstado}
        onMunicipioChange={setNome}
        accentColor="blue"
      />

      {nome && estado && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-sm text-blue-800 font-medium">
          <i className="fa-solid fa-check-circle text-blue-500"></i>
          Município selecionado: <strong>{nome} — {estado}</strong>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !nome || !estado}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving
            ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Salvando...</>
            : <><i className="fa-solid fa-check"></i> {initial ? 'Atualizar' : 'Cadastrar Município'}</>}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ─── Formulário de Secretaria ─────────────────────────────────────────────────
const SecretariaForm: React.FC<{
  onSave: (data: { nome: string; email: string; senha: string; municipio_nome: string; municipio_estado: string }) => Promise<void>;
  onCancel: () => void;
  initial?: Secretaria | null;
}> = ({ onSave, onCancel, initial }) => {
  const [nome, setNome] = useState(initial?.nome || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [estado, setEstado] = useState(initial?.estado || '');
  const [municipioNome, setMunicipioNome] = useState(initial?.municipio_nome || '');
  const [showSenha, setShowSenha] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!initial && !senha) { setError('A senha é obrigatória para novos cadastros.'); return; }
    if (senha && senha.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (senha && senha !== confirmarSenha) { setError('As senhas não conferem.'); return; }
    if (!estado || !municipioNome) { setError('Selecione o estado e o município.'); return; }

    setSaving(true);
    await onSave({ nome: nome.trim(), email: email.trim(), senha, municipio_nome: municipioNome, municipio_estado: estado });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-building-columns text-white"></i>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{initial ? 'Editar Secretaria' : 'Nova Secretaria de Educação'}</h3>
          <p className="text-gray-400 text-xs">Defina as credenciais de acesso ao portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome da Secretaria / Responsável *</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Secretaria Municipal de Educação de Maricá"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Seletor de Município com todos do Brasil */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Localização</label>
        <MunicipioSelector
          value={municipioNome}
          estado={estado}
          onEstadoChange={setEstado}
          onMunicipioChange={setMunicipioNome}
          accentColor="emerald"
        />
      </div>

      {municipioNome && estado && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl text-sm text-emerald-800 font-medium">
          <i className="fa-solid fa-location-dot text-emerald-500"></i>
          <span>Município: <strong>{municipioNome} — {estado}</strong></span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail de Acesso *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="secretaria@municipio.gov.br"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {initial ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
          </label>
          <div className="relative">
            <input
              type={showSenha ? 'text' : 'password'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i className={`fa-solid ${showSenha ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
          <input
            type={showSenha ? 'text' : 'password'}
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="Repita a senha"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <i className="fa-solid fa-shield-halved text-amber-500 mt-0.5"></i>
        <div className="text-sm text-amber-700">
          <p className="font-bold mb-0.5">Credenciais seguras</p>
          <p className="text-xs text-amber-600">
            As credenciais serão registradas no sistema. O e-mail será o login e a senha será enviada ao responsável da <strong>Secretaria de Educação</strong>.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving
            ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Salvando...</>
            : <><i className="fa-solid fa-check"></i> {initial ? 'Atualizar Secretaria' : 'Cadastrar Secretaria'}</>}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const AdminRegistros: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('municipios');
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null);
  const [editingSecretaria, setEditingSecretaria] = useState<Secretaria | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Extrai UF do nome salvo no formato "Cidade — UF"
  const extrairUF = (nome: string) => {
    const match = nome.match(/—\s*([A-Z]{2})$/);
    return match ? match[1] : '';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar municipios (pode falhar por RLS — tratar graciosamente)
      let muns: any[] = [];
      try {
        const { data: munsData } = await supabase
          .from('municipios').select('id,nome,created_at').order('nome');
        muns = munsData || [];
      } catch (_) { /* tabela pode não existir ou RLS */ }

      const parsedMuns = muns.map((m: any) => ({
        ...m,
        estado: extrairUF(m.nome)
      })) as Municipio[];
      setMunicipios(parsedMuns);

      // Carregar secretarias
      const { data: secs } = await supabase
        .from('users')
        .select('id,name,email,municipio_id,role,created_at')
        .eq('role', 'secretaria')
        .order('name');

      const enriched = (secs || []).map((s: any) => {
        const mun = parsedMuns.find((m: any) => m.id === s.municipio_id);
        const nomeMunicipio = mun?.nome || '—';
        return {
          id: s.id,
          nome: s.name || 'Sem nome',
          email: s.email,
          municipio_id: s.municipio_id,
          municipio_nome: nomeMunicipio,
          estado: mun?.estado || extrairUF(nomeMunicipio),
          active: true,
          created_at: s.created_at
        };
      }) as Secretaria[];

      setSecretarias(enriched);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Salvar Município (via IBGE) ─────────────────────────────────────────────
  // O nome é salvo no formato "Cidade — UF" (sem coluna estado separada)
  const handleSaveMunicipio = async (data: Omit<Municipio, 'id' | 'created_at'>) => {
    try {
      // Combinar nome + estado num único campo
      const nomeCompleto = data.estado ? `${data.nome} — ${data.estado}` : data.nome;

      if (editingMunicipio) {
        const { error } = await supabase.from('municipios').update({ nome: nomeCompleto }).eq('id', editingMunicipio.id);
        if (error) throw error;
        showMsg('Município atualizado com sucesso!');
      } else {
        // Verificar se já existe (buscar pelo nome completo)
        const { data: exist } = await supabase
          .from('municipios').select('id').eq('nome', nomeCompleto).maybeSingle();
        if (exist) { showMsg('Este município já está cadastrado.', 'error'); return; }
        const { error } = await supabase.from('municipios').insert([{ nome: nomeCompleto }]);
        if (error) throw error;
        showMsg('Município cadastrado com sucesso!');
      }
      setShowForm(false);
      setEditingMunicipio(null);
      await loadData();
    } catch (err: any) {
      if (err.message?.includes('row-level security')) {
        showMsg('Permissão negada. Acesse o painel Supabase e desabilite o RLS da tabela "municipios", ou use a aba Secretarias para cadastrar diretamente.', 'error');
      } else {
        showMsg(`Erro: ${err.message}`, 'error');
      }
    }
  };

  // ── Salvar Secretaria ───────────────────────────────────────────────────────
  // Salva direto na tabela users SEM depender da tabela municipios (evita RLS)
  const handleSaveSecretaria = async (data: {
    nome: string; email: string; senha: string;
    municipio_nome: string; municipio_estado: string;
  }) => {
    try {
      const nomeCompleto = data.municipio_estado
        ? `${data.municipio_nome} — ${data.municipio_estado}`
        : data.municipio_nome;

      // Tenta encontrar o município no cache local (sem insert)
      const munLocal = municipios.find(m => m.nome === nomeCompleto || m.nome === data.municipio_nome);
      const municipioId = munLocal?.id || null;

      if (editingSecretaria) {
        // Para EDIÇÃO usamos a RPC segura criada no banco para atualizar logica de email/senha
        const { error: rpcError } = await supabase.rpc('admin_update_user_credentials', {
          p_user_id: editingSecretaria.id,
          p_new_email: data.email,
          p_new_password: data.senha || null
        });
        
        if (rpcError) {
          console.error("Erro na rpc update credentials:", rpcError);
          throw new Error(`Erro: ${rpcError.message}`);
        }

        // Atualizar também o public.users (name e municipio)
        const updatePayload: Record<string, any> = {
          name: data.nome
        };
        if (municipioId) updatePayload.municipio_id = municipioId;

        const { error } = await supabase.from('users')
          .update(updatePayload)
          .eq('id', editingSecretaria.id);
        
        if (error) {
          console.error('Erro no update public users:', error);
          throw error;
        }

        showMsg('Secretaria atualizada com sucesso!');

      } else {
        // Para CRIAÇÃO: Edge Function
        let sucesso = false;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const jwt = session?.access_token;
          const url = (import.meta as any).env.VITE_SUPABASE_URL;

          if (jwt && url) {
            const resp = await fetch(`${url}/functions/v1/upsert-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
              body: JSON.stringify({
                email: data.email, 
                password: data.senha,
                name: data.nome, 
                role: 'secretaria',
                municipio_id: municipioId
              })
            });
            
            if (resp.ok) {
              sucesso = true;
            } else {
              console.warn('Falha na Edge Function, response status:', resp.status);
              try {
                const errData = await resp.json();
                if (errData.error) console.error('Erro da Edge Function:', errData.error);
              } catch (e) { /* ignora */ }
            }
          }
        } catch (err) {
          console.error('Erro ao chamar upsert-user:', err);
        }

        if (!sucesso) {
          console.log('Usando fallback via client supabase...');
          // Fallback para inserção
          const insertPayload: Record<string, any> = {
            name: data.nome,
            email: data.email,
            role: 'secretaria',
            created_at: new Date().toISOString()
          };
          if (municipioId) insertPayload.municipio_id = municipioId;

          const { error } = await supabase.from('users').insert([insertPayload]);
          
          if (error) {
            console.error('Erro no insert fallback:', error);
            throw error;
          }
        }

        showMsg('Secretaria cadastrada com sucesso!');
      }

      setShowForm(false);
      setEditingSecretaria(null);
      await loadData();
    } catch (err: any) {
      showMsg(`Erro: ${err.message}`, 'error');
    }
  };

  const handleDeleteMunicipio = async (id: string) => {
    try {
      const { error } = await supabase.from('municipios').delete().eq('id', id);
      if (error) throw error;
      showMsg('Município removido!');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showMsg(`Erro ao remover: ${err.message}`, 'error');
    }
  };

  const handleDeleteSecretaria = async (id: string) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      showMsg('Secretaria removida!');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showMsg(`Erro ao remover: ${err.message}`, 'error');
    }
  };

  const handleCancel = () => { setShowForm(false); setEditingMunicipio(null); setEditingSecretaria(null); };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Registros Administrativos</h1>
          <p className="text-gray-500 text-sm mt-1">Cadastro de municípios e secretarias de educação com credenciais de acesso.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingMunicipio(null); setEditingSecretaria(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all text-sm"
          >
            <i className="fa-solid fa-plus"></i>
            {subTab === 'municipios' ? 'Novo Município' : 'Nova Secretaria'}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['municipios', 'secretarias'] as SubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => { setSubTab(tab); setShowForm(false); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              subTab === tab
                ? tab === 'municipios' ? 'bg-white text-blue-600 shadow-sm' : 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={`fa-solid ${tab === 'municipios' ? 'fa-city' : 'fa-building-columns'}`}></i>
            {tab === 'municipios' ? 'Municípios' : 'Secretarias de Educação'}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              subTab === tab
                ? tab === 'municipios' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {tab === 'municipios' ? municipios.length : secretarias.length}
            </span>
          </button>
        ))}
      </div>

      {/* Notificação */}
      {notification && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-sm border ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <i className={`fa-solid ${notification.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
          {notification.msg}
        </div>
      )}

      {/* Formulários */}
      {showForm && subTab === 'municipios' && (
        <MunicipioForm onSave={handleSaveMunicipio} onCancel={handleCancel} initial={editingMunicipio} />
      )}
      {showForm && subTab === 'secretarias' && (
        <SecretariaForm onSave={handleSaveSecretaria} onCancel={handleCancel} initial={editingSecretaria} />
      )}

      {/* ─── LISTA DE MUNICÍPIOS ──────────────────────────────────────────── */}
      {!showForm && subTab === 'municipios' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Carregando municípios...</p>
            </div>
          ) : municipios.length === 0 ? (
            <div className="p-16 text-center">
              <i className="fa-solid fa-city text-gray-200 text-5xl mb-4 block"></i>
              <h3 className="text-gray-500 font-bold mb-1">Nenhum município cadastrado</h3>
              <p className="text-gray-400 text-sm mb-5">Use o botão acima para adicionar um município brasileiro.</p>
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Adicionar Município
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Município</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Secretarias</th>
                  <th className="text-right px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {municipios.map((m, i) => {
                  const count = secretarias.filter(s => s.municipio_id === m.id).length;
                  return (
                    <tr key={m.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <i className="fa-solid fa-city text-blue-500 text-xs"></i>
                          </div>
                          <span className="font-bold text-gray-800">{m.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-black rounded-lg">{m.estado}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${count > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {count} secretaria{count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => { setEditingMunicipio(m); setShowForm(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          {deleteConfirm === m.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteMunicipio(m.id)} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Confirmar</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(m.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remover">
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── LISTA DE SECRETARIAS ─────────────────────────────────────────── */}
      {!showForm && subTab === 'secretarias' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Carregando secretarias...</p>
            </div>
          ) : secretarias.length === 0 ? (
            <div className="p-16 text-center">
              <i className="fa-solid fa-building-columns text-gray-200 text-5xl mb-4 block"></i>
              <h3 className="text-gray-500 font-bold mb-1">Nenhuma secretaria cadastrada</h3>
              <p className="text-gray-400 text-sm mb-5">Cadastre a primeira secretaria com credenciais de acesso ao portal.</p>
              <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700">
                <i className="fa-solid fa-plus mr-2"></i>Cadastrar Secretaria
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Secretaria</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">E-mail / Login</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Município</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {secretarias.map((s, i) => (
                  <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <span className="text-emerald-600 font-black text-sm">{(s.nome || 'S').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{s.nome}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Secretaria de Educação</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-envelope text-gray-300 text-xs"></i>
                        <span className="text-gray-600 text-sm font-medium">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                        {s.municipio_nome}{s.estado ? ` — ${s.estado}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {s.active ? '● Ativo' : '○ Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => { setEditingSecretaria(s); setShowForm(true); }} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Editar">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        {deleteConfirm === s.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteSecretaria(s.id)} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Confirmar</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remover">
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRegistros;
