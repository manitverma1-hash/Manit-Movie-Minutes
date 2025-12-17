
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBoxOfficeTrends, generateMoviePoster, getMovieTrailer } from '../services/geminiService';
import type { BoxOfficeData, BoxOfficeMovie, Language } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import Button from './shared/Button';

interface BoxOfficeProps {
    language: Language;
}

// Reusable SVG Bar Chart Component
const BarChart: React.FC<{ 
  data: { label: string; value: number; color: string }[];
  height?: number; 
}> = ({ data, height = 200 }) => {
  // Ensure we have a valid max value to avoid division by zero
  const maxValue = Math.max(...data.map(d => d.value), 1); 
  
  return (
    <div 
      className="w-full flex items-end justify-around space-x-2 md:space-x-4 pt-6 pb-2" 
      style={{ height: `${height + 50}px` }} // Add padding for labels
    >
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * height;
        return (
          <div key={index} className="flex flex-col items-center flex-1 group w-full">
            {/* Value tooltip on hover */}
            <span className="mb-1 text-[10px] md:text-xs font-bold text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ₹{item.value} Cr
            </span>
            
            {/* The Bar */}
            <div 
              className="w-full max-w-[50px] rounded-t-md transition-all duration-500 ease-out hover:brightness-110 relative min-h-[4px]"
              style={{ 
                height: `${barHeight}px`, 
                backgroundColor: item.color 
              }}
            >
              {/* Optional: Show value inside bar if it's tall enough */}
              {barHeight > 30 && (
                <div className="hidden md:block absolute top-1 w-full text-center text-[10px] text-white/90 font-bold overflow-hidden px-1">
                  {Math.round(item.value)}
                </div>
              )}
            </div>
            
            {/* Label */}
            <span className="mt-2 text-[10px] md:text-xs text-center text-slate-400 leading-tight w-full truncate px-1" title={item.label}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const MoviePoster: React.FC<{ url?: string; title: string; className?: string }> = ({ url, title, className = "" }) => {
  const [error, setError] = useState(false);

  // Show placeholder if url is explicitly 'failed' or if load error occurred
  if (url === 'failed' || error) {
    return (
      <div className={`bg-slate-700 flex items-center justify-center ${className}`}>
        <div className="text-center p-2">
          <span className="text-4xl">🎬</span>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{title}</p>
        </div>
      </div>
    );
  }

  // Show loading spinner if url is loading (empty string) or undefined
  if (!url) {
     return (
        <div className={`bg-slate-700 flex flex-col items-center justify-center animate-pulse ${className}`}>
          <div className="w-8 h-8 border-2 border-slate-500 border-t-brand-primary rounded-full animate-spin mb-2"></div>
          <p className="text-[10px] text-slate-400">Loading Poster...</p>
        </div>
     );
  }

  return (
    <img 
      src={url} 
      alt={`${title} Poster`} 
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
};

const BoxOffice: React.FC<BoxOfficeProps> = ({ language }) => {
  const [data, setData] = useState<BoxOfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<BoxOfficeMovie | null>(null);
  const [sortBy, setSortBy] = useState<'collection' | 'date'>('collection');
  const [filterVerdict, setFilterVerdict] = useState<string>('All');
  
  // Local state to hold generated posters. 
  // Keys are movie titles. Values: '' (loading), 'failed' (error), or 'data:image...' (success).
  const [generatedPosters, setGeneratedPosters] = useState<Record<string, string>>({});

  // Local state for Trailer
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // When selectedMovie changes, reset trailer states
  useEffect(() => {
     setTrailerId(null);
     setLoadingTrailer(false);
  }, [selectedMovie]);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGeneratedPosters({}); // Clear posters on refresh
    try {
      const result = await getBoxOfficeTrends(language);
      setData(result);
    } catch (err) {
      setError('Failed to fetch box office data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends, key]);

  // Effect to lazy generate posters if API didn't provide one
  useEffect(() => {
    if (data?.movies) {
      data.movies.forEach(async (movie) => {
        // We only generate if:
        // 1. No posterUrl from the API
        // 2. We haven't started generating yet (key is undefined)
        // Note: generatedPosters[movie.title] will be '' if loading, which is falsy, so we check strict undefined
        if (!movie.posterUrl && generatedPosters[movie.title] === undefined) {
           try {
             // Mark as loading
             setGeneratedPosters(prev => ({ ...prev, [movie.title]: '' }));
             
             const posterBase64 = await generateMoviePoster(movie.title);
             
             setGeneratedPosters(prev => ({ 
               ...prev, 
               [movie.title]: posterBase64 || 'failed' 
             }));
           } catch (e) {
             console.error("Poster gen failed for", movie.title);
             setGeneratedPosters(prev => ({ ...prev, [movie.title]: 'failed' }));
           }
        }
      });
    }
  }, [data]); // Removed generatedPosters from deps to avoid re-running

  const sortedMovies = useMemo(() => {
    if (!data?.movies) return [];
    
    let filteredMovies = data.movies;

    if (filterVerdict !== 'All') {
      filteredMovies = filteredMovies.filter(m => 
        m.verdict.toLowerCase().includes(filterVerdict.toLowerCase())
      );
    }

    return [...filteredMovies].sort((a, b) => {
      if (sortBy === 'collection') {
        return b.totalCollection - a.totalCollection;
      } else {
        // Parse dates (assuming format like "DD MMM YYYY")
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        
        // Handle potentially invalid dates by pushing them to the end or treating as 0
        const valA = isNaN(dateA) ? 0 : dateA;
        const valB = isNaN(dateB) ? 0 : dateB;
        
        return valB - valA; // Newest first
      }
    });
  }, [data, sortBy, filterVerdict]);

  const handleBookTickets = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${title} movie tickets showtimes`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };
  
  const handleWhereToWatch = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    const query = encodeURIComponent(`where to watch ${title} movie online streaming`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleWatchTrailer = async (e: React.MouseEvent, movie: BoxOfficeMovie) => {
    e.stopPropagation();
    
    // If not already active movie, set it to open modal
    if (selectedMovie?.title !== movie.title) {
        setSelectedMovie(movie);
    }
    
    setLoadingTrailer(true);
    setTrailerId(null);
    try {
       const id = await getMovieTrailer(movie.title);
       setTrailerId(id);
    } catch {
       console.error("Failed to load trailer");
    } finally {
       setLoadingTrailer(false);
    }
  };

  const colors = ['#E91E63', '#00BCD4', '#FFC107', '#9C27B0', '#4CAF50'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-primary">Box Office Insider</h2>
        <p className="text-slate-400 mt-2">Live trends, weekly collections, and verdicts</p>
      </div>

      {loading && <Spinner />}
      
      {error && (
        <Card className="p-8 text-center border-red-500/50">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => setKey(k => k + 1)}>Retry</Button>
        </Card>
      )}

      {data && !loading && (
        <>
          {/* Market Summary Card */}
          <Card className="p-6 border-l-4 border-l-brand-secondary">
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Market Pulse</h3>
            <p className="text-slate-300 leading-relaxed">{data.marketSummary}</p>
          </Card>

          {/* Main Chart: Top Grossers */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-brand-accent mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Top Grossers (Total Collection)
            </h3>
            <BarChart 
              height={200}
              data={data.movies
                // Ensure chart is always sorted by collection for visual consistency
                .sort((a, b) => b.totalCollection - a.totalCollection)
                .map((m, i) => ({
                  label: m.title,
                  value: m.totalCollection,
                  color: colors[i % colors.length]
              }))} 
            />
            <p className="text-xs text-center text-slate-500 mt-4">* Figures in Crores (INR)</p>

            {/* Sources Section moved here */}
            {data.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Data Sources</span>
                <div className="flex flex-wrap justify-center gap-3">
                  {data.sources.map((source, i) => {
                    let hostname = source;
                    try {
                      hostname = new URL(source).hostname.replace('www.', '');
                    } catch (e) {
                       // keep original if parsing fails
                    }
                    return (
                      <a 
                        key={i} 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-brand-accent hover:text-white transition-colors hover:underline"
                        title={source}
                      >
                        {hostname}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-col gap-4 px-2">
            {/* Header and Sort */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white hidden md:block">Movie Breakdown</h3>
                <div className="flex items-center space-x-2 ml-auto">
                    <span className="text-slate-400 text-sm mr-1">Sort:</span>
                    <button 
                        onClick={() => setSortBy('collection')}
                        className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                        sortBy === 'collection' 
                            ? 'bg-brand-primary text-white shadow-lg' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        Highest Grossing
                    </button>
                    <button 
                        onClick={() => setSortBy('date')}
                        className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                        sortBy === 'date' 
                            ? 'bg-brand-primary text-white shadow-lg' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        Newest First
                    </button>
                </div>
            </div>

            {/* Verdict Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-slate-400 text-sm whitespace-nowrap mr-1">Filter:</span>
                {['All', 'Blockbuster', 'Hit', 'Average', 'Flop'].map((verdict) => (
                    <button
                        key={verdict}
                        onClick={() => setFilterVerdict(verdict)}
                        className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors border ${
                        filterVerdict === verdict
                            ? 'bg-brand-accent text-slate-900 border-brand-accent'
                            : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400 hover:text-white'
                        }`}
                    >
                        {verdict}
                    </button>
                ))}
            </div>
          </div>

          {/* Detailed Movie Breakdown */}
          {sortedMovies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedMovies.map((movie, index) => (
                <Card 
                    key={movie.title} // Changed key to title for stable reordering
                    className="flex flex-col md:flex-row cursor-pointer hover:ring-2 hover:ring-brand-accent transition-all transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                    onClick={() => setSelectedMovie(movie)}
                    title="Click for detailed stats"
                >
                    {/* Poster Section - Mobile: Top, Desktop: Left */}
                    <div className="w-full md:w-32 h-48 md:h-auto md:flex-shrink-0 relative bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700">
                        <MoviePoster 
                        url={movie.posterUrl || generatedPosters[movie.title]} 
                        title={movie.title} 
                        className="w-full h-full" 
                        />
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                        <div className="pr-2">
                            <h4 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-1">{movie.title}</h4>
                            <div className="flex flex-col gap-1 mt-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase w-fit ${
                                movie.verdict.toLowerCase().includes('flop') ? 'bg-red-900 text-red-200' :
                                movie.verdict.toLowerCase().includes('average') ? 'bg-yellow-900 text-yellow-200' :
                                'bg-green-900 text-green-200'
                            }`}>
                                {movie.verdict}
                            </span>
                            <div className="text-sm text-slate-400 mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {movie.releaseDate || 'N/A'}
                            </div>
                            
                            {movie.cast && (
                                <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                                    <span className="text-brand-accent/80 mr-1">Starring:</span> 
                                    {movie.cast.join(', ')}
                                </div>
                            )}
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <span className="block text-xl md:text-2xl font-bold text-brand-primary">₹{movie.totalCollection}</span>
                            <span className="text-xs text-slate-400">Cr</span>
                        </div>
                        </div>
                    </div>

                    {/* Small Weekly Chart & Action */}
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-end justify-between gap-4">
                        <div className="flex-grow">
                            {movie.weeklyEarnings.length > 0 ? (
                            <BarChart 
                                height={60}
                                data={movie.weeklyEarnings.map(w => ({
                                label: w.week.replace('Week ', 'W'), // Shorten label
                                value: w.amount,
                                color: colors[index % colors.length]
                                }))}
                            />
                            ) : (
                            <p className="text-xs text-slate-500 italic mt-2">Details unavailable.</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                                onClick={(e) => handleWatchTrailer(e, movie)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-md transition-colors flex items-center justify-center w-full"
                                title="Watch Trailer"
                            >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                </svg>
                                Trailer
                            </button>
                            <button
                                onClick={(e) => handleBookTickets(e, movie.title)}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold py-1.5 px-3 rounded shadow-md transition-colors flex items-center justify-center w-full"
                                title="Book Tickets"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                Book
                            </button>
                            <button
                                onClick={(e) => handleWhereToWatch(e, movie.title)}
                                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-md transition-colors flex items-center justify-center w-full"
                                title="Where to Watch"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Watch
                            </button>
                        </div>
                    </div>
                    </div>
                </Card>
                ))}
            </div>
          ) : (
             <div className="py-12 text-center bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
                <p className="text-slate-400 text-lg">No movies found with verdict: <span className="text-brand-accent font-bold">{filterVerdict}</span></p>
                <button onClick={() => setFilterVerdict('All')} className="mt-4 text-brand-primary hover:underline text-sm">Clear Filter</button>
             </div>
          )}

          <div className="text-center mt-8">
            <Button onClick={() => setKey(k => k + 1)}>Refresh Data</Button>
          </div>

          {/* Movie Detail Modal */}
          {selectedMovie && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setSelectedMovie(null)}
            >
              <div 
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col md:flex-row">
                   {/* Modal Poster Section */}
                   <div className="w-full md:w-1/3 bg-black h-64 md:h-auto relative border-b md:border-b-0 md:border-r border-slate-700">
                      <MoviePoster 
                        url={selectedMovie.posterUrl || generatedPosters[selectedMovie.title]} 
                        title={selectedMovie.title} 
                        className="w-full h-full"
                      />
                   </div>

                   {/* Modal Content */}
                  <div className="p-6 md:p-8 flex-grow md:w-2/3">
                    
                    {/* Trailer Overlay Section */}
                    {(loadingTrailer || trailerId) && (
                        <div className="w-full aspect-video bg-black rounded-lg mb-6 overflow-hidden relative shadow-2xl border border-slate-700">
                            {loadingTrailer ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <div className="w-8 h-8 border-2 border-slate-500 border-t-red-600 rounded-full animate-spin"></div>
                                    <span className="text-xs">Loading Trailer...</span>
                                </div>
                            ) : trailerId ? (
                                <iframe 
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                                    title={`${selectedMovie.title} Trailer`}
                                    allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                   <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                   </svg>
                                   <span className="text-sm">Trailer not found</span>
                                </div>
                            )}
                            <button 
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                                onClick={() => { setTrailerId(null); setLoadingTrailer(false); }}
                                title="Close Trailer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white">{selectedMovie.title}</h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-block px-3 py-1 rounded text-sm font-bold uppercase ${
                            selectedMovie.verdict.toLowerCase().includes('flop') ? 'bg-red-900 text-red-200' :
                            selectedMovie.verdict.toLowerCase().includes('average') ? 'bg-yellow-900 text-yellow-200' :
                            'bg-green-900 text-green-200'
                          }`}>
                            {selectedMovie.verdict}
                          </span>
                          <span className="text-slate-400 text-sm">Box Office Report</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedMovie(null)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full p-2 transition-colors"
                        aria-label="Close modal"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                        <span className="text-sm text-slate-400 block mb-1 uppercase tracking-wider">Release Date</span>
                        <span className="text-lg font-bold text-white">{selectedMovie.releaseDate || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                        <span className="text-sm text-slate-400 block mb-1 uppercase tracking-wider">Total Collection</span>
                        <span className="text-2xl font-bold text-brand-primary">₹{selectedMovie.totalCollection}<span className="text-sm text-slate-400 ml-1">Cr</span></span>
                      </div>
                       <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                        <span className="text-sm text-slate-400 block mb-1 uppercase tracking-wider">Weeks in Theater</span>
                        <span className="text-2xl font-bold text-brand-accent">{selectedMovie.weeklyEarnings.length > 0 ? selectedMovie.weeklyEarnings.length : 'N/A'}</span>
                      </div>
                      
                      {/* Cast Section in Modal */}
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                        <span className="text-sm text-slate-400 block mb-1 uppercase tracking-wider">Cast</span>
                        <span className="text-sm font-bold text-white leading-tight block">
                            {selectedMovie.cast?.join(', ') || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mb-8 flex flex-col gap-3">
                       <div className="flex flex-col sm:flex-row gap-3">
                           <button
                              onClick={(e) => handleBookTickets(e, selectedMovie.title)}
                              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
                           >
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              Book Tickets
                           </button>
                           <button
                              onClick={(e) => handleWhereToWatch(e, selectedMovie.title)}
                              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
                           >
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Where to Watch
                           </button>
                       </div>
                       
                       <button
                          onClick={(e) => handleWatchTrailer(e, selectedMovie)}
                          disabled={loadingTrailer || !!trailerId}
                          className={`w-full font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform flex items-center justify-center ${
                             loadingTrailer || trailerId 
                             ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                             : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                          }`}
                       >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                          {trailerId ? 'Watching...' : 'Watch Trailer'}
                       </button>
                    </div>

                    {/* Large Chart */}
                    <div className="mb-2">
                       <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          Weekly Performance Analysis
                       </h3>
                       <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
                          {selectedMovie.weeklyEarnings.length > 0 ? (
                               <BarChart 
                                  data={selectedMovie.weeklyEarnings.map((w, i) => ({
                                      label: w.week,
                                      value: w.amount,
                                      color: colors[i % colors.length] 
                                  }))}
                                  height={200}
                               />
                          ) : (
                               <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p>No detailed weekly data available for this title.</p>
                                </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoxOffice;
