import React, { useEffect, useState } from 'react';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';
import { Lock } from 'lucide-react';

interface InitialLoadingScreenProps {
  isDark: boolean;
  onFinish: () => void;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ isDark, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Slower, smooth and realistic WhatsApp Web loading pacing (~3.8s total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Realistic progression: steady start, thorough chat synchronization, smooth completion
        let increment = 0;
        if (prev < 25) {
          increment = Math.random() * 3 + 2; // ~2-5%
        } else if (prev < 65) {
          increment = Math.random() * 2.5 + 1.5; // ~1.5-4% (chat history sync)
        } else if (prev < 90) {
          increment = Math.random() * 2 + 1; // ~1-3% (status and reels)
        } else {
          increment = Math.random() * 4 + 3; // final finish
        }

        const next = Math.min(100, Math.round(prev + increment));
        return next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 350);

      const unmountTimer = setTimeout(() => {
        onFinish();
      }, 850);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [progress, onFinish]);

  const getStatusText = () => {
    if (progress < 25) return 'Iniciando WhatsApp Web...';
    if (progress < 55) return 'Conectando con el servidor seguro...';
    if (progress < 80) return 'Descargando chats y mensajes cifrados...';
    if (progress < 98) return 'Sincronizando estados, reels y multimedia...';
    return '¡Todo listo!';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-4 select-none transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isDark ? 'bg-[#111b21] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'}`}
    >
      {/* Top spacer */}
      <div />

      {/* Main Center Content */}
      <div className="flex flex-col items-center max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Animated WhatsApp Logo with glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#00a884]/20 blur-xl animate-pulse scale-150" />
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-white shadow-xl shadow-[#00a884]/25">
            <WhatsAppLogo size={42} variant="white" className="drop-shadow-sm" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <span>WhatsApp</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00a884]/15 text-[#00a884] font-semibold uppercase tracking-wider">
            Web
          </span>
        </h1>

        {/* Status text */}
        <p className="text-xs sm:text-sm text-[#8696a0] font-medium h-5 mb-6">
          {getStatusText()}
        </p>

        {/* Modern Smooth Progress Bar */}
        <div className="w-64 sm:w-72 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#00a884] via-[#25d366] to-[#00a884] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#00a884]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] text-[#8696a0] mt-2 font-mono">
          {progress}%
        </span>
      </div>

      {/* Bottom End-to-End Encryption Badge */}
      <div className="flex items-center gap-2 text-xs text-[#8696a0] font-medium">
        <Lock className="w-3.5 h-3.5 text-[#00a884]" />
        <span>Cifrado de extremo a extremo</span>
      </div>
    </div>
  );
};
