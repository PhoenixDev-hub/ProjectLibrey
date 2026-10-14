import { z } from 'zod';

// SEC-FIX (FIX 4): validação de corpo para POST /eventos (VALID-02).
// type: conjunto fechado de cores oferecido pelo select do front
// (DashboardModals: accent, danger, warning, success).
export const criarEventoSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
    .refine(v => !Number.isNaN(Date.parse(v)), 'Data inválida'),
  type: z.enum(['accent', 'danger', 'warning', 'success'], 'Tipo de evento inválido'),
});
