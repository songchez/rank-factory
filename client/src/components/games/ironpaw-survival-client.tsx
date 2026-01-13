import { useEffect, useRef, useState } from "react";
import { submitGameScoreAction } from "../../lib/actions";
import {
  GAME_ID,
  TARGET_TIME,
  PLAYER_SIZE,
  PLAYER_SPRITE,
  SPRITE_SIZE,
  ANIMATIONS,
  ASSETS,
  type Vector,
  type Enemy,
  type Projectile,
  type Gem,
  type Orbital,
  type MilkPuddle,
  type DamageNumber,
  type Weapon,
} from "../../constants/games/ironpaw-config";
import { renderTilemap, renderFallbackGrid } from "./ironpaw/tilemap-renderer";
import {
  renderMilkPuddles,
  renderGems,
  renderDamageNumbers,
  renderEnemies,
  renderProjectiles,
  renderOrbitals,
  renderPlayer,
} from "./ironpaw/entity-renderer";
import { renderCompleteUI } from "./ironpaw/ui-renderer";
import { LevelUpModal, GameOverModal } from "./ironpaw/modals";
import { useGameState } from "../../hooks/games/useGameState";
import { useImageLoader, IRONPAW_IMAGES } from "../../hooks/games/useImageLoader";
import {
  upgradeWeapon,
  generateWeaponChoices,
  fireBone,
  fireLightning,
  createMilkPuddle,
  updateOrbitals,
  getPlayerSpeed,
  getMagnetRange,
} from "./ironpaw/weapon-system";
import {
  spawnEnemies,
  updateEnemyMovement,
  removeDeadEnemies,
} from "./ironpaw/enemy-spawner";

