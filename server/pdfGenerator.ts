import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';

// Constants for print quality
const TARGET_DPI = 300;
const POINTS_PER_INCH = 72;

interface ImageTransform {
  rotation: number; // 0, 90, 180, 270
  zoom: number; // scale factor (1.0 = 100%)
  panX: number; // pixels
  panY: number; // pixels
}

interface PrintDimensions {
  width: number; // inches
  height: number; // inches
}

interface GeneratePDFOptions {
  imageBase64: string; // base64 encoded image
  backImageBase64?: string; // optional back image
  printDimensions: PrintDimensions;
  transform: ImageTransform;
  backTransform?: ImageTransform; // transform for back image
  includeBleed?: boolean; // add 0.125" bleed margin
  includeCropMarks?: boolean; // add crop marks for printing
}

/**
 * Apply rotation to an image buffer using sharp
 */
async function applyRotation(imageBuffer: Buffer, rotation: number): Promise<Buffer> {
  let processedImage = sharp(imageBuffer);
  
  if (rotation === 90) {
    processedImage = processedImage.rotate(90);
  } else if (rotation === 180) {
    processedImage = processedImage.rotate(180);
  } else if (rotation === 270) {
    processedImage = processedImage.rotate(270);
  }
  
  return processedImage.toBuffer() as Promise<Buffer>;
}

/**
 * Calculate the crop region based on zoom and pan
 */
function calculateCropRegion(
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number,
  zoom: number,
  panX: number,
  panY: number
): { left: number; top: number; width: number; height: number } {
  // Calculate the visible region dimensions at current zoom level
  const visibleWidth = targetWidth / zoom;
  const visibleHeight = targetHeight / zoom;
  
  // Calculate center point with pan offset
  const centerX = imageWidth / 2 - panX;
  const centerY = imageHeight / 2 - panY;
  
  // Calculate crop region
  let left = Math.round(centerX - visibleWidth / 2);
  let top = Math.round(centerY - visibleHeight / 2);
  let width = Math.round(visibleWidth);
  let height = Math.round(visibleHeight);
  
  // Ensure crop region is within image bounds
  left = Math.max(0, Math.min(left, imageWidth - width));
  top = Math.max(0, Math.min(top, imageHeight - height));
  width = Math.min(width, imageWidth - left);
  height = Math.min(height, imageHeight - top);
  
  return { left, top, width, height };
}

/**
 * Process image with transformations and crop to exact print dimensions at 300 DPI
 */
async function processImage(
  imageBase64: string,
  printDimensions: PrintDimensions,
  transform: ImageTransform
): Promise<Buffer> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  let imageBuffer: Buffer = Buffer.from(base64Data, 'base64');
  
  // Step 1: Apply rotation first
  if (transform.rotation !== 0) {
    imageBuffer = (await applyRotation(imageBuffer, transform.rotation)) as any;
  }
  
  // Step 2: Get image metadata after rotation
  const metadata = await sharp(imageBuffer).metadata();
  const imageWidth = metadata.width!;
  const imageHeight = metadata.height!;
  
  // Step 3: Calculate target dimensions at 300 DPI
  const targetWidth = Math.round(printDimensions.width * TARGET_DPI);
  const targetHeight = Math.round(printDimensions.height * TARGET_DPI);
  
  // Step 4: Calculate crop region based on zoom and pan
  const cropRegion = calculateCropRegion(
    imageWidth,
    imageHeight,
    targetWidth,
    targetHeight,
    transform.zoom,
    transform.panX,
    transform.panY
  );
  
  // Step 5: Extract the crop region and resize to exact print dimensions
  const processedImage = await sharp(imageBuffer)
    .extract({
      left: cropRegion.left,
      top: cropRegion.top,
      width: cropRegion.width,
      height: cropRegion.height,
    })
    .resize(targetWidth, targetHeight, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3, // High-quality resizing
    })
    .jpeg({
      quality: 100, // Maximum quality for print
      chromaSubsampling: '4:4:4', // No color subsampling
    })
    .toBuffer();
  
  return processedImage;
}

/**
 * Generate a print-ready PDF from uploaded image(s)
 */
