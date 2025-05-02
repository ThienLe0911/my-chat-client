import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import socket from "../socket";
import { logout } from "../services/auth.service";
import SearchUser from "../components/SearchUser";

const ChatPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [emited, setEmited] = useState(false);

  useEffect(() => {
    if (user && !emited) {
      socket.emit("addUser", user._id);
      setEmited(true);
    }
  }, [user]);

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar selectedConversation={selectedConversation}  setSelectedConversation={setSelectedConversation} />
        <ChatWindow
          user={user}
          selectedConversation={selectedConversation}
        />
        
      </div>
    </>
  );
};

export default ChatPage;
