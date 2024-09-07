//replace with chain ids

export type ValidChainId = 11155111 | 84532 | 421614 ;
export type ValidChainName = 'sepolia' | 'mantle' | 'alfajores'

export const contracts: Record<ValidChainId, {
    tUSDCAddress: `0x${string}`;
    name: ValidChainName
}> = {
    //Sepolia
    11155111: {
        name: 'sepolia',
        tUSDCAddress: "0x4e084005835a1059B1D1c741E21ab511458F90b0",
    },
    //Mantle testenet
    84532: {
        tUSDCAddress: "0xf6dC757C9F7E5e5eE5787c31f2aBEa4B19001015",
        name: 'mantle'
    },
    //Celo testnet
    421614: {
        tUSDCAddress: "0x37ff5b5f37038db083957c415d5b105ee2e27e4f",
        name:'alfajores'
    },
    
};