import { Shield, Crosshair, Zap, Sword, Cpu, Rocket } from 'lucide-react';
import type { CategoryItem } from './types';

export const CATEGORIES: CategoryItem[] = [
  { id: 'Warframes', label: 'フレーム', icon: <Shield size={16} /> },
  { id: 'Primary', label: 'プライマリ', icon: <Crosshair size={16} /> },
  { id: 'Secondary', label: 'セカンダリ', icon: <Zap size={16} /> },
  { id: 'Melee', label: '近接', icon: <Sword size={16} /> },
  { id: 'Pets', label: 'コンパニオン', icon: <Cpu size={16} /> },
  { id: 'Archwing', label: 'アークウイング', icon: <Rocket size={16} /> },
  { id: 'Arch-Gun', label: 'アークウイングガン', icon: <Rocket size={16} /> },
  { id: 'Arch-Melee', label: 'アークウイング近接', icon: <Sword size={16} /> },
  { id: 'Necramech', label: 'ネクロメカ', icon: <Cpu size={16} /> },
];
