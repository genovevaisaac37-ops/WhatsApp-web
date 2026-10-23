import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  MessageSquarePlus, 
  Filter, 
  Pin, 
  VolumeX, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Mic, 
  FileText, 
  MapPin, 
  BarChart2, 
  MoreVertical,
  Users,
  CheckCircle2,
  Trash2,
  User,
  CircleDot,
  Phone,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Chat, UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';
import { validatePhoneNumber, isPhoneNumberQuery } from '../utils/phoneValidator.ts';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  userSettings: UserSettings;
  onPinChat: (chatId: string) => void;
  onMuteChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onMarkAsRead: (chatId: string) => void;
  onCreateNewChat: (name: string, isGroup: boolean, phone?: string) => void;
  onOpenSettings: () => void;
  onOpenProfileEdit: () => void;
  onOpenStatus?: () => void;
  onOpenPhoneSearch?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  userSettings,
  onPinChat,
  onMuteChat,
  onDeleteChat,
  onMarkAsRead,
  onCreateNewChat,
  onOpenSettings,
  onOpenProfileEdit,
  onOpenStatus,
  onOpenPhoneSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);

  const isDark = userSettings.theme === 'dark';

  // Real-time phone search validation
  const phoneSearchValidation = useMemo(() => {
    if (!searchQuery.trim() || !isPhoneNumberQuery(searchQuery)) return null;
    return validatePhoneNumber(searchQuery.trim());
  }, [searchQuery]);

  // Validation for phone inside New Chat modal
  const newChatPhoneValidation = useMemo(() => {
    if (!newChatPhone.trim() || isGroupChat) return null;
    return validatePhoneNumber(newChatPhone.trim());
  }, [newChatPhone, isGroupChat]);

  const filteredChats = useMemo(() => {
    return chats
      .filter((chat) => {
        // Filter by category
        if (activeFilter === 'unread' && chat.unreadCount === 0) return false;
        if (activeFilter === 'groups' && !chat.isGroup) return false;
        if (activeFilter === 'favorites' && !chat.pinned) return false;

        // Filter by search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          chat.name.toLowerCase().includes(q) ||
          (chat.lastMessage && chat.lastMessage.toLowerCase().includes(q)) ||
          (chat.phone && chat.phone.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pinned chats first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  }, [chats, activeFilter, searchQuery]);

  const handleCreateChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    if (newChatPhone.trim() && !isGroupChat) {
      if (newChatPhoneValidation && !newChatPhoneValidation.isValid) {
        return; // Prevent creating chat with invalid phone number
      }
    }

    const finalPhone = newChatPhoneValidation?.isValid 
      ? newChatPhoneValidation.formatted 
      : (newChatPhone.trim() || undefined);

    onCreateNewChat(newChatName.trim(), isGroupChat, finalPhone);
    setNewChatName('');
    setNewChatPhone('');
    setIsGroupChat(false);
    setShowNewChatModal(false);
  };

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[400px] border-r select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <div className="flex items-center gap-2.5">
          <WhatsAppLogo size={24} />
          <h1 className="text-xl font-bold tracking-tight">Chats</h1>
        </div>
        
        <div className="flex items-center gap-1">
          {onOpenPhoneSearch && (
            <button
              onClick={onOpenPhoneSearch}
              title="Buscar o chatear por número de teléfono"
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#202c33] text-[#00a884]' : 'hover:bg-[#f0f2f5] text-[#008069]'
              }`}
            >
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          <button
            onClick={() => setShowNewChatModal(true)}
            title="Nuevo chat"
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#202c33] text-[#aebac1]' : 'hover:bg-[#f0f2f5] text-[#54656f]'
            }`}
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="Menú"
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#202c33] text-[#aebac1]' : 'hover:bg-[#f0f2f5] text-[#54656f]'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)} 
                />
                <div 
                  className={`absolute right-0 top-10 w-56 py-2 rounded-xl shadow-xl z-50 text-sm ${
                    isDark ? 'bg-[#233138] border border-[#2f3b43] text-[#d1d7db]' : 'bg-white border border-[#e9edef] text-[#3b4a54]'
                  }`}
                >
                  {onOpenPhoneSearch && (
                    <button
                      onClick={() => {
                        onOpenPhoneSearch();
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                        isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-[#00a884]" />
                      <span>Buscar por número</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenProfileEdit();
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Mi perfil ({userSettings.profile.phone || 'Sin número'})</span>
                  </button>
                  {onOpenStatus && (
                    <button
                      onClick={() => {
                        onOpenStatus();
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                        isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                      }`}
                    >
                      <CircleDot className="w-4 h-4 text-emerald-500" />
                      <span>Estados (Fotos y videos)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsGroupChat(true);
                      setShowNewChatModal(true);
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-500" />
                    Nuevo grupo
                  </button>
                  <button
                    onClick={() => {
                      chats.forEach(c => onMarkAsRead(c.id));
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Marcar todo como leído
                  </button>
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 border-t ${
                      isDark ? 'border-[#2f3b43] hover:bg-[#182229]' : 'border-[#e9edef] hover:bg-[#f5f6f6]'
                    }`}
                  >
                    Ajustes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 py-2 space-y-2">
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            isDark 
              ? 'bg-[#202c33] border-transparent focus-within:border-[#00a884]' 
              : 'bg-[#f0f2f5] border-transparent focus-within:border-[#008069]'
          }`}
        >
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#8696a0]' : 'text-[#54656f]'}`} />
          <input
            type="text"
            placeholder="Buscar contacto o escribir número (ej. +34...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-sm focus:outline-none placeholder:text-xs ${
              isDark ? 'placeholder-[#8696a0]' : 'placeholder-[#54656f]'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[#8696a0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Phone Search Validation & Direct Action Bar */}
        {phoneSearchValidation && (
          <div>
            {phoneSearchValidation.isValid ? (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between shadow-xs animate-in fade-in duration-150 ${
                isDark ? 'bg-[#00a884]/15 border-[#00a884]/40 text-[#e9edef]' : 'bg-[#00a884]/10 border-[#00a884]/30 text-[#111b21]'
              }`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1 truncate">
                      <span>{phoneSearchValidation.formatted}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                    </div>
                    <p className="text-[10px] text-[#8696a0]">
                      {phoneSearchValidation.country 
                        ? `${phoneSearchValidation.country.flag} ${phoneSearchValidation.country.name} · Verificado` 
                        : 'Número internacional válido'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCreateNewChat(`Contacto (${phoneSearchValidation.formatted})`, false, phoneSearchValidation.formatted);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#008f6f] transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  Chatear
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-500 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">Número incorrecto</div>
                  <p className="text-[11px] text-[#8696a0] mt-0.5">{phoneSearchValidation.errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Filter Segmented Buttons */}
      <div className="flex items-center gap-1.5 px-3 py-1 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'unread', label: 'No leídos' },
          { id: 'favorites', label: 'Favoritos' },
          { id: 'groups', label: 'Grupos' },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-[#00a884] text-[#111b21]'
                    : 'bg-[#008069] text-white'
                  : isDark
                    ? 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#d1d7db]'
                    : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e2e5e8] hover:text-[#111b21]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Chat List Body */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-[#8696a0]">
            <Filter className="w-8 h-8 mb-2 opacity-50 text-[#8696a0]" />
            <p>No se encontraron conversaciones</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-[#00a884] hover:underline"
              >
                Borrar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = activeChatId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  onMarkAsRead(chat.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuChatId(chat.id);
                }}
                className={`group relative flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b ${
                  isSelected
                    ? isDark
                      ? 'bg-[#2a3942] border-[#2a3942]'
                      : 'bg-[#f0f2f5] border-[#e9edef]'
                    : isDark
                      ? 'hover:bg-[#202c33] border-[#222e35]/40'
                      : 'hover:bg-[#f5f6f6] border-[#f0f2f5]'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  {chat.id === 'chat_whatsapp' ? (
                    <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md">
                      <WhatsAppLogo size={28} variant="white" />
                    </div>
                  ) : (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  {chat.isOnline && (
                    <span 
                      title="Online"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111b21]" 
                    />
                  )}
                </div>

                {/* Chat Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {chat.isGroup && <Users className="w-3.5 h-3.5 text-[#8696a0] shrink-0" />}
                      <span className="truncate">{chat.name}</span>
                    </span>
                    <span 
                      className={`text-xs tabular-nums shrink-0 ${
                        chat.unreadCount > 0 
                          ? 'text-[#25d366] font-semibold' 
                          : isDark ? 'text-[#8696a0]' : 'text-[#667781]'
                      }`}
                    >
                      {chat.lastMessageTimestamp || ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {/* Last message or typing state */}
                    <div className="truncate flex items-center gap-1 mr-2 text-[#8696a0]">
                      {chat.typingStatus === 'typing' ? (
                        <span className="text-[#25d366] font-medium flex items-center gap-1 animate-pulse">
                          <span>typing...</span>
                        </span>
                      ) : chat.typingStatus === 'recording' ? (
                        <span className="text-[#25d366] font-medium flex items-center gap-1 animate-pulse">
                          <Mic className="w-3.5 h-3.5" />
                          <span>recording audio...</span>
                        </span>
                      ) : (
                        <>
                          {chat.lastMessageSenderId === 'user' && (
                            <span className="shrink-0">
                              {chat.lastMessageStatus === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                              ) : chat.lastMessageStatus === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                              )}
                            </span>
                          )}
                          <span className="truncate">
                            {chat.lastMessage || 'Tap to chat'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Metadata & Actions (Pin, Mute, Unread count) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.muted && (
                        <VolumeX className="w-3.5 h-3.5 text-[#8696a0]" />
                      )}
                      {chat.pinned && (
                        <Pin className="w-3.5 h-3.5 text-[#8696a0] rotate-45" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-[#111b21] bg-[#25d366] rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right click dropdown context menu */}
                {contextMenuChatId === chat.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenuChatId(null);
                      }} 
                    />
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute right-4 top-8 w-44 py-1 rounded-lg shadow-2xl z-40 text-xs border ${
                        isDark ? 'bg-[#233138] border-[#2f3b43] text-[#d1d7db]' : 'bg-white border-[#e9edef] text-[#3b4a54]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onPinChat(chat.id);
                          setContextMenuChatId(null);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                          isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5 text-[#00a884]" />
                        {chat.pinned ? 'Desfijar chat' : 'Fijar chat'}
                      </button>
                      <button
                        onClick={() => {
                          onMuteChat(chat.id);
                          setContextMenuChatId(null);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                          isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                        }`}
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        {chat.muted ? 'Desactivar silencio' : 'Silenciar notificaciones'}
                      </button>
                      <button
                        onClick={() => {
                          onMarkAsRead(chat.id);
                          setContextMenuChatId(null);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                          isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        Marcar como leído
                      </button>
                      <button
                        onClick={() => {
                          onDeleteChat(chat.id);
                          setContextMenuChatId(null);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-red-500 border-t ${
                          isDark ? 'border-[#2f3b43] hover:bg-[#182229]' : 'border-[#e9edef] hover:bg-[#f5f6f6]'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar chat
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Chat / Group Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDark ? 'bg-[#222e35] border-[#2f3b43] text-white' : 'bg-white border-[#e9edef] text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {isGroupChat ? 'Crear Nuevo Grupo' : 'Iniciar Nuevo Chat'}
              </h2>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isGroupChat ? 'Asunto / Nombre del Grupo' : 'Nombre del Contacto'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isGroupChat ? 'Ej. Excursión de Fin de Semana 🥾' : 'Ej. Carlos Méndez'}
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                    isDark 
                      ? 'bg-[#111b21] border-[#2f3b43] focus:border-[#00a884]' 
                      : 'bg-[#f0f2f5] border-[#e9edef] focus:border-[#008069]'
                  }`}
                />
              </div>

              {!isGroupChat && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span>Número de Teléfono (Opcional)</span>
                    <span className="text-[10px] text-[#8696a0]">Formato internacional</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. +34 600 000 000"
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors ${
                      newChatPhoneValidation
                        ? newChatPhoneValidation.isValid
                          ? 'border-[#00a884]'
                          : 'border-rose-500'
                        : isDark
                        ? 'bg-[#111b21] border-[#2f3b43] focus:border-[#00a884]'
                        : 'bg-[#f0f2f5] border-[#e9edef] focus:border-[#008069]'
                    }`}
                  />
                  {newChatPhoneValidation && (
                    <div className="mt-1.5">
                      {newChatPhoneValidation.isValid ? (
                        <p className="text-[11px] text-[#00a884] flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Número válido: {newChatPhoneValidation.formatted}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{newChatPhoneValidation.errorMessage}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-400">Crear como conversación grupal</span>
                <input
                  type="checkbox"
                  checked={isGroupChat}
                  onChange={(e) => setIsGroupChat(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#00a884] text-[#111b21] hover:bg-[#02906f] transition-colors"
                >
                  {isGroupChat ? 'Crear Grupo' : 'Iniciar Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
