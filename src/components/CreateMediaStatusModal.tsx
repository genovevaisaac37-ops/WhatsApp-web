import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Smile, 
  Send, 
  Sparkles, 
  Check, 
  RotateCcw,
  Type,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { UserSettings } from '../types/whatsapp.ts';

interface CreateMediaStatusModalProps {
  userSettings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onPublishStatus: (content: string, type: 'text' | 'image' | 'video', caption?: string, bgColor?: string) => void;
  initialMode?: 'media' | 'text';
}

interface SampleMedia {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  duration?: string;
}

const SAMPLE_MEDIA_ITEMS: SampleMedia[] = [
  {
    id: 'sample_v1',
    title: 'Océano y olas 🌊',
    type: 'video',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    duration: '0:46',
  },
  {
    id: 'sample_v2',
    title: 'Flores en floración 🌸',
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80',
    duration: '0:05',
  },
  {
    id: 'sample_v3',
    title: 'Animación aventura 🎬',
    type: 'video',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    duration: '0:52',
  },
  {
    id: 'sample_v4',
    title: 'Brisa en la naturaleza 🍃',
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
    duration: '0:05',
  },
  {
    id: 'sample_img1',
    title: 'Café de la mañana ☕️',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample_img2',
    title: 'Montañas y cielo 🏔️',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample_img3',
    title: 'Playa y palmeras 🌴',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample_img4',
    title: 'Atardecer urbano 🌆',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=300&auto=format&fit=crop&q=80',
  },
];

const TEXT_BACKGROUNDS = [
  '#005c4b', // WhatsApp Dark Green
  '#008069', // WhatsApp Teal
  '#7c3aed', // Purple
  '#2563eb', // Blue
  '#dc2626', // Red
  '#d97706', // Amber
  '#db2777', // Pink
  '#1e293b', // Slate
];

const POPULAR_EMOJIS = ['😊', '❤️', '🔥', '✨', '🏖️', '☕️', '🙌', '🎉', '✈️', '🌟', '💪', '🚀'];

