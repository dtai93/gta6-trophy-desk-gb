import { escapeHtml, sourceOf } from "./format.js";

export function renderMissables(root, state) {
  const heads = ["Trophy or watch", "Flag", "Ch 1", "Ch 2", "Ch 3", "Ch 4", "Finale", "After credits"];
  const rows = state.pack.matrix.map((row) => {
    const source = sourceOf(state.sources.sources, row.source);
    const cells = row.cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("");
    const cite = source ? ` <a class="cite" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>` : "";
    return `<tr><th>${escapeHtml(row.label)}${cite}</th><td class="flag ${escapeHtml(row.flag)}">${escapeHtml(row.flagLabel)}</td>${cells}</tr>`;
  }).join("");
  root.innerHTML = `<p class="blurb">Possible can lock a trophy. Watch means do it when it appears, or the trigger is still unconfirmed. Safe means the trophy is still there after the credits. ${escapeHtml(state.sources.readOn)}.</p>
    <table class="matrix"><thead><tr>${heads.map((head) => `<th>${head}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
}
