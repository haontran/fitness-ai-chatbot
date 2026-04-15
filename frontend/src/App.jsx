import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "Hey — ask me anything about workouts, running, or nutrition." },
  ]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const currentMessage = message;
    const userMessage = { role: "user", text: currentMessage };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        message: currentMessage,
      });

      const botMessage = {
        role: "assistant",
        text: response.data.reply || response.data.error || "No response",
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong talking to the backend." },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  return (
    <div className="app">
      <div className="header">
        <h1>AI Fitness Coach</h1>
        <p>Personalized fitness guidance powered by Gemini</p>
      </div>

      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`message ${chat.role}`}>
            <ReactMarkdown>{chat.text}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="message assistant">Thinking...</div>}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask about workouts, running, nutrition..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;