import "@/styles/globals.css";
import type { AppProps } from "next/app";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC } from "@/utils/constants";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Mainnet;

  if (!RPC) {
    throw new Error("RPC not found in environment variables");
  }

  const endpoint = useMemo(() => RPC, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
      <Toaster />
    </ConnectionProvider>
  );
}
