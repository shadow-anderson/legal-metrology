import {
  normalizeInspectionData
} from "../inspections/inspectionAdapter.js";


// ================================================
// FIELD CHECK TYPES
// ================================================

const fieldCheckTypes = {

  R6_1_A: "RESPONSIBLE_PERSON",
  R6_1_B: "FIELD_REQUIRED",
  R6_1_C: "FIELD_REQUIRED",
  R6_1_D: "FIELD_REQUIRED",
  R6_1_E: "FIELD_REQUIRED",
  R6_1_F: "CONDITIONAL_FIELD",
  R6_2: "FIELD_REQUIRED"

};


// ================================================
// RULE 7 NORMALIZATION
// ================================================

const normalizeR7 = (rule) => ({

  ...rule,

  checks: [

    {

      check_id: "R7_1",

      type: "MEASUREMENT_THRESHOLD_TABLE",

      // Official inspection schema does not contain
      // measurements.numeral_height_mm directly.
      //
      // Extra extracted information should be stored
      // inside context.specialCharacteristics.

      field:
        "context.specialCharacteristics.numeralHeightMm",

      requirement:
        "Required numeral height based on declared quantity or principal display panel area.",

      parameters: {

        numeral_height_rules:
          rule.numeral_height_rules

      },

      on_missing: "VERIFY"

    },


    {

      check_id: "R7_2",

      type: "LETTER_HEIGHT",

      field:
        "context.specialCharacteristics.letterHeightMm",

      requirement:
        "Letter height and width ratio requirements.",

      parameters:

        rule.letter_rules,

      on_missing: "VERIFY"

    },


    {

      check_id: "R7_3",

      type: "SPECIAL_CASE",

      // Official inspection-context schema field

      field:
        "context.packageCapacityCm3",

      requirement:

        rule.special_case,

      on_missing: "VERIFY"

    }

  ]

});


// ================================================
// RULE 12 NORMALIZATION
// ================================================

const normalizeR12 = (rule) => ({

  ...rule,

  checks: [

    {

      check_id: "R12_1",

      type: "MEASUREMENT_TYPE_MAPPING",

      // Official schema fields:
      //
      // context.physicalForm
      // context.saleBasis

      field:
        "context.saleBasis",

      requirement:
        "Sale basis must follow the physical form and quantity declaration requirements.",

      parameters: {

        default_measurement_rules:
          rule.default_measurement_rules

      },

      on_missing: "VERIFY"

    },


    {

      check_id: "R12_2",

      type:
        "ADDITIONAL_QUANTITY_REQUIREMENTS",

      // Official schema

      field:
        "context.declaredQuantity",

      requirement:
        "Quantity declaration must not be misleading and must include necessary information.",

      parameters: {

        additional_rules:
          rule.additional_rules

      },

      on_missing: "VERIFY"

    },


    {

      check_id: "R12_3",

      type:
        "SMALL_PACKAGE_EXCEPTION",

      // Official schema

      field:
        "context.packageCapacityCm3",

      requirement:

        rule.small_package_rule,

      on_missing: "VERIFY"

    },


    {

      check_id: "R12_4",

      type:
        "SCHEDULE_LOOKUP",

      // Official schema

      field:
        "context.commodityName",

      requirement:
        "Apply the Fourth Schedule mapping when the commodity is listed.",

      parameters: {

        schedule_id: "S4"

      },

      on_missing: "VERIFY"

    }

  ]

});


// ================================================
// RULE 13 NORMALIZATION
// ================================================

