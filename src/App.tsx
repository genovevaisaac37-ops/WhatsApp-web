/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Chat, 
  Message, 
  ContactStatus, 
  StatusItem,
  CallLog, 
  UserSettings, 
  SidebarTab,
  PollData 
} from './types/whatsapp.ts';

import {
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STATUSES,
  INITIAL_CALL_LOGS,
  INITIAL_USER_SETTINGS,
} from './data/seedData.ts';

import { SidebarRail } from './components/SidebarRail.tsx';
import { ChatList } from './components/ChatList.tsx';
import { ChatArea } from './components/ChatArea.tsx';
import { EmptyChatState } from './components/EmptyChatState.tsx';
import { StatusList } from './components/StatusList.tsx';
import { StatusViewer } from './components/StatusViewer.tsx';
import { CallsList } from './components/CallsList.tsx';
import { CallModal } from './components/CallModal.tsx';
import { ChannelsTab } from './components/ChannelsTab.tsx';
import { ReelsTab } from './components/ReelsTab.tsx';
import { StarredMessagesDrawer } from './components/StarredMessagesDrawer.tsx';
import { SettingsDrawer } from './components/SettingsDrawer.tsx';
import { ContactInfoDrawer } from './components/ContactInfoDrawer.tsx';
import { ProfileEditorModal } from './components/ProfileEditorModal.tsx';
import { InitialLoadingScreen } from './components/InitialLoadingScreen.tsx';
import { PhoneSearchModal } from './components/PhoneSearchModal.tsx';
import { 
  MessageSquare, 
  CircleDot, 
  Clapperboard, 
  Phone, 
  Settings 
} from 'lucide-react';

import { playSendSound, playReceiveSound } from './utils/soundEffects.ts';

const STORAGE_KEYS = {
  CHATS: 'whatsapp_web_chats_v1',
  MESSAGES: 'whatsapp_web_messages_v1',
  STATUSES: 'whatsapp_web_statuses_v1',
  CALLS: 'whatsapp_web_calls_v1',
  SETTINGS: 'whatsapp_web_settings_v1',
};