export function IronPawSurvivalClient({
  leaderboard,
  gameStarted,
  onGameEnd,
  onRestart,
  isLoggedIn = false,
  onLoginPrompt,
}: {
  leaderboard: any[];
  gameStarted?: boolean;
  onGameEnd?: () => void;
  onRestart?: () => void;
  isLoggedIn?: boolean;
  onLoginPrompt?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use game state hook
  const { state, setters } = useGameState();
  const {
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
  } = state;

  const {
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
  } = setters;

  // Track last direction for animation (not in central state)
  const [lastDirection, setLastDirection] = useState({ dx: 0, dy: 0 });

  // Image loading with hook
  const imagesRef = useImageLoader(IRONPAW_IMAGES);

  // Weapons ref for level up filtering (RAN-31)
  const weaponsRef = useRef<Weapon[]>([]);
  useEffect(() => {
    weaponsRef.current = weapons;
  }, [weapons]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        setWIDTH(w);
        setHEIGHT(h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard handling (RAN-32: pause with ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
        return;
      }
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Start game
  const startGame = () => {
    setIsRunning(true);
    setGameOver(false);
    setVictory(false);
    setPlayer({ x: 0, y: 0 });
    setPlayerHp(100);
    setPlayerMaxHp(100);
    setPlayerLevel(1);
    setPlayerExp(0);
    setExpToNext(10);
    setEnemies([]);
    setProjectiles([]);
    setGems([]);
    setWeapons([{ type: "ironpaw", level: 1, cooldown: 1000, lastFired: 0 }]);
    // Initialize ironpaw orbital (increased radius for better visibility)
    setOrbitals([{
      angle: 0,
      radius: 80,
      damage: 11,
      type: "ironpaw",
    }]);
    setMilkPuddles([]);
    setScore(0);
    setKillCount(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setShowLevelUp(false);
  };

  // End game
  const endGame = async (won: boolean) => {
    setIsRunning(false);
    setGameOver(true);
    setVictory(won);

    // Only submit score if logged in
    if (isLoggedIn) {
      const finalScore = won ? score + 1000000 : score; // Huge bonus for winning
      await submitGameScoreAction(GAME_ID, finalScore, undefined, undefined, {
        survived_ms: elapsedTime,
        kills: killCount,
        level: playerLevel,
        won,
      });
    }

    if (onGameEnd) onGameEnd();
  };

  // Handle level up choice (RAN-31: passive items support)
  const chooseLevelUpgrade = (choice: string) => {
    const { updatedWeapons, updatedMaxHp } = upgradeWeapon(weapons, choice, playerMaxHp);

    setWeapons(updatedWeapons);
    if (updatedMaxHp > playerMaxHp) {
      setPlayerMaxHp(updatedMaxHp);
      setPlayerHp(prev => prev + (updatedMaxHp - playerMaxHp));
    }

    setShowLevelUp(false);
  };

  // Main game loop
  useEffect(() => {
    if (!isRunning) return;

    const loop = setInterval(() => {
      // Pause check (RAN-32)
      if (isPaused) return;

      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      // Victory condition
      if (elapsed >= TARGET_TIME) {
        endGame(true);
        return;
      }

      // Player movement
      const moveSpeed = getPlayerSpeed(weapons);
      let dx = 0, dy = 0;
      if (keys.has('w') || keys.has('arrowup')) dy -= moveSpeed;
      if (keys.has('s') || keys.has('arrowdown')) dy += moveSpeed;
      if (keys.has('a') || keys.has('arrowleft')) dx -= moveSpeed;
      if (keys.has('d') || keys.has('arrowright')) dx += moveSpeed;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / len) * moveSpeed;
        dy = (dy / len) * moveSpeed;
        setPlayer(p => ({
          x: p.x + dx,
          y: p.y + dy,
        }));

        // Determine animation based on movement direction (8 directions)
        let newAnimation: keyof typeof ANIMATIONS = "idle";
        const threshold = 0.5; // Threshold for diagonal detection

        if (Math.abs(dx) > threshold && Math.abs(dy) > threshold) {
          // Diagonal movement
          if (dx > 0 && dy < 0) newAnimation = "walk_right_up";
          else if (dx > 0 && dy > 0) newAnimation = "walk_right_down";
          else if (dx < 0 && dy < 0) newAnimation = "walk_left_up";
          else if (dx < 0 && dy > 0) newAnimation = "walk_left_down";
        } else if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          newAnimation = dx > 0 ? "walk_right" : "walk_left";
        } else {
          // Vertical movement
          newAnimation = dy > 0 ? "walk_down" : "walk_up";
        }

        setCurrentAnimation(newAnimation);
        setLastDirection({ dx, dy });
      } else {
        // Idle state
        setCurrentAnimation("idle");
      }

      // Update animation frame
      setAnimationCounter(prev => {
        const newCounter = prev + 1;
        const anim = ANIMATIONS[currentAnimation];
        if (newCounter >= anim.speed) {
          setAnimationFrame(prevFrame => (prevFrame + 1) % anim.frames);
          return 0;
        }
        return newCounter;
      });

      // Spawn and move enemies
      const newEnemies = spawnEnemies(player, enemies, elapsed, playerLevel);
      if (newEnemies.length > enemies.length) {
        setEnemies(newEnemies);
      }

      // Move enemies toward player
      setEnemies(prev => updateEnemyMovement(prev, player, 16));

      // Fire weapons
      setWeapons(prev => prev.map(w => {
        if (now - w.lastFired < w.cooldown) return w;

        if (w.type === "bone") {
          const newProjectiles = fireBone(player, enemies, w, now);
          if (newProjectiles.length > 0) {
            setProjectiles(prevProj => [...prevProj, ...newProjectiles]);
          }
        } else if (w.type === "lightning") {
          const newProjectiles = fireLightning(player, enemies, w, now);
          if (newProjectiles.length > 0) {
            setProjectiles(prevProj => [...prevProj, ...newProjectiles]);
          }
        } else if (w.type === "milk") {
          const puddle = createMilkPuddle(player, w, now);
          if (puddle) {
            setMilkPuddles(prev => [...prev, puddle]);
          }
        }

        return { ...w, lastFired: now };
      }));

      // Update orbitals
      setOrbitals(prev => updateOrbitals(prev, weapons, 16));

      // Update milk puddles
      setMilkPuddles(prev => prev
        .map(p => ({ ...p, duration: p.duration - 1 }))
        .filter(p => p.duration > 0)
      );

      // Move projectiles
      setProjectiles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          lifetime: p.lifetime !== undefined ? p.lifetime - 1 : undefined,
        }))
        .filter(p => {
          if (p.lifetime !== undefined && p.lifetime <= 0) return false;
          return p.x > -50 && p.x < WIDTH + 50 && p.y > -50 && p.y < HEIGHT + 50;
        })
      );

      // Projectile collision with enemies (RAN-32: damage numbers)
      let newKills = 0;
      let newGems: Gem[] = [];
      let newDamageNumbers: DamageNumber[] = [];

      setProjectiles(prev => {
        const surviving: Projectile[] = [];

        prev.forEach(proj => {
          let pierce = proj.piercing;
          let hit = false;

          setEnemies(prevEnemies => {
            return prevEnemies.map(e => {
              if (hit && pierce <= 0) return e;

              const dist = Math.sqrt((e.x - proj.x) ** 2 + (e.y - proj.y) ** 2);
              if (dist < 20) {
                hit = true;
                const newHp = e.hp - proj.damage;

                // Add damage number
                newDamageNumbers.push({
                  x: e.x + (Math.random() - 0.5) * 20,
                  y: e.y - 20,
                  damage: proj.damage,
                  lifetime: 30
                });

                if (newHp <= 0) {
                  newKills++;
                  newGems.push({ x: e.x, y: e.y, value: 1 });
                  pierce--;
                  return { ...e, hp: 0 }; // Mark for removal
                }
                pierce--;
                return { ...e, hp: newHp };
              }
              return e;
            }).filter(e => e.hp > 0);
          });

          if (!hit || pierce >= 0) {
            surviving.push(proj);
          }
        });

        return surviving;
      });

      if (newKills > 0) {
        setKillCount(prev => prev + newKills);
        setScore(prev => prev + newKills * 10);
        setGems(prev => [...prev, ...newGems]);
      }

      // Add damage numbers
      if (newDamageNumbers.length > 0) {
        setDamageNumbers(prev => [...prev, ...newDamageNumbers]);
      }

      // Update and remove expired damage numbers
      setDamageNumbers(prev => prev.map(d => ({
        ...d,
        y: d.y - 1, // Float upward
        lifetime: d.lifetime - 1
      })).filter(d => d.lifetime > 0));

      // Orbital collision with enemies
      orbitals.forEach(orb => {
        let ox, oy;

        // Calculate orbital position (same logic as rendering)
        if (orb.type === "ironpaw") {
          const dirX = lastDirection.dx || 1;
          const dirY = lastDirection.dy || 0;
          const len = Math.sqrt(dirX * dirX + dirY * dirY);
          if (len > 0) {
            ox = player.x + (dirX / len) * orb.radius;
            oy = player.y + (dirY / len) * orb.radius;
          } else {
            ox = player.x + orb.radius;
            oy = player.y;
          }
        } else {
          ox = player.x + Math.cos(orb.angle) * orb.radius;
          oy = player.y + Math.sin(orb.angle) * orb.radius;
        }

        setEnemies(prev => prev.map(e => {
          const dist = Math.sqrt((e.x - ox) ** 2 + (e.y - oy) ** 2);
          // Increased collision radius for ironpaw due to larger sprite
          const collisionRadius = orb.type === "ironpaw" ? 30 : 20;
          if (dist < collisionRadius) {
            let newHp;

            // IronPaw (claw) does instant kill damage for early enemies
            if (orb.type === "ironpaw") {
              newHp = e.hp - orb.damage * 2; // Strong instant damage
            } else {
              newHp = e.hp - orb.damage * 0.05; // Continuous damage for other orbitals
            }

            if (newHp <= 0) {
              newKills++;
              newGems.push({ x: e.x, y: e.y, value: 1 });
              setKillCount(prev => prev + 1);
              setScore(prev => prev + 10);
              setGems(prev => [...prev, { x: e.x, y: e.y, value: 1 }]);
              return { ...e, hp: 0 };
            }
            return { ...e, hp: newHp };
          }
          return e;
        }).filter(e => e.hp > 0));
      });

      // Milk puddle damage
      milkPuddles.forEach(puddle => {
        setEnemies(prev => prev.map(e => {
          const dist = Math.sqrt((e.x - puddle.x) ** 2 + (e.y - puddle.y) ** 2);
          if (dist < 40) {
            const newHp = e.hp - puddle.damage * 0.1;
            if (newHp <= 0) {
              setKillCount(prev => prev + 1);
              setScore(prev => prev + 10);
              setGems(prev => [...prev, { x: e.x, y: e.y, value: 1 }]);
              return { ...e, hp: 0 };
            }
            return { ...e, hp: newHp };
          }
          return e;
        }).filter(e => e.hp > 0));
      });

      // Collect gems (RAN-31: magnet effect)
      const collectRadius = getMagnetRange(weapons);

      setGems(prev => prev.filter(g => {
        const dist = Math.sqrt((g.x - player.x) ** 2 + (g.y - player.y) ** 2);
        if (dist < collectRadius) {
          setPlayerExp(prevExp => {
            const newExp = prevExp + g.value;
            if (newExp >= expToNext) {
              setPlayerLevel(prevLevel => prevLevel + 1);
              setExpToNext(prevNext => Math.floor(prevNext * 1.5));

              // Show level up screen (RAN-31: improved weapon system)
              const choices = generateWeaponChoices(weaponsRef.current);
              setWeaponChoices(choices);
              setShowLevelUp(true);
              setIsRunning(false);

              return 0;
            }
            return newExp;
          });
          return false;
        }
        return true;
      }));

      // Enemy collision with player (increased radius due to larger player sprite)
      let damaged = false;
      enemies.forEach(e => {
        const dist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
        if (dist < 35) {
          damaged = true;
        }
      });

      if (damaged) {
        setPlayerHp(prev => {
          const newHp = prev - 1;
          if (newHp <= 0) {
            endGame(false);
            return 0;
          }
          return newHp;
        });
      }
    }, 16);

    return () => clearInterval(loop);
  }, [isRunning, isPaused, keys, player, enemies, projectiles, weapons, orbitals, milkPuddles, startTime, expToNext, WIDTH, HEIGHT]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // Camera: convert world coordinates to screen coordinates
      const toScreenX = (worldX: number) => worldX - player.x + WIDTH / 2;
      const toScreenY = (worldY: number) => worldY - player.y + HEIGHT / 2;

      // Clear
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Tilemap background (infinite scrolling with proper tile selection)
      const tilemapImg = imagesRef.current.get(ASSETS.TILEMAP);
      const decorImg = imagesRef.current.get(ASSETS.DECORATIONS);

      if (tilemapImg && tilemapImg.complete && tilemapImg.width > 0) {
        renderTilemap({
          ctx,
          tilemapImg,
          decorImg,
          player,
          canvasWidth: WIDTH,
          canvasHeight: HEIGHT,
        });
      } else {
        // Fallback: draw simple grid if tilemap not loaded
        renderFallbackGrid(ctx, player, WIDTH, HEIGHT);
      }

      // Render entities using separated functions
      const renderContext = { ctx, imagesRef, toScreenX, toScreenY };

      renderMilkPuddles(milkPuddles, renderContext);
      renderGems(gems, renderContext);
      renderDamageNumbers(damageNumbers, renderContext);
      renderEnemies(enemies, renderContext);

      // Projectiles
      projectiles.forEach(p => {
        const sx = toScreenX(p.x);
        const sy = toScreenY(p.y);
        if (p.type === "bone") {
          const img = imagesRef.current.get("/games/ironPaw/at-bone.png");
          if (img && img.complete) {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(Math.atan2(p.vy, p.vx));
            ctx.drawImage(img, -12, -12, 24, 24);
            ctx.restore();
          } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(sx - 4, sy - 4, 8, 8);
          }
        } else if (p.type === "lightning") {
          const img = imagesRef.current.get("/games/ironPaw/at-lightning.png");
          if (img && img.complete) {
            const frame = p.lifetime ? Math.min(8, 10 - p.lifetime) : 0;
            ctx.drawImage(img, frame * 64, 0, 64, 64, sx - 32, sy - 32, 64, 64);
          } else {
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.arc(sx, sy, 30, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Orbitals
      orbitals.forEach(orb => {
        let ox, oy;

        // IronPaw (claw attack) should be in front of the character
        if (orb.type === "ironpaw") {
          // Position in front of character based on last movement direction
          const dirX = lastDirection.dx || 1; // Default to right if no movement
          const dirY = lastDirection.dy || 0;
          const len = Math.sqrt(dirX * dirX + dirY * dirY);
          if (len > 0) {
            ox = player.x + (dirX / len) * orb.radius;
            oy = player.y + (dirY / len) * orb.radius;
          } else {
            ox = player.x + orb.radius;
            oy = player.y;
          }
        } else {
          // Other orbitals use circular orbit
          ox = player.x + Math.cos(orb.angle) * orb.radius;
          oy = player.y + Math.sin(orb.angle) * orb.radius;
        }

        const sx = toScreenX(ox);
        const sy = toScreenY(oy);

        if (orb.type === "ironpaw") {
          const img = imagesRef.current.get("/games/ironPaw/at-ironpaw.png");
          if (img && img.complete) {
            ctx.save();
            ctx.translate(sx, sy);

            // Rotate to face movement direction
            if (lastDirection.dx !== 0 || lastDirection.dy !== 0) {
              const angle = Math.atan2(lastDirection.dy, lastDirection.dx);
              ctx.rotate(angle);
            }

            // Increased size from 32x32 to 48x48
            ctx.drawImage(img, -24, -24, 48, 48);
            ctx.restore();
          } else {
            ctx.fillStyle = "#ffaa00";
            ctx.fillRect(sx - 12, sy - 12, 24, 24);
          }
        } else if (orb.type === "ora") {
          const img = imagesRef.current.get("/games/ironPaw/at-ora.png");
          if (img && img.complete) {
            const frame = Math.floor(orb.angle * 2) % 9;
            ctx.drawImage(img, frame * 64, 0, 64, 64, sx - 20, sy - 20, 40, 40);
          } else {
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.arc(sx, sy, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (orb.type === "rabit") {
          const img = imagesRef.current.get("/games/ironPaw/at-rabit.png");
          if (img && img.complete) {
            const frame = Math.floor(orb.angle * 2) % 9;
            ctx.drawImage(img, frame * 64, 0, 64, 64, sx - 24, sy - 24, 48, 48);
          } else {
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.arc(sx, sy, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Player (always rendered at screen center)
      const playerScreenX = WIDTH / 2;
      const playerScreenY = HEIGHT / 2;
      const playerImg = imagesRef.current.get(PLAYER_SPRITE);
      if (playerImg && playerImg.complete && playerImg.width > 0) {
        const anim = ANIMATIONS[currentAnimation];
        const spriteX = animationFrame * SPRITE_SIZE;
        const spriteY = anim.row * SPRITE_SIZE;

        ctx.save();
        ctx.translate(playerScreenX, playerScreenY);

        // Draw player sprite (scaled to 48x48 for better visibility)
        const renderSize = 48;
        ctx.drawImage(
          playerImg,
          spriteX,
          spriteY,
          SPRITE_SIZE,
          SPRITE_SIZE,
          -renderSize / 2,
          -renderSize / 2,
          renderSize,
          renderSize
        );

        ctx.restore();
      } else {
        // Fallback - draw a simple cat shape
        ctx.fillStyle = "#888888";
        ctx.fillRect(playerScreenX - 24, playerScreenY - 24, 48, 48);
        // Ears
        ctx.fillStyle = "#666666";
        ctx.beginPath();
        ctx.moveTo(playerScreenX - 24, playerScreenY - 24);
        ctx.lineTo(playerScreenX - 16, playerScreenY - 32);
        ctx.lineTo(playerScreenX - 8, playerScreenY - 24);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 8, playerScreenY - 24);
        ctx.lineTo(playerScreenX + 16, playerScreenY - 32);
        ctx.lineTo(playerScreenX + 24, playerScreenY - 24);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(playerScreenX - 16, playerScreenY - 12, 6, 6);
        ctx.fillRect(playerScreenX + 10, playerScreenY - 12, 6, 6);
      }

      // UI overlay (RAN-32: improved UI/UX)
      renderCompleteUI({
        ctx,
        imagesRef,
        WIDTH,
        HEIGHT,
        elapsedTime,
        targetTime: TARGET_TIME,
        playerHp,
        playerMaxHp,
        playerExp,
        playerLevel,
        expToNext,
        weapons,
        killCount,
        score,
      });
    };

    const animLoop = setInterval(render, 16);
    return () => clearInterval(animLoop);
  }, [player, enemies, projectiles, gems, orbitals, milkPuddles, damageNumbers, weapons, playerHp, playerMaxHp, playerLevel, playerExp, expToNext, elapsedTime, killCount, score, currentAnimation, animationFrame, lastDirection, WIDTH, HEIGHT]);

  useEffect(() => {
    if (gameStarted && !isRunning && !gameOver) {
      startGame();
    }
  }, [gameStarted, isRunning, gameOver]);

  if (!gameStarted) {
    return (
      <>
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/games/ironPaw/profile.png"
            alt="Iron Paw"
            className="w-24 h-24 border-2 border-black object-cover"
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              뱀파이어 서바이벌 스타일 액션 게임! 30분간 생존하세요!
              <br />
              WASD 또는 화살표 키로 이동, 무기는 자동 공격!
            </p>
            {!isLoggedIn && (
              <div className="text-center text-xs text-amber-600 font-bold mt-2">
                💡 게임은 누구나 즐길 수 있지만, 점수 저장을 위해서는 로그인이 필요합니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 border-2 border-black p-3 max-h-[250px] overflow-y-auto">
          <h3 className="font-heading text-base mb-2">🏆 리더보드</h3>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 8).map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-white border-2 border-black p-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold w-5">{idx + 1}</span>
                  <span className="font-medium">{row.username}</span>
                </div>
                <span className="font-mono font-bold">{row.score?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <h2 className="font-heading text-3xl mb-6">⏸️ 일시 정지</h2>
            <p className="text-sm text-muted-foreground mb-8">ESC 키를 다시 눌러 계속하기</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-primary border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-bold"
            >
              계속하기
            </button>
          </div>
        </div>
      )}

      <LevelUpModal
        show={showLevelUp}
        weaponChoices={weaponChoices}
        weapons={weapons}
        onChooseUpgrade={(choice) => {
          chooseLevelUpgrade(choice);
          setIsRunning(true);
        }}
      />

      <GameOverModal
        show={gameOver}
        victory={victory}
        elapsedTime={elapsedTime}
        killCount={killCount}
        score={score}
        isLoggedIn={isLoggedIn}
        onLoginPrompt={onLoginPrompt}
        onRestart={onRestart}
      />
    </div>
  );
}
