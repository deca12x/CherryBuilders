'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork } from "@requestnetwork/request-client.js"
import { useAccount, useWalletClient } from 'wagmi'
import { Types, Utils } from "@requestnetwork/request-client.js";
import { Loader2 } from 'lucide-react';
import { contracts, ValidChainId } from '@/utils/contracts/contracts'
import { parseEther } from 'viem'

type CreateRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (amount: string, requestId: string) => void;
  payeeAddress: string;
  payerAddress: string;
}

export default function CreateRequestModal({ isOpen, onClose, onCreateRequest, payeeAddress, payerAddress }: CreateRequestModalProps) {
  const [amount, setAmount] = useState('')
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const {chainId} = useAccount();

  const handleCreateRequest = async () => {
    setIsLoading(true);
    setLoadingMessage('Initializing request creation...');

    try {
      const web3SignatureProvider = new Web3SignatureProvider(walletClient);
      setLoadingMessage('Connecting to Request Network...');
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network",
        },
        signatureProvider: web3SignatureProvider,
      });

      const payeeIdentity = payeeAddress;
      const payerIdentity = payerAddress;
      const paymentRecipient = payeeIdentity;
      const feeRecipient = '0x0000000000000000000000000000000000000000';

      setLoadingMessage('Preparing request parameters...');
      const requestCreateParameters = {
        requestInfo: {

          // The currency in which the request is denominated
          currency: {
            type: Types.RequestLogic.CURRENCY.ERC20,
            value: contracts[chainId as ValidChainId].tUSDCAddress,
            network: contracts[chainId as ValidChainId].name,
          },

          // The expected amount as a string, in parsed units, respecting `decimals`
          // Consider using `parseUnits()` from ethers or viem
          expectedAmount: `${parseEther(amount)}`,

          // The payee identity. Not necessarily the same as the payment recipient.
          payee: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payeeIdentity,
          },

          // The payer identity. If omitted, any identity can pay the request.
          payer: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payerIdentity,
          },

          // The request creation timestamp.
          timestamp: Utils.getCurrentTimestampInSecond(),
        },

        // The paymentNetwork is the method of payment and related details.
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
          parameters: {
            paymentNetworkName: contracts[chainId as ValidChainId].name,
            paymentAddress: payeeIdentity,
            feeAddress: feeRecipient,
            feeAmount: '0',
          },
        },

        // The contentData can contain anything.
        // Consider using rnf_invoice format from @requestnetwork/data-format
        contentData: {
          reason: '🍕',
          dueDate: '2023.06.16',
        },

        // The identity that signs the request, either payee or payer identity.
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },
      };

      console.log(requestCreateParameters)

      setLoadingMessage('Creating request...');
      //@ts-ignore
      const request = await requestClient.createRequest(requestCreateParameters);

      setLoadingMessage('Waiting for confirmation...');
      const confirmedRequestData = await request.waitForConfirmation();

      console.log(confirmedRequestData.requestId);


      

      setLoadingMessage('Request created successfully!');
      onCreateRequest(amount, confirmedRequestData.requestId);

      setAmount('');
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
      setLoadingMessage('Error creating request. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Request</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>{loadingMessage}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateRequest} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}