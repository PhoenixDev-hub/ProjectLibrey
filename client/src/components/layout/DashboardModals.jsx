import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { X, Search, User, BookOpen, Check, Sparkles, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export const BookModal = () => {
  const { theme, showBookModal, setShowBookModal, editingBook, bookForm, setBookForm, handleSaveBook } = useDashboard();

  if (!showBookModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
      <div className={`relative w-full max-w-lg rounded-[28px] border p-6 shadow-2xl z-[110] ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
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
  );
};

export const UserModal = () => {
  const { theme, showUserModal, setShowUserModal, editingUser, userForm, setUserForm, handleSaveUser, errorMsg } = useDashboard();

  if (!showUserModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
      <div className={`relative w-full max-w-lg rounded-[28px] border p-6 shadow-2xl z-[110] ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{editingUser ? 'Editar Leitor' : 'Adicionar Leitor'}</h3>
          <button onClick={() => setShowUserModal(false)} className={`p-1.5 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-150 text-slate-600 hover:text-slate-900'}`}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-500 px-4 py-2.5 rounded-2xl text-xs font-semibold mb-4">
            {errorMsg}
          </div>
        )}

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
              <select 
                value={userForm.tipoUsuario} 
                onChange={e => {
                  const newType = e.target.value;
                  setUserForm({
                    ...userForm,
                    tipoUsuario: newType,
                    anoSala: newType === 'ALUNO' ? '1A' : newType === 'PROFESSOR' ? 'Sala dos Professores' : ''
                  });
                }} 
                className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}
              >
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
                <option value="BIBLIOTECARIA">Bibliotecária</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Turma / Sala</label>
              {userForm.tipoUsuario === 'ALUNO' ? (
                <select 
                  value={userForm.anoSala || '1A'} 
                  onChange={e => {
                    const val = e.target.value;
                    const gradeMatch = val.match(/\d/);
                    let computedYear = userForm.anoInicioEnsinoMedio;
                    if (gradeMatch) {
                      const grade = Number(gradeMatch[0]);
                      const currentYear = new Date().getFullYear();
                      computedYear = currentYear - grade + 1;
                    }
                    setUserForm({
                      ...userForm,
                      anoSala: val,
                      anoInicioEnsinoMedio: computedYear
                    });
                  }} 
                  className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}
                >
                  {['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D'].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={userForm.anoSala} 
                  onChange={e => setUserForm({...userForm, anoSala: e.target.value})} 
                  className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} 
                  placeholder="Ex: Sala dos Professores" 
                  disabled={['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(userForm.tipoUsuario)}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="text" value={userForm.telefone} onChange={e => setUserForm({...userForm, telefone: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano Início E.M.</label>
              <input 
                type="number" 
                value={userForm.anoInicioEnsinoMedio} 
                onChange={e => setUserForm({...userForm, anoInicioEnsinoMedio: e.target.value})} 
                className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}
                placeholder="Ex: 2026"
              />
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
  );
};

export const EventModal = () => {
  const { theme, showEventModal, setShowEventModal, eventForm, setEventForm, handleAddEvent } = useDashboard();

  if (!showEventModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowEventModal(false)} />
      <div className={`relative w-full max-w-md rounded-[28px] border p-6 shadow-2xl z-[110] ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Adicionar Evento</h3>
          <button onClick={() => setShowEventModal(false)} className={`p-1.5 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-150 text-slate-600 hover:text-slate-900'}`}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Título do Evento</label>
            <input required type="text" placeholder="Ex: Devolver: O Hobbit" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}>
              <option value="accent">Evento na Biblioteca (Azul)</option>
              <option value="danger">Biblioteca Fechada (Vermelho)</option>
              <option value="warning">Aviso Importante (Amarelo)</option>
              <option value="success">Outro (Verde)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowEventModal(false)} className={`px-4 py-2 text-sm font-semibold rounded-2xl border transition ${theme === 'dark' ? 'border-white/10 text-slate-350 hover:bg-white/5' : 'border-gray-300 text-slate-700 hover:bg-gray-100'}`}>
              Cancelar
            </button>
            <button type="submit" className={`px-5 py-2 text-sm font-semibold rounded-2xl text-white transition ${theme === 'dark' ? 'bg-sky-500 hover:bg-sky-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              Salvar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ReservaModal = () => {
  const { 
    theme, 
    showReservaModal, 
    setShowReservaModal, 
    books, 
    users, 
    user: loggedUser, 
    handleReservarLivro,
    getCDDAreaName
  } = useDashboard();

  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(loggedUser?.tipoUsuario);

  const [step, setStep] = useState(1); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (showReservaModal) {
      setStep(ehBibliotecaria ? 1 : 2);
    }
  }, [showReservaModal, ehBibliotecaria]);

  if (!showReservaModal) return null;

  const isDark = theme === 'dark';

  const safeUsers = Array.isArray(users) ? users : [];
  const safeBooks = Array.isArray(books) ? books : [];

  const filteredUsers = safeUsers.filter(u => {
    if (['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(u.tipoUsuario)) return false;
    const term = userSearch.toLowerCase();
    const fullName = `${u.nome || ''} ${u.sobrenome || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const room = (u.anoSala || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || room.includes(term);
  });

  const filteredBooks = safeBooks.filter(b => {
    const term = bookSearch.toLowerCase();
    const friendlyArea = getCDDAreaName(b.area).toLowerCase();
    return (
      (b.titulo && b.titulo.toLowerCase().includes(term)) ||
      (b.autor && b.autor.toLowerCase().includes(term)) ||
      (b.area && b.area.toLowerCase().includes(term)) ||
      friendlyArea.includes(term)
    );
  });

  const recommendedBooks = safeBooks.slice(0, 4);

  const handleClose = () => {
    setShowReservaModal(false);
    setSelectedUser(null);
    setSelectedBook(null);
    setUserSearch('');
    setBookSearch('');
    setErrorMsg('');
    setStep(ehBibliotecaria ? 1 : 2);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (ehBibliotecaria && !selectedUser) {
      setErrorMsg('Por favor, selecione o leitor.');
      setStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const targetUserId = ehBibliotecaria ? selectedUser.id : undefined;
      await handleReservarLivro(selectedBook.id, targetUserId);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.erro || err.response?.data?.error || 'Erro ao realizar reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative w-full max-w-xl rounded-[32px] border p-6 shadow-2xl z-[110] transition-all duration-300
        ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}
      `}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              Nova Reserva
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Solicitação de reserva de livros do acervo.
            </p>
          </div>
          <button onClick={handleClose} className={`p-1.5 rounded-full transition ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-150 text-slate-500'}`}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-500 px-4 py-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {ehBibliotecaria && (
          <div className="flex items-center gap-2 mb-6 text-xs font-bold justify-center">
            <span className={`px-3 py-1.5 rounded-full transition ${step === 1 ? 'bg-sky-500 text-slate-950' : (selectedUser ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500')}`}>
              1. Selecionar Leitor
            </span>
            <ArrowRight size={12} className="text-slate-500" />
            <span className={`px-3 py-1.5 rounded-full transition ${step === 2 ? 'bg-sky-500 text-slate-950' : (selectedBook ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500')}`}>
              2. Selecionar Livro
            </span>
            <ArrowRight size={12} className="text-slate-500" />
            <span className={`px-3 py-1.5 rounded-full transition ${step === 3 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              3. Confirmar
            </span>
          </div>
        )}

        {step === 1 && ehBibliotecaria && (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold">Quem é o leitor que está solicitando?</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </span>
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Pesquisar por nome, email ou sala do aluno..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition outline-none font-medium
                  ${isDark ? 'bg-slate-950 border-white/10 text-white focus:border-sky-550' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}
              />
            </div>

            <div className={`border rounded-2xl overflow-hidden ${isDark ? 'border-white/10 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-700/30">
                {filteredUsers.length === 0 ? (
                  <p className="text-center p-6 text-xs text-slate-400 font-semibold">Nenhum leitor encontrado.</p>
                ) : (
                  filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setStep(2);
                      }}
                      className={`w-full text-left p-3.5 flex items-center justify-between transition-all hover:bg-sky-500/5 text-xs font-semibold
                        ${selectedUser?.id === u.id ? (isDark ? 'bg-sky-500/10' : 'bg-sky-50') : ''}
                      `}
                    >
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.nome} {u.sobrenome}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${isDark ? 'bg-slate-800 text-slate-350' : 'bg-gray-200 text-slate-700'}`}>
                        {u.anoSala || 'Professor / Outro'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold">Qual livro deseja reservar?</label>
              {ehBibliotecaria && selectedUser && (
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-bold">
                  Para: {selectedUser.nome}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </span>
              <input
                type="text"
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                placeholder="Pesquisar por título, autor ou área..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition outline-none font-medium
                  ${isDark ? 'bg-slate-950 border-white/10 text-white focus:border-sky-550' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`}
              />
            </div>

            <div className={`border rounded-2xl overflow-hidden ${isDark ? 'border-white/10 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-700/30">
                {bookSearch.trim() === '' ? (
                  <div>
                    <div className="px-3.5 py-2.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/5">
                      <Sparkles size={12} />
                      RECOMENDAÇÕES DE LEITURA
                    </div>
                    {recommendedBooks.length === 0 ? (
                      <p className="text-center p-6 text-xs text-slate-400 font-semibold">Nenhum livro no acervo.</p>
                    ) : (
                      recommendedBooks.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBook(b);
                            setStep(3);
                          }}
                          className="w-full text-left p-3.5 flex items-center justify-between transition hover:bg-sky-500/5 text-xs font-semibold"
                        >
                          <div>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.titulo}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Autor: {b.autor}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${isDark ? 'bg-slate-800 text-slate-350' : 'bg-gray-200 text-slate-700'}`}>
                            {getCDDAreaName(b.area)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="px-3.5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-500/5">
                      RESULTADOS DA BUSCA
                    </div>
                    {filteredBooks.length === 0 ? (
                      <p className="text-center p-6 text-xs text-slate-400 font-semibold">Nenhum livro encontrado.</p>
                    ) : (
                      filteredBooks.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBook(b);
                            setStep(3);
                          }}
                          className="w-full text-left p-3.5 flex items-center justify-between transition hover:bg-sky-500/5 text-xs font-semibold"
                        >
                          <div>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.titulo}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Autor: {b.autor}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${isDark ? 'bg-slate-800 text-slate-350' : 'bg-gray-200 text-slate-700'}`}>
                            {getCDDAreaName(b.area)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {ehBibliotecaria && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition
                  ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-200 text-slate-700 hover:bg-gray-100'}`}
              >
                <ArrowLeft size={14} />
                Voltar para Leitor
              </button>
            )}
          </div>
        )}

        {step === 3 && selectedBook && (
          <form onSubmit={handleConfirm} className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-center mb-1">Confirmar Solicitação de Reserva</h4>

            <div className="flex flex-col gap-3">
              {ehBibliotecaria && selectedUser && (
                <div className={`p-4 rounded-2xl border flex gap-3 items-center ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                  <User size={20} className="text-sky-500 shrink-0" />
                  <div className="text-xs font-semibold leading-snug">
                    <p className="font-bold text-[10px] uppercase text-slate-450 tracking-wider">Leitor:</p>
                    <p className={isDark ? 'text-white' : 'text-slate-900'}>{selectedUser.nome} {selectedUser.sobrenome}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedUser.email} • {selectedUser.anoSala || 'Professor'}</p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-2xl border flex gap-3 items-center ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                <BookOpen size={20} className="text-amber-500 shrink-0" />
                <div className="text-xs font-semibold leading-snug">
                  <p className="font-bold text-[10px] uppercase text-slate-450 tracking-wider">Livro:</p>
                  <p className={isDark ? 'text-white' : 'text-slate-900'}>{selectedBook.titulo}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Autor: {selectedBook.autor} • Área: {getCDDAreaName(selectedBook.area)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex-1 py-3 rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 border
                  ${isDark ? 'border-white/10 text-slate-350 hover:bg-slate-800 hover:text-white' : 'border-gray-300 text-slate-600 hover:bg-gray-100 hover:text-slate-900'}`}
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-[2] py-3 rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-sm text-slate-950
                  ${isDark ? 'bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800/40' : 'bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-200 text-slate-950'}`}
              >
                {submitting ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Check size={14} strokeWidth={3} />
                )}
                Confirmar Reserva
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
