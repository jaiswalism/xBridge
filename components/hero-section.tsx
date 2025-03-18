"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function HeroSection() {
  const router = useRouter()

  const handleStartSwapping = () => {
    router.push("/swap")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-[#BE3144] mb-6 leading-tight">
          All Your Bridging & Swapping At One Page
        </h1>

        <p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto">
          Cross-chain interoperability made simple
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartSwapping}
          className="bg-[#BE3144] hover:bg-[#9e2938] text-white px-8 py-4 rounded-full text-lg font-medium flex items-center justify-center mx-auto transition-colors duration-300"
        >
          Start Swapping
          <ArrowRight className="ml-2 w-5 h-5" />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-0 w-full"
      >
        <div className="h-40 bg-gradient-to-t from-[#BE3144]/10 to-transparent"></div>
      </motion.div>
    </div>
  )
}

