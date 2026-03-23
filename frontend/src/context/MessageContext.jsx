import { createContext, useContext, useState } from "react";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);

  return (
    <MessageContext.Provider value={{ totalUnread, setTotalUnread }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);