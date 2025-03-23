"use client"

import { useEffect, useState } from "react"
import SwapInterface from "@/components/swap-interface"
import WelcomeModal from "@/components/welcome-modal"
import FloatingSymbols from "@/components/floating-symbols"

export default function SwapPage() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    // Show welcome modal after a short delay
    const timer = setTimeout(() => {
      setShowWelcomeModal(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#09122C] to-black transition-colors duration-500 relative overflow-hidden">
      <FloatingSymbols />
      <SwapInterface />
      <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
    </main>
  )
}

