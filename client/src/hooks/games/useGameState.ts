import { useState } from "react";
import {
  Vector,
  Enemy,
  Projectile,
  Gem,
  Weapon,
  Orbital,
  MilkPuddle,
  DamageNumber,
  ANIMATIONS,
} from "../../constants/games/ironpaw-config";

export interface GameState {
  // Game flow
  isRunning: boolean;
  gameOver: boolean;
  victory: boolean;
  isPaused: boolean;

  // Canvas dimensions
  WIDTH: number;
  HEIGHT: number;

  // Player state
  player: Vector;
  playerHp: number;
  playerMaxHp: number;
  playerLevel: number;
  playerExp: number;
  expToNext: number;

  // Game entities
  enemies: Enemy[];
  projectiles: Projectile[];
  gems: Gem[];
  weapons: Weapon[];
  orbitals: Orbital[];
  milkPuddles: MilkPuddle[];
  damageNumbers: DamageNumber[];

  // Game stats
  score: number;
  killCount: number;
  startTime: number;
  elapsedTime: number;

  // Input & UI
  keys: Set<string>;
  showLevelUp: boolean;
  weaponChoices: string[];

  // Animation
  currentAnimation: keyof typeof ANIMATIONS;
  animationFrame: number;
  animationCounter: number;
}

export function useGameState() {
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Canvas
  const [WIDTH, setWIDTH] = useState(800);
  const [HEIGHT, setHEIGHT] = useState(600);

  // Player
  const [player, setPlayer] = useState<Vector>({ x: 0, y: 0 });
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerExp, setPlayerExp] = useState(0);
  const [expToNext, setExpToNext] = useState(10);

  // Entities
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [gems, setGems] = useState<Gem[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [orbitals, setOrbitals] = useState<Orbital[]>([]);
  const [milkPuddles, setMilkPuddles] = useState<MilkPuddle[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);

  // Stats
  const [score, setScore] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Input & UI
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [weaponChoices, setWeaponChoices] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Animation
  const [currentAnimation, setCurrentAnimation] =
    useState<keyof typeof ANIMATIONS>("idle");
  const [animationFrame, setAnimationFrame] = useState(0);
  const [animationCounter, setAnimationCounter] = useState(0);

  return {
    // State
    state: {
      isRunning,
      gameOver,
      victory,
      isPaused,
      WIDTH,
      HEIGHT,
      player,
      playerHp,
      playerMaxHp,
      playerLevel,
      playerExp,
      expToNext,
      enemies,
      projectiles,
      gems,
      weapons,
      orbitals,
      milkPuddles,
      damageNumbers,
      score,
      killCount,
      startTime,
      elapsedTime,
      keys,
      showLevelUp,
      weaponChoices,
      currentAnimation,
      animationFrame,
      animationCounter,
    },

    // Setters
    setters: {
      setIsRunning,
      setGameOver,
      setVictory,
      setIsPaused,
      setWIDTH,
      setHEIGHT,
      setPlayer,
      setPlayerHp,
      setPlayerMaxHp,
      setPlayerLevel,
      setPlayerExp,
      setExpToNext,
      setEnemies,
      setProjectiles,
      setGems,
      setWeapons,
      setOrbitals,
      setMilkPuddles,
      setDamageNumbers,
      setScore,
      setKillCount,
      setStartTime,
      setElapsedTime,
      setKeys,
      setShowLevelUp,
      setWeaponChoices,
      setCurrentAnimation,
      setAnimationFrame,
      setAnimationCounter,
    },
  };
}
