
import React, { useState } from 'react';
import { getFashionTips } from '../services/geminiService';
import type { FashionStyle, Language } from '../types';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

interface FashionProps {
  language: Language;
}

const Fashion: React.FC<FashionProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [styleData, setStyleData] = useState<FashionStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const q = override || query;
    if (!q) return;

    setLoading(true);
    setError(null);
    setStyleData(null);

    try {
      const result = await getFashionTips(q, language);
      if (result) {
        setStyleData(result);
      } else {
        setError("Could not find fashion details for that request.");
      }
    } catch (err) {
      setError("Failed to decode style. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-2 font-serif italic">Star <span className="text-brand-primary not-italic font-sans">Style</span></h2>
        <p className="text-slate-400">Decode iconic looks and get tips to recreate them.</p>
      </div>

      <Card className="p-8 mb-10 bg-gradient-to-br from-slate-800 to-slate-900 border-none shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
           <Input 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="e.g. Deepika Padukone Cannes Look, Alia Bhatt Wedding..."
             className="flex-grow bg-slate-900/50 border-slate-600 focus:border-brand-primary"
           />
           <Button type="submit" disabled={loading} className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-700">
             {loading ? 'Decoding...' : 'Decode Look'}
           </Button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
           <span className="text-xs text-slate-500 py-1">Try:</span>
           {['Ranveer Singh Red Carpet', 'Kareena Kapoor Airport Look', 'Shah Rukh Khan Casual'].map(item => (
              <button key={item} onClick={() => { setQuery(item); handleSearch(undefined, item); }} className="text-xs text-brand-accent hover:underline">
                 {item}
              </button>
           ))}
        </div>
      </Card>

      {error && <p className="text-center text-red-400 mb-8">{error}</p>}
      {loading && <Spinner />}

      {styleData && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Left Column: Description & Elements */}
              <div className="space-y-6">
                 <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{styleData.celebrity}</h3>
                    <p className="text-xl text-brand-primary italic font-serif">{styleData.lookName}</p>
                 </div>
                 
                 <Card className="p-6 bg-slate-800/80">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">The Vibe</h4>
                    <p className="text-slate-200 leading-relaxed">{styleData.description}</p>
                 </Card>

                 <Card className="p-6">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Key Elements</h4>
                    <ul className="space-y-2">
                       {styleData.elements.map((el, i) => (
                          <li key={i} className="flex items-center text-slate-300">
                             <span className="w-2 h-2 bg-brand-accent rounded-full mr-3"></span>
                             {el}
                          </li>
                       ))}
                    </ul>
                 </Card>
              </div>

              {/* Right Column: Style Guide & Shop Section */}
              <div className="space-y-6">
                  {/* Style Guide */}
                  <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-brand-primary rounded-xl transform rotate-1 opacity-10 blur-md"></div>
                      <Card className="relative border-none bg-slate-900 p-8 flex flex-col">
                         <div className="mb-6 text-center">
                            <span className="inline-block p-3 rounded-full bg-slate-800 mb-4">
                               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                            </span>
                            <h3 className="text-2xl font-bold text-white">Style Guide</h3>
                            <p className="text-sm text-slate-400 mt-1">How to recreate this look</p>
                         </div>

                         <div className="space-y-4 flex-grow">
                            {styleData.tips.map((tip, i) => (
                               <div key={i} className="flex gap-4">
                                  <span className="text-4xl font-serif text-slate-700 font-bold leading-none">{i + 1}</span>
                                  <p className="text-slate-300 text-sm mt-1">{tip}</p>
                               </div>
                            ))}
                         </div>
                      </Card>
                  </div>

                  {/* Shop Section */}
                  <Card className="p-6 border-emerald-500/30 bg-slate-800/50">
                     <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Shop the Look
                     </h3>
                     
                     {styleData.shoppingLinks && styleData.shoppingLinks.length > 0 ? (
                        <div className="space-y-3">
                           {styleData.shoppingLinks.map((link, i) => (
                              <a 
                                 key={i} 
                                 href={link.url} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-emerald-600/20 border border-slate-600 hover:border-emerald-500/50 transition-all group"
                              >
                                 <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase tracking-tighter">Available at</span>
                                    <span className="text-white font-bold">{link.storeName}</span>
                                 </div>
                                 <span className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest group-hover:scale-105 transition-transform shadow-lg">Buy Now</span>
                              </a>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-4">
                           <p className="text-slate-400 text-sm mb-4">No specific store links found for this premium look.</p>
                           <Button 
                              onClick={() => window.open(`https://www.google.com/search?q=buy+similar+to+${encodeURIComponent(styleData.celebrity + " " + styleData.lookName + " outfit")}`, '_blank')}
                              variant="secondary"
                              className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-700"
                           >
                              Search for Similar on Google Shopping
                           </Button>
                        </div>
                     )}
                     
                     <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                        <a 
                           href={`https://www.google.com/search?q=${encodeURIComponent(styleData.celebrity + " " + styleData.lookName + " fashion photos")}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center text-sm font-bold text-brand-primary hover:text-white transition-colors"
                        >
                           View Photos & Credits
                           <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                           </svg>
                        </a>
                     </div>
                  </Card>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Fashion;
