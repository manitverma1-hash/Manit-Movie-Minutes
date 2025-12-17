
import React, { useState, useEffect, useRef } from 'react';
import { Feature } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';
import ImageEditor from './shared/ImageEditor';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (feature: Feature) => void;
  onSignUp: () => void;
  onOpenAbout: () => void;
}

const features: { id: Feature; label: string; icon: string; color: string }[] = [
  { id: 'News', label: 'News', icon: '📰', color: 'bg-blue-600' },
  { id: 'Releases', label: 'Releases', icon: '🗓️', color: 'bg-green-600' },
  { id: 'Reviews', label: 'Reviews', icon: '⭐', color: 'bg-yellow-600' },
  { id: 'Music', label: 'Music', icon: '🎵', color: 'bg-pink-600' },
  { id: 'Fashion', label: 'Fashion', icon: '👗', color: 'bg-purple-600' },
  { id: 'Quotes', label: 'Quotes', icon: '💬', color: 'bg-teal-600' },
  { id: 'Quiz', label: 'Quiz', icon: '❓', color: 'bg-indigo-600' },
  { id: 'Games', label: 'Games', icon: '🎮', color: 'bg-red-600' },
  { id: 'Interviews', label: 'Interviews', icon: '🎙️', color: 'bg-orange-600' },
  { id: 'Box Office', label: 'Box Office', icon: '📈', color: 'bg-emerald-600' },
  { id: 'Bio', label: 'Bio', icon: '👤', color: 'bg-cyan-600' },
  { id: 'ManitSays', label: 'Manit Says', icon: '📢', color: 'bg-rose-600' },
];

const DEFAULT_COVER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

