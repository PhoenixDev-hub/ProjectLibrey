import { Bell, ChevronDown, LogOut, Search, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const userName = user?.nome || 'Usuário';
  const userTypeLabels = {
    ALUNO: 'Aluno',
    PROFESSOR: 'Professor',
    BIBLIOTECARIA: 'Bibliotecária',
    ADMINISTRADOR: 'Administrador',
  };
  const userTypeLabel = userTypeLabels[user?.tipoUsuario] || user?.tipoUsuario || 'Usuário';

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar livros, leitores..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 border-l pl-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{userTypeLabel}</p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronDown size={16} />
              </button>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg"
            >
              <LogOut size={18} />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span>{formattedDate}</span>
          <span className="mx-2">•</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
