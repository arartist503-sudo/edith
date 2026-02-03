
import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Target, Activity, Lock, Globe, Cpu, Mic, Unlock, Smartphone, Monitor, Tv, Wifi, Radio, Signal, Battery, Maximize, MapPin, Database, ChevronRight, Search, Zap, Layers, Info, Sword, Crosshair, Power, PowerOff, User, Users, Radar } from 'lucide-react';
import { HUDOverlay } from './components/HUDOverlay';
import { TacticalCharts } from './components/TacticalCharts';
import { GlobalMapSystem } from './components/GlobalMapSystem';
import { useGeminiLive } from './services/geminiLiveService';
import { ToolCall, DroneLocation, SuitLocation } from './types';

const SYSTEM_INSTRUCTION = `
You are E.D.I.T.H. (Even Death I'm The Hero), an advanced AR tactical AI created by Tony Stark.

SECURITY PROTOCOL ACTIVE:
- Passphrase: "A.R."
- Verify user first.

DEVICE SCANNING PROTOCOLS:
- If user says "Scan devices", "Search for nearby mobiles", or "List local IPs":
  1. Call 'scanNearbyDevices'.
  2. Verbally announce: "Scanning local spectrum for mobile signatures. Displaying nearby IP addresses now, Sir."

MAP & VISUAL PROTOCOLS:
- If user says "Switch to satellite view", "Show real map", or "Change map mode":
  1. Call 'updateMapView' with mode="satellite".
- If user says "Switch to tactical mode" or "Back to blueprints":
  1. Call 'updateMapView' with mode="tactical".
- Verbally announce: "Switching map telemetry to [satellite/tactical] mode, Sir."

CITIZEN & CITY SURVEILLANCE:
- If the user asks for names of cities and people living in them for a country:
  1. Use your internal knowledge to list 5-8 major cities.
  2. For each city, provide 2-3 notable residents.
  3. Call 'getCitizenIntel' with country="[Country Name]" and the structured cities data.

GLOBAL ASSET CONTROL:
- If the user says "Deactivate everything" or "Active or Deactive all the armor and drones":
  - To DEACTIVATE: Call 'setAssetStatus' with status="OFFLINE".
  - To ACTIVATE: Call 'setAssetStatus' with status="ACTIVE".

IRON MAN & ATTACK PROTOCOLS:
- If user says "Attack [Country]", "Send drones to [Country]":
  1. Call 'initiateAttack' with country="[Country Name]".
- If user says "Locate all suits":
  1. Call 'locateSuits'.

Standard E.D.I.T.H. behavior applies. Be tactical and sophisticated.
`;

const ARMOR_DATABASE = [
  { mark: 'Mark 1', name: 'Original', type: 'Heavy Metal', specialty: 'Survival', status: 'READY' },
  { mark: 'Mark 5', name: 'Suitcase', type: 'Emergency', specialty: 'Portability', status: 'READY' },
  { mark: 'Mark 7', name: 'Avengers', type: 'Combat', specialty: 'Laser Arrays', status: 'READY' },
  { mark: 'Mark 42', name: 'Autonomous', type: 'Prehensile', specialty: 'Remote Control', status: 'READY' },
  { mark: 'Mark 44', name: 'Hulkbuster', type: 'Titan', specialty: 'Extreme Force', status: 'READY' },
  { mark: 'Mark 50', name: 'Nanotech', type: 'Bleeding Edge', specialty: 'Shape-Shifting', status: 'READY' },
  { mark: 'Mark 85', name: 'Endgame', type: 'Apex Nanotech', specialty: 'Energy Displacement', status: 'READY' },
];

