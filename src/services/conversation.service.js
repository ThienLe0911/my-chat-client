import axios from "axios";
import * as routes from "../routes";

const getConversations = async () => {
  try {
    const res = await axios.get(routes.conversation, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

const getConversation = async (conversationId) => {
  try {
    const res = await axios.get(`${routes.conversation}/${conversationId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

const createConversation = async (
  receiverId,
  isGroup = false,
  groupName = ""
) => {
  try {
    const res = await axios.post(
      `${routes.conversation}/create`,
      {
        participants: [
          receiverId,
          JSON.parse(localStorage.getItem("user"))._id,
        ],
        isGroup: isGroup || false,
        groupName: groupName || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const createGroup = async (members) => {
  try {
    const participants = members.map((member) => member._id);
    const res = await axios.post(
      `${routes.conversation}/findOrCreate`,
      {
        participants: [
          ...participants,
          JSON.parse(localStorage.getItem("user"))._id,
        ],
        isGroup: true,
        groupName: "Group",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

export { getConversations, createConversation, createGroup, getConversation };
