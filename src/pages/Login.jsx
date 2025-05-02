import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      if (res.msg === "Đăng nhập thành công") {
        const { token, user } = res;
        localStorage.setItem("token", token);
        setUser(user); // cập nhật context/state
        navigate("/"); // điều hướng về trang chính
      } else {
        alert(res.msg);
      }
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Đăng nhập</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border px-3 py-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Đăng nhập
        </button>
        <p className="mt-4 text-center">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-blue-500 hover:underline"
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
