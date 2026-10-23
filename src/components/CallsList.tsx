import React from 'react';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Phone, 
  Video 
} from 'lucide-react';
import { CallLog, UserSettings } from '../types/whatsapp.ts';

interface CallsListProps {
  callLogs: CallLog[];
  userSettings: UserSettings;
  onStartCall: (contactId: string, type: 'voice' | 'video') => void;
}

export const CallsList: React.FC<CallsListProps> = ({
  callLogs,
  userSettings,
  onStartCall,
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
        <h1 className="text-xl font-bold tracking-tight">Llamadas</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-3 py-1.5 text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
          Recientes
        </div>

        {callLogs.map((log) => {
          const isMissed = log.direction === 'missed';

          return (
            <div
              key={log.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={log.contactAvatar}
                  alt={log.contactName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className={`font-semibold text-sm truncate ${isMissed ? 'text-red-500' : ''}`}>
                    {log.contactName}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#8696a0]">
                    {log.direction === 'incoming' && (
                      <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {log.direction === 'outgoing' && (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {log.direction === 'missed' && (
                      <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span>{log.timestamp}</span>
                    {log.duration && <span>· {log.duration}</span>}
                  </div>
                </div>
              </div>

              {/* Call back trigger */}
              <button
                onClick={() => onStartCall(log.contactId, log.type)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#111b21] text-[#00a884]' : 'hover:bg-[#e9edef] text-[#008069]'
                }`}
                title={`Llamar a ${log.contactName}`}
              >
                {log.type === 'video' ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
