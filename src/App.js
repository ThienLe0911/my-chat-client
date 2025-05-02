import React, { useEffect, useState } from "react";
import ChatPage from "./pages/ChatPage";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {jwtDecode} from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu đã có token thì có thể gọi API để lấy lại thông tin user
    const token = localStorage.getItem("token");
    if (token) {
      // Giả lập gọi API (hoặc decode token nếu bạn dùng JWT)
      try {
        const decodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decodedToken.exp < now) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          const savedUser = JSON.parse(localStorage.getItem("user"));
          if (savedUser) setUser(savedUser);
        }
      } catch (error) {
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              setUser={(user) => {
                setUser(user);
                localStorage.setItem("user", JSON.stringify(user));
              }}
            />
          }
        />
        <Route
          path="/"
          element={user ? <ChatPage user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
