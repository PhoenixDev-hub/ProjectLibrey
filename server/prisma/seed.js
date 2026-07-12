import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Deletando registros antigos de livros, exemplares, reservas e notificações...');

  await prisma.notificacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.exemplar.deleteMany();
  await prisma.livro.deleteMany();
  
  const testEmails = ['admin@librey.com', 'bibliotecaria@librey.com', 'professor@librey.com', 'aluno@librey.com'];
  await prisma.usuario.deleteMany({
    where: { email: { in: testEmails } }
  });
  console.log('Tabelas limpas com sucesso!');

  const records = [];
  const csvPath = path.resolve(__dirname, '../../Livros.csv');

  console.log('Lendo arquivo CSV: ' + csvPath);

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ skipLines: 1 }))
      .on('data', (data) => records.push(data))
      .on('error', reject)
      .on('end', resolve);
  });

  console.log(`Lidos ${records.length} registros do CSV. Iniciando importação para o banco de dados...`);

  const livrosMap = new Map();

  for (const row of records) {
    const titulo = (row['TÍTULO'] || 'Sem Título').trim();
    let autor = (row['AUTOR/ES'] || 'Desconhecido').trim();

    if (autor.startsWith('"') && autor.endsWith('"')) {
       autor = autor.substring(1, autor.length - 1).trim();
    }

    const editora = (row['EDITORA'] || '').trim();

    let anoPublicacao = parseInt(row['ANO DE PUBLIC.'], 10);
    if (isNaN(anoPublicacao)) anoPublicacao = null;

    const area = (row['CDD/CDU'] || '').trim();
    const codigo = (row['Nº. DE TOMBO'] || '').trim();

    let obs = (row['OBSERVAÇÃO'] || '').trim().toUpperCase();
    let status = 'DISPONIVEL';

    if (obs.includes('EXTRAVIADO')) status = 'EXTRAVIADO';
    else if (obs.includes('DESCARTADO') || obs.includes('INUTILIZADO')) status = 'INDISPONIVEL';

    if (!codigo) continue;

    const bookKey = `${titulo}-${autor}`;

    let livroRecord = livrosMap.get(bookKey);

    if (!livroRecord) {
      livroRecord = await prisma.livro.create({
        data: {
          titulo,
          autor,
          editora,
          anoPublicacao,
          area
        }
      });
      livrosMap.set(bookKey, livroRecord);
    }

    try {
      await prisma.exemplar.create({
        data: {
          livroId: livroRecord.id,
          codigo,
          status
        }
      });
    } catch (e) {
      console.error(`Erro ao criar exemplar com código ${codigo}:`, e.message);
    }
  }

  console.log('Importação de livros concluída com sucesso!');

  console.log('Criando usuários de teste...');
  const senhaHash = await bcrypt.hash('Senha123', 10);

  const usuariosTeste = [
    { nome: 'Admin', sobrenome: 'Teste', email: 'admin@librey.com', senha: senhaHash, tipoUsuario: 'ADMINISTRADOR', emailVerificado: true, status: 'ATIVO', anoInicioEnsinoMedio: 2024 },
    { nome: 'Bibliotecária', sobrenome: 'Teste', email: 'bibliotecaria@librey.com', senha: senhaHash, tipoUsuario: 'BIBLIOTECARIA', emailVerificado: true, status: 'ATIVO', anoInicioEnsinoMedio: 2024 },
    { nome: 'Professor', sobrenome: 'Teste', email: 'professor@librey.com', senha: senhaHash, tipoUsuario: 'PROFESSOR', emailVerificado: true, status: 'ATIVO', anoInicioEnsinoMedio: 2024 },
    { nome: 'Aluno', sobrenome: 'Teste', email: 'aluno@librey.com', senha: senhaHash, tipoUsuario: 'ALUNO', emailVerificado: true, status: 'ATIVO', anoInicioEnsinoMedio: 2024 }
  ];

  for (const user of usuariosTeste) {
    await prisma.usuario.create({ data: user });
  }

  console.log('Usuários de teste criados com sucesso:');
  console.log('- admin@librey.com / Senha123');
  console.log('- bibliotecaria@librey.com / Senha123');
  console.log('- professor@librey.com / Senha123');
  console.log('- aluno@librey.com / Senha123');

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erro durante a execução do seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
