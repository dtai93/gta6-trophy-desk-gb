import { escapeHtml, displayName, sourceOf } from "./format.js";

export function renderRoadmap(root, state) {
  const cards = state.pack.stages.map((stage) => {
    const trophies = state.pack.trophies.filter((trophy) => trophy.stage === stage.n);
    const source = sourceOf(state.sources.sources, stage.source);
    const cite = source ? `<a class="cite" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>` : "";
    const chips = trophies.map((trophy) => `<li class="chip">${escapeHtml(displayName(trophy, state.progress))}</li>`).join("");
    return `<article class="card"><p class="stage-n">Stage ${stage.n}</p><h2>${escapeHtml(stage.title)}</h2><p class="why">${escapeHtml(stage.why)} ${cite}</p><ul class="chips">${chips}</ul></article>`;
  }).join("");
  root.innerHTML = `<div class="cards">${cards}</div>`;
}
