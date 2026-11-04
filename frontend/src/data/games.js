import { Crosshair, Swords, Target, Rocket, Gamepad2 } from 'lucide-react'

const ICONS = {
  Valorant: Crosshair,
  'League of Legends': Swords,
  'Counter-Strike 2': Target,
  'Rocket League': Rocket,
}

export const gameIcon = (name) => ICONS[name] ?? Gamepad2
