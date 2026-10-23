import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { Chat, UserSettings } from '../types/whatsapp.ts';
import { 
  startRingtone, 
  stopRingtone, 
  playCallConnectedSound, 
  playCallEndSound 
} from '../utils/soundEffects.ts';

interface CallModalProps {
  chat: Chat;
  callType: 'voice' | 'video';
  userSettings: UserSettings;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  chat,
  callType,
  userSettings,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Play ringing sound and automatically transition to connected after 2.5 seconds
  useEffect(() => {
    startRingtone(userSettings.soundEnabled);

    const connectTimeout = setTimeout(() => {
      stopRingtone();
      playCallConnectedSound(userSettings.soundEnabled);
      setCallStatus('connected');
    }, 2800);

    return () => {
      clearTimeout(connectTimeout);
      stopRingtone();
    };
  }, [userSettings.soundEnabled]);

  // Connected call duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // WebRTC User Camera Access
  useEffect(() => {
    if (callType === 'video' && isVideoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          setHasCameraStream(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera not available or denied, keep simulated video
          setHasCameraStream(false);
        });
    } else {
      setHasCameraStream(false);
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setHasCameraStream(false);
      }
    };
  }, [callType, isVideoOn]);

  const handleEndCall = () => {
    stopRingtone();
    playCallEndSound(userSettings.soundEnabled);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onEndCall();
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-3 rounded-2xl bg-[#111b21] border border-[#2f3b43] text-white shadow-2xl">
        <img
          src={chat.avatar}
          alt={chat.name}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-xs font-bold">{chat.name}</p>
          <p className="text-[11px] text-emerald-400 font-mono">
            {callStatus === 'ringing' ? 'Llamando...' : formatCallTime(callSeconds)}
          </p>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-full hover:bg-white/10"
          title="Maximizar"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleEndCall}
          className="p-2 rounded-full bg-red-600 hover:bg-red-500 text-white"
          title="Finalizar llamada"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg h-[580px] rounded-3xl overflow-hidden shadow-2xl bg-[#111b21] border border-[#2a3942] flex flex-col justify-between p-6">
        {/* Top bar controls */}
        <div className="flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cifrado de extremo a extremo
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar llamada"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Video stream or Avatar center */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-4">
          {callType === 'video' && isVideoOn ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-[#2a3942] flex items-center justify-center">
              {/* Remote simulation video */}
              <img
                src={chat.avatar}
                alt={chat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* PiP Local User camera */}
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-xl overflow-hidden bg-black/80 border-2 border-white/20 shadow-lg flex items-center justify-center">
                {hasCameraStream ? (
                  <video
                    ref={(node) => {
                      localVideoRef.current = node;
                      if (node && mediaStreamRef.current) {
                        node.srcObject = mediaStreamRef.current;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                    onError={() => setHasCameraStream(false)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#202c33] p-2 text-center select-none">
                    <img
                      src={userSettings.profile.avatar}
                      alt="Tú"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#00a884] mb-1.5 shadow-md"
                    />
                    <span className="text-[11px] font-semibold text-white truncate max-w-full">
                      {userSettings.profile.name || 'Tú'}
                    </span>
                    <span className="text-[9px] text-[#00a884] font-medium">Cámara</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#00a884] shadow-xl"
                />
                {callStatus === 'ringing' && (
                  <span className="absolute -inset-2 rounded-full border-2 border-[#00a884] animate-ping opacity-75" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{chat.name}</h3>
              <p className="text-sm font-medium text-emerald-400 font-mono tabular-nums">
                {callStatus === 'ringing' ? 'Llamada de WhatsApp · Llamando...' : formatCallTime(callSeconds)}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Call Control Action Buttons */}
        <div className="flex items-center justify-center gap-4 z-20 pt-2">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-colors ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3.5 rounded-full transition-colors ${
              !isVideoOn ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isVideoOn ? 'Apagar cámara' : 'Encender cámara'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Speaker toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full transition-colors ${
              !isSpeakerOn ? 'bg-white/5 text-slate-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Altavoz"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-xl transition-transform active:scale-95 ml-2"
            title="Finalizar llamada"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
