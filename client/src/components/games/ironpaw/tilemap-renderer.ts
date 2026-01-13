import { Vector } from "../../../constants/games/ironpaw-config";

interface TilemapRenderOptions {
  ctx: CanvasRenderingContext2D;
  tilemapImg: HTMLImageElement;
  decorImg?: HTMLImageElement;
  player: Vector;
  canvasWidth: number;
  canvasHeight: number;
  tileSize?: number;
  sourceTileSize?: number;
}

/**
 * 타일맵 렌더링 함수
 * 무한 스크롤링을 지원하며, 플레이어 위치를 기준으로 타일을 렌더링합니다.
 */
export function renderTilemap({
  ctx,
  tilemapImg,
  decorImg,
  player,
  canvasWidth,
  canvasHeight,
  tileSize = 48,
  sourceTileSize = 16,
}: TilemapRenderOptions): void {
  if (!tilemapImg || !tilemapImg.complete || tilemapImg.width === 0) {
    return;
  }

  // Calculate tilemap offset based on player position
  const offsetX = -(player.x % tileSize);
  const offsetY = -(player.y % tileSize);

  // Calculate how many tiles we need to draw
  const tilesX = Math.ceil(canvasWidth / tileSize) + 2;
  const tilesY = Math.ceil(canvasHeight / tileSize) + 2;

  for (let y = -1; y < tilesY; y++) {
    for (let x = -1; x < tilesX; x++) {
      // Calculate world tile position
      const worldTileX = Math.floor(player.x / tileSize) + x;
      const worldTileY = Math.floor(player.y / tileSize) + y;

      // 모든 타일을 하나의 풀 타일로 통일 (row 3, col 1)
      const tile = { row: 3, col: 1 };

      const sourceTileX = tile.col * sourceTileSize;
      const sourceTileY = tile.row * sourceTileSize;

      // Draw tile
      ctx.drawImage(
        tilemapImg,
        sourceTileX,
        sourceTileY,
        sourceTileSize,
        sourceTileSize,
        offsetX + x * tileSize,
        offsetY + y * tileSize,
        tileSize,
        tileSize
      );

      // Add decorations (체계적 배치 - 랜덤 X)
      // 10x10 그리드마다 하나씩 장식 배치
      if (decorImg && decorImg.complete) {
        const shouldDecorate =
          worldTileX % 10 === 3 && worldTileY % 10 === 7;
        if (shouldDecorate) {
          const decorVariant = Math.abs(worldTileX + worldTileY) % 4;
          const decorSize = 16;
          ctx.drawImage(
            decorImg,
            decorVariant * decorSize,
            0,
            decorSize,
            decorSize,
            offsetX + x * tileSize + (tileSize - decorSize * 2) / 2,
            offsetY + y * tileSize + (tileSize - decorSize * 2) / 2,
            decorSize * 2,
            decorSize * 2
          );
        }
      }
    }
  }
}

/**
 * 타일맵 대체 그리드 렌더링 (이미지 로드 실패 시)
 */
export function renderFallbackGrid(
  ctx: CanvasRenderingContext2D,
  player: Vector,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 1;
  const gridSize = Math.max(40, Math.min(canvasWidth, canvasHeight) / 15);
  const gridOffsetX = (player.x % gridSize) - gridSize;
  const gridOffsetY = (player.y % gridSize) - gridSize;

  for (let i = gridOffsetX; i < canvasWidth + gridSize; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvasHeight);
    ctx.stroke();
  }
  for (let i = gridOffsetY; i < canvasHeight + gridSize; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvasWidth, i);
    ctx.stroke();
  }
}
