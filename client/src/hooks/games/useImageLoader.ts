import { useRef, useEffect } from "react";

/**
 * 게임 이미지 로더 훅
 */
export function useImageLoader(imagePaths: string[]) {
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const imageMap = new Map<string, HTMLImageElement>();

    imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      imageMap.set(path, img);
    });

    imagesRef.current = imageMap;

    // Cleanup
    return () => {
      imagesRef.current.clear();
    };
  }, [imagePaths]);

  return imagesRef;
}

/**
 * IronPaw Survival 게임 이미지 목록
 */
export const IRONPAW_IMAGES = [
  "/games/ironPaw/Characters/cat 1.png",
  "/games/ironPaw/basic_tileset_and_assets_standard/terrain_tiles_v2.png",
  "/games/ironPaw/basic_tileset_and_assets_standard/decorations.png",
  "/games/ironPaw/at-milk.png",
  "/games/ironPaw/bluecristal.png",
  "/games/ironPaw/enemy1.png",
  "/games/ironPaw/enemy2.png",
  "/games/ironPaw/enemy3.png",
  "/games/ironPaw/at-bone.png",
  "/games/ironPaw/at-ironpaw.png",
  "/games/ironPaw/at-lightning.png",
  "/games/ironPaw/at-ora.png",
  "/games/ironPaw/at-rabit.png",
  "/games/ironPaw/profile.png",
  "/games/ironPaw/basic_tileset_and_assets_standard/Bat 16x16.png",
  "/games/ironPaw/basic_tileset_and_assets_standard/Blue Fly 16x16.png",
  "/games/ironPaw/basic_tileset_and_assets_standard/Fly 16x16.png",
];
