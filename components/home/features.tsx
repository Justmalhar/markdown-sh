"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { FileText, Image, Cpu, Zap, Lock, FileCode, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: <Image className="h-10 w-10" />,
    title: "Image Recognition",
    description: "Advanced OCR technology that accurately extracts text from images, including handwritten notes.",
  },
  {
    icon: <FileText className="h-10 w-10" />,
    title: "PDF Processing",
    description: "Extract and convert content from PDF documents while preserving the original structure.",
  },
  {
    icon: <Cpu className="h-10 w-10" />,
    title: "AI-Powered Formatting",
    description: "Our LLM technology intelligently formats the extracted text into clean, structured markdown.",
  },
  {
    icon: <Zap className="h-10 w-10" />,
    title: "Lightning Fast",
    description: "Get your markdown in seconds, not minutes. Our optimized pipeline ensures quick processing.",
  },
  {
    icon: <Lock className="h-10 w-10" />,
    title: "Secure Processing",
    description: "Your files are processed securely and never stored permanently on our servers.",
  },
  {
    icon: <FileCode className="h-10 w-10" />,
    title: "Code Block Detection",
    description: "Automatically detects and properly formats code blocks with the correct syntax highlighting.",
  },
]

const Features = forwardRef<HTMLElement>((props, ref) => {
    const scrollToToolSection = () => {
      const toolSection = document.getElementById("hero")
      
      if (toolSection) {
        toolSection.scrollIntoView({ behavior: "smooth" })
        
        // Wait for scroll to complete before focusing
        setTimeout(() => {
          const fileInputRef = document.querySelector('input[type="file"]')
          if (fileInputRef) {
            (fileInputRef as HTMLInputElement).click()
          }
        }, 800)
      }
    }

  return (
    <section ref={ref} id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Powerful Features for Perfect Markdown</h2>
          <p className="mb-12 text-lg text-gray-600">
            Our OCR to Markdown converter combines cutting-edge technologies to deliver accurate, well-formatted results
            every time.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              style={{
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-3">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button className="button-32 group" onClick={scrollToToolSection}>
            <span className="text">Try It Now</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
})

Features.displayName = "Features"

export default Features

