"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { useApiSectionRefs } from './hooks/useApiSectionRefs';
import { useApiKey } from './context/ApiKeyContext';

export function ApiKeyGeneratorSection() {
  const { toast } = useToast();
  const { apiKeyGeneratorRef } = useApiSectionRefs();
  const { apiKey, setApiKey, updateApiKeyInExamples } = useApiKey();
  
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify ref mounting
  useEffect(() => {
    if (apiKeyGeneratorRef.current) {
      console.log('ApiKeyGenerator section mounted with ref');
    }
  }, []);

  const generateKey = async () => {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., user@example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/keys/quick-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate API key');
      }
      
      // Set the API key in context
      setApiKey(data.apiKey);
      
      // Update API key in examples
      updateApiKeyInExamples(data.apiKey);
      
      toast({
        title: "API Key Generated",
        description: "Your API key has been successfully generated and updated in all examples.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({
        title: "Copied to clipboard",
        description: "API key has been copied to your clipboard.",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50" id="api-key-generator" ref={apiKeyGeneratorRef}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Generate Your API Key
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Enter your email to get a unique API key for our services
          </p>
        </div>

        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                We use your email to generate a unique key. We don't store your email address.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div>
              <Button
                onClick={generateKey}
                disabled={isLoading}
                className="w-full button-32"
              >
                {isLoading ? 'Generating...' : 'Generate API Key'}
              </Button>
            </div>

            {apiKey && (
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="overflow-x-auto font-mono text-sm">{apiKey}</div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This key is tied to your email address. You can regenerate it anytime using the same email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 