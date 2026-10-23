import React from 'react';
import { Lock } from 'lucide-react';
import { UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';

interface EmptyChatStateProps {
  userSettings: UserSettings;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ userSettings }) => {
  const isDark = userSettings.theme === 'dark';

  return (
    <div 
      className={`hidden md:flex flex-col items-center justify-center flex-1 h-full p-8 text-center select-none border-b-6 border-[#00a884] ${
        isDark ? 'bg-[#222e35] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
      }`}
    >
      <div className="max-w-md flex flex-col items-center">
        {/* WhatsApp signature brand logo badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#00a884]/15 flex items-center justify-center shadow-lg border border-[#00a884]/20">
            <WhatsAppLogo size={52} />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2 tracking-tight">WhatsApp Web</h2>
        
        <p className="text-xs text-[#8696a0] leading-relaxed mb-8">
          Envía y recibe mensajes sin necesidad de mantener tu teléfono conectado.<br />
          Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.
        </p>

        <div className="flex items-center gap-1.5 text-xs text-[#8696a0] pt-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Tus mensajes personales están cifrados de extremo a extremo</span>
        </div>
      </div>
    </div>
  );
};
