import { GetTUSDC } from '@/components/funds/getTusdc'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'

const Page = () => {
    return (
        <div className='grid grid-cols-1'><GetTUSDC /><ConnectButton /></div>
    )
}

export default Page