import { Loader2, Lock, LogIn, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(e) {
  e.preventDefault();
  setIsLoading(true);

  try {
    await login({ email, password });
    navigate("/dashboard");
  } catch (error) {
    alert(error.response?.data?.message || "Erro ao fazer login");
  } finally {
    setIsLoading(false);
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/95 backdrop-blur-sm w-[440px] rounded-3xl p-10 shadow-2xl border border-white/20 animate-fadeIn">

        <div className="text-center mb-8 animate-slideDown">
          <h1 className="text-4xl font-light tracking-tight text-slate-900">
            Biblioteca<span className="font-medium text-green-600"> Acadêmica</span>
          </h1>
          <p className="text-xs text-slate-400 mt-3 animate-fadeIn animation-delay-200">
            Sistema de Bibliotecas Escolares
          </p>
        </div>

        <div className="flex mb-8 bg-slate-100 p-1 rounded-2xl animate-slideUp animation-delay-300">
          <button className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/30">
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 transition-all duration-300 relative group"
            onClick={() => navigate("/cadastro")}
          >
            <User className="w-4 h-4" />
            Cadastro
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-1/2 transition-all duration-300"></span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-slideUp animation-delay-400">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-300" />
              <input
                required
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-300 group-hover:border-green-600/50"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="animate-slideUp animation-delay-500">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-300" />
              <input
                required
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all duration-300 group-hover:border-green-600/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group animate-slideUp animation-delay-600"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6 animate-fadeIn animation-delay-700">
          © 2026 Biblioteca Acadêmica
        </p>
      </div>
    </div>
  );
}
