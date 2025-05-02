import { io } from 'socket.io-client';

const socket = io('http://localhost:5005'); // Đảm bảo đúng cổng backend bạn đang chạy

export default socket;
