import type { Metadata } from 'next'
import './globals.css'
import ReduxProvider from '@/providers/ReduxProvider'

export const metadata: Metadata = {
  title: 'Demo App',
  description: 'Rails + Next.js demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
