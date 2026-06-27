import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const DashboardContext = createContext({});

export const DashboardProvider = ({ children }) => {
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
  const [showEventModal, setShowEventModal] = useState(false);

  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, date: '2026-06-07', title: 'Devolver: 1984', type: 'danger' },
    { id: 2, date: '2026-06-07', title: 'Retirar: O Hobbit', type: 'accent' },
    { id: 3, date: '2026-06-12', title: 'Devolver: Dom Casmurro', type: 'warning' },
    { id: 4, date: '2026-06-14', title: 'Retirar: O Pequeno Príncipe', type: 'success' },
    { id: 5, date: '2026-06-16', title: 'Devolver: Harry Potter', type: 'danger' },
    { id: 6, date: '2026-06-16', title: 'Retirar: Sapiens', type: 'accent' },
    { id: 7, date: '2026-06-20', title: 'Devolver: O Senhor dos Anéis', type: 'danger' },
    { id: 8, date: '2026-06-28', title: 'Devolver: A Menina que Roubava Livros', type: 'warning' },
    { id: 9, date: '2026-06-10', title: 'Feira do Livro 2026', type: 'accent' },
    { id: 10, date: '2026-06-25', title: 'Clube de Leitura: Suspense', type: 'warning' }
  ]);

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

  const [eventForm, setEventForm] = useState({
    date: '',
    title: '',
    type: 'accent' // default type
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventForm.date || !eventForm.title) return;
    
    setCalendarEvents([...calendarEvents, {
      id: Date.now(),
      ...eventForm
    }]);
    
    setShowEventModal(false);
    setEventForm({ date: '', title: '', type: 'accent' });
    setSuccessMsg('Evento adicionado com sucesso!');
  };

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

  const value = {
    user, logout, setUser,
    sidebarOpen, setSidebarOpen,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    currentDate, setCurrentDate,
    notificationsOpen, setNotificationsOpen,
    profileOpen, setProfileOpen,
    theme, setTheme,
    books, setBooks,
    reservations, setReservations,
    users, setUsers,
    notifications, setNotifications,
    loading, setLoading,
    successMsg, setSuccessMsg,
    errorMsg, setErrorMsg,
    selectedCategory, setSelectedCategory,
    showBookModal, setShowBookModal,
    editingBook, setEditingBook,
    showUserModal, setShowUserModal,
    editingUser, setEditingUser,
    bookForm, setBookForm,
    userForm, setUserForm,
    showEventModal, setShowEventModal,
    calendarEvents, setCalendarEvents,
    eventForm, setEventForm,
    handleReservarLivro, handleAtualizarReservaStatus, handleRegistrarRetirada, handleRegistrarDevolucao,
    handleMarkAsRead, handleMarkAllAsRead,
    handleSaveBook, handleDeletarLivro, handleAdicionarExemplar, handleDeletarExemplar,
    handleSaveUser, handleToggleUserStatus, handleUpdateProfile, handleAddEvent
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
