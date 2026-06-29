import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import { Heart, Star, ChevronLeft, ChevronRight, Bookmark, BookOpen, ArrowLeft, X } from 'lucide-react';

const coverCache = new Map();
const pendingCoverRequests = new Map();
const COVER_CACHE_PREFIX = 'book_cover_v3:';

const cleanBookText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/-\s*vol(ume)?\s*\d*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const makeCoverCacheKey = (title, author) => {
  return `${cleanBookText(title)}-${cleanBookText(author)}`.toLowerCase();
};

const readStoredCover = (key) => {
  try {
    return localStorage.getItem(`${COVER_CACHE_PREFIX}${key}`);
  } catch {
    return null;
  }
};

const storeCover = (key, value) => {
  if (!value) return;

  try {
    localStorage.setItem(`${COVER_CACHE_PREFIX}${key}`, value);
  } catch {
  }
};

const removeStoredCover = (key) => {
  try {
    localStorage.removeItem(`${COVER_CACHE_PREFIX}${key}`);
  } catch {
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 3500) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const coverUrlFromId = (coverId, size) => {
  const coverSize = size === 'lg' ? 'L' : 'M';
  return `https://covers.openlibrary.org/b/id/${coverId}-${coverSize}.jpg`;
};

const coverUrlFromGoogleBook = (book) => {
  const links = book?.volumeInfo?.imageLinks;
  const url = links?.thumbnail || links?.smallThumbnail;
  if (!url) return null;

  return url
    .replace(/^http:\/\//, 'https://')
    .replace('zoom=1', 'zoom=2');
};

const findCoverByTitleAndAuthor = async ({ title, author, size }) => {
  const cleanTitle = cleanBookText(title);
  const cleanAuthor = cleanBookText(author);

  if (!cleanTitle) return null;

  const params = new URLSearchParams({
    title: cleanTitle,
    fields: 'cover_i,title,author_name',
    limit: '5',
  });

  if (cleanAuthor && !['desconhecido', 'vários', 'varios', 'diversos', 'sem autor'].includes(cleanAuthor.toLowerCase())) {
    params.set('author', cleanAuthor);
  }

  let response = await fetchWithTimeout(`https://openlibrary.org/search.json?${params.toString()}`);
  let data = await response.json();
  let match = data.docs?.find((doc) => doc.cover_i);

  if (!match && cleanAuthor) {
    const fallbackParams = new URLSearchParams({
      q: `${cleanTitle} ${cleanAuthor}`,
      fields: 'cover_i,title,author_name',
      limit: '5',
    });
    response = await fetchWithTimeout(`https://openlibrary.org/search.json?${fallbackParams.toString()}`);
    data = await response.json();
    match = data.docs?.find((doc) => doc.cover_i);
  }

  if (match?.cover_i) {
    return coverUrlFromId(match.cover_i, size);
  }

  const googleQuery = cleanAuthor
    ? `intitle:${cleanTitle} inauthor:${cleanAuthor}`
    : `intitle:${cleanTitle}`;
  const googleParams = new URLSearchParams({
    q: googleQuery,
    maxResults: '5',
    printType: 'books',
  });

  response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?${googleParams.toString()}`);
  data = await response.json();
  const googleMatch = data.items?.find((item) => coverUrlFromGoogleBook(item));

  return coverUrlFromGoogleBook(googleMatch);
};

const BookCover = ({ title, author, imageUrl, size = 'md' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  const cacheKey = makeCoverCacheKey(title, author);
  const [coverUrl, setCoverUrl] = useState(() => imageUrl || coverCache.get(cacheKey) || readStoredCover(cacheKey) || null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = React.useRef(null);

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
    if (imageUrl || coverUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [imageUrl, coverUrl]);

  useEffect(() => {
    if (imageUrl) {
      setCoverUrl(imageUrl);
      return;
    }

    if (!isVisible) return;

    if (coverCache.has(cacheKey)) {
      setCoverUrl(coverCache.get(cacheKey) || null);
      return;
    }

    const storedCover = readStoredCover(cacheKey);
    if (storedCover !== null) {
      const cachedUrl = storedCover || null;
      coverCache.set(cacheKey, cachedUrl);
      setCoverUrl(cachedUrl);
      return;
    }

    let active = true;
    const searchBookCover = async () => {
      if (!title) return;
      setLoading(true);
      try {
        if (!pendingCoverRequests.has(cacheKey)) {
          pendingCoverRequests.set(
            cacheKey,
            findCoverByTitleAndAuthor({ title, author, size }).finally(() => {
              pendingCoverRequests.delete(cacheKey);
            })
          );
        }

        const foundCover = await pendingCoverRequests.get(cacheKey);
        
        if (!active) return;

        if (foundCover) {
          coverCache.set(cacheKey, foundCover);
          storeCover(cacheKey, foundCover);
        }
        setCoverUrl(foundCover);

        if (!foundCover) {
          coverCache.delete(cacheKey);
          removeStoredCover(cacheKey);
          setLoading(false);
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
  }, [title, author, cacheKey, imageUrl, isVisible, size]);

  const gradient = getGradient(title);

  return (
    <div 
      ref={elementRef}
      className={`relative shrink-0 overflow-hidden rounded-2xl shadow-lg border border-white/10 transition-all duration-300 hover:scale-[1.03]
        ${isSmall ? 'w-14 h-20' : (isLarge ? 'w-36 h-48 shadow-2xl border-white/20' : 'w-24 h-32')}
      `}
    >
      {coverUrl ? (
        <>
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => {
              coverCache.set(cacheKey, coverUrl);
              storeCover(cacheKey, coverUrl);
            }}
            onError={() => {
              if (coverUrl) {
                coverCache.delete(cacheKey);
                removeStoredCover(cacheKey);
                setCoverUrl(null);
              }
            }}
          />
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent shadow-[inset_1px_0_0_rgba(255,255,255,0.1)]"></div>
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-between p-2 select-none`}>
          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent"></div>
          <div className="absolute inset-y-0 left-2 w-px bg-white/10"></div>
          
          <span className={`font-black tracking-tight leading-tight line-clamp-3 text-white
            ${isSmall ? 'text-[7px] mt-1 ml-1.5' : (isLarge ? 'text-[14px] mt-4 ml-3' : 'text-[10px] mt-2 ml-2')}
          `}>
            {title}
          </span>

          <span className={`font-bold opacity-75 truncate text-white/90
            ${isSmall ? 'text-[5px] mb-1 ml-1.5' : (isLarge ? 'text-[10px] mb-4 ml-3' : 'text-[8px] mb-2 ml-2')}
          `}>
            {author}
          </span>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </div>
      )}
    </div>
  );
};

