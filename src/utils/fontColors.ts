// Font & Letter Color Preferences for WhatsApp Web

export interface FontColorOption {
  id: string;
  name: string;
  hex: string;
  textColorClass: string;
  bgDotClass: string;
}

export const FONT_COLOR_OPTIONS: FontColorOption[] = [
  {
    id: 'default',
    name: 'Clásico',
    hex: '',
    textColorClass: 'text-inherit',
    bgDotClass: 'bg-slate-400',
  },
  {
    id: 'cyan',
    name: 'Celeste Neón',
    hex: '#00f0ff',
    textColorClass: 'text-[#00f0ff]',
    bgDotClass: 'bg-[#00f0ff] shadow-xs shadow-[#00f0ff]/50',
  },
  {
    id: 'orange',
    name: 'Naranja Neón',
    hex: '#ff7a00',
    textColorClass: 'text-[#ff7a00]',
    bgDotClass: 'bg-[#ff7a00] shadow-xs shadow-[#ff7a00]/50',
  },
  {
    id: 'emerald',
    name: 'Verde WhatsApp',
    hex: '#25d366',
    textColorClass: 'text-[#25d366]',
    bgDotClass: 'bg-[#25d366] shadow-xs shadow-[#25d366]/50',
  },
  {
    id: 'yellow',
    name: 'Amarillo Dorado',
    hex: '#ffd700',
    textColorClass: 'text-[#ffd700]',
    bgDotClass: 'bg-[#ffd700] shadow-xs shadow-[#ffd700]/50',
  },
  {
    id: 'purple',
    name: 'Púrpura Eléctrico',
    hex: '#c084fc',
    textColorClass: 'text-[#c084fc]',
    bgDotClass: 'bg-[#c084fc] shadow-xs shadow-[#c084fc]/50',
  },
  {
    id: 'pink',
    name: 'Rosa Neón',
    hex: '#f472b6',
    textColorClass: 'text-[#f472b6]',
    bgDotClass: 'bg-[#f472b6] shadow-xs shadow-[#f472b6]/50',
  },
  {
    id: 'white',
    name: 'Blanco Puro',
    hex: '#ffffff',
    textColorClass: 'text-white',
    bgDotClass: 'bg-white shadow-xs shadow-white/50',
  },
  {
    id: 'lime',
    name: 'Verde Lima',
    hex: '#a3e635',
    textColorClass: 'text-[#a3e635]',
    bgDotClass: 'bg-[#a3e635] shadow-xs shadow-[#a3e635]/50',
  },
];

export function getFontColorHex(colorId?: string): string | undefined {
  if (!colorId || colorId === 'default') return undefined;
  if (colorId.startsWith('#')) return colorId;
  const found = FONT_COLOR_OPTIONS.find((c) => c.id === colorId);
  return found?.hex || undefined;
}
