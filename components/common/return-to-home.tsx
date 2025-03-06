import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ReturnToHomeLink() {
  return (
    <div className="mb-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
} 