// const hostname = 'http://localhost:5005';
const hostname = 'https://my-chat-server-59hl.onrender.com';

const login = `${hostname}/api/auth/login`;
const register = `${hostname}/api/auth/register`;
const logout = `${hostname}/api/auth/logout`;
const users = `${hostname}/api/auth/users`;
const message = `${hostname}/api/messages`;
const conversation = `${hostname}/api/conversations`;

export { login, register, logout, users, message, conversation };