export const ICONS = [
  { id: "lucide:globe", label: "Сайт" },
  { id: "lucide:server", label: "Сервер" },
  { id: "lucide:database", label: "База" },
  { id: "lucide:cloud", label: "Облако" },
  { id: "lucide:activity", label: "Метрики" },
  { id: "lucide:radio", label: "API" },
  { id: "lucide:cpu", label: "CPU" },
  { id: "lucide:box", label: "Сервис" },
  { id: "lucide:rocket", label: "Деплой" },
  { id: "lucide:zap", label: "Быстрый" },
  { id: "simple-icons:git", label: "Git" },
  { id: "simple-icons:github", label: "GitHub" },
  { id: "simple-icons:gitlab", label: "GitLab" },
  { id: "simple-icons:gitea", label: "Gitea" },
  { id: "simple-icons:bitbucket", label: "Bitbucket" },
  { id: "simple-icons:docker", label: "Docker" },
  { id: "simple-icons:kubernetes", label: "Kubernetes" },
  { id: "simple-icons:nginx", label: "Nginx" },
  { id: "simple-icons:apache", label: "Apache" },
  { id: "simple-icons:caddy", label: "Caddy" },
  { id: "simple-icons:postgresql", label: "PostgreSQL" },
  { id: "simple-icons:mysql", label: "MySQL" },
  { id: "simple-icons:mongodb", label: "MongoDB" },
  { id: "simple-icons:redis", label: "Redis" },
  { id: "simple-icons:sqlite", label: "SQLite" },
  { id: "simple-icons:python", label: "Python" },
  { id: "simple-icons:fastapi", label: "FastAPI" },
  { id: "simple-icons:django", label: "Django" },
  { id: "simple-icons:flask", label: "Flask" },
  { id: "simple-icons:nodedotjs", label: "Node.js" },
  { id: "simple-icons:javascript", label: "JavaScript" },
  { id: "simple-icons:react", label: "React" },
  { id: "simple-icons:vuedotjs", label: "Vue" },
  { id: "simple-icons:prometheus", label: "Prometheus" },
  { id: "simple-icons:grafana", label: "Grafana" },
  { id: "simple-icons:cloudflare", label: "Cloudflare" },
  { id: "simple-icons:amazonaws", label: "AWS" },
  { id: "simple-icons:google", label: "Google" },
  { id: "simple-icons:digitalocean", label: "DigitalOcean" },
  { id: "simple-icons:linux", label: "Linux" },
  { id: "simple-icons:fedora", label: "Fedora" },
  { id: "simple-icons:ubuntu", label: "Ubuntu" },
  { id: "simple-icons:debian", label: "Debian" },
  { id: "simple-icons:discord", label: "Discord" },
  { id: "simple-icons:telegram", label: "Telegram" },
  { id: "simple-icons:slack", label: "Slack" },
];

const HOST_HINTS = [
  ["github.com", "simple-icons:github"],
  ["gitlab.com", "simple-icons:gitlab"],
  ["bitbucket.org", "simple-icons:bitbucket"],
  ["gitea.io", "simple-icons:gitea"],
  ["docker.com", "simple-icons:docker"],
  ["grafana.com", "simple-icons:grafana"],
  ["cloudflare.com", "simple-icons:cloudflare"],
  ["amazonaws.com", "simple-icons:amazonaws"],
  ["google.com", "simple-icons:google"],
  ["digitalocean.com", "simple-icons:digitalocean"],
  ["discord.com", "simple-icons:discord"],
  ["t.me", "simple-icons:telegram"],
  ["telegram.org", "simple-icons:telegram"],
];

export function guessIcon(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const hit = HOST_HINTS.find(([suffix]) => host === suffix || host.endsWith(`.${suffix}`));
    return hit ? hit[1] : "lucide:globe";
  } catch {
    return "lucide:globe";
  }
}

const KEY = "pulse.monitor-icons";

export function loadIconMap() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveIcon(monitorId, icon) {
  const map = loadIconMap();
  map[String(monitorId)] = icon;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function iconFor(monitor) {
  return loadIconMap()[String(monitor.id)] || guessIcon(monitor.url);
}
