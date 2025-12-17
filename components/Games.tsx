
import React, { useState, useEffect, useCallback } from 'react';
import { getGameClue } from '../services/geminiService';
import type { Language } from '../types';
import Button from './shared/Button';
import Card from './shared/Card';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

interface GamesProps {
    language: Language;
}

const Games: React.FC<GamesProps> = ({ language }) => {
  const [clue, setClue] = useState('');
  const [answer, setAnswer] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewClue = useCallback(async () => {
    setLoading(true);
    setError(null);
    setClue('');
    setAnswer('');
    setGuess('');
    setResult(null);
    setShowAnswer(false);
    try {
      const { clue, answer } = await getGameClue(language);
      setClue(clue);
      setAnswer(answer);
    } catch (err) {
      setError('Failed to load a new game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchNewClue();
  }, [fetchNewClue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess) return;
    if (guess.toLowerCase().trim() === answer.toLowerCase().trim()) {
      setResult('correct');
      setShowAnswer(true);
    } else {
      setResult('incorrect');
      setShowAnswer(true);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-brand-accent font-bold tracking-widest uppercase text-sm">Bollywood Trivia</span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-2 drop-shadow-lg">
          Guess the <span className="text-brand-primary">Movie</span>
        </h2>
        <p className="text-slate-400 mt-3">Can you identify the blockbuster from a single line?</p>
      </div>

      <div className="relative">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-secondary/20 rounded-full blur-3xl"></div>

        <Card className="relative z-10 p-1 border-2 border-slate-700/50 bg-slate-800/80 backdrop-blur-sm">
          {loading && (
             <div className="py-20">
               <Spinner />
               <p className="text-center text-slate-400 animate-pulse mt-4">Rolling the camera...</p>
             </div>
          )}
          
          {error && (
            <div className="py-12 text-center">
              <div className="inline-block p-4 bg-red-500/10 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-300 font-medium">{error}</p>
              <Button onClick={fetchNewClue} className="mt-4">Try Again</Button>
            </div>
          )}

          {clue && !loading && (
            <div className="flex flex-col h-full">
              {/* Clue Section */}
              <div className="bg-slate-900/80 p-8 md:p-10 rounded-t-lg text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary opacity-50"></div>
                 
                 <div className="mb-4 flex justify-center">
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
                      🎬 Mystery Logline
                    </span>
                 </div>

                 <blockquote className="relative">
                    <span className="absolute top-0 left-0 text-6xl text-brand-primary/20 font-serif transform -translate-x-4 -translate-y-4">“</span>
                    <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed font-serif italic relative z-10 px-6">
                      {clue}
                    </p>
                    <span className="absolute bottom-0 right-0 text-6xl text-brand-primary/20 font-serif transform translate-x-4 translate-y-4">”</span>
                 </blockquote>
              </div>

              {/* Interaction Section */}
              <div className="p-8 bg-slate-800 rounded-b-lg flex flex-col items-center">
                {!showAnswer ? (
                    <form onSubmit={handleSubmit} className="w-full max-w-lg">
                       <div className="relative group">
                          <Input
                              value={guess}
                              onChange={(e) => setGuess(e.target.value)}
                              placeholder="Type the movie title..."
                              className="w-full h-14 pl-6 pr-32 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-brand-accent focus:ring-0 text-lg shadow-inner transition-all"
                              autoFocus
                          />
                          <div className="absolute right-2 top-2 bottom-2">
                             <Button 
                                type="submit" 
                                disabled={!guess} 
                                className="h-full px-6 rounded-lg text-sm uppercase tracking-wide font-bold"
                             >
                                Guess
                             </Button>
                          </div>
                       </div>
                    </form>
                ) : (
                  <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {result === 'correct' ? (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-green-500/5 pattern-dots"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 shadow-lg shadow-green-500/30">
                              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">Blockbuster Hit!</h3>
                            <p className="text-green-200">You guessed it right.</p>
                            <div className="mt-4 py-2 px-4 bg-slate-900/50 rounded-lg inline-block border border-green-500/20">
                              <span className="text-slate-400 text-sm mr-2">Answer:</span>
                              <span className="text-xl font-bold text-white">{answer}</span>
                            </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center relative overflow-hidden">
                         <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4 shadow-lg shadow-red-500/30">
                              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">Box Office Flop!</h3>
                            <p className="text-red-200">That wasn't the one.</p>
                            <div className="mt-4 py-2 px-4 bg-slate-900/50 rounded-lg inline-block border border-red-500/20">
                              <span className="text-slate-400 text-sm mr-2">Correct Answer:</span>
                              <span className="text-xl font-bold text-white">{answer}</span>
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Controls */}
                <div className="mt-8 flex items-center justify-center space-x-4 w-full border-t border-slate-700/50 pt-6">
                  <Button 
                    onClick={fetchNewClue} 
                    variant="primary"
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    New Game
                  </Button>
                  
                  {!showAnswer && (
                    <Button 
                      onClick={() => {setResult('incorrect'); setShowAnswer(true);}} 
                      variant="secondary"
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      Give Up & Reveal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Games;
