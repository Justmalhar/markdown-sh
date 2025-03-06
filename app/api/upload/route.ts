import { put, BlobAccessError } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("Upload request received")
  console.log("OCR_READ_WRITE_TOKEN is", process.env.OCR_READ_WRITE_TOKEN ? "set" : "not set")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.log("No file uploaded")
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    console.log("File retrieved from FormData:", `Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type")
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." }, { status: 400 })
    }

    if (!process.env.OCR_READ_WRITE_TOKEN) {
      throw new Error("OCR_READ_WRITE_TOKEN is not set")
    }

    // Check file size (limit to 4.5MB for server uploads)
    const maxSize = 4.5 * 1024 * 1024 // 4.5MB
    if (file.size > maxSize) {
      console.log("File size exceeds limit for server upload")
      return NextResponse.json({ 
        error: "File size exceeds 4.5MB limit for server uploads. Use client upload instead.",
        needsClientUpload: true 
      }, { status: 400 })
    }

    console.log("Starting file upload to Vercel Blob")
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const blob = await put(file.name, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.OCR_READ_WRITE_TOKEN,
    })

    console.log("File uploaded successfully:", blob)

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error in upload process:", error)

    if (error instanceof BlobAccessError) {
      console.error("Blob Access Error:", error.message)
      return NextResponse.json({ error: "Blob Access Error", details: error.message }, { status: 403 })
    }

    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
      return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
  }
}

