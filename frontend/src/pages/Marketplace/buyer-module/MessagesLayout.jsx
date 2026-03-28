import { Outlet } from "react-router-dom";
import BuyerMessages from "./BuyerMessages";

const MessagesLayout = () => {
  return (
    <div className="h-[calc(100vh-64px)] flex bg-background">
      
      {/* LEFT SIDEBAR */}
      <div className="w-[390px] border-r border-border bg-card flex flex-col">
        <BuyerMessages />
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-background">
        <Outlet />
      </div>

    </div>
  );
};

export default MessagesLayout;