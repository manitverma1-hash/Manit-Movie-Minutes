
import React, { useState, useEffect } from 'react';
import { getFamousQuotes } from '../services/geminiService';
import type { Quote, Language } from '../types';
import Spinner from './shared/Spinner';
import Card from './shared/Card';
import Button from './shared/Button';

interface QuotesProps {
  language: Language;
}

const Quotes: React.FC<QuotesProps> = ({ language }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await getFamousQuotes(language);
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [language]);

  // Vibrant gradients for infographic cards
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-orange-500',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Iconic <span className="text-brand-secondary">Dialogues</span></h2>
           <p className="text-slate-400">Timeless words from the legends of Bollywood.</p>
        </div>
        <Button onClick={loadQuotes} className="text-sm">Shuffle Quotes</Button>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {quotes.map((quote, idx) => (
            <div 
              key={idx} 
              className={`break-inside-avoid rounded-xl p-8 shadow-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} transform hover:-translate-y-2 transition-transform duration-300 text-white relative overflow-hidden group`}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black opacity-10"></div>
              
              <div className="relative z-10">
                <span className="text-6xl font-serif opacity-30 absolute -top-4 -left-2 leading-none">“</span>
                
                <p className="text-2xl font-bold leading-tight mb-6 font-serif relative pt-4 text-shadow-sm">
                  {quote.text}
                </p>
                
                <div className="border-t border-white/30 pt-4 flex flex-col items-end">
                   <span className="text-lg font-bold uppercase tracking-wide">{quote.actor}</span>
                   <span className="text-sm opacity-90 italic">in {quote.movie}</span>
                </div>
                
                <div className="mt-4 text-xs bg-black/20 p-2 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-bold">Context:</span> {quote.context}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotes;
