// Keys
const THEME_KEY = "truancy_theme";
const ENGINE_KEY = "truancy_engine";
const BOOKMARK_KEY = "truancy_bookmarks";
const DOWNLOAD_KEY = "truancy_downloads";

// Elements
const tabStrip = document.getElementById("tab-strip");
const newTabBtn = document.getElementById("new-tab");
const browserFrame = document.getElementById("browser-frame");
const urlInput = document.getElementById("url-input");

const backBtn = document.getElementById("back-btn");
const forwardBtn = document.getElementById("forward-btn");
const refreshBtn = document.getElementById("refresh-btn");
const favBtn = document.getElementById("fav-btn");
const downloadBtn = document.getElementById("download-btn");
const shareBtn = document.getElementById("share-btn");
const menuBtn = document.getElementById("menu-btn");

const bookmarkList = document.getElementById("bookmark-list");
const downloadList = document.getElementById("download-list");
const engineSelect = document.getElementById("search-engine");
const consoleOut = document.getElementById("console-output");
const consoleIn = document.getElementById("console-input");

// State
let tabs = [];
let activeTab = null;

// Helpers
function getEngine() {
  return localStorage.getItem(ENGINE_KEY) || "https://duckduckgo.com/?q=";
}

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Tabs
function createTab(url = "https://duckduckgo.com/") {
  const id = Date.now() + Math.random();
  const tab = {
    id,
    url,
    history: [url],
    index: 0
  };
  tabs.push(tab);
  renderTabs();
  switchTab(id);
}

function renderTabs() {
  tabStrip.innerHTML = "";
  tabs.forEach((tab) => {
    const btn = document.createElement("div");
    btn.className = "tab" + (tab.id === activeTab ? " active" : "");

    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = tab.url.replace(/^https?:\/\//, "").slice(0, 16) || "New Tab";

    const close = document.createElement("button");
    close.className = "tab-close";
    close.textContent = "×";

    close.onclick = (e) => {
      e.stopPropagation();
      btn.classList.add("closing");
      setTimeout(() => {
        tabs = tabs.filter((t) => t.id !== tab.id);
        if (tabs.length === 0) {
          createTab();
        } else if (activeTab === tab.id) {
          switchTab(tabs[0].id);
        } else {
          renderTabs();
        }
      }, 180);
    };

    btn.onclick = () => switchTab(tab.id);

    btn.appendChild(title);
    btn.appendChild(close);
    tabStrip.appendChild(btn);
  });
}

function switchTab(id) {
  activeTab = id;
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;
  browserFrame.src = tab.url;
  urlInput.value = tab.url;
  renderTabs();
}

// Navigation
function navigate(raw) {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return;

  let url = raw.trim();
  if (!url) {
    url = "https://duckduckgo.com/";
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = getEngine() + encodeURIComponent(raw);
  }

  tab.url = url;
  tab.history.push(url);
  tab.index = tab.history.length - 1;

  browserFrame.src = url;
  urlInput.value = url;
  renderTabs();
}

backBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab || tab.index <= 0) return;
  tab.index--;
  tab.url = tab.history[tab.index];
  browserFrame.src = tab.url;
  urlInput.value = tab.url;
  renderTabs();
};

forwardBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab || tab.index >= tab.history.length - 1) return;
  tab.index++;
  tab.url = tab.history[tab.index];
  browserFrame.src = tab.url;
  urlInput.value = tab.url;
  renderTabs();
};

refreshBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return;
  browserFrame.src = tab.url;
};

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") navigate(urlInput.value);
});

newTabBtn.onclick = () => createTab();

// Sidebar view switching
document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.getAttribute("data-view");
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
  });
});

// Theme
document.querySelectorAll(".theme-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    const theme = dot.getAttribute("data-theme");
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  });
});

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) document.body.setAttribute("data-theme", savedTheme);

// Search engine
if (engineSelect) {
  engineSelect.value = getEngine();
  engineSelect.onchange = () => {
    localStorage.setItem(ENGINE_KEY, engineSelect.value);
  };
}

// Bookmarks
function renderBookmarks() {
  const bookmarks = loadJSON(BOOKMARK_KEY, []);
  bookmarkList.innerHTML = "";
  bookmarks.forEach((bm, idx) => {
    const li = document.createElement("li");
    li.className = "list-item";

    const main = document.createElement("div");
    main.className = "list-item-main";
    main.innerHTML = `<div>${bm.title}</div><div class="list-item-url">${bm.url}</div>`;
    main.onclick = () => navigate(bm.url);

    const del = document.createElement("button");
    del.className = "list-item-btn";
    del.textContent = "Remove";
    del.onclick = () => {
      const arr = loadJSON(BOOKMARK_KEY, []);
      arr.splice(idx, 1);
      saveJSON(BOOKMARK_KEY, arr);
      renderBookmarks();
    };

    li.appendChild(main);
    li.appendChild(del);
    bookmarkList.appendChild(li);
  });
}

favBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return;
  const bookmarks = loadJSON(BOOKMARK_KEY, []);
  bookmarks.push({
    title: tab.url.replace(/^https?:\/\//, "").slice(0, 32),
    url: tab.url
  });
  saveJSON(BOOKMARK_KEY, bookmarks);
  renderBookmarks();
};

// Downloads
function renderDownloads() {
  const downloads = loadJSON(DOWNLOAD_KEY, []);
  downloadList.innerHTML = "";
  downloads
    .slice()
    .reverse()
    .forEach((dl) => {
      const li = document.createElement("li");
      li.className = "list-item";

      const main = document.createElement("div");
      main.className = "list-item-main";
      main.innerHTML = `<div>${dl.name}</div><div class="list-item-url">${dl.url} • ${dl.time}</div>`;
      main.onclick = () => navigate(dl.url);

      li.appendChild(main);
      downloadList.appendChild(li);
    });
}

downloadBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return;
  const downloads = loadJSON(DOWNLOAD_KEY, []);
  downloads.push({
    name: tab.url.replace(/^https?:\/\//, "").slice(0, 32),
    url: tab.url,
    time: new Date().toLocaleTimeString()
  });
  saveJSON(DOWNLOAD_KEY, downloads);
  renderDownloads();
};

// Share / menu (placeholder logging)
shareBtn.onclick = () => {
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return;
  consoleLog("Share: " + tab.url);
};

menuBtn.onclick = () => {
  consoleLog("Menu opened (extend with options later).");
};

// Console
function consoleLog(msg) {
  const div = document.createElement("div");
  div.textContent = "> " + msg;
  consoleOut.appendChild(div);
  consoleOut.scrollTop = consoleOut.scrollHeight;
}

consoleIn.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = consoleIn.value.trim();
    consoleIn.value = "";
    if (!cmd) return;

    if (cmd === "clear") {
      consoleOut.innerHTML = "";
      return;
    }

    if (cmd.startsWith("open ")) {
      navigate(cmd.slice(5));
      return;
    }

    if (cmd.startsWith("search ")) {
      const q = cmd.slice(7);
      navigate(q);
      return;
    }

    consoleLog("Unknown command: " + cmd);
  }
});

// Ctrl+Shift+C → console
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
    const btn = document.querySelector('.side-btn[data-view="console"]');
    if (btn) btn.click();
  }
});

// Init
createTab();
renderBookmarks();
renderDownloads();
