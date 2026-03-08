import { z } from "zod";

const dominiosPublicos = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.com.br",
  "aluno.ce.gov.br",
];

const dominiosGovernoAdmin = [
  "prof.ce.gov.br",
  "admin.admin",
];

export const createUsuarioSchema = z
  .object({
    nome: z.string().min(1, "Nome obrigatório"),
    sobrenome: z.string().min(1, "Sobrenome obrigatório"),

    email: z.string().email("Email inválido"),

    senha: z.string().min(6, "Senha mínima de 6 caracteres"),

    anoSala: z
      .string()
      .nullable()
      .optional()
      .transform((v) =>
        typeof v === "string" ? v.toUpperCase().trim() : undefined
      )
      .refine(
        (v) => !v || /^[1-3][A-D]$/.test(v),
        "anoSala deve estar no formato correto (ex: 1A, 2B, 3C)"
      ),

    tipoUsuario: z
      .string()
      .transform((v) => v.toUpperCase().trim())
      .refine(
        (v) =>
          ["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"].includes(v),
        "Tipo de usuário inválido"
      ),

    anoInicioEnsinoMedio: z
    .coerce
    .number()
    .int()
    .min(1900, "Ano de início do ensino médio inválido")
    .max(new Date().getFullYear() + 1, "Ano de início do ensino médio inválido"),

    telefone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const dominioEmail = data.email.split("@")[1]?.toLowerCase();

    if (data.tipoUsuario === "ALUNO") {
      if (!data.anoSala) {
        ctx.addIssue({
          path: ["anoSala"],
          message: "anoSala é obrigatório para alunos",
        });
      }

      if (!dominiosPublicos.includes(dominioEmail)) {
        ctx.addIssue({
          path: ["email"],
          message: "Aluno deve usar email público",
        });
      }
    }

    if (
      ["PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"].includes(data.tipoUsuario)
    ) {
      if (!dominiosGovernoAdmin.includes(dominioEmail)) {
        ctx.addIssue({
          path: ["email"],
          message: "Este tipo de usuário deve usar email institucional",
        });
      }
    }
  });
