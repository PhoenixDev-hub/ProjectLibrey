import { BookOpen } from 'lucide-react';

const PopularBooks = () => {
  const books = [
    { id: 1, title: 'Cem Anos de Solidão', author: 'Gabriel García Márquez' },
    { id: 2, title: 'Dom Casmurro', author: 'Machado de Assis' },
    { id: 3, title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-slate-100 p-3">
          <BookOpen className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Livros populares</h3>
      </div>
      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.id} className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="font-medium text-slate-900">{book.title}</p>
            <p className="text-sm text-slate-500">{book.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularBooks;
