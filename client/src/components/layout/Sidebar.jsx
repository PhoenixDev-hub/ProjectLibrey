import {
  BookOpen,
  Calendar, HelpCircle,
  Home,
  Menu,
  Settings,
  ShoppingCart, Users,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { id: '/', label: 'Início', icon: Home },
  { id: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { id: '/emprestimos', label: 'Empréstimos', icon: ShoppingCart },
  { id: '/leitores', label: 'Leitores', icon: Users },
  { id: '/reservas', label: 'Reservas', icon: Calendar },
  { id: '/ajuda', label: 'Central de ajuda', icon: HelpCircle },
  { id: '/configuracoes', label: 'Configurações', icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-20 flex flex-col`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-xl font-bold text-blue-600">Biblioteca</h1>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.id;

            return (
              <Link
                key={item.id}
                to={item.id}
                className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
