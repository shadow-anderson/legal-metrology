import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const currentFile = fileURLToPath(import.meta.url);
const contractsRoot = path.resolve(path.dirname(currentFile), "..", "..", "..", "packages", "contracts");
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

export const assertValidApplicabilityResult = (value) =>
  assertValid(validateApplicability, value, "Applicability result");

export const assertValidRuleResult = (value) =>
  assertValid(validateRule, value, "Rule result");
