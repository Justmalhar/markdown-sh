"use client"

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeEditorProps {
  codeSnippets: {
    [key: string]: {
      code: string;
      language: string;
    };
  };
  height?: string;
  onCopy?: (code: string) => void;
}

export function CodeEditor({ codeSnippets, height = "200px", onCopy }: CodeEditorProps) {
  const languages = Object.keys(codeSnippets);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const handleCopy = () => {
    if (onCopy && codeSnippets[selectedLanguage]) {
      onCopy(codeSnippets[selectedLanguage].code);
    }
  };

  return (
    <div className="rounded-md border border-gray-200 p-4">
      <Tabs 
        defaultValue={languages[0]} 
        onValueChange={setSelectedLanguage}
        className="w-full"
      >
        <TabsList className="mb-2">
          {languages.map((lang) => (
            <TabsTrigger key={lang} value={lang}>
              {lang}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {languages.map((lang) => (
          <TabsContent key={lang} value={lang} className="relative">
            <Editor
              height={height}
              language={codeSnippets[lang].language.toLowerCase()}
              value={codeSnippets[lang].code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                automaticLayout: true,
              }}
              theme="vs-dark"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded bg-gray-700 text-white opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Copy code"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 