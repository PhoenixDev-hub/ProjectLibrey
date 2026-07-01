import {
    AlertCircle,
    ChevronDown, ChevronUp,
    Edit2, Lock,
    Plus,
    Search,
    Trophy,
    Unlock,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

const Leitores = () => {
  const {
    theme, users, reservations,
    handleToggleUserStatus, setShowUserModal, setEditingUser, setUserForm, loading, errorMsg
  } = useDashboard();

  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAnos, setExpandedAnos] = useState({
    '1º Ano': true,
    '2º Ano': true,
    '3º Ano': true,
    'Professores': false
  });

  const safeUsers = Array.isArray(users) ? users : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const hoje = new Date();

  const getDynamicClassroom = (u) => {
    if (u.tipoUsuario !== 'ALUNO') return 'Outros';
    if (!u.anoSala) return 'Sem Turma';

    const suffixMatch = u.anoSala.match(/[a-zA-Z]+/);
    const suffix = suffixMatch ? suffixMatch[0].toUpperCase() : 'A';

    const currentYear = new Date().getFullYear();
    const entryYear = Number(u.anoInicioEnsinoMedio);
    if (!entryYear) return u.anoSala;

    const calculatedYear = currentYear - entryYear + 1;

    if (calculatedYear === 1) return `1${suffix}`;
    if (calculatedYear === 2) return `2${suffix}`;
    if (calculatedYear === 3) return `3${suffix}`;
    if (calculatedYear > 3) return 'Concluído';
    return u.anoSala;
  };

  const getAno = (sala) => {
    if (sala === 'Outros' || sala === 'Sem Turma' || sala === 'Concluído') return 'Outros';
    if (sala.startsWith('1')) return '1º Ano';
    if (sala.startsWith('2')) return '2º Ano';
    if (sala.startsWith('3')) return '3º Ano';
    return 'Outros';
  };

  const classroomStats = (() => {
    const classGroups = {};

    safeUsers.forEach(u => {
      const classRoom = getDynamicClassroom(u);
      if (classRoom === 'Outros' || classRoom === 'Sem Turma' || classRoom === 'Concluído') return;

      if (!classGroups[classRoom]) {
        classGroups[classRoom] = {
          nome: classRoom,
          delays: 0,
          reads: 0,
          actives: 0
        };
      }
    });

    safeReservations.forEach(r => {
      if (!r.usuario) return;
      const classRoom = getDynamicClassroom(r.usuario);
      if (classRoom === 'Outros' || classRoom === 'Sem Turma' || classRoom === 'Concluído') return;

      if (!classGroups[classRoom]) {
        classGroups[classRoom] = {
          nome: classRoom,
          delays: 0,
          reads: 0,
          actives: 0
        };
      }

      if (r.status === 'RETIRADO') {
        classGroups[classRoom].actives += 1;
        if (r.prazoDevol && new Date(r.prazoDevol) < hoje) {
          classGroups[classRoom].delays += 1;
        }
      } else if (r.status === 'DEVOLVIDO') {
        classGroups[classRoom].reads += 1;
      }
    });

    const list = Object.values(classGroups);

    list.forEach(c => {
      const total = c.actives + c.reads;
      c.rate = total === 0 ? 100 : Math.round(((total - c.delays) / total) * 100);
    });

    list.sort((a, b) => {
      if (a.rate !== b.rate) {
        return b.rate - a.rate;
      }
      return b.reads - a.reads;
    });

    return list;
  })();

  const goldClasses = classroomStats.filter(c => c.rate === 100);

  const getClassClassification = (rate) => {
    if (rate === 100) return 'Ouro';
    if (rate >= 95) return 'Prata';
    if (rate >= 90) return 'Bronze';
    return 'Menção Honrosa';
  };

  const groupedUsers = (() => {
    const groups = {
      '1º Ano': {},
      '2º Ano': {},
      '3º Ano': {},
      'Professores': {}
    };

    safeUsers.forEach(u => {
      const sala = getDynamicClassroom(u);
      if (sala === 'Concluído') return;

      if (u.tipoUsuario !== 'ALUNO' && u.tipoUsuario !== 'PROFESSOR') return;

      const matchesSearch =
        (u.nome && u.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.sobrenome && u.sobrenome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.anoSala && u.anoSala.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return;

      const ano = u.tipoUsuario === 'PROFESSOR' ? 'Professores' : getAno(sala);
      const groupKey = u.tipoUsuario === 'PROFESSOR' ? 'Professor' : sala;

      if (!groups[ano][groupKey]) {
        groups[ano][groupKey] = [];
      }

      const userRes = safeReservations.filter(r => r.usuarioId === u.id);
      const actives = userRes.filter(r => r.status === 'RETIRADO').length;
      const delays = userRes.filter(r => r.status === 'RETIRADO' && r.prazoDevol && new Date(r.prazoDevol) < hoje).length;
      const reads = userRes.filter(r => r.status === 'DEVOLVIDO').length;

      groups[ano][groupKey].push({
        ...u,
        dynamicClassroom: groupKey,
        stats: { actives, delays, reads }
      });
    });

    return groups;
  })();

  const handleEdit = (u) => {
    setEditingUser(u);
    setUserForm({
      nome: u.nome || '',
      sobrenome: u.sobrenome || '',
      email: u.email || '',
      senha: '',
      anoSala: u.anoSala || '',
      tipoUsuario: u.tipoUsuario || 'ALUNO',
      anoInicioEnsinoMedio: u.anoInicioEnsinoMedio || new Date().getFullYear(),
      telefone: u.telefone || '',
    });
    setShowUserModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setUserForm({
      nome: '',
      sobrenome: '',
      email: '',
      senha: '',
      anoSala: '',
      tipoUsuario: 'ALUNO',
      anoInicioEnsinoMedio: new Date().getFullYear(),
      telefone: '',
    });
    setShowUserModal(true);
  };

  const toggleSection = (ano) => {
    setExpandedAnos(prev => ({
      ...prev,
      [ano]: !prev[ano]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-650 to-violet-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Leitores</h1>
            <p className="opacity-90 font-medium mb-6">Gerencie os leitores da escola e acompanhe a gincana.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-sky-400' : 'bg-violet-50 text-violet-600'}`}>
            <Users size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Carregando leitores...</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estamos organizando os dados dos leitores e das turmas.</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-650 to-violet-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Leitores</h1>
            <p className="opacity-90 font-medium mb-6">Gerencie os leitores da escola e acompanhe a gincana.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
            <AlertCircle size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Não foi possível carregar os leitores</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (safeUsers.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
          ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-650 to-violet-500'}
        `}>
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl font-extrabold mb-2">Leitores</h1>
            <p className="opacity-90 font-medium mb-6">Gerencie os leitores da escola e acompanhe a gincana.</p>
          </div>
        </div>

        <div className={`rounded-3xl border p-16 text-center ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            <Users size={28} />
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhum leitor cadastrado</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quando novos leitores forem cadastrados, eles aparecerão aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-violet-650 to-violet-500'}
      `}>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Leitores</h1>
          <p className="opacity-90 font-medium mb-6">
            Gerencie os leitores da escola e acompanhe a gincana. Turmas com 100% de entrega são premiadas como Turma Ouro.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAdd}
              className="bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              Novo Leitor
            </button>
            {goldClasses.length > 0 && (
              <div className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-yellow-500/30 text-yellow-250 border border-yellow-500/20">
                Turma Ouro: {goldClasses.map(c => c.nome).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      {classroomStats.length > 0 && (
        <div className={`rounded-3xl border p-6 shadow-sm ${isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-2.5 mb-6">
            <Trophy className="text-yellow-500" size={24} />
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Gincana da Turma Leitora</h2>
              <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>Turmas classificadas pelo menor índice de atraso e maior número de leituras finalizadas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classroomStats.slice(0, 3).map((c) => {
              const classification = getClassClassification(c.rate);
              const colors = {
                'Ouro': { border: 'border-yellow-500/30 bg-yellow-500/[0.03]', text: 'text-yellow-500', label: 'Turma Ouro' },
                'Prata': { border: 'border-slate-350/30 bg-slate-350/[0.03]', text: 'text-slate-455', label: 'Turma Prata' },
                'Bronze': { border: 'border-amber-700/30 bg-amber-700/[0.03]', text: 'text-amber-600', label: 'Turma Bronze' },
                'Menção Honrosa': { border: 'border-sky-500/30 bg-sky-500/[0.03]', text: 'text-sky-400', label: 'Menção Honrosa' }
              };
              const cStyle = colors[classification] || colors['Menção Honrosa'];
              return (
                <div key={c.nome} className={`rounded-2xl border p-5 flex flex-col justify-between ${cStyle.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 ${cStyle.text}`}>
                      {cStyle.label} ({c.rate}%)
                    </span>
                    {classification === 'Ouro' && <Trophy size={18} className="text-yellow-500 animate-pulse" />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.nome}</h3>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-slate-950/20 p-2 rounded-xl border border-white/5">
                        <span className={`block text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.reads}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Lidos</span>
                      </div>
                      <div className="bg-slate-950/20 p-2 rounded-xl border border-white/5">
                        <span className={`block text-lg font-black ${c.delays > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{c.delays}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Atrasos</span>
                      </div>
                      <div className="bg-slate-950/20 p-2 rounded-xl border border-white/5">
                        <span className={`block text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.actives}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Ativos</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`rounded-3xl border p-5 shadow-sm flex items-center gap-4 ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
          <input
            type="text"
            placeholder="Buscar leitor por nome, email ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${
              isDark
                ? 'border-white/10 bg-slate-950 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20'
                : 'border-gray-350 bg-white text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {['1º Ano', '2º Ano', '3º Ano', 'Professores'].map(ano => {
          const classesInAno = groupedUsers[ano] || {};
          const classNames = Object.keys(classesInAno);
          const hasUsers = classNames.some(name => classesInAno[name].length > 0);
          const isExpanded = expandedAnos[ano];

          if (!hasUsers && searchTerm !== '') return null;

          return (
            <div key={ano} className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
              <button
                onClick={() => toggleSection(ano)}
                className={`w-full px-6 py-4 flex items-center justify-between font-bold text-base cursor-pointer ${
                  isDark ? 'hover:bg-slate-900 text-white' : 'hover:bg-slate-55 text-slate-855'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-violet-500" />
                  <span>{ano}</span>
                  {hasUsers && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-650'
                    }`}>
                      {Object.values(classesInAno).reduce((acc, curr) => acc + curr.length, 0)} leitores
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isExpanded && (
                <div className={`p-6 border-t flex flex-col gap-6 ${isDark ? 'border-white/5 bg-slate-950/20' : 'border-gray-150 bg-slate-50/30'}`}>
                  {!hasUsers ? (
                    <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-450'}`}>Nenhum leitor nesta categoria.</p>
                  ) : (
                    classNames.map(salaName => {
                      const students = classesInAno[salaName] || [];
                      if (students.length === 0) return null;
                      const classStats = classroomStats.find(cs => cs.nome === salaName) || { rate: 100 };
                      const classification = getClassClassification(classStats.rate);
                      const isTeacherGroup = ano === 'Professores';

                      return (
                        <div key={salaName} className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-sm font-black ${isDark ? 'text-slate-355' : 'text-slate-700'}`}>
                              {isTeacherGroup ? 'Corpo Docente' : `Turma: ${salaName}`}
                            </h3>
                            {!isTeacherGroup && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                classification === 'Ouro' ? 'bg-yellow-500/20 text-yellow-250 border border-yellow-500/20' :
                                classification === 'Prata' ? 'bg-slate-350/20 text-slate-400 border border-slate-300/30' :
                                classification === 'Bronze' ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                                'bg-rose-500/20 text-rose-450 border border-rose-500/20'
                              }`}>
                                {classification === 'Ouro' ? `Turma Ouro (100%)` :
                                 classification === 'Prata' ? `Turma Prata (${classStats.rate}%)` :
                                 classification === 'Bronze' ? `Turma Bronze (${classStats.rate}%)` :
                                 `Menção Honrosa (${classStats.rate}%)`}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map(u => {
                              const isBlocked = u.status === 'BLOQUEADO';
                              return (
                                <div
                                  key={u.id}
                                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] ${
                                    isDark
                                      ? 'border-white/5 bg-slate-900/40 hover:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="overflow-hidden">
                                        <h4 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                          {u.nome} {u.sobrenome}
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-500'} truncate`}>
                                          {u.email}
                                        </p>
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                        isBlocked
                                          ? 'bg-rose-500/20 text-rose-450 border border-rose-500/20'
                                          : 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/20'
                                      }`}>
                                        {u.status}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                      <div className="bg-slate-950/10 py-1.5 px-1 rounded-xl border border-white/5">
                                        <span className={`block text-sm font-bold ${isDark ? 'text-slate-355' : 'text-slate-700'}`}>{u.stats.reads}</span>
                                        <span className="text-[8px] text-slate-500 uppercase font-black">Lidos</span>
                                      </div>
                                      <div className="bg-slate-950/10 py-1.5 px-1 rounded-xl border border-white/5">
                                        <span className={`block text-sm font-bold ${isDark ? 'text-slate-355' : 'text-slate-700'}`}>{u.stats.actives}</span>
                                        <span className="text-[8px] text-slate-500 uppercase font-black">Ativos</span>
                                      </div>
                                      <div className="bg-slate-950/10 py-1.5 px-1 rounded-xl border border-white/5">
                                        <span className={`block text-sm font-bold ${u.stats.delays > 0 ? 'text-rose-500' : (isDark ? 'text-slate-355' : 'text-slate-700')}`}>{u.stats.delays}</span>
                                        <span className="text-[8px] text-slate-500 uppercase font-black">Atrasos</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`flex items-center justify-between border-t mt-4 pt-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>
                                      ID: #{String(u.id).padStart(5, '0')}
                                    </span>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEdit(u)}
                                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                          isDark
                                            ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white'
                                            : 'border-gray-250 hover:bg-slate-100 text-slate-655 hover:text-slate-900'
                                        }`}
                                        title="Editar Leitor"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                          isBlocked
                                            ? 'border-emerald-500/30 text-emerald-450 hover:bg-emerald-500/10'
                                            : 'border-rose-500/30 text-rose-450 hover:bg-rose-500/10'
                                        }`}
                                        title={isBlocked ? 'Desbloquear Leitor' : 'Bloquear Leitor'}
                                      >
                                        {isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leitores;
