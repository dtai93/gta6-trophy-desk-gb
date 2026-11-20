import { readFileSync } from "node:fs";

const pack = JSON.parse(readFileSync(new URL("./app/data/trophies.json", import.meta.url)));
const sources = JSON.parse(readFileSync(new URL("./app/data/sources.json", import.meta.url)));
const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const names = [
  "Vice Got a Price!",
  "Just Like Paradise",
  "Paradise Lost",
  "T**s Ass Drug Money",
  "Vice City, Baby!",
  "Top Of The World, Ma",
  "You Gotta Know When to Get Off",
  "Trust",
  "Break the Bank",
  "Family Matters",
  "DWNFALL",
  "Hi-Jacked",
  "Snow Storm",
  "A Long Road",
  "Cunning Stunts",
  "Master of None",
  "The Shootist",
  "Top Fun",
  "Earn Cash, Not Kudos",
  "Baited My Tackle",
  "Stick Fiddler",
  "Road to Rehabilitation",
  "This Was No Boat Accident",
  "The Lone Rider",
  "Strangers & Freaks",
  "Supply & Demand",
  "Spin On This!",
  "Positive Mental Attitude",
  "Fair Game",
  "Don't Touch My Deck",
  "You WAiNKer!",
  "One Last Thing",
  "Hot Together",
  "Retail Therapy",
  "Whip It Good",
  "Gunslinger",
  "Catch Me If You Can",
  "Challenging Tank",
  "Sneakthief",
  "Maximum Withdrawal",
  "A Classic Blitz Play",
  "The Goodtime State",
  "Pest Control",
  "In The Beginning\u2026",
  "Capital Offense",
  "Let\u2019s Go Bowling",
  "Personal Best",
  "Actions Speak Louder",
  "Bad Luck, I Guess",
  "The Truth Is Out There",
  "Ten Pin",
  "Dime on the Dollar",
  "Treat Yo Self",
  "Little Boxes",
  "On the Spot"
];

const hidden = new Set([
  "Just Like Paradise", "Paradise Lost", "T**s Ass Drug Money", "Vice City, Baby!",
  "Top Of The World, Ma", "You Gotta Know When to Get Off", "Trust", "Break the Bank",
  "Family Matters", "DWNFALL", "Hi-Jacked", "Snow Storm", "Road to Rehabilitation",
  "This Was No Boat Accident", "The Lone Rider", "Supply & Demand", "Spin On This!",
  "Fair Game", "Catch Me If You Can", "Challenging Tank", "In The Beginning\u2026",
  "Capital Offense", "Let\u2019s Go Bowling", "Personal Best", "Actions Speak Louder",
  "Bad Luck, I Guess", "The Truth Is Out There", "Ten Pin"
]);

const grades = {
  "Vice Got a Price!": "platinum",
  "A Long Road": "gold",
  "You Gotta Know When to Get Off": "gold",
  "Cunning Stunts": "silver",
  "The Shootist": "silver",
  "Maximum Withdrawal": "silver",
  "Strangers & Freaks": "silver",
  "Don't Touch My Deck": "silver",
  "You WAiNKer!": "silver"
};

const counts = {
  "A Long Road": 100,
  "Cunning Stunts": 250,
  "Master of None": 9,
  "The Shootist": 42,
  "Top Fun": 14,
  "Earn Cash, Not Kudos": 20,
  "Strangers & Freaks": 8,
  "Positive Mental Attitude": 18,
  "Don't Touch My Deck": 3,
  "You WAiNKer!": 100,
  "One Last Thing": 50,
  "Whip It Good": 100,
  "Maximum Withdrawal": 5,
  "The Goodtime State": 52,
  "Pest Control": 9,
  "Actions Speak Louder": 500,
  "Dime on the Dollar": 250000,
  "Treat Yo Self": 100000,
  "Little Boxes": 8,
  "On the Spot": 10
};

const trophies = pack.trophies;
if (trophies.length !== 55) fail(`expected 55 trophies, got ${trophies.length}`);
const byName = new Map(trophies.map((trophy) => [trophy.name, trophy]));
for (const name of names) {
  const trophy = byName.get(name);
  if (!trophy) fail(`missing ${name}`);
  else if (!String(trophy.guide).trim()) fail(`blank guide ${name}`);
}
if (byName.size !== 55) fail("duplicate or extra names");

let cited = 0;
let steps = 0;
const sourceIds = new Set(sources.sources.map((source) => source.id));
const used = new Set();
for (const trophy of trophies) {
  const expect = grades[trophy.name] ?? "bronze";
  if (trophy.grade !== expect) fail(`${trophy.name} grade ${trophy.grade}`);
  if (Boolean(trophy.hidden) !== hidden.has(trophy.name)) fail(`${trophy.name} hidden flag`);
  if (Object.prototype.hasOwnProperty.call(counts, trophy.name) && trophy.count !== counts[trophy.name]) {
    fail(`${trophy.name} count ${trophy.count}`);
  }
  for (const step of trophy.steps) {
    steps += 1;
    if (!step.source || !sourceIds.has(step.source)) fail(`${trophy.name} uncited step`);
    else cited += 1;
    used.add(step.source);
  }
}
for (const stage of pack.stages) used.add(stage.source);
for (const row of pack.matrix) used.add(row.source);
for (const id of sourceIds) if (!used.has(id)) fail(`unused source ${id}`);
if (pack.stages.length !== 6) fail("roadmap stages");
if (!pack.matrix.length) fail("empty missables");
if (sources.sources.length < 12) fail("too few sources");
if (cited !== steps) fail(`cited ${cited} of ${steps}`);

const tally = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const trophy of trophies) tally[trophy.grade] += 1;
if (tally.platinum !== 1 || tally.gold !== 2 || tally.silver !== 6 || tally.bronze !== 46) {
  fail(`grades ${JSON.stringify(tally)}`);
}
if (hidden.size !== 28) fail("hidden set");

if (!process.exitCode) {
  console.log(`ok 55 trophies, ${cited}/${steps} steps cited, ${sources.sources.length} sources, hidden ${[...trophies].filter((t) => t.hidden).length}`);
}
