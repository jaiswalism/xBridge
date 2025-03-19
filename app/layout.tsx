// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  generator: 'v0.dev',
  title: 'xBridge',
  description: 'Your app description',
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
          <Header />
          <div className="pt-16">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}