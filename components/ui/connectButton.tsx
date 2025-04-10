import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

const ConnectButton: React.FC = () => {
  const { login, logout, ready, user } = usePrivy();

  // Wagmi hooks
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  // If privy is not ready, show the loading spinner
  if (!ready) {
    return (
      <div className="flex justify-center items-center h-max">
        <Loader2 className="h-8 w-8 animate-spin text-red" />
      </div>
    );
  }

  // If user is logged in with Privy but not connected with Wagmi
  if (user && !isConnected) {
    return (
      <button
        className="flex items-center justify-center bg-red py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
        onClick={() => connect({ connector: injected() })}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <button
        className="flex items-center justify-center bg-red py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
        onClick={
          !user
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
