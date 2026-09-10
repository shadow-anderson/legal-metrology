import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeRule } from "./ruleNormalizer.js";

const currentFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(
  path.dirname(currentFile),
  "..",
  "..",
  ".."
);
const rulesRoot = path.join(repositoryRoot, "rules");
const rulesPath = path.join(rulesRoot, "definitions");

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new Error(
      `Unable to load rule-engine JSON file "${filePath}": ${error.message}`,
      { cause: error }
    );
  }
};

export const loadAllRules = () => {

  const files = fs
    .readdirSync(rulesPath)
    .filter(file => file.endsWith(".json"))
    .sort((a, b) => {
      const numberA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const numberB = parseInt(b.match(/\d+/)?.[0] || "0", 10);

      return numberA - numberB;
    });

  const rules = files.map((file) =>
    normalizeRule(readJson(path.join(rulesPath, file)))
  );

  return rules;
};

export const loadRulePack = () => {
  const manifest = readJson(path.join(rulesRoot, "manifest.json"));
  const schedulesPath = path.join(rulesRoot, "schedules");
  const testCasesPath = path.join(rulesRoot, "test-cases");

  const schedules = manifest.schedules.map((file) => ({
    file,
    data: readJson(path.join(schedulesPath, file))
  }));
  const testCases = manifest.test_cases.map((file) => ({
    file,
    data: readJson(path.join(testCasesPath, file))
  }));

  return {
    manifest,
    rules: loadAllRules(),
    schedules,
    testCases
  };
};