"use client"

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiSectionRefs } from './hooks/useApiSectionRefs';

export function HeroSection() {
  const { apiKeyGeneratorRef, demoRef, documentationRef, scrollToSection } = useApiSectionRefs();

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Try Our <span className="text-black">API</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500">
          Transform your images and PDFs into clean, formatted markdown with our powerful OCR API.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center space-y-6">
          <Button 
            className="w-full sm:w-[200px] button-32 bg-black text-white hover:bg-gray-800"
            onClick={() => scrollToSection(apiKeyGeneratorRef)}
          >
            Get API Key
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-[200px] button-32"
              onClick={() => scrollToSection(demoRef)}
            >
              Try Demo
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-[200px] button-32"
              onClick={() => scrollToSection(documentationRef)}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 