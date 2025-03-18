import HeroSection from "@/components/hero-section"
import FloatingSymbols from "@/components/floating-symbols"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden">
      <FloatingSymbols />
      <HeroSection />
    </main>
  )
}

