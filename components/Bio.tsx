
import React, { useState, useEffect } from 'react';
import { getCelebrityBio } from '../services/geminiService';
import type { CelebrityBio, Language } from '../types';
import Button from './shared/Button';
import Card from './shared/Card';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

interface BioProps {
    language: Language;
}

const bioSuggestions = ["Amitabh Bachchan", "Kareena Kapoor", "Salman Khan", "Hrithik Roshan", "Aishwarya Rai"];

const SectionCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode; colorClass: string }> = ({ title, items, icon, colorClass }) => (
  <Card className="h-full hover:scale-[1.02] transition-transform duration-300">
    <div className={`p-4 border-b border-slate-700/50 flex items-center ${colorClass} bg-opacity-10`}>
      <div className={`p-2 rounded-full mr-3 ${colorClass} bg-opacity-20 text-white`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-6">
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-slate-300 text-sm leading-relaxed">
            <span className={`mr-2 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass}`}></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </Card>
);

const Bio: React.FC<BioProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [bioData, setBioData] = useState<CelebrityBio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, nameOverride?: string) => {
    if (e) e.preventDefault();
    const name = nameOverride || query;
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setBioData(null);

    try {
      const data = await getCelebrityBio(name, language);
      setBioData(data);
    } catch (err) {
      setError("Failed to load biography. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Star <span className="text-brand-primary">Bios</span></h2>
        <p className="text-slate-400">Discover the untold stories of your favorite stars.</p>
      </div>

      <Card className="p-6 mb-10 max-w-2xl mx-auto border-brand-primary/30 shadow-brand-primary/10">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search Celebrity (e.g., Deepika Padukone)..."
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Get Bio'}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-slate-500 py-1">Trending:</span>
            {bioSuggestions.map(name => (
                <button 
                  key={name} 
                  onClick={() => { setQuery(name); handleSearch(undefined, name); }} 
                  className="text-xs bg-slate-700/50 hover:bg-brand-secondary hover:text-slate-900 text-slate-300 px-3 py-1 rounded-full transition-all"
                >
                    {name}
                </button>
            ))}
        </div>
      </Card>

      {loading && <Spinner />}
      
      {error && (
        <div className="text-center p-8 bg-red-500/10 rounded-lg max-w-lg mx-auto">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {bioData && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             
             {/* Initials Avatar since we might not have a direct image URL */}
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1 shadow-lg flex-shrink-0 z-10">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                   <span className="text-4xl md:text-5xl font-bold text-white">{bioData.name.charAt(0)}</span>
                </div>
             </div>

             <div className="text-center md:text-left z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{bioData.name}</h1>
                <p className="text-lg text-brand-accent italic mb-4">The Story So Far</p>
                <p className="text-slate-300 leading-relaxed max-w-2xl">{bioData.summary}</p>
             </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            
            {/* Early Life */}
            <SectionCard 
              title="Early Life" 
              items={bioData.earlyLife}
              colorClass="bg-blue-500"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
            />

            {/* Career - Spans 2 cols on large screens if needed, or just regular */}
            <SectionCard 
              title="Career Highlights" 
              items={bioData.career}
              colorClass="bg-purple-500"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              } 
            />

            {/* Family */}
            <SectionCard 
              title="Family & Friends" 
              items={bioData.family}
              colorClass="bg-green-500"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              } 
            />

            {/* Awards */}
            <SectionCard 
              title="Awards & Honors" 
              items={bioData.awards}
              colorClass="bg-yellow-500"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              } 
            />

            {/* Lifestyle */}
            <SectionCard 
              title="Lifestyle & Assets" 
              items={bioData.lifestyle}
              colorClass="bg-pink-500"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              } 
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default Bio;
