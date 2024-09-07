import React from 'react';
import { Button } from "@/components/ui/button"

interface RequestMessageProps {
  message: string;
  amount: string;
  isCurrentUser: boolean;
  onPay: (amount: string) => void;
}

const RequestMessage: React.FC<RequestMessageProps> = ({ message, amount, isCurrentUser, onPay }) => {
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
          onClick={() => onPay(amount)} 
          className="mt-2 bg-white text-blue-500 hover:bg-blue-100"
          size="sm"
        >
          Pay
        </Button>
      )}
    </div>
  );
};

export default RequestMessage;