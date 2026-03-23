import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { UserProvider }  from "./context/UserContext.jsx";
import { MessageProvider } from './context/MessageContext.jsx';
import App from './App'
import './index.css'
console.log(UserProvider);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
       <MessageProvider>
        <App />
       </MessageProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
