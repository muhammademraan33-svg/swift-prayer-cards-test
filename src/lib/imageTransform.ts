/**
 * Utility functions for applying image transformations (zoom, pan, rotate)
 * to create accurate previews and thumbnails.
 */

export interface ImageTransform {
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Calculate the CSS transform style object for an image with the given transformations
 */
export function getImageTransformStyle(transform: ImageTransform): React.CSSProperties {
  return {
    transform: `scale(${transform.zoom}) translate(${transform.panX / transform.zoom}px, ${transform.panY / transform.zoom}px) rotate(${transform.rotation}deg)`,
    transformOrigin: "center center",
  };
}

/**
 * Calculate effective DPI for an image at a given print size
 */
export function calculateDPI(
  imageWidth: number,
  imageHeight: number,
  printWidth: number,
  printHeight: number
): number {
  if (printWidth <= 0 || printHeight <= 0) return 0;
  const widthDPI = imageWidth / printWidth;
  const heightDPI = imageHeight / printHeight;
  return Math.min(widthDPI, heightDPI);
}
