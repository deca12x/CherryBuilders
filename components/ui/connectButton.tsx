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

  // Determine the button text and action based on user state
  let buttonText = "Log in";
  let buttonAction = login;

  if (user) {
    // User is logged in with Privy
    if (!isConnected) {
      // But wallet is not connected
      buttonText = "Connect Wallet";
      buttonAction = () => connect({ connector: injected() });

      // Check if we're on the profile page and need to allow logout
      const isProfilePage =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/profile");

      if (isProfilePage) {
        buttonText = "Log out";
        buttonAction = logout;
      }
    } else {
      // User is logged in and wallet is connected
      buttonText = "Log out";
      buttonAction = () => {
        disconnect();
        logout();
      };
    }
  }

  return (
    <div>
      <button
        className="flex items-center justify-center bg-red py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
        onClick={buttonAction}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ConnectButton;
