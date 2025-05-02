import React, { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import axios from "axios";
import socket from "../socket";
import * as services from "../services/index.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEye } from "@fortawesome/free-solid-svg-icons";
import peerManager from "../peerManager";

const ChatWindow = ({ user, selectedConversation }) => {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  // State để lưu pending call
  const [incomingCall, setIncomingCall] = useState(null);
  const [status, setStatus] = useState("");
  // const [peer, setPeer] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const fetchConversation = async () => {
    try {
      const res = await services.conversationService.getConversation(
        selectedConversation
      );
      setConversation(res);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    peerManager.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // 🔌 Gửi mỗi ICE candidate khi tạo ra
    peerManager.onIceCandidate = (candidate) => {
      if (!selectedConversation || !candidate) return;
      socket.emit("iceCandidate", {
        candidate,
        conversationId: selectedConversation,
      });
    };
    console.log("localVideoRef", localVideoRef.current?.srcObject);
    console.log("remoteVideoRef", remoteVideoRef.current?.srcObject);
    return () => {
      peerManager.close();
    };
  }, [selectedConversation]);
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await services.messageService.getMessagesByConversation(
          selectedConversation
        );
        setMessages(res.messages);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    fetchConversation();
  }, [selectedConversation]);
  useEffect(() => {
    if (!selectedConversation) return;
    socket.on("receiveMessage", (msg) => {
      if (msg.conversation === selectedConversation) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socket.on("messagesSeen", (data) => {
      if (data.conversationId === selectedConversation) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id) ? { ...msg, status: "seen" } : msg
          )
        );
      }
    });
    socket.on("videoCall", async ({ offer, conversationId }) => {
      // Người nhận video call
      if (conversationId !== selectedConversation) return;
      // Lưu offer vào state chờ người dùng xác nhận
      setIncomingCall({ offer, conversationId });
    });

    socket.on("answerCall", async ({ answer, conversationId }) => {
      if (conversationId !== selectedConversation) return;
      await peerManager.receiveSDP(answer);
      setStatus("calling");
    });

    socket.on("iceCandidate", async ({ candidate, conversationId }) => {
      if (conversationId !== selectedConversation) return;
      await peerManager.addIceCandidate(candidate);
    });

    socket.on("closeVideoCall", async ({ conversationId }) => {
      if (conversationId !== selectedConversation) return;
      await peerManager.close();
      setStatus("");
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messagesSeen");
      socket.off("videoCall");
      socket.off("answerCall");
      socket.off("closeVideoCall");
      socket.off("iceCandidate");
      peerManager.close();
    };
  }, [selectedConversation]);

  useEffect(() => {
    const updateSeenStatus = async () => {
      // Lọc tin nhắn từ người khác chưa seen
      const unseenMessages = messages.filter(
        (msg) =>
          msg.sender._id !== user._id &&
          msg.sender !== user._id &&
          msg.status !== "seen"
      );

      if (unseenMessages.length > 0) {
        try {
          const messageIds = unseenMessages.map((msg) => msg._id);

          await services.messageService.markMessagesAsSeen(messageIds);

          // Cập nhật local UI
          setMessages((prev) =>
            prev.map((msg) =>
              messageIds.includes(msg._id) ? { ...msg, status: "seen" } : msg
            )
          );

          // Thông báo cho A là tin đã seen
          socket.emit("messagesSeen", {
            messageIds,
            conversationId: selectedConversation,
            seenBy: user._id,
          });
        } catch (err) {
          console.error("Lỗi khi đánh dấu seen:", err);
        }
      }
    };

    if (selectedConversation) {
      updateSeenStatus();
    }
  }, [messages, selectedConversation]);

  const handleVideoCall = async () => {
    setStatus("calling");
    const stream = await peerManager.initLocalStream();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    const { sdp } = await peerManager.call(true);
    socket.emit("videoCall", {
      offer: sdp,
      conversationId: selectedConversation,
    });
    
  };

  const handleCloseVideoCall = async () => {
    await peerManager.close();
    socket.emit("closeVideoCall", {
      conversationId: selectedConversation,
    });
    setStatus("");
  };

  const handleAcceptCall = async () => {
    setStatus("calling");
    if (!incomingCall) return;

    const { offer, conversationId } = incomingCall;

    const { sdp } = await peerManager.call(false, offer);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = peerManager.localStream;
    }

    socket.emit("answerCall", {
      answer: sdp,
      conversationId,
    });

    // Xoá pending call sau khi xử lý
    setIncomingCall(null);

  };

  return (
    <div className="flex flex-col w-2/3 md:w-3/4 h-full bg-white">
      {/* Conversation infomation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="https://example.com/avatar.jpg"
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-2 border border-gray-300"
            />
            <div>
              {conversation &&
                conversation.participants.map((participant) => {
                  if (participant._id !== user._id) {
                    return (
                      <p
                        key={participant._id}
                        className="text-lg font-semibold"
                      >
                        {participant.username}
                      </p>
                    );
                  }
                })}
            </div>
          </div>

          {/* Chat actions(Call audio, video and change infomation) */}
          <div className="flex items-center gap-2">
            {/* call audio button with icon phone*/}
            <button className="p-2 rounded-full hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>
            {/* call video */}
            <button
              onClick={() => handleVideoCall()}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={
              "mb-2" +
              (msg.sender._id === user._id
                ? " text-right"
                : msg.id
                ? " text-right"
                : "")
            }
          >
            <p className="text-sm text-gray-700 font-semibold">
              {msg.sender.username}
            </p>
            <div className="bg-blue-500 text-white p-2 rounded-md inline-block">
              {msg.content}
            </div>
            <p className="text-xs text-gray-500">
              {msg.status}
              {msg.status === "sent" ? (
                <FontAwesomeIcon icon={faPaperPlane} />
              ) : msg.status == "seen" ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                ""
              )}
            </p>
          </div>
        ))}
      </div>
      <MessageInput
        user={user}
        selectedConversation={selectedConversation}
        setMessages={setMessages}
        messages={messages}
      />
      {/* {openVideoCall && (
      )} */}
      { status== "calling" && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-4 rounded-xl shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">Cuộc gọi video</h2>

          <div className="flex flex-col gap-4 w-full items-center">
            <div className="text-sm text-gray-700">Camera của bạn</div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              width="300"
              className="rounded shadow"
            />

            <div className="text-sm text-gray-700 mt-2">Camera đối phương</div>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              width="300"
              className="rounded shadow"
            />
          </div>

          <div className="mt-4 flex gap-3">

            {incomingCall && (
              <button
                onClick={()=>handleAcceptCall()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Chấp nhận cuộc gọi
              </button>
            )}

            <button
              onClick={()=>handleCloseVideoCall()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Kết thúc
            </button>
          </div>
        </div>
      )}

      {/* Pop up to accept video call or not */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold mb-4">Accept video call</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
              onClick={() => handleAcceptCall()}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={() => handleCloseVideoCall()}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
