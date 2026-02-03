import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FunctionDeclaration, Type, GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ToolCall, ToolResponse } from '../types';

// Define tools
const tools: FunctionDeclaration[] = [
  {
    name: 'authorizeUser',
    description: 'Grant or deny access based on passphrase verification.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        success: { type: Type.BOOLEAN, description: 'True if passphrase is correct.' }
      },
      required: ['success']
    }
  },
  {
    name: 'setAssetStatus',
    description: 'Globally activate or deactivate all drones and armor units. Use this to shutdown or power up the entire legion.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ['ACTIVE', 'OFFLINE'], description: 'The target state of all assets.' }
      },
      required: ['status']
    }
  },
  {
    name: 'getCitizenIntel',
    description: 'Retrieve a list of cities and high-value residents/people from a specific country using the global surveillance database.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        country: { type: Type.STRING, description: 'The name of the country to scan.' },
        cities: { 
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'City name' },
              residents: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of people/identities found in this sector.' }
            }
          }
        }
      },
      required: ['country', 'cities']
    }
  },
  {
    name: 'deployDrones',
    description: 'Deploy combat or recon drones. Supports activating large numbers of drones.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        count: { type: Type.NUMBER, description: 'The integer number of drones to deploy.' },
        mode: { type: Type.STRING, description: 'Optional: attack, defense, or recon' }
      },
      required: ['count']
    }
  },
  {
    name: 'initiateAttack',
    description: 'Engage drone fleet in offensive operations against a specific country or target area.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        country: { type: Type.STRING, description: 'The name of the target country.' },
        intensity: { type: Type.STRING, description: 'Optional: low, medium, high, max' }
      },
      required: ['country']
    }
  },
  {
    name: 'activateSuits',
    description: 'Initiate the House Party Protocol, activating all available Iron Man armor units simultaneously.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        protocol: { type: Type.STRING, description: 'The protocol name, e.g., "House Party" or "Clean Slate".' }
      }
    }
  },
  {
    name: 'locateSuits',
    description: 'Identify and display the current global positioning of all available Iron Man armor units on the tactical map.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'displaySuitBlueprints',
    description: 'Access the Stark Industries vault to display technical blueprints and schematics for Iron Man armor marks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        markRange: { type: Type.STRING, description: 'Range of marks to display, e.g., "All", "1-7", "85".' }
      }
    }
  },
  {
    name: 'locateDrones',
    description: 'Identify and display the current global positioning of all active drone units on the tactical map.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'scanTarget',
    description: 'Perform a deep scan on a specific target.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        target: { type: Type.STRING, description: 'Description of the target' }
      },
      required: ['target']
    }
  },
  {
    name: 'activateShields',
    description: 'Maximize defensive shields.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'toggleGlobalMap',
    description: 'Show or hide the global tactical map system.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        show: { type: Type.BOOLEAN, description: 'True to show map, False to hide it.' }
      },
      required: ['show']
    }
  },
  {
    name: 'updateMapView',
    description: 'Update the global map view settings such as zooming to a location or changing the display mode.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING, description: 'Target country or region name to focus on (e.g., "France", "China", "USA").' },
        zoom: { type: Type.NUMBER, description: 'Zoom level multiplier (e.g., 1 for global, 3 for regional, 5 for street).' },
        mode: { type: Type.STRING, description: 'Display mode: "tactical" (blueprint style) or "satellite" (realistic).' }
      }
    }
  },
  {
    name: 'overrideSystems',
    description: 'Initiate a global system override to take control of all nearby electronic devices (mobiles, laptops, PCs, TVs, etc).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        scope: { type: Type.STRING, description: 'The scope of the override, e.g., "all", "local", "global".' }
      }
    }
  },
  {
    name: 'scanNearbyDevices',
    description: 'Scan the local area for mobile devices and return a list with IP addresses.',
    parameters: { 
      type: Type.OBJECT, 
      properties: {} 
    }
  },
  {
    name: 'toggleHUDPanels',
    description: 'Show or hide the system logs, diagnostics, and active drone panels to clear the view.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        visible: { type: Type.BOOLEAN, description: 'True to show panels, False to hide them.' }
      },
      required: ['visible']
    }
  }
];

interface LiveConfig {
  onToolCall: (calls: ToolCall[]) => Promise<ToolResponse[]>;
  systemInstruction: string;
  initialMessage: string;
}

export const useGeminiLive = (config: LiveConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sessionRef = useRef<any>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Playback state
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        try {
            if (typeof sessionRef.current.close === 'function') {
                sessionRef.current.close();
            }
        } catch (e) {
            console.error("Error closing session", e);
        }
    }
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (inputContextRef.current) {
        if (inputContextRef.current.state !== 'closed') inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsConnected(false);
    sessionRef.current = null;
    sessionPromiseRef.current = null;
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || sessionPromiseRef.current) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioCtx.resume();
      audioContextRef.current = audioCtx;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputCtx;
      
      let stream: MediaStream;
      try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
          console.error("Microphone access denied", err);
          return;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Connected to Gemini Live");
            setIsConnected(true);
            if (!inputCtx) return;
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(async (session) => {
                  try {
                      await session.sendRealtimeInput({ media: pcmBlob });
                  } catch (e) {
                      console.debug("Stream send error", e);
                  }
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
            inputSourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
              const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                  const ctx = audioContextRef.current;
                  if (ctx) {
                      try {
                          const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                          const source = ctx.createBufferSource();
                          source.buffer = audioBuffer;
                          source.connect(ctx.destination);
                          const now = ctx.currentTime;
                          const startTime = Math.max(nextStartTimeRef.current, now);
                          source.start(startTime);
                          nextStartTimeRef.current = startTime + audioBuffer.duration;
                          source.onended = () => { sourcesRef.current.delete(source); };
                          sourcesRef.current.add(source);
                      } catch (e) {
                          console.error("Audio decode error", e);
                      }
                  }
              }
              if (msg.toolCall) {
                  const calls: ToolCall[] = msg.toolCall.functionCalls.map(fc => ({
                      id: fc.id,
                      name: fc.name,
                      args: fc.args
                  }));
                  const responses = await config.onToolCall(calls);
                  sessionPromise.then(async (session) => {
                      try {
                          await session.sendToolResponse({
                              functionResponses: responses.map(r => ({
                                  id: r.id,
                                  name: r.name,
                                  response: r.response
                              }))
                          });
                      } catch (e) {
                          console.error("Tool response send error", e);
                      }
                  });
              }
              if (msg.serverContent?.interrupted) {
                  sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                  sourcesRef.current.clear();
                  nextStartTimeRef.current = 0;
              }
          },
          onclose: () => { disconnect(); },
          onerror: (e) => { disconnect(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          systemInstruction: config.systemInstruction,
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;
      sessionPromise.then(s => sessionRef.current = s).catch(e => {
          console.error("Connection failed", e);
          disconnect();
      });
    } catch (e) {
      console.error("Initialization error", e);
      disconnect();
    }
  }, [config, isConnected, disconnect]);
  
  useEffect(() => {
      return () => { disconnect(); };
  }, [disconnect]);

  return { connect, disconnect, isConnected };
};

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const val = Math.max(-1, Math.min(1, data[i]));
    int16[i] = val * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}