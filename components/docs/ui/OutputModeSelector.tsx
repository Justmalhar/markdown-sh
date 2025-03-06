"use client"

import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

interface OutputModeSelectorProps {
  outputMode: "markdown" | "json";
  onOutputModeChange: (value: "markdown" | "json") => void;
}

export function OutputModeSelector({ outputMode, onOutputModeChange }: OutputModeSelectorProps) {
  return (
    <div className="mt-4 mb-4">
      <label htmlFor="outputModeSelect" className="block text-sm font-medium text-gray-700 mb-2">
        Output Format
      </label>
      <Select 
        value={outputMode} 
        onValueChange={(value) => onOutputModeChange(value as "markdown" | "json")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select output format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="markdown">Markdown (Combined)</SelectItem>
          <SelectItem value="json">JSON (Pages as Array)</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-gray-500">
        Markdown returns a single combined document. JSON returns each page as a separate array item.
      </p>
    </div>
  );
} 