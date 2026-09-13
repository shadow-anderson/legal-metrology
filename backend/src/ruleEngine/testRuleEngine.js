const assert = require("node:assert/strict");

const { findApplicableRules } = require("./findApplicableRules");
const { executeRuleEngine } = require("./ruleEngine");
const { createComplianceSummary } = require("./complianceSummary");
const {
  normalizeInspectionData
} = require("./ruleNormalizer");

const sampleInspection = require("../inspections/sampleInspection");


// ================================================
// CONSTANTS
// ================================================

const inspectionId =
  "550e8400-e29b-41d4-a716-446655440000";

const pdfRuleIds = [
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
  "R12",
  "R13"
];


// ================================================
// PDF SAMPLE FIXTURE
// ================================================

const sampleFixture = {
  id: sampleInspection.inspectionId,

  label: "PDF-SAMPLE",

  name: "ABC Foods Biscuits",

  ...sampleInspection
};


// ================================================
// COMMON PRODUCT DATA
// ================================================

const commonProductData = {
  is_imported: false,

  is_industrial_consumer: false,

  is_institutional_consumer: false,

  manufacturer: {
    name: "ABC Foods",
    address: "Bathinda, Punjab"
  },

  packer: {
    name: "ABC Foods",
    address: "Bathinda, Punjab"
  },

  importer: null,

  month_year: "09/2026",

  retail_sale_price: {
    value: 50,
    currency: "INR"
  },

  dimensions: {
    length: 20,
    width: 10,
    unit: "cm"
  },

  identifying_mark: "ABC-FOODS-2026",

  consumer_care: {
    name: "Customer Care",
    address: "Bathinda, Punjab",
    phone: "9876543210",
    email: "support@abcfoods.com"
  },

  declaration: {
    on_principal_display_panel: true
  },

  measurements: {
    numeral_height_mm: 4,

    letter_height_mm: 2,

    letter_width_mm: 1,

    declaration_style: "normal",

    quantity_numeral_height_mm: 4,

    quantity_clearance: {
      top: 4,
      bottom: 4,
      left: 8,
      right: 8
    }
  },

  analysis: {
  legible: true,

  prominent: true,

  mrp_contrast: true,

  net_quantity_contrast: true,

  declaration_style: "PRINTED",

  read_through_liquid: false,

  inner_declarations_readable: true,

  languages: ["ENGLISH"],

  // Rule R9_1_HAND
  handwritten: false,

  // Rule R9_3
  outer_wrapper_present: false,

  outer_wrapper_declarations_present: false
},

package: {
  has_outer_wrapper: false,

  outer_wrapper_transparent: false
}
};


// ================================================
// TEST FIXTURES
// ================================================

const fixtures = [

  // PDF SAMPLE

  sampleFixture,


  // P001 - BISCUITS

  {
    id: "550e8400-e29b-41d4-a716-446655440001",

    label: "P001",

    name: "Parle-G 250 g",

    product: {
      ...commonProductData,

      commodity_name: "Biscuits",

      physical_form: "solid",

      measurement_type: "WEIGHT",

      net_quantity: {
        value: 250,
        unit: "g",
        raw_text: "Net Quantity: 250 g"
      },

      quantity_declaration:
        "Net Quantity: 250 g",

      package_capacity: {
        value: 900,
        unit: "cubic cm"
      }
    }
  },


  // P002 - SHAMPOO

  {
    id: "550e8400-e29b-41d4-a716-446655440002",

    label: "P002",

    name: "Dove Shampoo 180 ml",

    product: {
      ...commonProductData,

      commodity_name: "Shampoo",

      physical_form: "liquid",

      measurement_type: "VOLUME",

      net_quantity: {
        value: 180,
        unit: "ml",
        raw_text: "Net Volume: 180 ml"
      },

      quantity_declaration:
        "Net Volume: 180 ml",

      package_capacity: {
        value: 220,
        unit: "cubic cm"
      }
    }
  },


  // P003 - ATTA

  {
    id: "550e8400-e29b-41d4-a716-446655440003",

    label: "P003",

    name: "Aashirvaad Atta 5 kg",

    product: {
      ...commonProductData,

      commodity_name: "Atta",

      physical_form: "solid",

      measurement_type: "WEIGHT",

      net_quantity: {
        value: 5,
        unit: "kg",
        raw_text: "Net Quantity: 5 kg"
      },

      quantity_declaration:
        "Net Quantity: 5 kg",

      package_capacity: {
        value: 6500,
        unit: "cubic cm"
      }
    }
  }
];


