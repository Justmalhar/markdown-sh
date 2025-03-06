"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Privacy Policy</h1>
          
          <p className="mt-6 text-xl text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <h2 className="mt-12 text-2xl font-bold text-gray-900">1. Introduction</h2>
          <p>
            At {process.env.NEXT_PUBLIC_APP_NAME || "Yolo-OCR"}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">2. Information We Collect</h2>
          <p>
            We may collect information about you in various ways, including:
          </p>
          <ul className="list-disc pl-6">
            <li>Personal Data: Name, email address, and other contact information you provide when creating an account or contacting us.</li>
            <li>Usage Data: Information about how you use our services, including your interactions with our website and features.</li>
            <li>Content Data: The files you upload for conversion, including images and PDFs.</li>
            <li>Device Data: Information about your device, browser, and IP address.</li>
          </ul>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Develop new products and services</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          </ul>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">4. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">5. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul className="list-disc pl-6">
            <li>The right to access your personal information</li>
            <li>The right to rectify inaccurate personal information</li>
            <li>The right to request the deletion of your personal information</li>
            <li>The right to restrict the processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to object to the processing of your personal information</li>
          </ul>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2 className="mt-8 text-2xl font-bold text-gray-900">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at {process.env.NEXT_PUBLIC_CONTACT_EMAIL}.
          </p>
        </div>
      </div>
    </div>
  )
} 