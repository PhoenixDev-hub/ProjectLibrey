import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import { 
  Settings, User, Shield, Save, RefreshCw, 
  Clock, BookOpen, Coins, ToggleLeft, ToggleRight,
  Mail, Phone, FileText
} from 'lucide-react';

const Configuracoes = () => {
  const { 
    theme, 
    user, 
    libraryConfig, 
    handleUpdateProfile, 
    handleUpdateLibraryConfig, 
    loading 
  } = useDashboard();

  const isDark = theme === 'dark';
  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);

  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'biblioteca'
  const [submitting, setSubmitting] = useState(false);

  // Profile Form States
  const [perfilForm, setPerfilForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: ''
  });

  // Library Config Form States
  const [configForm, setConfigForm] = useState({
    nomeBiblioteca: '',
    prazoDevolucao: 30,
    limiteEmprestimos: 5,
    permitirRenovacao: true
  });

  // Initialize Profile Form
  useEffect(() => {
    if (user) {
      setPerfilForm({
        nome: user.nome || '',
        sobrenome: user.sobrenome || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }
  }, [user]);

  // Initialize Library Config Form
  useEffect(() => {
    if (libraryConfig) {
      setConfigForm({
        nomeBiblioteca: libraryConfig.nomeBiblioteca || 'Biblioteca ProjectLibrey',
        prazoDevolucao: libraryConfig.prazoDevolucao || 30,
        limiteEmprestimos: libraryConfig.limiteEmprestimos || 5,
        permitirRenovacao: libraryConfig.permitirRenovacao !== undefined ? libraryConfig.permitirRenovacao : true
      });
    }
  }, [libraryConfig]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Directly call context handler passing the event
      await handleUpdateProfile(e);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await handleUpdateLibraryConfig(configForm);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setPerfilForm(prev => ({ ...prev, [name]: value }));
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleRenovacao = () => {
    setConfigForm(prev => ({ ...prev, permitirRenovacao: !prev.permitirRenovacao }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-slate-800 to-slate-650'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Configurações</h1>
          <p className="opacity-90 font-medium mb-6">
            Atualize seus dados pessoais e, se for administrador, ajuste as regras gerais de empréstimo e funcionamento da biblioteca.
          </p>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/10 text-white border border-white/10`}>
              <Settings size={14} />
              Personalização & Regras
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b pb-1 border-slate-700/50">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'perfil'
              ? (isDark ? 'border-sky-550 text-sky-400' : 'border-slate-800 text-slate-900')
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={16} />
          Meu Perfil
        </button>
        {ehBibliotecaria && (
          <button
            onClick={() => setActiveTab('biblioteca')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'biblioteca'
                ? (isDark ? 'border-sky-550 text-sky-400' : 'border-slate-800 text-slate-900')
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={16} />
            Parâmetros da Biblioteca
          </button>
        )}
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'perfil' && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Form card */}
            <div className={`w-full md:w-7/12 rounded-[32px] border p-6 shadow-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <User size={20} className={isDark ? 'text-sky-400' : 'text-slate-700'} />
                Dados Pessoais
              </h2>

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={perfilForm.nome}
                      onChange={handleProfileChange}
                      required
                      className={`w-full p-3 rounded-xl border text-sm transition-all outline-none font-medium
                        ${isDark 
                          ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                          : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                        }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Sobrenome</label>
                    <input
                      type="text"
                      name="sobrenome"
                      value={perfilForm.sobrenome}
                      onChange={handleProfileChange}
                      required
                      className={`w-full p-3 rounded-xl border text-sm transition-all outline-none font-medium
                        ${isDark 
                          ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                          : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                        }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={perfilForm.email}
                    onChange={handleProfileChange}
                    required
                    className={`w-full p-3 rounded-xl border text-sm transition-all outline-none font-medium
                      ${isDark 
                        ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                        : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                      }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={perfilForm.telefone}
                    onChange={handleProfileChange}
                    placeholder="(99) 99999-9999"
                    className={`w-full p-3 rounded-xl border text-sm transition-all outline-none font-medium
                      ${isDark 
                        ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                        : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                      }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-4 w-full py-3 rounded-2xl font-bold transition-all shadow-sm text-sm flex items-center justify-center gap-2 hover:scale-[1.01]
                    ${isDark ? 'bg-sky-500 text-slate-950 hover:bg-sky-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                  <Save size={15} />
                  Salvar Alterações
                </button>
              </form>
            </div>

            {/* Account Information details card */}
            <div className={`w-full md:flex-1 rounded-[32px] border p-6 shadow-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Shield size={20} className="text-emerald-500" />
                Informações da Conta
              </h2>

              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>Função de Acesso</span>
                  <span className="font-bold uppercase text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                    {user?.tipoUsuario || 'Leitor'}
                  </span>
                </div>
                {user?.tipoUsuario === 'ALUNO' && (
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                    <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>Ano / Sala</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.anoSala || '-'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>Membro Desde</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.dataCadastro ? new Date(user.dataCadastro).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>Status cadastral</span>
                  <span className={`font-bold text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400`}>
                    {user?.status || 'ATIVO'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biblioteca' && ehBibliotecaria && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Library Params Form */}
            <div className={`w-full md:w-7/12 rounded-[32px] border p-6 shadow-md ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Shield size={20} className={isDark ? 'text-sky-400' : 'text-slate-700'} />
                Regras e Prazos
              </h2>

              <form onSubmit={handleConfigSubmit} className="flex flex-col gap-5">
                {/* Nome da biblioteca */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Nome da Biblioteca</label>
                  <input
                    type="text"
                    name="nomeBiblioteca"
                    value={configForm.nomeBiblioteca}
                    onChange={handleConfigChange}
                    required
                    className={`w-full p-3 rounded-xl border text-sm transition-all outline-none font-medium
                      ${isDark 
                        ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                        : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                      }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prazo de devolucao */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Prazo de Devolução (dias)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="prazoDevolucao"
                        value={configForm.prazoDevolucao}
                        onChange={handleConfigChange}
                        required
                        min="1"
                        max="365"
                        className={`w-full p-3 pl-10 rounded-xl border text-sm transition-all outline-none font-medium
                          ${isDark 
                            ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                            : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                          }`}
                      />
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Limite de emprestimos */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Limite de Empréstimos</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="limiteEmprestimos"
                        value={configForm.limiteEmprestimos}
                        onChange={handleConfigChange}
                        required
                        min="1"
                        max="50"
                        className={`w-full p-3 pl-10 rounded-xl border text-sm transition-all outline-none font-medium
                          ${isDark 
                            ? 'bg-slate-950 border-white/10 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                            : 'bg-white border-gray-200 text-slate-950 focus:border-slate-800 focus:ring-1 focus:ring-slate-800'
                          }`}
                      />
                      <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Removido campo de multa (sistema escolar) */}

                {/* Toggle renovacao */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-700/50">
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Permitir Renovações Online</p>
                    <p className="text-xs text-slate-400">Alunos poderão prorrogar devoluções pelo painel</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleRenovacao}
                    className={`transition-all duration-300 ${configForm.permitirRenovacao ? 'text-sky-400' : 'text-slate-500'}`}
                  >
                    {configForm.permitirRenovacao ? (
                      <ToggleRight size={38} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={38} strokeWidth={1.5} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-2 w-full py-3 rounded-2xl font-bold transition-all shadow-sm text-sm flex items-center justify-center gap-2 hover:scale-[1.01]
                    ${isDark ? 'bg-sky-500 text-slate-950 hover:bg-sky-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                  <Save size={15} />
                  Salvar Regras
                </button>
              </form>
            </div>

            {/* Quick Preview Card */}
            <div className={`w-full md:flex-1 rounded-[32px] border p-6 shadow-md flex flex-col gap-6 ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileText size={20} className="text-emerald-500" />
                Resumo Regras Ativas
              </h2>

              <div className="flex flex-col gap-4 text-xs font-semibold leading-relaxed text-slate-400">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50/50 border-gray-150'}`}>
                  <p className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{configForm.nomeBiblioteca || 'Nome da Biblioteca'}</p>
                  <p>As regras configuradas ao lado afetam todos os novos empréstimos criados a partir do registro de retirada.</p>
                </div>

                <ul className="flex flex-col gap-3 list-disc pl-4">
                  <li>
                    Prazo padrão de empréstimo: <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-slate-900'}`}>{configForm.prazoDevolucao} dias</span>.
                  </li>
                  <li>
                    Cada leitor pode retirar ou reservar até <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-slate-900'}`}>{configForm.limiteEmprestimos} exemplares</span>.
                  </li>
                  {/* Sem multas por atraso (sistema escolar) */}
                  <li>
                    Renovação online via sistema: <span className={`font-bold ${configForm.permitirRenovacao ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {configForm.permitirRenovacao ? 'Permitido' : 'Bloqueado'}
                    </span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracoes;
