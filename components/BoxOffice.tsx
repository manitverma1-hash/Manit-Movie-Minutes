
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBoxOfficeTrends, generateMoviePoster, getMovieTrailer, getStreamingInfo } from '../services/geminiService';
import type { BoxOfficeData, BoxOfficeMovie, Language } from '../types';
import Card from './shared/Card';
import Spinner from './shared/Spinner';
import Button from './shared/Button';

interface BoxOfficeProps {
    language: Language;
}

const BarChart: React.FC<{ 
  data: { label: string; value: number; color: string }[];
  height?: number; 
}> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); 
  return (
    <div className="w-full flex items-end justify-around space-x-2 md:space-x-4 pt-6 pb-2" style={{ height: `${height + 50}px` }}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * height;
        return (
          <div key={index} className="flex flex-col items-center flex-1 group w-full">
            <span className="mb-1 text-[10px] md:text-xs font-bold text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">₹{item.value} Cr</span>
            <div className="w-full max-w-[50px] rounded-t-md transition-all duration-500 ease-out hover:brightness-110 relative min-h-[4px]" style={{ height: `${barHeight}px`, backgroundColor: item.color }}>
              {barHeight > 30 && <div className="hidden md:block absolute top-1 w-full text-center text-[10px] text-white/90 font-bold overflow-hidden px-1">{Math.round(item.value)}</div>}
            </div>
            <span className="mt-2 text-[10px] md:text-xs text-center text-slate-400 leading-tight w-full truncate px-1" title={item.label}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const MoviePoster: React.FC<{ url?: string; title: string; className?: string }> = ({ url, title, className = "" }) => {
  const [error, setError] = useState(false);
  if (url === 'failed' || error) {
    return (
      <div className={`bg-slate-700 flex items-center justify-center ${className}`}>
        <div className="text-center p-2"><span className="text-4xl">🎬</span><p className="text-xs text-slate-400 mt-2 line-clamp-2">{title}</p></div>
      </div>
    );
  }
  if (!url) {
     return (
        <div className={`bg-slate-700 flex flex-col items-center justify-center animate-pulse ${className}`}>
          <div className="w-8 h-8 border-2 border-slate-500 border-t-brand-primary rounded-full animate-spin mb-2"></div>
          <p className="text-[10px] text-slate-400">Loading...</p>
        </div>
     );
  }
  return <img src={url} alt={`${title} Poster`} className={`object-cover ${className}`} onError={() => setError(true)} />;
};

const BoxOffice: React.FC<BoxOfficeProps> = ({ language }) => {
  const [data, setData] = useState<BoxOfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<BoxOfficeMovie | null>(null);
  const [sortBy, setSortBy] = useState<'collection' | 'date'>('collection');
  const [filterVerdict, setFilterVerdict] = useState<string>('All');
  
  const [generatedPosters, setGeneratedPosters] = useState<Record<string, string>>({});
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [streamingInfo, setStreamingInfo] = useState<{ platform: string, url: string }[]>([]);
  const [loadingStreaming, setLoadingStreaming] = useState(false);

  useEffect(() => {
     setTrailerId(null);
     setLoadingTrailer(false);
     setStreamingInfo([]);
     setLoadingStreaming(false);

     if (selectedMovie) {
        handleLoadStreaming(selectedMovie.title);
     }
  }, [selectedMovie]);

  const handleLoadStreaming = async (title: string) => {
    setLoadingStreaming(true);
    try {
      const info = await getStreamingInfo(title);
      setStreamingInfo(info);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStreaming(false);
    }
  };

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGeneratedPosters({});
    try {
      const result = await getBoxOfficeTrends(language);
      setData(result);
    } catch (err) {
      setError('Failed to fetch box office data.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => { fetchTrends(); }, [fetchTrends, key]);

  useEffect(() => {
    if (data?.movies) {
      data.movies.forEach(async (movie) => {
        if (!movie.posterUrl && generatedPosters[movie.title] === undefined) {
           try {
             setGeneratedPosters(prev => ({ ...prev, [movie.title]: '' }));
             const posterBase64 = await generateMoviePoster(movie.title);
             setGeneratedPosters(prev => ({ ...prev, [movie.title]: posterBase64 || 'failed' }));
           } catch (e) {
             setGeneratedPosters(prev => ({ ...prev, [movie.title]: 'failed' }));
           }
        }
      });
    }
  }, [data]);

  const sortedMovies = useMemo(() => {
    if (!data?.movies) return [];
    let filteredMovies = data.movies;
    if (filterVerdict !== 'All') {
      filteredMovies = filteredMovies.filter(m => m.verdict.toLowerCase().includes(filterVerdict.toLowerCase()));
    }
    return [...filteredMovies].sort((a, b) => {
      if (sortBy === 'collection') return b.totalCollection - a.totalCollection;
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [data, sortBy, filterVerdict]);

  const handleBookTickets = (e: React.MouseEvent, title: string, platform?: 'bms' | 'district' | 'paytm') => {
    e.stopPropagation();
    let url = `https://www.google.com/search?q=${encodeURIComponent(`${title} movie tickets showtimes`)}`;
    
    if (platform === 'bms') {
      url = `https://in.bookmyshow.com/search?searchterm=${encodeURIComponent(title)}`;
    } else if (platform === 'district') {
      url = `https://district.in/search?q=${encodeURIComponent(title)}`;
    } else if (platform === 'paytm') {
      url = `https://paytm.com/movies/search?q=${encodeURIComponent(title)}`;
    }
    
    window.open(url, '_blank');
  };
  
  const handleWhereToWatch = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    const movie = data?.movies.find(m => m.title === title);
    if (movie) setSelectedMovie(movie);
    else window.open(`https://www.google.com/search?q=${encodeURIComponent(`where to watch ${title} movie online`)}`, '_blank');
  };

  const handleWatchTrailer = async (e: React.MouseEvent, movie: BoxOfficeMovie) => {
    e.stopPropagation();
    if (selectedMovie?.title !== movie.title) setSelectedMovie(movie);
    setLoadingTrailer(true);
    setTrailerId(null);
    try {
       const id = await getMovieTrailer(movie.title);
       setTrailerId(id);
    } catch {
       console.error("Failed trailer");
    } finally {
       setLoadingTrailer(false);
    }
  };

  const colors = ['#E50914', '#FFC107', '#00BCD4', '#9C27B0', '#4CAF50'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-primary">Box Office Insider</h2>
        <p className="text-slate-400 mt-2">Live trends, weekly collections, and verdicts</p>
      </div>

      {loading && <Spinner />}
      {error && <Card className="p-8 text-center border-red-500/50"><p className="text-red-400 mb-4">{error}</p><Button onClick={() => setKey(k => k + 1)}>Retry</Button></Card>}

      {data && !loading && (
        <>
          <Card className="p-6 border-l-4 border-l-brand-secondary">
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Market Pulse</h3>
            <p className="text-slate-300 leading-relaxed">{data.marketSummary}</p>
          </Card>

          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-brand-accent mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Top Grossers
            </h3>
            <BarChart height={200} data={data.movies.sort((a, b) => b.totalCollection - a.totalCollection).slice(0, 5).map((m, i) => ({ label: m.title, value: m.totalCollection, color: colors[i % colors.length] }))} />
            <p className="text-xs text-center text-slate-500 mt-4">* Figures in Crores (INR)</p>
          </Card>

          <div className="flex flex-col gap-4 px-2">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white hidden md:block">Movie Breakdown</h3>
                <div className="flex items-center space-x-2 ml-auto">
                    <button onClick={() => setSortBy('collection')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all ${sortBy === 'collection' ? 'bg-brand-primary text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Highest Grossing</button>
                    <button onClick={() => setSortBy('date')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all ${sortBy === 'date' ? 'bg-brand-primary text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Newest First</button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedMovies.map((movie, index) => (
              <Card key={movie.title} className="flex flex-col md:flex-row cursor-pointer hover:ring-2 hover:ring-brand-accent transition-all transform hover:-translate-y-1 overflow-hidden" onClick={() => setSelectedMovie(movie)}>
                <div className="w-full md:w-32 h-48 md:h-auto md:flex-shrink-0 relative bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700">
                  <MoviePoster url={movie.posterUrl || generatedPosters[movie.title]} title={movie.title} className="w-full h-full" />
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-2">
                        <h4 className="text-xl font-bold text-white line-clamp-1">{movie.title}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${movie.verdict.toLowerCase().includes('flop') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>{movie.verdict}</span>
                      </div>
                      <div className="text-right flex-shrink-0"><span className="block text-xl font-bold text-brand-primary">₹{movie.totalCollection}</span><span className="text-[10px] text-slate-400">Cr</span></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                    <Button onClick={(e) => handleWatchTrailer(e, movie)} className="flex-1 text-[10px] py-2 px-2 h-auto bg-slate-700 hover:bg-red-600 transition-colors">Trailer</Button>
                    <Button onClick={(e) => { e.stopPropagation(); setSelectedMovie(movie); }} className="flex-1 text-[10px] py-2 px-2 h-auto">Tickets</Button>
                    <Button onClick={(e) => handleWhereToWatch(e, movie.title)} className="flex-1 text-[10px] py-2 px-2 h-auto bg-sky-600 hover:bg-sky-700">Watch Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedMovie && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedMovie(null)}>
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row">
                   <div className="w-full md:w-1/3 bg-black h-64 md:h-auto border-b md:border-b-0 md:border-r border-slate-700">
                      <MoviePoster url={selectedMovie.posterUrl || generatedPosters[selectedMovie.title]} title={selectedMovie.title} className="w-full h-full" />
                   </div>
                  <div className="p-6 md:p-8 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-3xl font-bold text-white">{selectedMovie.title}</h2>
                      <button onClick={() => setSelectedMovie(null)} className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Collection</span>
                        <span className="text-2xl font-bold text-brand-primary">₹{selectedMovie.totalCollection} Cr</span>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Verdict</span>
                        <span className="text-xl font-bold text-brand-secondary">{selectedMovie.verdict}</span>
                      </div>
                    </div>

                    {/* Ticketing Options Section */}
                    <div className="mb-6">
                       <h3 className="text-lg font-bold text-brand-secondary mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                          Book Tickets
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button 
                            onClick={(e) => handleBookTickets(e, selectedMovie.title, 'bms')}
                            className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 px-4 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-md"
                          >
                             <span className="text-[10px] uppercase opacity-60">BookMyShow</span>
                             <span className="text-sm">BMS</span>
                          </button>
                          <button 
                            onClick={(e) => handleBookTickets(e, selectedMovie.title, 'district')}
                            className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-md border border-slate-700"
                          >
                             <span className="text-[10px] uppercase opacity-60">Zomato</span>
                             <span className="text-sm">District</span>
                          </button>
                          <button 
                            onClick={(e) => handleBookTickets(e, selectedMovie.title, 'paytm')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-md"
                          >
                             <span className="text-[10px] uppercase opacity-60">Paytm</span>
                             <span className="text-sm">Movies</span>
                          </button>
                       </div>
                    </div>

                    {/* Integrated "Where to Watch" Section */}
                    <div className="mb-6">
                       <h3 className="text-lg font-bold text-sky-400 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          Streaming Availability
                       </h3>
                       <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                          {loadingStreaming ? (
                            <div className="flex items-center justify-center py-4"><div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-sm text-slate-400">Finding platforms...</span></div>
                          ) : streamingInfo.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                               {streamingInfo.map((p, i) => (
                                 <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="bg-sky-900/30 hover:bg-sky-800/50 border border-sky-700/50 text-sky-200 px-3 py-1.5 rounded-lg text-sm flex items-center transition-all hover:scale-105">
                                   <span className="mr-1">▶</span> {p.platform}
                                 </a>
                               ))}
                            </div>
                          ) : (
                            <div className="text-center py-2">
                               <p className="text-sm text-slate-400 mb-2">No streaming platforms detected.</p>
                               <Button onClick={(e) => window.open(`https://www.google.com/search?q=${encodeURIComponent(`where to watch ${selectedMovie.title} movie online`)}`, '_blank')} className="text-[10px] py-1 bg-slate-700">Search on Google</Button>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                       <Button onClick={(e) => handleWatchTrailer(e, selectedMovie)} className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
                          Watch Trailer
                       </Button>
                       <Button onClick={(e) => handleBookTickets(e, selectedMovie.title)} className="flex-1">Search More Tickets</Button>
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
