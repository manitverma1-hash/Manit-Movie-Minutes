
import React, { useState, useEffect, useMemo } from 'react';
import { getLatestNews } from '../services/geminiService';
import type { NewsArticle, Language } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface NewsProps {
  searchQuery: string;
  language: Language;
}

const News: React.FC<NewsProps> = ({ searchQuery, language }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        // Clear previous articles to avoid mixed language content during load
        setArticles([]); 
        const fetchedArticles = await getLatestNews(language);
        setArticles(fetchedArticles);
      } catch (err) {
        setError('Failed to fetch news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [language]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) {
      return articles;
    }
    return articles.filter(
      (article) =>
        article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [articles, searchQuery]);


  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-8 text-brand-primary">Latest Bollywood Buzz</h2>
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, index) => (
            <Card key={index} className="flex flex-col">
              <div className="p-6 flex flex-col flex-grow">
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <h3 className="text-xl font-bold text-brand-secondary mb-2 hover:text-brand-secondary/80 transition-colors">{article.headline}</h3>
                </a>
                <p className="text-slate-300 flex-grow mb-4">{article.summary}</p>
                <div className="mt-auto pt-4 border-t border-slate-700">
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-brand-accent hover:underline text-sm font-semibold"
                  >
                    Source: {article.sourceName}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 mt-10">No news articles found matching your search.</p>
      )}
    </div>
  );
};

export default News;
