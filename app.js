document.addEventListener("DOMContentLoaded", () => {

    const views = {
        browser: document.getElementById("browserView"),
        bookmarks: document.getElementById("bookmarksView"),
        downloads: document.getElementById("downloadsView"),
        console: document.getElementById("consoleView")
    };

    function showView(name) {
        Object.values(views).forEach(v => v.classList.add("hidden"));
        views[name].classList.remove("hidden");
    }

    document.querySelectorAll(".side-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            showView(btn.dataset.view);
        });
    });

    const urlbar = document.getElementById("urlbar");
    const goBtn = document.getElementById("goBtn");
    const webframe = document.getElementById("webframe");

    function loadURL() {
        let url = urlbar.value.trim();
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }
        webframe.src = url;
    }

    goBtn.addEventListener("click", loadURL);
    urlbar.addEventListener("keydown", e => {
        if (e.key === "Enter") loadURL();
    });

    const consoleOutput = document.getElementById("consoleOutput");
    const consoleInput = document.getElementById("consoleInput");
    const runJS = document.getElementById("runJS");

    runJS.addEventListener("click", () => {
        try {
            const result = eval(consoleInput.value);
            consoleOutput.value += "> " + result + "\n";
        } catch (err) {
            consoleOutput.value += "ERR: " + err + "\n";
        }
    });

});
