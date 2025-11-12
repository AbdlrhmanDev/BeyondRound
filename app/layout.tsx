import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BeyondRounds',
  description: 'Where Doctors Become Friends',

  icons: {
    icon: '/favicon.png',
  },  
  openGraph: {
    title: 'BeyondRounds',
    description: 'Where Doctors Become Friends',
    images: '/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeyondRounds',
    description: 'Where Doctors Become Friends',
  },

  metadataBase: new URL('https://beyondrounds.com'),  
  alternates: {
    canonical: 'https://beyondrounds.com',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'M3c6vlmeivbBbXzb6wGxQjIzgAXLQJgOAOl-JqpmYJs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DLSLEKSTP9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DLSLEKSTP9');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
