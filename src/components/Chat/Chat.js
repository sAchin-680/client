import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";

import "./Chat.css";

import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";

const ENDPOINT = "http://localhost:5000";

const Chat = () => {
  // const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const socket = useRef(null); // Keeps socket instance across renders

  // Handle joining room and socket initialization
  useEffect(() => {
    const { name: userName, room: roomName } = queryString.parse(
      location.search
    );

    socket.current = io(ENDPOINT);
    // setName(userName);
    setRoom(roomName);

    socket.current.emit("join", { name: userName, room: roomName }, () => {
      console.log(`${userName} joined room: ${roomName}`);
    });

    // Handle socket connection errors
    socket.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    return () => {
      socket.current.emit("disconnect");
      socket.current.off();
    };
  }, [location.search]);

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.current.on("message", handleMessage);

    return () => {
      socket.current.off("message", handleMessage);
    };
  }, []);

  // Handle message sending
  const sendMessage = (event) => {
    event.preventDefault();
    if (message.trim()) {
      socket.current.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
