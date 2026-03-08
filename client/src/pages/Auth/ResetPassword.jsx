import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import { validateResetToken, resetPassword } from "../../services/password.service";



export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });

  const validatePassword = (value) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasMinLength && hasUppercase && hasNumber;
  };


  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Link inválido. Parâmetros faltando");
        setValidating(false);
        return;
      }

      try {
        const response = await api.post("/password-reset/validate", {
          token,
          email,
        });

        if (response.data.valid) {
          setTokenValid(true);
        } else {
            setError("Link inválido ou expirado. Solicite um novo reset");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Link não encontrado. Solicite um novo reset");
        } else if (err.response?.status === 400) {
          setError(
            err.response?.data?.message || "Link inválido ou expirado"
          );
        } else {
          setError("Erro ao validar link. Por favor, tente novamente");
        }
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setError("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value) {
      if (name === "novaSenha") {
        if (validatePassword(value)) {
          setValidationErrors((prev) => ({ ...prev, novaSenha: "" }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            novaSenha: "Mínimo 8 caracteres, 1 maiúscula e 1 número"
          }));
        }
      } else if (name === "confirmarSenha") {
        if (value === formData.novaSenha) {
          setValidationErrors((prev) => ({ ...prev, confirmarSenha: "" }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            confirmarSenha: "As senhas devem ser iguais"
          }));
        }
      }
    } else {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.novaSenha || !formData.confirmarSenha) {
      setError("Preenchapreencha todos os campos");
      return;
    }

    if (!validatePassword(formData.novaSenha)) {
      setError("Senha deve ter 8+ caracteres, 1 maiúscula e 1 número");
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/password-reset/reset", {
        token,
        email,
        novaSenha: formData.novaSenha,
        confirmarSenha: formData.confirmarSenha,
      });

      setSuccess(true);
      setFormData({ novaSenha: "", confirmarSenha: "" });


      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message || "Link expirado. Solicite um novo reset"
        );
      } else if (err.response?.status === 404) {
        setError("Link não encontrado. Solicite um novo reset");
      } else if (err.response?.status === 429) {
        setError("Muitas tentativas. Por favor, aguarde alguns minutos");
      } else {
        setError("Erro ao resetar senha. Por favor, tente novamente");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.novaSenha &&
    formData.confirmarSenha &&
    !validationErrors.novaSenha &&
    !validationErrors.confirmarSenha;


  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-white w-[440px] rounded-2xl p-10 shadow-2xl border border-slate-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a] mx-auto mb-4"></div>
          <p className="text-slate-600">Validando link...</p>
        </div>
      </div>
    );
  }


  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-white w-[440px] rounded-2xl p-10 shadow-2xl border border-slate-200">
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Link Inválido</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Solicite um novo link de reset
            </p>
            <button
              type="button"
              onClick={() => navigate("/esqueci-senha")}
              className="inline-block bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Solicitar Novo Reset
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-white w-[440px] rounded-2xl p-10 shadow-2xl border border-slate-200 text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Senha Resetada!
          </h1>
          <p className="text-slate-600 mb-6">
            Sua senha foi atualizada com sucesso. Você será redirecionado para
            o login em alguns segundos...
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-block bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Ir para Login Agora
          </button>
        </div>
      </div>
    );
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


        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-slate-900 mb-2">
            Resetar <span className="text-[#16a34a] font-medium">Senha</span>
          </h2>
          <p className="text-sm text-slate-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Erro</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Nova Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                type={showPassword ? "text" : "password"}
                name="novaSenha"
                value={formData.novaSenha}
                onChange={handleInputChange}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 group-hover:border-[#16a34a]/50 ${
                  validationErrors.novaSenha
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                    : 'border-slate-200 focus:border-[#16a34a] focus:ring-[#16a34a]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {validationErrors.novaSenha && <p className="text-xs text-red-600 mt-1">{validationErrors.novaSenha}</p>}
            <p className="text-xs text-slate-400 mt-1">
              Mínimo 8 caracteres, 1 maiúscula e 1 número
            </p>
          </div>


          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Confirmar Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#16a34a] transition-colors duration-300" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                placeholder="Repita a nova senha"
                disabled={isLoading}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 group-hover:border-[#16a34a]/50 ${
                  validationErrors.confirmarSenha
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                    : 'border-slate-200 focus:border-[#16a34a] focus:ring-[#16a34a]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {validationErrors.confirmarSenha && <p className="text-xs text-red-600 mt-1">{validationErrors.confirmarSenha}</p>}
          </div>


          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Resetar Senha
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
          <p className="text-xs text-slate-400">
            © 2026 Biblioteca Acadêmica
          </p>
        </div>
      </div>
    </div>
  );
}
