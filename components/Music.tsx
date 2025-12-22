
import React, { useState, useEffect } from 'react';
import { getBollywoodMusic } from '../services/geminiService';
import type { MusicTrack, Language, UserComment } from '../types';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

interface MusicProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
}

const MusicCard: React.FC<{ track: MusicTrack }> = ({ track }) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [commentText, setCommentText] = useState('');

  // Create a unique key for local storage based on title and movie
  const storageKey = `mmm_music_${track.title}_${track.movie}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLikes(parsed.likes || 0);
      setHasLiked(parsed.hasLiked || false);
      setComments(parsed.comments || []);
    } else {
      // Simulate some initial engagement
      setLikes(Math.floor(Math.random() * 300) + 50);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ likes, hasLiked, comments }));
  }, [likes, hasLiked, comments, storageKey]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${track.title} - ${track.movie}`,
      text: `Check out this song: ${track.title} from ${track.movie}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(track.youtubeQuery)}`
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      alert('Link copied to clipboard!');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: UserComment = {
      id: Date.now().toString(),
      author: 'Music Fan',
      text: commentText,
      date: new Date().toLocaleDateString()
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  };

  return (
    <Card className="group hover:border-brand-secondary/50 flex flex-col h-full">
       <div className="p-4 flex items-start gap-4 flex-grow">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-brand-secondary transition-colors relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent animate-spin-slow"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
             </svg>
          </div>
          <div className="flex-grow">
             <h3 className="text-lg font-bold text-white leading-tight">{track.title}</h3>
             <p className="text-sm text-brand-accent mb-1">{track.movie}</p>
             <p className="text-xs text-slate-400 line-clamp-1">🎤 {track.singers.join(', ')}</p>
             <p className="text-xs text-slate-400">🎼 {track.composer}</p>
             
             <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">{track.mood}</span>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.youtubeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-secondary hover:underline flex items-center"
                >
                  Play on YouTube
                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
                </a>
             </div>
          </div>
       </div>

       {/* Interaction Bar */}
       <div className="border-t border-slate-700/50 bg-slate-900/30 p-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}>
                  <svg className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likes}
               </button>
               <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showComments ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {comments.length}
               </button>
             </div>
             <button onClick={handleShare} className="text-slate-400 hover:text-green-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
             </button>
          </div>

          {/* Comments Dropdown */}
          {showComments && (
             <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in slide-in-from-top-2">
                <div className="max-h-32 overflow-y-auto mb-3 space-y-2 pr-1 custom-scrollbar">
                   {comments.length > 0 ? (
                      comments.map(c => (
                         <div key={c.id} className="bg-slate-800 p-2 rounded text-[10px] md:text-xs">
                            <div className="flex justify-between mb-0.5">
                               <span className="font-bold text-brand-secondary">{c.author}</span>
                               <span className="text-slate-500">{c.date}</span>
                            </div>
                            <p className="text-slate-300">{c.text}</p>
                         </div>
                      ))
                   ) : (
                      <p className="text-[10px] text-slate-500 text-center italic">No comments yet.</p>
                   )}
                </div>
                <form onSubmit={handlePostComment} className="flex gap-2">
                   <Input 
                     value={commentText}
                     onChange={e => setCommentText(e.target.value)}
                     placeholder="Add a comment..."
                     className="text-xs py-1 h-8 bg-slate-800 border-slate-700"
                   />
                   <Button type="submit" className="text-xs px-3 py-1 h-8 bg-slate-700 hover:bg-slate-600">Post</Button>
                </form>
             </div>
          )}
       </div>
    </Card>
  );
};

const Music: React.FC<MusicProps> = ({ searchQuery, setSearchQuery, language }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Initial load or search trigger
  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      setSearchQuery(''); // Clear global search
      handleSearch(undefined, searchQuery);
    } else if (tracks.length === 0) {
      // Load trending by default
      handleSearch();
    }
  }, [searchQuery, setSearchQuery, language]); 

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const q = overrideQuery !== undefined ? overrideQuery : query;
    
    setLoading(true);
    setError(null);
    setTracks([]);
    try {
      const results = await getBollywoodMusic(q, language);
      setTracks(results);
    } catch (err) {
      setError("Failed to fetch songs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-primary mb-2">Music Lounge</h2>
        <p className="text-slate-400">Discover trending beats, find songs by mood, or look up your favorite tracks.</p>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Song, Mood (e.g., Party), or Actor..."
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find Music'}
          </Button>
        </form>
         <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['Romantic 2024', 'Arijit Singh Hits', 'Punjabi Party', '90s Bollywood', 'Sad Songs'].map(tag => (
               <button key={tag} onClick={() => { setQuery(tag); handleSearch(undefined, tag); }} className="text-xs bg-slate-700 hover:bg-brand-accent hover:text-white px-3 py-1 rounded-full text-slate-300 transition-colors">
                 {tag}
               </button>
            ))}
         </div>
      </Card>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && tracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track, idx) => (
            <MusicCard key={idx} track={track} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Music;
