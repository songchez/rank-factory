import { Vector, Weapon, Projectile, Orbital, MilkPuddle } from "../../../constants/games/ironpaw-config";

/**
 * 무기 업그레이드 데이터
 */
export const WEAPON_UPGRADES = {
  // Projectile weapons
  bone: { cooldown: 500, damage: 10, name: "본 애로우", desc: "가장 가까운 적을 향해 뼈다귀 발사" },
  magic_missile: { cooldown: 600, damage: 15, name: "매직 미사일", desc: "강력한 마법 탄환 (파란색)" },
  fireball: { cooldown: 800, damage: 20, name: "파이어볼", desc: "관통하는 화염구 (빨간색)" },
  poison_dart: { cooldown: 400, damage: 8, name: "독 다트", desc: "빠르고 3단 관통 (초록색)" },
  dark_bolt: { cooldown: 650, damage: 12, name: "다크 볼트", desc: "어둠의 탄환 (보라색)" },

  // Orbital weapons
  orbital_yellow: { cooldown: 2000, damage: 30, name: "노란 오비탈", desc: "주변을 도는 황금 구체" },
  orbital_blue: { cooldown: 2000, damage: 30, name: "파란 오비탈", desc: "주변을 도는 얼음 구체" },
  orbital_red: { cooldown: 2000, damage: 30, name: "빨간 오비탈", desc: "주변을 도는 화염 구체" },
  orbital_green: { cooldown: 2000, damage: 30, name: "초록 오비탈", desc: "주변을 도는 독 구체" },
  orbital_purple: { cooldown: 2000, damage: 30, name: "보라 오비탈", desc: "주변을 도는 암흑 구체" },
};

/**
 * 무기 레벨 업그레이드 적용
 */
export function upgradeWeapon(
  weapons: Weapon[],
  weaponType: string,
  playerMaxHp: number
): { updatedWeapons: Weapon[]; updatedMaxHp: number } {
  let updatedWeapons = [...weapons];
  let updatedMaxHp = playerMaxHp;

  const existing = updatedWeapons.find((w) => w.type === weaponType);

  if (weaponType === "hp-boost") {
    updatedMaxHp += 10;
    if (existing) {
      existing.level++;
    } else {
      updatedWeapons.push({
        type: weaponType,
        level: 1,
        cooldown: 0,
        lastFired: 0,
      });
    }
  } else if (weaponType === "speed-boost" || weaponType === "magnet") {
    if (existing) {
      existing.level++;
    } else {
      updatedWeapons.push({
        type: weaponType,
        level: 1,
        cooldown: 0,
        lastFired: 0,
      });
    }
  } else {
    // Active weapons
    const baseStats = WEAPON_UPGRADES[weaponType as keyof typeof WEAPON_UPGRADES];
    if (existing) {
      existing.level++;
      existing.cooldown = Math.max(100, baseStats.cooldown - existing.level * 50);
    } else {
      updatedWeapons.push({
        type: weaponType,
        level: 1,
        cooldown: baseStats.cooldown,
        lastFired: 0,
      });
    }
  }

  return { updatedWeapons, updatedMaxHp };
}

/**
 * 무기 선택지 생성
 */
export function generateWeaponChoices(weapons: Weapon[]): string[] {
  const allWeapons = [
    // Projectile weapons
    "bone",
    "magic_missile",
    "fireball",
    "poison_dart",
    "dark_bolt",

    // Orbital weapons
    "orbital_yellow",
    "orbital_blue",
    "orbital_red",
    "orbital_green",
    "orbital_purple",

    // Passive upgrades
    "hp-boost",
    "speed-boost",
    "magnet",
  ];

  const available = allWeapons.filter((w) => {
    const existing = weapons.find((weapon) => weapon.type === w);
    const isPassive = w.includes("boost") || w === "magnet";
    const maxLevel = isPassive ? 5 : 10;
    return !existing || existing.level < maxLevel;
  });

  // Randomly select 3
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/**
 * 뼈다귀 발사
 */
export function fireBone(
  player: Vector,
  enemies: any[],
  weapon: Weapon,
  now: number
): Projectile[] {
  if (now - weapon.lastFired < weapon.cooldown) return [];

  const projectiles: Projectile[] = [];
  const numBones = Math.min(weapon.level, 8);

  for (let i = 0; i < numBones; i++) {
    let targetEnemy = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      const dist = Math.sqrt(
        (enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        targetEnemy = enemy;
      }
    }

    if (targetEnemy) {
      const angle = Math.atan2(targetEnemy.y - player.y, targetEnemy.x - player.x);
      const speed = 8;
      const damage = 10 + weapon.level * 2;

      projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage,
        piercing: 0,
        type: "bone",
      });
    }
  }

  weapon.lastFired = now;
  return projectiles;
}

