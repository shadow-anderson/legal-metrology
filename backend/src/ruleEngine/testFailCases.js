import assert from "node:assert/strict";
import { findApplicableRules } from "./findApplicableRules.js";
import { executeRuleEngine } from "./ruleEngine.js";
import sampleInspection from "../inspections/sampleInspection.js";

const inspectionId = "550e8400-e29b-41d4-a716-446655440100";

const clone = (value) => JSON.parse(JSON.stringify(value));

const failCases = [
  {
    name: "Missing Manufacturer/Packer Information",
    expectedFailures: ["R6_1_A"],
    update: (inspection) => {
      inspection.product.manufacturer = null;
      inspection.product.packer = null;
    }
  },
  {
    name: "Missing Commodity Name",
    expectedFailures: ["R6_1_B"],
    update: (inspection) => {
      inspection.product.commodity_name = "";
    }
  },
  {
    name: "Missing Net Quantity",
    expectedFailures: ["R6_1_C"],
    useValidApplicabilityData: true,
    update: (inspection) => {
      delete inspection.product.net_quantity;
    }
  },
  {
    name: "Invalid Net Quantity Unit",
    expectedFailures: ["R13_3"],
    update: (inspection) => {
      inspection.product.net_quantity.unit = "xyz";
    }
  },
  {
    name: "Wrong Measurement Type",
    expectedFailures: ["R12_1"],
    update: (inspection) => {
      inspection.product.physical_form = "LIQUID";
      inspection.product.measurement_type = "WEIGHT";
    }
  },
  {
    name: "Missing Retail Sale Price",
    expectedFailures: ["R6_1_E"],
    update: (inspection) => {
      delete inspection.product.retail_sale_price;
    }
  }
];

console.log("\n================================");
console.log("      FAIL CASE TEST");
console.log("================================");

for (const [index, testCase] of failCases.entries()) {
  const inspection = clone(sampleInspection);
  testCase.update(inspection);
  const caseInspectionId = `${inspectionId.slice(0, -3)}${String(index).padStart(3, "0")}`;
  const applicability = findApplicableRules(
    testCase.useValidApplicabilityData
      ? sampleInspection
      : inspection,
    caseInspectionId
  );
  const appliedRules = applicability.appliedRuleDefinitions;
  const engineResult = executeRuleEngine(
    appliedRules,
    inspection,
    caseInspectionId,
    applicability
  );
  const actualFailures = engineResult.results
    .filter((result) => result.status === "FAIL")
    .map((result) => result.checkId);

  for (const expectedFailure of testCase.expectedFailures) {
    assert.ok(
      actualFailures.includes(expectedFailure),
      `${testCase.name}: expected ${expectedFailure} to FAIL`
    );
  }
  assert.equal(
    engineResult.complianceSummary.overallStatus,
    "FAIL",
    `${testCase.name}: overall status should be FAIL`
  );

  console.log(`\nProduct: ${testCase.name}`);
  console.log("Expected Failures:", testCase.expectedFailures.join(", "));
  console.log("Actual Results:");
  for (const expectedFailure of testCase.expectedFailures) {
    const result = engineResult.results.find(
      (candidate) => candidate.checkId === expectedFailure
    );
    console.log(`${expectedFailure} -> ${result?.status || "NOT_FOUND"}`);
  }
  const summary = engineResult.complianceSummary.summary;
  console.log("\n================================");
  console.log("     COMPLIANCE SUMMARY");
  console.log("================================");
  console.log("PASS:", summary.PASS);
  console.log("FAIL:", summary.FAIL);
  console.log("NOT_APPLICABLE:", summary.NOT_APPLICABLE);
  console.log("REQUIRES_VERIFICATION:", summary.REQUIRES_VERIFICATION);
  console.log("\nOverall Status:", engineResult.complianceSummary.overallStatus);
  console.log("Expected Failures: PASS");
  console.log("Overall Status Validation: PASS");
  console.log("TEST RESULT -> PASS");
}
