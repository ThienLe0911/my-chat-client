import { io } from 'socket.io-client';

const socket = io('https://my-chat-server-59hl.onrender.com/'); // Đảm bảo đúng cổng backend bạn đang chạy

export default socket;
