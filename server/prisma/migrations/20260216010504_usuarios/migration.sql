-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ALUNO', 'PROFESSOR', 'BIBLIOTECARIA', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "anoSala" TEXT NOT NULL,
    "tipoUsuario" "TipoUsuario" NOT NULL,
    "anoInicioEnsinoMedio" INTEGER NOT NULL,
    "telefone" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
