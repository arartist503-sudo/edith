import React, { useMemo } from 'react';
import { Crosshair, Map as MapIcon, Satellite, Target, Zap, Layers } from 'lucide-react';
import { DroneLocation, SuitLocation } from '../types';

interface Props {
  zoom: number;
  location: string;
  mode: 'tactical' | 'satellite';
  droneLocations?: DroneLocation[];
  suitLocations?: SuitLocation[];
  isCombat?: boolean;
  onToggleMode?: () => void;
}

const getCoordinates = (loc: string): { x: number, y: number } => {
  const l = loc.toLowerCase();
  if (l.includes('usa') || l.includes('america') || l.includes('united states')) return { x: 25, y: 35 };
  if (l.includes('europe') || l.includes('france') || l.includes('germany') || l.includes('italy')) return { x: 50, y: 30 };
  if (l.includes('china') || l.includes('asia') || l.includes('japan')) return { x: 80, y: 35 };
  if (l.includes('india')) return { x: 70, y: 45 };
  if (l.includes('russia')) return { x: 70, y: 20 };
  if (l.includes('brazil')) return { x: 35, y: 65 };
  if (l.includes('africa')) return { x: 55, y: 55 };
  if (l.includes('australia')) return { x: 85, y: 75 };
  return { x: 50, y: 50 };
};

export const GlobalMapSystem: React.FC<Props> = ({ 
    zoom = 1, 
    location = "GLOBAL", 
    mode = "tactical", 
    droneLocations = [], 
    suitLocations = [],
    isCombat = false,
    onToggleMode
}) => {
  const coords = useMemo(() => getCoordinates(location), [location]);
  const scale = zoom;
  const translateX = (50 - coords.x) * (scale > 1 ? 0.8 : 0);
  const translateY = (50 - coords.y) * (scale > 1 ? 0.8 : 0);

  const bgImage = mode === 'satellite' 
    ? "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Aurora_as_seen_by_WIGOS.jpg/2560px-Aurora_as_seen_by_WIGOS.jpg')"
    : "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')";

  const filterStyle = mode === 'satellite'
    ? 'sepia(20%) saturate(120%) hue-rotate(190deg) brightness(80%) contrast(120%)'
    : `invert(100%) sepia(100%) saturate(400%) hue-rotate(180deg) brightness(80%) contrast(150%) ${isCombat ? 'drop-shadow(0 0 10px #ff3b3b)' : 'drop-shadow(0 0 5px #00a8ff)'}`;

  return (
    <div className={`relative w-full h-full border ${isCombat ? 'border-alert-red/50' : 'border-stark-blue/30'} bg-black/80 backdrop-blur-md overflow-hidden rounded-lg flex items-center justify-center animate-in fade-in duration-500`}>
         <div className={`absolute inset-0 z-10 pointer-events-none ${isCombat ? 'bg-[linear-gradient(rgba(255,59,59,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,59,59,0.05)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,168,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,168,255,0.1)_1px,transparent_1px)]'} bg-[length:40px_40px]`}></div>

         <div className="absolute inset-0 transition-transform duration-1000 ease-in-out" 
              style={{ transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)` }}>
            <div className="absolute inset-0 opacity-80" style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: filterStyle }}></div>
            
            {/* Target Area Highlights for Attack Mode */}
            {isCombat && (
                <div className="absolute w-20 h-20 border-2 border-alert-red rounded-full animate-ping opacity-50" style={{ top: `${coords.y}%`, left: `${coords.x}%`, transform: 'translate(-50%, -50%)' }}></div>
            )}

            {/* Suit Markers (Iron Legion) */}
            {suitLocations.map(suit => (
              <div key={suit.id} className="absolute" style={{ top: `${suit.y}%`, left: `${suit.x}%` }}>
                <div className="relative group flex flex-col items-center">
                  <div className="absolute -inset-3 bg-yellow-500/30 rounded-full animate-pulse"></div>
                  <Target className="w-4 h-4 text-yellow-500 shadow-[0_0_10px_#eab308]" />
                  <div className="absolute top-full mt-1 bg-black/80 border border-yellow-500/50 px-1 py-0.5 text-[8px] font-bold text-yellow-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    ARMOR_{suit.mark}
                  </div>
                </div>
              </div>
            ))}

            {/* Drone Markers */}
            {droneLocations.map(drone => (
              <div key={drone.id} className="absolute" style={{ top: `${drone.y}%`, left: `${drone.x}%` }}>
                <div className="relative group">
                  <div className={`absolute -inset-2 rounded-full animate-ping opacity-50 ${isCombat ? 'bg-alert-red' : 'bg-stark-blue'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full ${isCombat ? 'bg-alert-red shadow-[0_0_8px_#ff3b3b]' : 'bg-stark-blue shadow-[0_0_8px_#00a8ff]'}`}></div>
                </div>
              </div>
            ))}
         </div>

         <div className={`absolute top-0 bottom-0 w-1 ${isCombat ? 'bg-alert-red/50 shadow-[0_0_20px_#ff3b3b]' : 'bg-stark-blue/30 shadow-[0_0_20px_#00a8ff]'} animate-scan z-20 pointer-events-none`}></div>

         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
             <Crosshair className={`w-64 h-64 ${isCombat ? 'text-alert-red animate-pulse' : 'text-stark-blue/10 animate-spin-slow'}`} />
         </div>

         <div className={`absolute top-4 left-4 p-2 bg-black/80 border-l-2 ${isCombat ? 'border-alert-red' : 'border-stark-blue'} backdrop-blur-sm z-40`}>
             <div className={`flex items-center gap-2 ${isCombat ? 'text-alert-red' : 'text-stark-blue'} mb-1`}>
                 <Zap className="w-4 h-4 animate-pulse" />
                 <span className="text-xs font-bold tracking-widest uppercase">{isCombat ? 'Combat Operations' : 'Tactical Surveillance'}</span>
             </div>
             <div className={`text-[10px] ${isCombat ? 'text-alert-red/80' : 'text-stark-blue/70'} font-mono`}>
                 LOC: {location.toUpperCase()}<br/>
                 LEGION: {suitLocations.length} UNITS<br/>
                 SWARM: {droneLocations.length} ACTIVE
             </div>
         </div>

         {/* Mode Toggle Button */}
         <div className="absolute bottom-4 right-4 z-40">
            <button 
              onClick={onToggleMode}
              className={`flex items-center gap-2 px-3 py-1.5 bg-black/80 border ${isCombat ? 'border-alert-red text-alert-red' : 'border-stark-blue text-stark-blue'} text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer`}
            >
              {mode === 'tactical' ? <Satellite className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {mode === 'tactical' ? 'Satellite View' : 'Tactical Mode'}
            </button>
         </div>
    </div>
  );
};