import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Converts a PDF file to an array of image URLs using pdf-lib and sharp
 * @param pdfUrl URL of the PDF file
 * @returns Array of image URLs for each page
 */
export async function convertPdfToImagesAlt(pdfUrl: string): Promise<string[]> {
  try {
    console.log(`Converting PDF to images (alternative method): ${pdfUrl}`);
    
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    const pdfBytes = await response.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    console.log(`PDF has ${numPages} pages`);
    
    const imageUrls: string[] = [];
    
    // Process each page
    for (let pageNum = 0; pageNum < numPages; pageNum++) {
      console.log(`Processing page ${pageNum + 1}`);
      
      try {
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageNum]);
        singlePagePdf.addPage(copiedPage);
        
        // Save the single page PDF to a temporary file
        // This helps avoid the "unsupported image format" error in Sharp
        const tempDir = os.tmpdir();
        const tempPdfPath = path.join(tempDir, `temp-page-${pageNum + 1}-${Date.now()}.pdf`);
        const tempPngPath = path.join(tempDir, `temp-page-${pageNum + 1}-${Date.now()}.png`);
        
        // Save the PDF to disk
        const pdfBuffer = await singlePagePdf.save();
        fs.writeFileSync(tempPdfPath, Buffer.from(pdfBuffer));
        
        try {
          // Use Sharp to convert the PDF to PNG
          // Using a file path instead of a buffer can help with format detection
          await sharp(tempPdfPath, {
            density: 300
          })
            .png()
            .toFile(tempPngPath);
          
          // Read the PNG file
          const pngBuffer = fs.readFileSync(tempPngPath);
          
          // Upload the image to Vercel Blob
          if (!process.env.OCR_READ_WRITE_TOKEN) {
            throw new Error("OCR_READ_WRITE_TOKEN is not set");
          }
          
          const blob = await put(`pdf-page-${pageNum + 1}.png`, pngBuffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: 'image/png',
            token: process.env.OCR_READ_WRITE_TOKEN,
          });
          
          imageUrls.push(blob.url);
          console.log(`Page ${pageNum + 1} converted and uploaded: ${blob.url}`);
          
          // Clean up temporary files
          try {
            fs.unlinkSync(tempPdfPath);
            fs.unlinkSync(tempPngPath);
          } catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError);
          }
        } catch (sharpError) {
          console.error(`Error converting PDF to PNG with Sharp for page ${pageNum + 1}:`, sharpError);
          
          // Create a fallback blank image with page number
          const width = 800;
          const height = 1100;
          
          const fallbackBuffer = await sharp({
            create: {
              width,
              height,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
          })
            .png()
            .toBuffer();
          
          const fallbackBlob = await put(`pdf-page-${pageNum + 1}-fallback.png`, fallbackBuffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: 'image/png',
            token: process.env.OCR_READ_WRITE_TOKEN,
          });
          
          imageUrls.push(fallbackBlob.url);
          console.log(`Page ${pageNum + 1} fallback image uploaded: ${fallbackBlob.url}`);
          
          // Clean up temporary files
          try {
            fs.unlinkSync(tempPdfPath);
            if (fs.existsSync(tempPngPath)) {
              fs.unlinkSync(tempPngPath);
            }
          } catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError);
          }
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum + 1}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error converting PDF to images (alternative method):', error);
    throw error;
  }
}

/**
 * Process a PDF file for OCR by converting each page to an image and processing it
 * @param pdfUrl URL of the PDF file
 * @param processImageFn Function to process each image
 * @returns Combined markdown result with page numbers
 */
export async function processPdfForOcrAlt(
  pdfUrl: string,
  processImageFn: (imageUrl: string) => Promise<string>
): Promise<string> {
  try {
    console.log(`Starting PDF OCR process (alternative method) for: ${pdfUrl}`);
    
    // Convert PDF to images
    const imageUrls = await convertPdfToImagesAlt(pdfUrl);
    
    if (imageUrls.length === 0) {
      throw new Error("Failed to convert PDF to images");
    }
    
    console.log(`Successfully converted PDF to ${imageUrls.length} images. Processing with OCR...`);
    
    // Process each image in parallel
    const markdownPromises = imageUrls.map((imageUrl, index) => 
      processImageFn(imageUrl).then(markdown => {
        // Add page number to the markdown
        return `\n\n## Page ${index + 1}\n\n${markdown}`;
      }).catch(error => {
        console.error(`Error processing image ${index + 1}:`, error);
        return `\n\n## Page ${index + 1}\n\n*Error processing this page*`;
      })
    );
    
    // Wait for all pages to be processed
    const markdownResults = await Promise.all(markdownPromises);
    
    // Combine the results
    const combinedMarkdown = markdownResults.join('\n\n');
    console.log(`PDF OCR processing complete. Generated ${combinedMarkdown.length} characters of markdown.`);
    
    return combinedMarkdown;
  } catch (error) {
    console.error('Error processing PDF for OCR (alternative method):', error);
    throw error;
  }
} 