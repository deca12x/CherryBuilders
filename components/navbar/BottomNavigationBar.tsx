"use client";
import { MessageCircle, Handshake, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

// These are the paths where the bottom navigation bar should be hidden
const hiddenPaths = ["/", "/verify/event", "/verify"];

const BottomNavigationBar = () => {
  const Router = useRouter();
  const pathname = usePathname();

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed z-50 bottom-0 left-0 right-0 bg-card shadow-lg">
      <div className="flex justify-around items-center py-2">
        <button
          onClick={() => {
            Router.push("/chat");
          }}
          className="flex justify-center items-center p-2 text-muted-foreground hover:text-primary transition-colors gap-3"
          aria-label="Messages"
        >
          <MessageCircle size={24} />
          <span className="hidden sm:flex">Messages</span>
        </button>
        <button
          onClick={() => {
            Router.push("/matching");
          }}
          className="flex justify-center items-center p-2 text-muted-foreground hover:text-primary transition-colors gap-3"
          aria-label="Find People"
        >
          <Handshake size={25} />
          <span className="hidden sm:flex">Find People</span>
        </button>
        <button
          onClick={() => {
            Router.push(`/profile`);
          }}
          className="flex justify-center items-center p-2 text-muted-foreground hover:text-primary transition-colors gap-3"
          aria-label="Your profile"
        >
          <User size={24} />
          <span className="hidden sm:flex">Your profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
