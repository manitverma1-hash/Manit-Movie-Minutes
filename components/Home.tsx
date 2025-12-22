
import React, { useState } from 'react';
import { Feature } from '../types';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (feature: Feature) => void;
  onOpenAbout: () => void;
}

const features: { id: Feature; label: string; icon: string; color: string }[] = [
  { id: 'News', label: 'News', icon: '📰', color: 'bg-blue-600' },
  { id: 'Releases', label: 'Releases', icon: '🗓️', color: 'bg-green-600' },
  { id: 'Reviews', label: 'Reviews', icon: '⭐', color: 'bg-yellow-600' },
  { id: 'Music', label: 'Music', icon: '🎵', color: 'bg-pink-600' },
  { id: 'Fashion', label: 'Fashion', icon: '👗', color: 'bg-purple-600' },
  { id: 'Dialogues', label: 'Dialogues', icon: '💬', color: 'bg-teal-600' },
  { id: 'Quiz', label: 'Quiz', icon: '❓', color: 'bg-indigo-600' },
  { id: 'Games', label: 'Games', icon: '🎮', color: 'bg-red-600' },
  { id: 'Interviews', label: 'Interviews', icon: '🎙️', color: 'bg-orange-600' },
  { id: 'Box Office', label: 'Box Office', icon: '📈', color: 'bg-emerald-600' },
  { id: 'Archive', label: 'Archive', icon: '🗄️', color: 'bg-slate-600' },
  { id: 'Bio', label: 'Bio', icon: '👤', color: 'bg-cyan-600' },
  { id: 'ManitSays', label: 'Manit Says', icon: '📢', color: 'bg-rose-600' },
];

const DEFAULT_COVER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

const Home: React.FC<HomeProps> = ({ searchQuery, setSearchQuery, onNavigate, onOpenAbout }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('Search');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] animate-fade-in relative overflow-x-hidden w-full pb-10">
      
      {/* Masthead Section */}
      <div 
        className="w-full relative bg-white mb-12 shadow-2xl h-[450px]"
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
           <img src={DEFAULT_COVER} alt="Cover" className="w-full h-full object-cover object-center" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/50 opacity-90 pointer-events-none"></div>
        </div>

        {/* --- BRAND TITLE & TAGLINE --- */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-4 select-none">
            <div className="text-center mb-0 animate-slide-up">
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                    <span className="text-brand-secondary">Manit</span>
                    <span className="text-brand-primary mx-2">Movie</span>
                    <span className="text-brand-secondary">Minutes</span>
                </h1>
            </div>
            
            <div className="text-center animate-slide-up mt-2 md:mt-4">
                <p className="text-2xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] tracking-tight leading-tight">
                    Your AI-Powered Bollywood Companion
                </p>
            </div>
        </div>

        {/* Decorative Bottom Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
             <svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                 <path d="M985.66,92.83C906.67,72,823.78,31,432.84,2c-47.35-3.53-105.7,1.69-243.2,76.51C122.92,111,18.36,104.9,0,94.27V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-900"></path>
                 <path d="M0,0V46.29c47,39.22,106.52,60.12,163.52,48.83,57-11.3,103.14-53.59,150.36-96.22C389.26-17.65,463,3.74,510.63,16.29c47.65,12.55,83.84,17.43,121.21,6.56,37.37-10.87,68.4-38.33,99.31-64.86,30.9-26.53,62-53.59,99.31-64.86,30.9-26.53,62-52.28,95.34-60.75,33.37-8.47,70.52,2.83,106.88,27,36.36,24.13,70.36,60.9,112.55,73.57,42.19,12.67,88.46,1.25,134.12-25.56V0Z" className="fill-slate-900 opacity-50"></path>
             </svg>
        </div>
      </div>

      {/* Search Section */}
      <div className="w-full max-w-5xl px-4 flex flex-col items-center mb-12 animate-slide-up">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={`w-full max-w-2xl transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
            <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10">
                <button type="submit" className="pl-6 text-brand-primary hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search movies, actors, or songs..."
                    className="w-full bg-transparent text-white border-none focus:ring-0 py-4 px-4 text-lg placeholder-slate-400 rounded-full"
                />
            </div>
            </div>
        </form>
      </div>

      {/* Category Grid */}
      <div className="w-full max-w-6xl px-4 z-20 mb-16">
        <div className="flex items-center justify-center mb-8">
           <div className="h-px bg-brand-primary/30 w-16 mr-4"></div>
           <p className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent text-sm uppercase tracking-[0.2em] font-bold">Explore Features</p>
           <div className="h-px bg-brand-primary/30 w-16 ml-4"></div>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
           {features.map((feature) => (
             <button
               key={feature.id}
               onClick={() => onNavigate(feature.id)}
               className="group flex flex-col items-center p-4 rounded-2xl transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-2 active:scale-95 border border-transparent hover:border-slate-700/50"
             >
                <div className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl ${feature.color} flex items-center justify-center text-4xl md:text-5xl shadow-xl mb-4 group-hover:shadow-brand-accent/30 transition-all duration-300 transform group-hover:rotate-3`}>
                   {feature.icon}
                </div>
                <span className="text-sm md:text-base font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">{feature.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* PWA Install Hint */}
      <div className="mt-8 text-center opacity-70 text-[10px] uppercase tracking-widest text-brand-primary mb-8 font-bold">
         <p>Install App for the best experience</p>
      </div>
    </div>
  );
};

export default Home;
