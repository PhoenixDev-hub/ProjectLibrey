import React from 'react';
import { 
  Home as HomeIcon, BookOpen, ShoppingCart, Calendar, 
  HelpCircle, Users, Settings, LogOut, Sun, Moon, Bell, Search, ChevronDown, User,
  GraduationCap
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

const DashboardShell = ({ children }) => {
  const { 
    theme, setTheme, sidebarOpen, activeTab, setActiveTab,
    user, logout, notificationsOpen, setNotificationsOpen, profileOpen, setProfileOpen,
    searchQuery, setSearchQuery, notifications, handleMarkAsRead, handleMarkAllAsRead
  } = useDashboard();

  const userType = user?.tipoUsuario || 'ALUNO';
  const userName = user?.nome || 'Usuário';
  
  const userTypeLabels = {
    ALUNO: 'Aluno',
    PROFESSOR: 'Professor',
    BIBLIOTECARIA: 'Bibliotecária',
    ADMINISTRADOR: 'Administrador',
  };
  const userTypeLabel = userTypeLabels[userType] || userType;
  
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const allMenuItems = [
    { id: 'inicio', label: 'Início', icon: HomeIcon },
    { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
    { id: 'emprestimos', label: 'Empréstimos', icon: ShoppingCart, roles: ['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'reservas', label: 'Reservas', icon: Calendar, roles: ['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'analise-literaria', label: 'Análise Literária', icon: GraduationCap, roles: ['PROFESSOR', 'BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'ajuda', label: 'Central de ajuda', icon: HelpCircle, roles: ['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'leitores', label: 'Leitores', icon: Users, roles: ['BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['BIBLIOTECARIA', 'ADMINISTRADOR'] },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.roles || item.roles.includes(userType)
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-slate-900'}`}>
      <div className={`fixed inset-0 transition-all duration-300 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_25%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]' : 'bg-gray-50'}`} />
      
      <div className="relative flex min-h-screen">
        <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} sticky top-0 h-screen flex flex-col justify-between border-r ${theme === 'dark' ? 'border-white/10 bg-slate-950/95' : 'border-gray-200 bg-white'} transition-all duration-300`}>
          <div>
            <div className={`flex items-center ${sidebarOpen ? 'justify-start px-8' : 'justify-center'} gap-3 py-6`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 text-lg font-bold text-slate-950">B</div>
              {sidebarOpen && (
                <div>
                  <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Biblioteca</h1>
                </div>
              )}
            </div>
            <nav className={`flex-1 flex flex-col justify-center gap-3 px-4 ${sidebarOpen ? 'items-start' : 'items-center'}`}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-4 rounded-3xl px-4 py-3 text-left transition-all duration-300 ${
                      isActive 
                        ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' : 'bg-slate-100 text-slate-900 font-semibold shadow-sm') 
                        : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900')
                    } ${sidebarOpen ? 'w-full' : ''}`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-4 pb-6">
            <div className={`rounded-[28px] border p-4 shadow-lg ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 text-slate-300' : 'border-gray-200 bg-gray-50 text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-3xl border flex items-center justify-center shadow-lg ${
                  theme === 'dark' ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-white border-gray-200 text-slate-600'
                }`}>
                  <User size={20} />
                </div>
                {sidebarOpen && (
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{userTypeLabel}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button 
                  onClick={logout}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold text-white transition ${
                    theme === 'dark' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <LogOut size={16} />
                  Sair da conta
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 transition-all duration-300">
          <div className="relative">
            {theme === 'dark' && <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/90 to-transparent" />}
            
            <header className={`relative z-50 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/60 backdrop-blur-md'} px-8 py-6`}>
              <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-xl flex-1">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-3xl border py-3 pl-12 pr-4 outline-none transition focus:ring-2 ${
                      theme === 'dark'
                        ? 'border-white/10 bg-slate-900/80 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20'
                        : 'border-gray-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-11 w-11 items-center justify-center rounded-3xl border transition focus:outline-none ${
                      theme === 'dark'
                        ? 'border-white/10 bg-slate-900/80 text-slate-300 hover:bg-slate-900'
                        : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setProfileOpen(false);
                      }}
                      className={`relative inline-flex h-11 w-11 items-center justify-center rounded-3xl border transition focus:outline-none ${
                        theme === 'dark'
                          ? 'border-white/10 bg-slate-900/80 text-slate-300 hover:bg-slate-900'
                          : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                        <div className={`absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200 ${
                          theme === 'dark'
                            ? 'border-white/10 bg-slate-950/95 text-slate-200'
                            : 'border-gray-200 bg-white text-slate-800'
                        }`}>
                          <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
                            theme === 'dark' ? 'border-white/5' : 'border-gray-100'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Notificações</span>
                              {unreadCount > 0 && (
                                <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {unreadCount} novas
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
                            >
                              Marcar todas lidas
                            </button>
                          </div>
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {notifications.length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-6">Nenhuma notificação</p>
                            ) : (
                              [...notifications]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 5)
                                .map(n => (
                                <div 
                                  key={n.id} 
                                  onClick={() => !n.lida && handleMarkAsRead(n.id)}
                                  className={`p-3 rounded-xl transition duration-200 cursor-pointer ${
                                    !n.lida 
                                      ? (theme === 'dark' ? 'bg-white/[0.03] text-white border-l-2 border-emerald-500' : 'bg-emerald-50/50 text-slate-900 border-l-2 border-emerald-500') 
                                      : (theme === 'dark' ? 'text-slate-400 border-l-2 border-transparent hover:bg-white/[0.01]' : 'text-slate-500 border-l-2 border-transparent hover:bg-gray-50')
                                  } pl-3`}
                                >
                                  <p className="text-xs font-semibold">{n.titulo}</p>
                                  <p className="text-[11px] leading-relaxed mt-0.5">{n.mensagem}</p>
                                  <span className="text-[9px] text-slate-500 mt-1 block">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                              ))
                            )}
                          </div>
                          {notifications.length > 5 && (
                            <div className={`mt-3 pt-3 border-t text-center ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                              <span className="text-xs text-slate-500">
                                Mostrando as 5 mais recentes
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => {
                        setProfileOpen(!profileOpen);
                        setNotificationsOpen(false);
                      }}
                      className={`inline-flex h-11 items-center gap-3 rounded-3xl border pl-2 pr-4 transition focus:outline-none ${
                        theme === 'dark'
                          ? 'border-white/10 bg-slate-900/80 text-slate-200 hover:bg-slate-900'
                          : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                        theme === 'dark' ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-gray-100 border-gray-200 text-slate-600'
                      }`}>
                        <User size={16} />
                      </div>
                      <span className="hidden sm:inline-block text-sm font-medium">{userName}</span>
                      <ChevronDown size={18} className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                        <div className={`absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200 ${
                          theme === 'dark'
                            ? 'border-white/10 bg-slate-950/95 text-slate-200'
                            : 'border-gray-200 bg-white text-slate-800'
                        }`}>
                          <div className="h-20 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 relative">
                            <div className="absolute -bottom-6 left-5">
                              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg ${
                                theme === 'dark' ? 'bg-slate-800 border-slate-950 text-white' : 'bg-white border-white text-slate-800'
                              }`}>
                                <User size={24} />
                              </div>
                            </div>
                            <div className="absolute right-5 top-5 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Ativo
                            </div>
                          </div>

                          <div className={`px-5 pt-9 pb-4 text-left border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <h3 className={`text-base font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user ? `${user.nome} ${user.sobrenome || ''}`.trim() : 'Usuário'}</h3>
                            <p className="text-sm text-slate-400 truncate mt-0.5">{user?.email || 'usuario@biblioteca.com'}</p>
                            
                            <div className={`mt-4 grid grid-cols-2 gap-3 text-xs border rounded-xl p-3 ${
                              theme === 'dark' ? 'text-slate-400 bg-white/[0.02] border-white/5' : 'text-slate-600 bg-gray-50 border-gray-200'
                            }`}>
                              <div>
                                <span className="block text-slate-500 text-[10px] uppercase tracking-wider">Acesso</span>
                                <span className={`font-semibold mt-0.5 block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{userTypeLabel}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 text-[10px] uppercase tracking-wider">Registro</span>
                                <span className={`font-semibold mt-0.5 block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user?.id ? `Matrícula #${String(user.id).padStart(5, '0')}` : 'Matrícula #00001'}</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 mt-3 text-right">
                              Desde: {user?.dataCadastro ? new Date(user.dataCadastro).toLocaleDateString('pt-BR') : '16/06/2026'}
                            </p>
                          </div>

                          <div className="p-1.5 space-y-0.5">
                            <button 
                              onClick={() => {
                                setActiveTab('configuracoes');
                                setProfileOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-xs rounded-lg transition ${
                                theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]' : 'text-slate-700 hover:text-slate-950 hover:bg-gray-100'
                              }`}
                            >
                              <Settings size={14} />
                              Configurações de Conta
                            </button>
                            <button 
                              onClick={() => {
                                setActiveTab('ajuda');
                                setProfileOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-xs rounded-lg transition ${
                                theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]' : 'text-slate-700 hover:text-slate-950 hover:bg-gray-100'
                              }`}
                            >
                              <HelpCircle size={14} />
                              Central de Ajuda
                            </button>
                            <div className={`border-t my-1 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`} />
                            <button 
                              onClick={() => {
                                setProfileOpen(false);
                                logout();
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                            >
                              <LogOut size={14} />
                              Sair da conta
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <main className="px-8 py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
