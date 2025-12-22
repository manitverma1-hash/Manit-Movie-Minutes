
import React, { useState, useEffect } from 'react';
import { getFamousQuotes } from '../services/geminiService';
import type { Quote, Language } from '../types';
import Spinner from './shared/Spinner';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';

interface QuotesProps {
  language: Language;
}

interface InteractiveQuote extends Quote {
  id: string;
  likes: number;
  comments: { author: string; text: string }[];
  showComments: boolean;
}

const DECADES = ['All Time', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const SUGGESTED_COMMENTS = [
  "Seeti Maar Performance! 😙",
  "Bas kar pagle, rulayega kya? 😂",
  "Pure Goosebumps! 🧊",
  "Dialogue of the century! 🏆",
  "Mogambo Khush Hua! 😈",
  "Ek number boss! 👌",
  "City bajao! 📢",
  "Iconic! 🔥"
];

const Quotes: React.FC<QuotesProps> = ({ language }) => {
  const [activeDecade, setActiveDecade] = useState('All Time');
  const [quotes, setQuotes] = useState<InteractiveQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await getFamousQuotes(language, activeDecade);
      // Transform to interactive quotes
      const interactiveData = data.map((q, i) => ({
        ...q,
        id: `${activeDecade}-${i}-${Date.now()}`,
        likes: Math.floor(Math.random() * 500) + 50, // Mock initial likes
        comments: [],
        showComments: false
      }));
      setQuotes(interactiveData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [language, activeDecade]);

  const handleLike = (id: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, likes: q.likes + 1 };
      }
      return q;
    }));
  };

  const handleToggleComments = (id: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, showComments: !q.showComments };
      }
      return q;
    }));
  };

  const handleShare = async (quote: InteractiveQuote) => {
     const text = `"${quote.text}" - ${quote.actor} in ${quote.movie}`;
     if (navigator.share) {
        try {
           await navigator.share({ title: 'Bollywood Dialogue', text: text });
        } catch (e) { console.debug(e); }
     } else {
        await navigator.clipboard.writeText(text);
        alert('Dialogue copied to clipboard!');
     }
  };

  const handleAddComment = (id: string, text: string) => {
     if (!text.trim()) return;
     setQuotes(prev => prev.map(q => {
        if (q.id === id) {
           return { 
              ...q, 
              comments: [...q.comments, { author: 'You', text: text }] 
           };
        }
        return q;
     }));
     setCommentInputs(prev => ({ ...prev, [id]: '' }));
  };

  const handleInputChange = (id: string, value: string) => {
     setCommentInputs(prev => ({ ...prev, [id]: value }));
  };

  // Vibrant gradients for infographic cards
  const gradients = [
    'from-pink-600 to-rose-600',
    'from-purple-600 to-indigo-600',
    'from-blue-600 to-cyan-600',
    'from-teal-600 to-emerald-600',
    'from-orange-600 to-amber-600',
    'from-red-600 to-orange-600',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Iconic <span className="text-brand-secondary">Dialogues</span></h2>
        <p className="text-slate-400 mb-6">Timeless words from the legends of Bollywood in their original glory.</p>
        
        {/* Decade Selector */}
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
           {DECADES.map(decade => (
              <button
                 key={decade}
                 onClick={() => setActiveDecade(decade)}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeDecade === decade 
                    ? 'bg-brand-primary text-white shadow-lg scale-105' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                 }`}
              >
                 {decade}
              </button>
           ))}
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {quotes.map((quote, idx) => (
            <div 
              key={quote.id} 
              className={`break-inside-avoid rounded-xl shadow-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} text-white relative overflow-hidden group mb-6 flex flex-col`}
            >
              {/* Card Content */}
              <div className="p-8 pb-4 relative z-10">
                <span className="text-6xl font-serif opacity-30 absolute -top-4 -left-2 leading-none">“</span>
                
                <p className="text-2xl font-bold leading-tight mb-6 font-serif relative pt-4 text-shadow-sm min-h-[4rem]">
                  {quote.text}
                </p>
                
                <div className="border-t border-white/30 pt-4 flex flex-col items-end">
                   <span className="text-lg font-bold uppercase tracking-wide">{quote.actor}</span>
                   <span className="text-sm opacity-90 italic">in {quote.movie}</span>
                </div>
                
                <div className="mt-4 text-xs bg-black/20 p-2 rounded backdrop-blur-sm">
                  <span className="font-bold opacity-70">Context:</span> {quote.context}
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-black/20 p-3 flex items-center justify-between backdrop-blur-md mt-auto">
                 <div className="flex items-center gap-4">
                    <button onClick={() => handleLike(quote.id)} className="flex items-center gap-1 group/btn hover:text-pink-300 transition-colors">
                       <svg className={`w-5 h-5 ${quote.likes > 0 ? 'fill-current text-pink-500' : 'text-white'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                       <span className="text-xs font-bold">{quote.likes}</span>
                    </button>
                    
                    <button onClick={() => handleToggleComments(quote.id)} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                       <span className="text-xs font-bold">{quote.comments.length}</span>
                    </button>
                 </div>

                 <button onClick={() => handleShare(quote)} className="hover:text-green-300 transition-colors p-1 rounded-full hover:bg-white/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                 </button>
              </div>

              {/* Comments Section */}
              {quote.showComments && (
                 <div className="bg-slate-900 p-4 animate-in slide-in-from-top-2 duration-300 border-t border-white/10">
                    <div className="space-y-3 mb-4 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                       {quote.comments.length > 0 ? (
                          quote.comments.map((c, i) => (
                             <div key={i} className="text-xs bg-white/5 p-2 rounded">
                                <span className="font-bold text-brand-secondary">{c.author}: </span>
                                <span className="text-slate-300">{c.text}</span>
                             </div>
                          ))
                       ) : (
                          <p className="text-xs text-slate-500 text-center italic">No comments yet. Be the first!</p>
                       )}
                    </div>

                    <div className="space-y-2">
                       {/* Suggestions */}
                       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {SUGGESTED_COMMENTS.map((sug, i) => (
                             <button 
                                key={i}
                                onClick={() => handleInputChange(quote.id, sug)}
                                className="text-[10px] whitespace-nowrap bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-2 py-1 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                             >
                                {sug}
                             </button>
                          ))}
                       </div>

                       <div className="flex gap-2">
                          <Input 
                             value={commentInputs[quote.id] || ''}
                             onChange={(e) => handleInputChange(quote.id, e.target.value)}
                             placeholder="Add a comment..."
                             className="text-xs py-1 h-8 bg-slate-800 border-slate-700"
                          />
                          <Button 
                             onClick={() => handleAddComment(quote.id, commentInputs[quote.id] || '')}
                             className="text-xs py-1 px-3 h-8 bg-brand-primary"
                          >
                             Post
                          </Button>
                       </div>
                    </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!loading && (
         <div className="text-center mt-8">
            <Button onClick={loadQuotes} variant="secondary">Load More from {activeDecade}</Button>
         </div>
      )}
    </div>
  );
};

export default Quotes;
