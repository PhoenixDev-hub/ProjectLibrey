import {
  Bell,
  Book,
  BookOpen,
  Calendar,
  ChevronDown,
  HelpCircle,
  Home as HomeIcon,
  LogOut,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  User,
  Users,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Filter,
  BookMarked,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';


const Home = () => {
  const { user, logout, setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Dynamic lists from backend
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Modals state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Forms state
  const [bookForm, setBookForm] = useState({
    titulo: '',
    autor: '',
    editora: '',
    anoPublicacao: '',
    isbn: '',
    area: 'Ficção',
    sinopse: '',
  });

  const [userForm, setUserForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    anoSala: '',
    tipoUsuario: 'ALUNO',
    anoInicioEnsinoMedio: new Date().getFullYear(),
    telefone: '',
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const booksRes = await api.get('/livros');
      setBooks(booksRes.data);
      
      try {
        const resRes = await api.get('/reservas');
        setReservations(resRes.data);
      } catch (err) {
        console.log("Error loading reservations:", err);
      }

      const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);
      if (ehBibliotecaria) {
        try {
          const usersRes = await api.get('/usuarios');
          setUsers(usersRes.data);
        } catch (err) {
          console.log("Error loading users:", err);
        }
      }

      try {
        const notifRes = await api.get('/notificacoes');
        setNotifications(notifRes.data.notificacoes || []);
      } catch (err) {
        console.log("Error loading notifications:", err);
      }
    } catch (err) {
      setErrorMsg('Erro ao obter dados do servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Reservation management actions
  const handleReservarLivro = async (livroId) => {
    try {
      await api.post('/reservas', { livroId });
      setSuccessMsg('Reserva solicitada com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.erro || err.response?.data?.error || 'Erro ao realizar reserva.');
    }
  };

  const handleAtualizarReservaStatus = async (reservaId, acao) => {
    try {
      await api.patch(`/reservas/${reservaId}/status`, { acao });
      setSuccessMsg(`Reserva ${acao === 'APROVAR' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao atualizar status da reserva.');
    }
  };

  const handleRegistrarRetirada = async (reservaId) => {
    try {
      await api.patch(`/reservas/${reservaId}/retirar`);
      setSuccessMsg('Retirada registrada com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao registrar retirada.');
    }
  };

  const handleRegistrarDevolucao = async (reservaId) => {
    try {
      await api.patch(`/reservas/${reservaId}/devolver`);
      setSuccessMsg('Devolução registrada com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao registrar devolução.');
    }
  };

  // Notification actions
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/lida`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notificacoes/marcar-todas-lidas');
      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Book CRUD actions
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        anoPublicacao: bookForm.anoPublicacao ? Number(bookForm.anoPublicacao) : null
      };

      if (editingBook) {
        await api.put(`/livros/${editingBook.id}`, payload);
        setSuccessMsg('Livro atualizado com sucesso!');
      } else {
        await api.post('/livros', payload);
        setSuccessMsg('Livro cadastrado com sucesso!');
      }
      setShowBookModal(false);
      setEditingBook(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar livro.');
    }
  };

  const handleDeletarLivro = async (livroId) => {
    if (!window.confirm('Deseja realmente excluir este livro?')) return;
    try {
      await api.delete(`/livros/${livroId}`);
      setSuccessMsg('Livro excluído com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao excluir livro.');
    }
  };

  const handleAdicionarExemplar = async (livroId) => {
    try {
      const codigo = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
      await api.post('/exemplares', { livroId, codigo });
      setSuccessMsg('Exemplar adicionado com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao adicionar exemplar.');
    }
  };

  const handleDeletarExemplar = async (exemplarId) => {
    if (!window.confirm('Excluir este exemplar?')) return;
    try {
      await api.delete(`/exemplares/${exemplarId}`);
      setSuccessMsg('Exemplar removido com sucesso!');
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao remover exemplar.');
    }
  };

  // User CRUD actions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...userForm,
        anoInicioEnsinoMedio: Number(userForm.anoInicioEnsinoMedio)
      };

      if (editingUser) {
        if (!payload.senha) {
          delete payload.senha;
        }
        await api.put(`/usuarios/${editingUser.id}`, payload);
        setSuccessMsg('Leitor atualizado com sucesso!');
      } else {
        await api.post('/cadastro', payload);
        setSuccessMsg('Leitor cadastrado com sucesso!');
      }
      setShowUserModal(false);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar leitor.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
      await api.put(`/usuarios/${userId}`, { status: newStatus });
      setSuccessMsg(`Status do leitor alterado com sucesso!`);
      fetchData();
    } catch (err) {
      setErrorMsg('Erro ao alterar status do leitor.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const nomeInput = e.target.nome.value;
      const sobrenomeInput = e.target.sobrenome.value;
      const emailInput = e.target.email.value;
      const telefoneInput = e.target.telefone.value;

      const res = await api.put('/me', {
        nome: nomeInput,
        sobrenome: sobrenomeInput,
        email: emailInput,
        telefone: telefoneInput
      });

      setUser({
        ...user,
        nome: res.data.nome,
        sobrenome: res.data.sobrenome,
        email: res.data.email,
        telefone: res.data.telefone
      });

      setSuccessMsg('Perfil atualizado com sucesso!');
    } catch (err) {
      setErrorMsg('Erro ao atualizar perfil.');
    }
  };

  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedDayOfWeek = currentDate.toLocaleDateString('pt-BR', {
    weekday: 'long'
  });

  const userTypeLabels = {
    ALUNO: 'Aluno',
    PROFESSOR: 'Professor',
    BIBLIOTECARIA: 'Bibliotecária',
    ADMINISTRADOR: 'Administrador',
  };

  const userName = user?.nome || 'Usuário';
  const userType = user?.tipoUsuario || 'ALUNO';
  const userTypeLabel = userTypeLabels[userType] || userType;
  const userInitial = userName.charAt(0).toUpperCase();
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const allMenuItems = [
    { id: 'inicio', label: 'Início', icon: HomeIcon },
    { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
    { id: 'emprestimos', label: 'Empréstimos', icon: ShoppingCart },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'ajuda', label: 'Central de ajuda', icon: HelpCircle },
    { id: 'leitores', label: 'Leitores', icon: Users, roles: ['BIBLIOTECARIA', 'ADMINISTRADOR'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.roles || item.roles.includes(userType)
  );

  useEffect(() => {
    if (!menuItems.some((item) => item.id === activeTab)) {
      setActiveTab(menuItems[0]?.id || 'inicio');
    }
  }, [menuItems, activeTab]);

  const faqItems = [
    { id: 1, pergunta: 'Como faço uma reserva?', resposta: 'Abra a seção do Catálogo, busque o livro desejado e clique em Reservar para solicitar a reserva.' },
    { id: 2, pergunta: 'Como funciona a devolução?', resposta: 'Após aprovação da sua reserva pela bibliotecária, retire o livro na biblioteca. Devolva-o no prazo especificado.' },
    { id: 3, pergunta: 'Como cadastro um novo leitor?', resposta: 'Vá até a seção de Leitores (disponível para bibliotecárias) e clique em “Adicionar leitor”.' },
  ];

  const livrosCatalogo = [
    { id: 1, titulo: 'O Alquimista', autor: 'Paulo Coelho', categoria: 'Ficção', disponivel: true, Icon: BookOpen },
    { id: 2, titulo: 'Dom Casmurro', autor: 'Machado de Assis', categoria: 'Clássicos', disponivel: false, Icon: Book },
    { id: 3, titulo: '1984', autor: 'George Orwell', categoria: 'Distopia', disponivel: true, Icon: BookOpen },
    { id: 4, titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', categoria: 'Infantil', disponivel: true, Icon: Book },
    { id: 5, titulo: 'A Arte da Guerra', autor: 'Sun Tzu', categoria: 'Estratégia', disponivel: true, Icon: BookOpen },
    { id: 6, titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', categoria: 'Ficção', disponivel: false, Icon: Book },
  ];

  const stats = {
    totalLivros: 1234,
    emprestimosAtivos: 45,
    leitoresCadastrados: 567,
    reservasPendentes: 12,
  };

  const renderContent = () => {
    const isDark = theme === 'dark';
    
    // Theme-based class helpers
    const textTitle = isDark ? 'text-white' : 'text-slate-900';
    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
    const cardBg = isDark ? 'bg-slate-950/90 border-white/10 text-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.25)]' : 'bg-white border-gray-200 text-slate-800 shadow-sm';
    const panelBg = isDark ? 'bg-slate-900/80 border-white/10 shadow-[0_40px_120px_rgba(15,23,42,0.45)]' : 'bg-white border-gray-200 shadow-sm';
    const inputBg = isDark ? 'bg-slate-950/80 border-white/10 text-slate-100 focus:border-sky-400' : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500';
    const tableRowBg = isDark ? 'bg-slate-950/80 border-white/5 text-slate-300' : 'bg-white border-gray-100 text-slate-700 shadow-sm';
    const btnPrimary = isDark ? 'bg-sky-500 hover:bg-sky-400' : 'bg-blue-600 hover:bg-blue-700';
    const tagNeutral = isDark ? 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-sky-400' : 'border-gray-300 bg-white text-slate-700 hover:border-blue-600';

    const totalLivros = books.length;
    const totalExemplares = books.reduce((acc, b) => acc + (b.exemplares?.length || 0), 0);
    const totalEmprestimos = reservations.filter(r => r.status === 'RETIRADO').length;
    const totalLeitores = users.length;
    const totalReservasPendentes = reservations.filter(r => r.status === 'PENDENTE').length;

    switch (activeTab) {
      case 'inicio':
        return (
          <div className="min-h-[calc(100vh-3rem)]" />
        );

      case 'catalogo':
        const categories = ['Todos', ...new Set(books.map(b => b.area).filter(Boolean))];
        const filteredBooks = books.filter(b => {
          const matchesSearch = searchQuery === '' || 
            b.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.isbn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.area.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesCategory = selectedCategory === 'Todos' || b.area === selectedCategory;
          return matchesSearch && matchesCategory;
        });

        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className={`mb-8 flex flex-col gap-4 rounded-[32px] border p-8 shadow-lg ${panelBg}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className={`text-3xl font-semibold ${textTitle}`}>Catálogo de livros</h2>
                  <p className={`mt-2 ${textMuted}`}>Explore o catálogo disponível, filtre por categoria e gerencie exemplares.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por título, autor, área ou ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-3xl border py-3 pl-12 pr-4 outline-none transition focus:ring-2 ${inputBg}`}
                    />
                  </div>
                  {['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType) && (
                    <button 
                      onClick={() => {
                        setEditingBook(null);
                        setBookForm({ titulo: '', autor: '', editora: '', anoPublicacao: '', isbn: '', area: 'Ficção', sinopse: '' });
                        setShowBookModal(true);
                      }}
                      className="rounded-3xl bg-emerald-500 text-slate-950 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-400 flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Livro
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                {categories.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedCategory(tag)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedCategory === tag 
                        ? (isDark ? 'bg-sky-500 border-sky-400 text-white font-semibold shadow-md' : 'bg-blue-600 border-blue-600 text-white font-semibold shadow-sm')
                        : tagNeutral
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {filteredBooks.map((livro) => {
                const totalCopies = livro.exemplares?.length || 0;
                const availableCopies = livro.exemplares?.filter(e => e.status === 'DISPONIVEL').length || 0;
                const isAvailable = availableCopies > 0;
                const ehLeitor = !['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType);
                const jaReservado = reservations.some(
                  r => r.exemplar?.livroId === livro.id && 
                  r.usuarioId === user?.id && 
                  ['PENDENTE', 'APROVADO', 'RETIRADO'].includes(r.status)
                );

                return (
                  <div key={livro.id} className={`rounded-[32px] border p-6 flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${isDark ? 'bg-slate-800 text-sky-300' : 'bg-blue-50 text-blue-600'}`}>
                            {isAvailable ? <BookOpen size={24} /> : <Book size={24} />}
                          </div>
                          <div>
                            <h3 className={`text-xl font-semibold ${textTitle}`}>{livro.titulo}</h3>
                            <p className={`text-sm ${textMuted}`}>{livro.autor} · {livro.area}</p>
                          </div>
                        </div>
                        {['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType) && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingBook(livro);
                                setBookForm({
                                  titulo: livro.titulo,
                                  autor: livro.autor,
                                  editora: livro.editora || '',
                                  anoPublicacao: livro.anoPublicacao || '',
                                  isbn: livro.isbn || '',
                                  area: livro.area,
                                  sinopse: livro.sinopse || '',
                                });
                                setShowBookModal(true);
                              }}
                              className={`p-2 rounded-xl border transition ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-gray-250 hover:bg-gray-100 text-slate-700'}`}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeletarLivro(livro.id)}
                              className="p-2 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {livro.sinopse && (
                        <p className={`mt-4 text-xs leading-relaxed line-clamp-3 ${textMuted}`}>{livro.sinopse}</p>
                      )}

                      {/* Exemplars details for librarians */}
                      {['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType) && (
                        <div className={`mt-6 border-t pt-4 ${isDark ? 'border-white/5' : 'border-gray-150'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Exemplares ({totalCopies})</span>
                            <button 
                              onClick={() => handleAdicionarExemplar(livro.id)}
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                            >
                              + Exemplar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                            {livro.exemplares?.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">Nenhum exemplar cadastrado</p>
                            ) : (
                              livro.exemplares?.map(exp => (
                                <div key={exp.id} className={`flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-lg border ${
                                  exp.status === 'DISPONIVEL'
                                    ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                                    : exp.status === 'RESERVADO'
                                    ? (isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
                                    : (isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700')
                                }`}>
                                  <span>{exp.codigo}</span>
                                  <button 
                                    onClick={() => handleDeletarExemplar(exp.id)}
                                    className="hover:text-rose-500 font-bold ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 border-slate-700/20">
                      <div className="flex flex-col">
                        <span className={`text-[11px] ${textMuted}`}>Estoque</span>
                        <span className={`text-sm font-semibold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {availableCopies} de {totalCopies} {totalCopies === 1 ? 'cópia' : 'cópias'}
                        </span>
                      </div>
                      
                      {ehLeitor && (
                        jaReservado ? (
                          <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-4 py-2 rounded-3xl font-medium">
                            Solicitação Ativa
                          </span>
                        ) : (
                          <button 
                            onClick={() => isAvailable && handleReservarLivro(livro.id)}
                            disabled={!isAvailable}
                            className={`rounded-3xl px-5 py-2 text-sm font-semibold transition ${
                              isAvailable 
                                ? (isDark ? 'bg-sky-500 text-white hover:bg-sky-400' : 'bg-blue-600 text-white hover:bg-blue-700') 
                                : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? 'Reservar' : 'Esgotado'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'emprestimos':
        const ehBibliotecariaEmpr = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType);
        const activeLoans = reservations.filter(r => {
          const isLoanType = ['RETIRADO', 'APROVADO'].includes(r.status);
          const matchesSearch = searchQuery === '' ||
            r.exemplar?.livro?.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.usuario?.sobrenome.toLowerCase().includes(searchQuery.toLowerCase());
          return isLoanType && matchesSearch;
        });

        const totalAtivos = reservations.filter(r => r.status === 'RETIRADO').length;
        const totalAtrasados = reservations.filter(r => r.status === 'RETIRADO' && r.prazoDevol && new Date(r.prazoDevol) < new Date()).length;
        const totalAprovados = reservations.filter(r => r.status === 'APROVADO').length;

        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className={`rounded-[32px] border p-6 shadow-lg ${cardBg}`}>
                <p className={`text-sm uppercase tracking-[0.2em] ${textMuted}`}>Empréstimos ativos</p>
                <p className={`mt-4 text-3xl font-semibold ${textTitle}`}>{totalAtivos}</p>
                <p className={`mt-2 ${textMuted}`}>Livros atualmente com leitores.</p>
              </div>
              <div className={`rounded-[32px] border p-6 shadow-lg ${cardBg}`}>
                <p className={`text-sm uppercase tracking-[0.2em] ${textMuted}`}>Aguardando retirada</p>
                <p className={`mt-4 text-3xl font-semibold ${textTitle}`}>{totalAprovados}</p>
                <p className={`mt-2 ${textMuted}`}>Reservas aprovadas prontas para entrega.</p>
              </div>
              <div className={`rounded-[32px] border p-6 shadow-lg border-rose-500/20 bg-rose-500/5`}>
                <p className={`text-sm uppercase tracking-[0.2em] text-rose-400`}>Atrasados</p>
                <p className={`mt-4 text-3xl font-semibold text-rose-500`}>{totalAtrasados}</p>
                <p className={`mt-2 ${textMuted}`}>Devolução fora do prazo regulamentar.</p>
              </div>
            </div>

            <div className={`rounded-[32px] border p-6 shadow-lg ${cardBg}`}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className={`text-2xl font-semibold ${textTitle}`}>Lista de empréstimos e retiradas</h2>
                  <p className={`text-sm ${textMuted}`}>Gerenciamento e acompanhamento de devoluções.</p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por leitor ou livro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-3xl border py-2.5 pl-12 pr-4 outline-none transition focus:ring-2 ${inputBg}`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className={`text-sm ${textMuted}`}>
                      <th className="px-4 py-3">Livro</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Leitor</th>
                      <th className="px-4 py-3">Prazo Limite</th>
                      <th className="px-4 py-3">Status</th>
                      {ehBibliotecariaEmpr && <th className="px-4 py-3 text-right">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                          Nenhum empréstimo ativo no momento.
                        </td>
                      </tr>
                    ) : (
                      activeLoans.map((loan) => {
                        const isOverdue = loan.status === 'RETIRADO' && loan.prazoDevol && new Date(loan.prazoDevol) < new Date();
                        return (
                          <tr key={loan.id} className={`${tableRowBg} transition duration-150`}>
                            <td className="px-4 py-4 font-semibold text-white">{loan.exemplar?.livro?.titulo}</td>
                            <td className="px-4 py-4 text-xs font-mono">{loan.exemplar?.codigo}</td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium">{loan.usuario?.nome} {loan.usuario?.sobrenome}</p>
                                <p className="text-[10px] text-slate-500">{loan.usuario?.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {loan.prazoDevol 
                                ? new Date(loan.prazoDevol).toLocaleDateString('pt-BR') 
                                : 'Aguardando retirada'}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                loan.status === 'APROVADO'
                                  ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-800')
                                  : isOverdue
                                  ? 'bg-rose-500/15 text-rose-300 animate-pulse'
                                  : (isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-800')
                              }`}>
                                {loan.status === 'APROVADO' ? 'Aguardando Retirada' : isOverdue ? 'Atrasado' : 'Ativo'}
                              </span>
                            </td>
                            {ehBibliotecariaEmpr && (
                              <td className="px-4 py-4 text-right">
                                {loan.status === 'APROVADO' && (
                                  <button
                                    onClick={() => handleRegistrarRetirada(loan.id)}
                                    className="rounded-full bg-sky-500 hover:bg-sky-400 text-white text-xs px-3.5 py-1.5 font-semibold transition"
                                  >
                                    Entregar Livro
                                  </button>
                                )}
                                {loan.status === 'RETIRADO' && (
                                  <button
                                    onClick={() => handleRegistrarDevolucao(loan.id)}
                                    className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-3.5 py-1.5 font-semibold transition"
                                  >
                                    Devolver Livro
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reservas':
        const ehBibliotecariaRes = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userType);
        const filteredReservations = reservations.filter(r => {
          const matchesSearch = searchQuery === '' ||
            r.exemplar?.livro?.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.usuario?.sobrenome.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });

        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className={`mb-8 rounded-[32px] border p-8 shadow-lg ${panelBg}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className={`text-3xl font-semibold ${textTitle}`}>Fila de Reservas</h2>
                  <p className={`mt-2 ${textMuted}`}>Acompanhe solicitações de reserva e aprove entregas.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar reservas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-3xl border py-2.5 pl-12 pr-4 outline-none transition focus:ring-2 ${inputBg}`}
                  />
                </div>
              </div>
            </div>

            <div className={`rounded-[32px] border p-6 shadow-lg ${cardBg}`}>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className={`text-sm uppercase tracking-[0.2em] ${textMuted}`}>
                      <th className="px-4 py-3 text-left">Livro</th>
                      <th className="px-4 py-3 text-left">Leitor</th>
                      <th className="px-4 py-3 text-left">Solicitado Em</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      {ehBibliotecariaRes && <th className="px-4 py-3 text-right">Decisão</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={ehBibliotecariaRes ? 5 : 4} className="text-center py-8 text-slate-500 italic">
                          Nenhuma reserva encontrada.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((reserva) => (
                        <tr key={reserva.id} className={`${tableRowBg}`}>
                          <td className="px-4 py-4 font-semibold text-white">{reserva.exemplar?.livro?.titulo}</td>
                          <td className="px-4 py-4 text-slate-300">
                            {reserva.usuario?.nome} {reserva.usuario?.sobrenome}
                            <span className="block text-[10px] text-slate-500">{reserva.usuario?.email}</span>
                          </td>
                          <td className="px-4 py-4 text-slate-300">
                            {new Date(reserva.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              reserva.status === 'PENDENTE'
                                ? 'bg-amber-500/15 text-amber-300'
                                : reserva.status === 'APROVADO'
                                ? 'bg-sky-500/15 text-sky-300'
                                : reserva.status === 'RETIRADO'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : reserva.status === 'DEVOLVIDO'
                                ? 'bg-slate-700/30 text-slate-400'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}>
                              {reserva.status}
                            </span>
                          </td>
                          {ehBibliotecariaRes && (
                            <td className="px-4 py-4 text-right">
                              {reserva.status === 'PENDENTE' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAtualizarReservaStatus(reserva.id, 'APROVAR')}
                                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition"
                                    title="Aprovar"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleAtualizarReservaStatus(reserva.id, 'REJEITAR')}
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition"
                                    title="Rejeitar"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'leitores':
        const filteredUsers = users.filter(u => {
          const fullName = `${u.nome} ${u.sobrenomeSolo || ''}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase()) || 
                 u.email.toLowerCase().includes(searchQuery.toLowerCase());
        });

        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className={`mb-8 rounded-[32px] border p-8 shadow-lg ${panelBg}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className={`text-3xl font-semibold ${textTitle}`}>Leitores</h2>
                  <p className={`mt-2 ${textMuted}`}>Gerencie cadastros, acompanhe empréstimos ativos e altere permissões de acesso.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar leitores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-3xl border py-3 pl-12 pr-4 outline-none transition focus:ring-2 ${inputBg}`}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({
                        nome: '',
                        sobrenome: '',
                        email: '',
                        senha: '',
                        anoSala: '',
                        tipoUsuario: 'ALUNO',
                        anoInicioEnsinoMedio: new Date().getFullYear(),
                        telefone: '',
                      });
                      setShowUserModal(true);
                    }}
                    className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 flex items-center gap-2"
                  >
                    <Plus size={16} /> Novo Leitor
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.length === 0 ? (
                <p className="col-span-full text-center py-8 text-slate-500 italic">Nenhum leitor encontrado.</p>
              ) : (
                filteredUsers.map((leitor) => (
                  <div key={leitor.id} className={`rounded-[32px] border p-6 flex flex-col justify-between shadow-lg ${cardBg}`}>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className={`text-lg font-semibold truncate ${textTitle}`}>{leitor.nome}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{leitor.email}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          leitor.status === 'ATIVO' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {leitor.status === 'ATIVO' ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs border rounded-xl p-3 border-slate-700/20 bg-slate-950/20">
                        <div>
                          <span className="block text-slate-500 text-[10px] uppercase">Acesso</span>
                          <span className="font-semibold text-white">{userTypeLabels[leitor.tipoUsuario] || leitor.tipoUsuario}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 text-[10px] uppercase">Turma/Sala</span>
                          <span className="font-semibold text-white">{leitor.anoSala || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-400">
                        <p className="flex justify-between">
                          <span>Empréstimos Ativos:</span>
                          <span className="font-bold text-white">{leitor.emprestimos || 0}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Reservas:</span>
                          <span className="font-bold text-white">{leitor.reservas || 0}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 border-t pt-4 border-slate-700/20">
                      <button 
                        onClick={() => {
                          setEditingUser(leitor);
                          setUserForm({
                            nome: leitor.nomeSolo,
                            sobrenome: leitor.sobrenomeSolo,
                            email: leitor.email,
                            senha: '',
                            anoSala: leitor.anoSala || '',
                            tipoUsuario: leitor.tipoUsuario,
                            anoInicioEnsinoMedio: leitor.anoInicioEnsinoMedio || new Date().getFullYear(),
                            telefone: leitor.telefone || '',
                          });
                          setShowUserModal(true);
                        }}
                        className={`flex-1 rounded-2xl border text-center py-2 text-xs font-semibold transition ${
                          isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-gray-300 hover:bg-gray-50 text-slate-800'
                        }`}
                      >
                        Editar Info
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(leitor.id, leitor.status)}
                        className={`flex-1 rounded-2xl text-center py-2 text-xs font-semibold transition ${
                          leitor.status === 'ATIVO' 
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {leitor.status === 'ATIVO' ? 'Bloquear' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'ajuda':
        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className={`mb-8 rounded-[32px] border p-8 shadow-lg ${panelBg}`}>
              <h2 className={`text-3xl font-semibold ${textTitle}`}>Central de ajuda</h2>
              <p className={`mt-2 ${textMuted}`}>Encontre respostas rápidas e acesse o suporte sempre que precisar.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {faqItems.map((faq) => (
                <div key={faq.id} className={`rounded-[32px] border p-6 shadow-lg ${cardBg}`}>
                  <p className="text-lg font-semibold">{faq.pergunta}</p>
                  <p className={`mt-3 ${textMuted}`}>{faq.resposta}</p>
                </div>
              ))}
            </div>

            <div className={`mt-8 rounded-[32px] border p-6 shadow-lg ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-gray-200'}`}>
              <h3 className="text-xl font-semibold">Precisa de ajuda personalizada?</h3>
              <p className={`mt-3 ${textMuted}`}>Envie uma mensagem para nossa equipe de suporte e responderemos em até 24 horas.</p>
              <button className="mt-5 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                Entrar em contato
              </button>
            </div>
          </div>
        );

      case 'configuracoes':
        return (
          <div className="min-h-[calc(100vh-3rem)] animate-in fade-in duration-300">
            <div className={`rounded-[32px] border p-8 shadow-lg ${cardBg}`}>
              <form onSubmit={handleUpdateProfile}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className={`text-3xl font-semibold ${textTitle}`}>Configurações</h2>
                    <p className={`mt-2 ${textMuted}`}>Personalize suas informações de perfil da biblioteca.</p>
                  </div>
                  <button type="submit" className={`rounded-3xl px-5 py-3 text-sm font-semibold transition ${btnPrimary} text-white`}>
                    Salvar alterações
                  </button>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <div className={`space-y-6 rounded-[32px] border p-6 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-gray-50 border-gray-250'}`}>
                    <p className="text-lg font-semibold">Conta</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block text-sm">
                          Nome
                          <input required name="nome" type="text" className={`mt-2 w-full rounded-3xl border px-4 py-3 outline-none transition ${inputBg}`} defaultValue={user?.nome || ''} />
                        </label>
                        <label className="block text-sm">
                          Sobrenome
                          <input required name="sobrenome" type="text" className={`mt-2 w-full rounded-3xl border px-4 py-3 outline-none transition ${inputBg}`} defaultValue={user?.sobrenome || ''} />
                        </label>
                      </div>
                      <label className="block text-sm">
                        Email
                        <input required name="email" type="email" className={`mt-2 w-full rounded-3xl border px-4 py-3 outline-none transition ${inputBg}`} defaultValue={user?.email || ''} />
                      </label>
                      <label className="block text-sm">
                        Telefone
                        <input name="telefone" type="text" className={`mt-2 w-full rounded-3xl border px-4 py-3 outline-none transition ${inputBg}`} defaultValue={user?.telefone || ''} />
                      </label>
                    </div>
                  </div>

                  <div className={`space-y-6 rounded-[32px] border p-6 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-gray-50 border-gray-250'}`}>
                    <p className="text-lg font-semibold">Informações Adicionais</p>
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-950/50' : 'bg-white border shadow-sm'}`}>
                        <div>
                          <p className="font-medium">Tipo de Conta</p>
                          <p className={`text-xs ${textMuted}`}>Categoria de acesso ao acervo.</p>
                        </div>
                        <span className="text-sm font-semibold">{userTypeLabel}</span>
                      </div>
                      <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-950/50' : 'bg-white border shadow-sm'}`}>
                        <div>
                          <p className="font-medium">Número de Matrícula</p>
                          <p className={`text-xs ${textMuted}`}>Identificação única no sistema.</p>
                        </div>
                        <span className="text-sm font-mono font-semibold">#{String(user?.id || 0).padStart(5, '0')}</span>
                      </div>
                      {user?.anoSala && (
                        <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-950/50' : 'bg-white border shadow-sm'}`}>
                          <div>
                            <p className="font-medium">Turma / Sala</p>
                            <p className={`text-xs ${textMuted}`}>Ano letivo correspondente.</p>
                          </div>
                          <span className="text-sm font-semibold">{user.anoSala}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center">
            <div className={`w-full max-w-3xl rounded-[32px] border p-10 shadow-lg ${panelBg}`}>
              <div className="mb-6 flex items-center justify-between text-slate-300">
                <span className="text-sm uppercase tracking-[0.2em]">{menuItems.find((item) => item.id === activeTab)?.label}</span>
                <span className="text-xs text-slate-500">Conteúdo em desenvolvimento</span>
              </div>
              <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-slate-950/70 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-xl font-semibold">Seção {menuItems.find((item) => item.id === activeTab)?.label}</p>
                <p className="mt-3">Estamos trabalhando para trazer este conteúdo em breve.</p>
              </div>
            </div>
          </div>
        );
    }
  };

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
            <header className={`relative border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/60 backdrop-blur-md'} px-8 py-6`}>
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
                  {/* Theme Toggle Button */}
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
                        <div className={`absolute right-0 mt-2 w-96 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
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
                              notifications.map(n => (
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
                        <div className={`absolute right-0 mt-2 w-84 rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                          theme === 'dark'
                            ? 'border-white/10 bg-slate-950/95 text-slate-200'
                            : 'border-gray-200 bg-white text-slate-800'
                        }`}>
                          {/* Banner & Avatar background */}
                          <div className="h-20 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 relative">
                            <div className="absolute -bottom-6 left-5">
                              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg ${
                                theme === 'dark' ? 'bg-slate-850 border-slate-950 text-white' : 'bg-white border-white text-slate-800'
                              }`}>
                                <User size={24} />
                              </div>
                            </div>
                            <div className="absolute right-5 top-5 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Ativo
                            </div>
                          </div>

                          {/* Profile Details */}
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

                          {/* Actions */}
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
          </main>
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
          <div className={`relative w-full max-w-lg rounded-[28px] border p-6 shadow-2xl z-10 ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{editingBook ? 'Editar Livro' : 'Adicionar Livro'}</h3>
              <button onClick={() => setShowBookModal(false)} className={`p-1.5 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-150 text-slate-600 hover:text-slate-900'}`}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input required type="text" value={bookForm.titulo} onChange={e => setBookForm({...bookForm, titulo: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Autor</label>
                  <input required type="text" value={bookForm.autor} onChange={e => setBookForm({...bookForm, autor: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Editora</label>
                  <input type="text" value={bookForm.editora || ''} onChange={e => setBookForm({...bookForm, editora: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ano de Publicação</label>
                  <input type="number" value={bookForm.anoPublicacao || ''} onChange={e => setBookForm({...bookForm, anoPublicacao: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ISBN</label>
                  <input type="text" value={bookForm.isbn || ''} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área / Categoria</label>
                <input required type="text" value={bookForm.area} onChange={e => setBookForm({...bookForm, area: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sinopse</label>
                <textarea value={bookForm.sinopse || ''} onChange={e => setBookForm({...bookForm, sinopse: e.target.value})} className={`w-full rounded-2xl border px-4 py-2 outline-none transition text-sm h-20 resize-none ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBookModal(false)} className={`px-4 py-2 text-sm font-semibold rounded-2xl border transition ${theme === 'dark' ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-slate-700 hover:bg-gray-100'}`}>
                  Cancelar
                </button>
                <button type="submit" className={`px-5 py-2 text-sm font-semibold rounded-2xl text-white transition ${theme === 'dark' ? 'bg-sky-500 hover:bg-sky-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className={`relative w-full max-w-lg rounded-[28px] border p-6 shadow-2xl z-10 ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{editingUser ? 'Editar Leitor' : 'Adicionar Leitor'}</h3>
              <button onClick={() => setShowUserModal(false)} className={`p-1.5 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-150 text-slate-600 hover:text-slate-900'}`}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input required type="text" value={userForm.nome} onChange={e => setUserForm({...userForm, nome: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobrenome</label>
                  <input required type="text" value={userForm.sobrenome} onChange={e => setUserForm({...userForm, sobrenome: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Senha</label>
                  <input required type="password" value={userForm.senha} onChange={e => setUserForm({...userForm, senha: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Usuário</label>
                  <select value={userForm.tipoUsuario} onChange={e => setUserForm({...userForm, tipoUsuario: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}>
                    <option value="ALUNO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="BIBLIOTECARIA">Bibliotecária</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ano/Sala (Ex: 1A, 2B)</label>
                  <input type="text" placeholder="Apenas para alunos" value={userForm.anoSala || ''} onChange={e => setUserForm({...userForm, anoSala: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ano Início Ensino Médio</label>
                  <input type="number" value={userForm.anoInicioEnsinoMedio} onChange={e => setUserForm({...userForm, anoInicioEnsinoMedio: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input type="text" value={userForm.telefone || ''} onChange={e => setUserForm({...userForm, telefone: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className={`px-4 py-2 text-sm font-semibold rounded-2xl border transition ${theme === 'dark' ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-slate-700 hover:bg-gray-100'}`}>
                  Cancelar
                </button>
                <button type="submit" className={`px-5 py-2 text-sm font-semibold rounded-2xl text-white transition ${theme === 'dark' ? 'bg-sky-500 hover:bg-sky-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default Home;
