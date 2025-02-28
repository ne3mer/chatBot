import React, { useState, useEffect, useRef } from "react";

const RetroTerminalChat = () => {
  const [messages, setMessages] = useState([
    { sender: "system", text: "SYSTEM INITIALIZED: WELCOME TO TERMINALX-9000" },
    { sender: "system", text: "ARTIFICIAL INTELLIGENCE UNIT ONLINE" },
    { sender: "system", text: "ENTER COMMAND:" },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    cpu: "OPERATIONAL",
    memory: "640K (SUFFICIENT)",
    network: "CONNECTED",
    users: 1,
  });
  const [commandHistory, setCommandHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Focus input on component mount and after each AI response
  useEffect(() => {
    inputRef.current?.focus();
  }, [messages, isThinking]);

  // Call DeepSeek API for AI responses
  const fetchAIResponse = async (userMessage) => {
    try {
      // Handle special commands locally for immediate response
      const message = userMessage.toUpperCase();

      // Special command: CLEAR
      if (message === "CLEAR") {
        setTimeout(() => {
          setMessages([
            { sender: "system", text: "SCREEN BUFFER CLEARED" },
            { sender: "system", text: "TERMINAL READY" },
          ]);
        }, 500);
        return "EXECUTING CLEAR COMMAND...";
      }

      // Special command: STATUS
      if (message === "STATUS") {
        // Randomly update CPU and network status for effect
        setTimeout(() => {
          setSystemStatus((prev) => ({
            ...prev,
            cpu:
              Math.random() > 0.5 ? "OPERATIONAL" : "RUNNING AT 87% CAPACITY",
            network: Math.random() > 0.3 ? "CONNECTED" : "INTERMITTENT",
          }));
        }, 1000);
        return "ALL SYSTEMS OPERATIONAL. DEEPSEEK AI CORE ONLINE. CPU LOAD: 42%";
      }

      // Special command: TIME
      if (message === "TIME") {
        return `CURRENT SYSTEM TIME: ${new Date()
          .toLocaleTimeString()
          .toUpperCase()}`;
      }

      // Special command: DATE
      if (message === "DATE") {
        return `CURRENT SYSTEM DATE: ${new Date()
          .toLocaleDateString()
          .toUpperCase()}`;
      }

      // For all other messages, call the API
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
      } catch (apiError) {
        console.error("Error with main API, trying fallback:", apiError);

        // Try fallback if main API fails
        const fallbackResponse = await fetch("/api/chat/fallback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API error: ${fallbackResponse.status}`);
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData.response;
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "COMMUNICATION ERROR. AI CORE UNRESPONSIVE. RETRY TRANSMISSION.";
    }
  };

  // Simulate typing animation for AI responses
  const simulateTypingAnimation = (response) => {
    let displayedResponse = "";
    const typingInterval = setInterval(() => {
      if (displayedResponse.length < response.length) {
        displayedResponse += response[displayedResponse.length];
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { sender: "ai", text: displayedResponse },
        ]);
      } else {
        clearInterval(typingInterval);
        setIsThinking(false);
      }
    }, 30); // 30ms per character
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userInput = input.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userInput.toUpperCase() },
    ]);

    // Add to command history
    setCommandHistory((prev) => {
      const newHistory = [userInput.toUpperCase(), ...prev];
      return newHistory.slice(0, 4); // Keep only last 4 commands
    });

    // Start AI response
    setIsThinking(true);
    setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

    // Add a small delay to simulate initial processing
    setTimeout(async () => {
      try {
        // Fetch response from Claude API
        const aiResponse = await fetchAIResponse(userInput);
        simulateTypingAnimation(aiResponse);
      } catch (error) {
        console.error("Error in AI response:", error);
        simulateTypingAnimation("ERROR IN AI CORE. SYSTEM MALFUNCTION.");
      }
    }, 500 + Math.random() * 500); // Random delay between 0.5 and 1 second

    setInput("");
  };

  // Function to calculate a "random" hash code for system display
  const getHashCode = () => {
    const characters = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
      <div className="mb-4 border-b border-green-500 pb-2">
        <h1 className="text-xl text-center">
          TERMINALX-9000 ARTIFICIAL INTELLIGENCE SYSTEM
        </h1>
        <p className="text-center">© 1983 CYBERDYNE SYSTEMS</p>
      </div>

      <div className="flex-1 overflow-auto mb-4 border border-green-500 p-4 bg-black">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === "user" ? "text-cyan-400" : "text-green-500"
              }`}
            >
              {message.sender === "user" ? "> " : ""}
              {message.text}
            </div>
          ))}
          {isThinking && <div className="text-green-500">_</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex border border-green-500 bg-black"
      >
        <div className="px-2 py-1 text-green-500">></div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-black text-green-500 outline-none px-2 py-1"
          disabled={isThinking}
          autoComplete="off"
        />
        <div
          className={`px-2 py-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
        >
          _
        </div>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="border border-green-500 p-2">
          <div className="text-center mb-1">SYSTEM STATUS</div>
          <div className="text-xs">
            <div>CPU: {systemStatus.cpu}</div>
            <div>MEMORY: {systemStatus.memory}</div>
            <div>NETWORK: {systemStatus.network}</div>
            <div>USERS: {systemStatus.users}</div>
            <div>HASH: {getHashCode()}</div>
          </div>
        </div>
        <div className="border border-green-500 p-2">
          <div className="text-center mb-1">COMMAND HISTORY</div>
          <div className="text-xs">
            {commandHistory.length > 0 ? (
              commandHistory.map((cmd, index) => (
                <div key={index}>
                  {cmd.length > 20 ? cmd.substring(0, 20) + "..." : cmd}
                </div>
              ))
            ) : (
              <div>NO PREVIOUS COMMANDS</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroTerminalChat;
