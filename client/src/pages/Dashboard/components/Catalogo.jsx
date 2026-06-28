import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import { Heart, Star, ChevronLeft, ChevronRight, Bookmark, BookOpen, ArrowLeft } from 'lucide-react';

const BookCover = ({ title, author, imageUrl, size = 'md' }) => {
  const isSmall = size === 'sm';
  const [coverUrl, setCoverUrl] = useState(imageUrl || null);
  const [loading, setLoading] = useState(false);

  const getGradient = (str) => {
    const gradients = [
      'from-blue-600 to-indigo-900',
      'from-emerald-600 to-teal-900',
      'from-rose-600 to-pink-900',
      'from-amber-600 to-orange-900',
      'from-violet-600 to-purple-900',
      'from-sky-600 to-cyan-900',
    ];
    if (!str) return gradients[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  useEffect(() => {
    if (imageUrl) {
      setCoverUrl(imageUrl);
      return;
    }

    let active = true;
    const searchBookCover = async () => {
      if (!title) return;
      setLoading(true);
      try {
        let searchQuery = encodeURIComponent(`${title} ${author || ''}`);
        let response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=3`);
        let data = await response.json();
        
        let foundCover = false;
        
        if (active && data.docs && data.docs.length > 0) {
          const match = data.docs.find(doc => doc.cover_i);
          if (match) {
            setCoverUrl(`https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`);
            foundCover = true;
          }
        }
        
        if (active && !foundCover) {
          searchQuery = encodeURIComponent(title);
          response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=5`);
          data = await response.json();
          
          if (data.docs && data.docs.length > 0) {
            const match = data.docs.find(doc => doc.cover_i);
            if (match) {
              setCoverUrl(`https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`);
              foundCover = true;
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar capa no Open Library:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    searchBookCover();

    return () => {
      active = false;
    };
  }, [title, author, imageUrl]);

  if (coverUrl) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-2xl shadow-lg border border-white/10 transition-all duration-300 hover:scale-[1.03]
        ${isSmall ? 'w-14 h-20' : 'w-24 h-32'}
      `}>
        <img 
          src={coverUrl} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent shadow-[inset_1px_0_0_rgba(255,255,255,0.1)]"></div>
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}
      </div>
    );
  }

  const gradient = getGradient(title);
  
  return (
    <div className={`relative shrink-0 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg border border-white/10 flex flex-col justify-between p-2 select-none overflow-hidden transition-transform duration-300 hover:scale-[1.03]
      ${isSmall ? 'w-14 h-20' : 'w-24 h-32'}
    `}>
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent"></div>
      <div className="absolute inset-y-0 left-2 w-px bg-white/10"></div>
      
      <span className={`font-black tracking-tight leading-tight line-clamp-3 text-white
        ${isSmall ? 'text-[7px] mt-1 ml-1.5' : 'text-[10px] mt-2 ml-2'}
      `}>
        {title}
      </span>

      <span className={`font-bold opacity-75 truncate text-white/90
        ${isSmall ? 'text-[5px] mb-1 ml-1.5' : 'text-[8px] mb-2 ml-2'}
      `}>
        {author}
      </span>

      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </div>
      )}
    </div>
  );
};

const Catalogo = () => {
  const { theme, books, reservations, handleReservarLivro, searchQuery, selectedCategory, setSelectedCategory, setSearchQuery } = useDashboard();
  const isDark = theme === 'dark';

  const [favorites, setFavorites] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(12);
  
  const toggleFavorite = (bookId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const handleVoltar = () => {
    setSelectedCategory('Todos');
    setSearchQuery('');
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory]);

  const hasRealBooks = books && books.length > 0;

  const categoriasDisponiveis = (() => {
    if (!hasRealBooks) return ['Fantasia', 'Ficção Científica', 'Distopia', 'Drama'];
    const areasSet = new Set();
    books.forEach(b => {
      if (b.area) areasSet.add(b.area);
    });
    return Array.from(areasSet).slice(0, 4); // limite de 4 para o grid do design
  })();

  const filteredBooks = (() => {
    const matchesSearchText = (book, query) => {
      if (!query) return true;
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      return tokens.every(token => 
        (book.titulo && book.titulo.toLowerCase().includes(token)) || 
        (book.autor && book.autor.toLowerCase().includes(token)) ||
        (book.area && book.area.toLowerCase().includes(token))
      );
    };

    if (!hasRealBooks) {
      const allFallbacks = [
        { id: 'l1', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', area: 'Fantasia', sinopse: 'A jornada de Frodo para destruir o Um Anel e salvar a Terra-média.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/14581335-L.jpg' },
        { id: 'l2', titulo: 'Duna', autor: 'Frank Herbert', area: 'Ficção Científica', sinopse: 'Um jovem nobre assume a liderança do desértico planeta Arrakis.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10523456-L.jpg' },
        { id: 'l3', titulo: '1984', autor: 'George Orwell', area: 'Distopia', sinopse: 'O retrato aterrorizante de um regime totalitário onipresente.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12836248-L.jpg' },
        { id: 'r1', titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', area: 'Fantasia', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/13106198-L.jpg' },
        { id: 'r2', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', area: 'Distopia', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12838382-L.jpg' },
        { id: 'r3', titulo: 'Fundação', autor: 'Isaac Asimov', area: 'Ficção Científica', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/12831818-L.jpg' },
        { id: 'r4', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', area: 'Distopia', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12968393-L.jpg' },
        { id: 'r5', titulo: 'Neuromancer', autor: 'William Gibson', area: 'Ficção Científica', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/8372658-L.jpg' },
        { id: 'r6', titulo: 'O Homem do Castelo Alto', autor: 'Philip K. Dick', area: 'Ficção Científica', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/13210408-L.jpg' },
      ];

      return allFallbacks.filter(b => {
        const matchesSearch = matchesSearchText(b, searchQuery);
        const matchesCategory = selectedCategory === 'Todos' || b.area === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }

    return books.filter(b => {
      const matchesSearch = matchesSearchText(b, searchQuery);
      const matchesCategory = selectedCategory === 'Todos' || b.area === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  })();

  const booksByCategory = (() => {
    const groups = {};
    if (!hasRealBooks) {
      const allFallbacks = [
        { id: 'l1', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', area: 'Fantasia', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/14581335-L.jpg' },
        { id: 'r1', titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', area: 'Fantasia', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/13106198-L.jpg' },
        { id: 'm1', titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', area: 'Fantasia', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10521270-L.jpg' },
        { id: 'l2', titulo: 'Duna', autor: 'Frank Herbert', area: 'Ficção Científica', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10523456-L.jpg' },
        { id: 'r3', titulo: 'Fundação', autor: 'Isaac Asimov', area: 'Ficção Científica', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/12831818-L.jpg' },
        { id: 'r5', titulo: 'Neuromancer', autor: 'William Gibson', area: 'Ficção Científica', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/8372658-L.jpg' },
        { id: 'l3', titulo: '1984', autor: 'George Orwell', area: 'Distopia', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12836248-L.jpg' },
        { id: 'r2', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', area: 'Distopia', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12838382-L.jpg' },
        { id: 'r4', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', area: 'Distopia', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12968393-L.jpg' },
        { id: 'm3', titulo: 'Dom Casmurro', autor: 'Machado de Assis', area: 'Clássicos', stars: 4 },
        { id: 'm6', titulo: 'Orgulho e Preconceito', autor: 'Jane Austen', area: 'Clássicos', stars: 4 },
        { id: 'm7', titulo: 'O Sol é para Todos', autor: 'Harper Lee', area: 'Clássicos', stars: 5 },
      ];
      allFallbacks.forEach(b => {
        if (!groups[b.area]) groups[b.area] = [];
        groups[b.area].push(b);
      });
      return groups;
    }
    books.forEach(b => {
      const area = b.area || 'Outros';
      if (!groups[area]) groups[area] = [];
      groups[area].push(b);
    });
    return groups;
  })();

  const isFiltered = (searchQuery && searchQuery !== '') || (selectedCategory && selectedCategory !== 'Todos');

  const catalogData = (() => {
    const fallbackLançamentos = [
      { id: 'l1', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', area: 'Fantasia', sinopse: 'A jornada de Frodo para destruir o Um Anel e salvar a Terra-média.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/14581335-L.jpg', color: 'from-blue-600/30 to-slate-900/80 border-blue-500/30' },
      { id: 'l2', titulo: 'Duna', autor: 'Frank Herbert', area: 'Ficção Científica', sinopse: 'Um jovem nobre assume a liderança do desértico planeta Arrakis.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10523456-L.jpg', color: 'from-purple-600/30 to-slate-900/80 border-purple-500/30' },
      { id: 'l3', titulo: '1984', autor: 'George Orwell', area: 'Distopia', sinopse: 'O retrato aterrorizante de um regime totalitário onipresente.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12836248-L.jpg', color: 'from-emerald-600/30 to-slate-900/80 border-emerald-500/30' },
    ];

    const fallbackRecomendados = [
      { id: 'r1', titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/13106198-L.jpg' },
      { id: 'r2', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12838382-L.jpg' },
      { id: 'r3', titulo: 'Fundação', autor: 'Isaac Asimov', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/12831818-L.jpg' },
      { id: 'r4', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12968393-L.jpg' },
      { id: 'r5', titulo: 'Neuromancer', autor: 'William Gibson', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/8372658-L.jpg' },
      { id: 'r6', titulo: 'O Homem do Castelo Alto', autor: 'Philip K. Dick', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/13210408-L.jpg' },
    ];

    const fallbackMaisLidos = [
      { id: 'm1', titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling' },
      { id: 'm2', titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry' },
      { id: 'm3', titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
      { id: 'm4', titulo: 'A Revolução dos Bichos', autor: 'George Orwell' },
      { id: 'm5', titulo: 'A Culpa é das Estrelas', autor: 'John Green' },
      { id: 'm6', titulo: 'Orgulho e Preconceito', autor: 'Jane Austen' },
      { id: 'm7', titulo: 'O Sol é para Todos', autor: 'Harper Lee' },
    ];

    if (!hasRealBooks) {
      return {
        lancamentos: fallbackLançamentos,
        recomendados: fallbackRecomendados,
        maisLidos: fallbackMaisLidos
      };
    }

    const lancamentos = books.slice(-3).reverse().map((b, idx) => {
      const colors = [
        'from-blue-600/30 to-slate-900/80 border-blue-500/30',
        'from-purple-600/30 to-slate-900/80 border-purple-500/30',
        'from-emerald-600/30 to-slate-900/80 border-emerald-500/30'
      ];
      return {
        id: b.id,
        titulo: b.titulo,
        autor: b.autor,
        area: b.area,
        sinopse: b.sinopse || 'Sem sinopse disponível.',
        stars: 5,
        color: colors[idx % colors.length]
      };
    });

    const recomendados = books.slice(0, 6).map(b => ({
      id: b.id,
      titulo: b.titulo,
      autor: b.autor,
      stars: 4
    }));

    let maisLidos = [];
    if (reservations && reservations.length > 0) {
      const resCounts = {};
      reservations.forEach(r => {
        const bookId = r.exemplar?.livroId;
        if (bookId) resCounts[bookId] = (resCounts[bookId] || 0) + 1;
      });
      const rankedBooks = Object.entries(resCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count);
      
      maisLidos = rankedBooks.map(rank => {
        const book = books.find(b => b.id === rank.id);
        return book ? { id: book.id, titulo: book.titulo, autor: book.autor } : null;
      }).filter(Boolean);
    }

    if (maisLidos.length < 7) {
      const rest = books.filter(b => !maisLidos.find(m => m.id === b.id));
      maisLidos = [...maisLidos, ...rest.slice(0, 7 - maisLidos.length).map(b => ({ id: b.id, titulo: b.titulo, autor: b.autor }))];
    }

    return {
      lancamentos,
      recomendados: recomendados.slice(0, 6),
      maisLidos: maisLidos.slice(0, 7)
    };
  })();

  if (isFiltered) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleVoltar}
              className={`p-2.5 rounded-xl border transition cursor-pointer shadow-sm
                ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-gray-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'}
              `}
              title="Voltar ao catálogo completo"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {selectedCategory !== 'Todos' ? `Coleção: ${selectedCategory}` : 'Resultados da Busca'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                Encontrados {filteredBooks.length} livro(s)
              </p>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className={`p-16 rounded-[28px] border-2 border-dashed text-center ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhum livro corresponde à sua pesquisa ou categoria selecionada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.slice(0, visibleCount).map((b) => (
              <div 
                key={b.id} 
                className={`rounded-[24px] border p-4 flex gap-4 backdrop-blur-xl transition hover:scale-[1.01] shadow-sm
                  ${isDark ? 'border-white/5 bg-slate-900/40' : 'border-gray-200 bg-white'}
                `}
              >
                <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="md" />
                <div className="flex flex-col justify-between overflow-hidden flex-1 py-1">
                  <div>
                    <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1`}>{b.autor}</p>
                    
                    <div className="flex gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-350' : 'bg-slate-100 text-slate-650'}`}>
                      {b.area || 'Geral'}
                    </span>
                    <button 
                      onClick={() => handleReservarLivro(b.id)}
                      className="text-xs font-bold text-sky-500 hover:text-sky-400 transition"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBooks.length > visibleCount && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-6 py-2.5 font-bold text-xs tracking-wider uppercase bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition shadow-md duration-200 cursor-pointer"
            >
              Carregar mais (+{Math.min(12, filteredBooks.length - visibleCount)} livros)
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Novidades
          </h2>
          <div className="flex gap-1">
            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}>
              <ChevronLeft size={16} />
            </button>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {catalogData.lancamentos.map((b) => (
            <div 
              key={b.id} 
              className={`
                rounded-3xl border p-5 flex gap-4 backdrop-blur-xl bg-gradient-to-br shadow-sm transition hover:scale-[1.01]
                ${isDark ? 'text-white' : 'bg-white border-gray-200 text-slate-900'}
                ${isDark ? b.color : 'from-slate-50 to-white'}
              `}
            >
              <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="md" />

              <div className="flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1`}>{b.autor}</p>
                  
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < b.stars ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                    ))}
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed line-clamp-3 mb-2 ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                  {b.sinopse}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {b.area || 'Acervo'}
                  </span>
                  
                  <button 
                    onClick={() => handleReservarLivro(b.id)}
                    className="text-xs font-bold text-sky-500 hover:text-sky-400 transition"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Para Você
            </h2>
            <div className="flex gap-1">
              <button className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}>
                <ChevronLeft size={16} />
              </button>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogData.recomendados.map((b) => (
              <div 
                key={b.id} 
                className={`rounded-2xl border p-3 flex gap-3.5 shadow-sm items-center
                  ${isDark ? 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60' : 'border-gray-150 bg-white hover:bg-slate-50'}
                  transition-colors
                `}
              >
                <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="sm" />

                <div className="flex-1 overflow-hidden">
                  <h3 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1.5`}>{b.autor}</p>
                  
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < b.stars ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleReservarLivro(b.id)}
                  className={`p-2 rounded-xl transition ${isDark ? 'bg-white/5 hover:bg-white/10 text-sky-400' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'}`}
                  title="Reservar Livro"
                >
                  <Bookmark size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Os Mais Lidos
            </h2>
          </div>

          <div className={`rounded-3xl border p-5 flex flex-col gap-4 shadow-sm ${isDark ? 'border-white/5 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
            {catalogData.maisLidos.map((b, idx) => (
              <div 
                key={b.id} 
                className={`flex items-center justify-between gap-3 pb-3 border-b last:pb-0 last:border-b-0
                  ${isDark ? 'border-white/5' : 'border-gray-100'}
                `}
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <span className={`text-sm font-black w-5 shrink-0 text-center
                    ${idx === 0 ? 'text-red-500 text-base' : idx === 1 ? 'text-orange-500' : idx === 2 ? 'text-yellow-500' : 'text-slate-400'}
                  `}>
                    {idx + 1}
                  </span>

                  <div className="overflow-hidden">
                    <h3 className={`font-bold text-xs truncate ${isDark ? 'text-slate-250' : 'text-slate-800'}`}>{b.titulo}</h3>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{b.autor}</p>
                  </div>
                </div>

                <button 
                  onClick={() => toggleFavorite(b.id)}
                  className={`p-1 rounded-full transition-colors shrink-0 ${
                    favorites.has(b.id) 
                      ? 'text-red-500' 
                      : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      <section className="flex flex-col gap-4">
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Explorar Coleções
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriasDisponiveis.map((cat, idx) => {
            const gradients = [
              'from-rose-500/20 to-rose-600/30 border-rose-500/20 hover:border-rose-500/40 text-rose-450',
              'from-sky-500/20 to-sky-600/30 border-sky-500/20 hover:border-sky-500/40 text-sky-450',
              'from-amber-500/20 to-amber-600/30 border-amber-500/20 hover:border-amber-500/40 text-amber-450',
              'from-violet-500/20 to-violet-600/30 border-violet-500/20 hover:border-violet-500/40 text-violet-450',
            ];
            return (
              <div 
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  rounded-2xl border p-6 flex flex-col justify-between min-h-[100px] cursor-pointer shadow-sm bg-gradient-to-br transition hover:scale-[1.02]
                  ${gradients[idx % gradients.length]}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <BookOpen size={22} className="text-white" />
                  <ChevronRightIcon />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-white">{cat}</span>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Catalogo;
