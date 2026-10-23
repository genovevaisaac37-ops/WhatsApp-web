import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Volume2, 
  Bell, 
  User, 
  RotateCcw, 
  Check, 
  Edit2, 
  Camera,
  Smartphone,
  Info,
  Sparkles,
  Palette,
  Type
} from 'lucide-react';
import { UserSettings } from '../types/whatsapp.ts';
import { playSendSound, playReceiveSound } from '../utils/soundEffects.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';
import { FONT_COLOR_OPTIONS, getFontColorHex } from '../utils/fontColors.ts';

interface SettingsDrawerProps {
  userSettings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onResetData: () => void;
  onOpenProfileEdit: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  userSettings,
  onUpdateSettings,
  onResetData,
  onOpenProfileEdit,
}) => {
  const isDark = userSettings.theme === 'dark';

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userSettings.profile.name);

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState(userSettings.profile.status);

  const handleSaveName = () => {
    if (!nameValue.trim()) return;
    onUpdateSettings({
      profile: { ...userSettings.profile, name: nameValue.trim() },
    });
    setIsEditingName(false);
  };

  const handleSaveStatus = () => {
    if (!statusValue.trim()) return;
    onUpdateSettings({
      profile: { ...userSettings.profile, status: statusValue.trim() },
    });
    setIsEditingStatus(false);
  };

  const testAudio = () => {
    playSendSound(true);
    setTimeout(() => {
      playReceiveSound(true);
    }, 400);
  };

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[400px] border-r select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      {/* Encabezado */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <div className="flex items-center gap-2">
          <WhatsAppLogo size={22} />
          <h1 className="text-xl font-bold tracking-tight">Ajustes</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tarjeta de Perfil de WhatsApp */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-[#202c33]/50 border border-[#2a3942]/70 text-center">
          <div className="relative group mb-3 cursor-pointer" onClick={onOpenProfileEdit}>
            <img
              src={userSettings.profile.avatar}
              alt={userSettings.profile.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#00a884] shadow-md"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenProfileEdit();
              }}
              title="Cambiar foto de perfil"
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>CAMBIAR</span>
            </button>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#25d366] rounded-full border-2 border-[#202c33]" />
          </div>

          {/* Nombre y Edición Rápida */}
          <div className="w-full">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00a884]">
              Tu Perfil de WhatsApp
            </span>

            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 mt-1">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="px-2.5 py-1 text-sm bg-black/20 border border-[#00a884] rounded-lg focus:outline-none text-center font-bold"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 text-emerald-400" title="Guardar">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center gap-1.5 group cursor-pointer mt-0.5" 
                onClick={() => setIsEditingName(true)}
                title="Haz clic para editar tu nombre"
              >
                <h3 className="font-bold text-lg">{userSettings.profile.name}</h3>
                <Edit2 className="w-3.5 h-3.5 text-[#8696a0] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Número de WhatsApp */}
            <div className="flex items-center justify-center gap-1.5 mt-1 text-[#00a884] font-mono text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{userSettings.profile.phone}</span>
            </div>

            {/* Estado / Info */}
            {isEditingStatus ? (
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="text"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-black/20 border border-[#00a884] rounded-lg focus:outline-none w-full text-center"
                  autoFocus
                />
                <button onClick={handleSaveStatus} className="p-1 text-emerald-400" title="Guardar">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center gap-1.5 mt-1.5 group cursor-pointer" 
                onClick={() => setIsEditingStatus(true)}
                title="Haz clic para editar tu info"
              >
                <Info className="w-3 h-3 text-[#8696a0]" />
                <p className="text-xs text-[#8696a0] italic">{userSettings.profile.status}</p>
                <Edit2 className="w-3 h-3 text-[#8696a0] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Botón principal para abrir el formulario completo */}
            <button
              onClick={onOpenProfileEdit}
              className="mt-4 px-5 py-2 text-xs font-bold rounded-xl bg-[#00a884] text-[#111b21] hover:bg-[#02906f] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 mx-auto"
            >
              <User className="w-4 h-4" />
              <span>Editar nombre, número y foto</span>
            </button>
          </div>
        </div>

        {/* Ajustes de Tema / Apariencia */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
            Tema y Apariencia
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'border-[#00a884] bg-[#00a884]/15 text-[#00a884] font-bold'
                  : 'border-[#2a3942] hover:bg-[#202c33]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Tema Oscuro</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                !isDark
                  ? 'border-[#008069] bg-[#008069]/15 text-[#008069] font-bold'
                  : 'border-[#2a3942] hover:bg-[#202c33]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Tema Claro</span>
            </button>
          </div>
        </div>

        {/* Color de Letras / Fuente de los Mensajes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#00a884]" />
              <span>Color de Letras en Chats</span>
            </h4>
            {(userSettings.chatFontColor && userSettings.chatFontColor !== 'default') && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ chatFontColor: 'default' })}
                className="text-[11px] font-semibold text-[#00a884] hover:underline cursor-pointer"
              >
                Restablecer
              </button>
            )}
          </div>

          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#202c33]/40 border-[#2a3942]/60' : 'bg-white border-[#e2e5e8]'
          }`}>
            <p className="text-[11px] text-[#8696a0]">
              Elige el color para el texto y las letras de tus conversaciones:
            </p>

            {/* Color Palette Grid */}
            <div className="grid grid-cols-3 gap-2">
              {FONT_COLOR_OPTIONS.map((col) => {
                const currentColor = userSettings.chatFontColor || 'default';
                const isSelected = currentColor === col.id || (col.id === 'default' && (!currentColor || currentColor === 'default'));
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onUpdateSettings({ chatFontColor: col.id })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00a884] bg-[#00a884]/15 shadow-xs font-bold'
                        : isDark
                        ? 'border-[#2a3942] hover:bg-[#202c33] hover:border-[#374248]'
                        : 'border-[#e2e5e8] hover:bg-[#f0f2f5]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${col.bgDotClass}`} />
                    <span 
                      style={col.hex ? { color: col.hex } : undefined}
                      className="truncate text-[11px]"
                    >
                      {col.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Picker Input */}
            <div className={`flex items-center justify-between pt-2 border-t ${
              isDark ? 'border-white/10' : 'border-[#e2e5e8]'
            }`}>
              <span className="text-xs text-[#8696a0] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Color personalizado:</span>
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getFontColorHex(userSettings.chatFontColor) || '#00f0ff'}
                  onChange={(e) => onUpdateSettings({ chatFontColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer p-0 bg-transparent"
                  title="Elige cualquier color personalizado con la paleta"
                />
                <span className="text-[10px] font-mono text-[#8696a0]">
                  {getFontColorHex(userSettings.chatFontColor) || 'Predeterminado'}
                </span>
              </div>
            </div>

            {/* Live Message Preview */}
            <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-[#e2e5e8]'}`}>
              <span className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Vista previa de lectura:
              </span>
              <div className={`p-3 rounded-xl border shadow-xs flex items-center justify-between ${
                isDark ? 'bg-[#005c4b]/80 border-[#00a884]/40' : 'bg-[#d9fdd3] border-[#25d366]/40'
              }`}>
                <p 
                  style={getFontColorHex(userSettings.chatFontColor) ? { color: getFontColorHex(userSettings.chatFontColor) } : undefined}
                  className="text-xs font-medium leading-relaxed"
                >
                  ¡Hola! Así se ven las letras de tus mensajes con este color. ✨
                </p>
                <span className={`text-[10px] ml-2 whitespace-nowrap ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  10:45 AM ✓✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sonidos y Notificaciones */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
            Sonidos y Notificaciones
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#00a884]" />
                <div>
                  <p className="text-xs font-semibold">Sonidos de la aplicación</p>
                  <p className="text-[11px] text-[#8696a0]">Sonido al enviar y recibir mensajes, timbres de llamada</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={testAudio}
              className="w-full py-2 text-xs font-semibold text-[#00a884] hover:bg-[#00a884]/10 rounded-lg transition-colors border border-[#00a884]/30"
            >
              Probar efecto de sonido 🔔
            </button>
          </div>
        </div>

        {/* Preferencias de Chat */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
            Preferencias de Conversación
          </h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#202c33]/30 border border-[#2a3942]/40">
            <div>
              <p className="text-xs font-semibold">Enter para enviar</p>
              <p className="text-[11px] text-[#8696a0]">Al presionar Enter se enviará el mensaje</p>
            </div>
            <input
              type="checkbox"
              checked={userSettings.enterIsSend}
              onChange={(e) => onUpdateSettings({ enterIsSend: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Fondo de Pantalla Neón Arcoíris (Celeste y Naranja) */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Fondo de Pantalla Neón Arcoíris</span>
          </h4>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#061118] via-[#0c1d29] to-[#1c0f04] border border-[#00f0ff]/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#a855f7] to-[#ff6d00] flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Neón Celeste & Naranja</h5>
                  <p className="text-[11px] text-[#8696a0]">Se muestra al inicio y cada 3 minutos</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={userSettings.wallpaper === 'neon_rainbow' || userSettings.neonRainbowEnabled !== false}
                onChange={(e) => {
                  onUpdateSettings({ 
                    wallpaper: e.target.checked ? 'neon_rainbow' : 'doodle',
                    neonRainbowEnabled: e.target.checked 
                  });
                }}
                className="w-4 h-4 accent-[#00f0ff] rounded cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-[#aebac1] leading-relaxed">
              Ilumina el fondo del chat con un vibrante degradado neón en celeste eléctrico y naranja ardiente estilo arcoíris. Se activa automáticamente al abrir cualquier conversación y repite su destello luminoso cada 3 minutos.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-[11px] text-[#8696a0]">Frecuencia del resplandor:</span>
              <span className="font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-full border border-[#00f0ff]/30">
                Cada 3 minutos ⏱️
              </span>
            </div>
          </div>
        </div>

        {/* Restablecer Datos de Demostración */}
        <div className="pt-4 border-t border-[#2a3942]/60 space-y-4">
          <button
            onClick={() => {
              if (confirm('¿Deseas restablecer los mensajes y chats a los datos iniciales?')) {
                onResetData();
              }
            }}
            className="w-full py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer datos iniciales de WhatsApp</span>
          </button>

          <div className="flex flex-col items-center justify-center pt-2 text-[#8696a0]">
            <WhatsAppLogo size={24} variant="gray" />
            <p className="text-[11px] font-semibold mt-1">WhatsApp Web</p>
            <p className="text-[10px] opacity-70">Versión 2.2614.8 · Cifrado de extremo a extremo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