export const CreateMediaStatusModal: React.FC<CreateMediaStatusModalProps> = ({
  userSettings,
  isOpen,
  onClose,
  onPublishStatus,
  initialMode = 'media',
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'text'>(initialMode);
  
  // Media state
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');
  const [mediaCaption, setMediaCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Text state
  const [textContent, setTextContent] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(TEXT_BACKGROUNDS[0]);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  // Emoji picker popup
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const isDark = userSettings.theme === 'dark';

  // Stop camera when unmounting or tab changes
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecordingVideo(false);
    setRecordingSeconds(0);
    setCameraError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedMediaUrl(null);
      setMediaCaption('');
      setTextContent('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'text') {
      stopCamera();
    }
  }, [activeTab]);

  // Start Webcam / Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error or permission denied:', err?.message || 'unknown');
      setCameraError('No se pudo acceder a la cámara. Por favor verifica los permisos de tu navegador o sube un archivo.');
    }
  };

  // Take photo from camera
  const handleCapturePhoto = () => {
    if (!cameraVideoRef.current) return;
    const video = cameraVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setSelectedMediaUrl(photoData);
    setSelectedMediaType('image');
  };

  // Start recording video from camera
  const handleStartRecordVideo = () => {
    if (!cameraStreamRef.current) return;
    try {
      recordedChunksRef.current = [];
      let options: MediaRecorderOptions | undefined = undefined;
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          options = { mimeType: 'video/webm;codecs=vp9' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }
      }
      const recorder = options ? new MediaRecorder(cameraStreamRef.current, options) : new MediaRecorder(cameraStreamRef.current);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        stopCamera();
        setSelectedMediaUrl(videoUrl);
        setSelectedMediaType('video');
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            // Max 30 seconds WhatsApp status limit
            handleStopRecordVideo();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e: any) {
      console.error('Error starting video recording:', e?.message || 'unknown error');
      setCameraError('Error al iniciar la grabación de video.');
    }
  };

  // Stop recording video
  const handleStopRecordVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingVideo(false);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
    // Reset input
    e.target.value = '';
  };

  const processSelectedFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi|ogv)$/i.test(fileName);
    const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);

    if (!isVid && !isImg) {
      setCameraError('Por favor selecciona un archivo de video o foto válido (MP4, WebM, MOV, JPG, PNG).');
      return;
    }

    if (isVid) {
      try {
        const objectUrl = URL.createObjectURL(file);
        setSelectedMediaUrl(objectUrl);
        setSelectedMediaType('video');
        if (!mediaCaption) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 40);
          if (cleanName.length > 2 && cleanName !== 'video') {
            setMediaCaption(cleanName);
          }
        }
        stopCamera();
      } catch (err: any) {
        console.error('Error creating video object URL:', err?.message || 'unknown');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setSelectedMediaUrl(result);
          setSelectedMediaType('image');
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Pick sample
  const handleSelectSample = (sample: SampleMedia) => {
    setSelectedMediaUrl(sample.url);
    setSelectedMediaType(sample.type);
    setMediaCaption(sample.title);
    stopCamera();
  };

  // Publish Status
  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      if (activeTab === 'media') {
        if (!selectedMediaUrl) {
          setIsPublishing(false);
          return;
        }
        onPublishStatus(
          selectedMediaUrl,
          selectedMediaType,
          mediaCaption.trim() || undefined
        );
      } else {
        if (!textContent.trim()) {
          setIsPublishing(false);
          return;
        }
        onPublishStatus(
          textContent.trim(),
          'text',
          undefined,
          selectedBgColor
        );
      }
      setIsPublishing(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-md max-h-[88vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border transition-colors ${
          isDark 
            ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
            : 'bg-white border-[#e9edef] text-[#111b21]'
        }`}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0">
              {activeTab === 'media' ? (
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Type className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-xs leading-tight">
                {activeTab === 'media' ? 'Nuevo estado' : 'Estado de texto'}
              </h2>
              <p className="text-[10px] text-[#8696a0]">
                Visible durante 24 horas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode switch tabs */}
            <div className={`flex p-0.5 rounded-md border ${isDark ? 'bg-[#111b21] border-[#2a3942]' : 'bg-[#e9edef] border-[#d1d7db]'}`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('media');
                  stopCamera();
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  activeTab === 'media'
                    ? 'bg-[#00a884] text-white shadow-xs'
                    : isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Foto/Video</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('text');
                  stopCamera();
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-[#00a884] text-white shadow-xs'
                    : isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                }`}
              >
                <Type className="w-3 h-3" />
                <span>Texto</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#323d45] text-[#aebac1]' : 'hover:bg-slate-200 text-[#54656f]'
              }`}
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3">
          {activeTab === 'media' ? (
            <div>
              {/* If media is selected, show rich preview */}
              {selectedMediaUrl ? (
                <div className="space-y-2.5">
                  <div className="relative w-full aspect-16/10 max-h-[220px] bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-md border border-black/40">
                    {selectedMediaType === 'video' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          key={selectedMediaUrl}
                          ref={videoPreviewRef}
                          src={selectedMediaUrl}
                          className="w-full h-full object-contain"
                          autoPlay
                          loop
                          playsInline
                          muted={isMuted}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onError={() => {
                            // Handled safely
                          }}
                        />
                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-20 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-full text-white text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              if (videoPreviewRef.current) {
                                if (isPlaying) {
                                  videoPreviewRef.current.pause();
                                } else {
                                  videoPreviewRef.current.play();
                                }
                              }
                            }}
                            className="p-0.5 hover:text-[#25d366] transition-colors"
                            title={isPlaying ? 'Pausar' : 'Reproducir'}
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMuted(!isMuted);
                              if (videoPreviewRef.current) {
                                videoPreviewRef.current.muted = !isMuted;
                              }
                            }}
                            className="p-0.5 hover:text-[#25d366] transition-colors"
                            title={isMuted ? 'Activar sonido' : 'Silenciar'}
                          >
                            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </button>
                          <span className="text-[10px] text-white/80 font-mono flex items-center gap-1 ml-0.5 border-l border-white/20 pl-1.5">
                            <Video className="w-2.5 h-2.5 text-[#25d366]" />
                            Video
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={selectedMediaUrl}
                          alt="Estado preview"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-white text-[10px] flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5 text-[#25d366]" />
                          Foto
                        </div>
                      </div>
                    )}

                    {/* Change Media Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedMediaUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-xs flex items-center gap-1 text-[11px] z-20"
                      title="Cambiar foto o video"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Añade un comentario..."
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        maxLength={120}
                        className={`w-full py-1.5 pl-3 pr-8 rounded-lg text-xs border focus:outline-none transition-all ${
                          isDark 
                            ? 'bg-[#202c33] border-[#2a3942] text-[#e9edef] placeholder-[#8696a0] focus:border-[#00a884]' 
                            : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21] placeholder-[#54656f] focus:border-[#00a884]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 p-1 text-[#8696a0] hover:text-[#00a884] transition-colors"
                        title="Añadir emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Emoji Quick Picker */}
                    {showEmojiPicker && (
                      <div className={`p-1.5 rounded-lg border flex flex-wrap gap-1.5 ${isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#e9edef]'}`}>
                        {POPULAR_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setMediaCaption((prev) => prev + emoji);
                            }}
                            className="text-base p-1 hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : isCameraActive ? (
                /* Live Camera Preview & Capture */
                <div className="space-y-3">
                  <div className="relative w-full aspect-16/10 max-h-[220px] bg-black rounded-lg overflow-hidden shadow-md border border-black/40">
                    <video
                      ref={(node) => {
                        cameraVideoRef.current = node;
                        if (node && cameraStreamRef.current) {
                          node.srcObject = cameraStreamRef.current;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Handled safely
                      }}
                    />

                    {isRecordingVideo && (
                      <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        0:{recordingSeconds.toString().padStart(2, '0')} / 0:30
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      title="Cancelar cámara"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 py-1">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={isRecordingVideo}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Foto
                    </button>

                    {!isRecordingVideo ? (
                      <button
                        type="button"
                        onClick={handleStartRecordVideo}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-xs hover:bg-red-700 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Grabar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecordVideo}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs border border-red-500 hover:bg-black transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5 text-red-400" />
                        Usar video
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Select or Upload Media Screen */
                <div className="space-y-3">
                  {cameraError && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Drag and Drop / Upload Box */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#00a884] bg-[#00a884]/10'
                        : isDark
                        ? 'border-[#2a3942] hover:border-[#00a884] bg-[#111b21]/50 hover:bg-[#202c33]/40'
                        : 'border-[#d1d7db] hover:border-[#00a884] bg-[#f8f9fa] hover:bg-[#f0f2f5]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-9 h-9 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center mb-1.5">
                      <Upload className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <p className="font-semibold text-xs mb-0.5">
                      Elige una foto o video de tu equipo
                    </p>
                    <p className="text-[10px] text-[#8696a0] max-w-xs mb-2.5">
                      MP4, WebM, JPG, PNG, GIF o arrastra tu archivo aquí
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span className="px-3 py-1 rounded-full font-semibold text-[11px] bg-[#00a884] text-white shadow-xs hover:bg-[#008f6f] transition-colors">
                        Examinar archivos
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCamera();
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-[11px] border transition-colors ${
                          isDark 
                            ? 'border-[#2a3942] bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef]' 
                            : 'border-[#d1d7db] bg-white hover:bg-slate-100 text-[#111b21]'
                        }`}
                      >
                        <Camera className="w-3 h-3 text-[#00a884]" />
                        <span>Usar cámara</span>
                      </button>
                    </div>
                  </div>

                  {/* Ready-to-use Sample Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8696a0] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#00a884]" />
                        Muestras sugeridas (1 clic)
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_MEDIA_ITEMS.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSample(item)}
                          className={`group relative rounded-lg overflow-hidden aspect-4/3 cursor-pointer border transition-all hover:scale-[1.02] shadow-xs ${
                            isDark ? 'border-[#2a3942] bg-[#202c33]' : 'border-[#e9edef] bg-slate-100'
                          }`}
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-1">
                            <span className="self-end px-1 py-0.5 rounded text-[8px] font-bold bg-black/60 text-white flex items-center gap-0.5">
                              {item.type === 'video' ? (
                                <>
                                  <Video className="w-2 h-2 text-[#25d366]" />
                                  <span>{item.duration || 'Vid'}</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-2 h-2 text-[#25d366]" />
                                  <span>Foto</span>
                                </>
                              )}
                            </span>
                            <p className="text-white text-[9px] font-medium truncate drop-shadow-xs">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Text Status Composer */
            <div className="space-y-3">
              <div 
                style={{ backgroundColor: selectedBgColor }}
                className="w-full h-36 sm:h-40 p-4 rounded-xl shadow-inner flex flex-col justify-between text-white transition-colors duration-200"
              >
                <div className="flex items-center justify-between opacity-80 text-[10px]">
                  <span className="font-semibold tracking-wide uppercase">Texto de estado</span>
                  <span>{textContent.length}/200</span>
                </div>

                <textarea
                  autoFocus
                  rows={3}
                  maxLength={200}
                  placeholder="Escribe un estado..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-transparent text-center text-base sm:text-lg font-sans placeholder-white/60 focus:outline-none resize-none leading-relaxed"
                />

                {/* Popular emojis quick insert */}
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-0.5">
                  {POPULAR_EMOJIS.slice(0, 8).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setTextContent((p) => p + em)}
                      className="text-sm p-0.5 hover:scale-125 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wider">
                  Color de fondo
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {TEXT_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      style={{ backgroundColor: bg }}
                      onClick={() => setSelectedBgColor(bg)}
                      className={`w-6 h-6 rounded-full border transition-transform flex items-center justify-center ${
                        selectedBgColor === bg ? 'border-white scale-110 shadow-xs ring-1 ring-[#00a884]' : 'border-transparent'
                      }`}
                    >
                      {selectedBgColor === bg && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className={`flex items-center justify-between px-3.5 py-2 border-t ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
          <div className="text-[10px] text-[#8696a0] flex items-center gap-1">
            <span>🔒 Cifrado</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
              }`}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || (activeTab === 'media' ? !selectedMediaUrl : !textContent.trim())}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-xs bg-[#00a884] text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#008f6f] active:scale-95 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Publicar estado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
