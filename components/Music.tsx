
import React, { useState, useEffect } from 'react';
import { getBollywoodMusic } from '../services/geminiService';
import type { MusicTrack, Language } from '../types';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

interface MusicProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
}

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
  }, [searchQuery, setSearchQuery, language]); // Added language dep to re-fetch if needed, though usually user triggers

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
            <Card key={idx} className="group hover:border-brand-secondary/50">
               <div className="p-4 flex items-start gap-4">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Music;
