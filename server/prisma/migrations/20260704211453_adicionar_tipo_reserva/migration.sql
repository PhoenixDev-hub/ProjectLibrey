/*
  Warnings:

  - You are about to drop the column `createdAt` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `anoInicioEnsinoMedio` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `anoSala` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `dataCadastro` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `tipoUsuario` on the `usuarios` table. All the data in the column will be lost.
  - The `status` column on the `usuarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `expires_at` to the `password_resets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `password_resets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ano_inicio_ensino_medio` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_usuario` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoReserva" AS ENUM ('LEITURA_PESSOAL', 'ANALISE_LITERARIA');

-- DropForeignKey
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_usuarioId_fkey";

-- AlterTable
ALTER TABLE "password_resets" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "usedAt",
DROP COLUMN "usuarioId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3),
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "usuarioId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "anoInicioEnsinoMedio",
DROP COLUMN "anoSala",
DROP COLUMN "dataCadastro",
DROP COLUMN "tipoUsuario",
ADD COLUMN     "ano_inicio_ensino_medio" INTEGER NOT NULL,
ADD COLUMN     "ano_sala" TEXT,
ADD COLUMN     "codigo_verificacao" TEXT,
ADD COLUMN     "codigo_verificacao_exp" TIMESTAMP(3),
ADD COLUMN     "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipo_usuario" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO';

-- DropEnum
DROP TYPE "Status";

-- DropEnum
DROP TYPE "TipoUsuario";

-- CreateTable
CREATE TABLE "livros" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "editora" TEXT,
    "ano_publicacao" INTEGER,
    "isbn" TEXT,
    "area" TEXT NOT NULL,
    "sinopse" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exemplares" (
    "id" TEXT NOT NULL,
    "livro_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exemplares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "exemplar_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "aprovado_por" INTEGER,
    "aprovado_em" TIMESTAMP(3),
    "retirado_em" TIMESTAMP(3),
    "prazo_devolucao" TIMESTAMP(3),
    "devolvido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_reserva" "TipoReserva" NOT NULL DEFAULT 'LEITURA_PESSOAL',

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "reserva_id" TEXT,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duvidas" (
    "id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "duvida" TEXT NOT NULL,
    "resposta" TEXT,
    "resolvida" BOOLEAN NOT NULL DEFAULT false,
    "resolvida_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duvidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "prazo_devolucao" INTEGER NOT NULL DEFAULT 30,
    "limite_emprestimos" INTEGER NOT NULL DEFAULT 5,
    "permitir_renovacao" BOOLEAN NOT NULL DEFAULT true,
    "nome_biblioteca" TEXT NOT NULL DEFAULT 'Biblioteca ProjectLibrey',

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exemplares_codigo_key" ON "exemplares"("codigo");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exemplares" ADD CONSTRAINT "exemplares_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_aprovado_por_fkey" FOREIGN KEY ("aprovado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "exemplares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duvidas" ADD CONSTRAINT "duvidas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