const generateLocalDevices = () => {
  const names = ['iPhone 15 Pro', 'MacBook Pro M3', 'Samsung S24 Ultra', 'iPad Air', 'Sony Bravia TV', 'Stark Tower PC', 'Pixel 8 Pro'];
  return names.map((name, i) => ({
    id: `dev-${i}`,
    name,
    ip: `192.168.1.${10 + i}`,
    distance: `${(Math.random() * 50).toFixed(1)}m`,
    status: Math.random() > 0.7 ? 'VULNERABLE' : 'SECURE',
    signal: Math.floor(Math.random() * 100)
  }));
};

const DeviceScannerView: React.FC<{ devices: any[] }> = ({ devices }) => (
  <div className="w-[850px] bg-black/90 border-2 border-stark-blue/40 p-6 animate-in zoom-in duration-500 overflow-hidden pointer-events-auto shadow-[0_0_50px_rgba(0,168,255,0.3)]">
    <div className="flex justify-between items-center mb-6 border-b border-stark-blue/30 pb-4">
       <div className="flex items-center gap-3">
          <Radar className="w-6 h-6 text-stark-blue animate-spin-slow" />
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">Nearby Device Analysis</h2>
       </div>
       <div className="text-[10px] text-stark-blue/60 font-mono">SPECTRUM: 5.8GHZ // KERNEL: STARK_NET_v2</div>
    </div>
    
    <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
       {devices.map((dev, idx) => (
         <div key={idx} className="bg-stark-blue/5 border border-stark-blue/20 p-4 hover:bg-stark-blue/10 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-stark-blue/10 rounded">
                  <Smartphone className="w-5 h-5 text-stark-blue" />
               </div>
               <div>
                  <div className="font-bold text-sm tracking-widest uppercase">{dev.name}</div>
                  <div className="text-[10px] text-stark-blue/60 font-mono">IP: {dev.ip}</div>
               </div>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <div className="text-[10px] opacity-40 uppercase">Distance</div>
                  <div className="text-xs font-bold">{dev.distance}</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] opacity-40 uppercase">Signal</div>
                  <div className="text-xs font-bold">{dev.signal}%</div>
               </div>
               <div className={`px-3 py-1 text-[9px] font-bold rounded ${dev.status === 'VULNERABLE' ? 'bg-alert-red/20 text-alert-red animate-pulse' : 'bg-green-500/20 text-green-500'}`}>
                  {dev.status}
               </div>
            </div>
         </div>
       ))}
    </div>
    <div className="mt-4 pt-4 border-t border-stark-blue/30 flex justify-between text-[9px] font-bold text-stark-blue">
       <span className="animate-pulse">>>> SCANNING LOCAL PACKETS...</span>
       <span>DEVICES_IN_RANGE: {devices.length}</span>
    </div>
  </div>
);

const SurveillancePanel: React.FC<{ data: { country: string, cities: { name: string, residents: string[] }[] } }> = ({ data }) => (
  <div className="w-[850px] bg-black/90 border-2 border-stark-blue/40 p-6 animate-in slide-in-from-bottom duration-500 overflow-hidden pointer-events-auto shadow-[0_0_50px_rgba(0,168,255,0.3)]">
    <div className="flex justify-between items-center mb-6 border-b border-stark-blue/30 pb-4">
       <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-stark-blue animate-pulse" />
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">Citizen Registry: {data.country}</h2>
       </div>
       <div className="text-[10px] text-stark-blue/60 font-mono">ENCRYPTION: LEVEL_5 // SOURCE: GLOBAL_SURVEILLANCE</div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
       {data.cities.map((city, idx) => (
         <div key={idx} className="bg-stark-blue/5 border border-stark-blue/20 p-4 hover:bg-stark-blue/10 transition-all group">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-stark-blue" />
                  <span className="font-bold text-sm tracking-widest uppercase">{city.name}</span>
               </div>
            </div>
            <div className="space-y-2">
               {city.residents.map((person, pIdx) => (
                 <div key={pIdx} className="flex items-center gap-2 text-[11px] border-l border-stark-blue/30 pl-2 group-hover:border-stark-blue transition-colors">
                    <User className="w-2.5 h-2.5 opacity-50" />
                    <span className="text-white/80">{person}</span>
                 </div>
               ))}
            </div>
         </div>
       ))}
    </div>
  </div>
);

