"use client"

import React from 'react';
import { useToast } from "@/components/ui/use-toast";

interface CodeDisplayProps {
  code: string;
  placeholder?: string;
  className?: string;
}

export function CodeDisplay({ code, placeholder = "// Code will appear here", className = "" }: CodeDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    });
  };

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-4 relative group ${className}`}>
      <pre className="font-mono text-sm">
        {code || placeholder}
      </pre>
      {code && (
        <button 
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      )}
    </div>
  );
} 