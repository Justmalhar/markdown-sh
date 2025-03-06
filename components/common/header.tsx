"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeaderProps {
  scrollToHero: () => void
  scrollToFeatures: () => void
  scrollToFAQ: () => void
}

export default function Header({ scrollToHero, scrollToFeatures, scrollToFAQ }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm" id="header">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={scrollToHero} className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black">
              <div className="absolute inset-0 bg-white/20 bg-gradient-to-br from-white/30 to-transparent"></div>
            </div>
            <span className="text-xl font-bold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME || "Markdown.sh"}</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <button onClick={scrollToFeatures} className="text-sm font-medium text-gray-700 hover:text-black">
            Features
          </button>
          <button onClick={scrollToFAQ} className="text-sm font-medium text-gray-700 hover:text-black">
            FAQ
          </button>
          <Button asChild className="button-32">
            <Link href="/docs">Try API</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                scrollToFeatures()
                setIsMenuOpen(false)
              }}
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              Features
            </button>
            <button
              onClick={() => {
                scrollToFAQ()
                setIsMenuOpen(false)
              }}
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              FAQ
            </button>
            <Link 
              href="/getting-started" 
              className="text-sm font-medium text-gray-700 hover:text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Getting Started
            </Link>
            <Link 
              href="/getapi" 
              className="text-sm font-medium text-gray-700 hover:text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Try API
            </Link>
            <div className="mt-4">
              <Button asChild className="w-full justify-center button-32">
                <Link href="/getapi" onClick={() => setIsMenuOpen(false)}>
                  Try Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
