import {
  BookOpen,
  Calendar,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
  Users
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TipoUsuario } from "../../constants/enums";
import { useAuth } from "../../hooks/useAuth";

const anosSalas = [
  "1A", "1B", "1C", "1D",
  "2A", "2B", "2C", "2D",
  "3A", "3B", "3C", "3D"
];

export default function Cadastro() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    anoInicioEnsinoMedio: "",
    telefone: "",
    tipoUsuario: TipoUsuario.ALUNO,
    anoSala: "1A",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (form.senha !== form.confirmarSenha) {
      setErrorMessage("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    const anoAtual = new Date().getFullYear();
    if (
      form.anoInicioEnsinoMedio < 1900 ||
      form.anoInicioEnsinoMedio > anoAtual
    ) {
      setErrorMessage("Ano de início inválido");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        ...form,
        anoInicioEnsinoMedio: Number(form.anoInicioEnsinoMedio),
        anoSala: form.tipoUsuario === TipoUsuario.ALUNO ? form.anoSala : null,
      });

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
        "Erro ao cadastrar"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white w-[520px] rounded-2xl p-10 shadow-2xl border border-slate-200">

        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-slate-900">
            Criar <span className="text-[#16a34a] font-medium">Conta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Preencha seus dados para começar
          </p>
        </div>

        
        <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 flex items-center justify-center gap-2 relative group"
          >
            <User className="w-4 h-4" />
            Login
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#16a34a] group-hover:w-1/2 transition-all duration-300"></span>
          </button>

          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#16a34a] rounded-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#16a34a]/30"
          >
            <UserPlus className="w-4 h-4" />
            Cadastro
          </button>
        </div>

        
        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
            {errorMessage}
          </div>
        )}

        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
            <input
              name="nome"
              placeholder="Nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
            />
          </div>

          
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
            <input
              name="sobrenome"
              placeholder="Sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
            />
          </div>

          
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
            />
          </div>

          
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={form.senha}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
            />
          </div>

          
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
            <input
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
            />
          </div>

          
          <div className="grid grid-cols-2 gap-4">
            
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                type="number"
                name="anoInicioEnsinoMedio"
                placeholder="Ano início"
                min={1900}
                max={new Date().getFullYear()}
                value={form.anoInicioEnsinoMedio}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
              />
            </div>

            
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                name="telefone"
                placeholder="Telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50"
              />
            </div>

            
            {form.tipoUsuario === TipoUsuario.ALUNO && (
              <div className="relative group">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
                <select
                  name="anoSala"
                  value={form.anoSala}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50 appearance-none"
                >
                  {anosSalas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            
            <div className={`relative group ${form.tipoUsuario === TipoUsuario.ALUNO ? '' : 'col-span-2'}`}>
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <select
                name="tipoUsuario"
                value={form.tipoUsuario}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all duration-300 group-hover:border-[#16a34a]/50 appearance-none"
              >
                <option value={TipoUsuario.ALUNO}>Aluno</option>
                <option value={TipoUsuario.PROFESSOR}>Professor</option>
                <option value={TipoUsuario.BIBLIOTECARIA}>Bibliotecária</option>
                <option value={TipoUsuario.ADMINISTRADOR}>Administrador</option>
              </select>
            </div>
          </div>

          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar conta
              </>
            )}
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </button>
        </form>
      </div>
    </div>
  );
}
