import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  Check, 
  CheckCheck, 
  X, 
  CornerUpLeft, 
  Star, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  BarChart2, 
  User, 
  Play, 
  Pause, 
  ArrowLeft,
  Download,
  Info,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Chat, Message, UserSettings, PollData } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';
import { HighVolumeVoiceRecorder, voicePlayer } from '../utils/audioVoiceRecorder.ts';
import { getFontColorHex } from '../utils/fontColors.ts';

interface ChatAreaProps {
  chat: Chat;
  messages: Message[];
  userSettings: UserSettings;
  onSendMessage: (text: string, type?: Message['type'], extra?: Partial<Message>) => void;
  onSendVoiceNote: (duration: number, waveform: number[], audioUrl?: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onStarMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onBackMobile: () => void;
  onOpenContactInfo: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  userSettings,
  onSendMessage,
  onSendVoiceNote,
  onReactMessage,
  onStarMessage,
  onDeleteMessage,
  onVotePoll,
  onStartCall,
  onBackMobile,
  onOpenContactInfo,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);

  // In-chat search
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Real Authentic Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveVolumeLevel, setLiveVolumeLevel] = useState(0); // 0-100 real-time mic volume
  const recorderRef = useRef<HighVolumeVoiceRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Voice note playback tracking with Volume Boost (Voz Alta: 100%, 180%, 250%)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<Record<string, number>>({});
  const [voiceVolumeBoost, setVoiceVolumeBoost] = useState<Record<string, number>>({});

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🌈 Neon Cyan & Orange Rainbow Wallpaper State (shows at chat start and repeats every 3 minutes)
  const isNeonWallpaper = userSettings.wallpaper === 'neon_rainbow' || userSettings.neonRainbowEnabled !== false;
  const [showNeonFlash, setShowNeonFlash] = useState(false);
  const [showNeonToast, setShowNeonToast] = useState(false);
  const [neonToastMessage, setNeonToastMessage] = useState('🌈 Fondo Neón: Resplandor de Inicio (Celeste y Naranja)');
  const [secondsUntilNextFlash, setSecondsUntilNextFlash] = useState(180);
  const neonIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const neonCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerNeonFlash = useCallback((reason: 'start' | 'interval' | 'manual') => {
    setShowNeonFlash(true);
    setShowNeonToast(true);
    setSecondsUntilNextFlash(180);

    if (reason === 'start') {
      setNeonToastMessage('🌈 Fondo Neón: Resplandor de Inicio (Celeste y Naranja)');
    } else if (reason === 'interval') {
      setNeonToastMessage('✨ Resplandor Neón de cada 3 minutos (Celeste y Naranja)');
    } else {
      setNeonToastMessage('⚡ Destello Neón Manual (Celeste y Naranja)');
    }

    // Hide flash animation after 4.5 seconds
    const flashTimer = setTimeout(() => {
      setShowNeonFlash(false);
    }, 4500);

    // Hide toast banner after 5 seconds
    const toastTimer = setTimeout(() => {
      setShowNeonToast(false);
    }, 5000);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(toastTimer);
    };
  }, []);

  // Show once at chat start, and set recurring timer every 3 minutes (180,000 ms)
  useEffect(() => {
    if (!isNeonWallpaper) return;

    // 1. Muestra una vez al inicio del chat
    const startTimer = setTimeout(() => {
      triggerNeonFlash('start');
    }, 350);

    // 2. Se muestra cada 3 minutos periódicamente (180 segundos)
    const intervalMinutes = userSettings.neonRainbowIntervalMinutes || 3;
    const intervalMs = intervalMinutes * 60 * 1000;

    neonIntervalRef.current = setInterval(() => {
      triggerNeonFlash('interval');
    }, intervalMs);

    // Contador regresivo para mostrar al usuario
    neonCountdownRef.current = setInterval(() => {
      setSecondsUntilNextFlash((prev) => (prev <= 1 ? 180 : prev - 1));
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      if (neonIntervalRef.current) clearInterval(neonIntervalRef.current);
      if (neonCountdownRef.current) clearInterval(neonCountdownRef.current);
    };
  }, [chat.id, isNeonWallpaper, triggerNeonFlash, userSettings.neonRainbowIntervalMinutes]);

  const isDark = userSettings.theme === 'dark';
  // Custom chat font/letters color from User Settings
  const customFontColorHex = getFontColorHex(userSettings.chatFontColor);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chat.typingStatus]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      voicePlayer.stopCurrent();
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
    };
  }, []);

  // Voice note recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setLiveVolumeLevel(25);

    const recorder = new HighVolumeVoiceRecorder();
    recorderRef.current = recorder;

    // Start natural microphone recording without artificial pitch alteration
    await recorder.start({
      onVolumeChange: (vol) => setLiveVolumeLevel(vol),
    });
  };

  const handleCancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setLiveVolumeLevel(0);
  };

  const handleFinishRecording = async () => {
    if (!isRecording) return;
    
    let result = null;
    if (recorderRef.current) {
      result = await recorderRef.current.stop();
      recorderRef.current = null;
    }

    const duration = result?.duration || Math.max(recordingSeconds, 2);
    // Real waveform from microphone or simulated fallback
    const waveform = result?.waveform || Array.from({ length: 24 }, () => Math.floor(Math.random() * 70) + 20);

    onSendVoiceNote(duration, waveform, result?.audioUrl);
    setIsRecording(false);
    setRecordingSeconds(0);
    setLiveVolumeLevel(0);
  };

  const toggleVoicePlayback = (message: Message) => {
    const messageId = message.id;
    if (playingVoiceId === messageId) {
      // Pause / Stop
      voicePlayer.stopCurrent();
      setPlayingVoiceId(null);
    } else {
      // Stop previous
      voicePlayer.stopCurrent();
      setPlayingVoiceId(messageId);

      const boost = voiceVolumeBoost[messageId] || 1.8; // Default 180% Voz Alta
      const speed = playbackSpeed[messageId] || 1;
      const duration = message.voiceDuration || 20;

      voicePlayer.playVoiceNote({
        messageId,
        audioUrl: message.mediaUrl,
        duration,
        volumeBoost: boost,
        playbackRate: speed,
        onProgress: (current) => {
          setPlaybackProgress((prev) => ({ ...prev, [messageId]: current }));
        },
        onEnded: () => {
          setPlayingVoiceId(null);
          setPlaybackProgress((prev) => ({ ...prev, [messageId]: 0 }));
        },
      });
    }
  };

  const cyclePlaybackSpeed = (messageId: string) => {
    const current = playbackSpeed[messageId] || 1;
    const nextSpeed = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
    setPlaybackSpeed((prev) => ({ ...prev, [messageId]: nextSpeed }));
    if (playingVoiceId === messageId) {
      voicePlayer.setPlaybackRate(nextSpeed);
    }
  };

  const cycleVolumeBoost = (messageId: string) => {
    const current = voiceVolumeBoost[messageId] || 1.8;
    // Cycle between: 1.0 (100%), 1.8 (180% Voz Alta), 2.5 (250% Super Alta)
    const nextBoost = current === 1.8 ? 2.5 : current === 2.5 ? 1.0 : 1.8;
    setVoiceVolumeBoost((prev) => ({ ...prev, [messageId]: nextBoost }));
    if (playingVoiceId === messageId) {
      voicePlayer.setVolumeBoost(nextBoost);
    }
  };

  const handleSendMessageSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const extra: Partial<Message> = {};
    if (replyingTo) {
      extra.replyTo = {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        text: replyingTo.type === 'image' ? '📷 Foto' : replyingTo.type === 'voice' ? '🎤 Mensaje de voz' : replyingTo.text,
      };
    }

    onSendMessage(inputText.trim(), 'text', extra);
    setInputText('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && userSettings.enterIsSend) {
      e.preventDefault();
      handleSendMessageSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isImage) {
        onSendMessage('Foto enviada', 'image', {
          mediaUrl: dataUrl,
          mediaCaption: file.name,
        });
      } else if (isVideo) {
        onSendMessage('🎬 Video enviado', 'video', {
          mediaUrl: dataUrl,
          mediaCaption: file.name,
        });
      } else {
        const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        onSendMessage(file.name, 'document', {
          mediaFileName: file.name,
          mediaFileSize: sizeFormatted,
        });
      }
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  // Filter messages if search is active
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden select-none">
      {/* 1. Header Bar */}
      <header 
        className={`flex items-center justify-between px-4 py-2.5 z-20 border-b select-none transition-colors shrink-0 ${
          isDark 
            ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]' 
            : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile view */}
          <button 
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 text-[#aebac1] hover:text-white rounded-full"
            title="Volver a chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact avatar */}
          <button 
            onClick={onOpenContactInfo}
            className="relative shrink-0 focus:outline-none"
          >
            {chat.id === 'chat_whatsapp' ? (
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md">
                <WhatsAppLogo size={24} variant="white" />
              </div>
            ) : (
              <img
                src={chat.avatar}
                alt={chat.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
            )}
          </button>

          {/* Name & status */}
          <div 
            onClick={onOpenContactInfo}
            className="flex flex-col min-w-0 cursor-pointer"
          >
            <h2 className="text-sm font-semibold truncate leading-tight">
              {chat.name}
            </h2>
            <span className="text-xs truncate text-[#8696a0] leading-tight">
              {chat.typingStatus === 'typing' ? (
                <span className="text-[#00a884] font-medium">escribiendo...</span>
              ) : chat.typingStatus === 'recording' ? (
                <span className="text-[#00a884] font-medium">grabando audio...</span>
              ) : chat.isOnline ? (
                <span className="text-[#00a884]">en línea</span>
              ) : (
                chat.lastSeen || (chat.isGroup ? `${chat.groupMembers?.length || 4} miembros` : 'desconectado')
              )}
            </span>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Video call */}
          <button
            onClick={() => onStartCall('video')}
            title="Videollamada"
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#111b21] text-[#aebac1]' : 'hover:bg-[#e9edef] text-[#54656f]'
            }`}
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Voice call */}
          <button
            onClick={() => onStartCall('voice')}
            title="Llamada de voz"
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#111b21] text-[#aebac1]' : 'hover:bg-[#e9edef] text-[#54656f]'
            }`}
          >
            <Phone className="w-5 h-5" />
          </button>

          <div className={`h-5 w-[1px] ${isDark ? 'bg-[#2a3942]' : 'bg-[#d1d7db]'}`} />

          {/* Neon Rainbow Status / Manual Trigger Button */}
          {isNeonWallpaper && (
            <button
              onClick={() => triggerNeonFlash('manual')}
              title={`Fondo Neón Celeste y Naranja (Activo). Se muestra al entrar y cada 3 minutos. Próximo destello en ${Math.floor(secondsUntilNextFlash / 60)}:${(secondsUntilNextFlash % 60).toString().padStart(2, '0')}. ¡Haz clic para ver el destello ahora!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00f0ff]/20 to-[#ff6d00]/20 hover:from-[#00f0ff]/30 hover:to-[#ff6d00]/30 border border-[#00f0ff]/40 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer group shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline bg-gradient-to-r from-[#00f0ff] via-white to-[#ff8c00] bg-clip-text text-transparent font-bold">
                Neón 3 min
              </span>
            </button>
          )}

          {/* Search inside chat */}
          <button
            onClick={() => setIsSearchingInChat(!isSearchingInChat)}
            title="Buscar en la conversación"
            className={`p-2 rounded-full transition-colors ${
              isSearchingInChat 
                ? 'text-[#00a884]' 
                : isDark ? 'hover:bg-[#111b21] text-[#aebac1]' : 'hover:bg-[#e9edef] text-[#54656f]'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              title="Más opciones"
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#111b21] text-[#aebac1]' : 'hover:bg-[#e9edef] text-[#54656f]'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showChatMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowChatMenu(false)} 
                />
                <div 
                  className={`absolute right-0 top-10 w-48 py-2 rounded-xl shadow-xl z-40 text-sm border ${
                    isDark ? 'bg-[#233138] border-[#2f3b43] text-[#d1d7db]' : 'bg-white border-[#e9edef] text-[#3b4a54]'
                  }`}
                >
                  <button
                    onClick={() => {
                      onOpenContactInfo();
                      setShowChatMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <Info className="w-4 h-4 text-emerald-500" />
                    Info. del contacto
                  </button>
                  <button
                    onClick={() => {
                      onSendMessage('📍 Ubicación compartida', 'location', {
                        locationName: 'Jardines de San Francisco',
                        locationAddress: 'Calle Mayor 120, Madrid / SF',
                      });
                      setShowChatMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Compartir ubicación
                  </button>
                  <button
                    onClick={() => {
                      setShowPollModal(true);
                      setShowChatMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-emerald-500" />
                    Crear encuesta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* In-Chat Search Bar Dropdown */}
      {isSearchingInChat && (
        <div 
          className={`flex items-center gap-2 px-4 py-2 border-b z-20 ${
            isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-white border-[#e9edef]'
          }`}
        >
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            placeholder="Buscar en esta conversación..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            autoFocus
            className={`w-full bg-transparent text-sm focus:outline-none ${
              isDark ? 'text-white placeholder-[#8696a0]' : 'text-slate-900 placeholder-[#667781]'
            }`}
          />
          {chatSearchQuery && (
            <span className="text-xs text-[#8696a0] whitespace-nowrap">
              {displayedMessages.length} encontrados
            </span>
          )}
          <button 
            onClick={() => {
              setIsSearchingInChat(false);
              setChatSearchQuery('');
            }}
            className="p-1 rounded-full text-[#8696a0] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Messages Canvas */}
      <div 
        className={`flex-1 overflow-y-auto px-4 py-3 relative transition-colors duration-700 ${
          isNeonWallpaper 
            ? 'whatsapp-chat-bg-neon-rainbow' 
            : isDark 
            ? 'whatsapp-chat-bg-dark' 
            : 'whatsapp-chat-bg-light'
        }`}
      >
        {/* Neon Flash Sweep Overlay (se muestra una vez al inicio y cada 3 minutos) */}
        {showNeonFlash && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden neon-flash-sweep">
            <div className="w-full h-full bg-gradient-to-br from-[#00f0ff]/30 via-[#ff007f]/15 to-[#ff6d00]/35 mix-blend-screen" />
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#00f0ff]/40 to-transparent blur-xl" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#ff6d00]/40 to-transparent blur-xl" />
          </div>
        )}

        {/* Floating Neon Rainbow Notification Pill on Trigger */}
        {showNeonToast && (
          <div className="sticky top-2 z-30 flex justify-center pointer-events-none animate-neon-banner">
            <div className="px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-[#00f0ff]/60 shadow-xl shadow-cyan-500/25 text-white text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
              <span className="bg-gradient-to-r from-[#00f0ff] via-white to-[#ff8c00] bg-clip-text text-transparent drop-shadow">
                {neonToastMessage}
              </span>
            </div>
          </div>
        )}

        {/* End-to-End Encryption Banner */}
        <div className="flex justify-center my-3">
          <div 
            className={`max-w-md text-center text-[11px] leading-relaxed px-4 py-2 rounded-lg shadow-xs ${
              isDark 
                ? 'bg-[#182229] text-[#ffd279] border border-[#ffd279]/15' 
                : 'bg-[#ffeecd] text-[#54656f] border border-[#e6d0a7]'
            }`}
          >
            🔒 Los mensajes y llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.
          </div>
        </div>

        {/* Date separator pill */}
        <div className="flex justify-center my-2">
          <span 
            className={`text-[11px] font-medium uppercase px-3 py-1 rounded-md shadow-xs ${
              isDark ? 'bg-[#182229] text-[#8696a0]' : 'bg-white/90 text-[#54656f]'
            }`}
          >
            Hoy
          </span>
        </div>

        {/* Messages List */}
        <div className="flex flex-col gap-2">
          {displayedMessages.map((msg) => {
            const isUser = msg.senderId === 'user';
            const isHovered = hoveredMessageId === msg.id;
            const isDropdownOpen = activeMessageDropdown === msg.id;

            return (
              <div
                key={msg.id}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMessageId(null);
                  if (!isDropdownOpen) setActiveReactionPickerId(null);
                }}
                className={`group relative flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%] ${
                  isUser ? 'self-end' : 'self-start'
                }`}
              >
                {/* Bubble Container */}
                <div
                  className={`relative px-3 py-2 rounded-xl text-sm shadow-xs transition-shadow ${
                    isUser
                      ? isDark
                        ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                        : 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : isDark
                        ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                        : 'bg-white text-[#111b21] rounded-tl-none'
                  }`}
                >
                  {/* Sender Name in group chats */}
                  {chat.isGroup && !isUser && (
                    <div className="text-xs font-semibold text-[#00a884] mb-1">
                      {msg.senderName}
                    </div>
                  )}

                  {/* Quoted reply snippet */}
                  {msg.replyTo && (
                    <div 
                      className={`text-xs p-2 mb-1.5 rounded-md border-l-4 ${
                        isUser 
                          ? isDark ? 'bg-[#025142] border-[#00a884]' : 'bg-[#c5f0be] border-[#008069]'
                          : isDark ? 'bg-[#182229] border-[#00a884]' : 'bg-[#f0f2f5] border-[#008069]'
                      }`}
                    >
                      <div className="font-semibold text-[#00a884]">
                        {msg.replyTo.senderName}
                      </div>
                      <div 
                        className="truncate opacity-90"
                        style={customFontColorHex ? { color: customFontColorHex } : undefined}
                      >
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* 1. Voice Note Message Bubble */}
                  {msg.type === 'voice' && (
                    <div className="flex items-center gap-3 py-1 min-w-[260px] sm:min-w-[280px]">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => toggleVoicePlayback(msg)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                          isUser ? 'bg-[#00a884] text-[#111b21]' : 'bg-[#00a884] text-white'
                        }`}
                        title={playingVoiceId === msg.id ? 'Pausar nota de voz' : 'Reproducir con voz alta'}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Waveform & Duration */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[2px] h-7 mb-1">
                          {(msg.voiceWaveform || [20, 30, 60, 80, 50, 40, 70, 90, 60, 40, 30, 50, 70, 40]).map((h, idx) => {
                            const currentSec = playbackProgress[msg.id] || 0;
                            const totalSec = msg.voiceDuration || 20;
                            const progressRatio = currentSec / totalSec;
                            const isPlayed = idx / 24 <= progressRatio;

                            return (
                              <span
                                key={idx}
                                style={{ height: `${Math.max(15, h)}%` }}
                                className={`w-1 rounded-full transition-colors ${
                                  isPlayed
                                    ? isUser ? 'bg-white' : 'bg-[#00a884]'
                                    : isUser ? 'bg-emerald-300/40' : 'bg-[#8696a0]/50'
                                }`}
                              />
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#8696a0]">
                          <span className="tabular-nums font-mono">
                            {playingVoiceId === msg.id
                              ? `0:${Math.floor(playbackProgress[msg.id] || 0).toString().padStart(2, '0')}`
                              : `0:${(msg.voiceDuration || 20).toString().padStart(2, '0')}`}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Volume Boost Button (Voz Alta) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cycleVolumeBoost(msg.id);
                              }}
                              title="Toca para cambiar nivel de volumen: 100%, 180% Voz Alta o 250% Super Alta"
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                (voiceVolumeBoost[msg.id] || 1.8) > 1.0
                                  ? isUser 
                                    ? 'bg-black/20 text-white font-bold' 
                                    : 'bg-[#00a884]/20 text-[#00a884] font-bold'
                                  : 'text-[#8696a0] hover:text-white'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>
                                {(voiceVolumeBoost[msg.id] || 1.8) === 2.5
                                  ? '250%'
                                  : (voiceVolumeBoost[msg.id] || 1.8) === 1.8
                                  ? 'Voz Alta'
                                  : '100%'}
                              </span>
                            </button>

                            {/* Speed Selector */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cyclePlaybackSpeed(msg.id);
                              }}
                              className={`font-bold px-1 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                                isUser ? 'hover:bg-black/10' : 'hover:bg-white/10'
                              }`}
                              title="Velocidad de reproducción"
                            >
                              {playbackSpeed[msg.id] || 1}x
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mic icon with sound wave badge */}
                      <div className="relative shrink-0 flex flex-col items-center">
                        <Mic className="w-4 h-4 text-[#00a884]" />
                      </div>
                    </div>
                  )}

                  {/* 2. Image Message Bubble */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mb-1">
                      <div 
                        onClick={() => setPreviewImage(msg.mediaUrl || null)}
                        className="rounded-lg overflow-hidden cursor-pointer max-h-72 group/img relative"
                      >
                        <img
                          src={msg.mediaUrl}
                          alt={msg.mediaCaption || 'Shared image'}
                          referrerPolicy="no-referrer"
                          className="w-full object-cover rounded-lg group-hover/img:scale-102 transition-transform"
                        />
                      </div>
                      {msg.mediaCaption && (
                        <p 
                          className="mt-1 text-sm leading-relaxed"
                          style={customFontColorHex ? { color: customFontColorHex } : undefined}
                        >
                          {msg.mediaCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 2.5 Video Message Bubble */}
                  {msg.type === 'video' && msg.mediaUrl && msg.mediaUrl.trim().length > 0 && (
                    <div className="mb-1">
                      <div className="rounded-lg overflow-hidden max-h-80 bg-black relative flex items-center justify-center">
                        <video
                          src={msg.mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          onError={(e) => {
                            e.preventDefault?.();
                            e.stopPropagation?.();
                          }}
                          className="w-full max-h-72 object-contain rounded-lg"
                        />
                      </div>
                      {msg.mediaCaption && msg.mediaCaption !== 'Video enviado' && msg.mediaCaption !== '🎬 Video enviado' && (
                        <p 
                          className="mt-1 text-sm leading-relaxed"
                          style={customFontColorHex ? { color: customFontColorHex } : undefined}
                        >
                          {msg.mediaCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Document Message Bubble */}
                  {msg.type === 'document' && (
                    <div 
                      className={`flex items-center gap-3 p-2.5 rounded-lg mb-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-[#182229] hover:bg-[#151e24]' : 'bg-[#f0f2f5] hover:bg-[#e4e7e9]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {msg.mediaFileName || msg.text}
                        </p>
                        <p className="text-[11px] text-[#8696a0]">
                          {msg.mediaFileSize || '2.4 MB'} · PDF document
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-[#8696a0] hover:text-[#00a884]" />
                    </div>
                  )}

                  {/* 4. Location Message Bubble */}
                  {msg.type === 'location' && (
                    <div className="mb-1">
                      <div className="w-full h-32 rounded-lg bg-[#2a3942] relative overflow-hidden flex items-center justify-center border border-[#3b4a54]">
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00a884_1px,transparent_1px)] [background-size:12px_12px]" />
                        <div className="relative flex flex-col items-center">
                          <MapPin className="w-8 h-8 text-red-500 drop-shadow animate-bounce" />
                          <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-full mt-1">
                            {msg.locationName || 'Live Location'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold">{msg.locationName}</p>
                        <p className="text-[11px] text-[#8696a0] truncate">{msg.locationAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* 5. Poll Message Bubble */}
                  {msg.type === 'poll' && msg.pollData && (
                    <div className="min-w-[260px] py-1">
                      <div className="flex items-center gap-1.5 mb-2 font-semibold text-sm">
                        <BarChart2 className="w-4 h-4 text-[#00a884]" />
                        <span>{msg.pollData.question}</span>
                      </div>

                      <div className="space-y-2">
                        {msg.pollData.options.map((opt) => {
                          const totalVotes = msg.pollData!.options.reduce((acc, o) => acc + o.votes.length, 0);
                          const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                          const hasVoted = opt.votes.includes('user');

                          return (
                            <button
                              key={opt.id}
                              onClick={() => onVotePoll(msg.id, opt.id)}
                              className={`w-full text-left p-2 rounded-lg border transition-colors relative overflow-hidden ${
                                hasVoted
                                  ? 'border-[#00a884] bg-[#00a884]/10'
                                  : isDark ? 'border-[#2f3b43] hover:bg-[#182229]' : 'border-[#e9edef] hover:bg-[#f5f6f6]'
                              }`}
                            >
                              {/* Background percentage fill */}
                              <div
                                style={{ width: `${percentage}%` }}
                                className={`absolute left-0 top-0 bottom-0 opacity-20 pointer-events-none transition-all duration-300 ${
                                  hasVoted ? 'bg-[#00a884]' : 'bg-slate-400'
                                }`}
                              />

                              <div className="relative flex items-center justify-between z-10 text-xs">
                                <span className="font-medium flex items-center gap-1.5">
                                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    hasVoted ? 'border-[#00a884] bg-[#00a884] text-white' : 'border-[#8696a0]'
                                  }`}>
                                    {hasVoted && <Check className="w-2.5 h-2.5" />}
                                  </span>
                                  {opt.text}
                                </span>
                                <span className="font-mono tabular-nums text-[#8696a0]">
                                  {percentage}% ({opt.votes.length})
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Standard Text Body */}
                  {msg.type === 'text' && (
                    <p 
                      className="whitespace-pre-wrap break-words leading-relaxed select-text"
                      style={customFontColorHex ? { color: customFontColorHex } : undefined}
                    >
                      {msg.text}
                    </p>
                  )}

                  {/* Message Bottom Metadata (Timestamp, Star, Status ticks) */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-[#8696a0] select-none float-right ml-3">
                    {msg.isStarred && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    )}
                    <span className="tabular-nums">{msg.timestamp}</span>
                    {isUser && (
                      <span className="ml-0.5">
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating Reactions Summary Pill */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`flex items-center gap-1 -mt-2 px-1.5 py-0.5 rounded-full shadow-md text-xs border ${
                    isDark ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                  }`}>
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="flex items-center gap-0.5">
                        <span>{r.emoji}</span>
                        {r.count > 1 && <span className="text-[10px] text-[#8696a0]">{r.count}</span>}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Quick Actions (Reaction picker & dropdown toggle) */}
                {(isHovered || isDropdownOpen) && (
                  <div 
                    className={`absolute top-0 ${isUser ? 'right-full mr-1' : 'left-full ml-1'} flex items-center gap-0.5 z-30`}
                  >
                    {/* Emoji Reaction button */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg.id ? null : msg.id)}
                        className={`p-1 rounded-full shadow-md transition-colors ${
                          isDark ? 'bg-[#202c33] text-[#8696a0] hover:text-white' : 'bg-white text-[#54656f] hover:text-slate-900'
                        }`}
                        title="Reaccionar"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {/* Reaction bar popup */}
                      {activeReactionPickerId === msg.id && (
                        <div 
                          className={`absolute bottom-full mb-1 flex items-center gap-1.5 px-2 py-1.5 rounded-full shadow-2xl z-50 border ${
                            isDark ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                          }`}
                        >
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onReactMessage(msg.id, emoji);
                                setActiveReactionPickerId(null);
                              }}
                              className="text-lg hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bubble dropdown trigger */}
                    <button
                      onClick={() => setActiveMessageDropdown(isDropdownOpen ? null : msg.id)}
                      className={`p-1 rounded-full shadow-md transition-colors ${
                        isDark ? 'bg-[#202c33] text-[#8696a0] hover:text-white' : 'bg-white text-[#54656f] hover:text-slate-900'
                      }`}
                      title="Más opciones"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setActiveMessageDropdown(null)} 
                        />
                        <div 
                          className={`absolute top-6 ${isUser ? 'right-0' : 'left-0'} w-40 py-1 rounded-lg shadow-xl z-40 text-xs border ${
                            isDark ? 'bg-[#233138] border-[#2f3b43] text-[#d1d7db]' : 'bg-white border-[#e9edef] text-[#3b4a54]'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setReplyingTo(msg);
                              setActiveMessageDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                              isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                            }`}
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                            Responder
                          </button>
                          <button
                            onClick={() => {
                              onStarMessage(msg.id);
                              setActiveMessageDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                              isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            {msg.isStarred ? 'Quitar de destacados' : 'Destacar'}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text || '');
                              setActiveMessageDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                              isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f5f6f6]'
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </button>
                          <button
                            onClick={() => {
                              onDeleteMessage(msg.id);
                              setActiveMessageDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-red-400 border-t ${
                              isDark ? 'border-[#2f3b43] hover:bg-[#182229]' : 'border-[#e9edef] hover:bg-[#f5f6f6]'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar mensaje
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Reply Preview Bar */}
      {replyingTo && (
        <div 
          className={`flex items-center justify-between px-4 py-2 border-t z-20 ${
            isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
          }`}
        >
          <div className="border-l-4 border-[#00a884] pl-2 min-w-0">
            <span className="text-xs font-semibold text-[#00a884]">
              Respondiendo a {replyingTo.senderName}
            </span>
            <p className="text-xs text-[#8696a0] truncate">
              {replyingTo.text}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-[#8696a0] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Bottom Input Bar */}
      <footer 
        className={`px-3 py-2 z-20 border-t select-none transition-colors shrink-0 ${
          isDark 
            ? 'bg-[#202c33] border-[#222e35]' 
            : 'bg-[#f0f2f5] border-[#e9edef]'
        }`}
      >
        {isRecording ? (
          /* Live Voice Recording Bar with High-Volume Booster */
          <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-black/10 dark:bg-black/30 border border-[#00a884]/30 animate-in fade-in duration-200">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancelRecording}
              className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              title="Cancelar y descartar grabación"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Central Recording Indicator with Live Waveform */}
            <div className="flex-1 flex items-center justify-center gap-3 px-2 overflow-hidden">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0 shadow-xs shadow-red-500/50" />
              
              <span className="text-sm font-mono tabular-nums text-red-500 font-bold shrink-0">
                0:{recordingSeconds.toString().padStart(2, '0')}
              </span>

              {/* Live Audio Visualizer Bars reacting to user voice */}
              <div className="flex items-center gap-1 h-6 px-2">
                {[0.4, 0.7, 1.0, 1.3, 0.8, 1.2, 0.5, 0.9, 1.4, 0.6, 1.1, 0.7].map((factor, i) => {
                  const dynamicHeight = Math.min(100, Math.max(18, Math.round((liveVolumeLevel || 30) * factor)));
                  return (
                    <span
                      key={i}
                      style={{ height: `${dynamicHeight}%` }}
                      className="w-1 bg-[#00a884] rounded-full transition-all duration-75"
                    />
                  );
                })}
              </div>

              {/* Voz Real Badge */}
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] text-[11px] font-semibold shrink-0">
                <Mic className="w-3.5 h-3.5" />
                <span>Audio Real</span>
              </div>
            </div>

            {/* Send Voice Note Button */}
            <button
              type="button"
              onClick={handleFinishRecording}
              className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#02906f] transition-transform active:scale-95 shadow-md shadow-[#00a884]/20 cursor-pointer shrink-0"
              title="Enviar nota de voz real"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        ) : (
          /* Standard Text & Attachment Input */
          <div className="flex items-end gap-2">
            {/* Emoji toggle */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#111b21] text-[#8696a0] hover:text-white' : 'hover:bg-[#e9edef] text-[#54656f]'
                }`}
                title="Emojis y stickers"
              >
                <Smile className="w-6 h-6" />
              </button>

              {/* Emoji popover */}
              {showEmojiPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowEmojiPicker(false)} 
                  />
                  <div 
                    className={`absolute bottom-12 left-0 w-72 p-3 rounded-2xl shadow-2xl z-40 border ${
                      isDark ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#8696a0] mb-2">Emojis</div>
                    <div className="grid grid-cols-7 gap-1 text-xl">
                      {['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','🥹','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🫣','🫢','🫡','🤫','🫠','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤔','🫢','🫣','👍','👎','👏','🙌','👐','🤲','🤝','🙏','✍️','💪','🦾','🤙','👌','🤌','✌️','🤞','🫰','🤟','🤘','🫵','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💖','✨','🔥','💯','🎉','🎊','🍕','🍔','🍟','☕️','🍻','🚀','🏖️'].map((em, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + em);
                          }}
                          className="hover:scale-125 transition-transform p-1 rounded"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Attachment clip */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#111b21] text-[#8696a0] hover:text-white' : 'hover:bg-[#e9edef] text-[#54656f]'
                }`}
                title="Adjuntar archivo o contenido"
              >
                <Paperclip className="w-5 h-5 rotate-45" />
              </button>

              {/* Attachment options dropdown */}
              {showAttachMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowAttachMenu(false)} 
                  />
                  <div 
                    className={`absolute bottom-12 left-0 w-48 py-2 rounded-2xl shadow-2xl z-40 border ${
                      isDark ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                    }`}
                  >
                    <label className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-xs ${
                      isDark ? 'hover:bg-[#182229] text-[#d1d7db]' : 'hover:bg-[#f5f6f6] text-[#3b4a54]'
                    }`}>
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>Fotos y videos</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <label className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-xs ${
                      isDark ? 'hover:bg-[#182229] text-[#d1d7db]' : 'hover:bg-[#f5f6f6] text-[#3b4a54]'
                    }`}>
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Documento</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => {
                        setShowPollModal(true);
                        setShowAttachMenu(false);
                      }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2 text-xs ${
                        isDark ? 'hover:bg-[#182229] text-[#d1d7db]' : 'hover:bg-[#f5f6f6] text-[#3b4a54]'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      <span>Encuesta</span>
                    </button>

                    <button
                      onClick={() => {
                        onSendMessage('📍 Ubicación actual compartida', 'location', {
                          locationName: 'Mercado de San Francisco',
                          locationAddress: 'Edificio Central 100, San Francisco / Madrid',
                        });
                        setShowAttachMenu(false);
                      }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2 text-xs ${
                        isDark ? 'hover:bg-[#182229] text-[#d1d7db]' : 'hover:bg-[#f5f6f6] text-[#3b4a54]'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span>Ubicación</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Text input area */}
            <div 
              className={`flex-1 flex items-center px-4 py-1.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-[#2a3942] border-transparent focus-within:border-[#00a884]' 
                  : 'bg-white border-transparent focus-within:border-[#008069]'
              }`}
            >
              <textarea
                rows={1}
                placeholder="Escribe un mensaje"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={customFontColorHex ? { color: customFontColorHex } : undefined}
                className={`w-full max-h-24 bg-transparent text-sm resize-none focus:outline-none placeholder:text-xs leading-normal ${
                  isDark ? 'text-white placeholder-[#8696a0]' : 'text-slate-900 placeholder-[#54656f]'
                }`}
              />
            </div>

            {/* Mic or Send button */}
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessageSubmit()}
                className="w-10 h-10 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center hover:bg-[#02906f] transition-transform active:scale-95 shrink-0"
                title="Enviar mensaje"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isDark ? 'hover:bg-[#111b21] text-[#8696a0] hover:text-white' : 'hover:bg-[#e9edef] text-[#54656f]'
                }`}
                title="Mantén presionado para grabar mensaje de voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </footer>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-red-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showPollModal && (
        <CreatePollModal
          isDark={isDark}
          onClose={() => setShowPollModal(false)}
          onCreate={(pollData) => {
            onSendMessage(pollData.question, 'poll', { pollData });
            setShowPollModal(false);
          }}
        />
      )}
    </div>
  );
};

interface CreatePollModalProps {
  isDark: boolean;
  onClose: () => void;
  onCreate: (poll: PollData) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isDark, onClose, onCreate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0)
      .map((text, i) => ({
        id: `opt_${Date.now()}_${i}`,
        text,
        votes: [],
      }));

    if (!question.trim() || validOptions.length < 2) return;

    onCreate({
      question: question.trim(),
      options: validOptions,
      allowMultiple,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
          isDark ? 'bg-[#222e35] border-[#2f3b43] text-white' : 'bg-white border-[#e9edef] text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-500" />
            Crear Encuesta
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white" title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Pregunta de la encuesta
            </label>
            <input
              type="text"
              required
              placeholder="Haz una pregunta..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                isDark ? 'bg-[#111b21] border-[#2f3b43] focus:border-[#00a884]' : 'bg-[#f0f2f5] border-[#e9edef]'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              Opciones de respuesta
            </label>
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Opción ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                  isDark ? 'bg-[#111b21] border-[#2f3b43] focus:border-[#00a884]' : 'bg-[#f0f2f5] border-[#e9edef]'
                }`}
              />
            ))}
            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-[#00a884] font-medium hover:underline pt-1"
              >
                + Añadir opción
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Permitir varias respuestas</span>
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#00a884] text-[#111b21] hover:bg-[#02906f]"
            >
              Publicar Encuesta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
