import { loadProgress, saveProgress, downloadProgress, readImport } from "./store.js";
import { paintAudit } from "./audit.js";
import { renderTracker } from "./tracker.js";
import { renderRoadmap } from "./roadmap.js";
import { renderMissables } from "./missables.js";
import { renderSources } from "./sources.js";

const TABS = ["tracker", "roadmap", "missables", "sources"];
const DEMO_EARNED = ["just-like-paradise", "paradise-lost", "ts-ass-drug-money", "trust"];

const state = {
  pack: null,
  sources: null,
  progress: loadProgress(),
  tab: "tracker",
  selected: "strangers-and-freaks",
  filters: { kind: "all", grade: "all", earned: "all" },
  demo: false,
  scrollMode: "nearest"
};

const params = new URLSearchParams(location.search);
if (TABS.includes(params.get("tab"))) state.tab = params.get("tab");
if (params.get("trophy")) state.selected = params.get("trophy");
for (const key of ["kind", "grade", "earned"]) {
  if (params.get(key)) state.filters[key] = params.get(key);
}
if (params.get("spoilers") === "show" || params.get("spoilers") === "hide") {
  state.progress.spoilers = params.get("spoilers");
}
state.demo = params.get("demo") === "1";
if (state.demo) {
  state.progress = {
    earned: Object.fromEntries(DEMO_EARNED.map((id) => [id, true])),
    spoilers: params.get("spoilers") === "show" ? "show" : "hide"
  };
  state.scrollMode = "end";
}

const panels = {
  tracker: document.querySelector("#panel-tracker"),
  roadmap: document.querySelector("#panel-roadmap"),
  missables: document.querySelector("#panel-missables"),
  sources: document.querySelector("#panel-sources")
};

document.querySelector("#tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.tab = button.dataset.tab;
  state.scrollMode = "nearest";
  show();
});

document.querySelector("#workspace").addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "filter-kind") state.filters.kind = target.value;
  if (target.id === "filter-grade") state.filters.grade = target.value;
  if (target.id === "filter-earned") state.filters.earned = target.value;
  if (target.id === "spoiler") {
    state.progress.spoilers = target.value;
    persist();
  }
  if (target.dataset.earn) {
    state.progress.earned[target.dataset.earn] = target.checked;
    persist();
  }
  if (target.id === "import-file" && target.files && target.files[0]) {
    readImport(target.files[0]).then((progress) => {
      state.progress = progress;
      state.demo = false;
      persist();
      note("Imported progress.");
      show();
    }).catch(() => note("That file is not a Sunline progress export."));
    return;
  }
  state.scrollMode = "nearest";
  show();
});

document.querySelector("#workspace").addEventListener("click", (event) => {
  if (event.target.id === "export") {
    downloadProgress(state.progress);
    note("Exported sunline-trophy-desk.json.");
    return;
  }
  if (event.target.id === "import-btn") {
    document.querySelector("#import-file").click();
    return;
  }
  const row = event.target.closest(".row");
  if (row && !event.target.dataset.earn) {
    state.selected = row.dataset.id;
    state.scrollMode = "nearest";
    show();
  }
});

Promise.all([
  fetch("data/trophies.json").then((response) => response.json()),
  fetch("data/sources.json").then((response) => response.json())
]).then(([pack, sources]) => {
  state.pack = pack;
  state.sources = sources;
  if (!pack.trophies.some((trophy) => trophy.id === state.selected)) {
    state.selected = "strangers-and-freaks";
  }
  paintAudit(pack, sources);
  show();
}).catch(() => note("The desk could not read its local data files."));

function show() {
  if (!state.pack) return;
  for (const tab of TABS) {
    const on = tab === state.tab;
    document.querySelector(`#tab-${tab}`).setAttribute("aria-selected", on ? "true" : "false");
    panels[tab].hidden = !on;
  }
  renderTracker(panels.tracker, state);
  renderRoadmap(panels.roadmap, state);
  renderMissables(panels.missables, state);
  renderSources(panels.sources, state);
  state.scrollMode = "nearest";
}

function persist() {
  const known = new Set(state.pack.trophies.map((trophy) => trophy.id));
  for (const id of Object.keys(state.progress.earned)) {
    if (!known.has(id)) delete state.progress.earned[id];
  }
  if (!state.demo) saveProgress(state.progress);
}

function note(message) {
  const line = document.querySelector("#note");
  line.hidden = false;
  line.textContent = message;
}
