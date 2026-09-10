// ================================================
// RULE ENGINE PIPELINE
// ================================================

import {
  normalizeInspectionData
} from "./ruleNormalizer.js";

import {
  findApplicableRules
} from "./findApplicableRules.js";

import {
  executeRuleEngine
} from "./ruleEngine.js";

import {
  validateRuleEngineRequest
} from "../inspections/ruleEngineRequestValidation.js";

import {
  normalizeAiOutput
} from "../inspections/normalizeAiOutput.js";


// ================================================
// MAIN FUNCTION
// ================================================

export const runComplianceCheck = (
  inspectionData
) => {

  // ==============================================
  // STEP 1 — CHECK INPUT
  // ==============================================

  if (!inspectionData) {

    throw new Error(
      "Rule engine request data is required"
    );

  }


  // ==============================================
  // STEP 2 — VALIDATE RULE ENGINE REQUEST
  // ==============================================

  const validatedRequest =
    validateRuleEngineRequest(
      inspectionData
    );


  // ==============================================
  // STEP 3 — NORMALIZE EXTRACTED FIELDS
  // ==============================================

  const normalizedAiOutput =
    validatedRequest.aiOutput
      ? normalizeAiOutput(
        validatedRequest.aiOutput
      )
      : validatedRequest;
  ;

  const normalizedInspection =
    normalizedAiOutput?.product?.net_quantity
      ? {
        inspectionId:
          validatedRequest.inspectionId,
        ...normalizedAiOutput
      }
      : normalizeInspectionData({
        inspectionId:
          validatedRequest.inspectionId,
        ...normalizedAiOutput
      });


  // ==============================================
  // STEP 4 — GET INSPECTION ID
  // ==============================================

  const inspectionId =
    validatedRequest.inspectionId;


  // ==============================================
  // STEP 5 — FIND APPLICABLE RULES
  // ==============================================

  const {
    appliedRuleDefinitions = [],
    ...applicabilityResult
  } =
    findApplicableRules(
      normalizedInspection,
      inspectionId
    );


  // ==============================================
  // STEP 6 — NOT APPLICABLE
  // ==============================================

  if (
    applicabilityResult.status ===
    "NOT_APPLICABLE"
  ) {

    return {

      inspectionId,

      status:
        "NOT_APPLICABLE",

      normalizedInspection,

      applicability:
        applicabilityResult,

      rulesExecuted: [],

      results: [],

      ruleResults: [],

      totalRulesExecuted: 0,

      totalResults: 0,

      complianceSummary: {

        inspectionId,

        totalRulesExecuted: 0,

        totalChecks: 0,

        summary: {

          PASS: 0,

          FAIL: 0,

          NOT_APPLICABLE: 0,

          REQUIRES_VERIFICATION: 0

        },

        overallStatus:
          "NOT_APPLICABLE"

      }

    };

  }


  // ==============================================
  // STEP 7 — REQUIRES VERIFICATION
  // ==============================================

  if (
    applicabilityResult.status ===
    "REQUIRES_VERIFICATION"
  ) {

    return {

      inspectionId,

      status:
        "REQUIRES_VERIFICATION",

      normalizedInspection,

      applicability:
        applicabilityResult,

      rulesExecuted: [],

      results: [],

      ruleResults: [],

      totalRulesExecuted: 0,

      totalResults: 0,

      complianceSummary: {

        inspectionId,

        totalRulesExecuted: 0,

        totalChecks: 0,

        summary: {

          PASS: 0,

          FAIL: 0,

          NOT_APPLICABLE: 0,

          REQUIRES_VERIFICATION: 0

        },

        overallStatus:
          "REQUIRES_VERIFICATION"

      }

    };

  }


  // ==============================================
  // STEP 8 — EXECUTE RULE ENGINE
  // ==============================================

  const engineResult =
    executeRuleEngine(

      appliedRuleDefinitions,

      normalizedInspection,

      inspectionId,

      applicabilityResult

    );


  // ==============================================
  // STEP 9 — RETURN FINAL RESULT
  // ==============================================

  return {

    inspectionId,

    status:
      applicabilityResult.status,

    normalizedInspection,

    applicability:
      applicabilityResult,

    rulesExecuted:

      appliedRuleDefinitions.map(
        (rule) => rule.rule_id
      ),

    results:
      engineResult.results,

    totalRulesExecuted:
      engineResult.totalRulesExecuted,

    totalResults:
      engineResult.totalResults,

    complianceSummary:
      engineResult.complianceSummary,

    ruleResults:
      engineResult.ruleResults,

  };

};