
import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  MessageSquareText,
  Clock3,
  ShieldCheck,
  RotateCcw,
  BriefcaseBusiness,
  Send,
  Bot,
  UserRound,
  Headset,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8000";

const tones = [
  { value: "professional", label: "Professional", emoji: "👔" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "firm", label: "Firm", emoji: "💬" },
  { value: "apologetic", label: "Apologetic", emoji: "🤝" },
];

const examples = [
  {
    label: "Late delivery",
    message:
      "The customer is upset because their order is late. We are checking the delivery status.",
  },
  {
    label: "Price inquiry",
    message:
      "A customer wants to know the price for our service. I haven't confirmed the price yet.",
  },
  {
    label: "Customer complaint",
    message:
      "A customer says the repair took longer than expected. The repair is complete now.",
  },
];

type HistoryItem = {
  id: number;
  message: string;
  reply: string;
  tone: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const sampleBusinessName = "QuickFix Repairs";
const sampleBusinessKnowledge = `QuickFix Repairs fixes laptops and desktop computers.
Opening hours: Monday to Saturday, 9 AM to 6 PM.
Customers must contact the shop for a repair quote.
No fixed repair prices are published.
The shop has not provided a public phone number or street address yet.`;

function App() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("professional");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "compose" | "history" | "chat"
  >("compose");

  const [businessName, setBusinessName] = useState(sampleBusinessName);
  const [businessKnowledge, setBusinessKnowledge] = useState(
    sampleBusinessKnowledge
  );
  const [customerInput, setCustomerInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [needsHuman, setNeedsHuman] = useState(false);

  async function generateReply() {
    if (message.trim().length < 3) {
      setError("Enter a customer message or a few rough notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setReply("");
    setCopied(false);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          tone,
          context: context.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Could not generate a reply.");
      }

      setReply(data.reply);
      setHistory((previous) => [
        {
          id: Date.now(),
          message: message.trim(),
          reply: data.reply,
          tone,
        },
        ...previous,
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Make sure the backend and Ollama are running.`
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyReply() {
    if (!reply) return;

    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(
        "Clipboard access failed. Select the reply text and copy it manually."
      );
    }
  }

  function resetComposer() {
    setMessage("");
    setReply("");
    setError("");
    setContext("");
    setCopied(false);
  }

  function restoreHistory(item: HistoryItem) {
    setMessage(item.message);
    setReply(item.reply);
    setTone(item.tone);
    setError("");
    setActiveTab("compose");
  }

  async function sendCustomerMessage() {
    const text = customerInput.trim();

    if (!text || chatLoading) return;

    if (businessKnowledge.trim().length < 10) {
      setChatError("Add more business information before starting the chat.");
      return;
    }

    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: text },
    ];

    setChatMessages(updatedMessages);
    setCustomerInput("");
    setChatLoading(true);
    setChatError("");
    setNeedsHuman(false);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          business_name: businessName.trim() || "This business",
          business_knowledge: businessKnowledge.trim(),
          conversation_history: updatedMessages.slice(0, -1).slice(-12),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not get a chatbot response.");
      }

      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply },
      ]);
      setNeedsHuman(Boolean(data.needs_human));
    } catch (err) {
      setChatError(
        err instanceof Error
          ? `${err.message} Check that the backend and Ollama are running.`
          : "Something went wrong. Please try again."
      );
    } finally {
      setChatLoading(false);
    }
  }

  function resetChat() {
    setChatMessages([]);
    setCustomerInput("");
    setChatError("");
    setNeedsHuman(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            resetComposer();
            setActiveTab("compose");
          }}
        >
          <div className="brand-icon">
            <MessageSquareText size={23} />
          </div>
          <span>
            ReplyCraft<span className="brand-dot">.</span>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <button
          className={`nav-item ${activeTab === "compose" ? "active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          <Sparkles size={18} />
          <span>Reply studio</span>
        </button>

        <button
          className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <Bot size={18} />
          <span>Customer chatbot</span>
        </button>

        <button
          className={`nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <Clock3 size={18} />
          <span>Recent replies</span>
          {history.length > 0 && (
            <span className="nav-count">{history.length}</span>
          )}
        </button>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <div className="privacy-icon">
              <ShieldCheck size={18} />
            </div>
            <strong>Local AI workspace</strong>
            <p>
              Chat requests use your local Ollama model. Chat history is
              currently kept in page memory.
            </p>
            <span className="local-status">
              <span /> LOCAL AI
            </span>
          </div>
          <div className="sidebar-footer">
            <div className="avatar">RC</div>
            <div>
              <strong>My workspace</strong>
              <p>Personal account</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            {activeTab === "compose"
              ? "Reply studio"
              : activeTab === "chat"
                ? "Customer chatbot"
                : "Recent replies"}
          </div>
          <div className="topbar-right">
            <span className="model-indicator">
              <span /> Qwen · Local model
            </span>
            <div className="avatar top-avatar">RC</div>
          </div>
        </header>

        {activeTab === "compose" ? (
          <>
            <section className="page-heading">
              <div className="eyebrow">
                <Sparkles size={14} /> YOUR AI WRITING ASSISTANT
              </div>
              <h1>
                Good communication,
                <br />
                <span>without the busywork.</span>
              </h1>
              <p>
                Turn rough notes into thoughtful customer replies in seconds.
              </p>
            </section>

            <div className="studio-grid">
              <section className="panel composer-panel">
                <div className="panel-heading">
                  <div className="panel-heading-icon">
                    <MessageSquareText size={19} />
                  </div>
                  <div>
                    <h2>Compose a reply</h2>
                    <p>Start with a message or a few rough notes.</p>
                  </div>
                  <button
                    className="icon-button reset-button"
                    title="Clear form"
                    onClick={resetComposer}
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                <label htmlFor="customer-message">
                  CUSTOMER MESSAGE OR NOTES
                </label>
                <textarea
                  id="customer-message"
                  className="message-input"
                  placeholder="e.g. Customer wants an update on their repair..."
                  value={message}
                  maxLength={5000}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <div className="input-meta">
                  <span>Write naturally — rough notes are fine.</span>
                  <span>{message.length}/5000</span>
                </div>

                <div className="examples">
                  <span className="examples-label">TRY AN EXAMPLE</span>
                  {examples.map((example) => (
                    <button
                      key={example.label}
                      className="example-chip"
                      onClick={() => setMessage(example.message)}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>

                <div className="field-divider" />

                <label>CHOOSE YOUR TONE</label>
                <div className="tone-grid">
                  {tones.map((item) => (
                    <button
                      key={item.value}
                      className={`tone-option ${
                        tone === item.value ? "selected" : ""
                      }`}
                      onClick={() => setTone(item.value)}
                    >
                      <span className="tone-emoji">{item.emoji}</span>
                      <span>{item.label}</span>
                      <span className="tone-radio">
                        {tone === item.value && <span />}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="field-divider" />

                <label htmlFor="business-context">
                  <BriefcaseBusiness size={13} className="label-icon" />{" "}
                  BUSINESS CONTEXT <span className="optional">(OPTIONAL)</span>
                </label>
                <textarea
                  id="business-context"
                  className="context-input"
                  placeholder="Services, confirmed prices, policies..."
                  value={context}
                  maxLength={2000}
                  onChange={(event) => setContext(event.target.value)}
                />

                {error && (
                  <div className="error-message" role="alert">
                    {error}
                  </div>
                )}

                <button
                  className="generate-button"
                  onClick={generateReply}
                  disabled={loading || message.trim().length < 3}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Generating your reply...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Generate reply{" "}
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>
                <p className="generate-footnote">
                  Powered by local AI · Review before sending
                </p>
              </section>

              <section className="panel result-panel">
                <div className="panel-heading result-heading">
                  <div className="result-icon">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <h2>Your reply</h2>
                    <p>A polished draft, ready for your review.</p>
                  </div>
                  {reply && <span className="draft-badge">DRAFT</span>}
                </div>

                {reply ? (
                  <div className="generated-result">
                    <div className="result-topline">
                      <span className="result-dot" /> GENERATED DRAFT
                    </div>
                    <div className="reply-text">{reply}</div>
                    <div className="result-actions">
                      <button className="copy-button" onClick={copyReply}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy reply"}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={generateReply}
                        disabled={loading}
                      >
                        <RotateCcw size={15} /> Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-result">
                    <div className="empty-illustration">
                      <div className="illustration-card card-back" />
                      <div className="illustration-card card-front">
                        <div className="fake-line short" />
                        <div className="fake-line" />
                        <div className="fake-line medium" />
                        <div className="fake-paragraph" />
                        <div className="fake-paragraph second" />
                      </div>
                      <div className="sparkle-float">
                        <Sparkles size={21} />
                      </div>
                    </div>
                    <h3>Your next great reply starts here.</h3>
                    <p>
                      Add a customer message, choose your tone, and let
                      ReplyCraft help with the wording.
                    </p>
                    <div className="empty-tips">
                      <div>
                        <Check size={14} /> Clear and professional
                      </div>
                      <div>
                        <Check size={14} /> Tailored to your tone
                      </div>
                      <div>
                        <Check size={14} /> You stay in control
                      </div>
                    </div>
                  </div>
                )}

                <div className="result-bottom">
                  <ShieldCheck size={16} />
                  <span>
                    AI-generated drafts can be wrong. Verify facts before
                    sending.
                  </span>
                </div>
              </section>
            </div>
          </>
        ) : activeTab === "chat" ? (
          <section className="chat-page">
            <div className="page-heading">
              <div className="eyebrow">
                <Bot size={14} /> CUSTOMER SUPPORT AI
              </div>
              <h1>
                Meet your support
                <br />
                <span>assistant.</span>
              </h1>
              <p>
                Test how your business chatbot answers real customer questions.
              </p>
            </div>

            <div className="chat-layout">
              <section className="panel business-panel">
                <div className="panel-heading">
                  <div className="panel-heading-icon">
                    <BriefcaseBusiness size={19} />
                  </div>
                  <div>
                    <h2>Business knowledge</h2>
                    <p>Facts the chatbot can use to answer customers.</p>
                  </div>
                </div>

                <label htmlFor="business-name">BUSINESS NAME</label>
                <input
                  id="business-name"
                  className="business-text-input"
                  value={businessName}
                  maxLength={120}
                  onChange={(event) => setBusinessName(event.target.value)}
                />

                <label htmlFor="business-knowledge">
                  SERVICES, PRICES, HOURS &amp; POLICIES
                </label>
                <textarea
                  id="business-knowledge"
                  className="knowledge-input"
                  value={businessKnowledge}
                  maxLength={8000}
                  onChange={(event) => setBusinessKnowledge(event.target.value)}
                />
                <p className="generate-footnote">
                  Use confirmed facts only. Don't add private customer data.
                </p>
                <button
                  className="secondary-button"
                  onClick={resetChat}
                  disabled={chatLoading}
                >
                  <RotateCcw size={15} /> Reset conversation
                </button>
              </section>

              <section className="panel customer-chat-panel">
                <div className="customer-chat-header">
                  <div className="chat-business-avatar">
                    <Headset size={20} />
                  </div>
                  <div>
                    <h2>{businessName.trim() || "Business support"}</h2>
                    <p>
                      <span className="online-dot" /> AI customer support
                    </p>
                  </div>
                  <span className="ai-tag">AI</span>
                </div>

                <div className="chat-messages" aria-live="polite">
                  {chatMessages.length === 0 && (
                    <div className="chat-welcome">
                      <div className="chat-welcome-icon">
                        <Bot size={26} />
                      </div>
                      <h3>How can we help you?</h3>
                      <p>
                        Ask a question about this business. The assistant will
                        use the business information configured on the left.
                      </p>
                      <div className="suggested-questions">
                        {[
                          "What services do you offer?",
                          "What are your opening hours?",
                          "How much does a repair cost?",
                        ].map((question) => (
                          <button
                            key={question}
                            onClick={() => setCustomerInput(question)}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((item, index) => (
                    <div
                      key={`${index}-${item.role}`}
                      className={`chat-message-row ${
                        item.role === "user" ? "customer" : "assistant"
                      }`}
                    >
                      <div className="chat-message-avatar">
                        {item.role === "user" ? (
                          <UserRound size={15} />
                        ) : (
                          <Bot size={15} />
                        )}
                      </div>
                      <div className="chat-bubble">
                        <span className="chat-sender">
                          {item.role === "user" ? "You" : "AI assistant"}
                        </span>
                        <p>{item.content}</p>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="chat-typing" role="status">
                      <span className="spinner" /> Thinking with local AI...
                    </div>
                  )}
                  {chatError && (
                    <div className="error-message" role="alert">
                      {chatError}
                    </div>
                  )}
                  {needsHuman && (
                    <div className="human-support-note">
                      <Headset size={16} />
                      This conversation may need help from a person. Configure
                      verified contact details in the business knowledge.
                    </div>
                  )}
                </div>

                <form
                  className="chat-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendCustomerMessage();
                  }}
                >
                  <input
                    aria-label="Your message"
                    placeholder="Type your question..."
                    value={customerInput}
                    maxLength={2000}
                    onChange={(event) => setCustomerInput(event.target.value)}
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={chatLoading || !customerInput.trim()}
                  >
                    <Send size={17} />
                  </button>
                </form>
                <p className="chat-disclaimer">
                  AI-generated answers may be incorrect. Important details
                  should be confirmed with the business.
                </p>
              </section>
            </div>
          </section>
        ) : (
          <section className="history-page">
            <div className="eyebrow">
              <Clock3 size={14} /> YOUR WORKSPACE
            </div>
            <h1>
              Recent replies<span className="heading-period">.</span>
            </h1>
            <p className="history-intro">
              Revisit drafts from your current session.
            </p>
            {history.length === 0 ? (
              <div className="panel history-empty">
                <Clock3 size={30} />
                <h2>No replies yet</h2>
                <p>
                  Generated replies will appear here while this page remains
                  open.
                </p>
                <button
                  className="copy-button"
                  onClick={() => setActiveTab("compose")}
                >
                  Create your first reply
                </button>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <button
                    key={item.id}
                    className="history-item"
                    onClick={() => restoreHistory(item)}
                  >
                    <div className="history-item-top">
                      <span className="history-tone">
                        {tones.find((t) => t.value === item.tone)?.label}
                      </span>
                      <span className="history-open">Open draft →</span>
                    </div>
                    <p className="history-message">{item.message}</p>
                    <p className="history-reply">{item.reply}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="app-footer">
          <span>
            ReplyCraft <span className="footer-dot">●</span> Built for better
            business communication
          </span>
          <span>
            <ShieldCheck size={14} /> Local-first AI
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
