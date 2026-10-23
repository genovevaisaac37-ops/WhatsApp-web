import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Check, 
  Edit2, 
  User, 
  Info, 
  Phone, 
  X,
  Upload,
  Sparkles,
  Link,
  Trash2,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserSettings } from '../types/whatsapp.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';
import { validatePhoneNumber } from '../utils/phoneValidator.ts';

interface ProfileEditorModalProps {
  userSettings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
];

const PRESET_STATUSES_ES = [
  '¡Hola! Estoy usando WhatsApp.',
  'Disponible para charlar 👋',
  'Ocupado ⛔️ Solo llamadas de emergencia',
  'En el trabajo 💻',
  'En una reunión importante ⏳',
  'En el gimnasio 🏋️‍♂️',
  'De viaje ✈️🌴',
  'Batería baja 🔋',
  'Amante de la música y la tecnología 🎧',
  'Café y programación ☕️✨',
];

const COUNTRY_CODES = [
  { name: 'España', code: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: 'México', code: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: 'Estados Unidos / Canadá', code: '+1', flag: '🇺🇸', placeholder: '(555) 234-5678' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷', placeholder: '9 11 2345-6789' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { name: 'Chile', code: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { name: 'Perú', code: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪', placeholder: '412 123 4567' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨', placeholder: '99 123 4567' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹', placeholder: '5123 4567' },
  { name: 'República Dominicana', code: '+1-809', flag: '🇩🇴', placeholder: '809 123 4567' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴', placeholder: '7123 4567' },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷', placeholder: '8123 4567' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾', placeholder: '91 234 567' },
];

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  userSettings,
  onUpdateSettings,
  onClose,
}) => {
  const isDark = userSettings.theme === 'dark';

  const [name, setName] = useState(userSettings.profile.name || 'Mi Perfil');
  const [phone, setPhone] = useState(userSettings.profile.phone || '+34 612 345 678');
  const [status, setStatus] = useState(userSettings.profile.status || '¡Hola! Estoy usando WhatsApp.');
  const [avatar, setAvatar] = useState(userSettings.profile.avatar || PRESET_AVATARS[0]);
  
  // Country selection helper
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const phoneValidation = validatePhoneNumber(phone.trim());

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    if (!phoneValidation.isValid) {
      return; // Do not allow saving incorrect phone numbers
    }

    onUpdateSettings({
      profile: {
        name: name.trim(),
        phone: phoneValidation.formatted || phone.trim(),
        status: status.trim() || '¡Hola! Estoy usando WhatsApp.',
        avatar: avatar.trim() || userSettings.profile.avatar,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setShowAvatarPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCountrySelect = (c: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(c);
    setShowCountrySelector(false);
    // If phone currently has no matching code or user is entering a new number, prefix code
    const rawNumber = phone.replace(/^\+[0-9-]+\s*/, '');
    setPhone(`${c.code} ${rawNumber || c.placeholder}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh] transition-colors duration-150 ${
          isDark 
            ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' 
            : 'bg-white border-[#e9edef] text-[#111b21]'
        }`}
      >
        {/* Header Superior WhatsApp */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${
          isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#008069] text-white border-transparent'
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              type="button"
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#111b21] text-[#aebac1]' : 'hover:bg-white/20 text-white'
              }`}
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <WhatsAppLogo size={22} variant={isDark ? 'green' : 'white'} />
              <div>
                <h2 className="text-base font-bold leading-tight">Configurar Perfil de WhatsApp</h2>
                <p className="text-[11px] opacity-80 leading-tight">Crea tu número, nombre y foto de perfil</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            type="button"
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-[#111b21] text-[#8696a0]' : 'hover:bg-white/20 text-white'}`}
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Tarjeta de Vista Previa en Vivo */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isDark ? 'bg-[#202c33]/70 border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#d1d7db]'
          }`}>
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#00a884] shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#202c33]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a884]">
                  Vista previa de tu contacto
                </span>
                <span className="text-[10px] text-[#25d366] font-medium">En línea</span>
              </div>
              <h3 className="text-base font-bold truncate leading-snug">{name || 'Tu Nombre'}</h3>
              <p className="text-xs font-mono text-[#00a884] font-medium truncate">{phone || '+34 000 000 000'}</p>
              <p className="text-xs text-[#8696a0] truncate mt-0.5">{status}</p>
            </div>
          </div>

          {/* 1. Foto de Perfil */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover border-4 border-[#00a884] shadow-xl transition-transform group-hover:scale-102"
              />
              <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-semibold">
                <Camera className="w-6 h-6 mb-1 text-[#25d366]" />
                <span>CAMBIAR</span>
                <span>FOTO</span>
              </div>

              {/* Botón flotante para cambiar foto */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="text-xs text-[#00a884] hover:underline font-semibold mt-3"
            >
              {showAvatarPicker ? 'Ocultar selector de foto' : 'Cambiar foto de perfil de WhatsApp'}
            </button>
          </div>

          {/* Selector y Subida de Fotos / Avatares */}
          {showAvatarPicker && (
            <div className={`p-4 rounded-xl border space-y-3 transition-all ${
              isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00a884] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Elige un avatar o sube tu foto</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-[#8696a0] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cuadrícula de fotos predeterminadas */}
              <div>
                <p className="text-[11px] text-[#8696a0] mb-2 font-medium">Avatares populares:</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {PRESET_AVATARS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(presetUrl);
                        setShowAvatarPicker(false);
                      }}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                        avatar === presetUrl ? 'border-[#00a884] scale-105 ring-2 ring-[#00a884]/50' : 'border-transparent'
                      }`}
                    >
                      <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de subir archivo local */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#2f3b43]/40">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                    isDark ? 'border-[#2f3b43] hover:bg-[#182229] text-[#e9edef]' : 'border-[#d1d7db] hover:bg-white text-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#00a884]" />
                  <span>Subir foto desde este dispositivo</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Pegar enlace URL de imagen */}
              <div className="flex items-center gap-2">
                <div className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${
                  isDark ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-white border-[#d1d7db]'
                }`}>
                  <Link className="w-3.5 h-3.5 text-[#8696a0]" />
                  <input
                    type="url"
                    placeholder="O pega enlace de foto (https://...)"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setAvatar(customAvatarUrl.trim());
                      setCustomAvatarUrl('');
                      setShowAvatarPicker(false);
                    }
                  }}
                  disabled={!customAvatarUrl.trim()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#00a884] text-[#111b21] disabled:opacity-40 hover:bg-[#02906f]"
                >
                  Usar
                </button>
              </div>
            </div>
          )}

          {/* 2. Campo: Nombre de WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="text-[#00a884] font-semibold flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Tu nombre de WhatsApp</span>
              </label>
              <span className="text-[#8696a0] font-mono text-[11px]">{25 - name.length}</span>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
              isDark 
                ? 'bg-[#202c33] border-[#2f3b43] focus-within:border-[#00a884]' 
                : 'bg-[#f0f2f5] border-[#d1d7db] focus-within:border-[#008069]'
            }`}>
              <input
                type="text"
                required
                maxLength={25}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre completo"
                className="w-full bg-transparent text-sm font-semibold focus:outline-none"
              />
              <Edit2 className="w-4 h-4 text-[#8696a0]" />
            </div>
            <p className="text-[11px] text-[#8696a0] px-1 leading-normal">
              Este nombre no es tu nombre de usuario ni una contraseña. Será visible para todos tus contactos y chats grupales de WhatsApp.
            </p>
          </div>

          {/* 3. Campo: Número de teléfono de WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="text-[#00a884] font-semibold flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>Número de teléfono de WhatsApp</span>
              </label>
              <span className="text-emerald-500 font-mono text-[11px]">Verificado</span>
            </div>

            <div className="space-y-2">
              {/* Selector de país rápido */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCountrySelector(!showCountrySelector)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-colors ${
                    isDark ? 'bg-[#202c33] border-[#2f3b43] hover:bg-[#26353d]' : 'bg-[#f0f2f5] border-[#d1d7db] hover:bg-white'
                  }`}
                  title="Seleccionar país o prefijo"
                >
                  <span className="text-base leading-none">{selectedCountry.flag}</span>
                  <span className="font-mono text-[#00a884]">{selectedCountry.code}</span>
                  <Globe className="w-3.5 h-3.5 text-[#8696a0]" />
                </button>

                <div className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
                  phoneValidation.isValid
                    ? isDark ? 'bg-[#202c33] border-[#00a884]' : 'bg-[#f0f2f5] border-[#00a884]'
                    : isDark ? 'bg-[#202c33] border-rose-500/70' : 'bg-[#f0f2f5] border-rose-400'
                }`}>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 612 34 56 78"
                    className="w-full bg-transparent text-sm font-mono font-medium focus:outline-none"
                  />
                  <Edit2 className="w-4 h-4 text-[#8696a0]" />
                </div>
              </div>

              {/* Real-time Phone Validation Status */}
              <div className="px-1">
                {phoneValidation.isValid ? (
                  <p className="text-[11px] text-[#00a884] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Número válido ({phoneValidation.formatted})</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneValidation.errorMessage}</span>
                  </p>
                )}
              </div>

              {/* Menú de selección de país */}
              {showCountrySelector && (
                <div className={`p-2 rounded-xl border max-h-48 overflow-y-auto space-y-1 text-xs shadow-lg ${
                  isDark ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#d1d7db]'
                }`}>
                  <div className="px-2 py-1 text-[11px] font-bold text-[#00a884] uppercase">
                    Selecciona tu país / prefijo internacional:
                  </div>
                  {COUNTRY_CODES.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        isDark ? 'hover:bg-[#182229]' : 'hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="font-mono text-[#00a884] font-semibold">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#8696a0] px-1 leading-normal">
              Este número se utilizará para que tus contactos puedan enviarte mensajes y realizar llamadas de voz y video en WhatsApp.
            </p>
          </div>

          {/* 4. Campo: Info. / Estado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="text-[#00a884] font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Info. / Estado de WhatsApp</span>
              </label>
              <span className="text-[#8696a0] font-mono text-[11px]">{140 - status.length}</span>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
              isDark 
                ? 'bg-[#202c33] border-[#2f3b43] focus-within:border-[#00a884]' 
                : 'bg-[#f0f2f5] border-[#d1d7db] focus-within:border-[#008069]'
            }`}>
              <textarea
                rows={2}
                maxLength={140}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="¡Hola! Estoy usando WhatsApp."
                className="w-full bg-transparent text-sm resize-none focus:outline-none leading-normal"
              />
              <Edit2 className="w-4 h-4 text-[#8696a0] shrink-0" />
            </div>

            {/* Chips con estados predeterminados en español */}
            <div>
              <p className="text-[11px] text-[#8696a0] mb-1.5 font-medium px-1">O selecciona un estado rápido:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_STATUSES_ES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStatus(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      status === preset
                        ? 'border-[#00a884] text-[#00a884] bg-[#00a884]/15 font-semibold scale-102'
                        : isDark ? 'border-[#2f3b43] text-[#8696a0] hover:text-[#d1d7db]' : 'border-[#d1d7db] text-[#54656f] hover:text-black'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de Acción / Guardar */}
          <div className="pt-4 border-t border-[#2a3942]/40 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isDark ? 'text-[#8696a0] hover:text-white' : 'text-[#54656f] hover:text-black'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#00a884] text-[#111b21] hover:bg-[#02906f] active:scale-95 transition-all shadow-md disabled:opacity-40"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Perfil guardado!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardar perfil de WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
