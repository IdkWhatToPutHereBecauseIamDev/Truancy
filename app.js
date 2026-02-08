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
// Search engine
// ------------------------------
const engineSelect = document.getElementById("search-engine");
const DEFAULT_ENGINE = "https://duckduckgo.com/?q=";

function getEngine() {
  return localStorage.getItem("truancy_engine") || DEFAULT_ENGINE;
}

if (engineSelect) {
  const savedEngine = getEngine();
  engineSelect.value = savedEngine;
  engineSelect.onchange = () => {
    localStorage.setItem("truancy_engine", engineSelect.value);
  };
}

// ------------------------------
// Routing
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

  openValue(value);
}

function openValue(value) {
  const engine = getEngine();

  if (!value) {
    // Empty → DuckDuckGo start page
    window.open("https://duckduckgo.com/", "_blank");
    return;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    window.open(value, "_blank");
  } else {
    window.open(engine + encodeURIComponent(value), "_blank");
  }
}

// ------------------------------
// Home omnibox
// ------------------------------
const urlbox = document.getElementById("urlbox");
const go = document.getElementById("go");

function submitHome() {
  const value = urlbox.value.trim();

  const history = loadHistory();
  history.push(value || "duckduckgo-start");
  saveHistory(history);
  renderHistory();

  route(value);
  urlbox.value = "";
}

go.onclick = submitHome;
urlbox.onkeydown = (e) => { if (e.key === "Enter") submitHome(); };

// ------------------------------
// Browser omnibox
// ------------------------------
const browserUrl = document.getElementById("browser-url");
const browserGo = document.getElementById("browser-go");

function submitBrowser() {
  const value = browserUrl.value.trim();
  route(value);
  browserUrl.value = "";
}

browserGo.onclick = submitBrowser;
browserUrl.onkeydown = (e) => { if (e.key === "Enter") submitBrowser(); };

// ------------------------------
// Theme
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
// Clear history
// ------------------------------
const clearBtn = document.getElementById("clear-history");
if (clearBtn) {
  clearBtn.onclick = () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  };
}

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

if (consoleInput) {
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
}

// Ctrl+Shift+C → Console tab
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
    document.querySelector('.tab[data-view="console"]').click();
  }
});

// Initial
renderHistory();
