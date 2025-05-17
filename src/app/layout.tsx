import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import dynamic from 'next/dynamic'
// import { NavbarWrapper } from './navbar-wrapper'

const AssistantPanel = dynamic(() => import('@/components/AssistantPanel'), {
  ssr: false
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'A modern admin dashboard built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* <NavbarWrapper /> */}
          {children}
          <AssistantPanel />
        </Providers>
      </body>
    </html>
  )
} 