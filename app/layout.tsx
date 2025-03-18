import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import { WalletProvider } from "@/hooks/use-wallet"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <WalletProvider>
            <Header />
            <div className="pt-16">{children}</div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
