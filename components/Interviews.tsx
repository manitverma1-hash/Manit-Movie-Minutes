
import React, { useState, useEffect } from 'react';
import { getCelebrityInterviews } from '../services/geminiService';
import type { CelebrityInterview, Language } from '../types';
import Button from './shared/Button';
import Card from './shared/Card';
import Input from './shared/Input';
import Spinner from './shared/Spinner';

const celebritySuggestions = ["Shah Rukh Khan", "Priyanka Chopra", "Ranveer Singh", "Deepika Padukone", "Alia Bhatt"];

interface InterviewsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
}

const Interviews: React.FC<InterviewsProps> = ({ searchQuery, setSearchQuery, language }) => {
  const [celebrity, setCelebrity] = useState('');
  const [interviews, setInterviews] = useState<CelebrityInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (searchQuery) {
      setCelebrity(searchQuery);
      setSearchQuery(''); // Clear global search after using it
    }
  }, [searchQuery, setSearchQuery]);


  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, celebName?: string) => {
    if(e) e.preventDefault();
    const celeb = celebName || celebrity;
    if (!celeb) return;
    
    setLoading(true);
    setError(null);
    setInterviews([]);
    try {
      const result = await getCelebrityInterviews(celeb, language);
      setInterviews(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-brand-primary">Celebrity Interviews</h2>
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="celebrity" className="block text-lg font-semibold mb-2 text-brand-accent">
            Enter Celebrity Name to Find Interviews
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="celebrity"
              value={celebrity}
              onChange={(e) => setCelebrity(e.target.value)}
              placeholder="e.g., Shah Rukh Khan"
            />
            <Button type="submit" disabled={loading || !celebrity}>
              {loading ? 'Searching...' : 'Find Interviews'}
            </Button>
          </div>
        </form>
         <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 mr-2">Try:</span>
            {celebritySuggestions.map(name => (
                <button key={name} onClick={() => {setCelebrity(name); handleSubmit(undefined, name)}} className="bg-slate-700 text-xs px-3 py-1 rounded-full hover:bg-brand-primary transition-colors">
                    {name}
                </button>
            ))}
        </div>
      </Card>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-400">{error}</p>}

      {interviews.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-brand-secondary mb-4">Recent Interviews with {celebrity}</h3>
          <div className="space-y-6">
            {interviews.map((interview, index) => (
              <Card key={index}>
                <div className="p-6">
                  <a href={interview.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xl font-bold text-brand-secondary mb-2 hover:text-brand-secondary/80 transition-colors">
                    {interview.title}
                  </a>
                  <p className="text-slate-300 mb-4">{interview.summary}</p>
                  <a 
                    href={interview.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-brand-accent hover:underline text-sm font-semibold"
                  >
                    Source: {interview.sourceName}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