export async function generatePrintReadyPDF(options: GeneratePDFOptions): Promise<Buffer> {
  const {
    imageBase64,
    backImageBase64,
    printDimensions,
    transform,
    backTransform,
    includeBleed = false,
    includeCropMarks = false,
  } = options;
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Calculate page dimensions in points (72 points = 1 inch)
  let pageWidth = printDimensions.width * POINTS_PER_INCH;
  let pageHeight = printDimensions.height * POINTS_PER_INCH;
  
  // Add bleed margin if requested (0.125 inches on each side)
  const bleedMargin = includeBleed ? 0.125 * POINTS_PER_INCH : 0;
  const pageWidthWithBleed = pageWidth + (bleedMargin * 2);
  const pageHeightWithBleed = pageHeight + (bleedMargin * 2);
  
  // Process front image
  console.log('Processing front image...');
  const frontImageBuffer = await processImage(imageBase64, printDimensions, transform);
  const frontImageEmbed = await pdfDoc.embedJpg(frontImageBuffer);
  
  // Add front page
  const frontPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);
  frontPage.drawImage(frontImageEmbed, {
    x: bleedMargin,
    y: bleedMargin,
    width: pageWidth,
    height: pageHeight,
  });
  
  // Add crop marks if requested
  if (includeCropMarks) {
    const cropMarkLength = 0.25 * POINTS_PER_INCH;
    const cropMarkOffset = 0.0625 * POINTS_PER_INCH;
    
    // Top-left
    frontPage.drawLine({
      start: { x: bleedMargin - cropMarkOffset - cropMarkLength, y: bleedMargin },
      end: { x: bleedMargin - cropMarkOffset, y: bleedMargin },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    frontPage.drawLine({
      start: { x: bleedMargin, y: bleedMargin - cropMarkOffset - cropMarkLength },
      end: { x: bleedMargin, y: bleedMargin - cropMarkOffset },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    
    // Top-right
    frontPage.drawLine({
      start: { x: bleedMargin + pageWidth + cropMarkOffset, y: bleedMargin },
      end: { x: bleedMargin + pageWidth + cropMarkOffset + cropMarkLength, y: bleedMargin },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    frontPage.drawLine({
      start: { x: bleedMargin + pageWidth, y: bleedMargin - cropMarkOffset - cropMarkLength },
      end: { x: bleedMargin + pageWidth, y: bleedMargin - cropMarkOffset },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    
    // Bottom-left
    frontPage.drawLine({
      start: { x: bleedMargin - cropMarkOffset - cropMarkLength, y: bleedMargin + pageHeight },
      end: { x: bleedMargin - cropMarkOffset, y: bleedMargin + pageHeight },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    frontPage.drawLine({
      start: { x: bleedMargin, y: bleedMargin + pageHeight + cropMarkOffset },
      end: { x: bleedMargin, y: bleedMargin + pageHeight + cropMarkOffset + cropMarkLength },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    
    // Bottom-right
    frontPage.drawLine({
      start: { x: bleedMargin + pageWidth + cropMarkOffset, y: bleedMargin + pageHeight },
      end: { x: bleedMargin + pageWidth + cropMarkOffset + cropMarkLength, y: bleedMargin + pageHeight },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    frontPage.drawLine({
      start: { x: bleedMargin + pageWidth, y: bleedMargin + pageHeight + cropMarkOffset },
      end: { x: bleedMargin + pageWidth, y: bleedMargin + pageHeight + cropMarkOffset + cropMarkLength },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
  }
  
  // Process and add back image if provided (double-sided)
  if (backImageBase64 && backTransform) {
    console.log('Processing back image...');
    const backImageBuffer = await processImage(backImageBase64, printDimensions, backTransform);
    const backImageEmbed = await pdfDoc.embedJpg(backImageBuffer);
    
    const backPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);
    backPage.drawImage(backImageEmbed, {
      x: bleedMargin,
      y: bleedMargin,
      width: pageWidth,
      height: pageHeight,
    });
    
    // Add crop marks to back page if requested
    if (includeCropMarks) {
      const cropMarkLength = 0.25 * POINTS_PER_INCH;
      const cropMarkOffset = 0.0625 * POINTS_PER_INCH;
      
      // (Same crop marks for back page)
      backPage.drawLine({
        start: { x: bleedMargin - cropMarkOffset - cropMarkLength, y: bleedMargin },
        end: { x: bleedMargin - cropMarkOffset, y: bleedMargin },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin, y: bleedMargin - cropMarkOffset - cropMarkLength },
        end: { x: bleedMargin, y: bleedMargin - cropMarkOffset },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin + pageWidth + cropMarkOffset, y: bleedMargin },
        end: { x: bleedMargin + pageWidth + cropMarkOffset + cropMarkLength, y: bleedMargin },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin + pageWidth, y: bleedMargin - cropMarkOffset - cropMarkLength },
        end: { x: bleedMargin + pageWidth, y: bleedMargin - cropMarkOffset },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin - cropMarkOffset - cropMarkLength, y: bleedMargin + pageHeight },
        end: { x: bleedMargin - cropMarkOffset, y: bleedMargin + pageHeight },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin, y: bleedMargin + pageHeight + cropMarkOffset },
        end: { x: bleedMargin, y: bleedMargin + pageHeight + cropMarkOffset + cropMarkLength },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin + pageWidth + cropMarkOffset, y: bleedMargin + pageHeight },
        end: { x: bleedMargin + pageWidth + cropMarkOffset + cropMarkLength, y: bleedMargin + pageHeight },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      backPage.drawLine({
        start: { x: bleedMargin + pageWidth, y: bleedMargin + pageHeight + cropMarkOffset },
        end: { x: bleedMargin + pageWidth, y: bleedMargin + pageHeight + cropMarkOffset + cropMarkLength },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
  }
  
  // Save and return PDF as buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
