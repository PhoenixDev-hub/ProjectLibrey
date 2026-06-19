import { useEffect, useState } from 'react';

export const useBiblioteca = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [livros, setLivros] = useState([]);
  const [emprestimos] = useState([]);

  const fetchLivros = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/livros');
      const data = await response.json();
      setLivros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivros();
  }, []);

  return { loading, error, livros, emprestimos, fetchLivros };
};
