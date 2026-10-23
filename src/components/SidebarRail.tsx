import React from 'react';
import { 
  MessageSquare, 
  CircleDot, 
  Radio, 
  Clapperboard, 
  Phone, 
  Star, 
  Settings, 
  Moon, 
  Sun 
} from 'lucide-react';
import { SidebarTab, UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';

interface SidebarRailProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  unreadCountTotal: number;
  hasUnreadStatus: boolean;
  missedCallsCount: number;
  userSettings: UserSettings;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeTab,
  setActiveTab,
  unreadCountTotal,
  hasUnreadStatus,
  missedCallsCount,
  userSettings,
  onToggleTheme,
  onOpenProfile,
}) => {
  const isDark = userSettings.theme === 'dark';

  const navItems = [
    {
      id: 'chats' as SidebarTab,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadCountTotal > 0 ? unreadCountTotal : null,
    },
    {
      id: 'status' as SidebarTab,
      label: 'Estados',
      icon: CircleDot,
      hasDot: hasUnreadStatus,
    },
    {
      id: 'channels' as SidebarTab,
      label: 'Canales',
      icon: Radio,
    },
    {
      id: 'reels' as SidebarTab,
      label: 'Reels',
      icon: Clapperboard,
    },
    {
      id: 'calls' as SidebarTab,
      label: 'Llamadas',
      icon: Phone,
      badge: missedCallsCount > 0 ? missedCallsCount : null,
      badgeColor: 'bg-red-500',
    },
  ];

  const bottomItems = [
    {
      id: 'starred' as SidebarTab,
      label: 'Mensajes destacados',
      icon: Star,
    },
    {
      id: 'settings' as SidebarTab,
      label: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between items-center w-16 py-3 border-r select-none transition-colors duration-150 z-20 shrink-0 ${
        isDark 
          ? 'bg-[#202c33] border-[#2a3942] text-[#aebac1]' 
          : 'bg-[#f0f2f5] border-[#e9edef] text-[#54656f]'
      }`}
      aria-label="Navigation Rail"
    >
      {/* Top primary icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* WhatsApp Brand Logo */}
        <button
          onClick={() => setActiveTab('chats')}
          title="WhatsApp Web"
          className="flex items-center justify-center w-11 h-11 mb-1 rounded-full hover:scale-105 active:scale-95 transition-transform"
        >
          <WhatsAppLogo size={32} />
        </button>

        <div className={`w-8 h-[1px] mb-1 ${isDark ? 'bg-[#2a3942]' : 'bg-[#e9edef]'}`} />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-[#374248] text-[#00a884]'
                    : 'bg-[#e9edef] text-[#008069]'
                  : isDark
                    ? 'hover:bg-[#111b21] hover:text-[#e9edef]'
                    : 'hover:bg-[#e2e5e8] hover:text-[#111b21]'
              }`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Badge count */}
              {item.badge !== null && item.badge !== undefined && (
                <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-white rounded-full ${item.badgeColor || 'bg-[#25d366]'}`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Status update dot */}
              {item.hasDot && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#25d366] rounded-full border-2 border-[#202c33]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Quick theme toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isDark 
              ? 'hover:bg-[#111b21] text-[#aebac1] hover:text-[#e9edef]' 
              : 'hover:bg-[#e2e5e8] text-[#54656f] hover:text-[#111b21]'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-[#374248] text-[#00a884]'
                    : 'bg-[#e9edef] text-[#008069]'
                  : isDark
                    ? 'hover:bg-[#111b21] hover:text-[#e9edef]'
                    : 'hover:bg-[#e2e5e8] hover:text-[#111b21]'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}

        <div className={`w-8 h-[1px] my-1 ${isDark ? 'bg-[#2a3942]' : 'bg-[#e9edef]'}`} />

        {/* User profile avatar */}
        <button
          onClick={onOpenProfile}
          title="Ver y editar perfil"
          className="relative group p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a884]"
        >
          <img
            src={userSettings.profile.avatar}
            alt={userSettings.profile.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 group-hover:scale-105 transition-transform"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
        </button>
      </div>
    </aside>
  );
};
