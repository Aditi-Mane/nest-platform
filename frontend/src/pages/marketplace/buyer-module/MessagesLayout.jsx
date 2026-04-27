import { Outlet, useLocation } from "react-router-dom";
import BuyerMessages from "./BuyerMessages";

const MessagesLayout = () => {
  const location = useLocation();
  const isConversationRoute = /\/messages\/[^/]+$/.test(location.pathname);

  return (
    <div className="flex h-[calc(100svh-120px)] bg-background md:h-[calc(100vh-64px)]">
      
      {/* LEFT SIDEBAR */}
      <div
        className={`bg-card flex flex-col ${
          isConversationRoute ? "hidden md:flex md:w-[390px]" : "w-full md:w-[390px]"
        } md:border-r md:border-border`}
      >
        <BuyerMessages />
      </div>

      {/* RIGHT CHAT AREA */}
      <div
        className={`min-h-0 bg-background ${
          isConversationRoute ? "flex w-full flex-1 flex-col" : "hidden md:flex md:flex-1 md:flex-col"
        }`}
      >
        <Outlet />
      </div>

    </div>
  );
};

export default MessagesLayout;
