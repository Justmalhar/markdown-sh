"use client"

import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

interface ModelSelectorProps {
  selectedModel: "fast" | "slow";
  onModelChange: (value: "fast" | "slow") => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="mt-4 mb-4">
      <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700 mb-2">
        Model Speed
      </label>
      <Select 
        value={selectedModel} 
        onValueChange={(value) => onModelChange(value as "fast" | "slow")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fast">Fast (Lower quality)</SelectItem>
          <SelectItem value="slow">Slow (Higher quality)</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-gray-500">
        Fast model is quicker but less accurate. Slow model provides better results but takes longer.
      </p>
    </div>
  );
} 