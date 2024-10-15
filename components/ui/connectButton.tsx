import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";

const ConnectButton: React.FC = () => {
  const { login, logout, ready, user } = usePrivy();

  // Wagmi hooks
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // If privy is not ready or if privy is ready but wallet is is not connected to wagmi
  // show the loading spinner
  if (!ready || (user && !isConnected)) {
    return (
      <div className="flex justify-center items-center h-max">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <button
        className="flex items-center justify-center bg-primary py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
        onClick={
          !user && !isConnected
            ? login
            : () => {
                disconnect();
                logout();
              }
        }
      >
        {!user ? "Log in" : "Log out"}
      </button>
    </div>
  );
};

export default ConnectButton;
