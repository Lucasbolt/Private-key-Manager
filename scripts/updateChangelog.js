#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CHANGELOG_FILE = path.resolve("CHANGELOG.md");

// Parse conventional commit message into type + description
function parseCommitMessage(message) {
  const match = message.match(/^(\w+)(\(.+\))?:\s(.+)$/);
  if (!match) return { type: "other", description: message };
  return { type: match[1], description: match[3] };
}

// Group commits into sections
function groupCommits(commits) {
  const sections = {
    feat: [],
    fix: [],
    docs: [],
    chore: [],
    refactor: [],
    test: [],
    other: [],
  };

  commits.forEach((c) => {
    const { type, description } = parseCommitMessage(c.message);
    const entry = `- ${description} (${c.hash})`;
    if (sections[type]) {
      sections[type].push(entry);
    } else {
      sections.other.push(entry);
    }
  });

  return sections;
}

// Fetch commit history since last tag or last N commits
function getCommitHistory(limit = 50) {
  try {
    const log = execSync(
      `git log --pretty=format:"%h|%s" -n ${limit}`,
      { encoding: "utf-8" }
    );
    return log
      .trim()
      .split("\n")
      .map((line) => {
        const [hash, message] = line.split("|");
        return { hash, message };
      });
  } catch (err) {
    console.error("❌ Failed to read commit history:", err.message);
    process.exit(1);
  }
}

function formatSection(title, commits) {
  return commits.length ? `### ${title}\n${commits.join("\n")}\n` : "";
}

function updateChangelog(sections) {
  let changelogContent = "";

  if (fs.existsSync(CHANGELOG_FILE)) {
    changelogContent = fs.readFileSync(CHANGELOG_FILE, "utf-8");
  }

  const newSection = [
    `## ${new Date().toISOString().split("T")[0]}`,
    formatSection("🚀 Features", sections.feat),
    formatSection("🐛 Fixes", sections.fix),
    formatSection("📝 Docs", sections.docs),
    formatSection("🔧 Chores", sections.chore),
    formatSection("♻️ Refactors", sections.refactor),
    formatSection("🧪 Tests", sections.test),
    formatSection("🔹 Other", sections.other),
    "",
  ].join("\n");

  const updated = `${newSection}\n${changelogContent}`;

  fs.writeFileSync(CHANGELOG_FILE, updated, "utf-8");
  console.log("✅ CHANGELOG.md updated successfully!");
}

function main() {
  const commits = getCommitHistory(50); // last 50 commits
  if (commits.length === 0) {
    console.log("⚠️ No commits found.");
    return;
  }

  const sections = groupCommits(commits);
  updateChangelog(sections);
}

main();
