import { Clock3, User } from 'lucide-react';

const ActiveLoans = () => {
  const loans = [
    { id: 1, book: 'Alice no País das Maravilhas', borrower: 'Lucas Silva', dueDate: '12/06/2026' },
    { id: 2, book: '1984', borrower: 'Mariana Costa', dueDate: '18/06/2026' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-slate-100 p-3">
          <Clock3 className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Empréstimos ativos</h3>
      </div>
      <ul className="space-y-3">
        {loans.map((loan) => (
          <li key={loan.id} className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="font-medium text-slate-900">{loan.book}</p>
            <p className="text-sm text-slate-500">Emprestado para {loan.borrower}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>Devolução: {loan.dueDate}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveLoans;
