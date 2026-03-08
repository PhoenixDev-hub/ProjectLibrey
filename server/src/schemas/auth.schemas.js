import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .min(1, 'Nome é obrigatório'),
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .min(1, 'Sobrenome é obrigatório'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve ter um número')
    .min(1, 'Senha é obrigatória'),
  tipoUsuario: z.enum(['ALUNO', 'PROFESSOR', 'BIBLIOTECARIA', 'ADMINISTRADOR']),
  anoInicioEnsinoMedio: z.number()
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear(), 'Ano não pode ser no futuro'),
  anoSala: z.string().optional(),
  telefone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
});

export const requestPasswordResetSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token é obrigatório'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase(),
  novaSenha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve ter um número')
    .min(1, 'Senha é obrigatória'),
  confirmarSenha: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});
