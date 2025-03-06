"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  updateApiKeyInExamples: (newApiKey: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string>('');

  // Function to update API key in all code examples
  const updateApiKeyInExamples = (newApiKey: string) => {
    setTimeout(() => {
      // Update API keys in pre tags (code blocks)
      const codeBlocks = document.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        // Check if this code block contains the API key placeholder
        const blockText = block.textContent;
        if (blockText && blockText.includes('YOUR_API_KEY')) {
          // Get all text nodes within the pre element
          const walker = document.createTreeWalker(
            block,
            NodeFilter.SHOW_TEXT
          );
          
          let node;
          while ((node = walker.nextNode())) {
            // Replace the API key placeholder in each text node
            const nodeValue = node.nodeValue;
            if (nodeValue && nodeValue.includes('YOUR_API_KEY')) {
              node.nodeValue = nodeValue.replace(/YOUR_API_KEY/g, newApiKey);
            }
          }
        }
      });

      // Also update API keys in code tags
      const codeTags = document.querySelectorAll('code');
      codeTags.forEach(codeTag => {
        const codeText = codeTag.textContent;
        if (codeText && codeText.includes('YOUR_API_KEY')) {
          const walker = document.createTreeWalker(
            codeTag,
            NodeFilter.SHOW_TEXT
          );
          
          let node;
          while ((node = walker.nextNode())) {
            const nodeValue = node.nodeValue;
            if (nodeValue && nodeValue.includes('YOUR_API_KEY')) {
              node.nodeValue = nodeValue.replace(/YOUR_API_KEY/g, newApiKey);
            }
          }
        }
      });

      // Update the authentication header example specifically
      const authSection = document.querySelector('#documentation');
      if (authSection) {
        const authHeaders = authSection.querySelectorAll('.overflow-x-auto');
        authHeaders.forEach(header => {
          const headerText = header.textContent;
          if (headerText && headerText.includes('YOUR_API_KEY')) {
            const walker = document.createTreeWalker(
              header,
              NodeFilter.SHOW_TEXT
            );
            
            let node;
            while ((node = walker.nextNode())) {
              const nodeValue = node.nodeValue;
              if (nodeValue && nodeValue.includes('YOUR_API_KEY')) {
                node.nodeValue = nodeValue.replace(/YOUR_API_KEY/g, newApiKey);
              }
            }
          }
        });
      }
    }, 0);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, updateApiKeyInExamples }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
} 