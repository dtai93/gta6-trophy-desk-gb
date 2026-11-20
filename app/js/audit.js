import { tally } from "./format.js";

export function paintAudit(pack, sources) {
  const stats = tally(pack);
  const grades = stats.grades;
  document.querySelector("#fact-count").textContent = `${stats.total}/55 official trophies`;
  document.querySelector("#fact-grades").innerHTML =
    `${grades.platinum} platinum, ${grades.gold} gold, ${grades.silver} silver, ${grades.bronze} bronze ` +
    `<span class="abbr">${grades.platinum}P ${grades.gold}G ${grades.silver}S ${grades.bronze}B</span>`;
  document.querySelector("#fact-steps").textContent = `${stats.cited}/${stats.steps} steps cited`;
  document.querySelector("#fact-sources").textContent = `${sources.sources.length} sources read · ${sources.readOn}`;
}
