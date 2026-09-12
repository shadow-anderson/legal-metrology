const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const contractsRoot = path.resolve(__dirname, "..", "..", "..", "packages", "contracts");
const readSchema = (fileName) => JSON.parse(
  fs.readFileSync(path.join(contractsRoot, fileName), "utf8")
);

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const applicabilityStatus = readSchema("enums/applicability-status.json");
const complianceStatus = readSchema("enums/compliance-status.json");
const applicabilitySchema = readSchema("applicability-result.schema.json");
const ruleResultSchema = readSchema("rule-result.schema.json");

ajv.addSchema(applicabilityStatus);
ajv.addSchema(complianceStatus);
const validateApplicability = ajv.compile(applicabilitySchema);
const validateRule = ajv.compile(ruleResultSchema);

const formatErrors = (errors) => errors
  ?.map((error) => `${error.instancePath || "/"} ${error.message}`)
  .join("; ") || "unknown schema validation error";

const assertValid = (validator, value, label) => {
  if (!validator(value)) {
    throw new Error(`${label} schema validation failed: ${formatErrors(validator.errors)}`);
  }
  return value;
};

const assertValidApplicabilityResult = (value) =>
  assertValid(validateApplicability, value, "Applicability result");

const assertValidRuleResult = (value) =>
  assertValid(validateRule, value, "Rule result");

module.exports = {
  assertValidApplicabilityResult,
  assertValidRuleResult
};