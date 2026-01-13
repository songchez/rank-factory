import Phaser from "phaser";
import {
  TARGET_TIME,
  SPRITE_SIZE,
  ANIMATIONS,
  ASSETS,
} from "../../../constants/games/ironpaw-config";

// Types for game objects
interface EnemySprite extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  enemyType: "enemy1" | "enemy2" | "enemy3";
  strength: number;
}

interface ProjectileSprite extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  piercing: number;
  piercingLeft: number;
  projectileType: string;
}

export class MainScene extends Phaser.Scene {
  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private playerLevel: number = 1;
  private playerExp: number = 0;
  private expToNext: number = 10;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  // Game state
  private gameStartTime: number = 0;
  private score: number = 0;
  private killCount: number = 0;
  private isPaused: boolean = false;

  // Infinite background (TileSprite)
  private background!: Phaser.GameObjects.TileSprite;

  // Object Pooling Groups
  private enemyPool!: Phaser.Physics.Arcade.Group;
  private projectilePool!: Phaser.Physics.Arcade.Group;
  private gemPool!: Phaser.Physics.Arcade.Group;
  private damageTextPool!: Phaser.GameObjects.Group;

  // Active collections
  private activeEnemies: EnemySprite[] = [];
  private activeProjectiles: ProjectileSprite[] = [];

  // Orbitals
  private orbitals: Phaser.GameObjects.Sprite[] = [];

  // Weapons
  private weapons: Array<{
    type: string;
    level: number;
    cooldown: number;
    lastFired: number;
  }> = [];

  // UI
  private hpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private killCountText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  // Camera
  private mainCamera!: Phaser.Cameras.Scene2D.Camera;

  // Event callbacks
  public onGameOver?: (
    won: boolean,
    score: number,
    killCount: number,
    elapsedTime: number
  ) => void;
  public onLevelUp?: (level: number, weapons: any[]) => void;

  // Performance tracking
  private enemySpawnTimer: number = 0;
  private enemySpawnInterval: number = 1000; // 1초마다 스폰

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Load player sprite (cat 1.png is 432x1696, 27 columns x 106 rows, 16x16 per frame)
    this.load.spritesheet("player", "/games/ironPaw/Characters/cat 1.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load tilemap for background
    this.load.image("tilemap", ASSETS.TILEMAP);
    this.load.image("decorations", ASSETS.DECORATIONS);

    // Create enemy sprites programmatically (fallback)
    this.createEnemySprites();

    // Load Yellow effect spritesheet only (640x512, 32x32 frames = 20 columns x 16 rows)
    // We'll use different frame ranges for different skills
    this.load.spritesheet("effects", "/games/ironPaw/impact/Yellow Effect Bullet Impact Explosion 32x32.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Load weapon/item sprites (fallback)
    this.load.image("gem", ASSETS.CRYSTAL);
  }

  private createEnemySprites() {
    // Create simple enemy graphics programmatically
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Enemy 1 - Red bat
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 6);
    graphics.fillStyle(0x880000, 1);
    graphics.fillTriangle(2, 8, 8, 4, 8, 12);
    graphics.fillTriangle(14, 8, 8, 4, 8, 12);
    graphics.generateTexture("enemy1", 16, 16);

    // Enemy 2 - Blue fly
    graphics.clear();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(8, 8, 5);
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(6, 6, 2);
    graphics.fillCircle(10, 6, 2);
    graphics.generateTexture("enemy2", 16, 16);

    // Enemy 3 - Green fly
    graphics.clear();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 5);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(6, 6, 2);
    graphics.fillCircle(10, 6, 2);
    graphics.generateTexture("enemy3", 16, 16);

    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Setup camera
    this.mainCamera = this.cameras.main;
    this.mainCamera.setBackgroundColor("#2a2a2a");

    // Create infinite scrolling background (TileSprite)
    // 타일맵 이미지를 반복 가능한 패턴으로 만듦
    this.createInfiniteBackground(width, height);

    // Initialize Object Pools
    this.initializeObjectPools();

    // Create player at center
    this.player = this.physics.add.sprite(0, 0, "player", 0);
    this.player.setCollideWorldBounds(false); // 무한 맵이므로 경계 없음
    this.player.setDepth(100);
    this.player.setScale(3); // Make player larger (48x48)

