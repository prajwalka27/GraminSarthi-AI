import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import {
  Inter,
  JetBrains_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
} from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Indic script fonts so vernacular labels render on every device.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
})
const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'swap',
})
const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-noto-telugu',
  display: 'swap',
})
const notoKannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  variable: '--font-noto-kannada',
  display: 'swap',
})
const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-noto-malayalam',
  display: 'swap',
})

const fontVariables = [
  inter.variable,
  jetbrainsMono.variable,
  notoDevanagari.variable,
  notoTamil.variable,
  notoTelugu.variable,
  notoKannada.variable,
  notoMalayalam.variable,
].join(' ')

export const metadata: Metadata = {
  title: 'GraminSarthi AI | Hyper-Local Business Advisory for Bharat',
  description:
    'AI-driven hyper-local business advisory and financial structuring for rural micro-entrepreneurs across India. Smart India Hackathon PS: SIH26091.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1120',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${fontVariables}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
