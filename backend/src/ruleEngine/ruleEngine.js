import { evaluateCheck } from "./checkEvaluator.js";

import {
  createRuleResult
} from "../resultGenerator/ruleResult.js";
import {
  normalizeInspectionData
} from "../inspections/inspectionAdapter.js";
import {
  createComplianceSummary
} from "./complianceSummary.js";
import { assertValidRuleResult } from "../resultGenerator/schemaValidator.js";


export const executeRuleEngine = (
  appliedRules,
  productData,
  inspectionId,
  engineOptions = {}
) => {
  if (!Array.isArray(appliedRules)) {
    throw new TypeError("Applied rules must be an array");
  }

  const results = [];
  const normalizedInspection =
    productData?.product?.net_quantity
      ? productData
      : normalizeInspectionData(productData);
  const applicability = engineOptions?.status
    ? engineOptions
    : engineOptions?.applicability || null;


  // ========================================
  // EXECUTE EACH RULE
  // ========================================

  for (const rule of appliedRules) {
    if (!rule || typeof rule !== "object" || !rule.rule_id) {
      results.push(
        assertValidRuleResult(createRuleResult({
          inspectionId,
          ruleId: rule?.rule_id || "UNKNOWN_RULE",
          ruleVersion: rule?.version || "UNKNOWN",
          checkId: "INVALID_RULE",
          status: "REQUIRES_VERIFICATION",
          message: "Rule definition is missing or invalid",
          confidence: 0,
          resultSource: "SYSTEM"
        }))
      );
      continue;
    }


    // ======================================
    // RULE HAS NO EXECUTABLE CHECKS
    // ======================================

    if (
      !rule.checks ||
      rule.checks.length === 0
    ) {

      results.push(

        assertValidRuleResult(createRuleResult({

          inspectionId,

          ruleId:
            rule.rule_id,

          ruleVersion:
            rule.version,

          checkId:
            `${rule.rule_id}_COMPLIANCE`,

          status:
            "REQUIRES_VERIFICATION",

          message:
            "This requirement requires specialized evaluation or human verification",

          observedValue:
            null,

          requiredValue:
            rule.source_text || null,

          confidence:
            0,

          resultSource:
            "SYSTEM"

        }))

      );

      continue;
    }


    // ======================================
    // EXECUTE EVERY CHECK
    // ======================================

    for (const check of rule.checks) {

      const checkResult =
        evaluateCheck(
          check,
          normalizedInspection
        );


      // ====================================
      // DETERMINE CONTRACT STATUS
      // ====================================

      let status =
        checkResult.status;


      if (status === "VERIFY") {

        status =
          "REQUIRES_VERIFICATION";

      }


      // ====================================
      // DETERMINE CONFIDENCE
      // ====================================

      let confidence = 0;


      if (
        status === "PASS" ||
        status === "FAIL" ||
        status === "NOT_APPLICABLE"
      ) {

        confidence = 1;

      }


      // ====================================
      // CREATE CONTRACT RESULT
      // ====================================

      results.push(

        assertValidRuleResult(createRuleResult({

          inspectionId,

          ruleId:
            rule.rule_id,

          ruleVersion:
            rule.version,

          checkId:
            check.check_id ||
            check.id ||
            `${rule.rule_id}_CHECK`,

          status,

          message:
            checkResult.reason ||
            "Rule check evaluated",

          observedValue:
            checkResult.observedValue ?? null,

          requiredValue:
            checkResult.requiredValue ?? null,

          confidence,

          resultSource:
            "SYSTEM"

        }))

      );

    }

  }


  // ========================================
  // RETURN ENGINE RESULT
  // ========================================

  const complianceSummary = createComplianceSummary(
    results,
    appliedRules.length,
    inspectionId
  );
  return {
    inspectionId,
    ...(applicability ? { applicability } : {}),
    totalRulesExecuted:
      appliedRules.length,

    totalResults:
      results.length,

    results,
    ruleResults: results,
    complianceSummary
  };
};