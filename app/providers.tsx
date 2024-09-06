"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
//@ts-ignore
import { DynamicContextProvider, EthereumWalletConnectors, DynamicWagmiConnector } from "@/lib/dynamic";

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "63b0e820-fe0f-4667-9782-dc4605f0a133",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{props.children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
