"use client"

import { useState, forwardRef } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "What file types are supported?",
    answer:
      "Our OCR tool currently supports JPG, PNG, and PDF files. We're working on adding support for more file formats in the future.",
  },
  {
    question: "How accurate is the OCR conversion?",
    answer:
      "Our OCR technology achieves over 95% accuracy for clear, typed text. Handwritten text accuracy varies depending on legibility. The LLM processing improves the structure and formatting of the output and extracts useful insights such as charts, tables, figures, etc.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "We've increased our file size limits! We now support files up to 500MB.",
  },
  {
    question: "How are large documents handled?",
    answer:
      "Our new pagination feature automatically processes large documents page by page, allowing you to navigate through each page of the converted content separately. This improves performance and makes it easier to work with lengthy documents.",
  },
  {
    question: "How is my data handled?",
    answer:
      "We take privacy seriously. Your files are processed securely and are not stored permanently on our servers. All files are automatically deleted after processing is complete.",
  },
  {
    question: "Do you offer an API for integration?",
    answer:
      "Yes, we provide a RESTful API for developers who want to integrate our OCR to Markdown conversion into their own applications. Our API now supports all new features including large file processing and pagination. Check out our Developer Documentation for more details.",
  },
]

const FAQ = forwardRef<HTMLElement>((props, ref) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const scrollToToolSection = () => {
    const toolSection = document.getElementById("hero")
    const fileInput = document.getElementById("file-upload-input")

    if (toolSection) {
      toolSection.scrollIntoView({ behavior: "smooth" })

      // Wait for scroll to complete before focusing
      setTimeout(() => {
        if (fileInput) {
          ;(fileInput as HTMLInputElement).click()
        }
      }, 800)
    }
  }

  return (
    <section ref={ref} id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mb-12 text-lg text-gray-600">
            Everything you need to know about our OCR to Markdown converter.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left font-medium transition-all hover:bg-gray-50"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="rounded-b-lg border-x border-b border-gray-200 bg-white p-4 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}

          <div className="mt-12 text-center">
            <Button className="button-32" onClick={scrollToToolSection}>
              <span className="text">Try It Yourself</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
})

FAQ.displayName = "FAQ"

export default FAQ

