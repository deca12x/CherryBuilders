import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celo, mantle, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia, mantle, celo],
  ssr: true,
});