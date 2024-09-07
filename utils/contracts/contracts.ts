//replace with chain ids

export type ValidChainId = 11155111 | 5000 | 42220 ;
export type ValidChainName = 'sepolia' | 'mantle' | 'celo'

export const contracts: Record<ValidChainId, {
    tUSDCAddress: `0x${string}`;
    name: ValidChainName
}> = {
    //Sepolia
    11155111: {
        name: 'sepolia',
        tUSDCAddress: "0x4e084005835a1059B1D1c741E21ab511458F90b0",
    },
    //Mantle
    5000: {
        tUSDCAddress: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
        name: 'mantle'
    },
    //Celo mainnet
    42220: {
        tUSDCAddress: "0x471EcE3750Da237f93B8E339c536989b8978a438",
        name:'celo'
    },
    
};