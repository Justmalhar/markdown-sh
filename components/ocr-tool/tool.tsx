"use client"

import type React from "react"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { FileUp, Copy, Check, Loader2, FileText, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import MarkdownResult from "@/components/ocr-tool/markdown-result"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upload } from "@vercel/blob/client"

// Get available models from environment variables
const getAvailableModels = () => {
  const fastModel = process.env.NEXT_PUBLIC_FAST_MODEL || "gpt-4o-mini";
  const accurateModel = process.env.NEXT_PUBLIC_ACCURATE_MODEL || "gpt-4o";
  
  return [
    { id: fastModel, name: "Fast (less accurate)" },
    { id: accurateModel, name: "Accurate (slower)" }
  ];
};

// Define the ref type
export type OcrToolHandle = {
  triggerFileInput: () => void;
};

const OcrTool = forwardRef<OcrToolHandle, Record<string, never>>(
  (_, ref) => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processedFiles, setProcessedFiles] = useState<Map<string, string>>(new Map())
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [isPdfProcessing, setIsPdfProcessing] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>(getAvailableModels()[0].id)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isClientUpload, setIsClientUpload] = useState<boolean>(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const markdownResultRef = useRef<HTMLDivElement>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Expose the triggerFileInput method through the ref
  useImperativeHandle(ref, () => ({
    triggerFileInput: () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }));

  useEffect(() => {
    if (file) {
      uploadFile()
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      createPreview(selectedFile)
      setUploadedFileUrl(null) // Reset uploaded file URL when a new file is selected
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      createPreview(droppedFile)
      setUploadedFileUrl(null) // Reset uploaded file URL when a new file is dropped
    }
  }

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or PDF file.",
        variant: "destructive",
      })
      return false
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 500MB.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const createPreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent div's onClick
    setFile(null)
    setPreview(null)
    setUploadedFileUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    console.log("Starting file upload process")

    try {
      // Check if file is larger than the direct upload limit
      const directUploadLimit = 4 * 1024 * 1024 // 4MB
      
      if (file.size > directUploadLimit) {
        // Use client-side upload for large files
        await handleLargeFileUpload(file)
      } else {
        // Use direct upload for small files
        await handleSmallFileUpload(file)
      }

      toast({
        title: "File uploaded",
        description: "Your file has been successfully uploaded.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
      setFile(null)
      setPreview(null)
    } finally {
      setIsUploading(false)
      setIsClientUpload(false)
    }
  }

  // Function to handle small file uploads (server-side)
  const handleSmallFileUpload = async (file: File): Promise<void> => {
    setIsClientUpload(false)
    const formData = new FormData()
    formData.append("file", file)
    console.log("FormData created with file:", file.name)

    console.log("Sending POST request to /api/upload")
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    console.log("Received response from server")

    console.log("Response status:", response.status)
    
    const data = await response.json()
    console.log("Parsed response data:", data)

    if (!response.ok) {
      console.error("Server returned an error:", data.error)
      
      // If the file is too large for server upload, try client upload
      if (data.needsClientUpload) {
        console.log("File too large for server upload, switching to client upload")
        return await handleLargeFileUpload(file)
      }
      
      throw new Error(data.error || "Failed to upload file")
    }

    setUploadedFileUrl(data.url)
    console.log("File uploaded successfully, URL:", data.url)
  }

  // Function to handle large file uploads (client-side)
  const handleLargeFileUpload = async (file: File): Promise<void> => {
    setIsClientUpload(true)
    console.log("Using client-side upload for large file:", file.name)
    
    try {
      // Use Vercel Blob's client-side upload
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/client-upload',
        onUploadProgress: (progressEvent) => {
          setUploadProgress(progressEvent.percentage)
          console.log(`Upload progress: ${progressEvent.percentage}%`)
        },
      })
      
      setUploadedFileUrl(blob.url)
      console.log("File uploaded successfully via client upload, URL:", blob.url)
    } catch (error) {
      console.error("Client upload error:", error)
      
      // If client upload fails, try server upload as fallback
      if (file.size <= 4 * 1024 * 1024) { // 4MB
        console.log("Client upload failed, falling back to server upload")
        return await handleSmallFileUpload(file)
      }
      
      throw new Error(
        error instanceof Error 
          ? `Failed to upload file: ${error.message}` 
          : "Failed to upload file using client upload"
      )
    }
  }

  const convertToMarkdown = async () => {
    if (!uploadedFileUrl || !file) return

    // Check if we already processed this file
    const fileKey = `${file.name}-${file.size}-${file.lastModified}-${selectedModel}`
    if (processedFiles.has(fileKey)) {
      // Use cached result
      setMarkdown(processedFiles.get(fileKey) || "")
      setActiveTab("result")
      return
    }

    setIsConverting(true)
    setProcessingProgress(0)
    // Switch to result tab
    setActiveTab("result")
    
    // Check if file is PDF
    const isPdf = file.type === "application/pdf"
    setIsPdfProcessing(isPdf)
    
    if (isPdf) {
      setProcessingStatus("Preparing PDF for processing...")
    }
    
    // Simulate progress for better UX
    progressTimerRef.current = setInterval(() => {
      setProcessingProgress(prev => {
        // Increase progress gradually, but never reach 100% until complete
        const newProgress = prev + (Math.random() * (isPdf ? 2 : 5))
        return Math.min(newProgress, 95)
      })
    }, 300)
    
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OCR_API_KEY}`
        },
        body: JSON.stringify({ 
          fileUrl: uploadedFileUrl,
          isPdf: isPdf, // Pass file type information to the API
          model: selectedModel // Pass the selected model to the API
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Conversion error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to convert file")
      }

      const data = await response.json()
      
      // Set progress to 100% when complete
      setProcessingProgress(100)
      setProcessingStatus("")
      
      // Check if fallback method was used
      if (data.usedFallback && isPdf) {
        setProcessingStatus("Used direct processing method (multi-page support may be limited)")
        toast({
          title: "PDF processed with fallback method",
          description: "The advanced PDF processing failed, but we were able to process your PDF directly. Multi-page support may be limited.",
        })
      }
      
      // Cache the result
      setProcessedFiles(prev => {
        const newMap = new Map(prev)
        newMap.set(fileKey, data.markdown)
        return newMap
      })
      
      // Set the markdown content
      setMarkdown(data.markdown)
      
      // Start streaming after we have the content
      setTimeout(() => {
        setIsStreaming(true)
        // Focus on the markdown result container
        if (markdownResultRef.current) {
          markdownResultRef.current.focus()
        }
      }, 100)

      toast({
        title: "Conversion complete!",
        description: "Your file has been successfully converted to markdown.",
      })
    } catch (error) {
      console.error("Error converting file:", error)
      
      // Show a more specific error message for PDF processing
      if (isPdf) {
        toast({
          title: "PDF processing failed",
          description: error instanceof Error 
            ? `Error processing PDF: ${error.message}` 
            : "There was an error processing your PDF file. Please try again with a different PDF.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Conversion failed",
          description: error instanceof Error 
            ? error.message 
            : "There was an error converting your file. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
      setIsConverting(false)
      setIsPdfProcessing(false)
    }
  }

  const handleStreamComplete = () => {
    setIsStreaming(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "Markdown has been copied to your clipboard.",
    })
  }

  return (
    <div className="w-full">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Result
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <div className="mb-4">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Processing Mode
            </label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a processing mode" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableModels().map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 transition-colors hover:border-gray-400"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-16 w-16 animate-spin text-gray-400" />
                <p className="text-sm text-black">
                  {isClientUpload 
                    ? `Uploading large file... ${uploadProgress}%` 
                    : "Uploading..."}
                </p>
                {isClientUpload && (
                  <div className="w-64 mt-2 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-lg border border-gray-200">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                  <button 
                    onClick={clearFile}
                    className="absolute -right-1 -top-1 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                    aria-label="Clear file"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <p className="text-sm text-black">{file?.name}</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {file.type === "application/pdf" ? (
                    <FileText className="mb-4 h-16 w-16 text-black" />
                  ) : (
                    <ImageIcon className="mb-4 h-16 w-16 text-black" />
                  )}
                  <button 
                    onClick={clearFile}
                    className="absolute -right-1 -top-1 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                    aria-label="Clear file"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <p className="text-sm text-black">{file.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <FileUp className="mb-4 h-10 w-10 text-black" />
                <p className="mb-2 text-sm font-medium text-black">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-600">Supports JPG, PNG, and PDF files (max 500MB)</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={convertToMarkdown}
              disabled={!uploadedFileUrl || isConverting}
              className="button-32 group w-full max-w-xs"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text">Converting...</span>
                </>
              ) : (
                <>
                  <span className="text">Convert to Markdown</span>
                  <FileText className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="result" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium text-black">OCR Result</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!markdown}
                className="flex items-center gap-1 bg-white text-black border-gray-300 hover:bg-gray-100"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            {isConverting && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {isPdfProcessing ? "Processing PDF (this may take a while)..." : "Converting..."}
                  </span>
                  <span className="text-sm text-gray-600">{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                {processingStatus && (
                  <p className="text-xs text-gray-500 mt-1">{processingStatus}</p>
                )}
              </div>
            )}
            
            {isConverting ? (
              <div className="flex flex-col items-center justify-center py-16 min-h-[200px] rounded-lg border border-gray-200 bg-white p-4">
                <Loader2 className="h-12 w-12 animate-spin text-black mb-4" />
                <p className="text-black font-medium mb-2">
                  {isPdfProcessing ? "Processing PDF document..." : "Converting your document..."}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {isPdfProcessing ? "This may take longer for multi-page documents" : "This should only take a moment"}
                </p>
              </div>
            ) : (
              <div 
                ref={markdownResultRef} 
                className="relative min-h-[200px] rounded-lg border border-gray-200 bg-white p-4"
                tabIndex={0}
              >
                <MarkdownResult 
                  markdown={markdown} 
                  isStreaming={isStreaming}
                  onStreamComplete={handleStreamComplete}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
})

// Add display name to the component
OcrTool.displayName = "OcrTool"

export default OcrTool
