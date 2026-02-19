import {
  BookOpen,
  Calendar,
  ChevronDown,
  Loader2,
  Lock,
  LogIn,
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

const fields = [
  { name: "nome", placeholder: "Digite seu nome", type: "text", icon: User },
  { name: "sobrenome", placeholder: "Digite seu sobrenome", type: "text", icon: Users },
  { name: "email", placeholder: "seu.email@aluno.ce.gov.br", type: "email", icon: Mail },
  { name: "senha", placeholder: "Crie uma senha forte", type: "password", icon: Lock },
  { name: "anoInicioEnsinoMedio", placeholder: "Ex: 2023", type: "number", icon: Calendar },
  { name: "telefone", placeholder: "(88) 99999-9999", type: "tel", icon: Phone },
];

export default function Cadastro() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
  nome: "",
  sobrenome: "",
  email: "",
  senha: "",
  anoInicioEnsinoMedio: "",
  telefone: "",
  tipoUsuario: TipoUsuario.ALUNO,
  anoSala: "1-A",
});

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  }

 async function handleSubmit(e) {
  e.preventDefault();
  setIsLoading(true);

  try {
    await register({
      ...form,
      anoInicioEnsinoMedio: Number(form.anoInicioEnsinoMedio),
    });

    navigate("/dashboard");
  } catch (error) {
    alert(error.response?.data?.message || "Erro ao cadastrar");
  } finally {
    setIsLoading(false);
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/95 backdrop-blur-sm w-[480px] rounded-3xl p-10 shadow-2xl border border-white/20 animate-fadeIn">

        <div className="text-center mb-6 animate-slideDown">
          <h2 className="text-3xl font-light tracking-tight text-slate-900">
            Criar<span className="font-medium text-green-600 ml-2">Conta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2 animate-fadeIn animation-delay-200">
            Preencha seus dados para começar
          </p>
        </div>

        <div className="flex mb-8 bg-slate-100 p-1 rounded-2xl animate-slideUp animation-delay-300">
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-300 relative group flex items-center justify-center gap-2"
            onClick={() => navigate("/")}
          >
            <LogIn className="w-4 h-4" />
            Login
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-1/2 transition-all duration-300"></span>
          </button>

          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Cadastro
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center animate-shake">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) => {
            const Icon = field.icon;
            return (
              <div
                key={field.name}
                className="relative group animate-slideUp"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-300" />
                <input
                  {...field}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  required={field.name !== "telefone"}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-300 group-hover:border-green-600/50"
                />
              </div>
            );
          })}

          <div
            className="relative group animate-slideUp"
            style={{ animationDelay: `${(fields.length + 4) * 100}ms` }}
          >
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-300 z-10" />
            <select
              name="anoSala"
              value={form.anoSala}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-300 group-hover:border-green-600/50 appearance-none cursor-pointer"
            >
              {anosSalas.map((anoSala) => (
                <option key={anoSala} value={anoSala}>
                  {anoSala}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-green-600 transition-colors duration-300" />
          </div>

          <div
            className="relative group animate-slideUp"
            style={{ animationDelay: `${(fields.length + 5) * 100}ms` }}
          >
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-300 z-10" />
            <select
              name="tipoUsuario"
              value={form.tipoUsuario}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-300 group-hover:border-green-600/50 appearance-none cursor-pointer"
            >
              <option value={TipoUsuario.ALUNO}>Aluno</option>
              <option value={TipoUsuario.PROFESSOR}>Professor</option>
              <option value={TipoUsuario.BIBLIOTECARIA}>Bibliotecária</option>
              <option value={TipoUsuario.ADMINISTRADOR}>Administrador</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-green-600 transition-colors duration-300" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-green-600/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-6 relative overflow-hidden group animate-slideUp"
            style={{ animationDelay: `${(fields.length + 6) * 100}ms` }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar minha conta
              </>
            )}
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </button>

          <p className="text-xs text-center text-slate-400 mt-4 animate-fadeIn animation-delay-1000">
            Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </form>
      </div>
    </div>
  );
}
