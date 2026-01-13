import { Weapon } from "../../../constants/games/ironpaw-config";

interface CompleteUIRenderOptions {
  ctx: CanvasRenderingContext2D;
  imagesRef: React.MutableRefObject<Map<string, HTMLImageElement>>;
  WIDTH: number;
  HEIGHT: number;
  elapsedTime: number;
  targetTime: number;
  playerHp: number;
  playerMaxHp: number;
  playerExp: number;
  playerLevel: number;
  expToNext: number;
  weapons: Weapon[];
  killCount: number;
  score: number;
}

interface UIRenderOptions {
  ctx: CanvasRenderingContext2D;
  WIDTH: number;
  HEIGHT: number;
  timeElapsed: number;
  targetTime: number;
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  xpForNextLevel: number;
  weapons: Weapon[];
  weaponCooldowns: Map<string, number>;
}

/**
 * 시간 표시 렌더링
 */
export function renderTimer(
  ctx: CanvasRenderingContext2D,
  timeElapsed: number,
  targetTime: number
): void {
  const minutes = Math.floor(timeElapsed / 60000);
  const seconds = Math.floor((timeElapsed % 60000) / 1000);
  const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const totalMinutes = Math.floor(targetTime / 60000);

  ctx.font = "bold 24px monospace";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeText(`⏱ ${timeText} / ${totalMinutes}:00`, 20, 40);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`⏱ ${timeText} / ${totalMinutes}:00`, 20, 40);
}

/**
 * HP 바 렌더링
 */
export function renderHPBar(
  ctx: CanvasRenderingContext2D,
  hp: number,
  maxHp: number
): void {
  const barWidth = 200;
  const barHeight = 20;
  const x = 20;
  const y = 55;

  // HP bar background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x, y, barWidth, barHeight);

  // HP bar fill (gradient)
  const hpRatio = hp / maxHp;
  const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);

  if (hpRatio > 0.5) {
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(1, "#88ff88");
  } else if (hpRatio > 0.25) {
    gradient.addColorStop(0, "#ffaa00");
    gradient.addColorStop(1, "#ffdd88");
  } else {
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(1, "#ff8888");
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

  // HP bar border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);

  // HP text
  ctx.font = "bold 14px monospace";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeText(`HP: ${hp}/${maxHp}`, x + 10, y + 15);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`HP: ${hp}/${maxHp}`, x + 10, y + 15);
}

/**
 * XP 바 렌더링
 */
