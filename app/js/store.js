const KEY = "sunline-trophy-desk-v1";

export function emptyProgress() {
  return { earned: {}, spoilers: "hide" };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return normalize(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(payload(progress)));
}

export function downloadProgress(progress) {
  const blob = new Blob([JSON.stringify(payload(progress), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sunline-trophy-desk.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function readImport(file) {
  return file.text().then((text) => normalize(JSON.parse(text)));
}

function payload(progress) {
  return {
    app: "Sunline Trophy Desk",
    version: 1,
    earned: Object.keys(progress.earned).filter((id) => progress.earned[id]),
    spoilers: progress.spoilers === "show" ? "show" : "hide"
  };
}

function normalize(data) {
  const earned = {};
  const list = Array.isArray(data && data.earned)
    ? data.earned
    : data && data.earned && typeof data.earned === "object"
      ? Object.keys(data.earned).filter((id) => data.earned[id])
      : [];
  for (const id of list) {
    if (typeof id === "string") earned[id] = true;
  }
  return { earned, spoilers: data && data.spoilers === "show" ? "show" : "hide" };
}
