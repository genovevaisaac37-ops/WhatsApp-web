import React from 'react';
import { X, Phone, Video, VolumeX, Shield, Users, Trash2, ExternalLink } from 'lucide-react';
import { Chat, Message, UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';

interface ContactInfoDrawerProps {
  chat: Chat;
  messages: Message[];
  userSettings: UserSettings;
  onClose: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onClearChat: () => void;
  onMuteToggle: () => void;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  chat,
  messages,
  userSettings,
  onClose,
  onStartCall,
  onClearChat,
  onMuteToggle,
}) => {
  const isDark = userSettings.theme === 'dark';

  const mediaMessages = messages.filter((m) => m.type === 'image' && m.mediaUrl);

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[380px] border-l select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-4 px-4 py-3 border-b ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <button 
          onClick={onClose}
          className="p-1 rounded-full text-[#8696a0] hover:text-white"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold">Info. del contacto</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Card */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-[#202c33]/40 border border-[#2a3942]/60 text-center">
          {chat.id === 'chat_whatsapp' ? (
            <div className="w-24 h-24 rounded-full bg-[#00a884] flex items-center justify-center text-white mb-3 border-2 border-[#00a884] shadow-md">
              <WhatsAppLogo size={52} variant="white" />
            </div>
          ) : (
            <img
              src={chat.avatar}
              alt={chat.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-[#00a884]"
            />
          )}
          <h3 className="text-lg font-bold">{chat.name}</h3>
          <p className="text-xs text-[#8696a0] mt-0.5">{chat.phone || 'Conversación grupal'}</p>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => onStartCall('voice')}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#8696a0]">Llamada</span>
            </button>

            <button
              onClick={() => onStartCall('video')}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#8696a0]">Video</span>
            </button>

            {chat.phone && (
              <a
                href={`https://api.whatsapp.com/send?phone=${chat.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#25d366]/15 transition-colors group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <WhatsAppLogo size={18} />
                </div>
                <span className="text-[11px] text-[#25d366] font-medium flex items-center gap-0.5">
                  <span>wa.me</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Info. section */}
        {chat.about && (
          <div className="p-4 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
              Info.
            </h4>
            <p className="text-sm leading-relaxed">{chat.about}</p>
          </div>
        )}

        {/* Media & Docs Grid */}
        {mediaMessages.length > 0 && (
          <div className="p-4 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">
              Archivos, enlaces y docs ({mediaMessages.length})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {mediaMessages.map((m) => (
                <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-[#2f3b43]">
                  <img
                    src={m.mediaUrl}
                    alt={m.mediaCaption || 'Archivo'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group members list */}
        {chat.isGroup && chat.groupMembers && (
          <div className="p-4 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" />
              {chat.groupMembers.length} participantes
            </h4>
            <div className="space-y-2">
              {chat.groupMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      style={{ backgroundColor: member.color || '#00a884' }}
                      className="w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-xs"
                    >
                      {member.name.charAt(0)}
                    </span>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  {member.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                      Admin. del grupo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Actions */}
        <div className="p-4 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <VolumeX className="w-4 h-4 text-[#8696a0]" />
              Silenciar notificaciones
            </span>
            <input
              type="checkbox"
              checked={chat.muted}
              onChange={onMuteToggle}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8696a0] pt-1">
            <Shield className="w-4 h-4 text-[#00a884]" />
            <span>Cifrado: Los mensajes están cifrados de extremo a extremo</span>
          </div>

          <button
            onClick={() => {
              if (confirm('¿Deseas vaciar todos los mensajes de este chat?')) {
                onClearChat();
              }
            }}
            className="w-full text-left text-xs font-medium text-red-400 hover:text-red-300 pt-2 border-t border-[#2a3942]/60 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vaciar chat
          </button>
        </div>
      </div>
    </div>
  );
};
