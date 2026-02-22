
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserProfile, Message } from '../types';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_SCHOOLS } from '../constants';

interface MessagesProps {
  user: User;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [conteudo, setConteudo] = useState('');

  const isDiretor = user.profile === UserProfile.DIRETOR;

  // Filtra os destinatários com base no perfil:
  // Se Diretor, o destino é exclusivamente a Secretaria do município.
  const recipients = useMemo(() => {
    if (isDiretor) {
      // Para Diretores, apenas Secretaria de Educação ou Admin Geral (atuando como Secretaria) do mesmo município
      return MOCK_USERS.filter(u =>
        (u.profile === UserProfile.SECRETARIA || u.profile === UserProfile.ADMIN) &&
        u.municipio_id === user.municipio_id &&
        u.id !== user.id
      );
    }
    // Para Secretaria/Admin, o destino são os Diretores do mesmo município
    return MOCK_USERS.filter(u =>
      u.profile === UserProfile.DIRETOR &&
      u.municipio_id === user.municipio_id
    );
  }, [user.municipio_id, user.profile, user.id, isDiretor]);

  // Efeito para auto-selecionar o destinatário se for Diretor e houver apenas um (Secretaria)
  useEffect(() => {
    if (isDiretor && recipients.length === 1 && !destinatarioId) {
      setDestinatarioId(recipients[0].id);
    }
  }, [isDiretor, recipients, destinatarioId]);

  // Conversas filtradas por perfil e município
  const filteredConversas = useMemo(() => {
    return messages
      .filter(m => {
        // Regra para Diretor: Ver apenas mensagens entre ele e membros da Secretaria/Admin
        if (isDiretor) {
          const isRelatedToMe = m.remetente_id === user.id || m.destinatario_id === user.id;
          if (!isRelatedToMe) return false;

          const otherPartyId = m.remetente_id === user.id ? m.destinatario_id : m.remetente_id;
          const otherParty = MOCK_USERS.find(u => u.id === otherPartyId);

          return otherParty && (otherParty.profile === UserProfile.SECRETARIA || otherParty.profile === UserProfile.ADMIN);
        }

        // Regra para Secretaria/Admin: Ver todas as mensagens do município
        return m.municipio_id === user.municipio_id;
      })
      .sort((a, b) => new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime());
  }, [messages, user.municipio_id, user.id, isDiretor]);

  const unreadCount = useMemo(() =>
    messages.filter(m => !m.lido && m.destinatario_id === user.id).length
    , [messages, user.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinatarioId || !conteudo.trim()) return;

    const target = recipients.find(r => r.id === destinatarioId);
    if (!target) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      remetente_id: user.id,
      remetente_email: user.email,
      destinatario_id: target.id,
      destinatario_email: target.email,
      conteudo: conteudo.trim(),
      data_envio: new Date().toISOString(),
      lido: false,
      municipio_id: user.municipio_id || ''
    };

    setMessages([...messages, newMessage]);
    setConteudo('');
    // Se for diretor, mantemos a secretaria selecionada para facilitar novos envios
    if (!isDiretor) setDestinatarioId('');
  };

  const markAsRead = (msgId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, lido: true } : m
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Coluna de Composição (Envio) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
          <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </div>
            {isDiretor ? 'Contatar Secretaria' : 'Compor Mensagem'}
          </h2>

          <form onSubmit={handleSendMessage} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isDiretor ? 'Destinatário (Secretaria)' : 'Destinatário (Diretor)'}
              </label>
              <div className="relative">
                <select
                  value={destinatarioId}
                  onChange={(e) => setDestinatarioId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {/* Removemos a opção vazia para Diretores se houver destinatários, forçando a seleção da Secretaria */}
                  {(!isDiretor || (isDiretor && recipients.length === 0)) && (
                    <option value="">{isDiretor ? 'Selecione a Secretaria...' : 'Selecione um Diretor...'}</option>
                  )}
                  {recipients.map(recipient => {
                    return (
                      <option key={recipient.id} value={recipient.id}>
                        {isDiretor ? 'Secretaria de Educação' : recipient.name}
                      </option>
                    );
                  })}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"></i>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conteúdo Institucional</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
                rows={6}
                placeholder={isDiretor ? "Descreva sua solicitação ou informe à Secretaria..." : "Digite o conteúdo formal da comunicação..."}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i>
              {isDiretor ? 'Enviar para Secretaria' : 'Enviar para Rede'}
            </button>
          </form>
        </div>

        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
              <i className="fa-solid fa-info-circle"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800">Canais de Auditabilidade</p>
              <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                {isDiretor
                  ? 'Suas conversas com a Secretaria são registradas para fins de protocolo.'
                  : 'Todas as mensagens são registradas no log do município.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Conversas (Lista) */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col h-[700px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
              {isDiretor ? 'Minhas Conversas com a Secretaria' : 'Histórico do Município'}
            </h2>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} Novas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.municipality || 'Município'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/10 custom-scrollbar">
          {filteredConversas.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300 text-4xl">
                <i className="fa-solid fa-comments-slash"></i>
              </div>
              <p className="text-gray-400 text-sm font-medium italic">
                {isDiretor ? 'Nenhuma conversa ativa com a Secretaria.' : 'Nenhuma comunicação registrada neste município.'}
              </p>
            </div>
          ) : (
            filteredConversas.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.remetente_id === user.id ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-5 rounded-3xl shadow-sm border transition-all relative ${msg.remetente_id === user.id
                      ? 'bg-blue-600 border-blue-700 text-white rounded-tr-none'
                      : 'bg-white border-gray-100 text-gray-700 rounded-tl-none hover:shadow-lg hover:border-blue-100'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-6">
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${msg.remetente_id === user.id ? 'opacity-70' : 'text-blue-500'}`}>
                      {msg.remetente_id === user.id ? 'Sua Mensagem' : (isDiretor ? 'Secretaria de Educação' : msg.remetente_email)}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.remetente_id === user.id ? 'opacity-60' : 'text-gray-400'}`}>
                      {new Date(msg.data_envio).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed">{msg.conteudo}</p>

                  <div className={`mt-4 pt-3 flex items-center justify-between border-t border-current border-opacity-10`}>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                      Destino: {isDiretor && msg.destinatario_id !== user.id ? user.email : (isDiretor && msg.remetente_id === user.id ? 'Secretaria de Educação' : msg.destinatario_email)}
                    </span>
                    <div className="flex items-center gap-3">
                      {msg.lido ? (
                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${msg.remetente_id === user.id ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                          <i className="fa-solid fa-check-double"></i> Lido
                        </span>
                      ) : (
                        msg.remetente_id !== user.id && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="text-[9px] font-black uppercase tracking-widest bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                          >
                            Marcar como lida
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl text-center">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Fim do histórico de comunicações</span>
        </div>
      </div>
    </div>
  );
};

export default Messages;
