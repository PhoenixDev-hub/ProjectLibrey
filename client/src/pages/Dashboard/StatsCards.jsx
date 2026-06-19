import { BookOpen, Calendar, ShoppingCart, Users } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    { title: 'Total de Livros', value: stats.totalLivros, icon: BookOpen, color: 'blue' },
    { title: 'Empréstimos Ativos', value: stats.emprestimosAtivos, icon: ShoppingCart, color: 'green' },
    { title: 'Leitores Cadastrados', value: stats.leitoresCadastrados, icon: Users, color: 'purple' },
    { title: 'Reservas Pendentes', value: stats.reservasPendentes, icon: Calendar, color: 'yellow' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${colorClasses[card.color]}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
