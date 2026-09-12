const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadRulePack } = require("./ruleLoader");

const pack = loadRulePack();
const repositoryRoot = path.resolve(
  __dirname,
  "..",
  "..",
  ".."
);

assert.equal(pack.rules.length, 34, "Expected definitions R1-R34");
assert.equal(pack.schedules.length, pack.manifest.schedules.length);
assert.equal(pack.testCases.length, pack.manifest.test_cases.length);
assert.ok(Array.isArray(pack.manifest.contracts));
for (const contract of pack.manifest.contracts) {
  assert.ok(
    fs.existsSync(path.join(repositoryRoot, "rules", contract)),
    `Missing contract: ${contract}`
  );
}

const ruleIds = pack.rules.map((rule) => rule.rule_id);
assert.deepEqual(
  ruleIds,
  Array.from({ length: 34 }, (_, index) => `R${index + 1}`)
);

for (const rule of pack.rules) {
  assert.ok(rule.version, `${rule.rule_id} is missing version`);
  assert.ok(Array.isArray(rule.checks), `${rule.rule_id} is missing checks`);
  assert.ok(
    rule.checks.every((check) => check.check_id && check.type),
    `${rule.rule_id} has an unnormalized check`
  );
}

console.log(
  `Rule pack validation passed: ${pack.rules.length} rules, ` +
  `${pack.schedules.length} schedules, ${pack.testCases.length} test suites`
);
