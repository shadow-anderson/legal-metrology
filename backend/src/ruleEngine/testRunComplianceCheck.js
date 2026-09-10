// ================================================
// TEST COMPLETE RULE ENGINE PIPELINE
// ================================================

import assert from "node:assert/strict";

import {
  runComplianceCheck
} from "./runComplianceCheck.js";

import sampleInspection
  from "../inspections/sampleInspection.js";


// ================================================
// START TEST
// ================================================

console.log("\n================================");

console.log(
  "COMPLETE RULE ENGINE PIPELINE TEST"
);

console.log("================================\n");


// ================================================
// RUN ENGINE
// ================================================

const result =
  runComplianceCheck(
    sampleInspection
  );


// ================================================
// PRINT RESULT
// ================================================

console.log(
  "Inspection ID:",
  result.inspectionId
);

console.log(
  "Status:",
  result.status
);

console.log(
  "Rules Executed:",
  result.rulesExecuted
);

console.log(
  "Total Rules Executed:",
  result.totalRulesExecuted
);

console.log(
  "Total Results:",
  result.totalResults
);


console.log("\n================================");

console.log(
  "COMPLIANCE SUMMARY"
);

console.log("================================");


console.log(
  "PASS:",
  result.complianceSummary.summary.PASS
);

console.log(
  "FAIL:",
  result.complianceSummary.summary.FAIL
);

console.log(
  "NOT_APPLICABLE:",
  result.complianceSummary.summary.NOT_APPLICABLE
);

console.log(
  "REQUIRES_VERIFICATION:",
  result.complianceSummary.summary.REQUIRES_VERIFICATION
);

console.log(
  "Overall Status:",
  result.complianceSummary.overallStatus
);


// ================================================
// ASSERTIONS
// ================================================

assert.ok(
  result.inspectionId,
  "Inspection ID should exist"
);


assert.equal(
  result.status,
  "APPLICABLE"
);


assert.ok(
  Array.isArray(
    result.rulesExecuted
  )
);


assert.ok(
  result.totalRulesExecuted > 0
);


assert.ok(
  Array.isArray(
    result.results
  )
);


assert.ok(
  result.totalResults > 0
);


// ================================================
// SUCCESS MESSAGE
// ================================================

console.log("\n================================");

console.log(
  "PIPELINE TEST: PASS ✅"
);

console.log("================================\n");