const Home: React.FC<HomeProps> = ({ searchQuery, setSearchQuery, onNavigate, onSignUp, onOpenAbout }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Cover State
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverHeight, setCoverHeight] = useState<number>(450);
  const [isResizingCover, setIsResizingCover] = useState(false);

  // Logo State
  const [logoImage, setLogoImage] = useState<string | null>(null);
  // Default to Top Left (2%, 2%)
  const [logoPos, setLogoPos] = useState({ x: 2, y: 2 }); 
  const [logoWidth, setLogoWidth] = useState(120);
  const [logoBlur, setLogoBlur] = useState(false);

  // Interactive Logic State for Logo
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isResizingLogo, setIsResizingLogo] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Editor State
  const [editingTarget, setEditingTarget] = useState<'cover' | 'logo' | null>(null);
  const [editingImageSrc, setEditingImageSrc] = useState<string | null>(null);

  const mastheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load persisted assets
    const savedCover = localStorage.getItem('manit_custom_cover');
    if (savedCover === 'removed') {
        setCoverImage(null);
    } else if (savedCover) {
        setCoverImage(savedCover);
    } else {
        setCoverImage(DEFAULT_COVER);
    }

    const savedHeight = localStorage.getItem('manit_cover_height');
    if (savedHeight) setCoverHeight(parseInt(savedHeight, 10));
    else setCoverHeight(Math.min(window.innerHeight * 0.6, 600));

    // Load Saved Custom Logo
    const savedLogo = localStorage.getItem('manit_custom_logo');
    if (savedLogo) setLogoImage(savedLogo);

    const savedLogoPos = localStorage.getItem('manit_logo_pos');
    if (savedLogoPos) {
        try {
            const parsed = JSON.parse(savedLogoPos);
            setLogoPos(parsed);
        } catch (e) {
            console.error("Failed to parse logo position", e);
        }
    }

    const savedLogoWidth = localStorage.getItem('manit_logo_width');
    if (savedLogoWidth) setLogoWidth(parseInt(savedLogoWidth, 10));

    const savedLogoBlur = localStorage.getItem('manit_logo_blur');
    if (savedLogoBlur === 'true') setLogoBlur(true);

  }, []);

  // --- Handlers for Cover Resizing ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingCover) {
        const newHeight = Math.max(300, Math.min(e.clientY, window.innerHeight * 0.85));
        setCoverHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      if (isResizingCover) {
        setIsResizingCover(false);
        localStorage.setItem('manit_cover_height', coverHeight.toString());
      }
    };
    if (isResizingCover) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizingCover, coverHeight]);

    // --- Handlers for Logo Interaction (Drag & Resize) ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mastheadRef.current) return;
      const rect = mastheadRef.current.getBoundingClientRect();

      if (isDraggingLogo) {
        let newXPx = e.clientX - rect.left - dragOffset.x;
        let newYPx = e.clientY - rect.top - dragOffset.y;
        let newXPer = (newXPx / rect.width) * 100;
        let newYPer = (newYPx / rect.height) * 100;
        newXPer = Math.max(0, Math.min(newXPer, 100));
        newYPer = Math.max(0, Math.min(newYPer, 100));
        setLogoPos({ x: newXPer, y: newYPer });
      }

      if (isResizingLogo) {
         const currentXPx = (logoPos.x / 100) * rect.width;
         const newWidth = e.clientX - rect.left - currentXPx;
         setLogoWidth(Math.max(40, Math.min(newWidth, 400)));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLogo) {
        setIsDraggingLogo(false);
        localStorage.setItem('manit_logo_pos', JSON.stringify(logoPos));
      }
      if (isResizingLogo) {
        setIsResizingLogo(false);
        localStorage.setItem('manit_logo_width', logoWidth.toString());
      }
    };

    if (isDraggingLogo || isResizingLogo) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = isDraggingLogo ? 'move' : 'nwse-resize';
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = 'default';
    };
  }, [isDraggingLogo, isResizingLogo, dragOffset, logoPos, logoWidth]);


  // --- File & Editor Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingImageSrc(reader.result as string);
        setEditingTarget(target);
        // Reset input
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditingExisting = () => {
     if (editingTarget === 'cover') {
         setEditingImageSrc(coverImage || DEFAULT_COVER);
     }
  };

  const saveEditedImage = (newImageSrc: string) => {
      if (editingTarget === 'cover') {
        setCoverImage(newImageSrc);
        localStorage.setItem('manit_custom_cover', newImageSrc);
      } else if (editingTarget === 'logo') {
        setLogoImage(newImageSrc);
        localStorage.setItem('manit_custom_logo', newImageSrc);
      }
      setEditingTarget(null);
      setEditingImageSrc(null);
  };

  const handleRemoveCover = () => {
    if (window.confirm('Remove custom cover image?')) {
        setCoverImage(null);
        localStorage.setItem('manit_custom_cover', 'removed');
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove custom logo?')) {
        setLogoImage(null);
        localStorage.removeItem('manit_custom_logo');
    }
  };

  const toggleLogoBlur = () => {
      const newVal = !logoBlur;
      setLogoBlur(newVal);
      localStorage.setItem('manit_logo_blur', newVal.toString());
  };

  const startLogoDrag = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     if (!mastheadRef.current) return;
     
     const rect = mastheadRef.current.getBoundingClientRect();
     const logoLeftPx = (logoPos.x / 100) * rect.width;
     const logoTopPx = (logoPos.y / 100) * rect.height;

     setDragOffset({
         x: (e.clientX - rect.left) - logoLeftPx,
         y: (e.clientY - rect.top) - logoTopPx
     });
     setIsDraggingLogo(true);
  };

  const startLogoResize = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizingLogo(true);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] animate-fade-in relative overflow-x-hidden w-full pb-10">
      
      {/* Masthead Section */}
      <div 
        ref={mastheadRef}
        className={`w-full relative bg-white mb-12 shadow-2xl min-h-[300px] group/masthead ${!isResizingCover ? 'transition-[height] duration-300 ease-out' : ''}`}
        style={{ height: `${coverHeight}px` }}
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
           {coverImage ? (
             <img src={coverImage} alt="Cover" className="w-full h-full object-cover object-center" />
           ) : (
             <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="z-10 text-brand-primary/50 flex flex-col items-center">
                    <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest mt-2 opacity-50">No Cover Image</span>
                </div>
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/40 opacity-80 pointer-events-none"></div>
        </div>

        {/* CUSTOM UPLOADED LOGO - Draggable/Fixed */}
        {logoImage && (
            <div
              className={`absolute z-30 group/logo`}
              style={{
                  left: `${logoPos.x}%`,
                  top: `${logoPos.y}%`,
                  width: `${logoWidth}px`,
                  userSelect: 'none',
                  touchAction: 'none'
              }}
              onMouseDown={startLogoDrag}
            >
               <img 
                 src={logoImage} 
                 alt="Custom Logo" 
                 className={`w-full h-auto drop-shadow-2xl cursor-move transition-transform ${isDraggingLogo ? 'scale-105 opacity-90' : 'hover:scale-105'}`}
                 style={{
                    ...(logoBlur ? { maskImage: 'radial-gradient(closest-side, black 65%, transparent 100%)', WebkitMaskImage: 'radial-gradient(closest-side, black 65%, transparent 100%)' } : {})
                 }}
                 draggable={false}
               />
               
               <div className="absolute -top-3 -right-3 opacity-0 group-hover/logo:opacity-100 transition-opacity flex gap-1 z-50">
                   <button 
                     onClick={handleRemoveLogo}
                     className="bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transform hover:scale-110 transition-all"
                     title="Remove Custom Logo"
                     onMouseDown={e => e.stopPropagation()} 
                   >
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                   </button>
               </div>

               <div 
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-brand-primary rounded-full cursor-nwse-resize shadow-lg opacity-0 group-hover/logo:opacity-100 flex items-center justify-center hover:scale-125 transition-all z-40"
                  onMouseDown={startLogoResize}
                  title="Resize"
               >
                   <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
               </div>
               
               <div className="absolute inset-0 border-2 border-white/30 rounded-lg opacity-0 group-hover/logo:opacity-100 pointer-events-none border-dashed"></div>
            </div>
        )}

        {/* TOP RIGHT CONTROLS */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
           <div className="flex items-center gap-1 md:gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 pl-3 border border-white/10 shadow-lg">
               
               {/* Logo Controls Group */}
               {logoImage && (
                 <div className="flex items-center border-r border-white/20 mr-1 pr-1">
                    {/* Logo Blur Toggle */}
                    <button
                        onClick={toggleLogoBlur}
                        className={`p-1 cursor-pointer transition-colors ${logoBlur ? 'text-brand-accent' : 'text-slate-400 hover:text-white'}`}
                        title="Blur Logo Edges"
                        >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>
                 </div>
               )}

               {/* Logo Upload Button */}
               <input 
                 type="file" 
                 accept="image/*" 
                 id="logo-upload" 
                 className="hidden" 
                 onChange={(e) => handleFileSelect(e, 'logo')}
               />
               <label 
                 htmlFor="logo-upload" 
                 className="text-brand-secondary p-1 cursor-pointer hover:text-white transition-colors flex items-center gap-1 border-r border-white/20 pr-2 mr-1"
                 title="Add/Change Custom Logo"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <span className="text-[10px] font-bold uppercase hidden md:inline">Logo</span>
               </label>

               {/* Cover Upload */}
               <input 
                 type="file" 
                 accept="image/*" 
                 id="cover-upload" 
                 className="hidden" 
                 onChange={(e) => handleFileSelect(e, 'cover')}
               />
               <label 
                 htmlFor="cover-upload" 
                 className="text-brand-primary p-1 cursor-pointer hover:text-white transition-colors"
                 title="Upload Cover"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </label>

               {/* Edit Cover Position */}
               <button
                   onClick={() => { setEditingTarget('cover'); startEditingExisting(); }}
                   className="text-brand-primary p-1 hover:text-white transition-colors"
                   title="Adjust Cover"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
               </button>

               {/* Remove Cover */}
               {coverImage && (
                 <button
                   onClick={handleRemoveCover}
                   className="text-red-500 p-1 hover:text-red-400 transition-colors"
                   title="Remove Cover"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
               )}
           </div>

           <Button 
             onClick={onSignUp}
             className="text-sm px-5 py-2 font-bold bg-brand-primary/90 hover:bg-brand-primary text-white backdrop-blur-md border border-white/10 shadow-lg"
           >
             Sign Up
           </Button>
        </div>

        {/* Decorative Bottom Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
             <svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                 <path d="M985.66,92.83C906.67,72,823.78,31,432.84,2c-47.35-3.53-105.7,1.69-243.2,76.51C122.92,111,18.36,104.9,0,94.27V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-900"></path>
                 <path d="M0,0V46.29c47,39.22,106.52,60.12,163.52,48.83,57-11.3,103.14-53.59,150.36-96.22C389.26-17.65,463,3.74,510.63,16.29c47.65,12.55,83.84,17.43,121.21,6.56,37.37-10.87,68.4-38.33,99.31-64.86,30.9-26.53,62-52.28,95.34-60.75,33.37-8.47,70.52,2.83,106.88,27,36.36,24.13,70.36,60.9,112.55,73.57,42.19,12.67,88.46,1.25,134.12-25.56V0Z" className="fill-slate-900 opacity-50"></path>
             </svg>
        </div>

        {/* Drag Handle for Resizing Cover */}
        <div 
           className="absolute bottom-0 left-0 w-full h-8 cursor-ns-resize z-50 flex items-end justify-center group/resize hover:bg-gradient-to-t from-black/20 to-transparent transition-all"
           onMouseDown={(e) => { e.preventDefault(); setIsResizingCover(true); }}
           title="Drag to resize cover"
        >
            <div className="w-16 h-1 bg-white/30 rounded-full mb-3 group-hover/resize:bg-white/80 transition-colors shadow-sm backdrop-blur-sm"></div>
        </div>

      </div>

      {/* Tagline & Search Section */}
      <div className="w-full max-w-5xl px-4 flex flex-col items-center mb-12 animate-slide-up">
        {/* Tagline */}
        <div className="text-center mb-8">
            <p className="text-2xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight leading-tight">
            Your AI-Powered Bollywood Companion
            </p>
        </div>

        {/* Search Bar */}
        <div className={`w-full max-w-2xl transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
            <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10">
                <div className="pl-6 text-brand-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
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
        </div>
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

      {/* Image Editor Modal - For Logo and Cover */}
      <Modal 
         isOpen={!!editingTarget && !!editingImageSrc} 
         onClose={() => { setEditingTarget(null); setEditingImageSrc(null); }} 
         title={editingTarget === 'cover' ? "Adjust Cover Image" : "Crop Logo"}
      >
         {editingImageSrc && (
            <ImageEditor 
               imageSrc={editingImageSrc} 
               onSave={saveEditedImage} 
               onCancel={() => { setEditingTarget(null); setEditingImageSrc(null); }}
               aspectRatio={editingTarget === 'cover' ? 16/9 : 1}
               circular={editingTarget === 'logo'}
            />
         )}
      </Modal>

    </div>
  );
};

export default Home;
