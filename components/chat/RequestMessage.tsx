import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { RequestNetwork } from '@requestnetwork/request-client.js';
import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from "@requestnetwork/payment-processor";
import { useWalletClient } from 'wagmi';
import {
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { walletClientToSigner } from '@/utils/request/wallet-utils';

interface RequestMessageProps {
  message: string;
  amount: string;
  isCurrentUser: boolean;
  onPay: (amount: string) => void;
  requestId: string;
}

enum APP_STATUS {
  AWAITING_INPUT = "awaiting input",
  SUBMITTING = "submitting",
  PERSISTING_TO_IPFS = "persisting to ipfs",
  PERSISTING_ON_CHAIN = "persisting on-chain",
  REQUEST_CONFIRMED = "request confirmed",
  APPROVING = "approving",
  APPROVED = "approved",
  PAYING = "paying",
  REQUEST_PAID = "request paid",
  ERROR_OCCURRED = "error occurred",
}

const RequestMessage: React.FC<RequestMessageProps> = ({ message, amount, isCurrentUser, onPay, requestId }) => {
  const { data: walletClient } = useWalletClient()
  const [status, setStatus] = useState(APP_STATUS.AWAITING_INPUT);
  const [requestData, setRequestData] = useState<Types.IRequestDataWithEvents>();


  useEffect(() => {
    const fetchRequestData = async () => {
      try {
          const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: 'https://sepolia.gateway.request.network',
    },
  });

        console.log(requestId)
        const _request = await requestClient.fromRequestId(requestId);
        console.log('_request', _request)
        console.log(_request)
        const _requestData = _request.getData();
        setRequestData(_requestData);
      } catch (err) {
        console.error("Error fetching request data:", err);
        setStatus(APP_STATUS.ERROR_OCCURRED);
      }
    };

    fetchRequestData();
  }, [requestId]);

  const handlePayAndApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!requestData || !walletClient) return;

    try {
      // Check if approval is needed
      const needsApproval = !(await hasErc20Approval(requestData, walletClientToSigner(walletClient)));


        setStatus(APP_STATUS.APPROVING);
        const approvalTx = await approveErc20(requestData, walletClientToSigner(walletClient));
        await approvalTx.wait(2);
        setStatus(APP_STATUS.APPROVED);
    

      // Proceed with payment
      setStatus(APP_STATUS.PAYING);
      const paymentTx = await payRequest(requestData, walletClientToSigner(walletClient));
      await paymentTx.wait(2);

      // Poll for balance update
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: 'https://sepolia.gateway.request.network',
        },
      });
    
      const _request = await requestClient.fromRequestId(requestId);
      let _requestData = _request.getData();
      while (_requestData.balance?.balance! < _requestData.expectedAmount) {
        _requestData = await _request.refresh();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setRequestData(_requestData);
      setStatus(APP_STATUS.REQUEST_PAID);
      onPay(amount);
    } catch (err) {
      console.log(err)
      setStatus(APP_STATUS.ERROR_OCCURRED);
    }
  };

  const getButtonText = () => {
    switch (status) {
      case APP_STATUS.APPROVING:
        return "Approving...";
      case APP_STATUS.PAYING:
        return "Paying...";
      case APP_STATUS.REQUEST_PAID:
        return "Paid";
      case APP_STATUS.ERROR_OCCURRED:
        return "Error";
      default:
        return "Pay & Approve";
    }
  };

  return (
    <div
      className={`rounded-lg p-3 max-w-xs flex flex-col items-start ${
        isCurrentUser
          ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
          : 'bg-gradient-to-r from-green-400 to-green-800 text-white'
      }`}
    >
      <p className="font-semibold">{message}</p>
      {!isCurrentUser && (
        <Button
          onClick={handlePayAndApprove}
          className="mt-2 bg-white text-blue-500 hover:bg-blue-100"
          size="sm"
          disabled={status === APP_STATUS.APPROVING || status === APP_STATUS.PAYING || status === APP_STATUS.REQUEST_PAID}
        >
          {getButtonText()}
        </Button>
      )}
    </div>
  );
};

export default RequestMessage;