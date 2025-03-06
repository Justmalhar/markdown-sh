"use client"

import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface FileUploaderProps {
  fileType: 'image' | 'pdf';
  file: File | null;
  setFile: (file: File | null) => void;
  createPreview?: (file: File) => void;
  preview?: string | null;
  onFileChange: (file: File) => void;
}

export function FileUploader({ 
  fileType, 
  file, 
  setFile, 
  createPreview, 
  preview, 
  onFileChange 
}: FileUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const allowedTypes = fileType === 'image' 
    ? ["image/jpeg", "image/png"] 
    : ["application/pdf"];
  
  const fileTypeLabel = fileType === 'image' 
    ? "JPG and PNG files" 
    : "PDF files";
  
  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB for demo purposes

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a ${fileType === 'image' ? 'JPEG or PNG image' : 'PDF file'}.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB for the demo.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      
      if (fileType === 'image' && createPreview) {
        createPreview(selectedFile);
      }
      
      onFileChange(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        
        if (fileType === 'image' && createPreview) {
          createPreview(droppedFile);
        }
        
        onFileChange(droppedFile);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileType === 'image') {
      // Clear preview if it's an image
      if (createPreview) {
        createPreview(null as unknown as File);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
        isDraggingOver ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'
      } p-6 transition-colors hover:border-gray-400`}
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {file ? (
        <div className="flex flex-col items-center">
          <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-lg border border-gray-200">
            {fileType === 'image' ? (
              <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
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
          {fileType === 'image' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-black">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-black">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
          <p className="mb-2 text-sm font-medium text-black">
            Drag & drop or click to upload {fileType === 'image' ? 'an image' : 'a PDF'}
          </p>
          <p className="text-xs text-gray-600">
            Supports {fileTypeLabel} (max 10MB)
          </p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
      />
    </div>
  );
} 