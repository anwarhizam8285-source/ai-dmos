import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./CeoAgent.css";

export default function CeoAgent() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [messages, setMessages] = useState([
    {
      role: "agent",
      agent: "ceo-agent",
      text: "Hi, I'm your CEO Agent. Ask me about strategy, content, or usage — I'll route requests to the right specialist agent.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const agentLabel = (agent) =>
    agent === "content-agent" ? "🎨 Content Agent" : "👔 CEO Agent";

  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/agents/ceo/ask",
        { companyId, message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          agent: response.data.agent,
          intent: response.data.intent,
          text: response.data.content,
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "CEO Agent is unavailable right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ceo-agent-container">
      <div className="ceo-agent-card">
        <h2>👔 CEO Agent</h2>
        <p className="subtitle">
          Your AI orchestrator — routes requests to the right specialist agent
        </p>

        <div className="chat-window">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.role === "agent" && (
                <span className="agent-tag">{agentLabel(msg.agent)}</span>
              )}
              <p>{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble agent">
              <span className="agent-tag">Thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about content, strategy, or usage..."
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
