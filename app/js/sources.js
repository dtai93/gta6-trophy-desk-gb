import { escapeHtml } from "./format.js";

export function renderSources(root, state) {
  const columns = state.sources.columns;
  const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const rows = state.sources.sources.map((source) => {
    const marks = columns.map((column) => {
      const on = source.covers.includes(column);
      return `<td class="${on ? "mark-yes" : "mark-no"}">${on ? "●" : "·"}</td>`;
    }).join("");
    return `<tr><th><a class="src-name" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a><span class="src-page">${escapeHtml(source.page)}</span></th>${marks}</tr>`;
  }).join("");
  root.innerHTML = `<p class="blurb">${state.sources.sources.length} public pages read ${escapeHtml(state.sources.readOn)}. A brass dot means that page supports the column. Nothing here is fetched until you open a link.</p>
    <table class="coverage"><thead><tr><th>Source</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
