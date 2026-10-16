import { z } from 'zod';


export const atualizarConfiguracoesSchema = z.object({
  prazoDevolucao: z.coerce.number()
    .int('Prazo deve ser um número inteiro')
    .min(1, 'Prazo mínimo é 1 dia')
    .max(365, 'Prazo máximo é 365 dias')
    .optional(),
  limiteEmprestimos: z.coerce.number()
    .int('Limite deve ser um número inteiro')
    .min(1, 'Limite mínimo é 1')
    .max(50, 'Limite máximo é 50')
    .optional(),
  permitirRenovacao: z.union([z.boolean(), z.enum(['true', 'false'])])
    .transform(v => v === true || v === 'true')
    .optional(),
  nomeBiblioteca: z.string().trim().min(1, 'Nome da biblioteca é obrigatório').max(150, 'Nome muito longo').optional(),
});
