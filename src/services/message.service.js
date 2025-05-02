   import axios from "axios";
import * as routes from "../routes";

const token = localStorage.getItem("token");
const sendMessage = async (content) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${routes.message}`,
      content,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const getMessagesByConversation = async (conversationId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `http://localhost:5005/api/messages/${conversationId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const markMessagesAsSeen = async (messageIds) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.put(
      `${routes.message}/seen`,
      { messageIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};


export { sendMessage, getMessagesByConversation, markMessagesAsSeen };
