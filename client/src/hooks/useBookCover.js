import { useEffect, useState } from 'react';

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
    return null;
  }
};

const removeStoredCover = (key) => {
  try {
    localStorage.removeItem(`${COVER_CACHE_PREFIX}${key}`);
  } catch {
    return null;
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

export function useBookCover(title, author, size = 'md', initialUrl = null) {
  const cacheKey = makeCoverCacheKey(title, author);
  const [coverUrl, setCoverUrl] = useState(() => initialUrl || coverCache.get(cacheKey) || readStoredCover(cacheKey) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setCoverUrl(initialUrl);
      coverCache.set(cacheKey, initialUrl);
      storeCover(cacheKey, initialUrl);
      return;
    }

    if (!title) {
      setCoverUrl(null);
      setLoading(false);
      return;
    }

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
        } else {
          coverCache.delete(cacheKey);
          removeStoredCover(cacheKey);
        }

        setCoverUrl(foundCover || null);
      } catch (error) {
        console.error('Erro ao buscar capa no Open Library:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    searchBookCover();

    return () => {
      active = false;
    };
  }, [title, author, size, initialUrl, cacheKey]);

  return { coverUrl, loading };
}

export default useBookCover;