    // Setup animations
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    this.createWeaponAnimations();

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // ESC for pause
    this.input
      .keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .on("down", () => {
        this.togglePause();
      });

    // Setup collisions with Quadtree optimization (Arcade Physics 내장)
    this.physics.add.overlap(
      this.player,
      this.enemyPool,
      this.playerHitEnemy as any,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.projectilePool,
      this.enemyPool,
      this.projectileHitEnemy as any,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.gemPool,
      this.collectGem as any,
      undefined,
      this
    );

    // Initialize with ironpaw orbital only
    this.weapons = [
      { type: "ironpaw", level: 1, cooldown: 1000, lastFired: 0 },
    ];
    this.createOrbital("ironpaw");

    // Create UI
    this.createUI();

    // Start game timer
    this.gameStartTime = Date.now();

    // Camera follows player with smooth lerp
    this.mainCamera.startFollow(this.player, true, 0.1, 0.1);
    this.mainCamera.setZoom(1);
  }

  private createInfiniteBackground(width: number, height: number) {
    // TileSprite를 사용한 무한 반복 배경
    // 화면보다 훨씬 큰 영역을 만들어서 스크롤 가능하게 함
    const bgSize = Math.max(width, height) * 3;

    // 실제 타일맵 이미지를 사용 (terrain_tiles_v2.png)
    this.background = this.add.tileSprite(0, 0, bgSize, bgSize, "tilemap");
    this.background.setOrigin(0.5, 0.5);
    this.background.setDepth(-10);
    this.background.setScrollFactor(1); // 카메라와 함께 스크롤
    this.background.setTint(0x88aa88); // 약간 밝은 초록색 틴트
  }

  private initializeObjectPools() {
    // Enemy Pool - 최대 300마리까지 관리
    this.enemyPool = this.physics.add.group({
      maxSize: 300,
      runChildUpdate: false,
    });

    // Projectile Pool - 최대 500개까지 관리
    this.projectilePool = this.physics.add.group({
      maxSize: 500,
      runChildUpdate: false,
    });

    // Gem Pool - 최대 200개까지 관리
    this.gemPool = this.physics.add.group({
      maxSize: 200,
      runChildUpdate: false,
    });

    // Damage Text Pool
    this.damageTextPool = this.add.group({
      maxSize: 100,
      runChildUpdate: true,
    });
  }

  private createPlayerAnimations() {
    // Create animations for all 8 directions + idle
    Object.entries(ANIMATIONS).forEach(([key, anim]) => {
      if (!this.anims.exists(key)) {
        const frames = [];
        for (let i = 0; i < anim.frames; i++) {
          frames.push({ key: "player", frame: anim.row * 27 + i }); // 27 columns in sprite sheet
        }
        this.anims.create({
          key,
          frames,
          frameRate: 60 / anim.speed,
          repeat: -1,
        });
      }
    });
  }

  private createEnemyAnimations() {
    // Enemies are static textures, no animation needed
  }

  private createWeaponAnimations() {
    // Frame layout in Yellow Effect (20 columns x 16 rows):
    // Convert (col, row) to frame number: frame = row * 20 + col

    // IronPaw (Claw) - frames 33,43,34,44,35,45 (slashing pattern)
    // row 1 col 13,14,15 = frames 33,34,35
    // row 2 col 13,14,15 = frames 53,54,55
    if (!this.anims.exists("ironpaw_anim")) {
      this.anims.create({
        key: "ironpaw_anim",
        frames: [33, 43, 34, 44, 35, 45].map(n => ({ key: "effects", frame: n })),
        frameRate: 15,
        repeat: -1,
      });
    }

    // Slash Down - frames 2,3,4 (downward slash)
    if (!this.anims.exists("slash_down_anim")) {
      this.anims.create({
        key: "slash_down_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 2, end: 4 }),
        frameRate: 20,
        repeat: 0,
      });
    }

    // Magic Missile - frames 0-9 (explosion sequence, top row)
    if (!this.anims.exists("magic_missile_anim")) {
      this.anims.create({
        key: "magic_missile_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 0, end: 9 }),
        frameRate: 30,
        repeat: 0,
      });
    }

    // Fireball - frames 20-29 (second row explosion)
    if (!this.anims.exists("fireball_anim")) {
      this.anims.create({
        key: "fireball_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 20, end: 29 }),
        frameRate: 30,
        repeat: 0,
      });
    }

    // Poison Dart - frames 40-49 (third row)
    if (!this.anims.exists("poison_dart_anim")) {
      this.anims.create({
        key: "poison_dart_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 40, end: 49 }),
        frameRate: 30,
        repeat: 0,
      });
    }

    // Dark Bolt - frames 60-69 (fourth row)
    if (!this.anims.exists("dark_bolt_anim")) {
      this.anims.create({
        key: "dark_bolt_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 60, end: 69 }),
        frameRate: 30,
        repeat: 0,
      });
    }

    // Orbital animations - different rows
    if (!this.anims.exists("orbital_yellow_anim")) {
      this.anims.create({
        key: "orbital_yellow_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 80, end: 87 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!this.anims.exists("orbital_blue_anim")) {
      this.anims.create({
        key: "orbital_blue_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 100, end: 107 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!this.anims.exists("orbital_red_anim")) {
      this.anims.create({
        key: "orbital_red_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 120, end: 127 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!this.anims.exists("orbital_green_anim")) {
      this.anims.create({
        key: "orbital_green_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 140, end: 147 }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!this.anims.exists("orbital_purple_anim")) {
      this.anims.create({
        key: "orbital_purple_anim",
        frames: this.anims.generateFrameNumbers("effects", { start: 160, end: 167 }),
        frameRate: 15,
        repeat: -1,
      });
    }
  }

  private createUI() {
    const { width, height } = this.cameras.main;

    // HP Bar
    this.hpBar = this.add.graphics();
    this.hpBar.setScrollFactor(0);
    this.hpBar.setDepth(1000);

    // EXP Bar
    this.expBar = this.add.graphics();
    this.expBar.setScrollFactor(0);
    this.expBar.setDepth(1000);

    // Timer
    this.timerText = this.add.text(width / 2, 20, "00:00", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.timerText.setOrigin(0.5, 0);
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(1000);

    // Level
    this.levelText = this.add.text(20, 80, "Lv.1", {
      fontSize: "18px",
      color: "#ffff00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(1000);

    // Score
    this.scoreText = this.add.text(width - 20, 80, "Score: 0", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(1000);

    // Kill Count
    this.killCountText = this.add.text(width - 20, 110, "Kills: 0", {
      fontSize: "16px",
      color: "#ff8888",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.killCountText.setOrigin(1, 0);
    this.killCountText.setScrollFactor(0);
    this.killCountText.setDepth(1000);

    // FPS Counter
    this.fpsText = this.add.text(20, height - 30, "FPS: 60", {
      fontSize: "14px",
      color: "#00ff00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.fpsText.setScrollFactor(0);
    this.fpsText.setDepth(1000);
  }

  private updateUI() {
    const { width } = this.cameras.main;

    // HP Bar
    this.hpBar.clear();
    const hpBarWidth = 200;
    const hpBarHeight = 20;
    const hpBarX = 20;
    const hpBarY = 20;

    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    const hpPercent = this.playerHp / this.playerMaxHp;
    const hpColor =
      hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

    // EXP Bar
    this.expBar.clear();
    const expBarWidth = width - 40;
    const expBarHeight = 10;
    const expBarX = 20;
    const expBarY = 50;

    this.expBar.fillStyle(0x000000, 0.5);
    this.expBar.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);

    const expPercent = this.playerExp / this.expToNext;
    this.expBar.fillStyle(0x00ffff, 1);
    this.expBar.fillRect(
      expBarX,
      expBarY,
      expBarWidth * expPercent,
      expBarHeight
    );

    // Timer
    const elapsed = Date.now() - this.gameStartTime;
    const remaining = Math.max(0, TARGET_TIME - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    this.timerText.setText(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );

    // Level
    this.levelText.setText(`Lv.${this.playerLevel}`);

    // Score
    this.scoreText.setText(`Score: ${this.score.toLocaleString()}`);

    // Kill Count
    this.killCountText.setText(`Kills: ${this.killCount}`);

    // FPS
    this.fpsText.setText(
      `FPS: ${Math.round(this.game.loop.actualFps)} | Enemies: ${
        this.activeEnemies.length
      }`
    );
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.anims.pauseAll();
    } else {
      this.physics.resume();
      this.anims.resumeAll();
    }
  }

  private createOrbital(type: string) {
    const orbital = this.add.sprite(0, 0, "effects", 0);
    orbital.setScale(1.0);
    orbital.setDepth(99);

    // Play spinning animation based on type
    const animKey = `${type}_anim`;
    if (this.anims.exists(animKey)) {
      orbital.play(animKey);
    }

    this.orbitals.push(orbital);
  }

  // Object Pooling - Enemy 가져오기
  private getEnemy(
    x: number,
    y: number,
    enemyType: "enemy1" | "enemy2" | "enemy3"
  ): EnemySprite | null {
    // Pool에서 비활성 적 가져오기
    let enemy = this.enemyPool.getFirstDead(false) as EnemySprite;

    if (!enemy) {
      // Pool이 꽉 찼으면 새로 생성하지 않음 (최적화)
      if (this.enemyPool.getLength() >= (this.enemyPool as any).maxSize) {
        return null;
      }

      // 새로운 적 생성
      enemy = this.enemyPool.create(x, y, enemyType) as EnemySprite;
      enemy.setScale(2);
      enemy.setDepth(50);
    } else {
      // 재활용
      enemy.setTexture(enemyType);
      enemy.setPosition(x, y);
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body!.enable = true;
    }

    // 속성 초기화
    enemy.hp = 20 + this.playerLevel * 5;
    enemy.maxHp = enemy.hp;
    enemy.enemyType = enemyType;
    enemy.strength = 1;

    this.activeEnemies.push(enemy);
    return enemy;
  }

  // Object Pooling - Projectile 가져오기
  private getProjectile(
    x: number,
    y: number,
    type: string
  ): ProjectileSprite | null {
    let projectile = this.projectilePool.getFirstDead(
      false
    ) as ProjectileSprite;

    if (!projectile) {
      if (
        this.projectilePool.getLength() >= (this.projectilePool as any).maxSize
      ) {
        return null;
      }

      projectile = this.projectilePool.create(x, y, type) as ProjectileSprite;
    } else {
      projectile.setTexture(type);
      projectile.setPosition(x, y);
      projectile.setActive(true);
      projectile.setVisible(true);
      projectile.body!.enable = true;
    }

    projectile.projectileType = type;
    this.activeProjectiles.push(projectile);
    return projectile;
  }

  // Object Pooling - Enemy 반환
  private returnEnemy(enemy: EnemySprite) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body!.enable = false;
    enemy.setVelocity(0, 0);

    const index = this.activeEnemies.indexOf(enemy);
    if (index > -1) {
      this.activeEnemies.splice(index, 1);
    }
  }

  // Object Pooling - Projectile 반환
  private returnProjectile(projectile: ProjectileSprite) {
    projectile.setActive(false);
    projectile.setVisible(false);
    projectile.body!.enable = false;
    projectile.setVelocity(0, 0);

    const index = this.activeProjectiles.indexOf(projectile);
    if (index > -1) {
      this.activeProjectiles.splice(index, 1);
    }
  }

  private spawnEnemies(delta: number) {
    this.enemySpawnTimer += delta;

    // 레벨에 따라 스폰 속도 증가 (좀 더 느리게)
    const spawnRate = Math.max(
      800,
      this.enemySpawnInterval - this.playerLevel * 30
    );

    if (this.enemySpawnTimer >= spawnRate) {
      this.enemySpawnTimer = 0;

      // 한 번에 여러 마리 스폰 (레벨에 따라, 최대 3마리로 줄임)
      const spawnCount = Math.min(3, 1 + Math.floor(this.playerLevel / 5));

      for (let i = 0; i < spawnCount; i++) {
        const spawnDistance = 500;
        const angle = Math.random() * Math.PI * 2;
        const x = this.player.x + Math.cos(angle) * spawnDistance;
        const y = this.player.y + Math.sin(angle) * spawnDistance;

        // Choose enemy type based on level
        let enemyType: "enemy1" | "enemy2" | "enemy3" = "enemy1";
        if (this.playerLevel > 5) {
          enemyType = Math.random() > 0.5 ? "enemy2" : "enemy1";
        }
        if (this.playerLevel > 10) {
          const rand = Math.random();
          enemyType =
            rand > 0.66 ? "enemy3" : rand > 0.33 ? "enemy2" : "enemy1";
        }

        this.getEnemy(x, y, enemyType);
      }
    }
  }

  private playerHitEnemy(
    player: Phaser.Physics.Arcade.Sprite,
    enemy: EnemySprite
  ) {
    if (!enemy.active) return;

    // Damage player (throttle damage)
    if (this.time.now % 30 === 0) {
      // 프레임당 1번만
      this.playerHp = Math.max(0, this.playerHp - enemy.strength);

      if (this.playerHp <= 0) {
        this.gameOver(false);
      }
    }
  }

  private projectileHitEnemy(projectile: ProjectileSprite, enemy: EnemySprite) {
    if (!projectile.active || !enemy.active) return;

    // Damage enemy
    enemy.hp -= projectile.damage;

    // Show damage number
    this.showDamageNumber(enemy.x, enemy.y, projectile.damage);

    if (enemy.hp <= 0) {
      this.killCount++;
      this.score += 10;

      // Spawn gem
      const gem = this.gemPool.get(enemy.x, enemy.y, "gem");
      if (gem) {
        gem.setScale(1.5);
        gem.setDepth(40);
        gem.setActive(true);
        gem.setVisible(true);
      }

      this.returnEnemy(enemy);
    }

    // Handle piercing
    projectile.piercingLeft--;
    if (projectile.piercingLeft <= 0) {
      this.returnProjectile(projectile);
    }
  }

  private showDamageNumber(x: number, y: number, damage: number) {
    const text = this.add.text(x, y - 20, damage.toString(), {
      fontSize: "16px",
      color: "#ffff00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setDepth(200);

    // Animate upward and fade
    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private collectGem(
    player: Phaser.Physics.Arcade.Sprite,
    gem: Phaser.Physics.Arcade.Sprite
  ) {
    if (!gem.active) return;

    this.playerExp++;
    gem.setActive(false);
    gem.setVisible(false);

    // Check level up
    if (this.playerExp >= this.expToNext) {
      this.playerLevel++;
      this.playerExp = 0;
      this.expToNext = Math.floor(this.expToNext * 1.5);

      // Trigger level up callback
      if (this.onLevelUp) {
        this.scene.pause();
        this.onLevelUp(this.playerLevel, this.weapons);
      }
    }
  }

  private fireProjectile(weaponType: string, weaponLevel: number) {
    // Find nearest enemy
    if (this.activeEnemies.length === 0) return;

    let nearest = this.activeEnemies[0];
    let minDist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      nearest.x,
      nearest.y
    );

    for (const enemy of this.activeEnemies) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    // Fire projectile based on weapon type
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      nearest.x,
      nearest.y
    );

    // Determine animation and stats based on weapon type
    let animKey = "slash_down_anim";
    let damage = 10 + weaponLevel * 2;
    let piercing = 1;
    let speed = 400;

    if (weaponType === "magic_missile") {
      animKey = "magic_missile_anim";
      damage = 15 + weaponLevel * 3;
      piercing = 1;
    } else if (weaponType === "fireball") {
      animKey = "fireball_anim";
      damage = 20 + weaponLevel * 4;
      piercing = 2;
      speed = 350;
    } else if (weaponType === "poison_dart") {
      animKey = "poison_dart_anim";
      damage = 8 + weaponLevel * 2;
      piercing = 3;
      speed = 500;
    } else if (weaponType === "dark_bolt") {
      animKey = "dark_bolt_anim";
      damage = 12 + weaponLevel * 3;
      piercing = 1;
      speed = 450;
    }

    const projectile = this.getProjectile(this.player.x, this.player.y, "effects");

    if (projectile) {
      projectile.setScale(1.0);
      projectile.setRotation(angle);
      projectile.setDepth(60);
      projectile.damage = damage;
      projectile.piercing = piercing;
      projectile.piercingLeft = piercing;

      // Play animation
      if (this.anims.exists(animKey)) {
        projectile.play(animKey);
      }

      this.physics.velocityFromRotation(
        angle,
        speed,
        projectile.body!.velocity
      );
    }
  }

  private updateOrbitals(delta: number) {
    // Update orbital positions
    this.orbitals.forEach((orbital, index) => {
      const angle =
        (Date.now() / 1000) * 2 +
        index * ((Math.PI * 2) / this.orbitals.length);
      const radius = 60; // 반경 (ironpaw는 좀 더 가까이)
      orbital.x = this.player.x + Math.cos(angle) * radius;
      orbital.y = this.player.y + Math.sin(angle) * radius;

      // Check collision with enemies - 직접 계산으로 변경 (overlapCirc 오류 방지)
      for (const enemy of this.activeEnemies) {
        if (!enemy.active) continue;

        const dist = Phaser.Math.Distance.Between(
          orbital.x,
          orbital.y,
          enemy.x,
          enemy.y
        );
        if (dist < 25) {
          enemy.hp -= 8 * (delta / 16); // ironpaw 데미지

          if (enemy.hp <= 0) {
            this.killCount++;
            this.score += 10;

            const gem = this.gemPool.get(enemy.x, enemy.y, "gem");
            if (gem) {
              gem.setScale(1.5);
              gem.setDepth(40);
              gem.setActive(true);
              gem.setVisible(true);
            }

            this.returnEnemy(enemy);
          }
        }
      }
    });
  }

  private gameOver(won: boolean) {
    this.scene.pause();
    const elapsedTime = Date.now() - this.gameStartTime;

    if (this.onGameOver) {
      const finalScore = won ? this.score + 1000000 : this.score;
      this.onGameOver(won, finalScore, this.killCount, elapsedTime);
    }
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    // Check victory condition
    const elapsed = Date.now() - this.gameStartTime;
    if (elapsed >= TARGET_TIME) {
      this.gameOver(true);
      return;
    }

    // Update infinite background scroll (TileSprite의 핵심!)
    this.background.tilePositionX = this.player.x;
    this.background.tilePositionY = this.player.y;
    this.background.x = this.player.x;
    this.background.y = this.player.y;

    // Player movement
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasdKeys.a.isDown) velocityX = -speed;
    if (this.cursors.right.isDown || this.wasdKeys.d.isDown) velocityX = speed;
    if (this.cursors.up.isDown || this.wasdKeys.w.isDown) velocityY = -speed;
    if (this.cursors.down.isDown || this.wasdKeys.s.isDown) velocityY = speed;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Update animation
    if (velocityX !== 0 || velocityY !== 0) {
      let anim = "idle";
      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        anim = velocityX > 0 ? "walk_right" : "walk_left";
      } else {
        anim = velocityY > 0 ? "walk_down" : "walk_up";
      }
      if (this.player.anims.currentAnim?.key !== anim) {
        this.player.play(anim);
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle");
      }
    }

    // Enemy AI - move towards player (Quadtree 최적화됨)
    for (const enemy of this.activeEnemies) {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, 100);
      }
    }

    // Spawn enemies (Object Pooling 사용)
    this.spawnEnemies(delta);

    // Fire weapons
    for (const weapon of this.weapons) {
      if (time - weapon.lastFired > weapon.cooldown) {
        // Only fire projectile weapons, not orbitals
        if (!weapon.type.startsWith("orbital_")) {
          this.fireProjectile(weapon.type, weapon.level);
        }
        weapon.lastFired = time;
      }
    }

    // Update orbitals
    this.updateOrbitals(delta);

    // Update UI
    this.updateUI();

    // Clean up off-screen projectiles (Object Pooling으로 반환)
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this.activeProjectiles[i];
      if (!proj.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        proj.x,
        proj.y
      );
      if (dist > 1000) {
        this.returnProjectile(proj);
      }
    }

    // Clean up far enemies (메모리 관리)
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      if (!enemy.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );
      if (dist > 1500) {
        this.returnEnemy(enemy);
      }
    }
  }

  // Public methods for external control
  public resumeGame() {
    this.scene.resume();
  }

  public addWeapon(weaponType: string) {
    const existing = this.weapons.find((w) => w.type === weaponType);
    if (existing) {
      existing.level++;
      existing.cooldown = Math.max(200, existing.cooldown - 50); // 레벨업 시 쿨다운 감소
    } else {
      this.weapons.push({
        type: weaponType,
        level: 1,
        cooldown: 1000,
        lastFired: 0,
      });

      // Create orbital if it's an orbital type weapon or ironpaw
      if (weaponType.startsWith("orbital_") || weaponType === "ironpaw") {
        this.createOrbital(weaponType);
      }
    }
  }
}
