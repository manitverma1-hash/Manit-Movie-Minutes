
import React from 'react';
import type { Feature, Language } from '../types';
import Button from './shared/Button';

interface NavbarProps {
  activeFeature: Feature;
  onBack: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSignUp: () => void;
}

const languages: Language[] = ['English', 'Hindi', 'Spanish', 'French', 'Arabic', 'Mandarin', 'Russian'];

const Navbar: React.FC<NavbarProps> = ({ activeFeature, onBack, language, setLanguage, onSignUp }) => {
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  // Map features to icons/labels if needed, or just use text
  const getFeatureLabel = (f: string) => f === 'ManitSays' ? 'Manit Says' : f;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-md">
       <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
             <button 
               onClick={onBack}
               className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
               aria-label="Back to Home"
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             
             <div className="flex flex-col">
                <span className="text-xs text-brand-primary font-bold uppercase tracking-wider">Browsing</span>
                <h1 className="text-xl font-bold text-white leading-none">{getFeatureLabel(activeFeature)}</h1>
             </div>
          </div>

          {/* Right Side: Language, Sign Up */}
          <div className="flex items-center gap-3">
             {/* Language Dropdown */}
             <div className="relative hidden md:block">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-1 bg-slate-800 border border-slate-700 text-white px-2 py-1.5 rounded-md hover:bg-slate-700 text-xs md:text-sm"
                >
                   <span>🌐</span>
                   <span className="font-medium">{language}</span>
                </button>
                
                {langMenuOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>
                     <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">
                        {languages.map((lang) => (
                           <button
                              key={lang}
                              onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                              className={`block w-full text-left px-4 py-2 text-xs hover:bg-slate-700 ${language === lang ? 'text-brand-secondary font-bold' : 'text-slate-200'}`}
                           >
                              {lang}
                           </button>
                        ))}
                     </div>
                   </>
                )}
            </div>

            <Button onClick={onSignUp} className="text-sm font-bold py-2 px-5 md:px-6 bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/80 hover:to-purple-500 border-none">
               Sign Up
            </Button>
          </div>
       </div>
    </div>
  );
};

export default Navbar;
