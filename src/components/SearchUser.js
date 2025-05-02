import React, { useEffect, useState } from "react";

function SearchUser() {
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    //apply debounce
    const timer = setTimeout(() => {
      setSearchValue(searchValue);
    }, 1000);
    return () => clearTimeout(timer);
  });
  useEffect(() => {
    if (!searchValue) return;
  }, [searchValue]);
  return (
    <div className="flex flex-col items-center bg-blue-50 border-b border-blue-200">
      <div className="w-1/2  bg-blue-50 p-4 overflow-y-auto">
        <div className="flex gap-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Tìm kiếm người dùng
          </h2>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng"
            className="w-full p-2 border border-blue-300 rounded"
          />
        </div>
        <ul className="mt-4 flex">
          <li className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800">
            <div className="flex items-center">
              <img
                src="https://example.com/avatar.jpg"
                alt="Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-semibold">Tên người dùng</span>
            </div>
          </li>
          <li className="p-2 hover:bg-blue-100 rounded cursor-pointer text-blue-800">
            <div className="flex items-center">
              <img
                src="https://example.com/avatar.jpg"
                alt="Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-semibold">Tên người dùng</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SearchUser;
