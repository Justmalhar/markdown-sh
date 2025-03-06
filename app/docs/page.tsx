"use client"

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { HeroSection } from '@/components/docs/HeroSection';
import { FeaturesSection } from '@/components/docs/FeaturesSection';
import { ApiKeyGeneratorSection } from '@/components/docs/ApiKeyGeneratorSection';
import { DemoSection } from '@/components/docs/DemoSection';
import { DocumentationSection } from '@/components/docs/DocumentationSection';
import { ReturnToHomeLink } from '@/components/common/return-to-home';
import { ApiKeyProvider } from '@/components/docs/context/ApiKeyContext';

export default function GetApiPage() {
  return (
    <div className="min-h-screen bg-white" id="getapi">
      <Toaster />
      <ApiKeyProvider>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ReturnToHomeLink />
          <HeroSection />
          <FeaturesSection />
          <ApiKeyGeneratorSection />
          <DemoSection />
          <DocumentationSection />
        </div>
      </ApiKeyProvider>
    </div>
  );
} 