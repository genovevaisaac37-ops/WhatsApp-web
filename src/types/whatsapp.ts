export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'document' | 'location' | 'contact' | 'poll';

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs or contact IDs
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // 'user' or contact ID
  senderName: string;
  text: string;
  timestamp: string;
  date: string;
  status: MessageStatus;
  type: MessageType;
  mediaUrl?: string;
  mediaCaption?: string;
  mediaFileName?: string;
  mediaFileSize?: string;
  voiceDuration?: number; // duration in seconds
  voiceWaveform?: number[];
  locationName?: string;
  locationAddress?: string;
  contactCard?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  pollData?: PollData;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: Reaction[];
  isStarred?: boolean;
  isDeleted?: boolean;
  deletedForEveryone?: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role?: 'admin' | 'member';
  color?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  groupMembers?: GroupMember[];
  lastMessage?: string;
  lastMessageTimestamp?: string;
  lastMessageStatus?: MessageStatus;
  lastMessageSenderId?: string;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  isOnline: boolean;
  lastSeen?: string;
  typingStatus?: 'typing' | 'recording' | null;
  about?: string;
  phone?: string;
}

export interface StatusItem {
  id: string;
  type: 'image' | 'video' | 'text';
  content: string; // image path, video URL/dataUrl, or text
  backgroundColor?: string;
  caption?: string;
  timestamp: string;
  viewed: boolean;
  viewsCount?: number;
  duration?: number;
}

export interface ContactStatus {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  updatedAt: string;
  allViewed: boolean;
  items: StatusItem[];
}

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  wallpaper: 'doodle' | 'dark' | 'emerald' | 'teal' | 'caramel' | 'neon_rainbow';
  neonRainbowEnabled?: boolean;
  neonRainbowIntervalMinutes?: number;
  chatFontColor?: string;
  enterIsSend: boolean;
  profile: {
    name: string;
    status: string;
    avatar: string;
    phone: string;
  };
}

export type SidebarTab = 'chats' | 'status' | 'channels' | 'reels' | 'calls' | 'starred' | 'settings';
