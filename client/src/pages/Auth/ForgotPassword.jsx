import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../services/api";

const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devPreviewUrl, setDevPreviewUrl] = useState(null);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const isFormValid = email && !validationErrors.email;

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setValidationErrors((prev) => ({ ...prev, email: "Email inválido" }));
    } else {
      setValidationErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email é obrigatório");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email inválido");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/password-reset", { email });
      const data = res?.data || {}
      if (data._devPreviewUrl) setDevPreviewUrl(data._devPreviewUrl)
      if (data._devToken) setDevToken(data._devToken)
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erro ao enviar email";
      setError(msg);
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
          <p className="text-xs text-slate-400 mt-2">Sistema de Bibliotecas Escolares</p>
        </div>


        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-slate-900 mb-2">
            Esqueceu sua <span className="text-[#16a34a] font-medium">senha?</span>
          </h2>
          <p className="text-sm text-slate-600">Digite seu email para receber as instruções</p>
        </div>


        {success && (
          <div className="bg-green-50 text-green-600 text-sm p-4 rounded-lg mb-4 border border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Email enviado!</p>
              <p className="text-xs mt-1">Verifique sua caixa de entrada para as instruções. Redirecionando...</p>
              {devPreviewUrl && (
                <p className="text-xs mt-1 break-all">
                  <a href={devPreviewUrl} target="_blank" rel="noreferrer" className="text-[#16a34a] underline">Abrir email (preview)</a>
                </p>
              )}
              {devToken && (
                <p className="text-xs mt-1">Token (dev): <span className="font-mono text-xs">{devToken}</span></p>
              )}
            </div>
          </div>
        )}


        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-4 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Erro</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                type="email"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 group-hover:border-[#16a34a]/50 ${
                  validationErrors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                    : 'border-slate-200 focus:border-[#16a34a] focus:ring-[#16a34a]'
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading || success}
              />
            </div>
            {validationErrors.email && <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>}
          </div>


          <button
            type="submit"
            disabled={!isFormValid || isLoading || success}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Enviar Instruções
              </>
            )}
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </button>
        </form>


        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="block w-full text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors duration-300 py-2 rounded-lg hover:bg-slate-50"
          >
            ← Voltar ao Login
          </button>
          <p className="text-xs text-slate-400">© 2026 Biblioteca Acadêmica</p>
        </div>
      </div>
    </div>
  );
}
