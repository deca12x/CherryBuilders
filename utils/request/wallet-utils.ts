import { providers } from "ethers";

export function constructProviderFromWalletClient(walletClient: any) {
  console.log('Constructing provider from wallet client:', walletClient);

  if (!walletClient) {
    console.error('Wallet client is undefined or null');
    return null;
  }

   //MULTI CHAIN
  const network = {
    chainId: 11155111,  // Sepolia chain ID
    name: 'Sepolia'
  };

  try {
    // Assuming walletClient.transport contains the necessary provider information
    const provider = new providers.Web3Provider(walletClient.transport, network);
    console.log('Provider constructed successfully:', provider);
    return provider;
  } catch (error) {
    console.error('Error constructing provider:', error);
    return null;
  }
}


export const walletClientToSigner = (walletClient: any): any => {
  if (walletClient) {
    console.log('wallet client', walletClient);
    
    const provider = constructProviderFromWalletClient(walletClient);
    
    if (provider) {
      const signer = provider.getSigner(walletClient.accounts?.[0]?.address);
      return signer;
    } else {
      console.error('Failed to construct provider');
      return null;
    }
  }
  return null;
};