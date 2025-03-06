"use client"

import { useRef, useEffect, forwardRef, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"
import { Loader2 } from "lucide-react"
import Image from 'next/image'

// Add type declarations for modules without TypeScript definitions
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownResultProps {
  markdown: string
  isStreaming: boolean
  onStreamComplete?: () => void
}

// Define types for the component props
type ComponentPropsType = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const MarkdownResult = forwardRef<HTMLDivElement, MarkdownResultProps>(
  ({ markdown, isStreaming, onStreamComplete }, ref) => {
    const [displayedMarkdown, setDisplayedMarkdown] = useState("")
    const streamTimerRef = useRef<NodeJS.Timeout | null>(null)
    const charIndexRef = useRef(0)
    const previousMarkdownRef = useRef<string>("")
    const processedContentRef = useRef<Map<string, string>>(new Map())

    // Memoized function to handle streaming
    const streamContent = useCallback((content: string, startIndex: number = 0) => {
      // Clear any existing timers
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current)
      }

      charIndexRef.current = startIndex

      const streamNextChar = () => {
        if (charIndexRef.current < content.length) {
          setDisplayedMarkdown((prev) => {
            // Only append if we're at the end of the previous content
            if (charIndexRef.current >= startIndex) {
              return prev + content[charIndexRef.current]
            }
            return prev
          })
          charIndexRef.current++
          streamTimerRef.current = setTimeout(streamNextChar, 5) // Adjust speed as needed
        } else {
          if (onStreamComplete) {
            onStreamComplete()
          }
        }
      }

      streamNextChar()
    }, [onStreamComplete])

    // Stream the markdown content character by character
    useEffect(() => {
      // If no markdown, do nothing
      if (!markdown) return

      // Check if we've already processed this content
      if (processedContentRef.current.has(markdown)) {
        setDisplayedMarkdown(processedContentRef.current.get(markdown) || "")
        if (onStreamComplete) {
          onStreamComplete()
        }
        return
      }

      // If streaming and new content
      if (isStreaming) {
        // If this is completely new content (not an extension of previous)
        if (!markdown.startsWith(previousMarkdownRef.current)) {
          // Store the new content
          previousMarkdownRef.current = markdown
          // Start streaming from beginning
          streamContent(markdown)
        } else {
          // This is an extension of previous content
          // Continue streaming from where we left off
          const startIndex = previousMarkdownRef.current.length
          previousMarkdownRef.current = markdown
          streamContent(markdown, startIndex)
        }

        return () => {
          if (streamTimerRef.current) {
            clearTimeout(streamTimerRef.current)
          }
        }
      } else if (!isStreaming && markdown) {
        // If not streaming but markdown is available, display it all at once
        setDisplayedMarkdown(markdown)
        // Cache the processed content
        processedContentRef.current.set(markdown, markdown)
        // Update previous content reference
        previousMarkdownRef.current = markdown
      }
    }, [isStreaming, markdown, streamContent, onStreamComplete])

    return (
      <div 
        ref={ref} 
        className="markdown-container w-full overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        tabIndex={0}
      >
        <div className="prose max-w-none text-left" style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: '1.6',
          color: '#000',
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '0.375rem',
          letterSpacing: 'normal'
        }}>
          {displayedMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }: ComponentPropsType) => {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className + " font-mono bg-gray-100 px-1 py-0.5 rounded"} {...props}>
                      {children}
                    </code>
                  )
                },
                // Custom styling for other markdown elements with left alignment and black/white color scheme
                h1: ({ node, ...props }: ComponentPropsType) => <h1 className="mb-4 text-2xl font-bold text-black border-b pb-2" {...props} />,
                h2: ({ node, ...props }: ComponentPropsType) => <h2 className="mb-3 text-xl font-bold text-black mt-6" {...props} />,
                h3: ({ node, ...props }: ComponentPropsType) => <h3 className="mb-2 text-lg font-bold text-black mt-4" {...props} />,
                p: ({ node, ...props }: ComponentPropsType) => <p className="mb-4 text-black" {...props} />,
                ul: ({ node, ...props }: ComponentPropsType) => <ul className="mb-4 ml-6 list-disc text-black" {...props} />,
                ol: ({ node, ...props }: ComponentPropsType) => <ol className="mb-4 ml-6 list-decimal text-black" {...props} />,
                li: ({ node, ...props }: ComponentPropsType) => <li className="mb-1" {...props} />,
                blockquote: ({ node, ...props }: ComponentPropsType) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-black" {...props} />
                ),
                table: ({ node, ...props }: ComponentPropsType) => (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                th: ({ node, ...props }: ComponentPropsType) => (
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-medium text-black" {...props} />
                ),
                td: ({ node, ...props }: ComponentPropsType) => <td className="border border-gray-300 px-3 py-2 text-black" {...props} />,
                img: ({ node, ...props }: ComponentPropsType) => {
                  return (
                    <div className="flex flex-col items-center mb-4">
                      <div className="bg-gray-200 rounded-lg shadow-sm w-full max-w-full h-48 flex items-center justify-center overflow-hidden">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-12 w-12 text-gray-500 flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                          <div className="text-sm text-gray-500">Figure</div>
                        </div>
                      </div>
                      {props.alt && (
                        <div className="mt-2 text-sm text-center text-gray-600 w-full">
                          {props.alt}
                        </div>
                      )}
                    </div>
                  );
                },
                a: ({ node, ...props }: ComponentPropsType) => (
                  <a className="text-black font-medium underline hover:no-underline" {...props} />
                ),
                hr: ({ node, ...props }: ComponentPropsType) => (
                  <hr className="my-6 border-t border-gray-300" {...props} />
                ),
              }}
            >
              {displayedMarkdown}
            </ReactMarkdown>
          ) : markdown && isStreaming ? (
            <div className="flex items-center space-x-2 text-black">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading content...</span>
            </div>
          ) : (
            <div className="text-black text-left py-6">
              No content to display. Convert a file to see the result.
            </div>
          )}
        </div>
      </div>
    )
  }
)

MarkdownResult.displayName = "MarkdownResult"

export default MarkdownResult 