import React, { useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import { 
  Calendar, Search, Filter, AlertCircle, Clock, 
  User, BookOpen, Check, X, ShieldAlert, Users 
} from 'lucide-react';

const Reservas = () => {
  const { 
    theme, reservations, user, 
    handleAtualizarReservaStatus, loading 
  } = useDashboard();
  
  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);

  const pendingReservations = safeReservations.filter(r => r.status === 'PENDENTE');

  const stats = (() => {
    const total = pendingReservations.length;
    const livrosDiferentes = new Set(pendingReservations.map(r => r.exemplar?.livro?.id).filter(Boolean)).size;
    const alunosDiferentes = new Set(pendingReservations.map(r => r.usuario?.id).filter(Boolean)).size;

    return {
      total,
      livrosDiferentes,
      alunosDiferentes
    };
  })();

  const filteredReservations = pendingReservations.filter(r => {
    return (
      (r.exemplar?.livro?.titulo && r.exemplar.livro.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.exemplar?.livro?.autor && r.exemplar.livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.usuario?.nome && r.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.usuario?.sobrenome && r.usuario.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-emerald-650 to-emerald-500'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Reservas</h1>
          <p className="opacity-90 font-medium mb-6">
            Gerencie as intenções de leitura, autorize solicitações e gerencie a fila de espera. As reservas aprovadas são enviadas automaticamente para a aba de empréstimos.
          </p>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10`}>
              <Calendar size={14} />
              {stats.total} Solicitações Pendentes
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'text-sky-400 bg-sky-400/10' : 'text-emerald-600 bg-emerald-600/10'}`}>
            <Clock size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reservas Pendentes</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.livrosDiferentes}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Livros Distintos</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-violet-500 bg-violet-500/10">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.alunosDiferentes}</p>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Leitores Solicitantes</p>
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
          <input
            type="text"
            placeholder="Buscar reservas pendentes por livro ou leitor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${
              isDark
                ? 'border-white/10 bg-slate-950 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20'
                : 'border-gray-350 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
        {loading ? (
          <div className="p-16 text-center">
            <span className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Carregando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-16 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhuma solicitação de reserva pendente encontrada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-white/5 bg-slate-950/20 text-slate-450' : 'border-gray-150 bg-gray-50 text-slate-500'}`}>
                  <th className="py-4 px-6">Livro</th>
                  {ehBibliotecaria && <th className="py-4 px-6">Leitor</th>}
                  <th className="py-4 px-6">Solicitada em</th>
                  <th className="py-4 px-6">Status</th>
                  {ehBibliotecaria && <th className="py-4 px-6 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-150'}`}>
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="text-sm hover:bg-slate-500/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5 max-w-[280px]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-sky-400' : 'bg-slate-100 border-gray-200 text-indigo-650'}`}>
                          <BookOpen size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{res.exemplar?.livro?.titulo || 'Livro Desconhecido'}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'} truncate`}>{res.exemplar?.livro?.autor || 'Autor'}</p>
                        </div>
                      </div>
                    </td>

                    {ehBibliotecaria && (
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-violet-400' : 'bg-slate-100 border-gray-200 text-violet-650'}`}>
                            <User size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {res.usuario?.nome} {res.usuario?.sobrenome}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'} truncate`}>
                              {res.usuario?.anoSala || 'Sem Sala'} • {res.usuario?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}

                    <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
                      {formatDate(res.createdAt)}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-450 border border-amber-500/20`}>
                        <Clock size={12} />
                        Pendente
                      </span>
                    </td>

                    {ehBibliotecaria && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleAtualizarReservaStatus(res.id, 'APROVAR')}
                            className="p-1.5 rounded-xl border border-emerald-500/30 text-emerald-450 hover:bg-emerald-500/10 transition cursor-pointer"
                            title="Aprovar Reserva"
                          >
                            <Check size={15} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja rejeitar esta reserva? Ela será excluída permanentemente.')) {
                                handleAtualizarReservaStatus(res.id, 'REJEITAR');
                              }
                            }}
                            className="p-1.5 rounded-xl border border-rose-500/30 text-rose-450 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Rejeitar Reserva"
                          >
                            <X size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservas;
