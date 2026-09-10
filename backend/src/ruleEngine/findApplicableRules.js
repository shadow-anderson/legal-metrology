import {
  loadAllRules,
  loadRulePack
} from "./ruleLoader.js";

import {
  evaluateApplicability
} from "./applicabilityEngine.js";

import {
  createApplicabilityResult
} from "../resultGenerator/applicabilityResult.js";

import {
  normalizeInspectionData
} from "../inspections/inspectionAdapter.js";
import { assertValidApplicabilityResult } from "../resultGenerator/schemaValidator.js";

const toApplicabilityData = (inspectionData) => {
  if (
    inspectionData?.product?.netQuantity
  ) {
    return inspectionData;
  }

  const product = inspectionData?.product;

  if (!product?.net_quantity) {
    return inspectionData;
  }

  return {
    ...inspectionData,
    product: {
      ...product,
      name: {
        value:
          product.name ||
          product.commodity_name ||
          ""
      },
      category: {
        value: product.category || ""
      },
      netQuantity: product.net_quantity,
      isIndustrialConsumer:
        product.is_industrial_consumer,
      isInstitutionalConsumer:
        product.is_institutional_consumer
    }
  };
};


// ================================================
// FIND SCHEDULES FROM LOADED METADATA
// ================================================

const collectSchedules = (applicableRules, rulePack) => {
  const schedules = new Set();

  for (const rule of applicableRules) {
    if (Array.isArray(rule.schedules)) {
      rule.schedules.forEach((schedule) => {
        if (schedule) schedules.add(schedule);
      });
    }

    if (
      typeof rule.schedule_id === "string" &&
      rule.schedule_id
    ) {
      schedules.add(rule.schedule_id);
    }

    if (Array.isArray(rule.scheduleIds)) {
      rule.scheduleIds.forEach((schedule) => {
        if (schedule) schedules.add(schedule);
      });
    }

    if (
      typeof rule.schedule === "string" &&
      rule.schedule
    ) {
      schedules.add(rule.schedule);
    }
  }

  // Existing rule definitions do not carry Chapter II schedule metadata.
  // Resolve the current schedule by its loaded definition rather than its ID.
  if (schedules.size === 0) {
    const secondSchedule = rulePack.schedules.find(
      ({ data }) =>
        String(data?.title || "")
          .toLowerCase()
          .includes("second schedule")
    );

    if (secondSchedule?.data?.schedule_id) {
      schedules.add(secondSchedule.data.schedule_id);
    }
  }

  return [...schedules];
};


// ================================================
// FIND APPLICABLE RULES
// ================================================

export const findApplicableRules = (
  inspectionData,
  inspectionId
) => {


  // ==============================================
  // NORMALIZE INSPECTION DATA
  // ==============================================

  const normalizedInspection =
    inspectionData?.product?.name &&
    inspectionData?.product?.netQuantity
      ? inspectionData
      : normalizeInspectionData(inspectionData);

  const applicabilityData =
    toApplicabilityData(normalizedInspection);


  // ==============================================
  // LOAD ALL RULES
  // ==============================================

  const allRules =
    loadAllRules();


  // ==============================================
  // FIND R3
  // ==============================================

  const r3 =
    allRules.find(

      (rule) =>
        rule.rule_id === "R3"

    );


  if (!r3) {

    throw new Error(
      "R3 rule was not found"
    );

  }


  // ==============================================
  // EVALUATE R3
  //
  // R3 decides whether this package is covered
  // by the Legal Metrology packaged commodity
  // applicability requirements.
  // ==============================================

  const r3Result =
    evaluateApplicability(
      r3,
      applicabilityData
    );


  // ==============================================
  // REQUIRES VERIFICATION
  // ==============================================

  if (
    r3Result.status === "VERIFY"
  ) {

    const contractResult =
      createApplicabilityResult({

        inspectionId,

        status:
          "REQUIRES_VERIFICATION",

        applicableRules: [],

        applicableSchedules: [],

        exemptions: [],

        reasons: [r3Result.reason],

        contextSnapshot:
          normalizedInspection

      });


    assertValidApplicabilityResult(contractResult);
    return { ...contractResult, appliedRuleDefinitions: [] };

  }


  // ==============================================
  // NOT APPLICABLE
  // ==============================================

  if (
    r3Result.status ===
    "NOT_APPLICABLE"
  ) {

    const contractResult =
      createApplicabilityResult({

        inspectionId,

        status:
          "NOT_APPLICABLE",

        applicableRules: [],

        applicableSchedules: [],

        exemptions: [],

        reasons: [r3Result.reason],

        contextSnapshot:
          normalizedInspection

      });


    assertValidApplicabilityResult(contractResult);
    return { ...contractResult, appliedRuleDefinitions: [] };

  }


  // Rules with executable checks are discovered from the rule pack.  Source
  // text only definitions remain available for future support but are not
  // sent to the current check evaluator.
  const candidateRules = allRules.filter((rule) => {
    if (rule.rule_id === "R3" || !Array.isArray(rule.checks)) {
      return false;
    }

    return rule.checks.some(
      (check) =>
        check.type &&
        check.type !== "SOURCE_TEXT_COMPLIANCE"
    );
  });


  // ==============================================
  // EVALUATE RULE-SPECIFIC APPLICABILITY
  // ==============================================

  const applicableRules = [];

  const reasons = [];


  for (
    const rule of candidateRules
  ) {

    const result =
      evaluateApplicability(

        rule,

        normalizedInspection

      );


    // ============================================
    // REQUIRES VERIFICATION
    // ============================================

    if (
      result.status === "VERIFY"
    ) {

      reasons.push(`${rule.rule_id}: ${result.reason}`);


      continue;

    }


    // ============================================
    // RULE NOT APPLICABLE
    // ============================================

    if (
      result.status ===
      "NOT_APPLICABLE"
    ) {

      continue;

    }


    // ============================================
    // RULE APPLICABLE
    // ============================================

    if (
      result.applicable === true
    ) {

      applicableRules.push(
        rule
      );

    }

  }


  // ==============================================
  // GET RULE IDS
  // ==============================================

  const applicableRuleIds =
    applicableRules.map(

      (rule) =>
        rule.rule_id

    );


  // ==============================================
  // GET APPLICABLE SCHEDULES
  // ==============================================

  const applicableSchedules = collectSchedules(
    applicableRules,
    loadRulePack()
  );


  // ==============================================
  // FINAL STATUS
  // ==============================================

  const hasVerificationIssues =
    reasons.length > 0;


  const finalStatus =
    hasVerificationIssues
      ? "REQUIRES_VERIFICATION"
      : "APPLICABLE";


  // ==============================================
  // CREATE CONTRACT RESULT
  // ==============================================

  const contractResult =
    createApplicabilityResult({

      inspectionId,

      status:
        finalStatus,

      applicableRules:
        applicableRuleIds,

      applicableSchedules,

      exemptions: [],

      reasons,

      contextSnapshot:
        normalizedInspection

    });


  // ==============================================
  // RETURN RESULT
  // ==============================================

  assertValidApplicabilityResult(contractResult);
  return { ...contractResult, appliedRuleDefinitions: applicableRules };

};