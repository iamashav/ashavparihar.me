import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

const FONT_STACK = '"Space Grotesk", "Segoe UI", system-ui, sans-serif';
const MEASURE_SIZE = 100;
const WIDTH_RATIO = 0.86;

/**
 * `fillText` silently falls back to system sans if the webfont has not loaded yet, so the texture
 * must not be drawn until the face is actually available.
 */
export async function waitForDisplayFont() {
  if (!('fonts' in document)) return;
  try {
    await document.fonts.load(`700 ${MEASURE_SIZE}px "Space Grotesk"`);
    await document.fonts.ready;
  } catch {
    // A failed load just means the fallback stack renders; not worth blocking the hero over.
  }
}

interface TextTextureOptions {
  text: string;
  width: number;
  height: number;
  dpr: number;
}

/**
 * Draws the headline into a 2D canvas sized to the viewport, so the texture maps 1:1 onto a
 * fullscreen plane and needs no aspect correction in the shader.
 */
export function createTextTexture({ text, width, height, dpr }: TextTextureOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(Math.round(width * dpr), 1);
  canvas.height = Math.max(Math.round(height * dpr), 1);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Measure once at a reference size, then scale — cheaper and steadier than fitting by loop.
  ctx.font = `700 ${MEASURE_SIZE}px ${FONT_STACK}`;
  const measured = ctx.measureText(text).width;
  const fontSize = measured > 0 ? (MEASURE_SIZE * (width * WIDTH_RATIO)) / measured : MEASURE_SIZE;

  ctx.font = `700 ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
