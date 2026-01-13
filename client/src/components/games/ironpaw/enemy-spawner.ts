import { Vector, Enemy } from "../../../constants/games/ironpaw-config";
import { getEnemySpawnPosition } from "./game-utils";

/**
 * 적 타입별 기본 스탯
 */
const ENEMY_STATS = {
  enemy1: { baseHp: 20, baseStrength: 1 },
  enemy2: { baseHp: 30, baseStrength: 1.2 },
  enemy3: { baseHp: 25, baseStrength: 1.1 },
} as const;

/**
 * 시간에 따른 적 강화 배수 계산
 */
export function getEnemyMultiplier(elapsedTime: number): number {
  const minutes = elapsedTime / 60000;
  return 1 + minutes * 0.15;
}

/**
 * 적 생성
 */
export function createEnemy(
  player: Vector,
  elapsedTime: number,
  spawnDistance: number = 600
): Enemy {
  const types: Array<"enemy1" | "enemy2" | "enemy3"> = ["enemy1", "enemy2", "enemy3"];
  const type = types[Math.floor(Math.random() * types.length)];
  const stats = ENEMY_STATS[type];

  const multiplier = getEnemyMultiplier(elapsedTime);
  const maxHp = Math.floor(stats.baseHp * multiplier);

  const position = getEnemySpawnPosition(player, spawnDistance);

  return {
    ...position,
    hp: maxHp,
    maxHp,
    type,
    strength: stats.baseStrength * multiplier,
    angle: 0,
    bouncePhase: Math.random() * Math.PI * 2,
  };
}

/**
 * 적 스폰 관리
 */
export function spawnEnemies(
  player: Vector,
  currentEnemies: Enemy[],
  elapsedTime: number,
  playerLevel: number
): Enemy[] {
  const maxEnemies = Math.min(50 + playerLevel * 5, 200);
  const spawnRate = Math.max(5, 30 - Math.floor(elapsedTime / 60000) * 2);

  if (currentEnemies.length < maxEnemies && Math.random() < 1 / spawnRate) {
    const newEnemy = createEnemy(player, elapsedTime);
    return [...currentEnemies, newEnemy];
  }

  return currentEnemies;
}

/**
 * 적 이동 업데이트
 */
export function updateEnemyMovement(
  enemies: Enemy[],
  player: Vector,
  deltaTime: number
): Enemy[] {
  return enemies.map((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const speed = 1.5;
      enemy.x += (dx / dist) * speed * deltaTime / 16;
      enemy.y += (dy / dist) * speed * deltaTime / 16;
      enemy.angle = Math.atan2(dy, dx);
    }

    // Update bounce animation
    enemy.bouncePhase += 0.1;

    return enemy;
  });
}

/**
 * 죽은 적 제거 및 젬 드롭
 */
export function removeDeadEnemies(
  enemies: Enemy[],
  onEnemyKilled: (enemy: Enemy) => void
): Enemy[] {
  const alive: Enemy[] = [];

  for (const enemy of enemies) {
    if (enemy.hp <= 0) {
      onEnemyKilled(enemy);
    } else {
      alive.push(enemy);
    }
  }

  return alive;
}
