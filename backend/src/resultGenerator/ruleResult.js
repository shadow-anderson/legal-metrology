import crypto from "crypto";

const VALID_STATUSES = [
  "PASS",
  "FAIL",
  "REQUIRES_VERIFICATION",
  "NOT_APPLICABLE"
];

const VALID_RESULT_SOURCES = [
  "SYSTEM",
  "OFFICER_REEVALUATION"
];

const VALID_VERIFICATION_ACTIONS = [
  "CONFIRMED",
  "REJECTED"
];

const asSchemaObject = (value) => (
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? value
    : { value }
);

export const createRuleResult = ({
  inspectionId,
  ruleId,
  ruleVersion,
  checkId,
  status,
  message,
  observedValue = null,
  requiredValue = null,
  confidence = 1,
  resultSource = "SYSTEM",
  verificationAction = null,
  verifiedByOfficerId = null,
  verifiedAt = null
}) => {

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid compliance status: ${status}`
    );
  }

  if (!VALID_RESULT_SOURCES.includes(resultSource)) {
    throw new Error(
      `Invalid result source: ${resultSource}`
    );
  }

  if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
    throw new Error(
      "Confidence must be between 0 and 1"
    );
  }

  if (
    verificationAction !== null &&
    !VALID_VERIFICATION_ACTIONS.includes(verificationAction)
  ) {
    throw new Error(
      `Invalid verification action: ${verificationAction}`
    );
  }

  const result = {
    id: crypto.randomUUID(),

    inspectionId,

    ruleId,

    ruleVersion,

    checkId,

    status,

    message,

    confidence,

    resultSource,

    verificationAction,

    verifiedByOfficerId,

    verifiedAt,

    createdAt: new Date().toISOString()
  };

  // The contract permits these fields only as objects. Preserve scalar
  // evaluator values without returning an invalid result.
  if (observedValue !== null && observedValue !== undefined) {
    result.observedValue = asSchemaObject(observedValue);
  }
  if (requiredValue !== null && requiredValue !== undefined) {
    result.requiredValue = asSchemaObject(requiredValue);
  }

  return result;
};