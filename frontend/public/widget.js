
(function () {
  const script = document.currentScript;

  if (!script) {
    console.error("ReplyCraft: Could not find the widget script.");
    return;
  }

  const apiUrl = (
    script.dataset.apiUrl || "http://localhost:8000"
  ).replace(/\/$/, "");

  const businessName =
    script.dataset.businessName || "Customer Support";

  const businessKnowledge =
    script.dataset.businessKnowledge ||
    "No business information has been configured yet.";

  if (document.getElementById("replycraft-widget")) return;

  const style = document.createElement("style");
  style.textContent = `
    #replycraft-widget {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      color: #202033;
    }
    #replycraft-toggle {
      width: 60px;
      height: 60px;
      border: 0;
      border-radius: 50%;
      background: #6d4aff;
      color: white;
      font-size: 26px;
      cursor: pointer;
      box-shadow: 0 6px 24px #0003;
    }
    #replycraft-panel {
      display: none;
      flex-direction: column;
      width: min(350px, calc(100vw - 32px));
      height: min(480px, calc(100vh - 120px));
      margin-bottom: 14px;
      background: white;
      border: 1px solid #e6e2f5;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 40px #0002;
    }
    #replycraft-header {
      background: #6d4aff;
      color: white;
      padding: 16px;
      font-weight: bold;
    }
    #replycraft-status {
      display: block;
      margin-top: 5px;
      font-size: 12px;
      font-weight: normal;
      opacity: .85;
    }
    #replycraft-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      background: #faf9ff;
    }
    .replycraft-message {
      max-width: 85%;
      width: fit-content;
      margin: 0 0 10px;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .replycraft-bot {
      background: white;
      border: 1px solid #e8e5f2;
    }
    .replycraft-user {
      margin-left: auto;
      background: #6d4aff;
      color: white;
    }
    #replycraft-form {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #eee;
      background: white;
    }
    #replycraft-input {
      flex: 1;
      min-width: 0;
      padding: 11px;
      border: 1px solid #ddd7ef;
      border-radius: 10px;
      font-size: 14px;
    }
    #replycraft-send {
      border: 0;
      border-radius: 10px;
      padding: 0 14px;
      background: #6d4aff;
      color: white;
      cursor: pointer;
    }
    #replycraft-send:disabled {
      opacity: .6;
      cursor: wait;
    }
    @media (max-width: 480px) {
      #replycraft-widget {
        right: 16px;
        bottom: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "replycraft-widget";

  const panel = document.createElement("section");
  panel.id = "replycraft-panel";
  panel.setAttribute("aria-label", businessName + " chat");

  const header = document.createElement("div");
  header.id = "replycraft-header";
  header.textContent = businessName;

  const status = document.createElement("span");
  status.id = "replycraft-status";
  status.textContent = "AI customer support";
  header.appendChild(status);

  const messages = document.createElement("div");
  messages.id = "replycraft-messages";
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");

  const form = document.createElement("form");
  form.id = "replycraft-form";

  const input = document.createElement("input");
  input.id = "replycraft-input";
  input.placeholder = "Ask us a question...";
  input.setAttribute("aria-label", "Your message");
  input.maxLength = 2000;
  input.required = true;
  input.autocomplete = "off";

  const send = document.createElement("button");
  send.id = "replycraft-send";
  send.type = "submit";
  send.textContent = "Send";

  form.append(input, send);
  panel.append(header, messages, form);

  const toggle = document.createElement("button");
  toggle.id = "replycraft-toggle";
  toggle.type = "button";
  toggle.textContent = "☏";
  toggle.setAttribute("aria-label", "Open customer support chat");
  toggle.setAttribute("aria-expanded", "false");

  root.append(panel, toggle);
  document.body.appendChild(root);

  const history = [];
  let busy = false;
  let greeted = false;

  function addMessage(text, role) {
    const bubble = document.createElement("div");
    bubble.className =
      "replycraft-message " +
      (role === "user" ? "replycraft-user" : "replycraft-bot");
    // textContent prevents model output from being interpreted as HTML.
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle.addEventListener("click", function () {
    const opening = panel.style.display !== "flex";
    panel.style.display = opening ? "flex" : "none";
    toggle.textContent = opening ? "×" : "☏";
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.setAttribute(
      "aria-label",
      opening ? "Close customer support chat" : "Open customer support chat"
    );

    if (opening && !greeted) {
      addMessage(
        "Hi! Welcome to " + businessName +
        ". How can I help you today?",
        "assistant"
      );
      greeted = true;
      input.focus();
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = input.value.trim();
    if (!message || busy) return;

    addMessage(message, "user");
    input.value = "";
    busy = true;
    send.disabled = true;
    status.textContent = "Thinking...";

    try {
      const response = await fetch(apiUrl + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          business_name: businessName,
          business_knowledge: businessKnowledge,
          conversation_history: history.slice(-12)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to get a reply.");
      }

      const reply = data.reply || "Sorry, I couldn't generate a reply.";
      addMessage(reply, "assistant");

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      if (data.needs_human) {
        status.textContent = "Human support may be needed";
      } else {
        status.textContent = "AI customer support";
      }
    } catch (error) {
      console.error("ReplyCraft chat error:", error);
      addMessage(
        "Sorry, we couldn't connect right now. Please try again shortly.",
        "assistant"
      );
      status.textContent = "Connection issue";
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  });
})();
