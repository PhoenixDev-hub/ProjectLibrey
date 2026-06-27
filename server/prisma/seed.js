import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Deletando registros antigos de livros, exemplares, reservas e notificações...');

  await prisma.notificacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.exemplar.deleteMany();
  await prisma.livro.deleteMany();
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

  console.log('Importação concluída com sucesso!');
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
