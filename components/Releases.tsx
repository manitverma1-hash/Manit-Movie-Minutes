
import React, { useState, useEffect } from 'react';
import { getUpcomingReleases } from '../services/geminiService';
import type { UpcomingMovie, Language } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import Button from './shared/Button';

interface ReleasesProps {
  language: Language;
}

const Releases: React.FC<ReleasesProps> = ({ language }) => {
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingReleases(language);
      setMovies(data);
    } catch (err) {
      setError("Failed to load upcoming releases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [language]);

  const getBuzzColor = (buzz: string) => {
    const b = buzz.toLowerCase();
    if (b.includes('high')) return 'text-green-400 border-green-400';
    if (b.includes('medium')) return 'text-yellow-400 border-yellow-400';
    return 'text-slate-400 border-slate-400';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-brand-primary">Upcoming Releases</h2>
           <p className="text-slate-400">Mark your calendars for the next big blockbusters.</p>
        </div>
        <Button onClick={fetchMovies} className="text-sm px-4 py-1">Refresh</Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && movies.length > 0 && (
         <div className="relative border-l-2 border-slate-700 ml-4 space-y-8">
            {movies.map((movie, index) => (
              <div key={index} className="relative pl-8">
                 {/* Timeline Dot */}
                 <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-brand-primary border-4 border-slate-900 shadow-lg shadow-brand-primary/50"></div>
                 
                 <Card className="hover:border-l-4 hover:border-l-brand-primary transition-all duration-300">
                    <div className="p-6">
                       <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                             <span className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-1 block">{movie.releaseDate}</span>
                             <h3 className="text-2xl font-bold text-white">{movie.title}</h3>
                             <p className="text-sm text-slate-400">Dir. {movie.director}</p>
                          </div>
                          <div className={`mt-2 md:mt-0 px-3 py-1 border rounded text-xs font-bold uppercase ${getBuzzColor(movie.buzz)}`}>
                             Buzz: {movie.buzz}
                          </div>
                       </div>
                       
                       <p className="text-slate-300 italic mb-4 border-l-2 border-slate-600 pl-4">{movie.synopsis}</p>
                       
                       <div className="flex flex-wrap gap-2">
                          {movie.cast.map((actor, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600">
                                {actor}
                             </span>
                          ))}
                       </div>
                    </div>
                 </Card>
              </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default Releases;
