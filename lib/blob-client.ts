import { BlobServiceClient } from "@vercel/blob"

let blobClient: BlobServiceClient | null = null

export function getBlobClient(): BlobServiceClient {
  if (!blobClient) {
    if (!process.env.OCR_READ_WRITE_TOKEN) {
      console.error("OCR_READ_WRITE_TOKEN is not set")
      throw new Error("OCR_READ_WRITE_TOKEN is not set")
    }
    try {
      blobClient = new BlobServiceClient({
        token: process.env.OCR_READ_WRITE_TOKEN,
      })
      console.log("Blob client created successfully")
    } catch (error) {
      console.error("Error creating Blob client:", error)
      throw new Error("Failed to create Blob client")
    }
  }
  return blobClient
}

