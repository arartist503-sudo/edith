import React, { useEffect, useRef } from 'react';

interface Props {
  onFrame: (base64: string) => void;
}

export const LiveVideoFeed: React.FC<Props> = ({ onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera init failed:", err);
      }
    };

    startCamera();

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth / 4; // Downscale for bandwidth
          canvasRef.current.height = videoRef.current.videoHeight / 4;
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
          onFrame(base64);
        }
      }
    }, 1000); // 1 FPS for analysis is usually sufficient to avoid rate limits while maintaining context

    return () => clearInterval(interval);
  }, [onFrame]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover opacity-80 filter contrast-125 grayscale-[20%]"
      />
      <canvas ref={canvasRef} className="hidden" />
      {/* Scan lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,168,255,0.05)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none"></div>
    </div>
  );
};