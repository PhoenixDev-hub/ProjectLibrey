import {
  AlertCircle,
  BookOpen,
  Calendar,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TipoUsuario } from "../../constants/enums";
import { useAuth } from "../../hooks/useAuth";

const anosSalas = [
  "1A",
  "1B",
  "1C",
  "1D",
  "2A",
  "2B",
  "2C",
  "2D",
  "3A",
  "3B",
  "3C",
  "3D",
];

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

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

  function getServerMessage(error) {
    const serverError = error.response?.data;
    const details = serverError?.details || serverError?.issues;

    if (Array.isArray(details)) {
      const messages = details
        .map((detail) => detail.message || detail.mensagem || detail.error)
        .filter(Boolean)
        .join(", ");

      if (messages) return messages;
    }

    return serverError?.error || "Erro ao cadastrar";
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
    const anoInicio = Number(form.anoInicioEnsinoMedio);

    if (anoInicio < 1900 || anoInicio > anoAtual + 1) {
      setErrorMessage("Ano de início inválido");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        nome: form.nome.trim(),
        sobrenome: form.sobrenome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        tipoUsuario: form.tipoUsuario,
        anoInicioEnsinoMedio: anoInicio,
        telefone: form.telefone.trim() || undefined,
        anoSala:
          form.tipoUsuario === TipoUsuario.ALUNO ? form.anoSala : undefined,
      };

      await register(requestBody);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(getServerMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-900 px-4 py-8">
      <main className="w-full max-w-[680px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-medium text-emerald-700">
              Cadastro de usuário
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Criar conta
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Preencha os dados abaixo para acessar o sistema.
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              <User className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-medium text-emerald-700 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Cadastro
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="nome"
                  placeholder="Nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="sobrenome"
                  placeholder="Sobrenome"
                  value={form.sobrenome}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className={fieldClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="senha"
                  placeholder="Senha"
                  value={form.senha}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="confirmarSenha"
                  placeholder="Confirmar senha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="anoInicioEnsinoMedio"
                  placeholder="Ano início"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  value={form.anoInicioEnsinoMedio}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="telefone"
                  placeholder="Telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {form.tipoUsuario === TipoUsuario.ALUNO && (
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    name="anoSala"
                    value={form.anoSala}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                  >
                    {anosSalas.map((anoSala) => (
                      <option key={anoSala} value={anoSala}>
                        {anoSala}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                className={`relative ${
                  form.tipoUsuario === TipoUsuario.ALUNO ? "" : "sm:col-span-2"
                }`}
              >
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="tipoUsuario"
                  value={form.tipoUsuario}
                  onChange={handleChange}
                  className={fieldClass}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>
        </main>
    </div>
  );
}
