import Calendar from "../../../components/layout/calendar";
import { useDashboard } from "../../../contexts/DashboardContext";
import { BookOpen, AlertCircle, Bookmark, Users } from "lucide-react";

const Inicio = () => {
  const { theme, user, reservations, users, setShowReservaModal } = useDashboard();
  const isDark = theme === 'dark';

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const acervoStats = (() => {
    const hoje = new Date();
    
    const totalEmprestimosReal = safeReservations.filter(r => r.status === 'RETIRADO').length;
    const totalExpiradosReal = safeReservations.filter(r => r.status === 'RETIRADO' && r.prazoDevol && new Date(r.prazoDevol) < hoje).length;
    const totalReservasReal = safeReservations.filter(r => r.status === 'PENDENTE').length;
    const totalAprovadosReal = safeReservations.filter(r => r.status === 'APROVADO').length;

    const hasRealData = safeReservations.length > 0;

    const fallbackStats = [
      { status: 'No Prazo', count: 89, percentage: 63, tailwindColor: 'bg-blue-500', strokeColor: '#3b82f6' },
      { status: 'Atrasados', count: 18, percentage: 13, tailwindColor: 'bg-rose-500', strokeColor: '#f43f5e' },
      { status: 'Aguardando Retirada', count: 25, percentage: 17, tailwindColor: 'bg-emerald-500', strokeColor: '#10b981' },
      { status: 'Pendentes', count: 10, percentage: 7, tailwindColor: 'bg-amber-500', strokeColor: '#f59e0b' },
    ];

    if (!hasRealData) {
      return {
        total: 142,
        data: fallbackStats,
        displayEmprestimos: 142,
        displayExpirados: 18,
        displayReservas: 35,
        displayLeitores: safeUsers.length > 0 ? safeUsers.length : 890
      };
    }

    const noPrazoCount = safeReservations.filter(r => r.status === 'RETIRADO' && r.prazoDevol && new Date(r.prazoDevol) >= hoje).length;
    const atrasadosCount = totalExpiradosReal;
    const aguardandoCount = totalAprovadosReal;
    const pendentesCount = totalReservasReal;

    const total = noPrazoCount + atrasadosCount + aguardandoCount + pendentesCount;

    if (total === 0) {
      return {
        total: 0,
        data: [
          { status: 'No Prazo', count: 0, percentage: 0, tailwindColor: 'bg-blue-500', strokeColor: '#3b82f6' },
          { status: 'Atrasados', count: 0, percentage: 0, tailwindColor: 'bg-rose-500', strokeColor: '#f43f5e' },
          { status: 'Aguardando Retirada', count: 0, percentage: 0, tailwindColor: 'bg-emerald-500', strokeColor: '#10b981' },
          { status: 'Pendentes', count: 0, percentage: 0, tailwindColor: 'bg-amber-500', strokeColor: '#f59e0b' },
        ],
        displayEmprestimos: 0,
        displayExpirados: 0,
        displayReservas: 0,
        displayLeitores: safeUsers.length > 0 ? safeUsers.length : 890
      };
    }

    const data = [
      { status: 'No Prazo', count: noPrazoCount, percentage: Math.round((noPrazoCount / total) * 100), tailwindColor: 'bg-blue-500', strokeColor: '#3b82f6' },
      { status: 'Atrasados', count: atrasadosCount, percentage: Math.round((atrasadosCount / total) * 100), tailwindColor: 'bg-rose-500', strokeColor: '#f43f5e' },
      { status: 'Aguardando Retirada', count: aguardandoCount, percentage: Math.round((aguardandoCount / total) * 100), tailwindColor: 'bg-emerald-500', strokeColor: '#10b981' },
      { status: 'Pendentes', count: pendentesCount, percentage: Math.round((pendentesCount / total) * 100), tailwindColor: 'bg-amber-500', strokeColor: '#f59e0b' },
    ].sort((a, b) => b.count - a.count);

    return {
      total,
      data,
      displayEmprestimos: totalEmprestimosReal,
      displayExpirados: totalExpiradosReal,
      displayReservas: totalReservasReal,
      displayLeitores: safeUsers.length > 0 ? safeUsers.length : 890
    };
  })();

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // Aprox. 238.76
  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-6">
        
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-amber-600 to-yellow-500'}
        `}>
          <div className="relative z-10 text-white">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo(a) de volta, {user?.nome || 'Bibliotecário'}!</h1>
            <p className="opacity-90 font-medium mb-6">Aqui está o resumo das atividades da biblioteca hoje. Tudo pronto para começar?</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowReservaModal(true)}
                className="bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm text-sm"
              >
                Nova Reserva
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Empréstimos" 
            value={acervoStats.displayEmprestimos} 
            icon={BookOpen} 
            colorClass={isDark ? "text-sky-400 bg-sky-400/10" : "text-amber-600 bg-amber-600/10"} 
            isDark={isDark} 
          />
          <StatCard 
            title="Expirados" 
            value={acervoStats.displayExpirados} 
            icon={AlertCircle} 
            colorClass="text-rose-500 bg-rose-500/10" 
            isDark={isDark} 
          />
          <StatCard 
            title="Reservas" 
            value={acervoStats.displayReservas} 
            icon={Bookmark} 
            colorClass={isDark ? "text-emerald-400 bg-emerald-400/10" : "text-emerald-600 bg-emerald-600/10"} 
            isDark={isDark} 
          />
          <StatCard 
            title="Leitores Ativos" 
            value={acervoStats.displayLeitores} 
            icon={Users} 
            colorClass={isDark ? "text-violet-400 bg-violet-400/10" : "text-violet-600 bg-violet-600/10"} 
            isDark={isDark} 
          />
        </div>

        <div className={`rounded-3xl border p-6 shadow-sm flex flex-col flex-1 ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Visão Geral de Empréstimos</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Proporção de empréstimos e reservas por status</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full bg-slate-100/10 ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
              Total: {acervoStats.total} registros
            </span>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4">
            
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  className={isDark ? "stroke-slate-800" : "stroke-slate-150"}
                  strokeWidth="8" 
                  fill="transparent" 
                />
                
                {acervoStats.data.map((stat, idx) => {
                  const dashArray = `${(stat.percentage * circumference) / 100} ${circumference}`;
                  const dashOffset = -((accumulatedPercentage * circumference) / 100);
                  accumulatedPercentage += stat.percentage;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={stat.strokeColor}
                      strokeWidth="8"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  );
                })}
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-905'}`}>
                  {acervoStats.total}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total
                </span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md flex flex-col gap-4">
              {acervoStats.data.map((stat, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${stat.tailwindColor}`} />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{stat.status}</span>
                    </div>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>
                      {stat.count} ({stat.percentage}%)
                    </span>
                  </div>
                  
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div 
                      className={`h-full rounded-full ${stat.tailwindColor} transition-all duration-1000`} 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      <div className="w-full xl:w-[360px] shrink-0 flex flex-col gap-6">
        <Calendar />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, isDark }) => (
  <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 transition hover:scale-[1.02] ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div>
      <p className={`text-2xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
    </div>
  </div>
);

export default Inicio;
