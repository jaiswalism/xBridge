// app/providers.tsx
"use client"

import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/hooks/use-wallet"
import { useMemo } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <WalletProvider>
              {children}
            </WalletProvider>
          </ThemeProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}