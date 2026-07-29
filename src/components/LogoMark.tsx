import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

interface LogoMarkProps {
  size?: number;
}

// Vector twin of the app icon (assets/icon.svg) — same gradient badge and
// open-padlock glyph, scaled down for in-app use like the header.
export default function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="logoMarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4C86FF" />
          <Stop offset="55%" stopColor="#1D4ED8" />
          <Stop offset="100%" stopColor="#0037B0" />
        </LinearGradient>
      </Defs>
      <Rect width={1024} height={1024} rx={230} fill="url(#logoMarkBg)" />
      <Path
        d="M400 486 V378 A112 112 0 0 1 624 378 V432"
        stroke="#ffffff"
        strokeWidth={54}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={332} y={480} width={360} height={304} rx={58} fill="#ffffff" />
      <Circle cx={512} cy={598} r={34} fill="url(#logoMarkBg)" />
      <Rect x={496} y={618} width={32} height={86} rx={14} fill="url(#logoMarkBg)" />
    </Svg>
  );
}