// ================================================
// FORMAT RULE RESULTS
// ================================================

const summarizeRuleStatuses = (results) =>
  Object.fromEntries(

    pdfRuleIds.map((ruleId) => [

      ruleId,

      results
        .filter(
          (result) =>
            result.ruleId === ruleId
        )

        .map(
          ({
            checkId,
            status,
            message
          }) => ({
            checkId,
            status,
            message
          })
        )

    ])

  );


// ================================================
// START TEST
// ================================================

console.log("\n================================");
console.log("PDF MOCK DATA RULE ENGINE TEST");
console.log("================================");


const allResults = [];


// ================================================
// TEST NORMAL APPLICABLE PRODUCTS
// ================================================

for (const fixture of fixtures) {

   // Normalize inspection data
  const normalizedFixture =
    normalizeInspectionData(fixture);


  const applicabilityResult =
    findApplicableRules(
      normalizedFixture,
      fixture.id
    );


  const appliedRules =
    applicabilityResult.appliedRuleDefinitions.filter(
      (rule) =>
        pdfRuleIds.includes(
          rule.rule_id
        )
    );


  const engineResult =
  executeRuleEngine(

    appliedRules,

    normalizedFixture,

    fixture.id,

    applicabilityResult

  );


  allResults.push(
    ...engineResult.results
  );


  // ==============================================
  // ASSERT APPLICABILITY
  // ==============================================

  assert.equal(

    applicabilityResult.status,

    "APPLICABLE",

    `${fixture.id} should be applicable`

  );


  assert.deepEqual(

    applicabilityResult.applicableRules,

    pdfRuleIds

  );


  assert.deepEqual(

    applicabilityResult.applicableSchedules,

    ["S2"]

  );


  assert.deepEqual(

    applicabilityResult.exemptions,

    []

  );


  assert.deepEqual(

    applicabilityResult.reasons,

    []

  );


  assert.deepEqual(

    appliedRules.map(
      (rule) => rule.rule_id
    ),

    pdfRuleIds,

    `${fixture.id} should execute the PDF rule set`

  );


  // ==============================================
  // PRINT APPLICABILITY RESULT
  // ==============================================

  console.log("\n================================");

  console.log(
    "     APPLICABILITY RESULT"
  );

  console.log("================================");

  console.log(
    "Status:",
    applicabilityResult.status
  );

  console.log(
    "Inspection ID:",
    fixture.id
  );

  console.log(
    "Applicable Rule IDs:",
    applicabilityResult.applicableRules
  );

  console.log(
    "Applicable Schedules:",
    applicabilityResult.applicableSchedules
  );


  // ==============================================
  // PRINT RULE ENGINE RESULT
  // ==============================================

  console.log("\n================================");

  console.log(
    "       RULE ENGINE RESULT"
  );

  console.log("================================");

  console.log(
    `\n${fixture.label} - ${fixture.name}`
  );

  console.log(
    "Total Rules Executed:",
    engineResult.totalRulesExecuted
  );

  console.log(
    "Total Results:",
    engineResult.totalResults
  );

  console.log(
    JSON.stringify(
      summarizeRuleStatuses(
        engineResult.results
      ),
      null,
      2
    )
  );


  // ==============================================
  // PRINT COMPLIANCE SUMMARY
  // ==============================================

  console.log("\n================================");

  console.log(
    "       COMPLIANCE SUMMARY"
  );

  console.log("================================");

  console.log(
    "PASS:",
    engineResult.complianceSummary.summary.PASS
  );

  console.log(
    "FAIL:",
    engineResult.complianceSummary.summary.FAIL
  );

  console.log(
    "NOT_APPLICABLE:",
    engineResult.complianceSummary.summary.NOT_APPLICABLE
  );

  console.log(
    "REQUIRES_VERIFICATION:",
    engineResult.complianceSummary.summary.REQUIRES_VERIFICATION
  );

  console.log(
    "Overall Status:",
    engineResult.complianceSummary.overallStatus
  );

}


// ================================================
// APP-004
// INDUSTRIAL CONSUMER TEST
// ================================================

