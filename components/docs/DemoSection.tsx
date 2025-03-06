"use client"

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useApiSectionRefs } from './hooks/useApiSectionRefs';
import { useApiKey } from './context/ApiKeyContext';
import { FileUploader } from './ui/FileUploader';
import { CodeDisplay } from './ui/CodeDisplay';
import { ModelSelector } from './ui/ModelSelector';
import { OutputModeSelector } from './ui/OutputModeSelector';
import { ExecuteButton } from './ui/ExecuteButton';
import { ApiKeyWarning } from './ui/ApiKeyWarning';
import { upload } from "@vercel/blob/client";

export function DemoSection() {
  const { toast } = useToast();
  const { demoRef } = useApiSectionRefs();
  const { apiKey } = useApiKey();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [requestPayload, setRequestPayload] = useState('');
  const [responseData, setResponseData] = useState('');
  const [activeDemo, setActiveDemo] = useState<"image" | "pdf">("image");
  const [selectedModel, setSelectedModel] = useState<"fast" | "slow">("fast");
  const [outputMode, setOutputMode] = useState<"markdown" | "json">("markdown");

  // Update model in code examples when component mounts or selectedModel changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateModelInExamples(selectedModel);
      updateOutputModeInExamples(outputMode);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedModel, outputMode]);

  // Function to update model in all code examples
  const updateModelInExamples = (newModel: string) => {
    setTimeout(() => {
      // Update model in pre tags (code blocks)
      const codeBlocks = document.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        // Check if this code block contains model references
        const blockText = block.textContent;
        if (blockText && (blockText.includes('model:') || blockText.includes('model: '))) {
          // Get all text nodes within the pre element
          const walker = document.createTreeWalker(
            block,
            NodeFilter.SHOW_TEXT
          );
          
          let node;
          while ((node = walker.nextNode())) {
            // Replace the model value in each text node
            const nodeValue = node.nodeValue;
            if (nodeValue && (nodeValue.includes('model:') || nodeValue.includes('model: '))) {
              // Replace model value while preserving the structure
              node.nodeValue = nodeValue.replace(/(model:\s*["'])([^"']+)(["'])/g, `$1${newModel}$3`);
            }
          }
        }
      });
    }, 0);
  };

  // Function to update output mode in all code examples
  const updateOutputModeInExamples = (newMode: string) => {
    setTimeout(() => {
      // Update jsonMode in pre tags (code blocks)
      const codeBlocks = document.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        // Check if this code block contains jsonMode references
        const blockText = block.textContent;
        if (blockText && blockText.includes('convertFormData.append(\'jsonMode\'')) {
          // Get all text nodes within the pre element
          const walker = document.createTreeWalker(
            block,
            NodeFilter.SHOW_TEXT
          );
          
          let node;
          while ((node = walker.nextNode())) {
            // Replace the jsonMode value in each text node
            const nodeValue = node.nodeValue;
            if (nodeValue && nodeValue.includes('convertFormData.append(\'jsonMode\'')) {
              // Replace jsonMode value
              node.nodeValue = nodeValue.replace(
                /(convertFormData\.append\('jsonMode',\s*')([^']+)(')/g, 
                `$1${newMode === 'json' ? 'true' : 'false'}$3`
              );
            }
          }
        }
      });
    }, 0);
    
    // Regenerate request payload if a file is already uploaded
    if (activeDemo === "image" && imageFile) {
      regenerateImageRequestPayload(imageFile);
    } else if (activeDemo === "pdf" && pdfFile) {
      regeneratePdfRequestPayload(pdfFile);
    }
  };
  
  // Helper function to regenerate image request payload
  const regenerateImageRequestPayload = (file: File) => {
    const payload = `// Step 1: Upload the file
const formData = new FormData();
formData.append('file', /* ${file.name} */);

const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const uploadData = await uploadResponse.json();
const fileUrl = uploadData.url;

// Step 2: Process with OCR
const convertFormData = new FormData();
convertFormData.append('url', fileUrl);
convertFormData.append('isPdf', 'false');
convertFormData.append('model', '${selectedModel}');
convertFormData.append('jsonMode', '${outputMode === 'json' ? 'true' : 'false'}');

const response = await fetch('/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}'
  },
  body: convertFormData
});

const result = await response.json();
console.log(result.markdown);`;
    
    setRequestPayload(payload);
  };
  
  // Helper function to regenerate PDF request payload
  const regeneratePdfRequestPayload = (file: File) => {
    const payload = `// Step 1: Upload the file
const formData = new FormData();
formData.append('file', /* ${file.name} */);

const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const uploadData = await uploadResponse.json();
const fileUrl = uploadData.url;

// Step 2: Process with OCR
const convertFormData = new FormData();
convertFormData.append('url', fileUrl);
convertFormData.append('isPdf', 'true');
convertFormData.append('model', '${selectedModel}');
convertFormData.append('jsonMode', '${outputMode === 'json' ? 'true' : 'false'}');

const response = await fetch('/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}'
  },
  body: convertFormData
});

const result = await response.json();
console.log(result.markdown);`;
    
    setRequestPayload(payload);
  };

  const createImagePreview = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageFileChange = (file: File) => {
    regenerateImageRequestPayload(file);
  };

  const handlePdfFileChange = (file: File) => {
    regeneratePdfRequestPayload(file);
  };

  const executeApiRequest = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please generate an API key first.",
        variant: "destructive",
      });
      return;
    }

    const file = activeDemo === "image" ? imageFile : pdfFile;
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: `Please upload a ${activeDemo === "image" ? "image" : "PDF"} file first.`,
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    setResponseData('');

    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('output_format', 'markdown');
      
      if (activeDemo === "pdf") {
        formData.append('language', 'en');
      }
      
      // First, upload the file to get a URL
      let fileUrl: string;
      
      try {
        // Check file size to determine upload method
        const maxServerUploadSize = 4.5 * 1024 * 1024; // 4.5MB
        
        if (file.size <= maxServerUploadSize) {
          // Use server-side upload for smaller files
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Failed to upload file");
          }
          
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
        } else {
          // For larger files, use client-side upload with Vercel Blob
          try {
            // Use the client upload API from Vercel Blob
            const blob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/get-upload-url',
              clientPayload: JSON.stringify({ apiKey }),
              onUploadProgress: (progress) => {
                // You could update a progress bar here
                console.log(`Upload progress: ${progress}%`);
              },
            });
            
            // Use the returned URL for processing
            fileUrl = blob.url;
            
            toast({
              title: "Large File Uploaded",
              description: "Your file was uploaded directly to our storage service.",
            });
          } catch (clientUploadError) {
            console.error("Client upload error:", clientUploadError);
            throw new Error(`Client upload failed: ${clientUploadError instanceof Error ? clientUploadError.message : "Unknown error"}`);
          }
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        let errorCode = "upload_error";
        let errorMessage = "An unknown error occurred during upload";
        
        if (uploadError instanceof Error) {
          const errorText = uploadError.message;
          
          if (errorText.includes("Cannot find module") || errorText.includes("is not defined")) {
            errorCode = "client_upload_not_supported";
            errorMessage = "File size exceeds 4.5MB limit for server uploads. Client upload is not available in this environment.";
          } else if (errorText.includes("get-upload-url") || errorText.includes("Client upload failed")) {
            errorCode = "api_error";
            errorMessage = "File size exceeds 4.5MB limit for server uploads. Please try with a smaller file or contact support.";
          } else {
            errorMessage = `Upload failed: ${errorText}`;
          }
        }
        
        setResponseData(JSON.stringify({
          success: false,
          error: {
            code: errorCode,
            message: errorMessage
          }
        }, null, 2));
        
        toast({
          title: "File Too Large",
          description: "This demo currently supports files up to 4.5MB. For larger files, please use our API directly.",
          variant: "destructive",
        });
        
        setIsExecuting(false);
        return;
      }
      
      // Now make the actual OCR API call
      const startTime = Date.now();
      
      // Create a new FormData for the convert API
      const convertFormData = new FormData();
      convertFormData.append('url', fileUrl);
      convertFormData.append('isPdf', activeDemo === "pdf" ? 'true' : 'false');
      convertFormData.append('model', selectedModel);
      convertFormData.append('jsonMode', outputMode === "json" ? 'true' : 'false');
      
      const convertResponse = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}` // Use the user's API key
        },
        body: convertFormData,
      });
      
      if (!convertResponse.ok) {
        const errorData = await convertResponse.json();
        throw new Error(errorData.error || "OCR processing failed");
      }
      
      const convertData = await convertResponse.json();
      
      // Log the API response for debugging
      console.log("API Response:", convertData);
      
      // Check if we're getting a complete response with all metadata
      if (convertData && typeof convertData === 'object') {
        // If we only have markdown and no other metadata, add it
        if (convertData.markdown && Object.keys(convertData).length === 1) {
          // Count tables in the markdown
          const tableMatches = convertData.markdown.match(/\|[\s\S]*?\|/g);
          const tablesCount = tableMatches ? tableMatches.length : 0;
          
          // Create enhanced data with all metadata
          const enhancedData = {
            ...convertData,
            tablesExtracted: tablesCount,
            processing_time_ms: Date.now() - startTime,
            file_type: activeDemo === "pdf" ? "pdf" : "image",
            model: selectedModel,
            processing_method: "direct",
            character_count: convertData.markdown.length,
            word_count: convertData.markdown.split(/\s+/).length,
            timestamp: new Date().toISOString(),
            api_version: "1.0"
          };
          
          // Store the enhanced API response
          setResponseData(JSON.stringify(enhancedData, null, 2));
        } else {
          // Store the complete API response
          setResponseData(JSON.stringify(convertData, null, 2));
        }
      } else {
        // If we got a non-object response, wrap it in an object
        setResponseData(JSON.stringify({
          markdown: convertData,
          processing_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          api_version: "1.0"
        }, null, 2));
      }
      
      toast({
        title: "API Request Successful",
        description: "The API request was processed successfully.",
      });
    } catch (error) {
      console.error("API execution error:", error);
      
      setResponseData(JSON.stringify({
        success: false,
        error: {
          code: "api_error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        }
      }, null, 2));
      
      toast({
        title: "API Request Failed",
        description: "The API request failed. See the response for details.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section className="py-12 md:py-16" id="demo" ref={demoRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Try the API
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Test our API with your own files using your generated API key
          </p>
        </div>

        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {apiKey && (
            <div className="mb-6 rounded-md bg-green-50 p-4 flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">API Key Ready</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Great! You can now test the API with your generated key and use the code examples below.</p>
                </div>
              </div>
            </div>
          )}
          <Tabs 
            value={activeDemo} 
            onValueChange={(value) => setActiveDemo(value as "image" | "pdf")} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
              <TabsTrigger 
                value="image" 
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
              >
                Image Processing
              </TabsTrigger>
              <TabsTrigger 
                value="pdf" 
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
              >
                PDF Processing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Upload Image</h3>
                  <FileUploader
                    fileType="image"
                    file={imageFile}
                    setFile={setImageFile}
                    createPreview={createImagePreview}
                    preview={imagePreview}
                    onFileChange={handleImageFileChange}
                  />
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">API Request</h3>
                  <CodeDisplay 
                    code={requestPayload} 
                    placeholder="// Upload an image to see the request payload" 
                  />
                  
                  <ModelSelector 
                    selectedModel={selectedModel}
                    onModelChange={(value) => {
                      setSelectedModel(value);
                      updateModelInExamples(value);
                    }}
                  />
                  
                  <OutputModeSelector 
                    outputMode={outputMode}
                    onOutputModeChange={(value) => {
                      setOutputMode(value);
                      updateOutputModeInExamples(value);
                    }}
                  />
                  
                  <div className="mt-4">
                    <ExecuteButton
                      onClick={executeApiRequest}
                      isExecuting={isExecuting}
                      disabled={!imageFile || !apiKey}
                    />
                  </div>
                  
                  <h3 className="mb-2 mt-6 text-lg font-semibold">API Response</h3>
                  <CodeDisplay 
                    code={responseData} 
                    placeholder="// Response will appear here after execution"
                    className="[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pdf" className="mt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Upload PDF</h3>
                  <FileUploader
                    fileType="pdf"
                    file={pdfFile}
                    setFile={setPdfFile}
                    onFileChange={handlePdfFileChange}
                  />
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">API Request</h3>
                  <CodeDisplay 
                    code={requestPayload} 
                    placeholder="// Upload a PDF to see the request payload" 
                  />
                  
                  <ModelSelector 
                    selectedModel={selectedModel}
                    onModelChange={(value) => {
                      setSelectedModel(value);
                      updateModelInExamples(value);
                    }}
                  />
                  
                  <OutputModeSelector 
                    outputMode={outputMode}
                    onOutputModeChange={(value) => {
                      setOutputMode(value);
                      updateOutputModeInExamples(value);
                    }}
                  />
                  
                  <div className="mt-4">
                    <ExecuteButton
                      onClick={executeApiRequest}
                      isExecuting={isExecuting}
                      disabled={!pdfFile || !apiKey}
                    />
                  </div>
                  
                  <h3 className="mb-2 mt-6 text-lg font-semibold">API Response</h3>
                  <CodeDisplay 
                    code={responseData} 
                    placeholder="// Response will appear here after execution"
                    className="[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {!apiKey && <ApiKeyWarning />}
        </div>
      </div>
    </section>
  );
} 