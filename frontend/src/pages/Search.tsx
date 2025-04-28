
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const response = await axios.get('/api/search', {
        params: { query: debouncedQuery },
      });
      return response.data;
    },
    enabled: !!debouncedQuery,
  });

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Semantic Search
        </h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Search your documents with natural language..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
            🔍
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading && (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading results...</p>
          )}
          {!isLoading && results.length === 0 && debouncedQuery && (
            <p className="text-center text-gray-500 dark:text-gray-400">No results found.</p>
          )}
          {results.map((result) => (
            <div
              key={result.id}
              className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{result.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{result.content}</p>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white">
                Similarity: {(result.similarity * 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Search;
