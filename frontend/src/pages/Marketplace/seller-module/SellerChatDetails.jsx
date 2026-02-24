// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ArrowLeft, Send, CheckCircle } from "lucide-react";

// const ChatDetails = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const themeColor = "#c05621";

//   if (!state) return <div>No Data</div>;

//   return (
//     <div
//       style={{
//         padding: "40px",
//         background: "#e8dccb",
//         minHeight: "100vh",
//         fontFamily: "Segoe UI, sans-serif",
//       }}
//     >
//       {/* Back */}
//       <div
//         onClick={() => navigate(-1)}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//           cursor: "pointer",
//           marginBottom: "20px",
//           color: "#3f5e4e",
//           fontWeight: 500,
//         }}
//       >
//         <ArrowLeft size={18} /> Back to Requests
//       </div>

//       {/* Product Info */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//           borderLeft: `5px solid ${themeColor}`,
//           marginBottom: "25px",
//         }}
//       >
//         <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//           <div
//             style={{
//               width: "90px",
//               height: "90px",
//               background: "#ddd2c2",
//               borderRadius: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "30px",
//               fontWeight: "bold",
//             }}
//           >
//             {state.product[0]}
//           </div>

//           <div>
//             <h2 style={{ margin: 0 }}>{state.product}</h2>
//             <p style={{ color: "#3f5e4e", marginTop: "8px" }}>
//               {state.buyer}
//             </p>
//             <h1 style={{ color: themeColor, marginTop: "10px" }}>
//               {state.price}
//             </h1>
//           </div>

//           <div style={{ marginLeft: "auto" }}>
//             <span
//               style={{
//                 background: "#e6f7ed",
//                 padding: "6px 14px",
//                 borderRadius: "20px",
//                 fontSize: "13px",
//                 color: "#15803d",
//               }}
//             >
//               Available
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Conversation */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//           marginBottom: "25px",
//         }}
//       >
//         <h3 style={{ marginBottom: "20px" }}>Conversation</h3>

//         <div
//           style={{
//             background: "#d8c9b6",
//             padding: "14px 18px",
//             borderRadius: "14px",
//             width: "fit-content",
//             marginBottom: "15px",
//           }}
//         >
//           {state.message}
//         </div>

//         <div
//           style={{
//             background: themeColor,
//             color: "white",
//             padding: "14px 18px",
//             borderRadius: "14px",
//             width: "fit-content",
//             marginLeft: "auto",
//             marginBottom: "15px",
//           }}
//         >
//           Thank you! Let’s finalize the deal.
//         </div>

//         {/* Input */}
//         <div
//           style={{
//             display: "flex",
//             marginTop: "20px",
//             gap: "10px",
//           }}
//         >
//           <input
//             placeholder="Type your message..."
//             style={{
//               flex: 1,
//               padding: "14px",
//               borderRadius: "14px",
//               border: "1px solid #ccc",
//               outline: "none",
//             }}
//           />
//           <button
//             style={{
//               background: themeColor,
//               border: "none",
//               padding: "12px",
//               borderRadius: "14px",
//               cursor: "pointer",
//               color: "white",
//             }}
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </div>

//       {/* Actions */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//         }}
//       >
//         <h3 style={{ marginBottom: "20px" }}>Actions</h3>

//         <div style={{ display: "flex", gap: "20px" }}>
//           <button
//             style={{
//               flex: 1,
//               background: themeColor,
//               color: "white",
//               padding: "15px",
//               borderRadius: "14px",
//               border: "none",
//               fontSize: "16px",
//               cursor: "pointer",
//             }}
//           >
//             <CheckCircle size={18} style={{ marginRight: "8px" }} />
//             Confirm Deal
//           </button>

//           <button
//             style={{
//               flex: 1,
//               background: "transparent",
//               border: "1px solid #c8a97e",
//               padding: "15px",
//               borderRadius: "14px",
//               fontSize: "16px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel Deal
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatDetails;

// import React from "react";
// import {
//   useLocation,
//   useNavigate,
//   useParams
// } from "react-router-dom";
// import { ArrowLeft, Send, CheckCircle } from "lucide-react";

// const SellerChatDetails = () => {
//   const { state } = useLocation();
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const themeColor = "#c05621";

//   const fallbackData = {
//     product: "Product",
//     buyer: "Buyer",
//     price: "$0.00",
//     message: "No message available",
//   };

//   const data = state || fallbackData;

//   return (
//     <div
//       style={{
//         padding: "40px",
//         background: "#e8dccb",
//         minHeight: "100vh",
//         fontFamily: "Segoe UI, sans-serif",
//       }}
//     >
//       {/* Back */}
//       <div
//         onClick={() => navigate(-1)}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//           cursor: "pointer",
//           marginBottom: "20px",
//           color: "#3f5e4e",
//           fontWeight: 500,
//         }}
//       >
//         <ArrowLeft size={18} /> Back to Requests
//       </div>

//       {/* Product Info */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//           borderLeft: `5px solid ${themeColor}`,
//           marginBottom: "25px",
//         }}
//       >
//         <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//           <div
//             style={{
//               width: "90px",
//               height: "90px",
//               background: "#ddd2c2",
//               borderRadius: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "30px",
//               fontWeight: "bold",
//             }}
//           >
//             {data.product?.[0]}
//           </div>

