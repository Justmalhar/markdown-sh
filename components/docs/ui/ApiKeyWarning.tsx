"use client"

import React from 'react';
import { Key } from 'lucide-react';
import { useApiSectionRefs } from '../hooks/useApiSectionRefs';

export function ApiKeyWarning() {
  const { apiKeyGeneratorRef, scrollToSection } = useApiSectionRefs();
  
  return (
    <div className="mt-6 rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Key className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">API Key Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You need to generate an API key before you can test the API.{' '}
              <button
                onClick={() => scrollToSection(apiKeyGeneratorRef)}
                className="font-medium text-yellow-800 underline hover:text-yellow-600"
              >
                Generate an API key
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 