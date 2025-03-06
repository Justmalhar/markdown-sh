// Import canvas conditionally to handle environments where it's not available
let createCanvas: any;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
} catch (error) {
  console.warn('Canvas package not available, PDF to image conversion will be limited');
  // Provide a mock implementation that will be used in environments where canvas is not available
  createCanvas = (width: number, height: number) => {
    return {
      width,
      height,
      getContext: () => ({
        fillStyle: '',
        fillRect: () => {},
        fillText: () => {},
        font: '',
      }),
      toBuffer: () => Buffer.from('Fallback image - canvas not available'),
    };
  };
}

import * as pdfjsLib from 'pdfjs-dist';
import { put } from '@vercel/blob';
import path from 'path';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';

// In Next.js server environment, we need to use the Node.js version of PDF.js
if (typeof window === 'undefined') {
  // We're on the server
  const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Converts a PDF file to an array of image URLs
 * @param pdfUrl URL of the PDF file
 * @returns Array of image URLs for each page
 */
export async function convertPdfToImages(pdfUrl: string): Promise<string[]> {
  try {
    console.log(`Converting PDF to images: ${pdfUrl}`);
    
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    const pdfBytes = await response.arrayBuffer();
    
    // Load the PDF document with options that work better in Node.js
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
        const page = await pdf.getPage(pageNum);
        
        // Get the viewport at a reasonable scale
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Create a canvas for rendering
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Clear canvas with white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, viewport.width, viewport.height);
        
        // Prepare render context with options that work better in Node.js
        const renderContext = {
          canvasContext: context as any, // Type assertion to handle Node.js canvas vs browser canvas differences
          viewport: viewport,
          enableWebGL: false,
          renderInteractiveForms: false
        };
        
        try {
          // Render the PDF page to the canvas
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
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}

/**
 * Process a PDF file for OCR by converting each page to an image and processing it
 * @param pdfUrl URL of the PDF file
 * @param processImageFn Function to process each image
 * @returns Combined markdown result with page numbers
 */
export async function processPdfForOcr(
  pdfUrl: string,
  processImageFn: (imageUrl: string) => Promise<string>
): Promise<string> {
  try {
    console.log(`Starting PDF OCR process for: ${pdfUrl}`);
    
    // Convert PDF to images
    const imageUrls = await convertPdfToImages(pdfUrl);
    
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
    console.error('Error processing PDF for OCR:', error);
    throw error;
  }
}
