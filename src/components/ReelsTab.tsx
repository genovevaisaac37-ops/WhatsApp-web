import React, { useState, useRef, useEffect } from 'react';
import { 
  Clapperboard, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Music2, 
  Send, 
  X, 
  Check, 
  Sparkles,
  UserPlus,
  UserCheck,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Camera,
  Trash2,
  RotateCw,
  Loader2
} from 'lucide-react';
import { UserSettings, Chat } from '../types/whatsapp.ts';
import { 
  persistUserReel, 
  loadUserPersistedReels, 
  removePersistedUserReel, 
  compressImageFile 
} from '../utils/reelsPersistence.ts';

interface ReelComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface ReelItem {
  id: string;
  mediaType: 'video' | 'photo';
  videoUrl: string; // or image source
  imageUrl?: string;
  isOwn?: boolean;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  description: string;
  musicTrack: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  category: string;
  tags: string[];
  comments: ReelComment[];
  createdAt?: string;
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'reel_1',
    mediaType: 'video',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    author: {
      name: 'Botánica & Arte',
      username: '@botanica.art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    description: 'Timelapse de una flor abriéndose al amanecer en 4K. La magia de la vida floreciendo 🌸🌺 #timelapse #flores #primavera',
    musicTrack: 'Vivaldi - Primavera (Remix Acústico)',
    likesCount: 3890,
    commentsCount: 95,
    sharesCount: 340,
    category: 'Tendencias',
    tags: ['#timelapse', '#flores', '#primavera'],
    comments: [
      {
        id: 'c3',
        author: 'Elena Torres',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        text: '¡Increíble captura! ¿Cuánto tiempo tardó en florecer? 🌸',
        timestamp: 'Hace 3h',
        likes: 19,
      },
    ],
  },
  {
    id: 'reel_2',
    mediaType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    author: {
      name: 'Cine & Animación 3D',
      username: '@animation_studio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    description: 'Tráiler oficial de aventuras animadas. La historia de valor, amistad y dragones 🎬🐉 #animacion #cine #trailer #fantasia',
    musicTrack: 'Epic Orchestral Theme - Cinematic Sounds',
    likesCount: 5210,
    commentsCount: 142,
    sharesCount: 680,
    category: 'Cine',
    tags: ['#animacion', '#cine', '#fantasia'],
    comments: [
      {
        id: 'c4',
        author: 'Marcos Rivera',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: 'La calidad de renderizado es impresionante 👏🔥',
        timestamp: 'Hace 1h',
        likes: 27,
      },
    ],
  },
  {
    id: 'reel_3',
    mediaType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    author: {
      name: 'Naturaleza Profunda',
      username: '@naturalezaviva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    description: 'La inmensidad y paz del océano azul. ¿A quién le gustaría estar aquí hoy? 🌊🐬 #oceano #naturaleza #relax #paz',
    musicTrack: 'Ondas Marinas - Sonido Original Relajante',
    likesCount: 1420,
    commentsCount: 38,
    sharesCount: 112,
    category: 'Naturaleza',
    tags: ['#oceano', '#naturaleza', '#relax'],
    comments: [
      {
        id: 'c1',
        author: 'Carlos Gómez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: '¡Qué tranquilidad transmite este video! 🌊💙',
        timestamp: 'Hace 2h',
        likes: 12,
      },
      {
        id: 'c2',
        author: 'Sara Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'Definitivamente necesito unas vacaciones en la playa ya mismo ✨',
        timestamp: 'Hace 45m',
        likes: 8,
      },
    ],
  },
  {
    id: 'reel_photo_1',
    mediaType: 'photo',
    videoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Viajeros del Mundo',
      username: '@viajes_total',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    description: 'Amaneceres mágicos en la costa caribeña 🌅🌴 ¿Cuál es tu playa favorita en el mundo? #playa #amanecer #paraiso #fotografia',
    musicTrack: 'Brisa Tropical - Canción de Verano',
    likesCount: 2640,
    commentsCount: 54,
    sharesCount: 189,
    category: 'Tendencias',
    tags: ['#playa', '#amanecer', '#fotografia'],
    comments: [
      {
        id: 'cp1',
        author: 'Sofía Valdés',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        text: '¡Esa luz dorada es espectacular! Parece un cuadro 😍',
        timestamp: 'Hace 1h',
        likes: 14,
      },
    ],
  },
  {
    id: 'reel_photo_2',
    mediaType: 'photo',
    videoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Astro Fotografía',
      username: '@astrophoto_space',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    description: 'Noche estrellada sobre las altas cumbres alpinas. La Vía Láctea en todo su esplendor 🌌🏔️ #galaxia #estrellas #noche #montaña',
    musicTrack: 'Interstellar Theme - Piano Acústico',
    likesCount: 4120,
    commentsCount: 88,
    sharesCount: 420,
    category: 'Fotografía',
    tags: ['#galaxia', '#estrellas', '#fotografia'],
    comments: [
      {
        id: 'cp2',
        author: 'Diego Navarro',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        text: '¡Foto del año sin duda alguna! 🌌📸',
        timestamp: 'Hace 4h',
        likes: 31,
      },
    ],
  },
];

const STORAGE_KEY_REELS = 'whatsapp_web_reels_published_v2';

interface ReelsTabProps {
  userSettings: UserSettings;
  chats?: Chat[];
  onShareToChat?: (chatId: string, reelTitle: string) => void;
}

export const ReelsTab: React.FC<ReelsTabProps> = ({
  userSettings,
  chats = [],
  onShareToChat,
}) => {
  const isDark = userSettings.theme === 'dark';

  // Load reels from localStorage or default
  const [reelsList, setReelsList] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace legacy broken third-party links with guaranteed CDN sample videos
          return parsed.map((item: ReelItem) => {
            if (item.videoUrl && (item.videoUrl.includes('w3.org') || item.videoUrl.includes('zencdn.net'))) {
              const matched = DEFAULT_REELS.find((d) => d.id === item.id);
              if (matched) {
                return { ...item, videoUrl: matched.videoUrl };
              }
            }
            return item;
          });
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_REELS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [bookmarkedReels, setBookmarkedReels] = useState<Record<string, boolean>>({});
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  // Gesture refs
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const wheelCooldown = useRef<boolean>(false);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowSwipeHint(false), 4500);
    return () => clearTimeout(hintTimer);
  }, []);
  
  // Comments modal state
  const [showComments, setShowComments] = useState(false);
  const [commentsData, setCommentsData] = useState<Record<string, ReelComment[]>>(() => {
    const map: Record<string, ReelComment[]> = {};
    DEFAULT_REELS.forEach((r) => {
      map[r.id] = [...r.comments];
    });
    return map;
  });
  const [newCommentText, setNewCommentText] = useState('');

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Publish Reel / Photo Modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishMediaType, setPublishMediaType] = useState<'video' | 'photo'>('video');
  const [publishMethod, setPublishMethod] = useState<'upload' | 'url' | 'preset'>('upload');
  const [publishUrlInput, setPublishUrlInput] = useState('');
  const [videoPoster, setVideoPoster] = useState<string>('');
  const [publishMediaUrl, setPublishMediaUrl] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishMusic, setPublishMusic] = useState('');
  const [publishCategory, setPublishCategory] = useState('Tendencias');
  const [publishPreview, setPublishPreview] = useState<string | null>(null);
  const [selectedFileBlob, setSelectedFileBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load persisted reels from IndexedDB on startup so publications never disappear
  useEffect(() => {
    loadUserPersistedReels().then((persisted) => {
      if (persisted && persisted.length > 0) {
        setReelsList((prev) => {
          const persistedIds = new Set(persisted.map((p) => p.id));
          const rest = prev.filter((r) => !persistedIds.has(r.id));
          return [...persisted, ...rest];
        });
      }
    });
  }, []);

  // Filtered reels based on category
  const filteredReels = activeCategory === 'Todos' 
    ? reelsList 
    : activeCategory === 'Mis Publicaciones'
    ? reelsList.filter((r) => r.isOwn || r.id.startsWith('my_reel_') || r.author.name === userSettings.profile.name)
    : reelsList.filter((r) => r.category.toLowerCase() === activeCategory.toLowerCase());

  // Safe current index
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredReels.length - 1));
  const currentReel = filteredReels[safeIndex] || reelsList[0];

  // Reset video error and loading state on reel change
  useEffect(() => {
    setVideoError(false);
    setIsVideoLoading(true);
    setIsVideoBuffering(true);
    setVideoProgress(0);
  }, [currentIndex, currentReel?.id, currentReel?.videoUrl]);

  // Strictly identify if current item is a photo or a video (guard against empty videoUrl)
  const isPhoto = Boolean(
    !currentReel ||
    currentReel.mediaType === 'photo' ||
    !currentReel.videoUrl ||
    currentReel.videoUrl.trim() === ''
  );

  const isLiked = currentReel ? !!likedReels[currentReel.id] : false;
  const isBookmarked = currentReel ? !!bookmarkedReels[currentReel.id] : false;
  const isFollowing = currentReel ? !!followedCreators[currentReel.author.username] : false;

  // Toggle video playback safely
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause'))) {
            return;
          }
        });
      }
      setIsPlaying(true);
    } else {
      try {
        videoRef.current.pause();
      } catch {
        // Ignore
      }
      setIsPlaying(false);
    }
  };

  // Next reel
  const handleNext = () => {
    setSlideDirection('next');
    if (currentIndex < filteredReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    } else {
      // Loop to beginning
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  // Previous reel
  const handlePrev = () => {
    setSlideDirection('prev');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    } else {
      // Loop to end
      setCurrentIndex(Math.max(0, filteredReels.length - 1));
      setIsPlaying(true);
    }
  };

  // Mouse wheel navigation (scroll down = next, scroll up = prev)
  const handleWheel = (e: React.WheelEvent) => {
    if (showComments || showShareModal || showPublishModal) return;
    if (wheelCooldown.current) return;

    if (Math.abs(e.deltaY) > 20) {
      wheelCooldown.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        wheelCooldown.current = false;
      }, 420);
    }
  };

  // Mobile / touchscreen swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    // Check if vertical swipe is dominant
    if (Math.abs(deltaY) > 35 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        // Deslizar hacia arriba -> Siguiente video
        handleNext();
      } else {
        // Deslizar hacia abajo -> Video anterior
        handlePrev();
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Desktop mouse drag to swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, a, select')) return;
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    isDragging.current = false;
    dragStartY.current = null;
  };

  // Toggle Like
  const handleToggleLike = (reelId: string) => {
    setLikedReels((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  // Toggle Bookmark
  const handleToggleBookmark = (reelId: string) => {
    setBookmarkedReels((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  // Toggle Follow
  const handleToggleFollow = (username: string) => {
    setFollowedCreators((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  // Submit comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentReel) return;

    const newComment: ReelComment = {
      id: `comment_${Date.now()}`,
      author: userSettings.profile.name || 'Tú',
      avatar: userSettings.profile.avatar,
      text: newCommentText.trim(),
      timestamp: 'Ahora',
      likes: 0,
    };

    setCommentsData((prev) => ({
      ...prev,
      [currentReel.id]: [newComment, ...(prev[currentReel.id] || [])],
    }));

    setNewCommentText('');
  };

  // Handle Share to chat
  const handleShareReel = (chatId: string) => {
    if (onShareToChat && currentReel) {
      onShareToChat(chatId, `Mira este Reel: "${currentReel.description.slice(0, 50)}..."`);
    }
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
    }, 1200);
  };

  // Capture snapshot frame from video for instant poster
  const captureVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.currentTime = 0.5;
        video.onloadeddata = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 480, 480);
            canvas.height = Math.min(video.videoHeight || 854, 854);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
              return;
            }
          } catch {
            // Ignored
          }
          resolve('');
        };
        video.onerror = () => resolve('');
        setTimeout(() => resolve(''), 1500);
      } catch {
        resolve('');
      }
    });
  };

  // Handle File Upload for publication (Supports all video and image types)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileBlob(file);

    const fileName = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi|ogv)$/i.test(fileName) || publishMediaType === 'video';

    if (isVideo) {
      setPublishMediaType('video');
      const objectUrl = URL.createObjectURL(file);
      setPublishPreview(objectUrl);
      setPublishMediaUrl(objectUrl);
      captureVideoThumbnail(objectUrl).then((thumb) => {
        if (thumb) setVideoPoster(thumb);
      });
    } else {
      setPublishMediaType('photo');
      try {
        const compressed = await compressImageFile(file);
        setPublishPreview(compressed);
        setPublishMediaUrl(compressed);
      } catch {
        const objectUrl = URL.createObjectURL(file);
        setPublishPreview(objectUrl);
        setPublishMediaUrl(objectUrl);
      }
    }
  };

  // Handle direct URL media load
  const handleLoadUrlMedia = () => {
    if (!publishUrlInput.trim()) return;
    const url = publishUrlInput.trim();
    setPublishMediaUrl(url);
    setPublishPreview(url);
    const isVid = publishMediaType === 'video' || /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(url);
    if (isVid) {
      setPublishMediaType('video');
      captureVideoThumbnail(url).then((thumb) => {
        if (thumb) setVideoPoster(thumb);
      });
    }
  };

  // Handle publishing a new Reel (video or photo)
  const handlePublishReel = async (e: React.FormEvent) => {
    e.preventDefault();
    const mediaSource = publishPreview || publishMediaUrl;
    if (!mediaSource) return;

    setIsSubmitting(true);

    const isVideo = publishMediaType === 'video';
    const newReel: ReelItem = {
      id: `my_reel_${Date.now()}`,
      mediaType: isVideo ? 'video' : 'photo',
      videoUrl: isVideo ? mediaSource : '',
      imageUrl: isVideo ? (videoPoster || undefined) : mediaSource,
      isOwn: true,
      author: {
        name: userSettings.profile.name || 'Tú',
        username: `@${(userSettings.profile.name || 'usuario').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: userSettings.profile.avatar,
        verified: true,
      },
      description: publishDescription.trim() || (isVideo ? 'Mi nuevo Reel de video 🎬' : 'Mi nueva foto publicada 📸✨'),
      musicTrack: publishMusic.trim() || `Sonido original - ${userSettings.profile.name || 'Tú'}`,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      category: publishCategory,
      tags: ['#reels', '#whatsapp', isVideo ? '#video' : '#foto'],
      comments: [],
      createdAt: 'Ahora',
    };

    // Permanently save into IndexedDB and localStorage
    try {
      await persistUserReel(newReel, selectedFileBlob);
    } catch {
      // Ignored
    }

    const updatedList = [newReel, ...reelsList.filter((r) => r.id !== newReel.id)];
    setReelsList(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(updatedList.slice(0, 30)));
    } catch {
      // Ignored
    }

    // Automatically like own reel
    setLikedReels((prev) => ({ ...prev, [newReel.id]: true }));

    // Reset form and jump immediately to the newly created reel
    setPublishSuccess(true);
    setIsSubmitting(false);

    // Switch view immediately to newly published reel
    setActiveCategory('Todos');
    setCurrentIndex(0);
    setVideoError(false);
    setIsPlaying(true);

    setTimeout(() => {
      setPublishSuccess(false);
      setShowPublishModal(false);
      setPublishPreview(null);
      setPublishMediaUrl('');
      setPublishUrlInput('');
      setPublishDescription('');
      setPublishMusic('');
      setSelectedFileBlob(null);
      setVideoPoster('');
    }, 700);
  };

  // Delete own publication
  const handleDeleteMyReel = async (reelId: string) => {
    await removePersistedUserReel(reelId);
    setReelsList((prev) => prev.filter((r) => r.id !== reelId));
    setCurrentIndex(0);
  };

  // Keyboard navigation (ArrowUp, ArrowDown, Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments || showShareModal || showPublishModal) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, showComments, showShareModal, showPublishModal, filteredReels.length]);

  // Autoplay or reset when index changes
  useEffect(() => {
    if (videoRef.current && currentReel && !isPhoto && currentReel.videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsVideoBuffering(false);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [safeIndex, currentReel?.id, isPhoto, currentReel?.videoUrl, isMuted]);

  const currentComments = currentReel ? (commentsData[currentReel.id] || currentReel.comments) : [];

  return (
    <div 
      className={`flex flex-col h-full w-full select-none transition-colors duration-150 overflow-hidden ${
        isDark 
          ? 'bg-[#0c1317] text-[#e9edef]' 
          : 'bg-[#f0f2f5] text-[#111b21]'
      }`}
    >
      {/* Top Header */}
      <div 
        className={`flex items-center justify-between px-3 sm:px-4 py-2.5 border-b shrink-0 z-10 ${
          isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-white shadow-xs">
            <Clapperboard className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-1.5 leading-tight">
              <span>Reels</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#00a884]/20 text-[#00a884] font-semibold uppercase">
                Shorts & Fotos
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#8696a0]">Videos cortos y fotografías en tendencia</p>
          </div>
        </div>

        {/* Right Header: Categories & Publish Button */}
        <div className="flex items-center gap-2">
          {/* Quick Categories Bar */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['Todos', 'Mis Publicaciones', 'Tendencias', 'Naturaleza', 'Fotografía', 'Cine'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#00a884] text-white shadow-xs'
                    : isDark
                    ? 'bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db]'
                    : 'bg-[#e9edef] text-[#54656f] hover:text-[#111b21]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Botón para Publicar Reels y Fotos */}
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00a884] text-white hover:bg-[#008f6f] active:scale-95 text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
            title="Publicar un Reel o Foto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publicar</span>
          </button>
        </div>
      </div>

      {/* Main Reels Theater / Feed Container */}
      <div 
        className="flex-1 flex items-center justify-center relative p-2 sm:p-4 overflow-hidden select-none"
        onWheel={handleWheel}
      >
        {/* Floating Gesture Hint */}
        {showSwipeHint && (
          <div className="absolute top-3 inset-x-0 mx-auto w-fit z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold shadow-lg border border-white/10">
              <span className="text-[#25d366] text-xs font-bold">↕</span>
              <span>Desliza arriba o abajo para ver más videos</span>
            </div>
          </div>
        )}

        {/* Vertical Reel Player Frame */}
        {currentReel ? (
          <div 
            className="relative w-full max-w-[340px] sm:max-w-[380px] h-[82vh] max-h-[680px] rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center border border-black/40 touch-none cursor-grab active:cursor-grabbing select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {/* Main Media: Video or Photo */}
            {isPhoto || !currentReel?.videoUrl ? (
              <div 
                className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleNext}
              >
                <img
                  src={currentReel?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
                  alt={currentReel?.description || 'Reel media'}
                  className="w-full h-full object-cover select-none transition-transform duration-700 ease-out hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  key={currentReel.id + '_' + currentReel.videoUrl}
                  ref={videoRef}
                  src={currentReel.videoUrl}
                  poster={currentReel.imageUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  preload="metadata"
                  onClick={togglePlay}
                  onLoadStart={() => {
                    setIsVideoLoading(true);
                    setIsVideoBuffering(true);
                  }}
                  onLoadedData={() => {
                    setIsVideoLoading(false);
                  }}
                  onCanPlay={() => {
                    setIsVideoLoading(false);
                    setIsVideoBuffering(false);
                    setVideoError(false);
                  }}
                  onPlay={() => {
                    setIsPlaying(true);
                    setIsVideoBuffering(false);
                    setIsVideoLoading(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsVideoBuffering(true)}
                  onPlaying={() => {
                    setIsPlaying(true);
                    setIsVideoBuffering(false);
                    setIsVideoLoading(false);
                  }}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.duration) {
                      setVideoProgress((v.currentTime / v.duration) * 100);
                    }
                    if (isVideoBuffering || isVideoLoading) {
                      setIsVideoBuffering(false);
                      setIsVideoLoading(false);
                    }
                  }}
                  onError={(e) => {
                    e.preventDefault?.();
                    e.stopPropagation?.();
                    setIsVideoLoading(false);
                    setIsVideoBuffering(false);
                    setVideoError(true);
                  }}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Loading / Buffering Spinner Overlay */}
                {(isVideoLoading || isVideoBuffering) && !videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 pointer-events-none transition-all duration-200">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="w-14 h-14 border-4 border-white/20 border-t-[#00a884] rounded-full animate-spin shadow-xl" />
                      <Clapperboard className="w-5 h-5 text-[#00a884] absolute animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide drop-shadow-md">Cargando video...</span>
                    <span className="text-[10px] text-[#00a884] font-medium mt-0.5 animate-pulse">Reproduciendo en HD</span>
                  </div>
                )}

                {/* Error / Retry Overlay */}
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-15 p-6 text-center animate-in fade-in duration-200">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5">
                      <VideoIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">Cargando video</h4>
                    <p className="text-[11px] text-white/70 mb-3 max-w-[240px]">
                      Toca el botón para reintentar la reproducción o pasa al siguiente.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoError(false);
                          setIsVideoLoading(true);
                          setIsVideoBuffering(true);
                          if (videoRef.current) {
                            videoRef.current.load();
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#008f6f] transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Reintentar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Video Progress Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-25 overflow-hidden">
                  <div 
                    className="h-full bg-[#00a884] transition-all duration-150 ease-linear shadow-[0_0_8px_#00a884]"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Top Bar Overlay inside Reel */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                {isPhoto ? (
                  <ImageIcon className="w-3.5 h-3.5 text-[#00a884]" />
                ) : (
                  <Clapperboard className="w-3.5 h-3.5 text-[#00a884]" />
                )}
                <span>
                  {isPhoto ? 'Foto' : 'Reel'} #{safeIndex + 1} de {filteredReels.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                {(currentReel.isOwn || currentReel.id.startsWith('my_reel_')) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMyReel(currentReel.id);
                    }}
                    className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-700 text-white backdrop-blur-md transition-colors"
                    title="Eliminar mi publicación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {!isPhoto && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00a884]" />}
                  </button>
                )}
              </div>
            </div>

            {/* Big Play/Pause indicator on click (only for videos) */}
            {!isPhoto && !isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer animate-in fade-in duration-150"
              >
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                  <Play className="w-7 h-7 ml-1 fill-white" />
                </div>
              </div>
            )}

            {/* Right Floating Actions (Like, Comment, Share, Bookmark) - Tamaño compacto */}
            <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-2.5 z-20">
              {/* Like */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleLike(currentReel.id)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-75 ${
                    isLiked 
                      ? 'bg-rose-500/20 text-rose-500 shadow-rose-500/20' 
                      : 'bg-black/45 text-white hover:bg-black/65'
                  }`}
                  title="Me gusta"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 stroke-rose-500' : 'stroke-[2.2]'}`} />
                </button>
                <span className="text-[10px] font-medium text-white drop-shadow-md">
                  {currentReel.likesCount + (isLiked ? 1 : 0)}
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setShowComments(true)}
                  className="p-1.5 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-md transition-colors"
                  title="Comentarios"
                >
                  <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                </button>
                <span className="text-[10px] font-medium text-white drop-shadow-md">
                  {currentComments.length}
                </span>
              </div>

              {/* Share to chat */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="p-1.5 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-md transition-colors"
                  title="Compartir por WhatsApp"
                >
                  <Share2 className="w-4 h-4 stroke-[2.2]" />
                </button>
                <span className="text-[10px] font-medium text-white drop-shadow-md">
                  {currentReel.sharesCount}
                </span>
              </div>

              {/* Bookmark */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleBookmark(currentReel.id)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-75 ${
                    isBookmarked
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-black/45 text-white hover:bg-black/65'
                  }`}
                  title="Guardar"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 stroke-amber-400' : 'stroke-[2.2]'}`} />
                </button>
              </div>
            </div>

            {/* Bottom Info Overlay (Creator, Description, Music) */}
            <div className="absolute inset-x-0 bottom-0 p-3.5 pt-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-15 pointer-events-none text-white">
              {/* Creator Profile */}
              <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                <img
                  src={currentReel.author.avatar}
                  alt={currentReel.author.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/60 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate">{currentReel.author.name}</span>
                    {currentReel.author.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00a884] text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/70 font-mono">{currentReel.author.username}</p>
                </div>

                {/* Follow Button - Tamaño compacto */}
                <button
                  type="button"
                  onClick={() => handleToggleFollow(currentReel.author.username)}
                  className={`ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                    isFollowing
                      ? 'bg-white/20 text-white backdrop-blur-xs'
                      : 'bg-[#00a884] text-white shadow-xs hover:bg-[#008f6f]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-2.5 h-2.5" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-white/95 line-clamp-2 mb-2 font-normal leading-relaxed">
                {currentReel.description}
              </p>

              {/* Music track ticker */}
              <div className="flex items-center gap-2 text-[10px] text-white/80 overflow-hidden font-medium">
                <Music2 className="w-3 h-3 shrink-0 text-[#00a884] animate-spin" style={{ animationDuration: '6s' }} />
                <span className="truncate">{currentReel.musicTrack}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[340px] sm:max-w-[380px] h-[75vh] max-h-[600px] rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#8696a0]/30 bg-black/40 text-white select-none">
            <div className="w-14 h-14 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center mb-3 shadow-md">
              <Clapperboard className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm">No hay publicaciones aquí todavía</h3>
            <p className="text-xs text-[#8696a0] mt-1 max-w-[260px] leading-relaxed">
              {activeCategory === 'Mis Publicaciones'
                ? 'Aún no has publicado ningún Reel o Foto. ¡Toca "Publicar" para crear el primero y guardarlo permanentemente!'
                : 'No hay contenido en esta categoría.'}
            </p>
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              className="mt-4 px-4 py-2 rounded-full bg-[#00a884] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#008f6f] transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Publicar ahora</span>
            </button>
          </div>
        )}

        {/* Up / Down Navigation Controls (Desktop / Tablet) */}
        <div className="hidden lg:flex flex-col gap-2.5 ml-4 z-20">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2.5 rounded-full border shadow-lg transition-all ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed bg-black/20 text-white/40 border-white/10'
                : isDark
                ? 'bg-[#202c33] border-[#2f3b43] text-white hover:bg-[#2a3942]'
                : 'bg-white border-[#d1d7db] text-[#111b21] hover:bg-slate-100'
            }`}
            title="Reel anterior (Flecha Arriba)"
          >
            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`p-2.5 rounded-full border shadow-lg transition-all ${
              isDark
                ? 'bg-[#202c33] border-[#2f3b43] text-white hover:bg-[#2a3942]'
                : 'bg-white border-[#d1d7db] text-[#111b21] hover:bg-slate-100'
            }`}
            title="Siguiente Reel (Flecha Abajo)"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* MODAL PARA PUBLICAR REELS Y FOTOS */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className={`w-full max-w-lg max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border ${
              isDark ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
            }`}
          >
            {/* Header del modal */}
            <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Crear y Publicar en Reels</h3>
                  <p className="text-[11px] text-[#8696a0]">Comparte un video corto o una fotografía</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishPreview(null);
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#323d45] text-[#8696a0]' : 'hover:bg-slate-200 text-[#54656f]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {publishSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-[#00a884]">
                  <div className="w-14 h-14 rounded-full bg-[#00a884]/20 flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold">¡Publicado con éxito!</h4>
                  <p className="text-xs text-[#8696a0] mt-1">Tu {publishMediaType === 'photo' ? 'foto' : 'reel'} ya está visible en el feed.</p>
                </div>
              ) : (
                <form onSubmit={handlePublishReel} className="space-y-4">
                  {/* Selector de Tipo: Video o Foto */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">¿Qué deseas publicar?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPublishMediaType('video');
                          setPublishPreview(null);
                        }}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          publishMediaType === 'video'
                            ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884]'
                            : isDark
                            ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:text-[#d1d7db]'
                            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f] hover:text-[#111b21]'
                        }`}
                      >
                        <VideoIcon className="w-4 h-4" />
                        <span>Video Reel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPublishMediaType('photo');
                          setPublishPreview(null);
                        }}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          publishMediaType === 'photo'
                            ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884]'
                            : isDark
                            ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:text-[#d1d7db]'
                            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f] hover:text-[#111b21]'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Foto Reel</span>
                      </button>
                    </div>
                  </div>

                  {/* Selección de Fuente: Archivo, Enlace o Plantilla */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Origen del {publishMediaType === 'video' ? 'video' : 'contenido'}
                    </label>

                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setPublishMethod('upload')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          publishMethod === 'upload'
                            ? 'bg-[#00a884] text-white border-[#00a884]'
                            : isDark
                            ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0]'
                            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f]'
                        }`}
                      >
                        Subir archivo
                      </button>

                      <button
                        type="button"
                        onClick={() => setPublishMethod('url')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          publishMethod === 'url'
                            ? 'bg-[#00a884] text-white border-[#00a884]'
                            : isDark
                            ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0]'
                            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f]'
                        }`}
                      >
                        Enlace web / URL
                      </button>

                      <button
                        type="button"
                        onClick={() => setPublishMethod('preset')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          publishMethod === 'preset'
                            ? 'bg-[#00a884] text-white border-[#00a884]'
                            : isDark
                            ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0]'
                            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f]'
                        }`}
                      >
                        Plantillas
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept={publishMediaType === 'video' ? 'video/*,.mp4,.webm,.mov' : 'image/*,.jpg,.jpeg,.png,.webp'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Previsualización del archivo cargado */}
                    {publishPreview ? (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                        {publishMediaType === 'video' && publishPreview ? (
                          <video
                            key={publishPreview}
                            src={publishPreview}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                            onError={() => {
                              // Handled
                            }}
                          />
                        ) : (
                          <img
                            src={publishPreview}
                            alt="Previsualización"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPublishPreview(null);
                            setPublishMediaUrl('');
                            setPublishUrlInput('');
                            setVideoPoster('');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:bg-black transition-colors"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : publishMethod === 'upload' ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          isDark 
                            ? 'border-[#2a3942] hover:border-[#00a884] bg-[#202c33]/50' 
                            : 'border-[#d1d7db] hover:border-[#00a884] bg-[#f0f2f5]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold">Toca para seleccionar desde tu dispositivo</p>
                        <p className="text-[10px] text-[#8696a0] mt-0.5">
                          {publishMediaType === 'video' ? 'Videos MP4, WebM o MOV' : 'Fotos JPG, PNG o WebP'}
                        </p>
                      </div>
                    ) : publishMethod === 'url' ? (
                      <div className="space-y-2 p-3 rounded-xl border border-dashed border-[#00a884]/50 bg-[#00a884]/5">
                        <label className="block text-[11px] text-[#8696a0]">
                          Pega un enlace directo a un archivo {publishMediaType === 'video' ? 'de video (.mp4, .webm)' : 'de imagen'}:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={publishUrlInput}
                            onChange={(e) => setPublishUrlInput(e.target.value)}
                            placeholder={publishMediaType === 'video' ? 'https://ejemplo.com/video.mp4' : 'https://ejemplo.com/foto.jpg'}
                            className={`flex-1 p-2 rounded-lg text-xs border focus:outline-none ${
                              isDark 
                                ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef] placeholder-[#8696a0]' 
                                : 'bg-white border-[#d1d7db] text-[#111b21] placeholder-[#54656f]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleLoadUrlMedia}
                            disabled={!publishUrlInput.trim()}
                            className="px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#008f6f] disabled:opacity-50"
                          >
                            Cargar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-[#2a3942] space-y-2">
                        <p className="text-xs font-semibold flex items-center gap-1.5 text-[#00a884]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Elige una plantilla lista para publicar:</span>
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(publishMediaType === 'video'
                            ? [
                                { label: 'Océano HD', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
                                { label: 'Flor Timelapse', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
                                { label: 'Cine 3D', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
                              ]
                            : [
                                { label: 'Playa Tropical', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
                                { label: 'Vía Láctea', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80' },
                                { label: 'Bosque Mágico', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80' },
                              ]
                          ).map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setPublishPreview(preset.url);
                                setPublishMediaUrl(preset.url);
                                if (publishMediaType === 'video') {
                                  captureVideoThumbnail(preset.url).then((thumb) => {
                                    if (thumb) setVideoPoster(thumb);
                                  });
                                }
                              }}
                              className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                                publishPreview === preset.url
                                  ? 'bg-[#00a884] text-white border-[#00a884]'
                                  : isDark
                                  ? 'bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:text-[#d1d7db]'
                                  : 'bg-[#e9edef] border-[#d1d7db] text-[#54656f] hover:text-[#111b21]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Descripción / Pie de foto */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Descripción o pie de foto</label>
                    <textarea
                      rows={2}
                      value={publishDescription}
                      onChange={(e) => setPublishDescription(e.target.value)}
                      placeholder={publishMediaType === 'photo' ? 'Escribe algo sobre tu foto... #foto #whatsapp' : '¿De qué trata tu reel? #viral #tendencias'}
                      maxLength={180}
                      className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none resize-none ${
                        isDark 
                          ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef] placeholder-[#8696a0] focus:border-[#00a884]' 
                          : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21] placeholder-[#54656f] focus:border-[#00a884]'
                      }`}
                    />
                  </div>

                  {/* Audio o Música */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <Music2 className="w-3.5 h-3.5 text-[#00a884]" />
                      <span>Audio o Música de fondo</span>
                    </label>
                    <input
                      type="text"
                      value={publishMusic}
                      onChange={(e) => setPublishMusic(e.target.value)}
                      placeholder={`Sonido original - ${userSettings.profile.name || 'Tú'}`}
                      maxLength={60}
                      className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none ${
                        isDark 
                          ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef] placeholder-[#8696a0] focus:border-[#00a884]' 
                          : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21] placeholder-[#54656f] focus:border-[#00a884]'
                      }`}
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Categoría</label>
                    <select
                      value={publishCategory}
                      onChange={(e) => setPublishCategory(e.target.value)}
                      className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none ${
                        isDark 
                          ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef] focus:border-[#00a884]' 
                          : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21] focus:border-[#00a884]'
                      }`}
                    >
                      <option value="Tendencias">Tendencias</option>
                      <option value="Naturaleza">Naturaleza</option>
                      <option value="Fotografía">Fotografía</option>
                      <option value="Cine">Cine</option>
                      <option value="Bienestar">Bienestar</option>
                    </select>
                  </div>

                  {/* Botones de acción */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPublishModal(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isDark ? 'hover:bg-[#202c33] text-[#8696a0]' : 'hover:bg-slate-200 text-[#54656f]'
                      }`}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={(!publishPreview && !publishMediaUrl) || isSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#00a884] text-white hover:bg-[#008f6f] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publicando video...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Publicar ahora</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer / Modal */}
      {showComments && currentReel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className={`w-full max-w-md h-[70vh] sm:h-[550px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden border ${
              isDark ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#00a884]" />
                <h3 className="font-bold text-sm">Comentarios ({currentComments.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#323d45] text-[#8696a0]' : 'hover:bg-slate-200 text-[#54656f]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {currentComments.length === 0 ? (
                <div className="text-center py-10 text-[#8696a0] text-xs">
                  Sé el primero en comentar este {currentReel.mediaType === 'photo' ? 'foto' : 'reel'}.
                </div>
              ) : (
                currentComments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate">{comment.author}</span>
                        <span className="text-[10px] text-[#8696a0]">{comment.timestamp}</span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className={`p-3 border-t flex items-center gap-2 ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
              <img
                src={userSettings.profile.avatar}
                alt="Mi avatar"
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <input
                type="text"
                placeholder="Añade un comentario..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                maxLength={200}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs border focus:outline-none ${
                  isDark 
                    ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef] placeholder-[#8696a0] focus:border-[#00a884]' 
                    : 'bg-white border-[#d1d7db] text-[#111b21] placeholder-[#54656f] focus:border-[#00a884]'
                }`}
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-full bg-[#00a884] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#008f6f] transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share to Chat Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className={`w-full max-w-sm rounded-2xl flex flex-col shadow-2xl overflow-hidden border ${
              isDark ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#00a884]" />
                <h3 className="font-bold text-sm">Compartir en WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#323d45] text-[#8696a0]' : 'hover:bg-slate-200 text-[#54656f]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              {shareSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center text-[#00a884]">
                  <div className="w-12 h-12 rounded-full bg-[#00a884]/20 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <p className="font-bold text-sm">¡Compartido con éxito!</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#8696a0] mb-2 px-1">Selecciona un chat para enviarlo:</p>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {chats.slice(0, 6).map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleShareReel(chat.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                          isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f0f2f5]'
                        }`}
                      >
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">{chat.name}</p>
                          <p className="text-[10px] text-[#8696a0] truncate">{chat.isOnline ? 'En línea' : 'Contacto'}</p>
                        </div>
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#00a884] text-white">
                          Enviar
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
