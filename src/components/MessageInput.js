import React, { useState } from "react";
import socket from "../socket";
import * as services from "../services/index.service";

const MessageInput = ({
  selectedConversation,
  user,
  setMessages,
  messages,
}) => {
  const [message, setMessage] = useState("");
  const handleSend = async () => {
    if (!message.trim()) return;
    const tempId = `${Date.now()}-${Math.random()}`;

    const messagePayload = {
      sender: user,
      // receiver: selectedConversation,
      content: message,
      conversation: selectedConversation,
      status: "sending",
      id: tempId,
    };

    setMessages((prev) => [...prev, messagePayload]);
    setMessage("");

    try {
      const res = await services.messageService.sendMessage(messagePayload);
      if (res.msg === "Success") {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? {
                  ...res.data,
                  status: "sent",
                  id: tempId, // giữ lại id để không mất reference
                }
              : item
          )
        );
        socket.emit("sendMessage", res.data); // Emit to socket
      } else {
        throw new Error(res.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="p-4 border-t border-blue-200 bg-white">
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          //   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 border border-blue-300 rounded-full focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => handleSend()}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