/**
 * 번개 공격
 */
export function fireLightning(
  player: Vector,
  enemies: any[],
  weapon: Weapon,
  now: number
): Projectile[] {
  if (now - weapon.lastFired < weapon.cooldown) return [];

  const projectiles: Projectile[] = [];
  const numStrikes = Math.min(weapon.level + 2, 10);

  // Find closest enemies
  const sorted = [...enemies].sort((a, b) => {
    const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
    const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
    return distA - distB;
  });

  for (let i = 0; i < Math.min(numStrikes, sorted.length); i++) {
    const enemy = sorted[i];
    projectiles.push({
      x: enemy.x,
      y: enemy.y,
      vx: 0,
      vy: 0,
      damage: 20 + weapon.level * 5,
      piercing: 0,
      type: "lightning",
      lifetime: 10,
    });
  }

  weapon.lastFired = now;
  return projectiles;
}

/**
 * 우유 웅덩이 생성
 */
export function createMilkPuddle(
  player: Vector,
  weapon: Weapon,
  now: number
): MilkPuddle | null {
  if (now - weapon.lastFired < weapon.cooldown) return null;

  weapon.lastFired = now;
  return {
    x: player.x,
    y: player.y,
    duration: 60,
    damage: 5 + weapon.level,
  };
}

/**
 * 궤도 무기 업데이트
 */
export function updateOrbitals(
  orbitals: Orbital[],
  weapons: Weapon[],
  deltaTime: number
): Orbital[] {
  const updatedOrbitals: Orbital[] = [];

  for (const weaponType of ["ora", "rabit"]) {
    const weapon = weapons.find((w) => w.type === weaponType);
    if (weapon) {
      const numOrbitals = Math.min(weapon.level, 8);
      const radius = weaponType === "ora" ? 80 : 100;
      const speed = weaponType === "ora" ? 0.05 : 0.08;

      for (let i = 0; i < numOrbitals; i++) {
        const existing = orbitals.find(
          (o) => o.type === weaponType && Math.abs(o.angle - ((i / numOrbitals) * Math.PI * 2)) < 0.1
        );

        const angle = existing
          ? existing.angle + speed * deltaTime
          : (i / numOrbitals) * Math.PI * 2;

        updatedOrbitals.push({
          angle,
          radius,
          damage: (weaponType === "ora" ? 15 : 12) + weapon.level * 2,
          type: weaponType,
        });
      }
    }
  }

  // IronPaw (claw attack)
  const ironpawWeapon = weapons.find((w) => w.type === "ironpaw");
  if (ironpawWeapon) {
    const existing = orbitals.find((o) => o.type === "ironpaw");
    updatedOrbitals.push({
      angle: existing?.angle || 0,
      radius: 40,
      damage: 30 + ironpawWeapon.level * 5,
      type: "ironpaw",
    });
  }

  return updatedOrbitals;
}

/**
 * 이동 속도 계산
 */
export function getPlayerSpeed(weapons: Weapon[]): number {
  const speedBoost = weapons.find((w) => w.type === "speed-boost");
  return speedBoost ? 4 + speedBoost.level * 0.6 : 4;
}

/**
 * 자석 범위 계산
 */
export function getMagnetRange(weapons: Weapon[]): number {
  const magnet = weapons.find((w) => w.type === "magnet");
  return magnet ? 200 + magnet.level * 40 : 200;
}
