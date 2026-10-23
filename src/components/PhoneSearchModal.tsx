import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Chat, UserSettings } from '../types/whatsapp.ts';
import { 
  POPULAR_COUNTRIES, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  CountryInfo 
} from '../utils/phoneValidator.ts';
import { WhatsAppLogo } from './WhatsAppLogo.tsx';

interface PhoneSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  userSettings: UserSettings;
  onStartChatWithPhone: (phone: string, contactName?: string) => void;
  onSelectExistingChat: (chatId: string) => void;
}

export const PhoneSearchModal: React.FC<PhoneSearchModalProps> = ({
  isOpen,
  onClose,
  chats,
  userSettings,
  onStartChatWithPhone,
  onSelectExistingChat,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(POPULAR_COUNTRIES[0]);
  const [phoneInput, setPhoneInput] = useState('');
  const [contactNameInput, setContactNameInput] = useState('');
  const [copiedMyNumber, setCopiedMyNumber] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'my_number' | 'directory'>('search');

  const isDark = userSettings.theme === 'dark';

  // Full validation calculation
  const validation = useMemo(() => {
    if (!phoneInput.trim()) return null;
    
    // Combine selected country code if user didn't start with +
    const fullNumber = phoneInput.trim().startsWith('+') 
      ? phoneInput.trim() 
      : `${selectedCountry.code} ${phoneInput.trim()}`;

    return validatePhoneNumber(fullNumber, selectedCountry.code);
  }, [phoneInput, selectedCountry]);

  // Check if this number already matches any existing chat/friend or user's profile
  const matchedChat = useMemo(() => {
    if (!validation || !validation.rawDigits) return null;
    return chats.find((c) => {
      if (!c.phone) return false;
      const chatDigits = c.phone.replace(/\D/g, '');
      return chatDigits.includes(validation.rawDigits) || validation.rawDigits.includes(chatDigits);
    });
  }, [chats, validation]);

  // Check if matches the user's own number
  const isMyNumberMatch = useMemo(() => {
    if (!validation || !validation.rawDigits || !userSettings.profile.phone) return false;
    const myDigits = userSettings.profile.phone.replace(/\D/g, '');
    return myDigits && (myDigits === validation.rawDigits || validation.rawDigits.includes(myDigits));
  }, [userSettings.profile.phone, validation]);

  if (!isOpen) return null;

  const handleStartChat = () => {
    if (!validation || !validation.isValid) return;

    if (matchedChat) {
      onSelectExistingChat(matchedChat.id);
      onClose();
      return;
    }

    const displayName = contactNameInput.trim() || `Contacto (${validation.formatted})`;
    onStartChatWithPhone(validation.formatted, displayName);
    onClose();
  };

  const handleCopyMyNumber = () => {
    if (userSettings.profile.phone) {
      navigator.clipboard?.writeText(userSettings.profile.phone);
      setCopiedMyNumber(true);
      setTimeout(() => setCopiedMyNumber(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark 
            ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
            : 'bg-white border-[#e9edef] text-[#111b21]'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Buscar o Chatear por Número</h2>
              <p className="text-[11px] text-[#8696a0]">Verificación estricta de números internacionales para WhatsApp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#374248] text-[#8696a0]' : 'hover:bg-[#e2e5e8] text-[#54656f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={`flex border-b text-xs font-semibold ${isDark ? 'border-[#222e35] bg-[#111b21]' : 'border-[#f0f2f5] bg-white'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#00a884] text-[#00a884]'
                : isDark ? 'border-transparent text-[#8696a0] hover:text-[#d1d7db]' : 'border-transparent text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            Buscar / Chatear
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my_number')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'my_number'
                ? 'border-[#00a884] text-[#00a884]'
                : isDark ? 'border-transparent text-[#8696a0] hover:text-[#d1d7db]' : 'border-transparent text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            Mi Número
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'border-[#00a884] text-[#00a884]'
                : isDark ? 'border-transparent text-[#8696a0] hover:text-[#d1d7db]' : 'border-transparent text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            Amigos ({chats.filter(c => !c.isGroup && c.phone).length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Country Picker */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#8696a0] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00a884]" />
                  <span>País / Código de marcación</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = POPULAR_COUNTRIES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs border appearance-none focus:outline-none cursor-pointer ${
                      isDark 
                        ? 'bg-[#202c33] border-[#2a3942] text-[#e9edef] focus:border-[#00a884]' 
                        : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21] focus:border-[#008069]'
                    }`}
                  >
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={c.iso + c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Input with validation */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#8696a0] flex items-center justify-between">
                  <span>Número de teléfono</span>
                  <span className="text-[10px] text-[#8696a0]">Ejemplo: {selectedCountry.sample}</span>
                </label>
                <div className="flex gap-2">
                  <div className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1 shrink-0 ${
                    isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
                  }`}>
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                  </div>
                  <input
                    type="tel"
                    autoFocus
                    placeholder="612 345 678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs border focus:outline-none transition-colors ${
                      validation
                        ? validation.isValid
                          ? 'border-[#00a884] focus:ring-1 focus:ring-[#00a884]'
                          : 'border-rose-500/70 focus:ring-1 focus:ring-rose-500'
                        : isDark
                        ? 'bg-[#202c33] border-[#2a3942] focus:border-[#00a884]'
                        : 'bg-[#f0f2f5] border-[#d1d7db] focus:border-[#008069]'
                    } ${isDark ? 'bg-[#111b21] text-[#e9edef]' : 'bg-white text-[#111b21]'}`}
                  />
                </div>
              </div>

              {/* Optional Contact Name */}
              {!matchedChat && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#8696a0]">
                    Nombre o Alias (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mi Amigo"
                    value={contactNameInput}
                    onChange={(e) => setContactNameInput(e.target.value)}
                    className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none ${
                      isDark 
                        ? 'bg-[#202c33] border-[#2a3942] text-[#e9edef] focus:border-[#00a884]' 
                        : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21] focus:border-[#008069]'
                    }`}
                  />
                </div>
              )}

              {/* Real-time Validation Feedback Status Box */}
              {validation && (
                <div className={`p-3.5 rounded-xl border transition-all text-xs ${
                  validation.isValid 
                    ? 'bg-emerald-500/10 border-[#00a884]/40 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400'
                }`}>
                  <div className="flex items-start gap-2">
                    {validation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>{validation.isValid ? 'Número correcto y verificado' : 'Número incorrecto'}</span>
                        {validation.country && (
                          <span className="text-[10px] font-normal opacity-90">
                            {validation.country.flag} {validation.country.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 opacity-90">
                        {validation.isValid 
                          ? `Formato internacional: ${validation.formatted}` 
                          : validation.errorMessage}
                      </p>
                    </div>
                  </div>

                  {/* Dual Action: In-Web or Real WhatsApp */}
                  {validation.isValid && (
                    <div className="mt-3 pt-3 border-t border-[#00a884]/20 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${validation.rawDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20ba59] text-white text-[11px] font-semibold transition-all shadow-xs"
                      >
                        <WhatsAppLogo size={14} variant="white" />
                        <span>Abrir en WhatsApp Real (App/Móvil)</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                      <span className="text-[10px] text-[#8696a0]">
                        Envía un mensaje real a este teléfono
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Detected Existing Match Notification */}
              {matchedChat && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={matchedChat.avatar}
                      alt={matchedChat.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold">{matchedChat.name}</div>
                      <div className="text-[10px] text-[#8696a0]">Ya está en tus contactos ({matchedChat.phone})</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectExistingChat(matchedChat.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#008f6f] cursor-pointer"
                  >
                    Abrir chat
                  </button>
                </div>
              )}

              {/* Detected Self Number Notification */}
              {isMyNumberMatch && (
                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  <span>Este es <strong>tu propio número de WhatsApp</strong> configurado en tu perfil.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'my_number' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border text-center ${
                isDark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
              }`}>
                <div className="w-12 h-12 rounded-full bg-[#00a884]/20 text-[#00a884] mx-auto flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold">{userSettings.profile.name || 'Mi Perfil'}</h3>
                <p className="text-xs text-[#8696a0] mt-0.5">{userSettings.profile.status || 'Disponible'}</p>

                <div className="mt-4 p-3 rounded-xl bg-black/10 dark:bg-black/30 border border-[#00a884]/30 inline-flex items-center gap-3">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#00a884]">
                    {userSettings.profile.phone || '+34 600 000 000'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMyNumber}
                    className="p-1.5 rounded-lg bg-[#00a884] text-white hover:bg-[#008f6f] transition-all cursor-pointer"
                    title="Copiar número"
                  >
                    {copiedMyNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Direct Link to Chat with user on Real WhatsApp */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${userSettings.profile.phone ? userSettings.profile.phone.replace(/\D/g, '') : '34600000000'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a884] to-[#25d366] text-white text-xs font-semibold shadow-md hover:opacity-90 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <WhatsAppLogo size={16} variant="white" />
                    <span>Abrir mi WhatsApp Real (wa.me)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <p className="text-[11px] text-[#8696a0] max-w-xs text-center mt-1">
                    Cualquier persona que visite este enlace podrá abrir tu WhatsApp real o chatear contigo directamente en la web.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-2">
              <p className="text-xs text-[#8696a0] mb-2 font-medium">
                Toca cualquier número de contacto para abrir en la web o en WhatsApp real:
              </p>
              {chats.filter((c) => !c.isGroup && c.phone).map((chat) => {
                const rawDigits = chat.phone?.replace(/\D/g, '');
                return (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors ${
                      isDark 
                        ? 'bg-[#202c33] border-[#2a3942]' 
                        : 'bg-[#f0f2f5] border-[#d1d7db]'
                    }`}
                  >
                    <div 
                      onClick={() => {
                        onSelectExistingChat(chat.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold">{chat.name}</div>
                        <div className="text-[11px] font-mono text-[#00a884]">{chat.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {rawDigits && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${rawDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir en WhatsApp Real"
                          className="px-2.5 py-1.5 rounded-lg bg-[#25d366]/20 text-[#25d366] hover:bg-[#25d366]/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                        >
                          <WhatsAppLogo size={13} />
                          <span>App Real</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectExistingChat(chat.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#008f6f] flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>En Web</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === 'search' && (
          <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? 'border-[#222e35] bg-[#202c33]' : 'border-[#f0f2f5] bg-[#f0f2f5]'}`}>
            <span className="text-[11px] text-[#8696a0]">
              {validation?.isValid ? '✓ Listo para iniciar chat' : 'Ingresa un número correcto'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                }`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleStartChat}
                disabled={!validation || !validation.isValid}
                className="px-4 py-2 rounded-xl bg-[#00a884] text-white hover:bg-[#008f6f] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{matchedChat ? 'Abrir chat existente' : 'Iniciar chat con número'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
