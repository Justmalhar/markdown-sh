"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="prose prose-lg mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Terms of Service</h1>
          
          <p className="mt-6 text-xl text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <h2 className="mt-12 text-2xl font-bold text-gray-900">1. Introduction</h2>
          <p>
            Welcome to {process.env.NEXT_PUBLIC_APP_NAME || "Yolo-OCR"}. These Terms of Service govern your use of our website and services. By accessing or using our services, you agree to be bound by these terms.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">2. Use of Services</h2>
          <p>
            Our services are designed to convert images and PDFs to markdown format using AI technology. You may use our services only as permitted by these terms and applicable law.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">3. User Accounts</h2>
          <p>
            Some features of our services may require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">4. Privacy</h2>
          <p>
            Our Privacy Policy describes how we handle the information you provide to us when you use our services. By using our services, you agree to our data practices as described in our Privacy Policy.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">5. Intellectual Property</h2>
          <p>
            Our services and all related content, features, and functionality are owned by us or our licensors and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">6. Termination</h2>
          <p>
            We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
          <p>
            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. If we make changes, we will provide notice of such changes, such as by sending an email notification or providing notice through our services.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">9. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@markdownai.com.
          </p>
        </div>
      </div>
    </div>
  )
} 