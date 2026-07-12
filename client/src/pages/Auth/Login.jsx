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

  if (!loadingAuth && user?.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value) => value.length >= 6;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setValidationErrors((prev) => ({
      ...prev,
      email: value && !validateEmail(value) ? "Email inválido" : "",
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setValidationErrors((prev) => ({
      ...prev,
      password:
        value && !validatePassword(value)
          ? "Senha deve ter no mínimo 6 caracteres"
          : "",
    }));
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
      const result = await login({ email, password });
      if (result.requireVerification) {
        navigate("/cadastro", { state: { verifyEmail: email } });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const serverError = err.response?.data?.error;
      if (serverError) {
        setError(serverError);
      } else if (err.response?.status === 429) {
        setError("Muitas tentativas. Tente novamente em 15 minutos");
      } else if (err.response?.status === 401) {
        setError("Email ou senha inválidos");
      } else if (err.response?.status === 400) {
        setError("Dados inválidos");
      } else {
        setError(err.message || "Erro ao fazer login. Tente novamente");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-900 px-4 py-8">
      <main className="w-full max-w-[440px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-medium text-emerald-700">
              Bem-vindo de volta
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Entrar
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Use seu e-mail e senha cadastrados para continuar.
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button className="flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-medium text-emerald-700 shadow-sm">
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              onClick={() => navigate("/cadastro")}
            >
              <User className="h-4 w-4" />
              Cadastro
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:ring-2 ${
                    validationErrors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="password"
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:ring-2 ${
                    validationErrors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || Object.values(validationErrors).some(Boolean)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Biblioteca Acadêmica
          </p>
        </main>
    </div>
  );
}
