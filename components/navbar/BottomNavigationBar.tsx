import { MessageCircle, Cog, User } from "lucide-react";
import { useRouter } from "next/navigation";

const BottomNavigationBar = () => {
  const Router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card shadow-lg">
      <div className="flex justify-around items-center py-2">
        <button
          onClick={() => {
            Router.push("/chat-example/83a9f840-4d74-4397-bab2-0de1e47984c0");
          }}
          className="flex justify-center items-center p-2 text-muted-foreground hover:text-primary transition-colors gap-3"
          aria-label="Messages"
        >
          <MessageCircle size={24} />
          <span className="hidden sm:flex">Messages</span>
        </button>
        <button
          onClick={() => {
            Router.push("/");
          }}
          className="flex justify-center items-center p-2 text-muted-foreground hover:text-primary transition-colors gap-3"
          aria-label="Find People"
        >
          <Cog size={25} />
          <span className="hidden sm:flex">Find People</span>
        </button>
        <button
          onClick={() => {
            Router.push("/chat-example/83a9f840-4d74-4397-bab2-0de1e47984c0");
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
