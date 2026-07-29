import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeContext';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function Logo({
  width = 32,
  height = 32,
  color,
}: LogoProps) {
  const { theme } = useAppTheme();
  const fillColor = color || theme.colors.primary;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="-52 3 560 560"
      fill="none"
    >
      <G stroke={fillColor} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M100 287 H34 V468 Q34 522 92 529" strokeWidth={36} />
        <Rect x={100} y={226} width={323} height={309} rx={22} strokeWidth={40} />
        <Path d="M157 219 V160 A108 108 0 0 1 364 116" strokeWidth={52} />
      </G>
      <G fill={fillColor}>
        <Rect x={148} y={268} width={228} height={32} rx={6} />
        <Rect x={148} y={334} width={102} height={84} rx={8} />
        <Rect x={277} y={336} width={99} height={30} rx={6} />
        <Rect x={277} y={388} width={99} height={30} rx={6} />
        <Rect x={148} y={440} width={228} height={32} rx={6} />
      </G>
    </Svg>
  );
}
