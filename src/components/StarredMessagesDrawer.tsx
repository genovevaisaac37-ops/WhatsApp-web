import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Message, UserSettings } from '../types/whatsapp.ts';

interface StarredMessagesDrawerProps {
  starredMessages: { message: Message; chatName: string }[];
  userSettings: UserSettings;
  onSelectChat: (chatId: string) => void;
  onUnstar: (messageId: string) => void;
}

export const StarredMessagesDrawer: React.FC<StarredMessagesDrawerProps> = ({
  starredMessages,
  userSettings,
  onSelectChat,
  onUnstar,
}) => {
  const isDark = userSettings.theme === 'dark';

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[400px] border-r select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      <div className={`px-4 py-3 border-b ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span>Mensajes destacados</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-[#8696a0]">
            <Star className="w-10 h-10 mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-semibold">No tienes mensajes destacados</p>
            <p className="text-xs text-[#8696a0]/80 mt-1 max-w-xs leading-relaxed">
              Pasa el cursor sobre un mensaje o mantén presionado y selecciona "Destacar" para guardarlo aquí y consultarlo cuando quieras.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {starredMessages.map(({ message, chatName }) => (
              <div
                key={message.id}
                onClick={() => onSelectChat(message.chatId)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-[#202c33] border-[#2a3942] hover:bg-[#2a3942]' 
                    : 'bg-[#f8f9fa] border-[#e9edef] hover:bg-[#f0f2f5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs text-[#8696a0]">
                  <span className="font-semibold text-[#00a884]">{chatName}</span>
                  <span>{message.timestamp}</span>
                </div>

                <p className="text-sm line-clamp-3 leading-relaxed">
                  {message.text || (message.type === 'image' ? '📷 Foto' : '🎤 Mensaje de voz')}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2f3b43]/30 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnstar(message.id);
                    }}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    Quitar de destacados
                  </button>

                  <span className="text-[#00a884] flex items-center gap-1 font-medium">
                    Ir al chat <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
