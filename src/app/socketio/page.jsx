"use client";

import { socket } from "@/socket";
import { useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
      intiMessages();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function intiMessages(data) {
      console.log("emit init", data);
      setMessages(data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("initial emit messages", intiMessages);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("initial emit messages");
    };
  }, []);

  function sendMessage(e) {
    e.preventDefault();
    socket.emit("new message", newMessage);
    console.log("🔺 emit new message:", newMessage);
    setNewMessage("");
  }

  useEffect(() => {
    socket.on("new message", (data) => {
      console.log("🔻 receive new message:", data);
      setMessages((messages) => [...messages, data]);
    });

    return () => {
      socket.off("new message");
    };
  }, [messages]);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>

      <div className="p-8">
        <h1>Real-Time Chat</h1>
        {/* Display messages */}
        <div className="w-1/2 min-h-32 border-black border-2 mb-7">
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        {/* Input form */}
        <form onSubmit={sendMessage} id="send-message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-[45%] h-8 border-black border-2"
          />
          <button
            className="w-[4%] h-8 border-black border-2"
            type="submit"
            form="send-message-form"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
