import React from 'react';
import { Tile, TileColor } from '../types/okey';
import { COLOR_CODES, COLOR_NAMES } from '../utils/okeyEngine';
import { Sparkles } from 'lucide-react';

interface TileViewProps {
  tile: Tile;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOkey?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  badge?: string;
  className?: string;
  disabled?: boolean;
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  size = 'md',
  isOkey = false,
  isSelected = false,
  onClick,
  badge,
  className = '',
  disabled = false,
}) => {
  const isFake = tile.color === 'fake' || tile.isFakeOkey;
  const colorCode = COLOR_CODES[tile.color] || COLOR_CODES.black;

  // Size specifications
  const sizeStyles = {
    xs: 'w-7 h-10 text-xs rounded-md shadow-xs',
    sm: 'w-9 h-12 text-sm rounded-md shadow-sm',
    md: 'w-11 h-16 text-lg rounded-lg shadow-md',
    lg: 'w-14 h-20 text-2xl rounded-xl shadow-lg',
    xl: 'w-16 h-24 text-3xl rounded-xl shadow-xl',
  };

  const numberFontSize = {
    xs: 'text-xs font-black',
    sm: 'text-sm font-black',
    md: 'text-lg font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  return (
    <button
      type="button"
      id={`tile-${tile.id || `${tile.color}-${tile.value}`}`}
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`
        relative inline-flex flex-col items-center justify-center shrink-0
        bg-gradient-to-b from-[#fffaf0] via-[#f7eedc] to-[#eeddc0]
        border border-[#dfcaa7]
        ${sizeStyles[size]}
        transition-all duration-150 select-none
        ${onClick && !disabled ? 'cursor-pointer active:scale-95 hover:brightness-105' : 'cursor-default'}
        ${isSelected ? 'ring-3 ring-amber-400 -translate-y-1 z-10 shadow-amber-500/30' : ''}
        ${isOkey ? 'ring-2 ring-emerald-500 bg-gradient-to-b from-amber-50 via-[#fcf6e8] to-[#f4e4c2]' : ''}
        ${className}
      `}
      style={{
        boxShadow: isSelected
          ? '0 8px 16px -2px rgba(245, 158, 11, 0.4), inset 0 1px 1px #ffffff'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 1px #ffffff, inset 0 -2px 3px rgba(180, 150, 110, 0.4)',
      }}
      title={`${COLOR_NAMES[tile.color]} ${tile.value}${isOkey ? ' (OKEY)' : ''}`}
    >
      {/* Okey star badge */}
      {isOkey && (
        <div className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-amber-300 rounded-full p-0.5 shadow-sm ring-1 ring-emerald-300">
          <Sparkles className="w-2.5 h-2.5 fill-current" />
        </div>
      )}

      {/* Optional custom badge */}
      {badge && (
        <span className="absolute -bottom-1.5 px-1 bg-neutral-900 text-neutral-200 text-[9px] font-bold rounded-full border border-neutral-700 shadow-sm leading-tight">
          {badge}
        </span>
      )}

      {/* Main Tile Face */}
      {isFake ? (
        <div className="flex flex-col items-center justify-center text-emerald-800">
          <span className="text-sm">★</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none text-emerald-900 mt-0.5">
            SAHTE
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <span
            className={`${numberFontSize[size]} ${colorCode.text} tracking-tight`}
            style={{
              textShadow: '0 1px 1px rgba(255,255,255,0.8), 0 -0.5px 0.5px rgba(0,0,0,0.2)',
            }}
          >
            {tile.value}
          </span>
          {/* Subtle color pip dot underneath */}
          <span
            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${colorCode.bg} opacity-90`}
          />
        </div>
      )}
    </button>
  );
};
