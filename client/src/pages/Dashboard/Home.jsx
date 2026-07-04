import React from 'react';
import { DashboardProvider, useDashboard } from '../../contexts/DashboardContext';
import DashboardShell from '../../components/layout/DashboardShell';
import { BookModal, EventModal, ReservaModal, UserModal } from '../../components/layout/DashboardModals';

import Inicio from './components/Inicio';
import Catalogo from './components/Catalogo';
import Emprestimos from './components/Emprestimos';
import Reservas from './components/Reservas';
import Leitores from './components/Leitores';
import Ajuda from './components/Ajuda';
import Configuracoes from './components/Configuracoes';
import AnaliseLiteraria from './components/AnaliseLiteraria';

const DashboardContent = () => {
  const { activeTab, user } = useDashboard();

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Inicio />;
      case 'catalogo':
        return <Catalogo />;
      case 'emprestimos':
        return <Emprestimos />;
      case 'reservas':
        return <Reservas />;
      case 'analise-literaria':
        return <AnaliseLiteraria />;
      case 'leitores':
        return <Leitores />;
      case 'ajuda':
        return <Ajuda />;
      case 'configuracoes':
        return ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(user?.tipoUsuario) ? <Configuracoes /> : <Inicio />;
      default:
        return (
          <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center">
            <div className={`w-full max-w-3xl rounded-[32px] border p-10 shadow-lg bg-slate-900/80 border-white/10 shadow-[0_40px_120px_rgba(15,23,42,0.45)]`}>
              <div className="mb-6 flex items-center justify-between text-slate-300">
                <span className="text-sm uppercase tracking-[0.2em]">{activeTab}</span>
                <span className="text-xs text-slate-500">Conteúdo em desenvolvimento</span>
              </div>
              <div className={`rounded-3xl border p-12 text-center bg-slate-950/70 border-white/10`}>
                <p className="text-xl font-semibold text-white">Seção {activeTab}</p>
                <p className="mt-3 text-slate-400">Estamos trabalhando para trazer este conteúdo em breve.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardShell>
      {renderContent()}
      <BookModal />
      <UserModal />
      <ReservaModal />
      <EventModal />
    </DashboardShell>
  );
};

const Home = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default Home;
