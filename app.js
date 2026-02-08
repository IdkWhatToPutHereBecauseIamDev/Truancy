// ------------------------------
// Tab switching
// ------------------------------
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const view = tab.getAttribute("data-view");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
  });
});

// ------------------------------
// History
// ------------------------------
const HISTORY_KEY = "truancy_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function renderHistory() {
  const log = document.getElementById("log");
  log.innerHTML = "";
  loadHistory().slice().reverse().forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    li.onclick = () => route(entry);
    log.appendChild(li);
  });
}

// ------------------------------
// Protocol router
// ------------------------------
function route(value) {
  if (value.startsWith("tru://")) {
    const path = value.replace("tru://", "");

    if (path === "settings") {
      document.querySelector('.tab[data-view="settings"]').click();
      return;
    }

    if (path === "console") {
      document.querySelector('.tab[data-view="console"]').click();
      return;
    }

    consoleLog("Unknown tru:// path → " + path);
    return;
  }

  // Normal URL or search
  openValue(value);
}

function openValue(value) {
  const engine = localStorage.getItem("truancy_engine") ||
    "https://duckduckgo.com/?q=";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    window.open(value, "_blank");
  } else {
    window.open(engine + encodeURIComponent(value), "_blank");
  }
}

// ------------------------------
// Omnibox (home)
// ------------------------------
const urlbox = document.getElementById("urlbox");
const go = document.getElementById("go");

function submitOmni() {
  const value = urlbox.value.trim();
  if (!value) return;

  const history = loadHistory();
  history.push(value);
  saveHistory(history);
  renderHistory();

  route(value);
  urlbox.value = "";
}

go.onclick = submitOmni;
urlbox.onkeydown = (e) => { if (e.key === "Enter") submitOmni(); };

// ------------------------------
// Embedded browser
// ------------------------------
const embedUrl = document.getElementById("embed-url");
const embedGo = document.getElementById("embed-go");
const browserFrame = document.getElementById("browser-frame");

function loadEmbed() {
  let value = embedUrl.value.trim();
  if (!value) return;

  if (value.startsWith("tru://")) {
    route(value);
    return;
  }

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    value = "https://" + value;
  }

  browserFrame.src = value;
}

embedGo.onclick = loadEmbed;
embedUrl.onkeydown = (e) => { if (e.key === "Enter") loadEmbed(); };

// ------------------------------
// Theme switching
// ------------------------------
document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.onclick = () => {
    const theme = btn.getAttribute("data-theme");
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("truancy_theme", theme);
  };
});

const savedTheme = localStorage.getItem("truancy_theme");
if (savedTheme) document.body.setAttribute("data-theme", savedTheme);

// ------------------------------
// Search engine selection
// ------------------------------
const engineSelect = document.getElementById("search-engine");
engineSelect.onchange = () => {
  localStorage.setItem("truancy_engine", engineSelect.value);
};

const savedEngine = localStorage.getItem("truancy_engine");
if (savedEngine) engineSelect.value = savedEngine;

// ------------------------------
// Clear history
// ------------------------------
document.getElementById("clear-history").onclick = () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
};

// ------------------------------
// Console
// ------------------------------
const consoleOutput = document.getElementById("console-output");
const consoleInput = document.getElementById("console-input");

function consoleLog(msg) {
  const div = document.createElement("div");
  div.textContent = "> " + msg;
  consoleOutput.appendChild(div);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

consoleInput.onkeydown = (e) => {
  if (e.key === "Enter") {
    const cmd = consoleInput.value.trim();
    consoleInput.value = "";

    if (cmd === "clear") {
      consoleOutput.innerHTML = "";
      return;
    }

    if (cmd.startsWith("open ")) {
      const target = cmd.replace("open ", "");
      route(target);
      return;
    }

    consoleLog("Unknown command: " + cmd);
  }
};

// ------------------------------
// Keyboard shortcut: Ctrl+Shift+C
// ------------------------------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
    document.querySelector('.tab[data-view="console"]').click();
  }
});

// Initial render
renderHistory();
