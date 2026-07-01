import {
    AlertCircle,
    Check,
    CheckCircle2, Clock,
    HelpCircle,
    Mail,
    MessageCircle,
    MessageSquare, Phone,
    Search,
    Send,
    X
} from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

const Ajuda = () => {
  const {
    theme,
    user,
    duvidas,
    handleCriarDuvida,
    handleResolverDuvida,
    loading,
    errorMsg
  } = useDashboard();

  const isDark = theme === 'dark';
  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);

  // Student UI state
  const [duvidaText, setDuvidaText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Librarian UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'RESOLVED'
  const [resolvingId, setResolvingId] = useState(null);
  const [respostaText, setRespostaText] = useState('');

  const safeDuvidas = Array.isArray(duvidas) ? duvidas : [];

  // Filter doubts for librarian
  const filteredDuvidas = safeDuvidas.filter(d => {
    // Status filter
    if (statusFilter === 'PENDING' && d.resolvida) return false;
    if (statusFilter === 'RESOLVED' && !d.resolvida) return false;

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const studentName = `${d.usuario?.nome || ''} ${d.usuario?.sobrenome || ''}`.toLowerCase();
      const email = (d.usuario?.email || '').toLowerCase();
      const room = (d.usuario?.anoSala || '').toLowerCase();
      const question = d.duvida.toLowerCase();

      return (
        studentName.includes(term) ||
        email.includes(term) ||
        room.includes(term) ||
        question.includes(term)
      );
    }

    return true;
  });

  const pendingCount = safeDuvidas.filter(d => !d.resolvida).length;

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!duvidaText.trim()) return;

    try {
      setSubmitting(true);
      await handleCriarDuvida(duvidaText);
      setDuvidaText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDoubt = async (e, duvidaId) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await handleResolverDuvida(duvidaId, respostaText);
      setResolvingId(null);
      setRespostaText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Central de Ajuda</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe as dúvidas e os atendimentos da biblioteca.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-sky-400' : 'bg-violet-50 text-violet-600'}`}>
            <HelpCircle size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Carregando ajuda...</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estamos buscando as dúvidas e as respostas mais recentes.</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Central de Ajuda</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe as dúvidas e os atendimentos da biblioteca.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
            <AlertCircle size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Não foi possível carregar a central de ajuda</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (safeDuvidas.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Central de Ajuda</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe as dúvidas e os atendimentos da biblioteca.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            <HelpCircle size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhuma dúvida registrada</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quando alunos ou professores enviarem perguntas, elas aparecerão aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Central de Ajuda</h1>
          <p className="opacity-90 font-medium mb-6">
            {ehBibliotecaria
              ? 'Gerencie e responda às dúvidas dos leitores da biblioteca. Registre contatos realizados e envie esclarecimentos rápidos.'
              : 'Tem alguma dúvida sobre reservas, prazos, multas ou funcionamento? Envie sua pergunta diretamente para a bibliotecária.'
            }
          </p>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10`}>
              <HelpCircle size={14} />
              {ehBibliotecaria
                ? `${pendingCount} dúvida(s) aguardando atendimento`
                : 'Suporte Direto e Prático'
              }
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      {ehBibliotecaria ? (
        /* LIBRARIAN VIEW */
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por leitor, sala ou dúvida..."
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm transition-all outline-none font-medium
                  ${isDark
                    ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                    : 'bg-white border-gray-200 text-slate-950 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                  }`}
              />
            </div>

            {/* Filter buttons */}
            <div className={`flex p-1 rounded-2xl border ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'PENDING'
                    ? (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                <Clock size={12} />
                Pendentes {pendingCount > 0 && `(${pendingCount})`}
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'RESOLVED'
                    ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                <CheckCircle2 size={12} />
                Resolvidas
              </button>
            </div>
          </div>

          {/* Doubts list */}
          {filteredDuvidas.length === 0 ? (
            <div className={`rounded-3xl border p-12 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                <HelpCircle size={28} />
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-905'}`}>Nenhuma dúvida encontrada</p>
              <p className={`text-sm mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Não há registros com os filtros atuais. Quando alunos ou professores enviarem dúvidas, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDuvidas.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all duration-300 relative overflow-hidden group
                    ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}
                  `}
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.usuario?.nome} {item.usuario?.sobrenome}
                        </h3>
                        <span className={`text-xs font-semibold ${isDark ? 'text-sky-400' : 'text-violet-600'}`}>
                          {item.usuario?.anoSala || 'Professor / Outro'}
                        </span>
                      </div>

                      {item.resolvida ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase bg-emerald-500/10 text-emerald-500`}>
                          <Check size={10} strokeWidth={3} /> Resolvido
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase bg-amber-500/10 text-amber-500`}>
                          <Clock size={10} /> Pendente
                        </span>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className={`p-3 rounded-2xl flex flex-col gap-1.5 text-xs font-medium mb-4 ${isDark ? 'bg-slate-950/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.usuario?.email}</span>
                      </div>
                      {item.usuario?.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item.usuario?.telefone}</span>
                        </div>
                      )}
                    </div>

                    {/* Question Card */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed mb-4 border ${isDark ? 'bg-slate-900/80 border-white/5 text-slate-200' : 'bg-slate-50/50 border-gray-100 text-slate-700'}`}>
                      <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Dúvida do Leitor:</p>
                      <p className="italic">"{item.duvida}"</p>
                    </div>

                    {/* Resolvida section */}
                    {item.resolvida && (
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed mb-4 border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-200' : 'bg-emerald-50/35 border-emerald-100 text-slate-700'}`}>
                        <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-500 mb-1">Contato & Solução:</p>
                        {item.resposta ? (
                          <p>{item.resposta}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Contato realizado com o leitor para tirar dúvidas.</p>
                        )}
                        <span className="block mt-2 text-[10px] text-slate-400 font-semibold">
                          Finalizado em: {formatDate(item.resolvidaEm)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Resolve Doubt / Contact form & trigger */}
                  {!item.resolvida && (
                    <div className="mt-4">
                      {resolvingId === item.id ? (
                        <form onSubmit={(e) => handleResolveDoubt(e, item.id)} className="flex flex-col gap-3">
                          <textarea
                            value={respostaText}
                            onChange={(e) => setRespostaText(e.target.value)}
                            placeholder="Escreva uma resposta ou notas sobre o contato (opcional)..."
                            rows={3}
                            className={`w-full p-3 rounded-xl border text-xs transition-all outline-none font-medium resize-none
                              ${isDark
                                ? 'bg-slate-950 border-white/10 text-white placeholder-slate-650 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                                : 'bg-white border-gray-200 text-slate-950 placeholder-slate-400 focus:border-violet-500 focus:focus:ring-1 focus:ring-violet-500'
                              }`}
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                            >
                              <Check size={14} strokeWidth={3} />
                              Registrar Contato
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingId(null);
                                setRespostaText('');
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition
                                ${isDark
                                  ? 'border-white/10 text-slate-350 hover:bg-slate-800 hover:text-white'
                                  : 'border-gray-200 text-slate-600 hover:bg-gray-150 hover:text-slate-900'
                                }`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setResolvingId(item.id);
                            setRespostaText('');
                          }}
                          className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all duration-300
                            ${isDark
                              ? 'border-sky-500/20 text-sky-400 hover:bg-sky-500/10'
                              : 'border-violet-200 text-violet-650 hover:bg-violet-50'
                            }`}
                        >
                          <MessageCircle size={14} />
                          Responder / Entrar em Contato
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submission date tag */}
                  <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center text-[10px] text-slate-400 font-semibold border-slate-700/50">
                    <span>Solicitado: {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STUDENT/READER VIEW */
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Submit form */}
          <div className="w-full lg:w-5/12 shrink-0">
            <div className={`rounded-[32px] border p-6 shadow-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <MessageSquare size={20} className={isDark ? 'text-sky-400' : 'text-violet-600'} />
                Enviar Dúvida
              </h2>
              <p className={`text-xs mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Descreva sua dúvida detalhadamente. A bibliotecária será notificada imediatamente e entrará em contato com você.
              </p>

              <form onSubmit={handleSubmitDoubt} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>
                    Sua pergunta
                  </label>
                  <textarea
                    value={duvidaText}
                    onChange={(e) => setDuvidaText(e.target.value)}
                    placeholder="Escreva sua dúvida aqui... (Ex: Como faço para renovar um livro que já está atrasado?)"
                    rows={5}
                    required
                    className={`w-full p-4 rounded-2xl border text-sm transition-all outline-none font-medium resize-none
                      ${isDark
                        ? 'bg-slate-950 border-white/10 text-white placeholder-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        : 'bg-white border-gray-200 text-slate-950 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                      }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !duvidaText.trim()}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all shadow-sm text-sm flex items-center justify-center gap-2 hover:scale-[1.01]
                    ${submitting || !duvidaText.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : (isDark ? 'bg-sky-500 text-slate-950 hover:bg-sky-400' : 'bg-violet-600 text-white hover:bg-violet-500')
                    }`}
                >
                  <Send size={15} />
                  Enviar para a Bibliotecária
                </button>
              </form>

              {/* Notice */}
              <div className={`mt-6 p-4 rounded-2xl flex gap-3 items-start border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50/50 border-gray-100'}`}>
                <AlertCircle size={16} className={`shrink-0 mt-0.5 ${isDark ? 'text-sky-400' : 'text-violet-600'}`} />
                <div className="text-[11px] leading-relaxed font-semibold">
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>Como a bibliotecária entra em contato?</p>
                  <p className={`mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ela utilizará os dados cadastrados no seu perfil (E-mail: <span className="font-bold underline">{user?.email}</span> ou Telefone: <span className="font-bold underline">{user?.telefone || 'Não cadastrado'}</span>). Você também receberá uma notificação no sistema quando ela responder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 w-full">
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Clock size={20} className={isDark ? 'text-sky-400' : 'text-violet-600'} />
              Minhas Perguntas
            </h2>

            {safeDuvidas.length === 0 ? (
              <div className={`rounded-3xl border p-12 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
                <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-150 text-gray-400'}`}>
                  <MessageSquare size={22} />
                </div>
                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-905'}`}>Nenhuma pergunta enviada ainda</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Se você tiver dúvidas, use o formulário ao lado para enviar uma pergunta à bibliotecária.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                {safeDuvidas.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-all relative overflow-hidden flex flex-col gap-3
                      ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}
                    `}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>
                      {item.resolvida ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase bg-emerald-500/10 text-emerald-500">
                          <CheckCircle2 size={11} /> Resolvida
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase bg-amber-500/10 text-amber-500">
                          <Clock size={11} /> Pendente
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <div>
                      <p className={`text-sm font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1`}>Sua pergunta:</p>
                      <p className={`text-sm font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {item.duvida}
                      </p>
                    </div>

                    {/* Answer / Resolution */}
                    {item.resolvida && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-emerald-950/20 border-emerald-500/10 text-slate-200' : 'bg-emerald-50/30 border-emerald-100 text-slate-700'}`}>
                        <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-500 mb-1">
                          Retorno da Bibliotecária:
                        </p>
                        {item.resposta ? (
                          <p className="font-medium text-sm">{item.resposta}</p>
                        ) : (
                          <p className="font-medium text-xs text-slate-450 italic">A bibliotecária marcou contato realizado para responder sua pergunta.</p>
                        )}
                        {item.resolvidaEm && (
                          <span className="block mt-2 text-[9px] text-slate-400 font-bold uppercase">
                            Respondido em {formatDate(item.resolvidaEm)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ajuda;
