import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Volume2, 
  VolumeX, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { ContactStatus, StatusItem } from '../types/whatsapp.ts';

interface StatusViewerProps {
  contactStatus: ContactStatus;
  onClose: () => void;
  onNextContact?: () => void;
  onPrevContact?: () => void;
  onReplyToStatus: (contactId: string, replyText: string) => void;
  onDeleteStatusItem?: (itemId: string) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  contactStatus,
  onClose,
  onNextContact,
  onPrevContact,
  onReplyToStatus,
  onDeleteStatusItem,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isUserStatus = contactStatus.contactId === 'user';
  const totalItems = contactStatus.items?.length || 0;
  
  // Guard against out of bounds index
  const safeIndex = Math.min(currentIndex, Math.max(0, totalItems - 1));
  const currentItem: StatusItem | undefined = contactStatus.items?.[safeIndex];

  // Adjust story duration based on item type
  const STORY_DURATION = currentItem?.type === 'video' ? 15000 : 5000;

  // If there are no items left, close viewer safely
  useEffect(() => {
    if (!contactStatus || !contactStatus.items || contactStatus.items.length === 0) {
      onClose();
    }
  }, [contactStatus, onClose]);

  // Reset progress and unpause whenever index or contact changes
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
    setIsBuffering(currentItem?.type === 'video');
  }, [safeIndex, contactStatus.contactId, currentItem?.type]);

  const handleNext = useCallback(() => {
    if (safeIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else if (onNextContact) {
      onNextContact();
      setCurrentIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [safeIndex, totalItems, onNextContact, onClose]);

  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else if (onPrevContact) {
      onPrevContact();
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [safeIndex, onPrevContact]);

  // Progress timer: PURE state updater without side effects inside setProgress!
  useEffect(() => {
    let playPromise: Promise<void> | undefined;

    if (isPaused || (currentItem?.type === 'video' && isBuffering)) {
      if (videoRef.current && isPaused) {
        try {
          videoRef.current.pause();
        } catch {
          // Ignore
        }
      }
      return;
    }

    if (videoRef.current) {
      const p = videoRef.current.play();
      if (p !== undefined) {
        playPromise = p;
        p.catch((err) => {
          if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause'))) {
            return;
          }
        });
      }
    }

    const stepMs = 50;
    const increment = (stepMs / STORY_DURATION) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, stepMs);

    return () => {
      clearInterval(interval);
      if (videoRef.current) {
        if (playPromise) {
          playPromise
            .then(() => {
              videoRef.current?.pause();
            })
            .catch(() => {});
        } else {
          try {
            videoRef.current.pause();
          } catch {
            // Ignore
          }
        }
      }
    };
  }, [safeIndex, contactStatus.contactId, isPaused, isBuffering, STORY_DURATION, currentItem?.type]);

  // Trigger advance when progress reaches 100% outside of setState updater
  useEffect(() => {
    if (progress >= 100 && !isPaused) {
      handleNext();
    }
  }, [progress, isPaused, handleNext]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplyToStatus(
      contactStatus.contactId,
      `Respuesta al estado: "${replyText.trim()}"`
    );
    setReplyText('');
    onClose();
  };

  const handleDeleteCurrent = () => {
    if (!currentItem || !onDeleteStatusItem) return;
    onDeleteStatusItem(currentItem.id);
    setShowDeleteConfirm(false);
    if (totalItems <= 1) {
      onClose();
    } else {
      if (safeIndex >= totalItems - 1) {
        setCurrentIndex(Math.max(0, safeIndex - 1));
      }
      setProgress(0);
    }
  };

  if (!currentItem) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Main Story Container */}
      <div className="relative w-full max-w-md h-full max-h-[850px] flex flex-col justify-between overflow-hidden sm:rounded-2xl bg-black shadow-2xl">
        {/* Top Progress Segment Bars */}
        <div className="absolute top-0 inset-x-0 p-3 z-30 flex gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
          {contactStatus.items.map((item, idx) => {
            const isCompleted = idx < safeIndex;
            const isCurrent = idx === safeIndex;

            return (
              <div 
                key={item.id} 
                className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  style={{
                    width: isCompleted ? '100%' : isCurrent ? `${progress}%` : '0%',
                  }}
                  className="h-full bg-white transition-all duration-75 ease-linear"
                />
              </div>
            );
          })}
        </div>

        {/* Top Header info */}
        <div className="absolute top-6 inset-x-0 px-4 py-2 z-30 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={contactStatus.contactAvatar}
              alt={contactStatus.contactName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <p className="font-bold text-sm leading-tight flex items-center gap-2">
                <span>{contactStatus.contactName}</span>
                {isUserStatus && (
                  <span className="text-[10px] font-semibold bg-emerald-600/80 text-white px-2 py-0.5 rounded-full">
                    Tú
                  </span>
                )}
              </p>
              <p className="text-[11px] text-white/70 leading-tight">
                {currentItem.timestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle for Videos */}
            {currentItem.type === 'video' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}

            {/* Delete button if user's own status */}
            {isUserStatus && onDeleteStatusItem && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(true);
                  setShowDeleteConfirm(true);
                }}
                className="p-2 text-white/80 hover:text-red-400 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                title="Eliminar este estado"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6"
          >
            <div className="bg-[#202c33] text-[#e9edef] rounded-2xl p-5 w-full max-w-xs text-center space-y-4 shadow-2xl border border-[#2a3942]">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">¿Eliminar este estado?</h3>
                <p className="text-xs text-[#8696a0] mt-1">
                  Esta actualización se eliminará para todos tus contactos.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setIsPaused(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Story Body Canvas */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full">
          {currentItem.type === 'video' && currentItem.content && currentItem.content.trim() !== '' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                key={currentItem.id}
                ref={videoRef}
                src={currentItem.content}
                autoPlay
                playsInline
                muted={isMuted}
                loop={false}
                className="w-full h-full object-contain"
                onLoadStart={() => setIsBuffering(true)}
                onLoadedData={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onPlaying={() => setIsBuffering(false)}
                onWaiting={() => setIsBuffering(true)}
                onTimeUpdate={() => {
                  if (isBuffering) setIsBuffering(false);
                }}
                onEnded={handleNext}
                onError={(e) => {
                  e.preventDefault?.();
                  e.stopPropagation?.();
                  setIsBuffering(false);
                  handleNext();
                }}
              />

              {/* Video Buffering / Loading Indicator */}
              {isBuffering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs pointer-events-none z-20 transition-opacity">
                  <div className="w-12 h-12 border-3 border-white/20 border-t-[#00a884] rounded-full animate-spin mb-2 shadow-xl" />
                  <span className="text-xs font-semibold text-white drop-shadow">Cargando video...</span>
                </div>
              )}

              {currentItem.caption && (
                <div className="absolute bottom-16 inset-x-0 p-4 text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white text-sm font-medium z-10">
                  {currentItem.caption}
                </div>
              )}
            </div>
          ) : currentItem.type === 'image' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={currentItem.content}
                alt="Story content"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              {currentItem.caption && (
                <div className="absolute bottom-16 inset-x-0 p-4 text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white text-sm font-medium z-10">
                  {currentItem.caption}
                </div>
              )}
            </div>
          ) : (
            <div 
              style={{ backgroundColor: currentItem.backgroundColor || '#005c4b' }}
              className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white"
            >
              <p className="text-2xl font-serif leading-relaxed max-w-sm">
                {currentItem.content}
              </p>
              {currentItem.caption && (
                <p className="mt-4 text-sm text-white/80">
                  {currentItem.caption}
                </p>
              )}
            </div>
          )}

          {/* Left/Right click zone navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/60 transition-colors z-20"
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/60 transition-colors z-20"
            title="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Section: Reply Bar (for contacts) OR Views Counter (for user) */}
        <div className="absolute bottom-0 inset-x-0 p-3 z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
          {isUserStatus ? (
            <div className="flex items-center justify-center gap-2 py-1 text-white/90">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">
                Visto por {currentItem.viewsCount || 5} contactos
              </span>
            </div>
          ) : (
            <form 
              onSubmit={handleSendReply}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Responder a ${contactStatus.contactName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="flex-1 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/60 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2 rounded-full bg-emerald-500 text-slate-900 disabled:opacity-40 disabled:pointer-events-none hover:bg-emerald-400 transition-colors"
                title="Enviar respuesta"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
