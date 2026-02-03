import React from 'react';

export const HUDOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 p-2">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Top Left Corner */}
        <path d="M 20 100 V 20 H 100" stroke="#00a8ff" strokeWidth="2" fill="none" filter="url(#glow)" />
        <rect x="20" y="20" width="10" height="10" fill="#00a8ff" opacity="0.5" />

        {/* Top Right Corner */}
        <path d="M calc(100% - 100px) 20 H calc(100% - 20px) V 100" stroke="#00a8ff" strokeWidth="2" fill="none" filter="url(#glow)" />
        <rect x="calc(100% - 30px)" y="20" width="10" height="10" fill="#00a8ff" opacity="0.5" />

        {/* Bottom Left Corner */}
        <path d="M 20 calc(100% - 100px) V calc(100% - 20px) H 100" stroke="#00a8ff" strokeWidth="2" fill="none" filter="url(#glow)" />

        {/* Bottom Right Corner */}
        <path d="M calc(100% - 100px) calc(100% - 20px) H calc(100% - 20px) V calc(100% - 100px)" stroke="#00a8ff" strokeWidth="2" fill="none" filter="url(#glow)" />
        
        {/* Center Arcs */}
        <path d="M calc(50% - 150px) calc(50% - 50px) A 200 200 0 0 0 calc(50% - 150px) calc(50% + 50px)" stroke="#00a8ff" strokeWidth="1" strokeOpacity="0.3" fill="none" />
        <path d="M calc(50% + 150px) calc(50% - 50px) A 200 200 0 0 1 calc(50% + 150px) calc(50% + 50px)" stroke="#00a8ff" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      </svg>
    </div>
  );
};