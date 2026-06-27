import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { X } from 'lucide-react';

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
  const { theme, showUserModal, setShowUserModal, editingUser, userForm, setUserForm, handleSaveUser } = useDashboard();

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
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Turma / Sala</label>
              <input type="text" value={userForm.anoSala} onChange={e => setUserForm({...userForm, anoSala: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} placeholder="Ex: 1ºA, Sala dos Professores" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="text" value={userForm.telefone} onChange={e => setUserForm({...userForm, telefone: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
            </div>
            {userForm.tipoUsuario === 'ALUNO' && (
              <div>
                <label className="block text-sm font-medium mb-1">Ano Início E.M.</label>
                <input type="number" value={userForm.anoInicioEnsinoMedio} onChange={e => setUserForm({...userForm, anoInicioEnsinoMedio: e.target.value})} className={`w-full rounded-2xl border px-4 py-2.5 outline-none transition text-sm ${theme === 'dark' ? 'bg-slate-950 border-white/10 focus:border-sky-400 text-white' : 'bg-white border-gray-300 focus:border-blue-500 text-slate-900'}`} />
              </div>
            )}
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
              <option value="accent">Retirar Livro (Azul)</option>
              <option value="danger">Devolver Livro (Vermelho)</option>
              <option value="warning">Aviso Importante (Amarelo)</option>
              <option value="success">Outro (Verde)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowEventModal(false)} className={`px-4 py-2 text-sm font-semibold rounded-2xl border transition ${theme === 'dark' ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-slate-700 hover:bg-gray-100'}`}>
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
