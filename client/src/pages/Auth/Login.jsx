import { AlertCircle, Loader2, Lock, LogIn, Mail, User } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login, user, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Se já está autenticado (ex.: recarregou a página), redireciona para o dashboard
  if (!loadingAuth && user?.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Enquanto verifica o token no localStorage, mostra loading
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin" />
      </div>
    );
  }


  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 6;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: "Email inválido" }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !validatePassword(value)) {
      setValidationErrors(prev => ({ ...prev, password: "Senha deve ter no mínimo 6 caracteres" }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");


    if (!email || !password) {
      setError("Email e senha são obrigatórios");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email inválido");
      return;
    }

    if (!validatePassword(password)) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {

      if (err.response?.status === 429) {
        setError("Muitas tentativas. Tente novamente em 15 minutos");
      } else if (err.response?.status === 401) {
        setError("Email ou senha inválidos");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || "Dados inválidos");
      } else {
        setError(err.message || "Erro ao fazer login. Tente novamente");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white w-[440px] rounded-2xl p-10 shadow-2xl border border-slate-200">


        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-900">
            Biblioteca<span className="font-medium text-[#16a34a]"> Acadêmica</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Sistema de Bibliotecas Escolares
          </p>
        </div>


        <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
          <button className="flex-1 py-2.5 text-sm font-medium text-white bg-[#16a34a] rounded-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#16a34a]/30">
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 transition-colors duration-300 relative group"
            onClick={() => navigate("/cadastro")}
          >
            <User className="w-4 h-4" />
            Cadastro
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#16a34a] group-hover:w-1/2 transition-all duration-300"></span>
          </button>
        </div>


        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                required
                type="email"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 group-hover:border-[#16a34a]/50 ${
                  validationErrors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                    : 'border-slate-200 focus:border-[#16a34a] focus:ring-[#16a34a]'
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            {validationErrors.email && <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                required
                type="password"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 group-hover:border-[#16a34a]/50 ${
                  validationErrors.password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                    : 'border-slate-200 focus:border-[#16a34a] focus:ring-[#16a34a]'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            {validationErrors.password && <p className="text-xs text-red-600 mt-1">{validationErrors.password}</p>}
          </div>


          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/esqueci-senha")}
              className="text-xs text-[#16a34a] hover:text-[#16a34a]/80 font-medium transition-colors duration-300"
            >
              Esqueceu a senha?
            </button>
          </div>


          <button
            type="submit"
            disabled={isLoading || Object.values(validationErrors).some(e => e)}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group"
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


        <p className="text-xs text-center text-slate-400 mt-6">
          © 2026 Biblioteca Acadêmica
        </p>
      </div>
    </div>
  );
}
