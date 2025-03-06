"use client"

import { forwardRef, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import OcrTool, { OcrToolHandle } from "@/components/ocr-tool/tool"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const Hero = forwardRef<HTMLElement>((props, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ocrToolRef = useRef<OcrToolHandle>(null)

  const focusFileInput = () => {
    if (ocrToolRef.current) {
      ocrToolRef.current.triggerFileInput()
    }
  }

  const scrollToToolSection = () => {
    const toolSection = document.getElementById("header")
    
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: "smooth" })
      
      // Wait for scroll to complete before focusing
      setTimeout(() => {
        if (ocrToolRef.current) {
          ocrToolRef.current.triggerFileInput()
        }
      }, 800)
    }
  }

  return (
    <section ref={ref} className="relative overflow-hidden py-20" id="hero">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-gray-100"></div>
        <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-gray-100"></div>
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-100"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h1
            className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transform Images & PDFs to{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Markdown</span>
              <span className="absolute bottom-0 left-0 z-0 h-3 w-full bg-gray-200"></span>
            </span>{" "}
            with AI
          </motion.h1>

          <motion.p
            className="mb-10 text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Instantly convert your images and PDFs to clean, formatted markdown using our advanced OCR and LLM
            technology.
          </motion.p>

          <motion.div
            className="mb-10 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              className="button-32"
              onClick={() => {
                // Use the ocrToolRef to trigger the file input
                if (ocrToolRef.current) {
                  ocrToolRef.current.triggerFileInput();
                }
              }}
            >
              Try for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.p
            className="mb-8 text-sm text-center text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            No credit card required. Start converting your documents instantly.
          </motion.p>

          <motion.div
            id="tool-section"
            className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <OcrTool ref={ocrToolRef} />
          </motion.div>
        </div>
      </div>
    </section>
  )
})

Hero.displayName = "Hero"

export default Hero
