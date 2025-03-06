import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { rateLimit } from "@/lib/rate-limit"
import { processPdfForOcr } from "@/lib/pdf-utils"
import { processPdfForOcrAlt } from "@/lib/pdf-alt-utils"
import { processPdfForOcrSimple } from "@/lib/pdf-js-utils"
import { validateApiKey } from "@/lib/api-key-service"

// Get model names from environment variables
const FAST_MODEL = process.env.FAST_MODEL || "gpt-4o-mini"
const SLOW_MODEL = process.env.SLOW_MODEL || "gpt-4o"
const VISION_MODEL = process.env.VISION_MODEL || "gpt-4o"

// Initialize OpenAI with API key and optional base URL from environment variables
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || "https://api.openai.com/v1",
})

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
})

export async function POST(req: NextRequest) {
  try {
    // Start tracking processing time
    const startTime = Date.now();
    
    // Extract OCR API key from Authorization header
    const authHeader = req.headers.get('authorization')
    let ocrApiKey: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      ocrApiKey = authHeader.substring(7)
    }
    
    // Check if OCR API key is provided
    if (!ocrApiKey) {
      return NextResponse.json({ error: "API key is required. Please provide it in the Authorization header as 'Bearer YOUR_API_KEY'." }, { status: 401 })
    }
    
    // Validate OCR API key
    const keyValidation = await validateApiKey(ocrApiKey)
    
    if (!keyValidation.valid) {
      return NextResponse.json({ error: "Invalid OCR API key" }, { status: 401 })
    }
    
    // Get key data
    const keyData = keyValidation.data
    
    // Apply rate limiting
    try {
      await limiter.check(10, ocrApiKey) // 10 requests per minute per API key
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }
    
    // Parse the request body
    const formData = await req.formData()
    
    // Get the file from the request
    const file = formData.get('file') as File | null
    const fileUrl = formData.get('url') as string || ''
    const isPdf = formData.get('isPdf') === 'true'
    const selectedModel = formData.get('model') as string || ''
    const jsonMode = formData.get('jsonMode') === 'true'
    
    // Determine which model to use based on the selected model type
    let modelToUse = FAST_MODEL; // Default to fast model
    
    if (selectedModel) {
      if (selectedModel === "fast") {
        modelToUse = FAST_MODEL;
      } else if (selectedModel === "slow") {
        modelToUse = SLOW_MODEL;
      } else if (selectedModel === "vision") {
        modelToUse = VISION_MODEL;
      } else {
        // If a specific model name was provided, use it directly
        modelToUse = selectedModel;
      }
    }
    
    // For logging purposes, determine the model type
    let modelType = "default";
    if (modelToUse === FAST_MODEL) {
      modelType = "fast";
    } else if (modelToUse === SLOW_MODEL) {
      modelType = "slow";
    } else if (modelToUse === VISION_MODEL) {
      modelType = "vision";
    } else {
      modelType = "custom";
    }

    // Extract filename from URL
    let filename = "unknown"
    try {
      // Try to extract filename from URL
      const url = new URL(fileUrl)
      const pathSegments = url.pathname.split('/')
      const lastSegment = pathSegments[pathSegments.length - 1]
      // Remove query parameters if present
      filename = lastSegment.split('?')[0]
    } catch (error) {
      // If URL parsing fails, try to extract filename from the string
      const segments = fileUrl.split('/')
      const lastSegment = segments[segments.length - 1]
      filename = lastSegment.split('?')[0]
    }

    console.log(`Processing file URL: ${fileUrl}`)
    console.log(`Filename: ${filename}`)
    console.log(`Using model type: ${modelType}, actual model: ${modelToUse}`)
    console.log(`API request from: ${keyData?.email || 'unknown'}`)
    console.log(`API key environment: ${'production'}`)
    
    // Check if the file is a PDF (either from the request or by URL)
    const isPdfFile = isPdf || fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('application/pdf');
    
    try {
      if (isPdfFile) {
        console.log('Processing PDF file');
        
        // Process PDF by converting to images first
        const processImage = async (imageUrl: string) => {
          console.log(`Processing PDF page image: ${imageUrl}`);
          return await generateMarkdownFromImage(imageUrl, modelToUse);
        };
        
        try {
          // First try the new simple method
          console.log('Trying simple PDF processing method...');
          console.log(`JSON mode: ${jsonMode}`);
          
          if (jsonMode) {
            // Process PDF with pages as separate array items
            const markdownPages = await processPdfForOcrSimple(fileUrl, processImage, true) as string[];
            console.log(`PDF processed successfully with simple method. Generated ${markdownPages.length} pages.`);
            
            // Estimate the number of tables in each page
            const pagesWithTables = markdownPages.map(pageContent => {
              const tablesExtracted = (pageContent.match(/\|[\s\S]*?\|/g) || []).length;
              return {
                content: pageContent,
                tablesExtracted
              };
            });
            
            // Calculate processing time
            const processingTime = Date.now() - startTime;
            
            return NextResponse.json({ 
              pages: pagesWithTables,
              pageCount: markdownPages.length,
              processing_time_ms: processingTime,
              file_type: "pdf",
              model: modelType,
              filename: filename,
              timestamp: new Date().toISOString(),
              api_version: "1.0"
            });
          } else {
            // Process PDF with traditional combined markdown
            const markdown = await processPdfForOcrSimple(fileUrl, processImage) as string;
            console.log(`PDF processed successfully with simple method. Generated ${markdown.length} characters of markdown.`);
            
            // Estimate the number of pages and tables
            const pageCount = markdown.split('## Page').length - 1 || 1;
            const tablesExtracted = (markdown.match(/\|[\s\S]*?\|/g) || []).length;
            
            // Calculate processing time
            const processingTime = Date.now() - startTime;
            
            return NextResponse.json({ 
              markdown,
              pageCount,
              tablesExtracted,
              processing_time_ms: processingTime,
              file_type: "pdf",
              model: modelType,
              filename: filename,
              character_count: markdown.length,
              word_count: markdown.split(/\s+/).length,
              timestamp: new Date().toISOString(),
              api_version: "1.0"
            });
          }
        } catch (simpleError) {
          console.error("Error with simple PDF processing method:", simpleError);
          console.log('Falling back to alternative PDF processing method...');
          
          try {
            // Try the alternative method if the simple method fails
            const markdown = await processPdfForOcrAlt(fileUrl, processImage);
            console.log(`PDF processed successfully with alternative method. Generated ${markdown.length} characters of markdown.`);
            
            // Estimate the number of pages and tables
            const pageCount = markdown.split('## Page').length - 1 || 1;
            const tablesExtracted = (markdown.match(/\|[\s\S]*?\|/g) || []).length;
            
            // Calculate processing time
            const processingTime = Date.now() - startTime;
            
            if (jsonMode) {
              // For fallback methods, we don't have actual page separation
              // So we'll split by "## Page" markers
              const pages = markdown.split(/\n\n## Page \d+\n\n/).filter(page => page.trim().length > 0);
              
              const pagesWithTables = pages.map(pageContent => {
                const tablesExtracted = (pageContent.match(/\|[\s\S]*?\|/g) || []).length;
                return {
                  content: pageContent,
                  tablesExtracted
                };
              });
              
              return NextResponse.json({ 
                pages: pagesWithTables,
                pageCount: pages.length || 1,
                processing_time_ms: processingTime,
                file_type: "pdf",
                model: modelType,
                filename: filename,
                timestamp: new Date().toISOString(),
                api_version: "1.0"
              });
            } else {
              return NextResponse.json({ 
                markdown,
                pageCount,
                tablesExtracted,
                processing_time_ms: processingTime,
                file_type: "pdf",
                model: modelType,
                filename: filename,
                character_count: markdown.length,
                word_count: markdown.split(/\s+/).length,
                timestamp: new Date().toISOString(),
                api_version: "1.0"
              });
            }
          } catch (altError) {
            console.error("Error with alternative PDF processing method:", altError);
            console.log('Falling back to original PDF processing method...');
            
            // Fall back to the original method if the alternative fails
            const markdown = await processPdfForOcr(fileUrl, processImage);
            console.log(`PDF processed successfully with original method. Generated ${markdown.length} characters of markdown.`);
            
            // Estimate the number of pages and tables
            const pageCount = markdown.split('## Page').length - 1 || 1;
            const tablesExtracted = (markdown.match(/\|[\s\S]*?\|/g) || []).length;
            
            // Calculate processing time
            const processingTime = Date.now() - startTime;
            
            if (jsonMode) {
              // For fallback methods, we don't have actual page separation
              // So we'll split by "## Page" markers
              const pages = markdown.split(/\n\n## Page \d+\n\n/).filter(page => page.trim().length > 0);
              
              const pagesWithTables = pages.map(pageContent => {
                const tablesExtracted = (pageContent.match(/\|[\s\S]*?\|/g) || []).length;
                return {
                  content: pageContent,
                  tablesExtracted
                };
              });
              
              return NextResponse.json({ 
                pages: pagesWithTables,
                pageCount: pages.length || 1,
                processing_time_ms: processingTime,
                file_type: "pdf",
                model: modelType,
                filename: filename,
                timestamp: new Date().toISOString(),
                api_version: "1.0"
              });
            } else {
              return NextResponse.json({ 
                markdown,
                pageCount,
                tablesExtracted,
                processing_time_ms: processingTime,
                file_type: "pdf",
                model: modelType,
                filename: filename,
                character_count: markdown.length,
                word_count: markdown.split(/\s+/).length,
                timestamp: new Date().toISOString(),
                api_version: "1.0"
              });
            }
          }
        }
      } else {
        // Process image file directly
        console.log('Processing image file');
        const markdown = await generateMarkdownFromImage(fileUrl, modelToUse);
        console.log(`Image processed successfully. Generated ${markdown?.length} characters of markdown.`);
        
        // Estimate the number of tables in the image
        const tablesExtracted = (markdown.match(/\|[\s\S]*?\|/g) || []).length;
        
        // Calculate processing time
        const processingTime = Date.now() - startTime;
        
        if (jsonMode) {
          // For single images in JSON mode, we still return an array with one item
          return NextResponse.json({ 
            pages: [
              {
                content: markdown,
                tablesExtracted
              }
            ],
            pageCount: 1,
            processing_time_ms: processingTime,
            file_type: "image",
            model: modelType,
            filename: filename,
            timestamp: new Date().toISOString(),
            api_version: "1.0"
          });
        } else {
          return NextResponse.json({ 
            markdown,
            tablesExtracted,
            processing_time_ms: processingTime,
            file_type: "image",
            model: modelType,
            filename: filename,
            character_count: markdown.length,
            word_count: markdown.split(/\s+/).length,
            timestamp: new Date().toISOString(),
            api_version: "1.0"
          });
        }
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      return NextResponse.json({ 
        error: "File processing failed", 
        details: error.message,
        filename: filename,
        timestamp: new Date().toISOString(),
        api_version: "1.0"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error processing request:", error)
    // In the outer catch block, we might not have defined filename yet
    let errorFilename = "unknown";
    try {
      // Try to extract filename from request if possible
      const body = await req.json();
      if (body && body.fileUrl) {
        try {
          const url = new URL(body.fileUrl);
          const pathSegments = url.pathname.split('/');
          errorFilename = pathSegments[pathSegments.length - 1].split('?')[0];
        } catch {
          const segments = body.fileUrl.split('/');
          errorFilename = segments[segments.length - 1].split('?')[0];
        }
      }
    } catch {
      // If we can't extract the filename, just use the default
    }
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message,
      filename: errorFilename,
      timestamp: new Date().toISOString(),
      api_version: "1.0"
    }, { status: 500 })
  }
}

// Helper function to generate markdown from an image using OpenAI
async function generateMarkdownFromImage(imageUrl: string, selectedModel?: string): Promise<string> {
  console.log('Processing image file');
  
  // Map model type to actual model name if needed
  let modelToUse = selectedModel || FAST_MODEL;
  
  // If a model type identifier was passed instead of a model name, map it to the actual model
  if (modelToUse === "fast") {
    modelToUse = FAST_MODEL;
  } else if (modelToUse === "slow") {
    modelToUse = SLOW_MODEL;
  } else if (modelToUse === "vision") {
    modelToUse = VISION_MODEL;
  }
  
  console.log(`Using OpenAI model: ${modelToUse}`);
  
  // System prompt for image processing
  const systemPrompt = `Convert the provided image into Markdown format. Ensure that all content is included, such as headers, footers, subtexts, images, tables, and any other elements.

  Requirements:
  - Output Only Markdown: Return solely the Markdown content without any additional explanations or comments.
  - No Delimiters: Do not use code fences or delimiters like \`\`\`markdown.
  - Complete Content: Do not omit any part of the document, including headers, footers, and subtext.
  - Structure: Use appropriate Markdown headers (# ## ###) to organize the content hierarchically.
  - Text Content: Transcribe all visible text accurately, maintaining the original formatting as closely as possible.
  - Images: For each image, provide a descriptive alt text and use the Markdown image syntax ![alt text](image_url).
  - Lists: Use - for unordered lists and 1. 2. 3. for ordered lists, preserving the original structure.
  - Tables: Represent tables using Markdown table syntax, including headers if present.
  - Links: Convert any hyperlinks using the Markdown link syntax [link text](url).
  - Formatting: Apply **bold**, *italic*, or ~~strikethrough~~ formatting where appropriate.
  - Code Blocks: Use \`\`\` for multi-line code blocks or \` for inline code, if any code is present.
  - Quotes: Use > for blockquotes or notable text sections.
  - Horizontal Rules: Use --- to represent significant section breaks.
  - Special Elements: Describe any charts, graphs, or complex visual elements in detail using blockquotes.
  
  Output only the markdown, no other text or comments. Do not include \`\`\`markdown\`\`\` or any other code fences in your response.

  For financial documents like bills, invoices, receipts, and tax forms:
  - Extract key-value pairs in a structured format using tables or definition lists
  - For bills/invoices: Identify and clearly mark the vendor name, date, invoice number, line items with quantities and prices, subtotals, taxes, and total amount due
  - For tax documents: Extract form numbers, tax year, taxpayer information, income sections, deduction sections, and calculated tax amounts
  - For receipts: Capture merchant name, date/time, payment method, item descriptions with prices, and totals
  - Use hierarchical headers to separate document sections (e.g., ### Personal Information, ### Income Summary)
  - Present numerical data in aligned tables with proper headers
  - Preserve the original formatting of account numbers, dates, and reference numbers
  - For line items, create a properly formatted Markdown table with columns for item description, quantity, unit price, and total
  - Extract and highlight payment terms, due dates, and account status information
  - For multi-page documents, clearly indicate page breaks and maintain document flow
  - If the document contains charts or graphs, describe the data they represent in detail

  For legal documents like contracts, pleadings, and agreements:
  - Identify and extract key sections and clauses
  - Create a table of contents for the document
  - Use hierarchical headers to organize the document
  - Highlight important terms and definitions
  - Preserve the original formatting of legal terms and dates 
  - If the document contains charts or graphs, describe the data they represent in detail
  
  For technical documents like manuals, specifications, and reports:  
  - Identify and extract key sections and technical details
  - Create a table of contents for the document
  - Use hierarchical headers to organize the document
  - Highlight important terms and definitions
  - Preserve the original formatting of technical terms and data
  - If the document contains charts or graphs, describe the data they represent in detail
  
  For research papers, academic articles, and scientific documents:
  - Identify and extract key sections and technical details
  - Create a table of contents for the document
  - Use hierarchical headers to organize the document
  - Highlight important terms and definitions
  - Preserve the original formatting of technical terms and data
  - If the document contains charts or graphs, describe the data they represent in detail

  For other documents:
  - Identify and extract key sections and details
  - Create a table of contents for the document
  - Use hierarchical headers to organize the document
  - Highlight important terms and definitions
  - Preserve the original formatting of technical terms and data  

  Structure the output with consistent formatting:
  1. Document title/type as a level 1 header
  2. Key document identifiers (date, reference numbers) as a summary block
  3. Sender/recipient information in a formatted block
  4. Main content organized in appropriate sections with level 2-3 headers
  5. Line items in properly formatted tables
  6. Summary/totals section with clear formatting
  7. Any notes, terms, or additional information in a final section
  `

  // Generate markdown using OpenAI
  const response = await openai.chat.completions.create({
    model: modelToUse,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Please convert this image to Markdown following the given instructions:" },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
  })

  return response.choices[0].message.content || '';
}
