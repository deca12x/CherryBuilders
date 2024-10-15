import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RequestNetwork } from "@requestnetwork/request-client.js";
import { approveErc20, hasErc20Approval, hasSufficientFunds, payRequest } from "@requestnetwork/payment-processor";
import { useAccount, useWalletClient } from "wagmi";
import { Types, Utils } from "@requestnetwork/request-client.js";
import { walletClientToSigner } from "@/utils/request/wallet-utils";
import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RequestMessageProps {
  message: string;
  amount: string;
  isCurrentUser: boolean;
  onPay: (amount: string) => void;
  requestId: string;
  hasBeenPaid?: boolean;
}

enum APP_STATUS {
  AWAITING_INPUT = "awaiting input",
  REQUEST_CONFIRMED = "request confirmed",
  APPROVING = "approving",
  APPROVED = "approved",
  PAYING = "paying",
  REQUEST_PAID = "request paid",
  ERROR_OCCURRED = "error occurred",
}

const RequestMessage: React.FC<RequestMessageProps> = ({
  message,
  amount,
  isCurrentUser,
  onPay,
  requestId,
  hasBeenPaid,
}) => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [status, setStatus] = useState<APP_STATUS>(APP_STATUS.AWAITING_INPUT);
  const [requestData, setRequestData] = useState<Types.IRequestDataWithEvents | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setStatus(APP_STATUS.AWAITING_INPUT);
        const requestClient = new RequestNetwork({
          nodeConnectionConfig: {
            baseURL: "https://sepolia.gateway.request.network",
          },
        });

        const _request = await requestClient.fromRequestId(requestId);
        const _requestData = _request.getData();
        setRequestData(_requestData);
        setStatus(APP_STATUS.REQUEST_CONFIRMED);
      } catch (err) {
        console.error("Error fetching request data:", err);
        setError("Failed to fetch request data. Please try again.");
        setStatus(APP_STATUS.ERROR_OCCURRED);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch request data. Please try again.",
        });
      }
    };

    fetchRequestData();
  }, [requestId, toast]);

  const approve = async (): Promise<boolean> => {
    if (!requestData || !walletClient) return false;

    try {
      setStatus(APP_STATUS.APPROVING);
      toast({
        title: "Approval Initiated",
        description: "Please confirm the approval transaction in your wallet.",
      });
      const _request = await new RequestNetwork({
        nodeConnectionConfig: { baseURL: "https://sepolia.gateway.request.network/" },
      }).fromRequestId(requestData.requestId);

      const _requestData = _request.getData();

      if (getPaymentNetworkExtension(_requestData)?.id === Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT) {
        const approvalTx = await approveErc20(_requestData, walletClientToSigner(walletClient));
        toast({
          title: "Approval Submitted",
          description: "Waiting for confirmation...",
        });
        await approvalTx.wait(2);
      }

      setStatus(APP_STATUS.APPROVED);
      toast({
        title: "Approval Confirmed",
        description: "Your approval has been confirmed on the blockchain.",
      });
      return true;
    } catch (err) {
      console.error("Error in approve:", err);
      setError("Approval failed. Please try again.");
      setStatus(APP_STATUS.ERROR_OCCURRED);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "There was an error during the approval process. Please try again.",
      });
      return false;
    }
  };

  const payTheRequest = async (): Promise<boolean> => {
    if (!requestData || !walletClient) return false;

    try {
      setStatus(APP_STATUS.PAYING);
      toast({
        title: "Payment Initiated",
        description: "Please confirm the payment transaction in your wallet.",
      });

      const _request = await new RequestNetwork({
        nodeConnectionConfig: { baseURL: "https://sepolia.gateway.request.network/" },
      }).fromRequestId(requestData.requestId);

      let _requestData = _request.getData();
      const paymentTx = await payRequest(_requestData, walletClientToSigner(walletClient));
      toast({
        title: "Payment Submitted",
        description: "Waiting for confirmation...",
      });
      await paymentTx.wait(2);

      toast({
        title: "Payment Confirmed",
        description: "Your payment has been confirmed. Updating request status...",
      });
      while (_requestData.balance?.balance! < _requestData.expectedAmount) {
        _requestData = await _request.refresh();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setRequestData(_requestData);
      setStatus(APP_STATUS.REQUEST_PAID);
      onPay(amount);

      // Update Supabase
      const { data, error } = await supabase.from("messages").update({ paid: true }).eq("requestId", requestId);

      if (error) {
        console.error("Error updating Supabase:", error);
        toast({
          variant: "destructive",
          title: "Database Update Failed",
          description: "Payment was successful, but we couldn't update the database. Please contact support.",
        });
      } else {
        toast({
          title: "Payment Completed",
          description: "Your payment has been successfully processed and recorded.",
        });
      }

      return true;
    } catch (err) {
      console.error("Error in payTheRequest:", err);
      setError("Payment failed. Please try again.");
      setStatus(APP_STATUS.ERROR_OCCURRED);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      });
      return false;
    }
  };

  const handlePayAndApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const isApproved = await approve();
      if (isApproved) {
        await payTheRequest();
      }
    } catch (err) {
      console.error("Error in handlePayAndApprove:", err);
      setError("An unexpected error occurred. Please try again.");
      setStatus(APP_STATUS.ERROR_OCCURRED);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
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
        return "Retry";
      default:
        return "Approve & Pay";
    }
  };

  return (
    <div
      className={`rounded-lg p-3 max-w-xs flex flex-col items-start ${
        isCurrentUser
          ? "bg-gradient-to-r from-green-500 to-green-700 text-white"
          : "bg-gradient-to-r from-green-400 to-green-800 text-white"
      }`}
    >
      <p className="font-semibold">{message}</p>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {!isCurrentUser &&
        (hasBeenPaid ? (
          <Button className="mt-2 bg-green-500 text-white hover:bg-green-600" size="sm" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            Paid {amount}
          </Button>
        ) : (
          <Button
            onClick={handlePayAndApprove}
            className="mt-2 bg-white text-blue-500 hover:bg-blue-100"
            size="sm"
            disabled={status === APP_STATUS.APPROVING || status === APP_STATUS.PAYING}
          >
            {getButtonText()}
          </Button>
        ))}
    </div>
  );
};

export default RequestMessage;
