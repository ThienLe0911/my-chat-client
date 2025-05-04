import { io } from 'socket.io-client';

const socket = io("https://my-chat-server-59hl.onrender.com", {
    transports: ["websocket"], // tránh polling bị lỗi
    secure: true,
    rejectUnauthorized: false
  });

export default socket;
