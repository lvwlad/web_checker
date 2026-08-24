import { ICONS, guessIcon, saveIcon, iconFor } from "./icons.js";

const USER_KEY = "pulse.user";

const authView = document.getElementById("auth-view");
const appView = document.getElementById("app-view");
const authError = document.getElementById("auth-error");
const appError = document.getElementById("app-error");
const dialogError = document.getElementById("dialog-error");
const grid = document.getElementById("monitor-grid");
const empty = document.getElementById("empty-state");
const dialog = document.getElementById("monitor-dialog");
const iconGrid = document.getElementById("icon-grid");
const iconValue = document.getElementById("icon-value");
const iconSearch = document.getElementById("icon-search");

let selectedIcon = "lucide:globe";
let lastChecks = {};

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    const message =
      data?.detail?.msg ||
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : `Ошибка ${res.status}`);
    const err = new Error(typeof message === "string" ? message : JSON.stringify(message));
    err.status = res.status;
    throw err;
  }
  return data;
}

function showError(el, message) {
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

function currentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch { return null; }
}

function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function showApp() {
  const user = currentUser();
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.getElementById("user-chip").textContent = user?.email || user?.username || "сессия";
}

function showAuth() {
  appView.classList.add("hidden");
  authView.classList.remove("hidden");
}

function tone(status) {
  if (!status) return "";
  if (status >= 200 && status < 300) return "ok";
  if (status >= 300 && status < 500) return "warn";
  return "bad";
}

function ms(value) {
  if (value == null) return "—";
  return `${Math.round(value * 1000)} ms`;
}

function renderIcons(filter = "") {
  const q = filter.trim().toLowerCase();
  iconGrid.innerHTML = "";
  ICONS.filter((icon) => !q || icon.label.toLowerCase().includes(q) || icon.id.includes(q))
    .forEach((icon) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-opt" + (icon.id === selectedIcon ? " is-selected" : "");
      btn.title = icon.label;
      btn.innerHTML = `<iconify-icon icon="${icon.id}" width="22"></iconify-icon>`;
      btn.addEventListener("click", () => {
        selectedIcon = icon.id;
        iconValue.value = icon.id;
        renderIcons(iconSearch.value);
      });
      iconGrid.appendChild(btn);
    });
}

function cardHtml(monitor) {
  const check = lastChecks[monitor.url] || lastChecks[monitor.id] || {};
  const status = check.status ?? check.response_status;
  const icon = iconFor(monitor);
  return `
    <article class="card" data-id="${monitor.id}" data-url="${monitor.url}">
      <div class="card-head">
        <div class="icon-badge">
          <iconify-icon icon="${icon}"></iconify-icon>
        </div>
        <div>
          <h3>${escapeHtml(monitor.name || hostOf(monitor.url))}</h3>
          <p class="url">${escapeHtml(monitor.url)}</p>
        </div>
        <span class="status-dot ${tone(status)}"></span>
      </div>
      <div class="meta">
        <span>${status ? `HTTP ${status}` : "ещё не проверяли"}</span>
        <span>${ms(check.response_time)}</span>
      </div>
      <button class="btn ghost check-one" type="button">Проверить</button>
    </article>
  `;
}

function hostOf(url) {
  try { return new URL(url).host; } catch { return url; }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadMonitors() {
  showError(appError, "");
  const monitors = await api("/api/monitor/");
  empty.classList.toggle("hidden", monitors.length > 0);
  grid.innerHTML = monitors.map(cardHtml).join("");
}

async function checkOne(id, card) {
  card.classList.add("busy");
  card.querySelector(".status-dot").classList.add("busy");
  try {
    const log = await api(`/api/monitor/${id}/check`);
    lastChecks[id] = log;
    lastChecks[card.dataset.url] = {
      status: log.response_status,
      response_time: log.response_time,
    };
    await loadMonitors();
  } finally {
    card.classList.remove("busy");
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    document.getElementById("login-form").classList.toggle("hidden", tab.dataset.tab !== "login");
    document.getElementById("register-form").classList.toggle("hidden", tab.dataset.tab !== "register");
    showError(authError, "");
  });
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const user = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setUser(user);
    showApp();
    await loadMonitors();
  } catch (err) {
    showError(authError, err.message);
  }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const user = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setUser(user);
    showApp();
    await loadMonitors();
  } catch (err) {
    showError(authError, err.message);
  }
});

document.getElementById("logout").addEventListener("click", () => {
  document.cookie = "token=; Max-Age=0; path=/";
  setUser(null);
  lastChecks = {};
  showAuth();
});

document.getElementById("add-monitor").addEventListener("click", () => {
  document.getElementById("monitor-form").reset();
  selectedIcon = "lucide:globe";
  iconValue.value = selectedIcon;
  iconSearch.value = "";
  showError(dialogError, "");
  renderIcons();
  dialog.showModal();
});

document.getElementById("cancel-dialog").addEventListener("click", () => dialog.close());

document.querySelector('input[name="url"]').addEventListener("input", (e) => {
  if (!iconSearch.value) {
    selectedIcon = guessIcon(e.target.value);
    iconValue.value = selectedIcon;
    renderIcons();
  }
});

iconSearch.addEventListener("input", () => renderIcons(iconSearch.value));

document.getElementById("monitor-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const monitor = await api("/api/monitor/", {
      method: "POST",
      body: JSON.stringify({
        url: form.get("url"),
        monitor_name: form.get("monitor_name") || null,
      }),
    });
    if (monitor?.id) saveIcon(monitor.id, form.get("icon") || selectedIcon);
    dialog.close();
    await loadMonitors();
  } catch (err) {
    showError(dialogError, err.message);
  }
});

grid.addEventListener("click", async (e) => {
  const btn = e.target.closest(".check-one");
  if (!btn) return;
  const card = btn.closest(".card");
  try {
    showError(appError, "");
    await checkOne(card.dataset.id, card);
  } catch (err) {
    showError(appError, err.message);
  }
});

document.getElementById("check-all").addEventListener("click", async () => {
  const btn = document.getElementById("check-all");
  btn.disabled = true;
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.add("busy");
    card.querySelector(".status-dot")?.classList.add("busy");
  });
  try {
    showError(appError, "");
    const results = await api("/api/monitor/all/check");
    (results || []).forEach((item) => {
      lastChecks[item.site] = item;
    });
    await loadMonitors();
  } catch (err) {
    showError(appError, err.message);
  } finally {
    btn.disabled = false;
  }
});

(async function boot() {
  renderIcons();
  if (!currentUser()) {
    showAuth();
    return;
  }
  showApp();
  try {
    await loadMonitors();
  } catch (err) {
    setUser(null);
    showAuth();
    showError(authError, "Сессия истекла, войдите снова.");
  }
})();
