import { z } from 'zod';

export const criarLivroSchema = z.object({
  titulo: z.string().trim().min(1, 'Título é obrigatório').max(250, 'Título muito longo'),
  autor: z.string().trim().min(1, 'Autor é obrigatório').max(250, 'Autor muito longo'),
  editora: z.string().trim().max(150, 'Editora muito longa').optional(),
  anoPublicacao: z.union([
    z.number().int().min(0, 'Ano inválido').max(9999, 'Ano inválido'),
    z.string().regex(/^\d{1,4}$/, 'Ano inválido').transform(Number),
  ]).nullable().optional(),
  isbn: z.string().trim().max(30, 'ISBN muito longo').optional(),
  area: z.string().trim().min(1, 'Área é obrigatória').max(100, 'Área muito longa'),
  sinopse: z.string().max(5000, 'Sinopse muito longa').optional(),
});

export const atualizarLivroSchema = criarLivroSchema.partial();