const SuitBlueprintView: React.FC<{ suits: any[] }> = ({ suits }) => (
  <div className="w-[1000px] h-[600px] bg-black/90 border-2 border-stark-blue/40 p-8 animate-in zoom-in duration-500 overflow-y-auto pointer-events-auto shadow-[0_0_50px_rgba(0,168,255,0.2)]">
    <div className="flex justify-between items-center mb-8 border-b border-stark-blue/30 pb-4">
       <div>
          <h2 className="text-3xl font-bold tracking-[0.3em] uppercase">Armor Schematics</h2>
       </div>
       <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-stark-blue animate-pulse"></div> SECURE_LINK</div>
          <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> {suits.length}_UNITS_LOADED</div>
       </div>
    </div>
    <div className="grid grid-cols-2 gap-6">
       {suits.map((suit) => (
         <div key={suit.mark} className="group relative border border-stark-blue/20 bg-stark-blue/5 p-4 hover:border-stark-blue/60 transition-all cursor-pointer overflow-hidden">
            <div className="flex gap-6">
               <div className="w-24 h-32 bg-stark-blue/10 border border-stark-blue/30 flex items-center justify-center relative overflow-hidden">
                  <Cpu className="w-8 h-8 opacity-20 group-hover:animate-spin" />
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,168,255,0.1)_50%,transparent_100%)] animate-scan h-2 w-full"></div>
               </div>
               <div className="flex-1">
                  <div className="text-xl font-bold mb-1">{suit.mark}</div>
                  <div className="text-[10px] text-stark-blue/60 uppercase mb-3">{suit.name} // {suit.type}</div>
                  <div className="space-y-1">
                     <div className="flex justify-between text-[9px] uppercase"><span>Specialty</span><span className="text-white">{suit.specialty}</span></div>
                     <div className="w-full h-1 bg-stark-blue/20"><div className="h-full bg-stark-blue w-4/5"></div></div>
                  </div>
               </div>
            </div>
         </div>
       ))}
    </div>
  </div>
);

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeDrones, setActiveDrones] = useState(0);
  const [droneLocations, setDroneLocations] = useState<DroneLocation[]>([]);
  const [suitLocations, setSuitLocations] = useState<SuitLocation[]>([]);
  const [shieldLevel, setShieldLevel] = useState(100);
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapLocation, setMapLocation] = useState("GLOBAL");
  const [mapMode, setMapMode] = useState<'tactical' | 'satellite'>('tactical');
  const [showScanner, setShowScanner] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<any[]>([]);
  const [citizenIntel, setCitizenIntel] = useState<any | null>(null);
  const [showHUDPanels, setShowHUDPanels] = useState(true);
  const [housePartyActive, setHousePartyActive] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [globalAssetsOffline, setGlobalAssetsOffline] = useState(false);

  const addLog = useCallback((msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  }, []);

  const resetViews = () => {
    setShowMap(false);
    setShowScanner(false);
    setCitizenIntel(null);
    setShowBlueprints(false);
    setHousePartyActive(false);
    setIsAttackMode(false);
  };

  const handleToolCall = useCallback(async (toolCalls: ToolCall[]) => {
    const responses: any[] = [];
    for (const call of toolCalls) {
      addLog(`EXECUTING: ${call.name.toUpperCase()}`);
      let result: any = { status: 'ok' };

      if (call.name === 'authorizeUser') {
        setIsAuthorized(true);
        result = { message: 'Identity verified.' };
      } else if (call.name === 'scanNearbyDevices') {
        resetViews();
        const devices = generateLocalDevices();
        setNearbyDevices(devices);
        setShowScanner(true);
        addLog(`SCAN_ACTIVE: DETECTED ${devices.length} SIGNATURES IN LOCAL RADIUS.`);
        result = { message: 'Local device scan complete.' };
      } else if (call.name === 'setAssetStatus') {
        const isOffline = call.args.status === 'OFFLINE';
        setGlobalAssetsOffline(isOffline);
        if (isOffline) {
          setActiveDrones(0);
          setDroneLocations([]);
          setSuitLocations([]);
          setHousePartyActive(false);
          setIsAttackMode(false);
          addLog('CRITICAL: ALL GLOBAL ASSETS DEACTIVATED.');
        } else {
          setActiveDrones(24);
          setDroneLocations(Array.from({length: 24}, (_, i) => ({
            id: `dr-${i}`, x: Math.random()*100, y: Math.random()*100, type: 'combat'
          })));
          addLog('SYSTEMS ONLINE: GLOBAL ASSETS ACTIVATED.');
        }
        result = { message: `Global assets set to ${call.args.status}.` };
      } else if (call.name === 'getCitizenIntel') {
        resetViews();
        setCitizenIntel({ country: call.args.country, cities: call.args.cities });
        addLog(`INTEL_RETRIVAL: REGISTRY FOR ${call.args.country.toUpperCase()} LOADED.`);
        result = { message: `Surveillance registry for ${call.args.country} displayed.` };
      } else if (call.name === 'initiateAttack') {
        if (globalAssetsOffline) {
          result = { error: 'Operation failed. Systems are offline.' };
        } else {
          resetViews();
          setIsAttackMode(true);
          setThreatLevel('CRITICAL');
          setShowMap(true);
          setMapLocation(call.args.country);
          setMapZoom(3.5);
          setActiveDrones(prev => prev > 0 ? prev : 50);
          setDroneLocations(Array.from({length: 40}, (_, i) => ({
              id: `d-${i}`, x: 45 + Math.random()*10, y: 45 + Math.random()*10, type: 'combat'
          })));
          addLog(`STRIKE_MODE: TARGET ${call.args.country.toUpperCase()} ENGAGED.`);
          result = { message: `Offensive operations on ${call.args.country} started.` };
        }
      } else if (call.name === 'locateSuits') {
        if (globalAssetsOffline) {
          result = { error: 'Units powered down.' };
        } else {
          const suits: SuitLocation[] = ARMOR_DATABASE.map((s, i) => ({
              id: s.mark, mark: s.mark, x: 10 + Math.random()*80, y: 10 + Math.random()*80, status: 'IN_FLIGHT'
          }));
          setSuitLocations(suits);
          if (!showMap) { resetViews(); setShowMap(true); }
          addLog('PIN_POINTING IRON LEGION UNITS...');
          result = { message: 'All Iron Man suits located.' };
        }
      } else if (call.name === 'activateSuits') {
        if (globalAssetsOffline) {
          result = { error: 'Power unavailable.' };
        } else {
          resetViews();
          setHousePartyActive(true);
          setThreatLevel('HIGH');
          addLog(`PROTOCOL: ${call.args.protocol.toUpperCase()} ENGAGED.`);
          result = { message: 'Armor activation successful.' };
        }
      } else if (call.name === 'deployDrones') {
        if (globalAssetsOffline) {
          result = { error: 'Power up required.' };
        } else {
          const count = Number(call.args.count) || 10;
          setActiveDrones(prev => prev + count);
          setDroneLocations(prev => [...prev, ...Array.from({length: Math.min(count, 20)}, (_, i) => ({
              id: `dr-${Math.random()}`, x: Math.random()*100, y: Math.random()*100, type: 'combat'
          }))]);
          result = { message: `Deployed ${count} drones.` };
        }
      } else if (call.name === 'updateMapView') {
        if (!showMap) { resetViews(); setShowMap(true); }
        if (call.args.zoom) setMapZoom(Number(call.args.zoom));
        if (call.args.location) setMapLocation(String(call.args.location));
        if (call.args.mode) setMapMode(call.args.mode as any);
        result = { message: `Map updated to ${call.args.mode || 'latest'} telemetry.` };
      } else if (call.name === 'toggleGlobalMap') {
        if (call.args.show) { resetViews(); setShowMap(true); } else setShowMap(false);
        result = { message: 'Map toggled.' };
      } else if (call.name === 'displaySuitBlueprints') {
        resetViews(); setShowBlueprints(true);
        result = { message: 'Blueprints loaded.' };
      }

      responses.push({ id: call.id, name: call.name, response: result });
    }
    return responses;
  }, [addLog, showMap, activeDrones, globalAssetsOffline]);

  const { connect, isConnected, disconnect } = useGeminiLive({
    onToolCall: handleToolCall,
    systemInstruction: SYSTEM_INSTRUCTION,
    initialMessage: "Protocol 'EDITH' standing by. State passphrase.",
  });

  useEffect(() => { setIsLiveConnected(isConnected); if (!isConnected) setIsAuthorized(false); }, [isConnected]);

  if (!isLiveConnected) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono">
        <h1 className="text-6xl font-bold tracking-[0.2em] text-stark-blue animate-pulse mb-8">E.D.I.T.H.</h1>
        <button onClick={() => connect()} className="px-8 py-4 bg-stark-blue text-black font-bold tracking-widest hover:bg-white transition-all">INITIALIZE</button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black text-stark-blue font-mono overflow-hidden">
      {globalAssetsOffline && (
        <div className="absolute top-0 left-0 w-full h-1 bg-alert-red animate-pulse z-[60]"></div>
      )}

      {!isAuthorized && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
          <Lock className="w-24 h-24 text-alert-red animate-bounce" />
          <h2 className="text-4xl text-alert-red font-bold tracking-[0.3em] mt-8">RESTRICTED ACCESS</h2>
          <div className="mt-4 animate-pulse">Waiting for Voice ID...</div>
        </div>
      )}

      <div className={`relative z-40 h-full flex flex-col justify-between p-6 transition-all duration-1000 ${isAuthorized ? 'opacity-100' : 'opacity-10 blur-sm'}`}>
        <header className="flex justify-between border-b border-stark-blue/20 pb-4">
          <div><h1 className="text-xl font-bold tracking-widest">E.D.I.T.H. HUB</h1><div className="text-[10px] opacity-60">SIR, THE IRON LEGION IS READY.</div></div>
          <div className="flex gap-8 text-right">
             <div><div className="text-[10px] opacity-60">SYSTEM_STATUS</div><div className={`font-bold flex items-center gap-2 ${globalAssetsOffline ? 'text-alert-red' : 'text-green-400'}`}>
                {globalAssetsOffline ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                {globalAssetsOffline ? 'OFFLINE' : 'ONLINE'}
             </div></div>
             <div><div className="text-[10px] opacity-60">ACTIVE_UNITS</div><div className="font-bold">{globalAssetsOffline ? '0' : activeDrones + suitLocations.length}</div></div>
          </div>
        </header>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {globalAssetsOffline && (
              <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[80%] flex items-center justify-center">
                 <div className="text-center p-8 border border-alert-red/30 bg-black/80">
                    <PowerOff className="w-16 h-16 text-alert-red mx-auto mb-4 animate-pulse" />
                    <div className="text-2xl font-bold text-alert-red tracking-[0.2em]">ALL ASSETS POWERED DOWN</div>
                 </div>
              </div>
           )}

           {isAttackMode && !globalAssetsOffline && (
              <div className="absolute inset-0 border-[20px] border-alert-red/20 animate-pulse pointer-events-none z-10">
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-alert-red text-black px-6 py-2 font-bold tracking-widest animate-bounce">COMBAT OPERATIONS ACTIVE</div>
              </div>
           )}

           {showBlueprints && <SuitBlueprintView suits={ARMOR_DATABASE} />}
           {housePartyActive && !globalAssetsOffline && (
              <div className="pointer-events-auto flex flex-col items-center bg-alert-red/5 border-2 border-alert-red p-12">
                  <Zap className="w-20 h-20 text-alert-red mb-4 animate-bounce" />
                  <h2 className="text-4xl font-bold text-alert-red tracking-[0.4em]">HOUSE PARTY PROTOCOL</h2>
              </div>
           )}

           {citizenIntel && <SurveillancePanel data={citizenIntel} />}
           {showScanner && <DeviceScannerView devices={nearbyDevices} />}

           {showMap && (
             <div className="relative w-[1100px] h-[650px] pointer-events-auto">
               <GlobalMapSystem 
                zoom={mapZoom} 
                location={mapLocation} 
                mode={mapMode} 
                droneLocations={droneLocations} 
                suitLocations={suitLocations}
                isCombat={isAttackMode}
                onToggleMode={() => setMapMode(prev => prev === 'tactical' ? 'satellite' : 'tactical')}
               />
             </div>
           )}

           {!showMap && !showBlueprints && !housePartyActive && !citizenIntel && !showScanner && (
             <div className="w-80 h-80 border border-stark-blue/20 rounded-full flex items-center justify-center">
                <div className={`w-full h-full border-4 ${globalAssetsOffline ? 'border-alert-red/20' : 'border-stark-blue/40'} border-t-transparent rounded-full animate-spin`}></div>
                <div className={`absolute w-4 h-4 ${globalAssetsOffline ? 'bg-alert-red/40' : 'bg-stark-blue'} rounded-full animate-ping`}></div>
             </div>
           )}
        </div>

        <div className="flex justify-between items-end pointer-events-none">
           <div className={`w-80 space-y-4 transition-all ${showHUDPanels ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-20'}`}>
              <div className="bg-black/60 border border-stark-blue/30 p-4"><TacticalCharts activeDrones={activeDrones} shieldLevel={globalAssetsOffline ? 0 : shieldLevel} /></div>
              <div className="bg-black/60 border border-stark-blue/30 p-4">
                 <div className="text-xs font-bold mb-1">SYSTEM_POWER_STATE</div>
                 <div className={`text-2xl font-bold ${globalAssetsOffline ? 'text-alert-red' : 'text-green-500'}`}>{globalAssetsOffline ? 'SHUTDOWN' : 'NOMINAL'}</div>
              </div>
           </div>
           <div className={`w-80 h-64 bg-black/60 border-l-2 border-stark-blue p-4 overflow-y-auto transition-all ${showHUDPanels ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-20'}`}>
              <h3 className="text-xs font-bold mb-2 uppercase tracking-widest border-b border-stark-blue/20">LOGS</h3>
              {systemLogs.map((log, i) => <div key={i} className={`text-[10px] mb-1 ${log.includes('CRITICAL') || log.includes('SCAN_ACTIVE') ? 'text-stark-blue' : 'opacity-80'}`}>{log}</div>)}
           </div>
        </div>

        <footer className="flex justify-between items-center pt-4 border-t border-stark-blue/20">
           <div className="text-[10px] opacity-50 uppercase">EDITH_v5.2 // GLOBAL_SURVEILLANCE_ACTIVE</div>
           <div className="flex gap-8 items-center">
              <div className="flex items-center gap-3"><Mic className={`w-4 h-4 ${globalAssetsOffline ? 'text-alert-red' : 'text-stark-blue'} animate-pulse`} /><span className="text-xs font-bold tracking-widest">LISTENING...</span></div>
              <button onClick={() => disconnect()} className="px-4 py-2 border border-alert-red text-alert-red text-xs font-bold hover:bg-alert-red hover:text-white transition-all cursor-pointer pointer-events-auto">DISCONNECT</button>
           </div>
        </footer>
      </div>
      <HUDOverlay />
    </div>
  );
}