const normalizeR13 = (rule) => ({

  ...rule,

  checks: [

    {

      check_id: "R13_1",

      type:
        "UNIT_MAPPING",

      // Official schema quantity object

      field:
        "context.declaredQuantity",

      requirement:
        "Unit must follow the threshold-specific SI unit rules.",

      parameters: {

        less_than_threshold:
          rule.less_than_threshold,

        equal_or_more_than_threshold:
          rule.equal_or_more_than_threshold,

        exact_one_option:
          rule.exact_one_option

      },

      on_missing: "VERIFY"

    },


    {

      check_id: "R13_2",

      type:
        "PROHIBITED_NUMBER_WORDS",

      // Raw extracted declaration text can be stored
      // inside declaredQuantity.

      field:
        "context.declaredQuantity",

      requirement:
        "Prohibited number words shall not be used for net quantity declarations.",

      parameters: {

        words:
          rule.prohibited_number_words

      },

      on_missing: "VERIFY"

    },


    {

      check_id: "R13_3",

      type:
        "SI_UNIT_SYSTEM",

      field:
        "context.declaredQuantity",

      requirement:

        rule.system_requirement,

      parameters: {

        sold_by_number_symbols:
          rule.sold_by_number_symbols

      },

      on_missing: "VERIFY"

    }

  ]

});


// ================================================
// NORMALIZE GENERAL CHECKS
// ================================================

const normalizeChecks = (

  rule,

  checks

) =>

  checks.map((check) => {

    const checkId =

      check.check_id ||
      check.checkId ||
      check.id;


    const type =

      check.type ||

      fieldCheckTypes[checkId] ||

      (

        rule.rule_id === "R8"

          ? "GEOMETRY_OR_PLACEMENT"

          : undefined

      ) ||

      (

        rule.rule_id === "R9"

          ? "TEXT_AND_DISPLAY"

          : undefined

      ) ||

      (

        rule.rule_id === "R10"

          ? "ADDRESS_OR_IDENTITY"

          : undefined

      ) ||

      "SOURCE_TEXT_COMPLIANCE";


    return {

      ...check,


      check_id:

        checkId,


      type,


      on_missing:

        check.on_missing ||

        (

          check.required === true &&

          type === "FIELD_REQUIRED"

            ? "FAIL"

            : undefined

        )

    };

  });


// ================================================
// MAIN RULE NORMALIZER
// ================================================

export const normalizeRule = (

  rule

) => {

  let normalized = {

    ...rule,


    rule_id:

      rule.rule_id ||
      rule.ruleId,


    artifact_type:

      rule.artifact_type ||
      "RULE",


    version:

      rule.version ||
      rule.schema_version ||
      "1.0.0",


    schema_version:

      rule.schema_version ||
      "1.0.0",


    rule_role:

      rule.rule_role ||

      (

        rule.rule_id === "R3"

          ? "APPLICABILITY"

          : "COMPLIANCE"

      ),


    status_values:

      rule.status_values ||

      [

        "PASS",

        "FAIL",

        "REQUIRES_VERIFICATION",

        "NOT_APPLICABLE"

      ]

  };


  // ==============================================
  // SPECIAL RULE NORMALIZATION
  // ==============================================

  if (

    normalized.rule_id === "R7" &&

    !rule.checks

  ) {

    normalized =

      normalizeR7(normalized);

  }


  else if (

    normalized.rule_id === "R12" &&

    !rule.checks

  ) {

    normalized =

      normalizeR12(normalized);

  }


  else if (

    normalized.rule_id === "R13" &&

    !rule.checks

  ) {

    normalized =

      normalizeR13(normalized);

  }


  else {

    normalized.checks =

      normalizeChecks(

        normalized,

        Array.isArray(rule.checks)

          ? rule.checks

          : []

      );

  }


  // ==============================================
  // APPLICABILITY CONFIGURATION
  // ==============================================

  if (

    normalized.rule_id === "R3" &&

    !normalized.applicability

  ) {

    normalized.applicability = {

      mode:

        "CONDITIONAL",


      conditions:

        normalized.checks.map(

          (check) => ({

            condition_id:

              check.check_id,


            type:

              check.type,


            condition:

              check.condition,


            exceptions:

              check.exceptions,


            on_match:

              check.on_match ||

              "NOT_APPLICABLE"

          })

        )

    };

  }


  else if (

    !normalized.applicability

  ) {

    normalized.applicability = {

      mode:

        "ALWAYS",

      conditions:

        []

    };

  }


  return normalized;

};


// ================================================
// EXPORT
// ================================================

export {

  normalizeInspectionData

};