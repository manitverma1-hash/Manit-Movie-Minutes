
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // width / height
  circular?: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel, aspectRatio = 16/9, circular = false }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Use the container's displayed size as the output size
    const viewportRect = container.getBoundingClientRect();
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewportRect.width;
    canvas.height = viewportRect.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background (useful if image doesn't cover area)
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Replicate CSS transforms on Canvas
    // CSS Transform: translate(-50%, -50%) translate(pos.x, pos.y) scale(zoom)
    // Origin for drawing: Center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);
    
    // Draw image centered at the new origin
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    onSave(canvas.toDataURL('image/jpeg', 0.9));
  };
  
  // Reset on new image
  useEffect(() => {
     setPosition({x: 0, y: 0});
     setZoom(1);
  }, [imageSrc]);

  return (
    <div className="flex flex-col items-center gap-6 p-2 w-full select-none">
        {/* Viewport Container */}
        <div 
            ref={containerRef}
            className={`relative overflow-hidden bg-slate-950 shadow-2xl cursor-move border-2 border-slate-700/50 ${circular ? 'rounded-full' : 'rounded-lg'}`}
            style={{ 
                width: '100%', 
                maxWidth: '500px',
                aspectRatio: `${aspectRatio}`,
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
        >
            <img 
                ref={imageRef}
                src={imageSrc}
                alt="Edit"
                draggable={false}
                className="max-w-none max-h-none"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'center',
                }}
            />
            
            {/* Grid Overlay for visual aid */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
               <div className="w-full h-full border border-white/20 flex flex-col">
                  <div className="flex-1 border-b border-white/20"></div>
                  <div className="flex-1 border-b border-white/20"></div>
                  <div className="flex-1"></div>
               </div>
               <div className="absolute inset-0 flex">
                  <div className="flex-1 border-r border-white/20"></div>
                  <div className="flex-1 border-r border-white/20"></div>
                  <div className="flex-1"></div>
               </div>
            </div>
        </div>
        
        {/* Controls */}
        <div className="w-full max-w-xs space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Zoom Out</span>
                <span>Zoom In</span>
            </div>
            <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.05" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
        </div>
        
        <div className="flex gap-4 w-full justify-center">
            <Button onClick={onCancel} variant="secondary" className="text-sm py-2 px-6">Cancel</Button>
            <Button onClick={handleSave} className="text-sm py-2 px-6 bg-green-600 hover:bg-green-700 text-white">Save & Apply</Button>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 animate-pulse">Drag Image to Reposition</p>
    </div>
  );
};

export default ImageEditor;