const industrialProduct = {

  product: {

    ...commonProductData,

    commodity_name:
      "Industrial Product",

    // Keep quantity BELOW 25 kg
    // so only consumer type causes exclusion

    net_quantity: {
      value: 10,
      unit: "kg"
    },

    is_industrial_consumer: true,

    is_institutional_consumer: false
  }
};


const industrialResult =
  findApplicableRules(

    industrialProduct,

    "550e8400-e29b-41d4-a716-446655440004"

  );


assert.equal(

  industrialResult.status,

  "NOT_APPLICABLE",

  "Industrial consumer should be excluded by R3"

);


assert.deepEqual(

  industrialResult.applicableRules,

  []

);


assert.deepEqual(

  industrialResult.applicableSchedules,

  []

);


console.log(
  "\nApplicability edge case APP-004 (Industrial Consumer): PASS"
);


// ================================================
// APP-005
// QUANTITY THRESHOLD TEST
// ================================================

const largeQuantityProduct = {

  product: {

    ...commonProductData,

    commodity_name: "Rice",

    // More than 25 kg

    net_quantity: {
      value: 30,
      unit: "kg"
    },

    // Make sure consumer type
    // does NOT cause exclusion

    is_industrial_consumer: false,

    is_institutional_consumer: false
  }
};


const largeQuantityResult =
  findApplicableRules(

    largeQuantityProduct,

    "550e8400-e29b-41d4-a716-446655440005"

  );


assert.equal(

  largeQuantityResult.status,

  "NOT_APPLICABLE",

  "Product above 25 kg should be excluded by R3"

);


assert.deepEqual(

  largeQuantityResult.applicableRules,

  []

);


assert.deepEqual(

  largeQuantityResult.applicableSchedules,

  []

);


console.log(
  "Applicability edge case APP-005 (30 kg threshold): PASS"
);


// ================================================
// APP-006
// CEMENT EXCEPTION TEST
// ================================================

const cementProduct = {

  product: {

    ...commonProductData,

    commodity_name: "Cement",

    net_quantity: {
      value: 50,
      unit: "kg"
    },

    is_industrial_consumer: false,

    is_institutional_consumer: false
  }
};


const cementResult =
  findApplicableRules(

    cementProduct,

    "550e8400-e29b-41d4-a716-446655440006"

  );


assert.equal(

  cementResult.status,

  "APPLICABLE",

  "Cement up to 50 kg should be an R3 exception"

);


assert.deepEqual(

  cementResult.applicableRules,

  pdfRuleIds

);


assert.deepEqual(

  cementResult.applicableSchedules,

  ["S2"]

);


console.log(
  "Applicability edge case APP-006 (Cement 50 kg exception): PASS"
);


// ================================================
// APP-007
// FERTILIZER EXCEPTION TEST
// ================================================

const fertilizerProduct = {

  product: {

    ...commonProductData,

    commodity_name: "Fertilizer",

    net_quantity: {
      value: 50,
      unit: "kg"
    },

    is_industrial_consumer: false,

    is_institutional_consumer: false
  }
};


const fertilizerResult =
  findApplicableRules(

    fertilizerProduct,

    "550e8400-e29b-41d4-a716-446655440007"

  );


assert.equal(

  fertilizerResult.status,

  "APPLICABLE",

  "Fertilizer up to 50 kg should be an R3 exception"

);


assert.deepEqual(

  fertilizerResult.applicableRules,

  pdfRuleIds

);


assert.deepEqual(

  fertilizerResult.applicableSchedules,

  ["S2"]

);


console.log(
  "Applicability edge case APP-007 (Fertilizer 50 kg exception): PASS"
);


// ================================================
// FINAL SUMMARY
// ================================================

const summary =
  createComplianceSummary(

    allResults,

    fixtures.length *
      pdfRuleIds.length,

    "PDF-MOCK-SUITE"

  );


console.log("\n================================");

console.log(
  "       FINAL RULE SUMMARY"
);

console.log("================================");

console.log(
  "PASS:",
  summary.summary.PASS
);

console.log(
  "FAIL:",
  summary.summary.FAIL
);

console.log(
  "NOT_APPLICABLE:",
  summary.summary.NOT_APPLICABLE
);

console.log(
  "REQUIRES_VERIFICATION:",
  summary.summary.REQUIRES_VERIFICATION
);

console.log(
  "Overall Status:",
  summary.overallStatus
);