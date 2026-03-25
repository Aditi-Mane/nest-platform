import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { UserProvider }  from "./context/UserContext.jsx";
import { MessageProvider } from './context/MessageContext.jsx';
import { SocketProvider } from "@/context/SocketContext";


<SocketProvider>
  <MessageProvider>
    <App />
  </MessageProvider>
</SocketProvider>
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
      <SocketProvider>
        <MessageProvider>
          <App />
        </MessageProvider>
      </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
