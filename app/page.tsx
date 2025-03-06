"use client"

import type React from "react"
import { useRef } from "react"
import Header from "@/components/common/header"
import Hero from "@/components/home/hero"
import Features from "@/components/home/features"
import FAQ from "@/components/home/faq"
import Footer from "@/components/common/footer"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <Toaster />
      <div className="relative min-h-screen bg-white">
        <Header
          scrollToHero={() => scrollToSection(heroRef)}
          scrollToFeatures={() => scrollToSection(featuresRef)}
          scrollToFAQ={() => scrollToSection(faqRef)}
        />
        <main className="relative z-10">
          <Hero ref={heroRef} />
          <Features ref={featuresRef} />
          <FAQ ref={faqRef} />
        </main>
        <Footer
          scrollToHero={() => scrollToSection(heroRef)}
          scrollToFeatures={() => scrollToSection(featuresRef)}
          scrollToFAQ={() => scrollToSection(faqRef)}
        />
      </div>
    </>
  )
}

