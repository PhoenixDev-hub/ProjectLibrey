import { z } from 'zod';

// SEC-FIX (FIX 4): validação de corpo para PUT /configuracoes (VALID-02).
// Bounds alinhados aos inputs do front (min/max dos campos number).
// O front envia prazoDevolucao/limiteEmprestimos como string após edição
// (handleConfigChange guarda o value cru) -> coerce para number.
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
  // Booleano legítimo ou string 'true'/'false' (formato já aceito pelo controller).
  permitirRenovacao: z.union([z.boolean(), z.enum(['true', 'false'])])
    .transform(v => v === true || v === 'true')
    .optional(),
  nomeBiblioteca: z.string().trim().min(1, 'Nome da biblioteca é obrigatório').max(150, 'Nome muito longo').optional(),
});
