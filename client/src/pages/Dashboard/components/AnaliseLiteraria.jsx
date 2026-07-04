import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, BookOpen, Calendar, Clock, GraduationCap, CheckCircle, Search, User 
} from 'lucide-react';
import { useDashboard } from '../../../contexts/DashboardContext';
import { api } from '../../../services/api';

const AnaliseLiteraria = () => {
  const { theme } = useDashboard();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('retirado'); // 'retirado' | 'devolvido'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await api.get('/reservas/analise-literaria');
      setData(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.erro || err.response?.data?.error || 'Erro ao carregar análises literárias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const safeData = Array.isArray(data) ? data : [];

  // Filter based on active tab
  const tabFiltered = safeData.filter(item => {
    if (activeTab === 'retirado') {
      return item.status === 'RETIRADO' || item.status === 'PENDENTE' || item.status === 'APROVADO';
    } else {
      return item.status === 'DEVOLVIDO';
    }
  });

  // Filter based on search term
  const searchFiltered = tabFiltered.filter(item => {
    const term = searchTerm.toLowerCase();
    const studentName = `${item.usuario?.nome || ''} ${item.usuario?.sobrenome || ''}`.toLowerCase();
    const bookTitle = (item.exemplar?.livro?.titulo || '').toLowerCase();
    const bookAuthor = (item.exemplar?.livro?.autor || '').toLowerCase();
    return studentName.includes(term) || bookTitle.includes(term) || bookAuthor.includes(term);
  });

  // Stats calculation
  const totalRetirados = safeData.filter(item => item.status === 'RETIRADO').length;
  const totalDevolvidos = safeData.filter(item => item.status === 'DEVOLVIDO').length;

  return (
    <div className="flex flex-col gap-8">
      {/* Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-emerald-650 to-emerald-500'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
            <GraduationCap size={32} />
            Análise Literária
          </h1>
          <p className="opacity-90 font-medium mb-6">
            Acompanhe o progresso de leitura dos alunos nas atividades pedagógicas recomendadas de Análise Literária.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10">
              <Clock size={14} />
              {totalRetirados} Em Leitura
            </div>
            <div className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10">
              <CheckCircle size={14} />
              {totalDevolvidos} Concluídas
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className={`rounded-3xl border p-4 shadow-sm flex items-center gap-4 ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className="relative flex-1 w-full">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
            <input
              type="text"
              placeholder="Buscar por nome do aluno ou título do livro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${
                isDark
                  ? 'border-white/10 bg-slate-950 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20'
                  : 'border-gray-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b pb-1 border-slate-700/50">
          <button
            onClick={() => setActiveTab('retirado')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'retirado'
                ? (isDark ? 'border-sky-500 text-sky-400' : 'border-slate-800 text-slate-900')
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={16} />
            Com livro retirado
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'retirado' 
                ? (isDark ? 'bg-sky-500/20 text-sky-450' : 'bg-slate-800 text-white') 
                : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-150 text-slate-600')
            }`}>
              {safeData.filter(item => item.status === 'RETIRADO' || item.status === 'PENDENTE' || item.status === 'APROVADO').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('devolvido')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'devolvido'
                ? (isDark ? 'border-sky-500 text-sky-400' : 'border-slate-800 text-slate-900')
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle size={16} />
            Já devolvidos
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'devolvido' 
                ? (isDark ? 'bg-sky-500/20 text-sky-450' : 'bg-slate-800 text-white') 
                : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-150 text-slate-600')
            }`}>
              {totalDevolvidos}
            </span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
        {loading ? (
          <div className="p-16 text-center">
            <span className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Carregando registros...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-16 text-center">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <AlertCircle size={28} />
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Não foi possível carregar os registros</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{errorMsg}</p>
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="p-16 text-center">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              <GraduationCap size={28} />
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhum registro encontrado</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Não há reservas de Análise Literária nesta seção que correspondam à sua pesquisa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-white/5 bg-slate-950/20 text-slate-450' : 'border-gray-150 bg-gray-50 text-slate-500'}`}>
                  <th className="py-4 px-6">Aluno</th>
                  <th className="py-4 px-6">Livro</th>
                  <th className="py-4 px-6">Data de Retirada</th>
                  <th className="py-4 px-6">
                    {activeTab === 'retirado' ? 'Prazo de Devoculão' : 'Data de Devolução'}
                  </th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-150'}`}>
                {searchFiltered.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-slate-500/5 transition-colors">
                    {/* Aluno Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-violet-400' : 'bg-slate-100 border-gray-200 text-violet-650'}`}>
                          <User size={16} />
                        </div>
                        <div>
                          <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {item.usuario?.nome} {item.usuario?.sobrenome}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>
                            {item.usuario?.anoSala || 'Professor / Outro'} • {item.usuario?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Livro Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5 max-w-[280px]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-900 border-white/5 text-sky-400' : 'bg-slate-100 border-gray-200 text-indigo-650'}`}>
                          <BookOpen size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {item.exemplar?.livro?.titulo || 'Livro Desconhecido'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'} truncate`}>
                            {item.exemplar?.livro?.autor || 'Autor'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Data de Retirada */}
                    <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
                      {formatDate(item.retiradoEm || item.createdAt)}
                    </td>

                    {/* Prazo ou Data de Devolução */}
                    <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
                      {activeTab === 'retirado' ? formatDate(item.prazoDevol) : formatDate(item.devolvidoEm)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {item.status === 'DEVOLVIDO' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} />
                          Devolvido
                        </span>
                      ) : item.status === 'RETIRADO' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-450 border border-amber-500/20">
                          <Clock size={12} />
                          Retirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/20">
                          <Clock size={12} />
                          {item.status}
                        </span>
                      )}
                    </td>
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

export default AnaliseLiteraria;