//           <div>
//             <h2 style={{ margin: 0 }}>{data.product}</h2>
//             <p style={{ color: "#3f5e4e", marginTop: "8px" }}>
//               {data.buyer}
//             </p>
//             <h1 style={{ color: themeColor, marginTop: "10px" }}>
//               {data.price}
//             </h1>
//           </div>

//           <div style={{ marginLeft: "auto" }}>
//             <span
//               style={{
//                 background: "#e6f7ed",
//                 padding: "6px 14px",
//                 borderRadius: "20px",
//                 fontSize: "13px",
//                 color: "#15803d",
//               }}
//             >
//               Available
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Conversation */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//           marginBottom: "25px",
//         }}
//       >
//         <h3 style={{ marginBottom: "20px" }}>Conversation</h3>

//         {/* Buyer Message */}
//         <div
//           style={{
//             background: "#d8c9b6",
//             padding: "14px 18px",
//             borderRadius: "14px",
//             width: "fit-content",
//             marginBottom: "15px",
//           }}
//         >
//           {data.message}
//         </div>

//         {/* Seller Reply */}
//         <div
//           style={{
//             background: themeColor,
//             color: "white",
//             padding: "14px 18px",
//             borderRadius: "14px",
//             width: "fit-content",
//             marginLeft: "auto",
//             marginBottom: "15px",
//           }}
//         >
//           Thank you! Let’s finalize the deal.
//         </div>

//         {/* Message Input */}
//         <div
//           style={{
//             display: "flex",
//             marginTop: "20px",
//             gap: "10px",
//           }}
//         >
//           <input
//             placeholder="Type your message..."
//             style={{
//               flex: 1,
//               padding: "14px",
//               borderRadius: "14px",
//               border: "1px solid #ccc",
//               outline: "none",
//             }}
//           />
//           <button
//             style={{
//               background: themeColor,
//               border: "none",
//               padding: "12px",
//               borderRadius: "14px",
//               cursor: "pointer",
//               color: "white",
//             }}
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </div>

//       {/* Actions */}
//       <div
//         style={{
//           background: "#f2eadf",
//           borderRadius: "18px",
//           padding: "25px",
//         }}
//       >
//         <h3 style={{ marginBottom: "20px" }}>Actions</h3>

//         <div style={{ display: "flex", gap: "20px" }}>
//           <button
//             style={{
//               flex: 1,
//               background: themeColor,
//               color: "white",
//               padding: "15px",
//               borderRadius: "14px",
//               border: "none",
//               fontSize: "16px",
//               cursor: "pointer",
//             }}
//           >
//             <CheckCircle size={18} style={{ marginRight: "8px" }} />
//             Confirm Deal
//           </button>

//           <button
//             style={{
//               flex: 1,
//               background: "transparent",
//               border: "1px solid #c8a97e",
//               padding: "15px",
//               borderRadius: "14px",
//               fontSize: "16px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel Deal
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SellerChatDetails;

import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

const SellerChatDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const themeColor = "#c05621";

  const fallbackData = {
    product: "Product",
    buyer: "Buyer",
    price: "$0.00",
    message: "No message available",
  };

  const data = state || fallbackData;

  // ✅ State for messages
  const [messages, setMessages] = useState([
    { text: data.message, sender: "buyer" },
    { text: "Thank you! Let’s finalize the deal.", sender: "seller" }
  ]);

  const [newMessage, setNewMessage] = useState("");

  // ✅ Send function
  const handleSend = () => {
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      { text: newMessage, sender: "seller" }
    ]);

    setNewMessage("");
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#e8dccb",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Back */}
      <div
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          color: "#3f5e4e",
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={18} /> Back to Requests
      </div>

      {/* Product Info */}
      <div
        style={{
          background: "#f2eadf",
          borderRadius: "18px",
          padding: "25px",
          borderLeft: `5px solid ${themeColor}`,
          marginBottom: "25px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              background: "#ddd2c2",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold",
            }}
          >
            {data.product?.[0]}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>{data.product}</h2>
            <p style={{ color: "#3f5e4e", marginTop: "8px" }}>
              {data.buyer}
            </p>
            <h1 style={{ color: themeColor, marginTop: "10px" }}>
              {data.price}
            </h1>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <span
              style={{
                background: "#e6f7ed",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#15803d",
              }}
            >
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div
        style={{
          background: "#f2eadf",
          borderRadius: "18px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Conversation</h3>

        {/* ✅ Dynamic Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              background:
                msg.sender === "seller" ? themeColor : "#d8c9b6",
              color: msg.sender === "seller" ? "white" : "black",
              padding: "14px 18px",
              borderRadius: "14px",
              width: "fit-content",
              marginLeft:
                msg.sender === "seller" ? "auto" : "0",
              marginBottom: "15px",
            }}
          >
            {msg.text}
          </div>
        ))}

        {/* Message Input */}
        <div
          style={{
            display: "flex",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: themeColor,
              border: "none",
              padding: "16px",
              borderRadius: "14px",
              cursor: "pointer",
              color: "white",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          background: "#f2eadf",
          borderRadius: "18px",
          padding: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Actions</h3>

        <div style={{ display: "flex", gap: "20px" }}>
          <button
            style={{
              flex: 1,
              background: themeColor,
              color: "white",
              padding: "12px",
              borderRadius: "14px",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={18} style={{ marginRight: "8px" }} />
            Confirm Deal
          </button>

          <button
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #c8a97e",
              padding: "12px",
              borderRadius: "14px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Cancel Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerChatDetails;