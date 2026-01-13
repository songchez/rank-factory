// Game Configuration
export const GAME_ID = "ironpaw-survival";
export const TARGET_TIME = 30 * 60 * 1000; // 30 minutes in ms

// Types
export type Vector = { x: number; y: number };

export type Enemy = Vector & {
  hp: number;
  maxHp: number;
  type: "enemy1" | "enemy2" | "enemy3";
  strength: number;
  angle: number; // Direction facing player
  bouncePhase: number; // For bounce animation
};

export type Projectile = Vector & {
  vx: number;
  vy: number;
  damage: number;
  piercing: number;
  type: string;
  lifetime?: number;
};

export type Gem = Vector & { value: number };

export type Orbital = {
  angle: number;
  radius: number;
  damage: number;
  type: string;
};

export type MilkPuddle = Vector & {
  duration: number;
  damage: number;
};

export type DamageNumber = Vector & {
  damage: number;
  lifetime: number;
};

export type Weapon = {
  type: string;
  level: number;
  cooldown: number;
  lastFired: number;
};

// Player Configuration
export const PLAYER_SIZE = 32;
export const PLAYER_SPRITE = "/games/ironPaw/Characters/cat 1.png";

// Animation Configuration
// Sprite sheet: 432x1696 (27 cols x 106 rows, 16x16 per frame)
export const SPRITE_SIZE = 16; // Each sprite is 16x16 in the sheet

export const ANIMATIONS = {
  // IDLE section (green label, row 0-1)
  idle: { row: 0, frames: 8, speed: 10 },

  // WALK section (yellow label, 8 frames each)
  walk_down: { row: 3, frames: 8, speed: 5 },
  walk_up: { row: 5, frames: 8, speed: 5 },
  walk_right: { row: 7, frames: 8, speed: 5 },
  walk_left: { row: 9, frames: 8, speed: 5 },
  walk_right_up: { row: 11, frames: 8, speed: 5 },
  walk_right_down: { row: 13, frames: 8, speed: 5 },
  walk_left_up: { row: 15, frames: 8, speed: 5 },
  walk_left_down: { row: 17, frames: 8, speed: 5 },
} as const;

// Tilemap Configuration
// terrain_tiles_v2.png is 20x32 tiles, 16x16 each (320x512 이미지)
export const TILE_TYPES = {
  // 일반 풀 타일 (작은 디테일이 있는 것들 - row 3의 다양한 타일)
  GRASS_PLAIN: [
    { row: 3, col: 0 },  // 풀 타일 변형 1
    { row: 3, col: 1 },  // 풀 타일 변형 2
    { row: 3, col: 2 },  // 풀 타일 변형 3
    { row: 3, col: 3 },  // 풀 타일 변형 4
    { row: 2, col: 3 },  // 밝은 풀
    { row: 4, col: 3 },  // 풀 타일
    { row: 5, col: 3 },  // 풀 타일
    { row: 6, col: 3 },  // 풀 타일
    { row: 7, col: 0 },  // 풀 타일
    { row: 7, col: 1 },  // 풀 타일
  ],

  // 테두리 있는 풀 타일 (장식용)
  GRASS_BORDERED: [
    { row: 0, col: 0 },  // Top-left
    { row: 0, col: 1 },  // Top
    { row: 0, col: 2 },  // Top-right
    { row: 1, col: 0 },  // Left
    { row: 1, col: 2 },  // Right
    { row: 2, col: 0 },  // Bottom-left
    { row: 2, col: 1 },  // Bottom
    { row: 2, col: 2 },  // Bottom-right
  ],

  // 흙 타일 (질감 있는)
  DIRT_TEXTURED: [
    { row: 8, col: 1 },  // 질감 있는 흙 1
    { row: 8, col: 2 },  // 질감 있는 흙 2
    { row: 9, col: 0 },  // 자갈 있는 흙 1
    { row: 9, col: 1 },  // 자갈 있는 흙 2
    { row: 9, col: 2 },  // 흙
  ],

  // 평범한 흙 타일
  DIRT_PLAIN: [
    { row: 0, col: 3 },  // 흙 1
    { row: 0, col: 4 },  // 갈색 흙
    { row: 1, col: 3 },  // 갈색 흙 2
    { row: 2, col: 4 },  // 갈색 흙 3
    { row: 8, col: 0 },  // 흙
  ],

  // 물 타일
  WATER: [
    { row: 11, col: 0 },  // 물
  ],

  // 풀-흙 전환 타일
  TRANSITION: [
    { row: 4, col: 0 },  // 전환 top-left
    { row: 4, col: 1 },  // 전환 top
    { row: 4, col: 2 },  // 전환 top-right
    { row: 5, col: 0 },  // 전환 left
    { row: 6, col: 0 },  // 복잡한 전환
    { row: 6, col: 1 },  // 복잡한 전환 2
    { row: 6, col: 2 },  // 풀+돌
  ],
} as const;

// Asset Paths
export const ASSETS = {
  TILEMAP: "/games/ironPaw/basic_tileset_and_assets_standard/terrain_tiles_v2.png",
  DECORATIONS: "/games/ironPaw/basic_tileset_and_assets_standard/decorations.png",
  MILK: "/games/ironPaw/at-milk.png",
  CRYSTAL: "/games/ironPaw/bluecristal.png",
  ENEMY1: "/games/ironPaw/basic_tileset_and_assets_standard/Bat 16x16.png",
  ENEMY2: "/games/ironPaw/basic_tileset_and_assets_standard/Blue Fly 16x16.png",
  ENEMY3: "/games/ironPaw/basic_tileset_and_assets_standard/Fly 16x16.png",
} as const;
