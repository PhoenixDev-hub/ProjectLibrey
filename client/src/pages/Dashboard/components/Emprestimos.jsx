import {
    AlertCircle,
    BookOpen,
    CheckCircle2, Clock,
    Search,
    ShoppingCart,
    User
} from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

const Emprestimos = () => {
  const {
    theme, reservations, user,
    handleRegistrarDevolucao, handleRegistrarRetirada, loading, errorMsg
  } = useDashboard();

  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);

  const hoje = new Date();

  const loans = safeReservations.filter(r =>
    r.status === 'RETIRADO' || r.status === 'DEVOLVIDO' || r.status === 'APROVADO'
  );

  const stats = (() => {
    const ativos = loans.filter(l => l.status === 'RETIRADO');
    const devolvidos = loans.filter(l => l.status === 'DEVOLVIDO');
    const aguardando = loans.filter(l => l.status === 'APROVADO');
    const atrasados = ativos.filter(l => l.prazoDevol && new Date(l.prazoDevol) < hoje);
    const noPrazo = ativos.filter(l => l.prazoDevol && new Date(l.prazoDevol) >= hoje);

    return {
      totalAtivos: ativos.length,
      atrasados: atrasados.length,
      noPrazo: noPrazo.length,
      devolvidos: devolvidos.length,
      aguardando: aguardando.length
    };
  })();

  const filteredLoans = loans.filter(l => {
    const matchesSearch =
      (l.exemplar?.livro?.titulo && l.exemplar.livro.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.exemplar?.livro?.autor && l.exemplar.livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.usuario?.nome && l.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.usuario?.sobrenome && l.usuario.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'NO_PRAZO') {
      return matchesSearch && l.status === 'RETIRADO' && l.prazoDevol && new Date(l.prazoDevol) >= hoje;
    }
    if (statusFilter === 'ATRASADO') {
      return matchesSearch && l.status === 'RETIRADO' && l.prazoDevol && new Date(l.prazoDevol) < hoje;
    }
    if (statusFilter === 'AGUARDANDO') {
      return matchesSearch && l.status === 'APROVADO';
    }
    if (statusFilter === 'DEVOLVIDO') {
      return matchesSearch && l.status === 'DEVOLVIDO';
    }

    return matchesSearch;
  });

  const getLoanStatusInfo = (loan) => {
    if (loan.status === 'DEVOLVIDO') {
      return {
        label: 'Devolvido',
        colorClass: isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600',
        icon: CheckCircle2
      };
    }
    if (loan.status === 'APROVADO') {
      return {
        label: 'Aguardando Retirada',
        colorClass: 'bg-amber-500/20 text-amber-500 border border-amber-500/20',
        icon: Clock
      };
    }

    const devolDate = new Date(loan.prazoDevol);
    if (devolDate < hoje) {
      return {
        label: 'Atrasado',
        colorClass: 'bg-rose-500/20 text-rose-500 border border-rose-500/20',
        icon: AlertCircle
      };
    }

    return {
      label: 'Em Dia',
      colorClass: 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/20',
      icon: Clock
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateOrDeadline = (loan, type) => {
    if (type === 'retirada') {
      if (loan.status === 'APROVADO') return 'Pendente';
      return formatDate(loan.retiradoEm);
    }
    if (type === 'devolucao') {
      if (loan.status === 'APROVADO') {
        if (!loan.aprovadoEm) return 'Prazo pendente';
        const deadline = new Date(loan.aprovadoEm);
        deadline.setDate(deadline.getDate() + 3);
        return `Até ${formatDate(deadline)}`;
      }
      return formatDate(loan.prazoDevol);
    }
    return '-';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Empréstimos</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe o status das leituras ativas e os prazos.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-sky-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <ShoppingCart size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Carregando empréstimos...</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estamos organizando os empréstimos e os prazos.</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Empréstimos</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe o status das leituras ativas e os prazos.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
            <AlertCircle size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Não foi possível carregar os empréstimos</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (filteredLoans.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Empréstimos</h1>
            <p className="opacity-90 font-medium mb-6">Acompanhe o status das leituras ativas e os prazos.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            <ShoppingCart size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhum empréstimo encontrado</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Não há registros de empréstimos para os filtros atuais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Empréstimos</h1>
          <p className="opacity-90 font-medium mb-6">
            Acompanhe o status das leituras ativas, prazos e realize a devolução de exemplares do acervo de forma ágil. O prazo limite para a leitura de cada exemplar é de <strong>1 mês (30 dias)</strong>.
          </p>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10`}>
              <ShoppingCart size={14} />
              {stats.totalAtivos} Leituras Ativas
            </div>
            {stats.aguardando > 0 && (
              <div className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500/30 text-amber-200 border border-amber-500/20">
                <Clock size={14} />
                {stats.aguardando} Aguardando Retirada
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'text-sky-400 bg-sky-400/10' : 'text-indigo-600 bg-indigo-600/10'}`}>
            <ShoppingCart size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.totalAtivos}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Ativos</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10">
            <Clock size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.aguardando}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aguardando Retirada</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-rose-500 bg-rose-500/10">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.atrasados}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Em Atraso</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-500/10">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.noPrazo}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No Prazo</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-slate-500 bg-slate-500/10">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.devolvidos}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Devolvidos</p>
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 shadow-sm flex flex-col xl:flex-row items-center gap-4 ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
          <input
            type="text"
            placeholder="Buscar por livro, autor ou leitor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${
              isDark
                ? 'border-white/10 bg-slate-950 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20'
                : 'border-gray-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />
        </div>

        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          {['TODOS', 'NO_PRAZO', 'ATRASADO', 'AGUARDANDO', 'DEVOLVIDO'].map((status) => {
            const labels = {
              TODOS: 'Todos',
              NO_PRAZO: 'No Prazo',
              ATRASADO: 'Atrasados',
              AGUARDANDO: 'Aguardando Retirada',
              DEVOLVIDO: 'Devolvidos'
            };
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-900 font-semibold shadow-sm')
                    : (isDark ? 'text-slate-400 hover:bg-slate-900/60' : 'text-slate-600 hover:bg-gray-100')
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
        {loading ? (
          <div className="p-16 text-center">
            <span className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Carregando empréstimos...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-16 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhum registro de empréstimo encontrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-white/5 bg-slate-950/20 text-slate-400' : 'border-gray-200 bg-gray-50 text-slate-500'}`}>
                  <th className="py-4 px-6">Livro</th>
                  {ehBibliotecaria && <th className="py-4 px-6">Leitor</th>}
                  <th className="py-4 px-6">Retirada</th>
                  <th className="py-4 px-6">Prazo Devolução / Limite Retirada</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6">Status</th>
                  {ehBibliotecaria && <th className="py-4 px-6 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-200'}`}>
                {filteredLoans.map((loan) => {
                  const statusInfo = getLoanStatusInfo(loan);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={loan.id} className="text-sm hover:bg-slate-500/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5 max-w-[280px]">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-sky-400' : 'bg-slate-100 border-gray-200 text-indigo-600'}`}>
                            <BookOpen size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{loan.exemplar?.livro?.titulo || 'Livro Desconhecido'}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{loan.exemplar?.livro?.autor || 'Autor'}</p>
                          </div>
                        </div>
                      </td>

                      {ehBibliotecaria && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-violet-400' : 'bg-slate-100 border-gray-200 text-violet-600'}`}>
                              <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                              <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {loan.usuario?.nome} {loan.usuario?.sobrenome}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
                                {loan.usuario?.anoSala || 'Sem Sala'} • {loan.usuario?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatDateOrDeadline(loan, 'retirada')}
                      </td>
                      <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatDateOrDeadline(loan, 'devolucao')}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {loan.tipoReserva === 'ANALISE_LITERARIA' ? (
                            <span className="inline-flex items-center w-fit gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-850/30">
                              Análise Literária
                            </span>
                          ) : (
                            <span className="inline-flex items-center w-fit gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                              Leitura Pessoal
                            </span>
                          )}
                          {loan.tipoReserva === 'ANALISE_LITERARIA' && loan.professor && (
                            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Prof: {loan.professor.nome} {loan.professor.sobrenome}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.colorClass}`}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {ehBibliotecaria && (
                        <td className="py-4 px-6 text-right">
                          {loan.status === 'APROVADO' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Registrar a retirada física do livro "${loan.exemplar?.livro?.titulo}" para ${loan.usuario?.nome}?`)) {
                                  handleRegistrarRetirada(loan.id);
                                }
                              }}
                              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              Entregar
                            </button>
                          ) : loan.status === 'RETIRADO' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Registrar a devolução do livro "${loan.exemplar?.livro?.titulo}"?`)) {
                                  handleRegistrarDevolucao(loan.id);
                                }
                              }}
                              className="text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              Devolver
                            </button>
                          ) : (
                            <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sem ações</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emprestimos;
