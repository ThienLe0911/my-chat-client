import * as routes from "../routes";
import axios from "axios";
const login = async (email, password) => {
  try {
    const res = await axios.post(
      routes.login,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const signup = async (username, email, password) => {
  try {
    const res = await axios.post(
      routes.register,
      { username, email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const logout = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      routes.logout,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const getUsers = async (value) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      routes.users,
      { 'searchValue': value },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const getUsersToCreateGroup = async (value) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${routes.users}/users-to-create-group`,
      { 'searchValue': value },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

export { login, signup, logout, getUsers,getUsersToCreateGroup };
