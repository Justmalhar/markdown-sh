import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as HandleUploadBody
  
  try {
    console.log("Client upload request received")
    console.log("OCR_READ_WRITE_TOKEN is", process.env.OCR_READ_WRITE_TOKEN ? "set" : "not set")
    
    if (!process.env.OCR_READ_WRITE_TOKEN) {
      throw new Error("OCR_READ_WRITE_TOKEN is not set")
    }
    
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.OCR_READ_WRITE_TOKEN, // Explicitly pass the token
      onBeforeGenerateToken: async (pathname) => {
        // Validate file types
        console.log("Generating upload token for:", pathname)
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
          tokenPayload: JSON.stringify({}),
          maxSize: 500 * 1024 * 1024, // 500MB
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Log the completed upload
        console.log("Client upload completed:", blob)
        
        // Here you could store the blob URL in a database if needed
      },
    })
    
    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Error handling client upload:", error)
    return NextResponse.json({ 
      error: "Failed to handle client upload",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 