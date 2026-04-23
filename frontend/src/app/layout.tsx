import type { Metadata } from 'next'
import './globals.css'
import ReduxProvider from '@/providers/ReduxProvider'
import ClientLayout from '@/components/ClientLayout'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Demo App',
  description: 'Rails + Next.js demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ClientLayout>{children}</ClientLayout>
        </ReduxProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
