
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getLatestNews } from '../services/geminiService';
import type { NewsArticle, Language } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import Button from './shared/Button';

interface NewsProps {
  searchQuery: string;
  language: Language;
}

const CATEGORIES = ["All", "Trending", "Box Office", "Casting", "Fashion", "Gossip"];

const News: React.FC<NewsProps> = ({ searchQuery, language }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setArticles([]); 
      const fetchedArticles = await getLatestNews(language);
      setArticles(fetchedArticles);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleShare = async (e: React.MouseEvent, article: NewsArticle) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: article.headline,
      text: article.summary,
      url: article.sourceUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('User cancelled share or error occurred:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(article.sourceUrl);
        setShareFeedback(article.sourceUrl);
        setTimeout(() => setShareFeedback(null), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const filteredArticles = useMemo(() => {
    let list = articles;
    
    if (selectedCategory !== "All") {
      list = list.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (searchQuery) {
      list = list.filter(
        (article) =>
          article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [articles, searchQuery, selectedCategory]);

  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('box')) return 'bg-emerald-600';
    if (c.includes('fashion') || c.includes('style')) return 'bg-pink-600';
    if (c.includes('gossip')) return 'bg-orange-600';
    if (c.includes('casting')) return 'bg-indigo-600';
    return 'bg-brand-primary';
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
           <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
             Bollywood <span className="text-brand-primary">Bulletins</span>
           </h2>
           <p className="text-slate-400 mt-1">Real-time updates from the heart of Mumbai.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
             onClick={fetchNews} 
             disabled={loading} 
             variant="secondary"
             className="flex items-center gap-2 text-sm py-2 px-4 whitespace-nowrap"
           >
              <svg 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh News
           </Button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
         {CATEGORIES.map(cat => (
           <button
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
               selectedCategory === cat 
               ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
               : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center">
          <Spinner />
          <p className="mt-4 text-slate-500 animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Scanning Headlines...</p>
        </div>
      )}
      
      {error && (
        <Card className="p-12 text-center border-red-500/30 max-w-lg mx-auto">
          <div className="mb-4 text-red-500 inline-block bg-red-500/10 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-300 mb-6 font-medium">{error}</p>
          <Button onClick={fetchNews}>Try Again</Button>
        </Card>
      )}

      {!loading && filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <Card 
              key={index} 
              className="group flex flex-col h-full hover:scale-[1.02] transition-transform duration-300 border-b-4"
              style={{ borderBottomColor: `var(--tw-bg-opacity, 1) ${getCategoryColor(article.category)}` }}
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${getCategoryColor(article.category)} shadow-sm`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center">
                     <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     {article.date || 'Just now'}
                  </span>
                </div>

                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-secondary transition-colors leading-snug">
                    {article.headline}
                  </h3>
                </a>

                <p className="text-slate-400 text-sm flex-grow mb-6 leading-relaxed line-clamp-4">
                  {article.summary}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      {article.sourceName}
                    </span>
                    <a 
                      href={article.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-white transition-colors"
                    >
                      Read Full Story
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleShare(e, article)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-brand-secondary transition-colors py-1 px-2 rounded-md hover:bg-slate-700/50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {shareFeedback === article.sourceUrl ? (
                        <span className="text-brand-secondary animate-fade-in font-black">Link Copied!</span>
                      ) : (
                        <span>Share News</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
          <div className="mb-4 text-slate-600 inline-block">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No articles found matching your criteria.</p>
          <Button onClick={() => { setSelectedCategory("All"); fetchNews(); }} variant="secondary" className="mt-4 text-sm">
            View All News
          </Button>
        </div>
      )}
    </div>
  );
};

export default News;
