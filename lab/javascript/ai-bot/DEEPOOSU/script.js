document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "deepoosu-local-demo-v2";
  const themeKey = "deepoosu-theme";

  const elements = {
    messages: document.getElementById("messages"),
    input: document.getElementById("user-input"),
    sendButton: document.getElementById("send-button"),
    newChatButton: document.getElementById("new-chat"),
    clearHistoryButton: document.getElementById("clear-history"),
    toggleThemeButton: document.getElementById("toggle-theme"),
    history: document.getElementById("chat-history"),
    title: document.getElementById("current-chat-title"),
    regenerateButton: document.getElementById("regenerate-response"),
    stopButton: document.getElementById("stop-response"),
    exportButton: document.getElementById("export-chat"),
    fileUploadButton: document.getElementById("file-upload-button"),
    fileUpload: document.getElementById("file-upload"),
    pendingFilePreview: document.getElementById("pending-file-preview"),
  };

  const demoResponses = [
    {
      keywords: ["portfolio", "project", "readme", "github"],
      title: "Portfolio documentation",
      body:
        "This demo is now a safe local portfolio artifact. It does not call an external LLM from the browser, and it keeps only local conversation history. For a real AI assistant, route requests through a server endpoint and read provider keys from server-side environment variables.",
    },
    {
      keywords: ["javascript", "frontend", "learn", "lab"],
      title: "Frontend Lab",
      body:
        "The lab pieces are small visual studies: canvas motion, CSS-only interactions, game loops, and playful UI experiments. The interesting part is the range: each study isolates one concept so the portfolio can show growth without hiding the learning process.",
    },
    {
      keywords: ["story", "poem", "creative"],
      title: "Creative prompt",
      body:
        "A good creative UI prompt usually starts with a constraint, not a blank canvas. Try asking for a scene, a rhythm, and one technical rule. Example: build a night train interface using only CSS transforms and no bitmap images.",
    },
    {
      keywords: ["quantum", "explain"],
      title: "Concept explanation",
      body:
        "The shortest useful version: quantum computing uses probability-like states and interference to amplify useful outcomes. It is not just a faster normal computer; it is a different tool for a narrow set of problems.",
    },
  ];

  let chats = readChats();
  let currentChatId = Object.keys(chats)[0] || createChat();
  let selectedFileName = "";

  applySavedTheme();
  render();

  elements.sendButton.addEventListener("click", sendMessage);
  elements.input.addEventListener("input", resizeInput);
  elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  elements.newChatButton.addEventListener("click", () => {
    currentChatId = createChat();
    saveChats();
    render();
    elements.input.focus();
  });

  elements.clearHistoryButton.addEventListener("click", () => {
    if (!window.confirm("Clear all local DEEPOOSU conversations?")) return;
    chats = {};
    currentChatId = createChat();
    saveChats();
    render();
  });

  elements.toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      themeKey,
      document.body.classList.contains("dark-mode") ? "dark" : "light",
    );
    updateThemeButton();
  });

  elements.regenerateButton.addEventListener("click", regenerateLastResponse);
  elements.exportButton.addEventListener("click", exportCurrentChat);
  elements.fileUploadButton.addEventListener("click", () => elements.fileUpload.click());
  elements.fileUpload.addEventListener("change", handleFileSelect);
  document.querySelectorAll(".suggestion-chip").forEach((button) => {
    button.addEventListener("click", () => {
      elements.input.value = button.textContent.trim();
      resizeInput();
      elements.input.focus();
    });
  });

  function sendMessage() {
    const prompt = elements.input.value.trim();
    if (!prompt && !selectedFileName) return;

    const content = selectedFileName
      ? `${prompt || "Review this file."}\n\nAttached locally: ${selectedFileName}`
      : prompt;

    chats[currentChatId].messages.push({ role: "user", content });
    elements.input.value = "";
    selectedFileName = "";
    elements.pendingFilePreview.textContent = "";
    resizeInput();
    saveChats();
    render();

    elements.stopButton.style.display = "inline-flex";
    window.setTimeout(() => {
      chats[currentChatId].messages.push({
        role: "ai",
        content: buildDemoResponse(content),
      });
      elements.stopButton.style.display = "none";
      saveChats();
      render();
    }, 350);
  }

  function regenerateLastResponse() {
    const chat = chats[currentChatId];
    if (!chat || chat.messages.length === 0) return;

    while (chat.messages.length && chat.messages[chat.messages.length - 1].role === "ai") {
      chat.messages.pop();
    }

    const lastUserMessage = [...chat.messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) return;

    chat.messages.push({
      role: "ai",
      content: buildDemoResponse(lastUserMessage.content),
    });
    saveChats();
    render();
  }

  function buildDemoResponse(prompt) {
    const normalizedPrompt = prompt.toLowerCase();
    const match =
      demoResponses.find((response) =>
        response.keywords.some((keyword) => normalizedPrompt.includes(keyword)),
      ) || {
        title: "Safe local demo",
        body:
          "I can show the interaction model, markdown rendering, chat history, theme toggle, export, and file selection without sending your text or API keys anywhere. The production-safe version would move model calls behind a server endpoint.",
      };

    return `### ${match.title}\n\n${match.body}\n\n- Browser secret exposure removed\n- Local-only storage via localStorage\n- No external AI request from this static page`;
  }

  function render() {
    const chat = chats[currentChatId];
    elements.title.textContent = chat.title;
    renderMessages(chat.messages);
    renderHistory();
  }

  function renderMessages(messages) {
    elements.messages.innerHTML = "";

    if (messages.length === 0) {
      elements.messages.innerHTML = `
        <div class="intro-message">
          <h1>Welcome to DEEPOOSU</h1>
          <p>Safe local AI-chat UI demo. No provider key is shipped to the browser.</p>
          <div class="suggestion-chips">
            <button class="suggestion-chip">Explain the Frontend Lab</button>
            <button class="suggestion-chip">Help me learn JavaScript</button>
            <button class="suggestion-chip">Portfolio README tips</button>
            <button class="suggestion-chip">Tell me a story</button>
          </div>
        </div>
      `;
      document.querySelectorAll(".suggestion-chip").forEach((button) => {
        button.addEventListener("click", () => {
          elements.input.value = button.textContent.trim();
          resizeInput();
          elements.input.focus();
        });
      });
      return;
    }

    messages.forEach((message) => {
      const wrapper = document.createElement("div");
      wrapper.className = `message ${message.role}`;

      const content = document.createElement("div");
      content.className = "message-content";
      if (message.role === "ai" && window.marked) {
        content.innerHTML = window.marked.parse(message.content);
      } else {
        content.textContent = message.content;
      }

      wrapper.appendChild(content);
      elements.messages.appendChild(wrapper);
    });

    if (window.hljs) {
      document.querySelectorAll("pre code").forEach((block) => window.hljs.highlightElement(block));
    }
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function renderHistory() {
    elements.history.innerHTML = "";
    Object.values(chats)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach((chat) => {
        const item = document.createElement("div");
        item.className = `chat-history-item${chat.id === currentChatId ? " active" : ""}`;
        item.dataset.chatId = chat.id;
        item.innerHTML = `<i class="fas fa-comment"></i><span>${escapeHtml(chat.title)}</span>`;
        item.addEventListener("click", () => {
          currentChatId = chat.id;
          render();
        });
        elements.history.appendChild(item);
      });
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    selectedFileName = file ? file.name : "";
    elements.pendingFilePreview.textContent = selectedFileName
      ? `Selected local file: ${selectedFileName}`
      : "";
  }

  function exportCurrentChat() {
    const chat = chats[currentChatId];
    const markdown = [
      `# ${chat.title}`,
      "",
      ...chat.messages.map((message) => {
        const speaker = message.role === "user" ? "You" : "DEEPOOSU";
        return `## ${speaker}\n\n${message.content}\n`;
      }),
    ].join("\n");

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chat.title.replace(/[^\w\s-]/g, "").trim() || "deepoosu-chat"}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function createChat() {
    const id = `chat-${Date.now()}`;
    chats[id] = {
      id,
      title: "New Conversation",
      messages: [],
      updatedAt: Date.now(),
    };
    return id;
  }

  function readChats() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  }

  function saveChats() {
    const chat = chats[currentChatId];
    if (chat) {
      const firstUserMessage = chat.messages.find((message) => message.role === "user");
      chat.title = firstUserMessage ? firstUserMessage.content.split("\n")[0].slice(0, 42) : "New Conversation";
      chat.updatedAt = Date.now();
    }
    localStorage.setItem(storageKey, JSON.stringify(chats));
  }

  function applySavedTheme() {
    if (localStorage.getItem(themeKey) === "dark") {
      document.body.classList.add("dark-mode");
    }
    updateThemeButton();
  }

  function updateThemeButton() {
    const icon = elements.toggleThemeButton.querySelector("i");
    const label = elements.toggleThemeButton.querySelector("span");
    const isDark = document.body.classList.contains("dark-mode");
    icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    label.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  function resizeInput() {
    elements.input.style.height = "auto";
    elements.input.style.height = `${elements.input.scrollHeight}px`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
