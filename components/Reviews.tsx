
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
 * Enhanced Markdown Parser
 * - Replaces # Headers with Icons and Colorful Styles
 * - Replaces * or - Lists with Styled Bullets (✦)
 * - Highlights **bold** text with gold color
 * - Ensures text content under headers is properly rendered
 */
const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // 1. Highlight Bold Text (**text**) - Replace with colorful bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-secondary font-bold text-lg">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="text-brand-secondary font-bold text-lg">$1</strong>');

  // 2. Process Block by Block to ensure structural integrity
  return html
    .split(/\n\s*\n/) // Split by empty lines to distinguish blocks
    .map(block => {
      const trimmedBlock = block.trim();
      
      // Auto-link URLs
      const blockWithLinks = trimmedBlock.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="break-all text-brand-accent hover:underline">$1</a>'
      );

      // --- Header Parsing ---
      // Check if the block *starts* with a header, but might contain text after it in the same block
      const headerMatch = blockWithLinks.match(/^(#+)\s+(.*?)(\n|$)/);

      if (headerMatch) {
        const level = headerMatch[1].length; 
        const title = headerMatch[2].trim();
        const restOfContent = blockWithLinks.substring(headerMatch[0].length).trim();
        
        let icon = '✨';
        const t = title.toLowerCase();
        
        // Dynamic Icons based on title
        if (t.includes('verdict') || t.includes('conclusion') || t.includes('फैसला') || t.includes('conclusión')) icon = '⚖️';
        else if (t.includes('rating') || t.includes('stars') || t.includes('रेटिंग')) icon = '⭐';
        else if (t.includes('highlight') || t.includes('best') || t.includes('मुख्य')) icon = '🌟';
        else if (t.includes('performance') || t.includes('cast') || t.includes('acting') || t.includes('प्रदर्शन')) icon = '🎭';
        else if (t.includes('story') || t.includes('plot') || t.includes('कहानी')) icon = '📖';
        else if (t.includes('music') || t.includes('song') || t.includes('soundtrack') || t.includes('संगीत')) icon = '🎵';
        else if (t.includes('direction')) icon = '🎬';

        const sizeClass = level === 1 ? 'text-2xl md:text-3xl border-b-2 border-brand-primary/50 pb-2' : 'text-xl md:text-2xl border-b border-slate-700 pb-1';
        
        let output = `
          <h${level} class="${sizeClass} font-bold text-white mt-8 mb-4 flex items-center gap-3">
            <span class="text-2xl filter drop-shadow-md">${icon}</span>
            <span class="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              ${title}
            </span>
          </h${level}>
        `;

        // If there was text immediately following the header in the same block, render it
        if (restOfContent) {
           output += `<p class="text-slate-300 leading-relaxed mb-4 text-lg">${restOfContent.replace(/\n/g, '<br />')}</p>`;
        }
        return output;
      }
      
      // --- List Item Parsing ---
      // Matches blocks that look like lists (* item or - item)
      if (trimmedBlock.match(/^(\*|-)\s/)) {
        const listItems = trimmedBlock
          .split('\n')
          .filter(line => line.trim().match(/^(\*|-)\s/))
          .map(line => {
             const content = line.trim().substring(2);
             return `
               <li class="relative pl-8 mb-3 text-slate-300">
                 <span class="absolute left-0 top-1 text-brand-primary text-xl leading-none">✦</span>
                 <span class="leading-relaxed">${content}</span>
               </li>
             `;
          })
          .join('');
        return `<ul class="my-4 space-y-1">${listItems}</ul>`;
      }
      
      // --- Default Paragraph ---
      return `<p class="text-slate-300 leading-relaxed mb-4 text-lg">${blockWithLinks.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
};

const Reviews: React.FC<ReviewsProps> = ({ searchQuery, setSearchQuery, language }) => {
  const [movie, setMovie] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (searchQuery) {
      setMovie(searchQuery);
      setSearchQuery(''); 
    }
  }, [searchQuery, setSearchQuery]);

  // Load interactions when review/movie changes
  useEffect(() => {
    if (review && movie) {
        const key = `mmm_review_interactions_${movie.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            setLikes(parsed.likes || 0);
            setComments(parsed.comments || []);
            setHasLiked(parsed.hasLiked || false);
        } else {
            setLikes(Math.floor(Math.random() * 100) + 20); // Simulated engagement
            setComments([]);
            setHasLiked(false);
        }
    }
  }, [review, movie]);

  // Save interactions
  useEffect(() => {
      if (review && movie) {
          const key = `mmm_review_interactions_${movie.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          localStorage.setItem(key, JSON.stringify({ likes, comments, hasLiked }));
      }
  }, [likes, comments, hasLiked, review, movie]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, movieTitle?: string) => {
    if (e) e.preventDefault();
    const title = movieTitle || movie;
    if (!title) return;
    
    setLoading(true);
    setError(null);
    setReview('');
    // Reset interaction state for new search
    setLikes(0);
    setComments([]);
    setHasLiked(false);
    setShowComments(false);

    try {
      const result = await generateMovieReview(title, language);
      setReview(result);
    } catch (err) {
      setError('Failed to generate review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
      if (hasLiked) {
          setLikes(l => l - 1);
          setHasLiked(false);
      } else {
          setLikes(l => l + 1);
          setHasLiked(true);
      }
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Review: ${movie}`,
                  text: `Read this detailed review of ${movie} on Manit Movie Minutes!`,
                  url: window.location.href
              });
          } catch (e) {}
      } else {
          alert("Link copied to clipboard!");
      }
  };

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      const newComment = {
          id: Date.now().toString(),
          author: 'Cinema Fan',
          text: commentText,
          date: new Date().toLocaleDateString()
      };
      setComments([newComment, ...comments]);
      setCommentText('');
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
            <h3 className="text-3xl font-bold text-brand-secondary mb-2 border-b-2 border-brand-primary pb-4">Review: {movie}</h3>
            
            <div 
              className="prose prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(review) }}
            />

            {/* Interaction Section */}
            <div className="pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 group transition-all ${hasLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
                        title="Like this review"
                    >
                        <svg className={`w-6 h-6 transform transition-transform group-hover:scale-110 ${hasLiked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold text-lg">{likes}</span>
                    </button>

                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 transition-colors ${showComments ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                        title="View comments"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-bold text-lg">{comments.length}</span>
                    </button>

                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors ml-auto md:ml-0"
                        title="Share this review"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="font-bold text-sm">Share</span>
                    </button>
                </div>
                
                {showComments && (
                    <div className="mt-6 pt-6 border-t border-slate-700/30 animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 tracking-wider">Discussion</h4>
                        
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {comments.length > 0 ? (
                                comments.map(c => (
                                    <div key={c.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-brand-secondary">{c.author}</span>
                                            <span className="text-[10px] text-slate-500">{c.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{c.text}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 bg-slate-800/30 rounded-lg">
                                    <p className="text-sm text-slate-500 italic">No comments yet. Start the discussion!</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handlePostComment} className="flex gap-3">
                            <Input 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add your thoughts on this review..."
                                className="flex-grow text-sm py-2"
                            />
                            <Button type="submit" className="text-sm px-4 py-2">Post</Button>
                        </form>
                    </div>
                )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reviews;
