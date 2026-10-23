import React, { useState } from 'react';
import { CheckCircle2, Radio, Bell, Users, Search } from 'lucide-react';
import { UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';

interface ChannelsTabProps {
  userSettings: UserSettings;
}

interface ChannelItem {
  id: string;
  name: string;
  verified: boolean;
  avatar: string;
  subscribers: string;
  description: string;
  followed: boolean;
}

export const ChannelsTab: React.FC<ChannelsTabProps> = ({ userSettings }) => {
  const isDark = userSettings.theme === 'dark';

  const [channels, setChannels] = useState<ChannelItem[]>([
    {
      id: 'ch_whatsapp',
      name: 'WhatsApp',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80',
      subscribers: '148 M de seguidores',
      description: 'El canal oficial de noticias de WhatsApp, anuncios de nuevas funciones y consejos de seguridad.',
      followed: true,
    },
    {
      id: 'ch_tech',
      name: 'Tecnología e Inteligencia Artificial',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
      subscribers: '12.4 M de seguidores',
      description: 'Novedades diarias y avances en inteligencia artificial, desarrollo de software y ciencia.',
      followed: false,
    },
    {
      id: 'ch_natgeo',
      name: 'National Geographic España',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop&q=80',
      subscribers: '24.9 M de seguidores',
      description: 'Inspirando a proteger el planeta a través de expediciones, naturaleza y fotografía.',
      followed: true,
    },
    {
      id: 'ch_design',
      name: 'Diseño Web y Frontend',
      verified: false,
      avatar: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80',
      subscribers: '840 mil seguidores',
      description: 'Patrones de UI/UX, componentes modernos y mejores prácticas de diseño web.',
      followed: false,
    },
  ]);

  const toggleFollow = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, followed: !c.followed } : c))
    );
  };

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[400px] border-r select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      <div className={`px-4 py-3 border-b ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <h1 className="text-xl font-bold tracking-tight">Canales</h1>
        <p className="text-xs text-[#8696a0] mt-0.5">Mantente al día sobre los temas que te interesan</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="px-1 text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
          Canales destacados
        </div>

        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`p-3 rounded-2xl border transition-colors ${
              isDark 
                ? 'bg-[#202c33]/50 border-[#2a3942] hover:bg-[#202c33]' 
                : 'bg-[#f8f9fa] border-[#e9edef] hover:bg-[#f0f2f5]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {channel.id === 'ch_whatsapp' ? (
                  <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md shrink-0">
                    <WhatsAppLogo size={28} variant="white" />
                  </div>
                ) : (
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1">
                    {channel.name}
                    {channel.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 fill-[#00a884] text-[#111b21]" />
                    )}
                  </h4>
                  <p className="text-xs text-[#8696a0]">{channel.subscribers}</p>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(channel.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  channel.followed
                    ? isDark
                      ? 'bg-[#2a3942] text-[#8696a0] hover:text-red-400'
                      : 'bg-[#e9edef] text-[#54656f] hover:text-red-500'
                    : 'bg-[#00a884] text-[#111b21] hover:bg-[#02906f]'
                }`}
              >
                {channel.followed ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>

            <p className="mt-2 text-xs text-[#8696a0] leading-relaxed">
              {channel.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
