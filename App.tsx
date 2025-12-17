
import React, { useState } from 'react';
import { Feature, Language } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Quiz from './components/Quiz';
import News from './components/News';
import Interviews from './components/Interviews';
import Reviews from './components/Reviews';
import Games from './components/Games';
import BoxOffice from './components/BoxOffice';
import Bio from './components/Bio';
import Music from './components/Music';
import Releases from './components/Releases';
import Fashion from './components/Fashion';
import Quotes from './components/Quotes';
import ManitSays from './components/ManitSays';
import Modal from './components/shared/Modal';
import Button from './components/shared/Button';
import Input from './components/shared/Input';

const App: React.FC = () => {
  // If activeFeature is null, we show Home. Otherwise we show the feature.
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('English');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<'signup' | 'about' | 'privacy' | 'contact' | 'disclaimer' | null>(null);

  const handleNavigate = (feature: Feature) => {
    setActiveFeature(feature);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveFeature(null);
    setSearchQuery(''); 
  };

  const closeModal = () => setActiveModal(null);

  const renderFeature = () => {
    const props = { searchQuery, setSearchQuery, language };
    
    const content = (() => {
      switch (activeFeature) {
        case 'Quiz': return <Quiz language={language} />;
        case 'News': return <News {...props} />;
        case 'Interviews': return <Interviews {...props} />;
        case 'Reviews': return <Reviews {...props} />;
        case 'Games': return <Games language={language} />;
        case 'Box Office': return <BoxOffice language={language} />;
        case 'Bio': return <Bio language={language} />;
        case 'Music': return <Music {...props} />;
        case 'Releases': return <Releases language={language} />;
        case 'Fashion': return <Fashion language={language} />;
        case 'Quotes': return <Quotes language={language} />;
        case 'ManitSays': return <ManitSays language={language} />;
        default: return null;
      }
    })();

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar 
          activeFeature={activeFeature!} 
          onBack={handleBack} 
          language={language} 
          setLanguage={setLanguage} 
          onSignUp={() => setActiveModal('signup')}
        />
        <main className="container mx-auto px-4 py-6 flex-grow animate-slide-up">
          {content}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white selection:bg-brand-primary selection:text-white flex flex-col">
      {activeFeature ? (
        renderFeature()
      ) : (
        <Home 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onNavigate={handleNavigate} 
          onSignUp={() => setActiveModal('signup')}
          onOpenAbout={() => setActiveModal('about')}
        />
      )}
      
      {/* Enhanced Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-10 pb-6 mt-auto">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
              <div className="md:col-span-1">
                 <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <span className="text-2xl">🎬</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Manit Movie Minutes</span>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    Your daily dose of Bollywood masala, AI-powered insights, and entertainment news.
                 </p>
              </div>

              <div className="md:col-span-1">
                 <h4 className="text-white font-bold mb-4">About</h4>
                 <ul className="space-y-2 text-sm text-slate-400">
                    <li><button onClick={() => setActiveModal('about')} className="hover:text-brand-primary transition-colors">About MMM</button></li>
                    <li><button onClick={() => setActiveModal('contact')} className="hover:text-brand-primary transition-colors">Contact Us</button></li>
                 </ul>
              </div>

              <div className="md:col-span-1">
                 <h4 className="text-white font-bold mb-4">Legal</h4>
                 <ul className="space-y-2 text-sm text-slate-400">
                    <li><button onClick={() => setActiveModal('privacy')} className="hover:text-brand-primary transition-colors">Privacy Policy</button></li>
                    <li><button onClick={() => setActiveModal('disclaimer')} className="hover:text-brand-primary transition-colors">Disclaimer</button></li>
                 </ul>
              </div>
           </div>
           
           <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
              <p>&copy; {new Date().getFullYear()} Manit Movie Minutes. All rights reserved.</p>
              <p className="mt-2 md:mt-0">Powered by Gemini API</p>
           </div>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* Sign Up Modal */}
      <Modal isOpen={activeModal === 'signup'} onClose={closeModal} title="Join the Club">
        <div className="text-center mb-6">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/20 mb-4">
              <span className="text-3xl">✨</span>
           </div>
           <p className="text-slate-400">Create an account to save your favorite movies, track quiz scores, and get personalized recommendations.</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
           <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <Input placeholder="Enter your name" required />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <Input type="email" placeholder="you@example.com" required />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <Input type="password" placeholder="••••••••" required />
           </div>
           <Button type="submit" className="w-full mt-2">Create Account</Button>
           <p className="text-xs text-center text-slate-500 mt-4">
              By signing up, you agree to our <button type="button" onClick={() => setActiveModal('privacy')} className="underline hover:text-brand-primary">Privacy Policy</button>.
           </p>
        </form>
      </Modal>

      {/* About Modal */}
      <Modal isOpen={activeModal === 'about'} onClose={closeModal} title="About MMM">
        <div className="space-y-4">
           <p><strong className="text-brand-primary">Manit Movie Minutes (MMM)</strong> is your ultimate AI-powered companion for everything Bollywood. Born from a passion for cinema and powered by advanced Gemini technology, we aim to revolutionize how fans interact with Indian cinema.</p>
           <p>Whether you are looking for the latest box office figures, deep-dive reviews, styling tips from your favorite stars, or just want to test your trivia knowledge, MMM has something for everyone.</p>
           <h3 className="text-lg font-bold text-white mt-4">Our Mission</h3>
           <p>To bridge the gap between fans and the film industry through intelligent, data-driven, and engaging content.</p>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <div className="space-y-4 text-sm">
           <p>Last updated: {new Date().toLocaleDateString()}</p>
           <p>At Manit Movie Minutes, we value your privacy. This policy outlines how we handle your data.</p>
           <h4 className="font-bold text-white">1. Data Collection</h4>
           <p>We do not permanently store personal data on our servers. Any inputs provided (such as search queries) are used solely to generate real-time responses via the Gemini API.</p>
           <h4 className="font-bold text-white">2. Local Storage</h4>
           <p>We use your browser's local storage to save preferences like your custom logo, theme settings, or quiz progress for a better user experience.</p>
           <h4 className="font-bold text-white">3. Third-Party Services</h4>
           <p>Our app utilizes Google's Gemini API for content generation. Please refer to Google's privacy policy regarding data processed by their AI models.</p>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contact Us">
        <div className="space-y-4">
           <p>Have a suggestion, found a bug, or just want to talk movies? We'd love to hear from you!</p>
           
           <div className="bg-slate-700/30 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-brand-primary/20 p-3 rounded-full text-brand-primary">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
              </div>
              <div>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Email Us</p>
                 <a href="mailto:hello@manitmovieminutes.com" className="text-white font-bold hover:text-brand-primary">hello@manitmovieminutes.com</a>
              </div>
           </div>

           <div className="bg-slate-700/30 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-brand-secondary/20 p-3 rounded-full text-brand-secondary">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                 </svg>
              </div>
              <div>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Follow Us</p>
                 <a href="#" className="text-white font-bold hover:text-brand-secondary">@ManitMovies</a>
              </div>
           </div>
        </div>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal isOpen={activeModal === 'disclaimer'} onClose={closeModal} title="Disclaimer">
        <div className="space-y-4 text-sm">
           <p><strong>AI-Generated Content:</strong> Much of the content on this website, including reviews, trivia, and bios, is generated using Artificial Intelligence (Google Gemini). While we strive for accuracy, AI models can occasionally produce incorrect or hallucinated information.</p>
           <p><strong>Copyrights:</strong> All movie posters, titles, and celebrity names are the property of their respective owners. They are used here for educational and entertainment purposes under fair use principles.</p>
           <p><strong>Financial Advice:</strong> Box office figures are estimates and should not be used for financial investment decisions.</p>
        </div>
      </Modal>

    </div>
  );
};

export default App;