const Catalogo = () => {
  const { 
    theme, 
    user, 
    books, 
    reservations, 
    handleReservarLivro, 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    setSearchQuery, 
    getCDDAreaName,
    setShowBookModal,
    setEditingBook,
    setBookForm
  } = useDashboard();
  
  const isDark = theme === 'dark';
  const ehAluno = user?.tipoUsuario === 'ALUNO';

  const [activeView, setActiveView] = useState('todos');
  const [selectedBookDetails, setSelectedBookDetails] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(12);

  const [lancPage, setLancPage] = useState(0);
  const [recPage, setRecPage] = useState(0);
  
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`favorites_${user.id}`);
        if (saved) {
          setFavorites(new Set(JSON.parse(saved)));
        } else {
          setFavorites(new Set());
        }
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }
  }, [user]);

  const toggleFavorite = (bookId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      if (user?.id) {
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const handleVoltar = () => {
    setSelectedCategory('Todos');
    setSearchQuery('');
    setActiveView('todos');
  };

  useEffect(() => {
    setVisibleCount(12);
    setLancPage(0);
    setRecPage(0);
  }, [searchQuery, selectedCategory]);

  const hasRealBooks = books && books.length > 0;

  const categoriasDisponiveis = (() => {
    if (!hasRealBooks) return ['Fantasia', 'Ficção Científica', 'Distopia', 'Drama'];
    const areasSet = new Set();
    books.forEach(b => {
      const friendly = getCDDAreaName(b.area);
      if (friendly) areasSet.add(friendly);
    });
    return Array.from(areasSet).slice(0, 4);
  })();

  const allFallbackBooks = [
    { id: 'l1', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', area: 'Fantasia', editora: 'HarperCollins', anoPublicacao: '1954', isbn: '978-8595086357', sinopse: 'A jornada de Frodo para destruir o Um Anel e salvar a Terra-média das garras do Senhor do Escuro, Sauron.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/14581335-L.jpg' },
    { id: 'l2', titulo: 'Duna', autor: 'Frank Herbert', area: 'Ficção Científica', editora: 'Aleph', anoPublicacao: '1965', isbn: '978-8576573005', sinopse: 'No desértico planeta Arrakis, a única fonte da substância mais valiosa do universo, o jovem Paul Atreides enfrenta intrigas políticas e místicas para vingar sua família.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10523456-L.jpg' },
    { id: 'l3', titulo: '1984', autor: 'George Orwell', area: 'Distopia', editora: 'Companhia das Letras', anoPublicacao: '1949', isbn: '978-8535914849', sinopse: 'O retrato aterrorizante de um regime totalitário onde a vigilância do Grande Irmão é constante e a liberdade de pensamento é um crime punido com a morte.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12836248-L.jpg' },
    { id: 'r1', titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', area: 'Fantasia', editora: 'HarperCollins', anoPublicacao: '1937', isbn: '978-8595085800', sinopse: 'A fantástica jornada de Bilbo Bolseiro na companhia de treze anões e do mago Gandalf para recuperar o tesouro roubado pelo dragão Smaug.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/13106198-L.jpg' },
    { id: 'r2', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', area: 'Distopia', editora: 'Globo Livros', anoPublicacao: '1932', isbn: '978-8525056009', sinopse: 'Uma sociedade futurista cientificamente ordenada, onde as pessoas são condicionadas geneticamente a aceitar sua classe social e a felicidade é garantida pelo consumo de uma droga.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12838382-L.jpg' },
    { id: 'r3', titulo: 'Fundação', autor: 'Isaac Asimov', area: 'Ficção Científica', editora: 'Aleph', anoPublicacao: '1951', isbn: '978-8576571551', sinopse: 'O matemático Hari Seldon prevê a queda do Império Galáctico e cria a Fundação para preservar o conhecimento humano e guiar o universo através de uma era de trevas.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/12831818-L.jpg' },
    { id: 'r4', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', area: 'Distopia', editora: 'Biblioteca Azul', anoPublicacao: '1953', isbn: '978-8525052247', sinopse: 'Em uma sociedade onde ler livros é um crime grave, os bombeiros são responsáveis por queimar todas as publicações existentes para evitar o pensamento crítico.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/12968393-L.jpg' },
    { id: 'r5', titulo: 'Neuromancer', autor: 'William Gibson', area: 'Ficção Científica', editora: 'Aleph', anoPublicacao: '1984', isbn: '978-8576573005', sinopse: 'O romance definitivo do cyberpunk que acompanha Case, um hacker decadente que é contratado para realizar a invasão de dados definitiva no ciberespaço.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/8372658-L.jpg' },
    { id: 'r6', titulo: 'O Homem do Castelo Alto', autor: 'Philip K. Dick', area: 'Ficção Científica', editora: 'Aleph', anoPublicacao: '1962', isbn: '978-8576573357', sinopse: 'Uma história alternativa impressionante na qual os Aliados perderam a Segunda Guerra Mundial e os Estados Unidos foram divididos entre a Alemanha Nazista e o Japão Imperial.', stars: 4, imageUrl: 'https://covers.openlibrary.org/b/id/13210408-L.jpg' },
    { id: 'm1', titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', area: 'Fantasia', editora: 'Rocco', anoPublicacao: '1997', isbn: '978-8532511010', sinopse: 'Harry Potter descobre no seu aniversário de onze anos que é um bruxo e é convidado para estudar na Escola de Magia de Hogwarts.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/10521270-L.jpg' },
    { id: 'm2', titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', area: 'Clássicos', editora: 'Melhoramentos', anoPublicacao: '1943', isbn: '978-8506073254', sinopse: 'A poética história de um piloto de avião perdido no deserto do Saara que encontra um pequeno príncipe vindo de um asteroide distante.', stars: 5, imageUrl: 'https://covers.openlibrary.org/b/id/14578132-L.jpg' },
    { id: 'm3', titulo: 'Dom Casmurro', autor: 'Machado de Assis', area: 'Clássicos', editora: 'Principis', anoPublicacao: '1899', isbn: '978-8594318022', sinopse: 'O clássico romance brasileiro narrado em primeira pessoa por Bento Santiago que conta suas memórias sobre a amizade com Capitu e suas eternas dúvidas sobre ciúme e traição.', stars: 4 },
  ];

  const filteredBooks = (() => {
    const matchesSearchText = (book, query) => {
      if (!query) return true;
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      return tokens.every(token => 
        (book.titulo && book.titulo.toLowerCase().includes(token)) || 
        (book.autor && book.autor.toLowerCase().includes(token)) ||
        (getCDDAreaName(book.area).toLowerCase().includes(token))
      );
    };

    const bookList = hasRealBooks ? books : allFallbackBooks;

    return bookList.filter(b => {
      const matchesSearch = matchesSearchText(b, searchQuery);
      const friendlyArea = getCDDAreaName(b.area);
      const matchesCategory = selectedCategory === 'Todos' || friendlyArea === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  })();

  const favoritedBooks = (() => {
    const bookList = hasRealBooks ? books : allFallbackBooks;
    return bookList.filter(b => favorites.has(b.id));
  })();

  const isFiltered = Boolean(searchQuery?.trim()) || selectedCategory !== 'Todos';

  const allLancamentos = (() => {
    const list = hasRealBooks ? books : allFallbackBooks;
    return list.slice().reverse().map((b, idx) => {
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
        sinopse: b.sinopse || null,
        editora: b.editora,
        anoPublicacao: b.anoPublicacao,
        isbn: b.isbn,
        imageUrl: b.imageUrl,
        stars: 5,
        color: colors[idx % colors.length]
      };
    });
  })();

  const maxLancPages = Math.ceil(allLancamentos.length / 3);
  const nextLanc = () => setLancPage(prev => (prev + 1) % maxLancPages);
  const prevLanc = () => setLancPage(prev => (prev - 1 + maxLancPages) % maxLancPages);
  const visibleLancamentos = allLancamentos.slice(lancPage * 3, (lancPage + 1) * 3);

  const allRecomendados = (() => {
    const list = hasRealBooks ? books : allFallbackBooks.slice(3);
    return list.map(b => ({
      id: b.id,
      titulo: b.titulo,
      autor: b.autor,
      area: b.area,
      sinopse: b.sinopse,
      editora: b.editora,
      anoPublicacao: b.anoPublicacao,
      isbn: b.isbn,
      imageUrl: b.imageUrl,
      stars: 4
    }));
  })();

  const recommendedPageSize = 6;
  const maxRecPages = Math.ceil(allRecomendados.length / recommendedPageSize);
  const nextRec = () => setRecPage(prev => (prev + 1) % maxRecPages);
  const prevRec = () => setRecPage(prev => (prev - 1 + maxRecPages) % maxRecPages);
  const visibleRecomendados = allRecomendados.slice(
    recPage * recommendedPageSize,
    (recPage + 1) * recommendedPageSize
  );

  const catalogDataMaisLidos = (() => {
    let maisLidos = [];
    if (hasRealBooks && reservations && reservations.length > 0) {
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
        return book ? { 
          id: book.id, 
          titulo: book.titulo, 
          autor: book.autor,
          area: book.area,
          sinopse: book.sinopse,
          editora: book.editora,
          anoPublicacao: book.anoPublicacao,
          isbn: book.isbn,
          imageUrl: book.imageUrl
        } : null;
      }).filter(Boolean);
    }

    if (maisLidos.length < 7) {
      const list = hasRealBooks ? books : allFallbackBooks;
      const rest = list.filter(b => !maisLidos.find(m => m.id === b.id));
      maisLidos = [...maisLidos, ...rest.slice(0, 7 - maisLidos.length).map(b => ({ 
        id: b.id, 
        titulo: b.titulo, 
        autor: b.autor,
        area: b.area,
        sinopse: b.sinopse,
        editora: b.editora,
        anoPublicacao: b.anoPublicacao,
        isbn: b.isbn,
        imageUrl: b.imageUrl
      }))];
    }

    return maisLidos.slice(0, 7);
  })();

  const BookDetailsModal = () => {
    if (!selectedBookDetails) return null;
    const b = selectedBookDetails;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedBookDetails(null)} />
        <div className={`relative w-full max-w-2xl rounded-[32px] border p-6 shadow-2xl z-[130] transition-all duration-300
          ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}
        `}>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="text-sky-500" size={18} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Detalhes do Livro
              </span>
            </div>
            <button 
              onClick={() => setSelectedBookDetails(null)} 
              className={`p-1.5 rounded-full transition ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-150 text-slate-500'}`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
              <BookCover 
                title={b.titulo} 
                author={b.autor} 
                imageUrl={b.imageUrl} 
                size="lg" 
              />
              {ehAluno && (
                <button
                  onClick={() => toggleFavorite(b.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition w-full justify-center
                    ${favorites.has(b.id) 
                      ? 'border-red-500/30 bg-red-500/10 text-red-500' 
                      : isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-gray-200 hover:bg-gray-50 text-slate-650'}`}
                >
                  <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                  <span>{favorites.has(b.id) ? 'Favoritado' : 'Favoritar'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {b.titulo}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-455' : 'text-slate-500'} font-semibold mt-0.5`}>
                    por <span className="font-bold">{b.autor}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Editora</p>
                    <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.editora || 'Desconhecida'}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Ano Publicação</p>
                    <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.anoPublicacao || 'N/A'}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">ISBN</p>
                    <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.isbn || 'N/A'}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-gray-50 border-gray-150'}`}>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Área / Categoria</p>
                    <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{getCDDAreaName(b.area)}</p>
                  </div>
                </div>

                {b.sinopse && (
                  <div>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mb-1">Sinopse</p>
                    <p className={`text-xs leading-relaxed max-h-36 overflow-y-auto pr-1 ${isDark ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium'}`}>
                      {b.sinopse}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-750/20 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBookDetails(null)}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition text-xs border
                    ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-slate-600 hover:bg-gray-100'}`}
                >
                  Fechar
                </button>
                {ehAluno && (
                  <button
                    type="button"
                    onClick={() => {
                      handleReservarLivro(b.id);
                      setSelectedBookDetails(null);
                    }}
                    className={`flex-[2] py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-sm text-slate-950
                      ${isDark ? 'bg-sky-500 hover:bg-sky-400' : 'bg-emerald-500 hover:bg-emerald-450'}`}
                  >
                    <Bookmark size={14} />
                    Reservar Livro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className={`relative overflow-hidden rounded-3xl p-8 shadow-sm flex items-center justify-between
        ${isDark ? 'bg-gradient-to-r from-sky-900 to-sky-700' : 'bg-gradient-to-r from-amber-600 to-yellow-500'}
      `}>
        <div className="relative z-10 text-white flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {ehAluno ? 'Explore o Acervo' : 'Catálogo da Biblioteca'}
          </h1>
          <p className="opacity-90 font-medium mb-6 max-w-xl">
            {ehAluno 
              ? 'Encontre suas próximas leituras, favorite as obras que mais gostar e solicite reservas rápidas de forma simples.'
              : 'Gerencie o acervo de obras da escola, cadastre novos exemplares, atualize informações e controle as categorias do sistema.'}
          </p>
          
          {ehAluno ? (
            <div className="flex gap-1.5 p-1 rounded-xl max-w-xs bg-black/25 border border-white/10">
              <button
                onClick={() => setActiveView('todos')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
                  ${activeView === 'todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
              >
                Todos os Livros
              </button>
              <button
                onClick={() => setActiveView('favoritos')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1
                  ${activeView === 'favoritos' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
              >
                <Heart size={12} className={favorites.size > 0 ? 'fill-red-500 text-red-500' : ''} />
                Meus Favoritos
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setBookForm({
                  titulo: '',
                  autor: '',
                  editora: '',
                  anoPublicacao: '',
                  isbn: '',
                  area: '',
                  sinopse: ''
                });
                setEditingBook(null);
                setShowBookModal(true);
              }}
              className="bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm text-sm"
            >
              + Cadastrar Livro
            </button>
          )}
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      {ehAluno && activeView === 'favoritos' ? (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Meus Livros Favoritos
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
              Você salvou {favoritedBooks.length} livro(s) como favorito
            </p>
          </div>

          {favoritedBooks.length === 0 ? (
            <div className={`p-16 rounded-[28px] border-2 border-dashed text-center ${isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-200 bg-white'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Você ainda não favoritou nenhum livro. Adicione corações aos seus livros favoritos para vê-los aqui!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritedBooks.map((b) => (
                <div 
                  key={b.id} 
                  className={`rounded-[24px] border p-4 flex gap-4 backdrop-blur-xl transition hover:scale-[1.01] shadow-sm cursor-pointer
                    ${isDark ? 'border-white/5 bg-slate-900/40 hover:bg-slate-900/50' : 'border-gray-200 bg-white hover:bg-gray-50'}
                  `}
                  onClick={() => setSelectedBookDetails(b)}
                >
                  <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="md" />
                  <div className="flex flex-col justify-between overflow-hidden flex-1 py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(b.id);
                          }}
                          className="text-red-500 transition hover:scale-110"
                        >
                          <Heart size={16} className="fill-red-500" />
                        </button>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1`}>{b.autor}</p>
                      
                      <div className="flex gap-0.5 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4" onClick={e => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-350' : 'bg-slate-100 text-slate-655'}`}>
                        {getCDDAreaName(b.area)}
                      </span>
                      {ehAluno && (
                        <button 
                          onClick={() => handleReservarLivro(b.id)}
                          className="text-xs font-bold text-sky-500 hover:text-sky-400 transition"
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {isFiltered ? (
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
                      className={`rounded-[24px] border p-4 flex gap-4 backdrop-blur-xl transition hover:scale-[1.01] shadow-sm cursor-pointer
                        ${isDark ? 'border-white/5 bg-slate-900/40 hover:bg-slate-900/50' : 'border-gray-200 bg-white hover:bg-gray-50'}
                      `}
                      onClick={() => setSelectedBookDetails(b)}
                    >
                      <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="md" />
                      <div className="flex flex-col justify-between overflow-hidden flex-1 py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                            {ehAluno && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(b.id);
                                }}
                                className={`transition hover:scale-110 ${favorites.has(b.id) ? 'text-red-500' : 'text-slate-550'}`}
                              >
                                <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                              </button>
                            )}
                          </div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1`}>{b.autor}</p>
                          
                          <div className="flex gap-0.5 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={11} className={i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4" onClick={e => e.stopPropagation()}>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-355' : 'bg-slate-100 text-slate-655'}`}>
                            {getCDDAreaName(b.area)}
                          </span>
                          {ehAluno && (
                            <button 
                              onClick={() => handleReservarLivro(b.id)}
                              className="text-xs font-bold text-sky-500 hover:text-sky-400 transition"
                            >
                              Reservar
                            </button>
                          )}
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
          ) : (
            <div className="flex flex-col gap-8">
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Novidades
                  </h2>
                  <div className="flex gap-1">
                    <button 
                      onClick={prevLanc}
                      disabled={maxLancPages <= 1}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition border disabled:opacity-30 disabled:cursor-not-allowed
                        ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={nextLanc}
                      disabled={maxLancPages <= 1}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition border disabled:opacity-30 disabled:cursor-not-allowed
                        ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {visibleLancamentos.map((b) => (
                    <div 
                      key={b.id} 
                      className={`
                        rounded-3xl border p-5 flex gap-4 backdrop-blur-xl bg-gradient-to-br shadow-sm transition hover:scale-[1.01] cursor-pointer
                        ${isDark ? 'text-white border-white/5' : 'bg-white border-gray-200 text-slate-900'}
                        ${isDark ? b.color : 'from-slate-50 to-white'}
                      `}
                      onClick={() => setSelectedBookDetails(b)}
                    >
                      <BookCover title={b.titulo} author={b.autor} imageUrl={b.imageUrl} size="md" />

                      <div className="flex flex-col justify-between overflow-hidden flex-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.titulo}</h3>
                            {ehAluno && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(b.id);
                                }}
                                className={`transition hover:scale-110 ${favorites.has(b.id) ? 'text-red-500' : 'text-slate-500 hover:text-slate-350'}`}
                              >
                                <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                              </button>
                            )}
                          </div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mb-1`}>{b.autor}</p>
                          
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < b.stars ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'} />
                            ))}
                          </div>
                        </div>

                        {b.sinopse && (
                          <p className={`text-[11px] leading-relaxed line-clamp-3 mb-2 ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                            {b.sinopse}
                          </p>
                        )}

                        <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-335' : 'bg-slate-100 text-slate-600'}`}>
                            {getCDDAreaName(b.area)}
                          </span>
                          
                          {ehAluno && (
                            <button 
                              onClick={() => handleReservarLivro(b.id)}
                              className="text-xs font-bold text-sky-500 hover:text-sky-400 transition"
                            >
                              Reservar
                            </button>
                          )}
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
                      <button 
                        onClick={prevRec}
                        disabled={maxRecPages <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition border disabled:opacity-30 disabled:cursor-not-allowed
                          ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={nextRec}
                        disabled={maxRecPages <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition border disabled:opacity-30 disabled:cursor-not-allowed
                          ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-gray-200 hover:bg-slate-100 text-slate-600'}`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleRecomendados.map((b) => (
                      <div 
                        key={b.id} 
                        className={`rounded-2xl border p-3 flex gap-3.5 shadow-sm items-center cursor-pointer
                          ${isDark ? 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60' : 'border-gray-150 bg-white hover:bg-slate-50'}
                          transition-all
                        `}
                        onClick={() => setSelectedBookDetails(b)}
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

                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {ehAluno && (
                            <button
                              onClick={() => toggleFavorite(b.id)}
                              className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'} ${favorites.has(b.id) ? 'text-red-500' : 'text-slate-400'}`}
                            >
                              <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                            </button>
                          )}
                          {ehAluno && (
                            <button 
                              onClick={() => handleReservarLivro(b.id)}
                              className={`p-2 rounded-xl transition ${isDark ? 'bg-white/5 hover:bg-white/10 text-sky-400' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'}`}
                              title="Reservar Livro"
                            >
                              <Bookmark size={15} />
                            </button>
                          )}
                        </div>
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
                    {catalogDataMaisLidos.map((b, idx) => (
                      <div 
                        key={b.id} 
                        className={`flex items-center justify-between gap-3 pb-3 border-b last:pb-0 last:border-b-0
                          ${isDark ? 'border-white/5' : 'border-gray-100'}
                        `}
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden flex-1 cursor-pointer" onClick={() => setSelectedBookDetails(b)}>
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

                        {ehAluno && (
                          <button 
                            onClick={() => toggleFavorite(b.id)}
                            className={`p-1 rounded-full transition-colors shrink-0 ${
                              favorites.has(b.id) 
                                ? 'text-red-500' 
                                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-655'
                            }`}
                          >
                            <Heart size={14} className={favorites.has(b.id) ? 'fill-red-500' : ''} />
                          </button>
                        )}
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
          )}
        </>
      )}

      <BookDetailsModal />
    </div>
  );
};

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Catalogo;
