"use client"

import { useWallet } from "@/hooks/use-wallet"
import { X, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, wallets } = useWallet()

  if (!isOpen) return null

  const handleConnect = (walletId: string) => {
    connect(walletId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#09122C] bg-opacity-70"
        onClick={onClose}
      ></motion.div>

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#BE3144]">Connect Wallet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3 mb-6">
          {wallets.map((wallet) => (
            <motion.button
              key={wallet.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConnect(wallet.id)}
              className="flex items-center w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <img 
                  src={wallet.icon} 
                  alt={wallet.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="text-left">
                <span className="font-medium block">{wallet.name}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}