export function renderXPBar(
  ctx: CanvasRenderingContext2D,
  WIDTH: number,
  HEIGHT: number,
  xp: number,
  level: number,
  xpForNextLevel: number
): void {
  const barWidth = WIDTH - 40;
  const barHeight = 15;
  const x = 20;
  const y = HEIGHT - 30;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x, y, barWidth, barHeight);

  const xpRatio = xp / xpForNextLevel;
  const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
  gradient.addColorStop(0, "#4488ff");
  gradient.addColorStop(1, "#88bbff");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, barWidth * xpRatio, barHeight);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);

  ctx.font = "bold 12px monospace";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeText(`Level ${level} - XP: ${xp}/${xpForNextLevel}`, x + 10, y + 11);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Level ${level} - XP: ${xp}/${xpForNextLevel}`, x + 10, y + 11);
}

/**
 * 무기 쿨다운 표시 렌더링
 */
export function renderWeaponCooldowns(
  ctx: CanvasRenderingContext2D,
  WIDTH: number,
  weapons: Weapon[],
  weaponCooldowns: Map<string, number>
): void {
  weapons.forEach((weapon, i) => {
    const iconSize = 40;
    const x = WIDTH - 60 - i * 50;
    const y = 20;

    const cooldownLeft = weaponCooldowns.get(weapon.type) || 0;
    const cooldownRatio = Math.max(0, cooldownLeft / weapon.cooldown);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x, y, iconSize, iconSize);

    if (cooldownRatio > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(x, y, iconSize, iconSize * cooldownRatio);
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, iconSize, iconSize);

    const emoji =
      weapon.type === "banana"
        ? "🍌"
        : weapon.type === "milk"
        ? "🥛"
        : weapon.type === "yarn"
        ? "🧶"
        : "⚔️";
    ctx.font = "24px monospace";
    ctx.fillText(emoji, x + 8, y + 28);

    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`Lv${weapon.level}`, x + 2, y + iconSize - 2);
  });
}

/**
 * 완전한 게임 UI 렌더링 (IronPaw Survival)
 */
export function renderCompleteUI({
  ctx,
  imagesRef,
  WIDTH,
  HEIGHT,
  elapsedTime,
  targetTime,
  playerHp,
  playerMaxHp,
  playerExp,
  playerLevel,
  expToNext,
  weapons,
  killCount,
  score,
}: CompleteUIRenderOptions): void {
  // Top bar background
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(0, 0, WIDTH, 70);

  const fontSize = Math.max(12, Math.min(16, WIDTH / 60));
  ctx.font = `bold ${fontSize}px monospace`;

  // Time display (top-left)
  const timeLeft = Math.max(0, targetTime - elapsedTime);
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`⏱ ${mins}:${secs.toString().padStart(2, "0")}`, 15, 20);

  // HP Bar (top-left, below time)
  const hpBarWidth = 150;
  const hpBarHeight = 20;
  const hpBarX = 15;
  const hpBarY = 28;

  // HP bar background
  ctx.fillStyle = "#333";
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

  // HP bar fill (gradient)
  const hpPercent = playerHp / playerMaxHp;
  const hpFillWidth = hpBarWidth * hpPercent;
  const gradient = ctx.createLinearGradient(
    hpBarX,
    hpBarY,
    hpBarX + hpFillWidth,
    hpBarY
  );
  if (hpPercent > 0.5) {
    gradient.addColorStop(0, "#00ff88");
    gradient.addColorStop(1, "#00cc66");
  } else if (hpPercent > 0.25) {
    gradient.addColorStop(0, "#ffaa00");
    gradient.addColorStop(1, "#ff8800");
  } else {
    gradient.addColorStop(0, "#ff4444");
    gradient.addColorStop(1, "#cc0000");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(hpBarX, hpBarY, hpFillWidth, hpBarHeight);

  // HP bar border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

  // HP text
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize - 2}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${playerHp}/${playerMaxHp}`,
    hpBarX + hpBarWidth / 2,
    hpBarY + hpBarHeight - 5
  );

  // Level display (top-center)
  ctx.textAlign = "center";
  ctx.font = `bold ${fontSize + 2}px monospace`;
  ctx.fillStyle = "#ffdd00";
  ctx.fillText(`Lv.${playerLevel}`, WIDTH / 2, 25);

  // Kill count and score (top-right)
  ctx.textAlign = "right";
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`💀 ${killCount}`, WIDTH - 15, 20);
  ctx.fillText(`⭐ ${score.toLocaleString()}`, WIDTH - 15, 40);

  // Experience bar (bottom of screen)
  const expBarHeight = 15;
  const expBarY = HEIGHT - expBarHeight;
  const expPercent = playerExp / expToNext;

  // Exp bar background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, expBarY, WIDTH, expBarHeight);

  // Exp bar fill
  const expGradient = ctx.createLinearGradient(
    0,
    expBarY,
    WIDTH * expPercent,
    expBarY
  );
  expGradient.addColorStop(0, "#4488ff");
  expGradient.addColorStop(1, "#00ddff");
  ctx.fillStyle = expGradient;
  ctx.fillRect(0, expBarY, WIDTH * expPercent, expBarHeight);

  // Exp bar border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, expBarY, WIDTH, expBarHeight);

  // Exp text
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize - 4}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(
    `EXP: ${playerExp}/${expToNext}`,
    WIDTH / 2,
    expBarY + expBarHeight - 3
  );

  // Weapon icons display (top-right, below stats)
  const activeWeapons = weapons.filter(
    (w) => !w.type.includes("boost") && w.type !== "magnet"
  );
  const weaponIconSize = 32;
  const weaponIconSpacing = 8;
  const weaponIconStartX = WIDTH - 15 - weaponIconSize;
  let weaponIconY = 55;

  activeWeapons.slice(0, 6).forEach((weapon, idx) => {
    const iconX = weaponIconStartX;
    const iconY = weaponIconY + idx * (weaponIconSize + weaponIconSpacing);

    // Icon background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(iconX, iconY, weaponIconSize, weaponIconSize);

    // Weapon icon
    const weaponIconMap: Record<string, string> = {
      bone: "/games/ironPaw/at-bone.png",
      ironpaw: "/games/ironPaw/at-ironpaw.png",
      lightning: "/games/ironPaw/at-lightning.png",
      milk: "/games/ironPaw/at-milk.png",
      ora: "/games/ironPaw/at-ora.png",
      rabit: "/games/ironPaw/at-rabit.png",
    };
    const weaponIcon = imagesRef.current.get(weaponIconMap[weapon.type]);
    if (weaponIcon && weaponIcon.complete) {
      ctx.drawImage(
        weaponIcon,
        iconX + 2,
        iconY + 2,
        weaponIconSize - 4,
        weaponIconSize - 4
      );
    }

    // Weapon level
    ctx.fillStyle = "#ffdd00";
    ctx.font = `bold ${fontSize - 6}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(`${weapon.level}`, iconX + 3, iconY + weaponIconSize - 3);

    // Cooldown indicator
    const now = Date.now();
    const timeSinceLastFired = now - weapon.lastFired;
    const cooldownPercent = Math.min(1, timeSinceLastFired / weapon.cooldown);
    if (cooldownPercent < 1) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      const cooldownHeight = weaponIconSize * (1 - cooldownPercent);
      ctx.fillRect(iconX, iconY, weaponIconSize, cooldownHeight);
    }

    // Icon border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(iconX, iconY, weaponIconSize, weaponIconSize);
  });

  ctx.textAlign = "left";
}

/**
 * 전체 UI 렌더링 (간단 버전)
 */
export function renderUI({
  ctx,
  WIDTH,
  HEIGHT,
  timeElapsed,
  targetTime,
  hp,
  maxHp,
  xp,
  level,
  xpForNextLevel,
  weapons,
  weaponCooldowns,
}: UIRenderOptions): void {
  // Timer
  renderTimer(ctx, timeElapsed, targetTime);

  // HP Bar
  renderHPBar(ctx, hp, maxHp);

  // XP Bar
  renderXPBar(ctx, WIDTH, HEIGHT, xp, level, xpForNextLevel);

  // Weapon Cooldowns
  renderWeaponCooldowns(ctx, WIDTH, weapons, weaponCooldowns);
}
