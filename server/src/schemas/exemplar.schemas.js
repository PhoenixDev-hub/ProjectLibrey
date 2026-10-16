import { z } from 'zod';

const statusExemplar = z.enum([
  'DISPONIVEL',
  'RESERVADO',
  'EXTRAVIADO',
  'INDISPONIVEL',
]);

export const criarExemplarSchema = z.object({
  livroId: z.uuid('livroId inválido'),
  codigo: z.string().trim().min(1, 'Código é obrigatório').max(50, 'Código muito longo'),
  status: statusExemplar.optional(),
});

export const atualizarExemplarSchema = z.object({
  codigo: z.string().trim().min(1, 'Código é obrigatório').max(50, 'Código muito longo').optional(),
  status: statusExemplar.optional(),
});
