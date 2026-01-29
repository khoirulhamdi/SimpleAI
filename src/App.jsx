import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./App.css";

const formatLatex = (text) => {
  if (!text) return "";
  let clean = text.replace(/\\\[(.*?)\\\]/gs, '$$$$$1$$$$');
  clean = clean.replace(/\\\((.*?)\\\)/gs, '$$$1$$');
  return clean;
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const apiMessages = [
        {
          role: "system",
          content: "You are a helpful assistant. ALWAYS use LaTeX for math equations. Wrap inline math in single $ signs (e.g., $E=mc^2$) and block math in double $$ signs. Do not use \\( or \\[."
        },
        ...messages.map((msg) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.text
        })),
        { role: "user", content: userText }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal menghubungi server");

      setMessages((prev) => [...prev, { role: "bot", text: data.result }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "error", text: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header">
        <h1>Simple AI</h1>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        {messages.length === 0 && (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555',
            gap: '10px'
          }}>
            <p style={{fontSize: '2rem'}}>😒</p>
            <p>Tanya apa ajalah bebas</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>

            {msg.role === "user" ? (
              /* USER BUBBLE */
              <div className="bubble-user">
                {msg.text}
              </div>
            ) : msg.role === "error" ? (
              /* ERROR MESSAGE */
              <div className="text-bot" style={{color: '#ff6b6b'}}>
                {msg.text}
              </div>
            ) : (
              /* BOT RESPONSE (Markdown + Math) */
              <div className="text-bot">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {formatLatex(msg.text)}
                </ReactMarkdown>
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="message-row bot">
            <div className="text-bot" style={{opacity: 0.5}}>...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ketik sesuatu..."
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {/* ICON */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
