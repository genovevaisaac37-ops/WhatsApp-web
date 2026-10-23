import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { ContactStatus, UserSettings } from '../types/whatsapp.ts';
import { CreateMediaStatusModal } from './CreateMediaStatusModal.tsx';

interface StatusListProps {
  statuses: ContactStatus[];
  userSettings: UserSettings;
  onSelectStatus: (status: ContactStatus) => void;
  onAddStatus: (content: string, type: 'text' | 'image' | 'video', caption?: string, bgColor?: string) => void;
  onDeleteStatusItem?: (itemId: string) => void;
}

export const StatusList: React.FC<StatusListProps> = ({
  statuses,
  userSettings,
  onSelectStatus,
  onAddStatus,
  onDeleteStatusItem,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState<'media' | 'text'>('media');

  const isDark = userSettings.theme === 'dark';

  // Find user's own status if any
  const userStatus = statuses.find((s) => s.contactId === 'user' && s.items.length > 0);
  
  // Contacts statuses (exclude 'user')
  const contactStatuses = statuses.filter((s) => s.contactId !== 'user');
  const recentStatuses = contactStatuses.filter((s) => !s.allViewed);
  const viewedStatuses = contactStatuses.filter((s) => s.allViewed);

  const openCreateModal = (mode: 'media' | 'text' = 'media') => {
    setModalInitialMode(mode);
    setShowCreateModal(true);
  };

  return (
    <div 
      className={`flex flex-col h-full w-full md:w-[400px] border-r select-none transition-colors duration-150 shrink-0 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-white border-[#e9edef] text-[#111b21]'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#222e35]' : 'border-[#f0f2f5]'}`}>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Estados</h1>
          <p className="text-[11px] text-[#8696a0]">Actualizaciones de tus contactos</p>
        </div>

        {/* Plus button in header to add status */}
        <button
          type="button"
          onClick={() => openCreateModal('media')}
          className={`p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#202c33] text-[#00a884]' : 'hover:bg-[#f0f2f5] text-[#00a884]'
          }`}
          title="Crear nuevo estado"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Mi Estado */}
        <div 
          onClick={() => openCreateModal('media')}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${
            isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]'
          }`}
          title="Toca para añadir un estado"
        >
          {/* Avatar - clicking views if status exists, or opens modal if not */}
          <div 
            onClick={(e) => {
              if (userStatus) {
                e.stopPropagation();
                onSelectStatus(userStatus);
              }
            }}
            className="relative shrink-0"
            title={userStatus ? 'Toca para ver tus historias' : 'Toca para añadir'}
          >
            {userStatus ? (
              // User has active status - show green border ring
              <div className="p-0.5 rounded-full border-2 border-[#00a884] hover:scale-105 transition-transform">
                <img
                  src={userSettings.profile.avatar}
                  alt="Mi Estado"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover"
                />
              </div>
            ) : (
              // No status - show plus badge
              <div className="relative">
                <img
                  src={userSettings.profile.avatar}
                  alt="Mi Estado"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#00a884] text-white rounded-full flex items-center justify-center border-2 border-[#111b21]">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Mi estado</p>
              {userStatus && (
                <span className="text-[10px] text-[#00a884] font-medium bg-[#00a884]/10 px-2 py-0.5 rounded-full">
                  {userStatus.items.length} {userStatus.items.length === 1 ? 'estado' : 'estados'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8696a0] truncate">
              {userStatus 
                ? `${userStatus.updatedAt} · Toca para añadir más fotos o videos` 
                : 'Toca para publicar fotos o videos'}
            </p>
          </div>

          {/* Action buttons if user has status: View and Add */}
          {userStatus ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onSelectStatus(userStatus)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#323d45] text-[#8696a0] hover:text-[#e9edef]' : 'hover:bg-slate-200 text-[#54656f] hover:text-[#111b21]'
                }`}
                title="Ver historias"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => openCreateModal('media')}
                className="p-1.5 rounded-full bg-[#00a884] text-white hover:bg-[#008f6f] transition-colors shadow-xs"
                title="Añadir foto o video"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal('media');
              }}
              className="p-1.5 rounded-full bg-[#00a884] text-white hover:bg-[#008f6f] transition-colors shadow-xs"
              title="Añadir foto o video"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Actualizaciones recientes */}
        {recentStatuses.length > 0 && (
          <div className="mt-3">
            <div className="px-3 py-1.5 text-xs font-semibold text-[#00a884] uppercase tracking-wider">
              Recientes ({recentStatuses.length})
            </div>
            {recentStatuses.map((item) => (
              <div
                key={item.contactId}
                onClick={() => onSelectStatus(item)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Anillo Verde de Estado */}
                <div className="relative p-0.5 rounded-full border-2 border-[#00a884]">
                  <img
                    src={item.contactAvatar}
                    alt={item.contactName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.contactName}</p>
                  <p className="text-xs text-[#8696a0]">
                    {item.updatedAt} · {item.items.length} {item.items.length === 1 ? 'estado' : 'estados'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actualizaciones vistas */}
        {viewedStatuses.length > 0 && (
          <div className="mt-3">
            <div className="px-3 py-1.5 text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              Vistos ({viewedStatuses.length})
            </div>
            {viewedStatuses.map((item) => (
              <div
                key={item.contactId}
                onClick={() => onSelectStatus(item)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Anillo Gris de Visto */}
                <div className="relative p-0.5 rounded-full border-2 border-[#8696a0]/40">
                  <img
                    src={item.contactAvatar}
                    alt={item.contactName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover opacity-80"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.contactName}</p>
                  <p className="text-xs text-[#8696a0]">{item.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Crear Estado con Fotos, Videos o Texto */}
      <CreateMediaStatusModal
        userSettings={userSettings}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialMode={modalInitialMode}
        onPublishStatus={(content, type, caption, bgColor) => {
          onAddStatus(content, type, caption, bgColor);
        }}
      />
    </div>
  );
};
