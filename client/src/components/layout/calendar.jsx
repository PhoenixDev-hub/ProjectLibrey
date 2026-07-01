import { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const shortMonthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const typeColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  accent: 'bg-blue-600',
};

const borderColors = {
  success: 'border-t-emerald-500',
  warning: 'border-t-amber-500',
  danger: 'border-t-rose-500',
  accent: 'border-t-blue-600',
};

export default function Calendar() {
  const { theme, calendarEvents, user, setShowEventModal, reservations } = useDashboard();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  const isDark = theme === 'dark';
  const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonthReal = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();

  // 1. Devoluções/Entregas dinâmicas a partir das reservas (status RETIRADO)
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const activeLoans = ehBibliotecaria 
    ? safeReservations.filter(r => r.status === 'RETIRADO')
    : safeReservations.filter(r => r.status === 'RETIRADO' && r.usuarioId === user?.id);

  const loanEvents = activeLoans
    .filter(r => r.prazoDevol)
    .map(r => {
      const dateObj = new Date(r.prazoDevol);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      return {
        id: `loan-${r.id}`,
        date: dateStr,
        title: ehBibliotecaria
          ? `Entrega: ${r.exemplar?.livro?.titulo || 'Livro'} (${r.usuario?.nome || 'Leitor'})`
          : `Entregar: ${r.exemplar?.livro?.titulo || 'Livro'}`,
        type: 'danger'
      };
    });

  // 2. Filtrar os eventos customizados da biblioteca (remover empréstimos estáticos)
  const customEvents = calendarEvents.filter(e => {
    const titleLower = e.title.toLowerCase();
    const isLoanEvent = titleLower.startsWith('devolver:') || 
                        titleLower.startsWith('retirar:') || 
                        titleLower.startsWith('entregar:') || 
                        titleLower.startsWith('entrega:');
    return !isLoanEvent;
  });

  // 3. Unir eventos
  const allEvents = [...loanEvents, ...customEvents];

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const renderDays = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = 42;
    const cells = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

      if (isCurrentMonth) {
        const events = getEventsForDate(dayNumber);
        const hasEvent = events.length > 0;
        const isToday = isCurrentMonthReal && dayNumber === currentDay;
        const uniqueTypes = [...new Set(events.map(e => e.type))].slice(0, 3);

        cells.push(
          <div
            key={i}
            className={`
              relative aspect-square flex flex-col items-center justify-center
              rounded-full text-xs font-semibold mx-auto w-8 h-8 cursor-pointer
              transition-colors duration-200
              ${isToday 
                ? 'bg-emerald-500 text-white shadow-md' 
                : isDark 
                  ? 'text-slate-300 hover:bg-slate-700' 
                  : 'text-slate-700 hover:bg-gray-100'
              }
            `}
          >
            <span className={hasEvent ? '-mt-1.5' : ''}>{dayNumber}</span>
            {hasEvent && (
              <div className="absolute bottom-1.5 flex gap-0.5">
                {uniqueTypes.map((type, idx) => (
                  <span key={idx} className={`w-1 h-1 rounded-full ${typeColors[type]}`} />
                ))}
              </div>
            )}
          </div>
        );
      } else {
        cells.push(<div key={i} className="aspect-square w-8 h-8" />);
      }
    }
    return cells;
  };

  const monthEvents = allEvents.filter(e => {
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m === month + 1;
  });

  const uniqueMonthEvents = [];
  const seen = new Set();
  monthEvents
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(e => {
      const key = e.date + e.title;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMonthEvents.push(e);
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <div className={`
        w-full rounded-3xl p-6 shadow-sm
        ${isDark ? 'bg-slate-800' : 'bg-white'}
      `}>
        <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Agenda</h3>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={goToPrevMonth} className={`text-lg transition hover:scale-110 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            &larr;
          </button>
          <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {monthNames[month]} {year}
          </span>
          <button onClick={goToNextMonth} className={`text-lg transition hover:scale-110 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            &rarr;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3 text-xs font-semibold text-slate-400 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {renderDays()}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-[10px] font-bold text-slate-505 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>{ehBibliotecaria ? 'Entrega de Livro / Fechada' : 'Minha Entrega / Fechada'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Evento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Aviso</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Eventos do Mês
          </h3>
          {ehBibliotecaria && (
            <button
              onClick={() => setShowEventModal(true)}
              className="text-xs font-semibold bg-sky-500 text-white px-2 py-1 rounded-lg hover:bg-sky-400 transition"
            >
              + Adicionar
            </button>
          )}
        </div>
        {uniqueMonthEvents.length === 0 ? (
          <div className={`p-4 rounded-xl text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Nenhum evento neste mês.
          </div>
        ) : (
          <>
            <div className={`flex flex-col gap-3 transition-all duration-300 ${
              showAllEvents 
                ? 'max-h-[230px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent' 
                : 'max-h-none overflow-visible'
            }`}>
              {(showAllEvents ? uniqueMonthEvents : uniqueMonthEvents.slice(0, 2)).map((e, idx) => {
                const [, m, d] = e.date.split('-').map(Number);
                return (
                  <div 
                    key={idx} 
                    className={`
                      flex items-center gap-4 p-3 rounded-2xl shadow-sm border-t-4
                      ${isDark ? 'bg-slate-800' : 'bg-white'} 
                      ${borderColors[e.type]}
                      opacity-100 transition-all duration-300
                    `}
                  >
                    <div className={`
                      flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-xl
                      ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'}
                    `}>
                      <span className="text-lg font-bold leading-none">{d}</span>
                      <span className="text-[10px] uppercase font-medium mt-0.5">{shortMonthNames[m - 1]}</span>
                    </div>
                    
                    <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {e.title}
                    </span>
                  </div>
                );
              })}
            </div>
            {uniqueMonthEvents.length > 2 && (
              <button 
                onClick={() => setShowAllEvents(!showAllEvents)}
                className={`text-xs font-semibold mt-1 py-2 w-full rounded-xl text-center transition-colors
                  ${isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-white/5' 
                    : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                  }
                `}
              >
                {showAllEvents ? 'Ver menos' : `Ver mais (+${uniqueMonthEvents.length - 2} eventos)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
