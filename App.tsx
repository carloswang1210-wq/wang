import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeMode } from './types';

function App() {
  const [mode, setMode] = useState<TreeMode>(TreeMode.TREE_SHAPE);

  const toggleMode = () => {
    setMode((prev) => 
      prev === TreeMode.TREE_SHAPE ? TreeMode.SCATTERED : TreeMode.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-serif">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene mode={mode} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 pointer-events-auto">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
             <span className="text-[#D4AF37] tracking-[0.3em] text-xs font-bold uppercase">Arix Signature</span>
          </div>
          <h1 className="text-4xl md:text-6xl text-white font-light tracking-wide drop-shadow-lg">
            Gilded <span className="italic font-thin text-[#D4AF37]">Foliage</span>
          </h1>
        </header>

        {/* Footer / Controls */}
        <footer className="flex flex-col md:flex-row items-end md:items-center justify-between pointer-events-auto gap-6">
          <div className="max-w-md text-right md:text-left text-white/70 text-sm leading-relaxed hidden md:block">
            <p>Experience the convergence of digital craftsmanship and holiday spirit.</p>
            <p>Switch modes to witness the assembly of the Arix Collection.</p>
          </div>

          <button
            onClick={toggleMode}
            className="group relative px-8 py-3 overflow-hidden transition-all duration-500 ease-out bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <span className="relative z-10 text-[#D4AF37] font-medium tracking-widest text-sm uppercase group-hover:text-white transition-colors duration-300">
              {mode === TreeMode.TREE_SHAPE ? 'Scatter Elements' : 'Assemble Tree'}
            </span>
            <div className="absolute inset-0 w-0 bg-[#D4AF37] transition-all duration-300 ease-out group-hover:w-full opacity-20"></div>
          </button>
        </footer>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-[#D4AF37]/30 pointer-events-none"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#D4AF37]/30 pointer-events-none"></div>
    </div>
  );
}

export default App;
