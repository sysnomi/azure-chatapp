// ═══════════════════════════════════════════════════
//  AI Chat – Client Logic
// ═══════════════════════════════════════════════════

const chatArea = document.getElementById("chatArea");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const welcomeCard = document.getElementById("welcomeCard");

let isWaiting = false;

// ── Auto-resize textarea ─────────────────────────
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + "px";
});

// ── Submit on Enter (Shift+Enter for newline) ────
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// ── Form submit ──────────────────────────────────
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message || isWaiting) return;

  // Hide welcome card on first message
  if (welcomeCard) {
    welcomeCard.style.display = "none";
  }

  appendMessage("user", message);
  chatInput.value = "";
  chatInput.style.height = "auto";

  isWaiting = true;
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = appendTypingIndicator();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // Remove typing indicator
    typingEl.remove();

    if (!res.ok) {
      appendMessage("ai", data.error || "Something went wrong.", true);
    } else {
      appendMessage("ai", data.answer);
    }
  } catch (err) {
    typingEl.remove();
    appendMessage("ai", "Network error — could not reach the server.", true);
  } finally {
    isWaiting = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
});

// ── Clear chat ───────────────────────────────────
clearBtn.addEventListener("click", () => {
  chatArea.innerHTML = "";
  // Restore welcome card
  const card = document.createElement("div");
  card.className = "welcome-card";
  card.id = "welcomeCard";
  card.innerHTML = `
    <div class="welcome-icon">✨</div>
    <h1>Hello! How can I help?</h1>
    <p>Type a message below to start chatting with the AI assistant.</p>
  `;
  chatArea.appendChild(card);
});

// ── Helpers ──────────────────────────────────────
function appendMessage(role, text, isError = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "U" : "AI";

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isError ? "error-bubble" : ""}`;
  bubble.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  scrollToBottom();
}

function appendTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "message ai";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "AI";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}
