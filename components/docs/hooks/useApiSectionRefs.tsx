"use client"

import { useRef } from 'react';

export function useApiSectionRefs() {
  const apiKeyGeneratorRef = useRef<HTMLElement>(null);
  const documentationRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);

  const getElementId = (ref: React.RefObject<HTMLElement>) => {
    if (ref === apiKeyGeneratorRef) return 'api-key-generator';
    if (ref === documentationRef) return 'documentation';
    if (ref === demoRef) return 'demo';
    if (ref === featuresRef) return 'features';
    return null;
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    // Try to find element by ID first
    const id = getElementId(ref);
    const element = id ? document.getElementById(id) : ref.current;

    if (!element) {
      console.log('Element not found');
      return;
    }

    try {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error('Error scrolling:', error);
      
      // Ultimate fallback - just try to scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    apiKeyGeneratorRef,
    documentationRef,
    featuresRef,
    demoRef,
    scrollToSection
  };
} 