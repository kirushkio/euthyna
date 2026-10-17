import React from 'react';

interface EuthynaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  light?: boolean;
}

export const EuthynaLogo: React.FC<EuthynaLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = false,
  showTagline = false,
  light = false
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 ${sizeMap[size]}`}>
        <svg viewBox="0 0 128 128" fill="none" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="shieldBgComp" x1="16" y1="12" x2="112" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="shieldBorderComp" x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="coinGradComp" x1="40" y1="36" x2="88" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="coinStrokeComp" x1="40" y1="36" x2="88" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="arrowGradComp" x1="44" y1="84" x2="88" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Outer Shield */}
          <path
            d="M64 12C88 12 110 21 110 40C110 78 85 106 64 116C43 106 18 78 18 40C18 21 40 12 64 12Z"
            fill="url(#shieldBgComp)"
            stroke="url(#shieldBorderComp)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Coin Ring */}
          <circle
            cx="64"
            cy="58"
            r="28"
            fill="url(#coinGradComp)"
            stroke="url(#coinStrokeComp)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Growth Arrow */}
          <path
            d="M46 76L60 62L70 70L86 46M86 46H74M86 46V58"
            stroke="url(#arrowGradComp)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Anchor Node */}
          <circle cx="86" cy="46" r="3" fill="#38BDF8" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight ${textSizes[size]} ${
                light ? 'text-white' : 'text-slate-900'
              }`}
            >
              Euthyna
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Treasury
            </span>
          </div>
          {showTagline && (
            <span
              className={`text-xs ${
                light ? 'text-slate-400' : 'text-slate-500'
              } font-normal mt-0.5`}
            >
              Intelligent Treasury. Protected Decisions.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
