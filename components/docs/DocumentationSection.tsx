"use client"

import React, { useState } from 'react';
import { useApiSectionRefs } from './hooks/useApiSectionRefs';
import { useApiKey } from './context/ApiKeyContext';
import { CodeEditor } from '@/components/common/code-editor';
import { useToast } from "@/components/ui/use-toast";

export function DocumentationSection() {
  const { toast } = useToast();
  const { documentationRef } = useApiSectionRefs();
  const { apiKey } = useApiKey();
  const [activeTab, setActiveTab] = useState('image');

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    });
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50 rounded-lg" id="documentation" ref={documentationRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            API Documentation
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to know to integrate with our API
          </p>
        </div>

        {/* Authentication */}
        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold">Authentication</h3>
          <p className="mb-4 text-gray-600">
            All API requests require authentication using your API key. Include your API key in the request header.
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded bg-gray-100 p-4 font-mono text-sm relative group">
{`// Include this header with all API requests
Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}`}
              <button 
                onClick={() => copyCodeToClipboard(`// Include this header with all API requests
Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}`)}
                className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Copy code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </pre>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold">API Endpoints</h3>
          
          {/* Convert Endpoint */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h4 className="mb-2 text-lg font-semibold">POST /api/convert</h4>
            <p className="mb-4 text-gray-600">
              Convert an image or PDF to markdown text using OCR.
            </p>
            
            <div className="mb-4">
              <h5 className="mb-2 font-medium">Request Parameters</h5>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">file</td>
                    <td className="px-4 py-2 text-sm text-gray-500">File</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Yes*</td>
                    <td className="px-4 py-2 text-sm text-gray-500">The image or PDF file to process (*Either file or url is required)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">url</td>
                    <td className="px-4 py-2 text-sm text-gray-500">String</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Yes*</td>
                    <td className="px-4 py-2 text-sm text-gray-500">URL of the image or PDF file to process (*Either file or url is required)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">isPdf</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Boolean</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Set to 'true' if the file is a PDF. Default: auto-detect based on file extension</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">model</td>
                    <td className="px-4 py-2 text-sm text-gray-500">String</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Model to use: 'fast', 'slow', 'vision', or a specific model name. Default: fast</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">jsonMode</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Boolean</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Set to 'true' to receive response in JSON format. Default: false</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Example Tabs */}
            <div className="mb-4">
              <h5 className="mb-2 font-medium">Examples</h5>
              
              {/* Tab Navigation */}
              <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button 
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'image' 
                        ? 'border-black text-black' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('image')}
                  >
                    Image Processing
                  </button>
                  <button 
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'pdf' 
                        ? 'border-black text-black' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('pdf')}
                  >
                    PDF Processing
                  </button>
                </nav>
              </div>
              
              {/* Image Tab Content */}
              <div style={{ display: activeTab === 'image' ? 'block' : 'none' }}>
                <h6 className="text-sm font-medium mb-2">Process an Image</h6>
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Example Request</h5>
                  <div className="overflow-x-auto">
                    <pre className="relative group bg-gray-50 rounded p-4 overflow-x-auto text-sm">
                      <code className="language-bash">
{`curl -X POST \\
${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert \\
-H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
-H "Content-Type: multipart/form-data" \\
-F "file=@image.png" \\
-F "model=fast"`}
                      </code>
                      <button
                        onClick={() => copyCodeToClipboard(`curl -X POST \\
${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert \\
-H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
-H "Content-Type: multipart/form-data" \\
-F "file=@image.png" \\
-F "model=fast"`)}
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Example Response</h5>
                  <div className="overflow-x-auto">
                    <pre className="rounded bg-gray-100 p-4 font-mono text-sm relative group">
{`{
  "success": true,
  "data": {
    "text": "# Meeting Notes\\n\\n## Agenda Items\\n\\n1. Project timeline review\\n2. Budget approval\\n3. Resource allocation",
    "metadata": {
      "word_count": 18,
      "processing_time_ms": 650,
      "image_width": 1200,
      "image_height": 800
    }
  }
}`}
                      <button 
                        onClick={() => copyCodeToClipboard(`{
  "success": true,
  "data": {
    "text": "# Meeting Notes\\n\\n## Agenda Items\\n\\n1. Project timeline review\\n2. Budget approval\\n3. Resource allocation",
    "metadata": {
      "word_count": 18,
      "processing_time_ms": 650,
      "image_width": 1200,
      "image_height": 800
    }
  }
}`)}
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Code Example</h5>
                  <div className="overflow-x-auto">
                    <pre className="relative group bg-gray-50 rounded p-4 overflow-x-auto text-sm">
                      <code className="language-javascript">
{`const form = new FormData();
form.append('file', imageFile);
form.append('model', 'fast');

fetch('${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}'
  },
  body: form
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                      </code>
                      <button
                        onClick={() => copyCodeToClipboard(`const form = new FormData();
form.append('file', imageFile);
form.append('model', 'fast');

fetch('${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}'
  },
  body: form
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`)}
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
              </div>
              
              {/* PDF Tab Content */}
              <div style={{ display: activeTab === 'pdf' ? 'block' : 'none' }}>
                <h6 className="text-sm font-medium mb-2">Process a PDF</h6>
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Example Request</h5>
                  <div className="overflow-x-auto">
                    <pre className="relative group bg-gray-50 rounded p-4 overflow-x-auto text-sm">
                      <code className="language-bash">
{`curl -X POST \\
${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert \\
-H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
-H "Content-Type: multipart/form-data" \\
-F "file=@document.pdf" \\
-F "isPdf=true" \\
-F "model=fast"
`}
                      </code>
                      <button
                        onClick={() => copyCodeToClipboard(`curl -X POST \\
${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert \\
-H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
-H "Content-Type: multipart/form-data" \\
-F "file=@document.pdf" \\
-F "isPdf=true" \\
-F "model=fast"`)
                        }
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Example Response</h5>
                  <div className="overflow-x-auto">
                    <pre className="rounded bg-gray-100 p-4 font-mono text-sm relative group">
{`{
  "success": true,
  "data": {
    "text": "# Quarterly Report\\n\\n## Financial Summary\\n\\nRevenue increased by 15% compared to the previous quarter...\\n\\n## Market Analysis\\n\\nThe market share has grown to 23% with significant gains in the enterprise segment...",
    "metadata": {
      "pages": 3,
      "word_count": 245,
      "processing_time_ms": 1850,
      "tables_extracted": 2
    }
  }
}`}
                      <button 
                        onClick={() => copyCodeToClipboard(`{
  "success": true,
  "data": {
    "text": "# Quarterly Report\\n\\n## Financial Summary\\n\\nRevenue increased by 15% compared to the previous quarter...\\n\\n## Market Analysis\\n\\nThe market share has grown to 23% with significant gains in the enterprise segment...",
    "metadata": {
      "pages": 3,
      "word_count": 245,
      "processing_time_ms": 1850,
      "tables_extracted": 2
    }
  }
}`)}
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-2 font-medium">Code Example</h5>
                  <div className="overflow-x-auto">
                    <pre className="relative group bg-gray-50 rounded p-4 overflow-x-auto text-sm">
                      <code className="language-python">
{`import requests

url = "${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert"
headers = {
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}"
}

files = {
    "file": open("document.pdf", "rb")
}

data = {
    "isPdf": "true",
    "model": "fast",
    "jsonMode": "false"
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`}
                      </code>
                      <button
                        onClick={() => copyCodeToClipboard(`import requests

url = "${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert"
headers = {
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}"
}

files = {
    "file": open("document.pdf", "rb")
}

data = {
    "isPdf": "true",
    "model": "fast",
    "jsonMode": "false"
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`)
                        }
                        className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SDK & Libraries */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold">SDK & Libraries</h3>
          <p className="mb-4 text-gray-600">
            We provide official client libraries to make integration easier.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium">JavaScript / TypeScript</h4>
              
              <CodeEditor 
                height="200px"
                onCopy={copyCodeToClipboard}
                codeSnippets={{
                  "Installation": {
                    language: "bash",
                    code: `npm install yolo-ocr-client`
                  },
                  "Usage": {
                    language: "javascript",
                    code: `import { YoloOCR } from 'yolo-ocr-client';

const client = new YoloOCR('${apiKey || 'YOUR_API_KEY'}');
const result = await client.convert(file);`
                  }
                }}
              />
            </div>
            
            <div>
              <h4 className="font-medium">Python</h4>
              
              <CodeEditor 
                height="200px"
                onCopy={copyCodeToClipboard}
                codeSnippets={{
                  "Installation": {
                    language: "bash",
                    code: `pip install yolo-ocr`
                  },
                  "Usage": {
                    language: "python",
                    code: `from yolo_ocr import YoloOCR

client = YoloOCR('${apiKey || 'YOUR_API_KEY'}')
result = client.convert(file_path)`
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Handling */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold">Error Handling</h3>
          <p className="mb-4 text-gray-600">
            Learn how to handle common errors and exceptions in our API.
          </p>
          
          <div className="overflow-x-auto">
            <pre className="rounded bg-gray-100 p-4 font-mono text-sm relative group">
{`// Common error codes and their meanings

400 Bad Request: The request was invalid or cannot be processed.
401 Unauthorized: Authentication is required and has failed or has not been provided.
403 Forbidden: The request is understood, but it has been refused or access is not allowed.
404 Not Found: The requested resource was not found.
500 Internal Server Error: The server encountered an error and was unable to complete the request.
503 Service Unavailable: The server is currently unable to handle the request due to a temporary overloading or maintenance.

// Example error handling in JavaScript
try {
  const response = await fetch("${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}'
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.error || "API request failed");
  }
} catch (error) {
  console.error("API Error:", error);
  throw error;
}`}
              <button 
                onClick={() => copyCodeToClipboard(`// Common error codes and their meanings

400 Bad Request: The request was invalid or cannot be processed.
401 Unauthorized: Authentication is required and has failed or has not been provided.
403 Forbidden: The request is understood, but it has been refused or access is not allowed.
404 Not Found: The requested resource was not found.
500 Internal Server Error: The server encountered an error and was unable to complete the request.
503 Service Unavailable: The server is currently unable to handle the request due to a temporary overloading or maintenance.

// Example error handling in JavaScript
try {
  const response = await fetch("${process.env.NEXT_PUBLIC_APP_URL || 'https://your-api-domain.com'}/api/convert", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}'
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.error || "API request failed");
  }
} catch (error) {
  console.error("API Error:", error);
  throw error;
}`)}
                className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Copy code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
} 