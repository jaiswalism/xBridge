"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Wallet, BracketsIcon as Bridge } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import WalletModal from "@/components/wallet-modal"
import { usePathname } from "next/navigation"

export default function Header() {
  const { isConnected, address, disconnect } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-[#09122C] text-white z-50 transition-all duration-300 ${
        scrolled ? "py-2 shadow-lg" : "py-4"
      }`}
      style={{ borderBottom: "1px solid rgba(190, 49, 68, 0.3)" }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white flex items-center">
            
            <span>xBridge</span>
          </Link>
        </div>

        <div className="flex items-center">
          <nav className="hidden md:flex items-center space-x-6 mr-6">
            <Link href="/about" className="text-white hover:text-[#BE3144] transition-transform hover:scale-105">
              About
            </Link>
            <Link href="/team" className="text-white hover:text-[#BE3144] transition-transform hover:scale-105">
              Team
            </Link>
            <Link href="/chains" className="text-white hover:text-[#BE3144] transition-transform hover:scale-105">
              Chains
            </Link>
            <Link href="/contact" className="text-white hover:text-[#BE3144] transition-transform hover:scale-105">
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center">
            <div className="mr-4 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm hidden sm:inline">Mainnet</span>
            </div>

            {isConnected ? (
              <div className="relative">
                <button
                  className="flex items-center bg-[#BE3144] hover:bg-[#9e2938] text-white px-4 py-2 rounded-full transition-transform hover:scale-105"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {truncateAddress(address)}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        disconnect()
                        setIsDropdownOpen(false)
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="flex items-center bg-[#BE3144] hover:bg-[#9e2938] text-white px-4 py-2 rounded-full transition-transform hover:scale-105"
                onClick={() => setIsModalOpen(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}

