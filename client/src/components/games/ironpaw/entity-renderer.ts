import {
  Vector,
  Enemy,
  Projectile,
  Gem,
  MilkPuddle,
  Orbital,
  DamageNumber,
  PLAYER_SIZE,
  SPRITE_SIZE,
  ANIMATIONS,
  ASSETS,
} from "../../../constants/games/ironpaw-config";

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  imagesRef: React.MutableRefObject<Map<string, HTMLImageElement>>;
  toScreenX: (worldX: number) => number;
  toScreenY: (worldY: number) => number;
}

/**
 * 우유 웅덩이 렌더링
 */
export function renderMilkPuddles(
  puddles: MilkPuddle[],
  { ctx, imagesRef, toScreenX, toScreenY }: RenderContext
): void {
  puddles.forEach((p) => {
    const sx = toScreenX(p.x);
    const sy = toScreenY(p.y);
    const img = imagesRef.current.get(ASSETS.MILK);
    if (img && img.complete) {
      const frame = Math.floor((60 - p.duration) / 10) % 9;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, frame * 64, 0, 64, 64, sx - 32, sy - 32, 64, 64);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(sx, sy, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * 젬 렌더링
 */
export function renderGems(
  gems: Gem[],
  { ctx, imagesRef, toScreenX, toScreenY }: RenderContext
): void {
  gems.forEach((g) => {
    const sx = toScreenX(g.x);
    const sy = toScreenY(g.y);
    const img = imagesRef.current.get(ASSETS.CRYSTAL);
    if (img && img.complete) {
      ctx.drawImage(img, sx - 8, sy - 8, 16, 16);
    } else {
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
    }
  });
}

/**
 * 데미지 숫자 렌더링
 */
export function renderDamageNumbers(
  damageNumbers: DamageNumber[],
  { ctx, toScreenX, toScreenY }: RenderContext
): void {
  damageNumbers.forEach((d) => {
    const sx = toScreenX(d.x);
    const sy = toScreenY(d.y);
    const opacity = d.lifetime / 30;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = "bold 16px monospace";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(d.damage.toString(), sx, sy);
    ctx.fillStyle = "#ffff00";
    ctx.fillText(d.damage.toString(), sx, sy);
    ctx.restore();
  });
}

/**
 * 적 렌더링
 */
export function renderEnemies(
  enemies: Enemy[],
  { ctx, imagesRef, toScreenX, toScreenY }: RenderContext
): void {
  enemies.forEach((e) => {
    const sx = toScreenX(e.x);
    const sy = toScreenY(e.y);

    // Calculate bounce offset for animation
    const bounceOffset = Math.sin(e.bouncePhase) * 3;

    // Draw enemy sprite with strength-based tint
    const enemyImg = imagesRef.current.get(`/games/ironPaw/${e.type}.png`);
    if (enemyImg && enemyImg.complete) {
      ctx.save();
      ctx.translate(sx, sy + bounceOffset);

      // Rotate to face player (flip horizontally based on direction)
      const flipX = e.angle > Math.PI / 2 || e.angle < -Math.PI / 2 ? -1 : 1;
      ctx.scale(flipX, 1);

      // Apply red tint for stronger enemies
      if (e.strength > 1) {
        ctx.globalAlpha = Math.min((e.strength - 1) * 0.3, 0.4);
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(-16, -16, 32, 32);
        ctx.globalAlpha = 1;
      }

      ctx.drawImage(enemyImg, -16, -16, 32, 32);
      ctx.restore();
    } else {
      // Fallback to red square if image not loaded
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(sx - 12, sy - 12 + bounceOffset, 24, 24);
    }

    // HP bar (color changes with strength)
    const hpBarY = sy - 18 + bounceOffset;
    ctx.fillStyle = "#000";
    ctx.fillRect(sx - 12, hpBarY, 24, 4);
    const hpColor =
      e.strength > 1.5 ? "#ff0000" : e.strength > 1 ? "#ffaa00" : "#00ff00";
    ctx.fillStyle = hpColor;
    ctx.fillRect(sx - 12, hpBarY, 24 * (e.hp / e.maxHp), 4);
  });
}

/**
 * 발사체 렌더링
 */
export function renderProjectiles(
  projectiles: Projectile[],
  { ctx, toScreenX, toScreenY }: RenderContext
): void {
  projectiles.forEach((proj) => {
    const sx = toScreenX(proj.x);
    const sy = toScreenY(proj.y);

    if (proj.type === "banana") {
      ctx.save();
      ctx.translate(sx, sy);
      const angle = Math.atan2(proj.vy, proj.vx);
      ctx.rotate(angle);
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (proj.type === "yarn") {
      ctx.fillStyle = "#ff69b4";
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
    }
  });
}

/**
 * 궤도 무기 렌더링
 */
export function renderOrbitals(
  orbitals: Orbital[],
  player: Vector,
  { ctx, toScreenX, toScreenY }: RenderContext
): void {
  orbitals.forEach((orb) => {
    const orbX = player.x + Math.cos(orb.angle) * orb.radius;
    const orbY = player.y + Math.sin(orb.angle) * orb.radius;
    const sx = toScreenX(orbX);
    const sy = toScreenY(orbY);

    if (orb.type === "milk") {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(orb.angle);

      // Milk carton shape
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-6, -8, 12, 16);
      ctx.fillStyle = "#4488ff";
      ctx.fillRect(-6, -8, 12, 4);

      ctx.restore();
    } else if (orb.type === "yarn") {
      ctx.fillStyle = "#ff69b4";
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff1493";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffaa00";
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * 플레이어 렌더링
 */
export function renderPlayer(
  player: Vector,
  animState: { animation: keyof typeof ANIMATIONS; frame: number },
  WIDTH: number,
  HEIGHT: number,
  { ctx, imagesRef }: Omit<RenderContext, "toScreenX" | "toScreenY">
): void {
  const playerImg = imagesRef.current.get(
    "/games/ironPaw/Characters/cat 1.png"
  );

  if (playerImg && playerImg.complete) {
    const anim = ANIMATIONS[animState.animation];
    const frameIndex = Math.floor(animState.frame) % anim.frames;
    const sourceX = frameIndex * SPRITE_SIZE;
    const sourceY = anim.row * SPRITE_SIZE;

    ctx.drawImage(
      playerImg,
      sourceX,
      sourceY,
      SPRITE_SIZE,
      SPRITE_SIZE,
      WIDTH / 2 - PLAYER_SIZE / 2,
      HEIGHT / 2 - PLAYER_SIZE / 2,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  } else {
    // Fallback
    ctx.fillStyle = "#4488ff";
    ctx.fillRect(
      WIDTH / 2 - PLAYER_SIZE / 2,
      HEIGHT / 2 - PLAYER_SIZE / 2,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  }
}
