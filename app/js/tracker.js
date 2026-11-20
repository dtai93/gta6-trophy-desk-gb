import { escapeHtml, gradeWord, gradeMark, isSpoiled, displayName, sourceOf } from "./format.js";

const KINDS = [
  ["all", "All kinds"],
  ["story", "Story"],
  ["missable", "Missable"],
  ["collectibles", "Collectibles"],
  ["activities", "Activities"],
  ["online", "Online"]
];

export function renderTracker(root, state) {
  const shown = state.pack.trophies.filter((trophy) => matches(trophy, state));
  const selected = state.pack.trophies.find((trophy) => trophy.id === state.selected) || shown[0] || null;
  const earnedCount = state.pack.trophies.filter((trophy) => state.progress.earned[trophy.id]).length;
  root.innerHTML = `
    <div class="toolbar">
      <label>Kind <select id="filter-kind">${options(KINDS, state.filters.kind)}</select></label>
      <label>Grade <select id="filter-grade">${options([["all", "All grades"], ["platinum", "Platinum"], ["gold", "Gold"], ["silver", "Silver"], ["bronze", "Bronze"]], state.filters.grade)}</select></label>
      <label>Earned <select id="filter-earned">${options([["all", "Earned and not"], ["earned", "Earned"], ["unearned", "Not earned"]], state.filters.earned)}</select></label>
      <label>Spoilers <select id="spoiler">${options([["hide", "Hide story until earned"], ["show", "Show story names"]], state.progress.spoilers)}</select></label>
      <span class="progress-count">${earnedCount} / ${state.pack.trophies.length} earned${state.demo ? " · demo" : ""}</span>
      <span class="grow">
        <button type="button" id="export">Export</button>
        <button type="button" id="import-btn">Import</button>
        <input id="import-file" type="file" accept="application/json,.json" hidden>
      </span>
    </div>
    <div class="split">
      <ol class="list" id="list">${shown.map((trophy) => row(trophy, state, selected)).join("") || `<li class="empty">No trophies match these filters. The official list has no online trophies.</li>`}</ol>
      <article id="guide" class="guide">${selected ? guide(selected, state) : `<p class="empty">Select a trophy.</p>`}</article>
    </div>`;
  const current = root.querySelector(".row[aria-current='true']");
  if (current && state.scrollMode === "end") current.scrollIntoView({ block: "end" });
}

function matches(trophy, state) {
  if (state.filters.grade !== "all" && trophy.grade !== state.filters.grade) return false;
  const on = Boolean(state.progress.earned[trophy.id]);
  if (state.filters.earned === "earned" && !on) return false;
  if (state.filters.earned === "unearned" && on) return false;
  if (state.filters.kind === "all") return true;
  if (state.filters.kind === "online") return false;
  return trophy.kinds.includes(state.filters.kind);
}

function options(pairs, current) {
  return pairs.map(([value, label]) => `<option value="${value}"${value === current ? " selected" : ""}>${label}</option>`).join("");
}

function row(trophy, state, selected) {
  const hidden = isSpoiled(trophy, state.progress);
  const on = Boolean(state.progress.earned[trophy.id]);
  return `<li class="row${hidden ? " spoiled" : ""}" data-id="${escapeHtml(trophy.id)}" aria-current="${selected && selected.id === trophy.id ? "true" : "false"}">
    <input type="checkbox" data-earn="${escapeHtml(trophy.id)}" ${on ? "checked" : ""} aria-label="Earned">
    <span class="mark ${trophy.grade}">${gradeMark(trophy.grade)}</span>
    <span><span class="name">${escapeHtml(displayName(trophy, state.progress))}</span><p class="desc">${escapeHtml(hidden ? "Name and description stay hidden until you earn it." : trophy.description)}</p></span>
  </li>`;
}

function guide(trophy, state) {
  const hidden = isSpoiled(trophy, state.progress);
  const count = typeof trophy.count === "number" ? ` · PlayStation counter ${trophy.count}` : "";
  const flag = trophy.miss === "possible" ? " · possibly missable" : trophy.miss === "watch" ? " · watch" : "";
  if (hidden) {
    return `<p class="kicker">Official · story spoiler</p><h2>Story trophy</h2><p class="official">Turn spoilers to “Show story names”, or mark this trophy earned, to read the official line and the walkthrough.</p><p class="meta">${gradeWord(trophy.grade)} · hidden on PS5 until earned${flag}</p>`;
  }
  const steps = trophy.steps.map((step) => {
    const source = sourceOf(state.sources.sources, step.source);
    const cite = source
      ? `<a class="cite" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`
      : `<span class="cite">uncited</span>`;
    return `<li>${escapeHtml(step.text)} ${cite}</li>`;
  }).join("");
  return `<p class="kicker">Official</p>
    <h2>${escapeHtml(trophy.name)}</h2>
    <p class="official">${escapeHtml(trophy.description)}</p>
    <p class="meta">${gradeWord(trophy.grade)} · ${trophy.hidden ? "hidden on PS5 until earned" : "visible from the start"}${count}${flag}</p>
    <p class="lead">${escapeHtml(trophy.guide)}</p>
    <ol class="steps">${steps}</ol>`;
}
