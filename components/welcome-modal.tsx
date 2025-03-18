"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          ></motion.div>

          <motion.div
            className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#BE3144]">How Swapping Works</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BE3144] text-white flex items-center justify-center mr-3 mt-0.5">
                  1
                </div>
                <p className="text-gray-700">Select input/output tokens</p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BE3144] text-white flex items-center justify-center mr-3 mt-0.5">
                  2
                </div>
                <p className="text-gray-700">Enter amount</p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BE3144] text-white flex items-center justify-center mr-3 mt-0.5">
                  3
                </div>
                <p className="text-gray-700">Confirm transaction</p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BE3144] text-white flex items-center justify-center mr-3 mt-0.5">
                  4
                </div>
                <p className="text-gray-700">Instant bridging!</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#BE3144] hover:bg-[#9e2938] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300"
            >
              Gotcha!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

