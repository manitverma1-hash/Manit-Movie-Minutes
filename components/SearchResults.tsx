
import React, { useState, useEffect, useCallback } from 'react';
import { getSearchResults } from '../services/geminiService';
import type { SearchResult, Language } from '../types';
import Spinner from './shared/Spinner';
import Card from './shared/Card';
import Input from './shared/Input';
import Button from './shared/Button';

interface SearchResultsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
}

/**
 * A simple markdown-to-HTML parser with enhanced styling.
 */
const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  let html = markdown;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-primary font-bold">$1</strong>');
  return html
    .split(/\n\s*\n/)
    .map(block => {
      const trimmedBlock = block.trim();
      if (trimmedBlock.startsWith('## ')) return `<h2 class="text-2xl font-bold text-brand-secondary mt-6 mb-3">${trimmedBlock.substring(3)}</h2>`;
      if (trimmedBlock.startsWith('# ')) return `<h1 class="text-3xl font-bold text-white mt-8 mb-4">${trimmedBlock.substring(2)}</h1>`;
      if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
        const listItems = trimmedBlock
          .split('\n')
          .map(line => `<li class="ml-4 list-disc text-slate-300 mb-1">${line.trim().substring(2)}</li>`)
          .join('');
        return `<ul class="my-4">${listItems}</ul>`;
      }
      return `<p class="text-slate-300 leading-relaxed mb-4">${block.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
};

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, setSearchQuery, language }) => {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSearchResults(query, language);
      setResult(data);
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    performSearch(localQuery);
  };

  const loadingMessages = [
    "Contacting the film industry...",
    "Reviewing the box office records...",
    "Interviewing the stars...",
    "Scanning Bollywood archives...",
    "Rolling the camera..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Search Bar */}
      <Card className="p-4 mb-8 bg-slate-800/50 sticky top-20 z-40 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input 
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search Bollywood again..."
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="flex flex-col items-center py-20 animate-fade-in">
           <Spinner />
           <p className="mt-4 text-brand-secondary font-bold tracking-widest uppercase animate-pulse">
             {loadingMessages[msgIdx]}
           </p>
        </div>
      )}

      {error && (
        <Card className="p-10 text-center border-red-500/30">
           <p className="text-red-400 mb-4">{error}</p>
           <Button onClick={() => performSearch(searchQuery)}>Retry Search</Button>
        </Card>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 md:p-10 mb-8 border-l-4 border-l-brand-primary">
            <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
              Search Results: <span className="text-brand-secondary">{searchQuery}</span>
            </h1>
            
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(result.text) }}
            />
          </Card>

          {result.sources.length > 0 && (
            <div className="mb-12">
               <h3 className="text-lg font-bold text-brand-accent mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.803a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.103-1.103" />
                  </svg>
                  Sources & References
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-lg text-sm text-slate-300 transition-colors flex justify-between items-center group"
                    >
                      <span className="truncate pr-4 font-medium group-hover:text-brand-primary transition-colors">{source.title}</span>
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl">Start searching to see AI-powered Bollywood info!</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
