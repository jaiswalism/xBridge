"use client"

import { useWallet } from "@/hooks/use-wallet"
import { X, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect } = useWallet()

  if (!isOpen) return null

  const handleConnect = (provider: string) => {
    connect(provider)
    onClose()
  }

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "M",
      bgColor: "bg-orange-100",
      textColor: "text-orange-500",
      description: "Connect to your MetaMask Wallet",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "C",
      bgColor: "bg-blue-100",
      textColor: "text-blue-500",
      description: "Connect to your Coinbase Wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "W",
      bgColor: "bg-gray-100",
      textColor: "text-gray-500",
      description: "Scan with WalletConnect to connect",
    },
    {
      id: "trustwallet",
      name: "Trust Wallet",
      icon: "T",
      bgColor: "bg-blue-100",
      textColor: "text-blue-500",
      description: "Connect to your Trust Wallet",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#09122C] bg-opacity-70"
        onClick={onClose}
      ></motion.div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#BE3144]">Connect Wallet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {walletOptions.map((wallet) => (
            <motion.button
              key={wallet.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConnect(wallet.id)}
              className="flex items-center w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className={`w-10 h-10 ${wallet.bgColor} rounded-full flex items-center justify-center mr-4`}>
                <span className={`${wallet.textColor} font-bold`}>{wallet.icon}</span>
              </div>
              <div className="text-left">
                <span className="font-medium block">{wallet.name}</span>
                <span className="text-xs text-gray-500">{wallet.description}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          New to Ethereum wallets?{" "}
          <a href="#" className="text-[#BE3144] font-medium">
            Learn more
          </a>
        </div>
      </motion.div>
    </div>
  )
}

