import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet, WALLETCONNECT_PROJECT_ID } from './contract';

export const wagmiConfig = getDefaultConfig({
  appName: 'Sputnik Protocol',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [arcTestnet],
  ssr: false,
});
