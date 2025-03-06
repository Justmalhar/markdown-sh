"use client"

import React from 'react';
import { Zap, Lock, Code, FileJson, Key, Globe } from 'lucide-react';
import { useApiSectionRefs } from './hooks/useApiSectionRefs';
import { FeatureCard } from './ui/FeatureCard';

export function FeaturesSection() {
  const { featuresRef } = useApiSectionRefs();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Processing",
      description: "Process images and PDFs in seconds with our optimized OCR pipeline."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure",
      description: "Your data is encrypted in transit and at rest. We never store your processed files."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Simple Integration",
      description: "Easy-to-use REST API with comprehensive documentation and examples."
    },
    {
      icon: <FileJson className="h-6 w-6" />,
      title: "Structured Output",
      description: "Get clean, formatted markdown that preserves the structure of your original documents."
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "API Key Management",
      description: "Generate and manage API keys for different environments with fine-grained permissions."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Availability",
      description: "Our API is deployed globally for low-latency access from anywhere in the world."
    }
  ];

  return (
    <section className="py-12 md:py-16" id="features" ref={featuresRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            API Features
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to integrate OCR capabilities into your applications
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 