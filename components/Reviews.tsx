
import React, { useState, useEffect } from 'react';
import { generateMovieReview } from '../services/geminiService';
import type { Language } from '../types';
import Button from './shared/Button';
import Card from './shared/Card';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

const movieSuggestions = ["Dangal", "3 Idiots", "Lagaan", "Sholay", "Jawan"];

interface ReviewsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
}

/**
 * A simple markdown-to-HTML parser with enhanced styling for reviews.
 */
const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // 1. Highlight Bold Text with brand color
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-primary font-bold text-lg">$1</strong>');
  // Handle alternative underscore bolding if present
  html = html.replace(/__(.*?)__/g, '<strong class="text-brand-primary font-bold text-lg">$1</strong>');

  return html
    .split(/\n\s*\n/)
    .map(block => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const blockWithLinks = block.replace(
        urlRegex,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="break-all">$1</a>'
      );

      const trimmedBlock = blockWithLinks.trim();

      // Headings with Icons
      if (trimmedBlock.startsWith('## ')) {
        const title = trimmedBlock.substring(3);
        let icon = '';
        const t = title.toLowerCase();
        
        if (t.includes('verdict') || t.includes('फैसला') || t.includes('conclusión')) icon = '⚖️ ';
        else if (t.includes('rating') || t.includes('stars') || t.includes('रेटिंग')) icon = '⭐ ';
        else if (t.includes('highlight') || t.includes('best') || t.includes('मुख्य')) icon = '✨ ';
        else if (t.includes('performance') || t.includes('cast') || t.includes('प्रदर्शन')) icon = '🎭 ';
        else if (t.includes('story') || t.includes('plot') || t.includes('कहानी')) icon = '📖 ';
        else if (t.includes('music') || t.includes('song') || t.includes('संगीत')) icon = '🎵 ';
        
        return `<h2 class="mt-6 mb-3 flex items-center gap-2">${icon}${title}</h2>`;
      }
      
      // List Items with Bullets
      if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
        const listItems = trimmedBlock
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
             // Remove bullet char
             let content = line.trim().substring(2);
             // Ensure inline bolding inside lists is preserved (handled by initial replace)
             return `<li class="pl-2">${content}</li>`;
          })
          .join('');
        return `<ul>${listItems}</ul>`;
      }
      
      return `<p>${blockWithLinks.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
};

const Reviews: React.FC<ReviewsProps> = ({ searchQuery, setSearchQuery, language }) => {
  const [movie, setMovie] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery) {
      setMovie(searchQuery);
      setSearchQuery(''); // Clear global search after using it
    }
  }, [searchQuery, setSearchQuery]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, movieTitle?: string) => {
    if (e) e.preventDefault();
    const title = movieTitle || movie;
    if (!title) return;
    
    setLoading(true);
    setError(null);
    setReview('');
    try {
      const result = await generateMovieReview(title, language);
      setReview(result);
    } catch (err) {
      setError('Failed to generate review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-brand-primary">Movie Reviews</h2>
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="movie" className="block text-lg font-semibold mb-2 text-brand-accent">
            Enter Movie Title
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="movie"
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              placeholder="e.g., Dilwale Dulhania Le Jayenge"
            />
            <Button type="submit" disabled={loading || !movie}>
              {loading ? 'Generating...' : 'Generate Review'}
            </Button>
          </div>
        </form>
         <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 mr-2">Try:</span>
            {movieSuggestions.map(name => (
                <button key={name} onClick={() => {setMovie(name); handleSubmit(undefined, name)}} className="bg-slate-700 text-xs px-3 py-1 rounded-full hover:bg-brand-primary transition-colors">
                    {name}
                </button>
            ))}
        </div>
      </Card>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-400">{error}</p>}

      {review && (
        <Card>
          <div className="p-6 md:p-8 animate-in fade-in duration-500">
            <h3 className="text-3xl font-bold text-brand-secondary mb-2 border-b border-slate-700 pb-4">Review: {movie}</h3>
            
            <div 
              className="prose prose-invert max-w-none 
                prose-p:text-slate-300 prose-p:leading-relaxed 
                prose-headings:text-brand-secondary prose-headings:font-bold prose-headings:text-2xl
                prose-ul:text-slate-300 prose-ul:list-none prose-ul:pl-0
                prose-li:relative prose-li:pl-6 prose-li:before:content-['✓'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-brand-primary prose-li:before:font-bold
                prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(review) }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reviews;
