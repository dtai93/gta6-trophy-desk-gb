export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function gradeWord(grade) {
  if (grade === "platinum") return "Platinum";
  if (grade === "gold") return "Gold";
  if (grade === "silver") return "Silver";
  return "Bronze";
}

export function gradeMark(grade) {
  if (grade === "platinum") return "P";
  if (grade === "gold") return "G";
  if (grade === "silver") return "S";
  return "B";
}

export function isSpoiled(trophy, progress) {
  return progress.spoilers === "hide" && trophy.kinds.includes("story") && !progress.earned[trophy.id];
}

export function displayName(trophy, progress) {
  return isSpoiled(trophy, progress) ? "Story trophy" : trophy.name;
}

export function sourceOf(sources, id) {
  return sources.find((source) => source.id === id) || null;
}

export function tally(pack) {
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let steps = 0;
  let cited = 0;
  for (const trophy of pack.trophies) {
    grades[trophy.grade] += 1;
    for (const step of trophy.steps) {
      steps += 1;
      if (step.source) cited += 1;
    }
  }
  return { total: pack.trophies.length, grades, steps, cited };
}
