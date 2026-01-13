import { Vector, Enemy, Projectile, Gem } from "../../../constants/games/ironpaw-config";

/**
 * 두 점 사이의 거리 계산
 */
export function distance(a: Vector, b: Vector): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * 충돌 감지 (원형)
 */
export function checkCollision(
  a: Vector,
  b: Vector,
  radiusA: number,
  radiusB: number
): boolean {
  return distance(a, b) < radiusA + radiusB;
}

/**
 * 적과 발사체 충돌 감지 및 데미지 처리
 */
export function handleProjectileEnemyCollisions(
  projectiles: Projectile[],
  enemies: Enemy[],
  onEnemyHit: (enemy: Enemy, damage: number) => void,
  onProjectileHit: (projectile: Projectile) => void
): { updatedProjectiles: Projectile[]; updatedEnemies: Enemy[] } {
  const updatedProjectiles = [...projectiles];
  const updatedEnemies = [...enemies];
  const projectilesToRemove = new Set<number>();

  for (let i = 0; i < updatedProjectiles.length; i++) {
    const proj = updatedProjectiles[i];

    for (let j = 0; j < updatedEnemies.length; j++) {
      const enemy = updatedEnemies[j];

      if (checkCollision(proj, enemy, 8, 16)) {
        enemy.hp -= proj.damage;
        onEnemyHit(enemy, proj.damage);

        if (proj.piercing) {
          proj.piercing--;
          if (proj.piercing <= 0) {
            projectilesToRemove.add(i);
          }
        } else {
          projectilesToRemove.add(i);
        }

        onProjectileHit(proj);
        break;
      }
    }
  }

  const finalProjectiles = updatedProjectiles.filter((_, i) => !projectilesToRemove.has(i));
  return { updatedProjectiles: finalProjectiles, updatedEnemies };
}

/**
 * 플레이어와 젬 충돌 감지 및 수집
 */
export function collectGems(
  player: Vector,
  gems: Gem[],
  magnetRadius: number,
  onGemCollected: (gem: Gem) => void
): Gem[] {
  const remaining: Gem[] = [];

  for (const gem of gems) {
    const dist = distance(player, gem);

    // 자석 효과
    if (dist < magnetRadius) {
      const dx = player.x - gem.x;
      const dy = player.y - gem.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        gem.x += (dx / len) * 5;
        gem.y += (dy / len) * 5;
      }
    }

    // 수집
    if (dist < 30) {
      onGemCollected(gem);
    } else {
      remaining.push(gem);
    }
  }

  return remaining;
}

/**
 * 플레이어와 적 충돌 감지
 */
export function checkPlayerEnemyCollisions(
  player: Vector,
  enemies: Enemy[],
  onPlayerHit: (damage: number) => void
): void {
  for (const enemy of enemies) {
    if (checkCollision(player, enemy, 24, 16)) {
      onPlayerHit(enemy.strength);
    }
  }
}

/**
 * 화면 밖의 엔티티 제거
 */
export function removeOffscreenEntities<T extends Vector>(
  entities: T[],
  player: Vector,
  maxDistance: number
): T[] {
  return entities.filter(entity => {
    const dist = distance(player, entity);
    return dist < maxDistance;
  });
}

/**
 * 레벨에 따른 경험치 요구량 계산
 */
export function getExpForLevel(level: number): number {
  return Math.floor(10 + level * 5 * Math.pow(1.1, level - 1));
}

/**
 * 적 스폰 위치 계산 (화면 밖)
 */
export function getEnemySpawnPosition(
  player: Vector,
  spawnDistance: number
): Vector {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: player.x + Math.cos(angle) * spawnDistance,
    y: player.y + Math.sin(angle) * spawnDistance,
  };
}

/**
 * 각도 정규화 (-PI ~ PI)
 */
export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

/**
 * 방향에서 애니메이션 결정
 */
export function getAnimationFromDirection(dx: number, dy: number): string {
  if (dx === 0 && dy === 0) return "idle";

  const angle = Math.atan2(dy, dx);
  const octant = Math.round((angle / Math.PI) * 4);

  switch (octant) {
    case 0: return "walk_right";
    case 1: return "walk_right_down";
    case 2: return "walk_down";
    case -2: return "walk_down";
    case 3: return "walk_left_down";
    case -3: return "walk_left_down";
    case 4: return "walk_left";
    case -4: return "walk_left";
    case -1: return "walk_right_up";
    default: return "walk_right";
  }
}
