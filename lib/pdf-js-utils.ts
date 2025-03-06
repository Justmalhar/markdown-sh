import { put } from '@vercel/blob';
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import fetch from 'node-fetch';

// Configure PDF.js for server-side use
if (typeof window === 'undefined') {
  // We're on the server
  const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Converts a PDF file to an array of image URLs using a simplified approach
 * @param pdfUrl URL of the PDF file
 * @returns Array of image URLs for each page
 */
export async function convertPdfToImagesSimple(pdfUrl: string): Promise<string[]> {
  try {
    console.log(`Converting PDF to images (simple method): ${pdfUrl}`);
    
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    const pdfBytes = await response.arrayBuffer();
    
    // Configure PDF.js with options that work better in Node.js environment
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBytes,
      // @ts-ignore - disableWorker is a valid option but not in the type definition
      disableWorker: true,
      useSystemFonts: true,
      isEvalSupported: false,
      nativeImageDecoderSupport: 'none'
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    console.log(`PDF has ${numPages} pages`);
    
    const imageUrls: string[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`Processing page ${pageNum}`);
      try {
        // Get the page
        const page = await pdf.getPage(pageNum);
        
        // Set scale for better quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        // Create a canvas for rendering
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, viewport.width, viewport.height);
        
        // Render the PDF page to the canvas with options that work better in Node.js
        const renderContext = {
          canvasContext: context as any, // Type assertion to handle Node.js canvas vs browser canvas differences
          viewport: viewport,
          enableWebGL: false,
          renderInteractiveForms: false
        };
        
        try {
          await page.render(renderContext).promise;
          
          // Convert canvas to image buffer
          const imageBuffer = canvas.toBuffer('image/png');
          
          // Upload the image to Vercel Blob
          if (!process.env.OCR_READ_WRITE_TOKEN) {
            throw new Error("OCR_READ_WRITE_TOKEN is not set");
          }
          
          const blob = await put(`pdf-page-${pageNum}.png`, imageBuffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: 'image/png',
            token: process.env.OCR_READ_WRITE_TOKEN,
          });
          
          imageUrls.push(blob.url);
          console.log(`Page ${pageNum} converted and uploaded: ${blob.url}`);
        } catch (renderError) {
          console.error(`Error rendering page ${pageNum}:`, renderError);
          
          // Try a fallback approach - just create a blank image with page number
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, viewport.width, viewport.height);
          context.fillStyle = '#000000';
          context.font = '24px Arial';
          context.fillText(`Page ${pageNum} (rendering failed)`, 50, 100);
          
          const fallbackImageBuffer = canvas.toBuffer('image/png');
          
          const fallbackBlob = await put(`pdf-page-${pageNum}-fallback.png`, fallbackImageBuffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: 'image/png',
            token: process.env.OCR_READ_WRITE_TOKEN,
          });
          
          imageUrls.push(fallbackBlob.url);
          console.log(`Page ${pageNum} fallback image uploaded: ${fallbackBlob.url}`);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error converting PDF to images (simple method):', error);
    throw error;
  }
}

/**
 * Process a PDF file for OCR by converting each page to an image and processing it
 * @param pdfUrl URL of the PDF file
 * @param processImageFn Function to process each image
 * @param returnPagesArray Whether to return an array of page contents instead of a combined string
 * @returns Combined markdown result with page numbers or an array of page contents
 */
export async function processPdfForOcrSimple(
  pdfUrl: string,
  processImageFn: (imageUrl: string) => Promise<string>,
  returnPagesArray: boolean = false
): Promise<string | string[]> {
  try {
    console.log(`Starting PDF OCR process (simple method) for: ${pdfUrl}`);
    
    // Convert PDF to images
    const imageUrls = await convertPdfToImagesSimple(pdfUrl);
    
    if (imageUrls.length === 0) {
      throw new Error("Failed to convert PDF to images");
    }
    
    console.log(`Successfully converted PDF to ${imageUrls.length} images. Processing with OCR...`);
    
    // Process each image in parallel
    const markdownPromises = imageUrls.map((imageUrl, index) => 
      processImageFn(imageUrl).then(markdown => {
        // Add page number to the markdown if not returning array
        return returnPagesArray ? markdown : `\n\n## Page ${index + 1}\n\n${markdown}`;
      }).catch(error => {
        console.error(`Error processing image ${index + 1}:`, error);
        return returnPagesArray ? 
          `*Error processing this page*` : 
          `\n\n## Page ${index + 1}\n\n*Error processing this page*`;
      })
    );
    
    // Wait for all pages to be processed
    const markdownResults = await Promise.all(markdownPromises);
    
    if (returnPagesArray) {
      console.log(`PDF OCR processing complete. Returning array with ${markdownResults.length} pages.`);
      return markdownResults;
    } else {
      // Combine the results
      const combinedMarkdown = markdownResults.join('\n\n');
      console.log(`PDF OCR processing complete. Generated ${combinedMarkdown.length} characters of markdown.`);
      return combinedMarkdown;
    }
  } catch (error) {
    console.error('Error processing PDF for OCR (simple method):', error);
    throw error;
  }
} 