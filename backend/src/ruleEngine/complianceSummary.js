const STATUS_KEYS = [
  "PASS",
  "FAIL",
  "NOT_APPLICABLE",
  "REQUIRES_VERIFICATION"
];

export const createComplianceSummary = (
  results = [],
  totalRulesExecuted = new Set(results.map((result) => result.ruleId)).size,
  inspectionId = results[0]?.inspectionId
) => {
  if (!Array.isArray(results)) {
    throw new TypeError("Rule results must be an array");
  }

  const summary = Object.fromEntries(
    STATUS_KEYS.map((status) => [
      status,
      results.filter((result) => result.status === status).length
    ])
  );

  const overallStatus = summary.FAIL > 0
    ? "FAIL"
    : summary.REQUIRES_VERIFICATION > 0
      ? "REQUIRES_VERIFICATION"
      : "PASS";

  return {
    inspectionId,
    totalRulesExecuted,
    totalChecks: results.length,
    summary,
    overallStatus
  };
};

export const summarizeCompliance = createComplianceSummary;

export default createComplianceSummary;
