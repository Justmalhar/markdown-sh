"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

interface FooterProps {
  scrollToHero: () => void
  scrollToFeatures: () => void
  scrollToFAQ: () => void
}

export default function Footer({ scrollToHero, scrollToFeatures, scrollToFAQ }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <button onClick={scrollToHero} className="flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black">
                <div className="absolute inset-0 bg-white/20 bg-gradient-to-br from-white/30 to-transparent"></div>
              </div>
              <span className="text-xl font-bold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME || "Markdown.sh"}</span>
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Transform your images and PDFs into clean, formatted markdown with our AI-powered OCR technology.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://x.com/justmalhar" className="text-gray-500 hover:text-black">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>  
              <a href="https://github.com/justmalhar" className="text-gray-500 hover:text-black">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Product</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <button onClick={scrollToFeatures} className="text-sm text-gray-600 hover:text-black">
                      Features
                    </button>
                  </li>
                  <li>
                    <button onClick={scrollToHero} className="text-sm text-gray-600 hover:text-black">
                      Try It
                    </button>
                  </li>
                  <li>
                    <Link href="/docs" className="text-sm text-gray-600 hover:text-black">
                      API
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Resources</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/docs#documentation" className="text-sm text-gray-600 hover:text-black">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <button onClick={scrollToFAQ} className="text-sm text-gray-600 hover:text-black">
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/terms" className="text-sm text-gray-600 hover:text-black">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm text-gray-600 hover:text-black">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-600">
              &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "Markdown.sh"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