export default function App() {
  // Load state from localStorage or seed
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_USER_SETTINGS;
    } catch {
      return INITIAL_USER_SETTINGS;
    }
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [statuses, setStatuses] = useState<ContactStatus[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUSES);
      return saved ? JSON.parse(saved) : INITIAL_STATUSES;
    } catch {
      return INITIAL_STATUSES;
    }
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALLS);
      return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
    } catch {
      return INITIAL_CALL_LOGS;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<SidebarTab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_sara');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Active status story viewer
  const [viewingStatus, setViewingStatus] = useState<ContactStatus | null>(null);

  // Active ongoing voice / video call modal
  const [activeCall, setActiveCall] = useState<{ chat: Chat; type: 'voice' | 'video' } | null>(null);

  // Profile creation & edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Phone search and direct chat modal
  const [showPhoneSearchModal, setShowPhoneSearchModal] = useState(false);

  // Initial Web Loading Splash Screen
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(userSettings));
    } catch { /* ignore */ }
  }, [userSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch { /* ignore */ }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
    } catch { /* ignore */ }
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(callLogs));
    } catch { /* ignore */ }
  }, [callLogs]);

  // Apply dark or light class to root
  const isDark = userSettings.theme === 'dark';

  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const activeMessages = useMemo(() => {
    if (!activeChatId) return [];
    return messages[activeChatId] || [];
  }, [messages, activeChatId]);

  // Aggregate metrics
  const unreadCountTotal = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [chats]);

  const hasUnreadStatus = useMemo(() => {
    return statuses.some((s) => !s.allViewed);
  }, [statuses]);

  const missedCallsCount = useMemo(() => {
    return callLogs.filter((c) => c.direction === 'missed').length;
  }, [callLogs]);

  // List of all starred messages across chats
  const starredMessagesList = useMemo(() => {
    const list: { message: Message; chatName: string }[] = [];
    Object.entries(messages).forEach(([chatId, msgs]) => {
      const chat = chats.find((c) => c.id === chatId);
      const chatName = chat ? chat.name : 'Unknown';
      msgs.forEach((m) => {
        if (m.isStarred) {
          list.push({ message: m, chatName });
        }
      });
    });
    return list;
  }, [messages, chats]);

  // Format current time
  const getCurrentTimeString = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Automated smart reply simulation
  const triggerAutoReply = useCallback((targetChatId: string, userText: string) => {
    const targetChat = chats.find((c) => c.id === targetChatId);
    if (!targetChat || targetChat.id === 'chat_whatsapp') return;

    // 1. Show contact "typing..." status after 1.2s
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId ? { ...c, typingStatus: 'typing' } : c
        )
      );

      // 2. Deliver message after 2.8s
      setTimeout(() => {
        const time = getCurrentTimeString();
        let replyText = '¡Entendido! Me parece perfecto 👍';
        const lower = userText.toLowerCase();

        if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hello') || lower.includes('hi')) {
          replyText = `¡Hola! ¿Cómo va todo hoy? 😊`;
        } else if (lower.includes('cafe') || lower.includes('café') || lower.includes('comida') || lower.includes('reunir')) {
          replyText = `¡Sí, de todas maneras! Nos vemos en el centro como a las 2 PM ☕️`;
        } else if (lower.includes('diseño') || lower.includes('codigo') || lower.includes('código') || lower.includes('ui')) {
          replyText = `Revisé las últimas actualizaciones, ¡los componentes y las animaciones quedaron geniales! ✨`;
        } else if (lower.includes('foto') || lower.includes('imagen')) {
          replyText = `¡Qué buenas fotos! Me encanta la toma 📸`;
        } else if (lower.includes('encuesta') || lower.includes('viaje') || lower.includes('playa')) {
          replyText = `¡Ya voté en la encuesta! Estoy muy emocionado por el viaje 🏖️🌴`;
        } else {
          const autoReplies = [
            '¡Entendido! Lo reviso en un momento y te aviso 👍',
            '¡Excelente idea! Vamos con esa propuesta 🚀',
            '¡Genial, gracias por avisarme tan rápido!',
            '¡Perfecto! Hablamos en un rato 👋',
          ];
          replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        }

        const newMsg: Message = {
          id: `msg_reply_${Date.now()}`,
          chatId: targetChatId,
          senderId: targetChat.id,
          senderName: targetChat.name,
          text: replyText,
          timestamp: time,
          date: 'Hoy',
          status: 'read',
          type: 'text',
        };

        // Append message
        setMessages((prev) => ({
          ...prev,
          [targetChatId]: [...(prev[targetChatId] || []), newMsg],
        }));

        // Reset typing status and update last message
        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  typingStatus: null,
                  lastMessage: replyText,
                  lastMessageTimestamp: time,
                  lastMessageSenderId: targetChat.id,
                  lastMessageStatus: 'read',
                  unreadCount: activeChatId === targetChatId ? 0 : c.unreadCount + 1,
                }
              : c
          )
        );

        // Play receive sound
        playReceiveSound(userSettings.soundEnabled);
      }, 2400);
    }, 1200);
  }, [chats, activeChatId, userSettings.soundEnabled]);

  // Handle sending a message
  const handleSendMessage = (
    text: string, 
    type: Message['type'] = 'text', 
    extra?: Partial<Message>
  ) => {
    if (!activeChatId) return;

    const time = getCurrentTimeString();
    const newMsg: Message = {
      id: `msg_u_${Date.now()}`,
      chatId: activeChatId,
      senderId: 'user',
      senderName: userSettings.profile.name,
      text,
      timestamp: time,
      date: 'Hoy',
      status: 'delivered',
      type,
      ...extra,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    // Update chat last message
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: type === 'image' ? '📷 Foto' : type === 'video' ? '🎬 Video' : type === 'voice' ? '🎤 Mensaje de voz' : type === 'location' ? '📍 Ubicación' : text,
              lastMessageTimestamp: time,
              lastMessageSenderId: 'user',
              lastMessageStatus: 'delivered',
            }
          : c
      )
    );

    // Play send pop sound
    playSendSound(userSettings.soundEnabled);

    // Trigger simulated reply
    triggerAutoReply(activeChatId, text);
  };

  // Handle voice note
  const handleSendVoiceNote = (duration: number, waveform: number[], audioUrl?: string) => {
    handleSendMessage(`Mensaje de voz (0:${duration.toString().padStart(2, '0')})`, 'voice', {
      voiceDuration: duration,
      voiceWaveform: waveform,
      mediaUrl: audioUrl,
    });
  };

  // Handle message reaction
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.find((r) => r.emoji === emoji);

        if (existing) {
          if (existing.users.includes('user')) {
            // Remove user reaction
            return {
              ...m,
              reactions: currentReactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== 'user') }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          } else {
            // Add user reaction
            return {
              ...m,
              reactions: currentReactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, users: [...r.users, 'user'] }
                  : r
              ),
            };
          }
        } else {
          return {
            ...m,
            reactions: [...currentReactions, { emoji, count: 1, users: ['user'] }],
          };
        }
      });
      return { ...prev, [activeChatId]: updated };
    });
  };

  // Handle star message
  const handleStarMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      );
      return { ...prev, [activeChatId]: updated };
    });
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: chatMsgs.filter((m) => m.id !== messageId),
      };
    });
  };

  // Handle poll voting
  const handleVotePoll = (messageId: string, optionId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id !== messageId || !m.pollData) return m;

        const options = m.pollData.options.map((opt) => {
          if (opt.id === optionId) {
            const hasVoted = opt.votes.includes('user');
            const votes = hasVoted
              ? opt.votes.filter((u) => u !== 'user')
              : [...opt.votes, 'user'];
            return { ...opt, votes };
          }
          if (!m.pollData?.allowMultiple) {
            return { ...opt, votes: opt.votes.filter((u) => u !== 'user') };
          }
          return opt;
        });

        return { ...m, pollData: { ...m.pollData, options } };
      });

      return { ...prev, [activeChatId]: updated };
    });
  };

  // Pin / Mute / Delete chat
  const handlePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleMuteChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, muted: !c.muted } : c))
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleMarkAsRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleCreateNewChat = (name: string, isGroup: boolean, phone?: string) => {
    const newId = `chat_${Date.now()}`;
    const newChat: Chat = {
      id: newId,
      name,
      avatar: isGroup
        ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isGroup,
      unreadCount: 0,
      pinned: false,
      muted: false,
      isOnline: true,
      lastMessage: 'Toca para comenzar a chatear',
      lastMessageTimestamp: 'Ahora',
      phone: phone || '+34 600 000 000',
      about: '¡Hola! Estoy usando WhatsApp.',
    };

    setChats((prev) => [newChat, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
    setMobileView('chat');
  };

  // Start Voice or Video Call
  const handleStartCall = (type: 'voice' | 'video', contactId?: string) => {
    const targetChat = contactId
      ? chats.find((c) => c.id === contactId) || activeChat
      : activeChat;

    if (!targetChat) return;

    setActiveCall({ chat: targetChat, type });

    // Add entry to call logs
    const newLog: CallLog = {
      id: `call_${Date.now()}`,
      contactId: targetChat.id,
      contactName: targetChat.name,
      contactAvatar: targetChat.avatar,
      type,
      direction: 'outgoing',
      timestamp: 'Ahora',
    };
    setCallLogs((prev) => [newLog, ...prev]);
  };

  // Add new status
  const handleAddStatus = (
    content: string, 
    type: 'text' | 'image' | 'video', 
    caption?: string,
    bgColor = '#005c4b'
  ) => {
    const newItem: StatusItem = {
      id: `my_status_${Date.now()}`,
      type,
      content,
      caption: caption || undefined,
      backgroundColor: bgColor,
      timestamp: 'Ahora',
      viewed: true,
      viewsCount: 1,
    };

    setStatuses((prev) => {
      const userIndex = prev.findIndex((s) => s.contactId === 'user');
      if (userIndex >= 0) {
        const existing = prev[userIndex];
        const updated: ContactStatus = {
          ...existing,
          contactName: 'Mi estado',
          contactAvatar: userSettings.profile.avatar,
          updatedAt: 'Ahora',
          allViewed: true,
          items: [newItem, ...existing.items],
        };
        const rest = prev.filter((_, idx) => idx !== userIndex);
        return [updated, ...rest];
      } else {
        return [
          {
            contactId: 'user',
            contactName: 'Mi estado',
            contactAvatar: userSettings.profile.avatar,
            updatedAt: 'Ahora',
            allViewed: true,
            items: [newItem],
          },
          ...prev,
        ];
      }
    });
  };

  // Delete status item
  const handleDeleteStatusItem = (itemId: string) => {
    setStatuses((prev) => {
      const userStatus = prev.find((s) => s.contactId === 'user');
      if (!userStatus) return prev;
      const updatedItems = userStatus.items.filter((i) => i.id !== itemId);
      if (updatedItems.length === 0) {
        if (viewingStatus?.contactId === 'user') {
          setViewingStatus(null);
        }
        return prev.filter((s) => s.contactId !== 'user');
      }
      const updatedUserStatus: ContactStatus = {
        ...userStatus,
        items: updatedItems,
      };
      if (viewingStatus?.contactId === 'user') {
        setViewingStatus(updatedUserStatus);
      }
      return prev.map((s) => (s.contactId === 'user' ? updatedUserStatus : s));
    });
  };

  // Reset demo data
  const handleResetData = () => {
    localStorage.clear();
    setUserSettings(INITIAL_USER_SETTINGS);
    setChats(INITIAL_CHATS);
    setMessages(INITIAL_MESSAGES);
    setStatuses(INITIAL_STATUSES);
    setCallLogs(INITIAL_CALL_LOGS);
    setActiveChatId('chat_sara');
    setActiveTab('chats');
  };

  return (
    <div 
      className={`fixed inset-0 w-screen h-screen flex overflow-hidden select-none font-sans ${
        isDark ? 'dark bg-[#111b21] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
      }`}
    >
      {/* WhatsApp Web Initial Splash Loading Screen */}
      {isInitialLoading && (
        <InitialLoadingScreen 
          isDark={isDark} 
          onFinish={() => setIsInitialLoading(false)} 
        />
      )}

      {/* 1. Left Vertical Nav Rail (Desktop) */}
      <SidebarRail
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setShowContactInfo(false);
        }}
        unreadCountTotal={unreadCountTotal}
        hasUnreadStatus={hasUnreadStatus}
        missedCallsCount={missedCallsCount}
        userSettings={userSettings}
        onToggleTheme={() =>
          setUserSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* 2. Secondary Panel: Active Tab (Chats, Status, Calls, Channels, Communities, Starred, Settings) */}
      <div 
        className={`${
          mobileView === 'chat' && activeChatId ? 'hidden md:flex' : 'flex'
        } h-full w-full md:w-[400px] shrink-0`}
      >
        {activeTab === 'chats' && (
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(chatId) => {
              setActiveChatId(chatId);
              setMobileView('chat');
              setShowContactInfo(false);
            }}
            userSettings={userSettings}
            onPinChat={handlePinChat}
            onMuteChat={handleMuteChat}
            onDeleteChat={handleDeleteChat}
            onMarkAsRead={handleMarkAsRead}
            onCreateNewChat={handleCreateNewChat}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenProfileEdit={() => setShowProfileModal(true)}
            onOpenStatus={() => setActiveTab('status')}
            onOpenPhoneSearch={() => setShowPhoneSearchModal(true)}
          />
        )}

        {activeTab === 'status' && (
          <StatusList
            statuses={statuses}
            userSettings={userSettings}
            onSelectStatus={(status) => {
              setViewingStatus(status);
              // Mark as viewed
              setStatuses((prev) =>
                prev.map((s) =>
                  s.contactId === status.contactId
                    ? {
                        ...s,
                        allViewed: true,
                        items: s.items.map((i) => ({ ...i, viewed: true })),
                      }
                    : s
                )
              );
            }}
            onAddStatus={handleAddStatus}
            onDeleteStatusItem={handleDeleteStatusItem}
          />
        )}

        {activeTab === 'calls' && (
          <CallsList
            callLogs={callLogs}
            userSettings={userSettings}
            onStartCall={(contactId, type) => handleStartCall(type, contactId)}
          />
        )}

        {activeTab === 'channels' && (
          <ChannelsTab userSettings={userSettings} />
        )}

        {activeTab === 'reels' && (
          <ReelsTab
            userSettings={userSettings}
            chats={chats}
            onShareToChat={(chatId, reelTitle) => {
              handleSendMessage(reelTitle);
              setActiveChatId(chatId);
              setActiveTab('chats');
              setMobileView('chat');
            }}
          />
        )}

        {activeTab === 'starred' && (
          <StarredMessagesDrawer
            starredMessages={starredMessagesList}
            userSettings={userSettings}
            onSelectChat={(chatId) => {
              setActiveChatId(chatId);
              setActiveTab('chats');
              setMobileView('chat');
            }}
            onUnstar={handleStarMessage}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsDrawer
            userSettings={userSettings}
            onUpdateSettings={(newSettings) =>
              setUserSettings((prev) => ({ ...prev, ...newSettings }))
            }
            onResetData={handleResetData}
            onOpenProfileEdit={() => setShowProfileModal(true)}
          />
        )}
      </div>

      {/* 3. Main Center Panel: Active Chat or Empty State */}
      <main 
        className={`${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        } flex-1 h-full min-w-0 relative`}
      >
        {activeChat ? (
          <ChatArea
            key={activeChat.id}
            chat={activeChat}
            messages={activeMessages}
            userSettings={userSettings}
            onSendMessage={handleSendMessage}
            onSendVoiceNote={handleSendVoiceNote}
            onReactMessage={handleReactMessage}
            onStarMessage={handleStarMessage}
            onDeleteMessage={handleDeleteMessage}
            onVotePoll={handleVotePoll}
            onStartCall={(type) => handleStartCall(type)}
            onBackMobile={() => setMobileView('list')}
            onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
          />
        ) : (
          <EmptyChatState userSettings={userSettings} />
        )}
      </main>

      {/* 4. Right Side Drawer: Contact Info (when open) */}
      {showContactInfo && activeChat && (
        <ContactInfoDrawer
          chat={activeChat}
          messages={activeMessages}
          userSettings={userSettings}
          onClose={() => setShowContactInfo(false)}
          onStartCall={(type) => handleStartCall(type)}
          onClearChat={() => {
            if (activeChatId) {
              setMessages((prev) => ({ ...prev, [activeChatId]: [] }));
            }
          }}
          onMuteToggle={() => {
            if (activeChatId) handleMuteChat(activeChatId);
          }}
        />
      )}

      {/* 5. Mobile Bottom Tab Bar (Screen width < 768px, only in list view) */}
      <nav 
        className={`md:hidden ${
          mobileView === 'chat' && activeChatId ? 'hidden' : 'flex'
        } fixed bottom-0 inset-x-0 h-16 border-t z-40 items-center justify-around ${
          isDark 
            ? 'bg-[#202c33] border-[#2a3942] text-[#aebac1]' 
            : 'bg-white border-[#e9edef] text-[#54656f]'
        }`}
      >
        {[
          { id: 'chats' as SidebarTab, label: 'Chats', icon: MessageSquare, count: unreadCountTotal },
          { id: 'status' as SidebarTab, label: 'Estados', icon: CircleDot, dot: hasUnreadStatus },
          { id: 'reels' as SidebarTab, label: 'Reels', icon: Clapperboard },
          { id: 'calls' as SidebarTab, label: 'Llamadas', icon: Phone, count: missedCallsCount },
          { id: 'settings' as SidebarTab, label: 'Ajustes', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-colors ${
                isActive 
                  ? 'text-[#00a884] font-semibold' 
                  : isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#25d366] text-[#111b21] text-[10px] font-bold flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
                {tab.dot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25d366] border border-[#202c33]" />
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 6. Fullscreen WhatsApp Status Story Viewer */}
      {viewingStatus && (
        <StatusViewer
          contactStatus={viewingStatus}
          onClose={() => setViewingStatus(null)}
          onDeleteStatusItem={handleDeleteStatusItem}
          onReplyToStatus={(contactId, replyText) => {
            setActiveChatId(contactId);
            setActiveTab('chats');
            setMobileView('chat');
            handleSendMessage(replyText);
          }}
        />
      )}

      {/* 7. Ongoing Call Screen Modal */}
      {activeCall && (
        <CallModal
          chat={activeCall.chat}
          callType={activeCall.type}
          userSettings={userSettings}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* 8. Profile Setup & Edit Form Modal */}
      {showProfileModal && (
        <ProfileEditorModal
          userSettings={userSettings}
          onUpdateSettings={(newSettings) =>
            setUserSettings((prev) => ({ ...prev, ...newSettings }))
          }
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* 9. Phone Search & Start Chat Modal */}
      {showPhoneSearchModal && (
        <PhoneSearchModal
          isOpen={showPhoneSearchModal}
          onClose={() => setShowPhoneSearchModal(false)}
          chats={chats}
          userSettings={userSettings}
          onStartChatWithPhone={(phone, contactName) => {
            handleCreateNewChat(contactName || `Contacto (${phone})`, false, phone);
            setActiveTab('chats');
            setMobileView('chat');
          }}
          onSelectExistingChat={(chatId) => {
            setActiveChatId(chatId);
            setActiveTab('chats');
            setMobileView('chat');
            setShowContactInfo(false);
          }}
        />
      )}
    </div>
  );
}
