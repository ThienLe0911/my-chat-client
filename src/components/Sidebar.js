import React, { useEffect, useState } from "react";
import * as services from "../services/index.service";
import socket from "../socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ setSelectedConversation, selectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [mode, setMode] = useState("conversations");

  const [searchValue, setSearchValue] = useState("");
  const [searchResultConversation, setSearchResultConversation] = useState([]);
  const [searchResultNewUser, setSearchResultNewUser] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await services.conversationService.getConversations();
        setConversations(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, [mode]);

  useEffect(() => {
    if (!searchValue) return;
    const fetchSearch = async () => {
      try {
        const res = await services.authService.getUsers(searchValue);
        setSearchResultNewUser(res.newUsers);
        setSearchResultConversation(res.conversations);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSearchToAddGroup = async () => {
      try {
        const res = await services.authService.getUsersToCreateGroup(
          searchValue
        );
        setSearchResultNewUser(res.newUsers);
        setSearchResultConversation(res.conversations);
      } catch (error) {
        console.log(error);
      }
    };

    const timer = setTimeout(() => {
      if (mode === "newGroup") fetchSearchToAddGroup();
      else fetchSearch();
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleLogout = async () => {
    try {
      const res = await services.authService.logout();
      if (res.msg == "Đăng xuất thành công") {
        socket.disconnect();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const createNewConversation = async (id) => {
    try {
      const res = await services.conversationService.createConversation(
        id,
        false,
        ""
      );
      setSelectedConversation(res);
      setMode("conversations");
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewGroup = async () => {
    if (mode === "newGroup") {
      setGroupMembers([]);
      setSearchValue("");
      setMode("conversations");
      setSearchResultNewUser([]);
      setSearchResultConversation([]);
    } else {
      setMode("newGroup");
    }
  };
  const handleAddMembers = (item) => {
    let members = groupMembers;
    // check if item._id is match with item._id in members
    if (members.some((member) => member._id === item._id)) {
      members = members.filter((member) => member._id !== item._id);
    } else {
      members = [...members, item];
    }

    setGroupMembers(members);
  };

  const handleRemoveMember = (item) => {
    let members = groupMembers;
    members = members.filter((member) => member._id !== item._id);
    setGroupMembers(members);
  };
  const handleCreateGroup = async () => {
    try {
      const res = await services.conversationService.createGroup(
        groupMembers,
        true,
        "Group"
      );
      setSelectedConversation(res._id);
      setMode("conversations");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="w-1/3 md:w-1/4 bg-blue-50 border-r border-blue-200 p-4 overflow-y-auto max-h-[100vh] flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold  text-blue-700">
            Cuộc trò chuyện
          </h2>
          <div className="flex gap-2 items-center">
            <button
              className="bg-blue-500 text-white px-2 rounded "
              onClick={() => handleCreateNewGroup()}
            >
              <FontAwesomeIcon
                className="font-semibold text-sm"
                icon={faUserFriends}
              ></FontAwesomeIcon>
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full p-2 border border-blue-300 rounded"
            onFocus={() => mode === "conversations" && setMode("search")}
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
          ></input>
          {mode === "search" && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setMode("conversations");
                setSearchValue("");
                setSearchResultConversation([]);
                setSearchResultNewUser([]);
              }}
            >
              Đóng
            </button>
          )}
        </div>

        {mode == "search" ? (
          <div className="flex flex-col">
            <div className="flex-1 h-[50%] basis-[50%] p-4 overflow-y-auto">
              {searchResultConversation.length > 0 && (
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  Cuộc trò chuyện
                </h2>
              )}
              <ul className="">
                {searchResultConversation.map((item, i) => (
                  <li
                    key={item._id}
                    className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                  >
                    {item.isGroup ? (
                      // Group conversation (show )
                      <div className="flex items-center">
                        <img
                          src={item.groupAvatar}
                          alt={item.groupName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span>{item.groupName}</span>
                      </div>
                    ) : (
                      // show name of user
                      <div className="flex items-center">
                        <span>
                          {
                            item.participants.find((p) => p._id !== user._id)
                              .username
                          }
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 basis-[50%] p-4 overflow-y-auto">
              {searchResultNewUser.length > 0 && (
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  Có thể bạn sẽ quen
                </h2>
              )}
              <ul className="">
                {searchResultNewUser.map((item, i) => (
                  <li
                    onClick={() => createNewConversation(item._id)}
                    key={item._id}
                    className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                  >
                    <div className="flex items-center">
                      <span>{item.username}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : mode === "conversations" ? (
          <ul>
            {conversations.map((item, i) => (
              <li
                key={item._id}
                className={(item._id===selectedConversation ? 'bg-blue-100 ':' ') +  ` p-2 mt-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800`}
              >
                {item.isGroup ? (
                  // Group conversation (show )
                  <div
                    onClick={() => handleSelectConversation(item._id)}
                    className='flex items-center'
                  >
                    <img
                      src={item.groupAvatar}
                      alt={item.groupName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{item.groupName}</span>
                  </div>
                ) : (
                  // show name of user
                  <div
                    onClick={() => handleSelectConversation(item._id)}
                    className="flex items-center"
                  >
                    <span>
                      {
                        item.participants.find((p) => p._id !== user._id)
                          .username
                      }
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : mode == "newGroup" ? (
          <div className="flex flex-col">
            <div className="flex-1 h-[50%] basis-[50%] p-4 overflow-y-auto border-b border-blue-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">
                Thành viên
              </h2>
              <ul className="">
                {groupMembers.map((item, i) => (
                  <li
                    key={item._id}
                    className="p-2 rounded cursor-pointer text-blue-800"
                  >
                    {/* // show name of user */}
                    <div
                      // onClick={() => handleSelectConversation(item._id)}
                      className="flex items-center justify-between"
                    >
                      <span>{item.username}</span>
                      <button
                        onClick={() => handleRemoveMember(item)}
                        className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {groupMembers.length > 1 && (
                <button
                  onClick={() => handleCreateGroup()}
                  className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                >
                  Tạo nhóm
                </button>
              )}
            </div>
            <div className="flex-1 basis-[50%] p-4 overflow-y-auto">
              {searchResultConversation.length > 0 && (
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  Người dùng
                </h2>
              )}
              <ul className="">
                {searchResultConversation.map((item, i) => (
                  <li
                    key={item._id}
                    onClick={() => handleAddMembers(item)}
                    className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                  >
                    {item.isGroup ? (
                      // Group conversation (show )
                      <div className="flex items-center">
                        <img
                          src={item.groupAvatar}
                          alt={item.groupName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span>{item.groupName}</span>
                      </div>
                    ) : (
                      // show name of user
                      <div className="flex items-center">
                        <span>
                          {/* {
                            item.participants.find((p) => p._id !== user._id)
                              .username
                          } */}
                          {item.username}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 basis-[50%] p-4 overflow-y-auto">
              {searchResultNewUser.length > 0 && (
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  Có thể bạn sẽ quen
                </h2>
              )}
              <ul className="">
                {searchResultNewUser.map((item, i) => (
                  <li
                    onClick={() => {
                      handleAddMembers(item);
                    }}
                    key={item._id}
                    className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800"
                  >
                    <div className="flex items-center">
                      <span>{item.username}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <button
        onClick={() => handleLogout()}
        className=" text-lg text-red-500 hover:underline cursor-pointer z-10 p-4 bg-white rounded"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Sidebar;
