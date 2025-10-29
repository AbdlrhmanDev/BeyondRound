'use client';

import { MainNav } from './main-nav';
import { MainFooter } from './main-footer';

interface ContentPageLayoutProps {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function ContentPageLayout({ title, children, lastUpdated }: ContentPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <MainNav />
      <main className="flex-1 relative">
        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative w-[80%] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title with gradient */}
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-8 text-center drop-shadow-lg">
            {title}
          </h1>
          
          {/* Content */}
          <div className="prose prose-lg max-w-none prose-invert">
            <div className="text-gray-100 space-y-8">
              {children}
            </div>
          </div>
          
          {/* Last Updated */}
          {lastUpdated && (
            <div className="mt-12 pt-8 border-t border-gray-800/50">
              <p className="text-sm text-gray-400 text-center">
                Last Updated: {lastUpdated}
              </p>
            </div>
          )}
        </div>
      </main>
      <MainFooter />
    </div>
  );
}

// Section component for structured content
export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// Divider component with glossy effect
export function ContentDivider() {
  return (
    <div className="my-8 relative">
      <hr className="border-gray-800" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" />
    </div>
  );
}

// Question component for FAQ with glossy black style
export function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  return (
    <div className="mb-8 p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-gray-900/50 hover:border-gray-700 transition-all duration-300">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-3">{question}</h3>
      <div className="text-gray-300 text-base leading-relaxed">{answer}</div>
    </div>
  );
}

