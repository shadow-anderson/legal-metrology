// ================================================
// FIELD RESOLVER
// ================================================

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "";


// ================================================
// UNWRAP AI VALUE
// ================================================

const unwrapAiValue = (value) => {

  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(
      value,
      "value"
    )
  ) {

    return value.value;

  }

  return value;

};

const structuredFieldNames = new Set([
  "NET_QTY",
  "CONSUMER_CARE",
  "DIMENSIONS",
  "OTHER_DECLARATIONS"
]);

const resolveRawValue = (field) => {
  const aiValue = field.aiValue;
  if (
    structuredFieldNames.has(field.fieldName) &&
    aiValue !== null &&
    typeof aiValue === "object" &&
    !Array.isArray(aiValue) &&
    Object.prototype.hasOwnProperty.call(aiValue, "value") &&
    (field.fieldName !== "NET_QTY" ||
      Object.prototype.hasOwnProperty.call(aiValue, "unit") ||
      Object.prototype.hasOwnProperty.call(aiValue, "measurementType"))
  ) {
    return aiValue;
  }
  return unwrapAiValue(aiValue);
};


// ================================================
// RESOLVE FIELD VALUE
// ================================================

const resolveFieldValue = (field) => {

  if (!field) {

    return {

      value: null,

      status: "MISSING",

      confidence: null,

      requiresVerification: true

    };

  }


  const status =
    field.verificationStatus ||
    "UNVERIFIED";


  // ==============================================
  // REJECTED
  // ==============================================

  if (status === "REJECTED") {

    return {

      value: null,

      status,

      confidence: null,

      requiresVerification: true

    };

  }


  // ==============================================
  // CORRECTED / VERIFIED
  // ==============================================

  if (

    (
      status === "CORRECTED" ||
      status === "VERIFIED" ||
      status === "CONFIRMED"
    ) &&

    hasValue(field.officerValue)

  ) {

    return {

      value: field.officerValue,

      status,

      confidence: 1,

      requiresVerification: false

    };

  }


  // ==============================================
  // AI VALUE
  // ==============================================

  return {

    value:
      resolveRawValue(field),

    status,

    confidence:
      status === "CONFIRMED" || status === "VERIFIED"
        ? 1
        : field.aiConfidence ?? null,

    requiresVerification:
      status !== "VERIFIED" && status !== "CONFIRMED"

  };

};


// ================================================
// COMPATIBILITY EXPORT
// ================================================

const resolveExtractedField =
  resolveFieldValue;


// ================================================
// CREATE FIELD MAP
// ================================================

const createExtractedFieldMap = (
  extractedFields = []
) => {

  const fieldMap = {};


  if (!Array.isArray(extractedFields)) {

    return fieldMap;

  }


  for (
    const field of extractedFields
  ) {

    if (field?.fieldName) {

      fieldMap[field.fieldName] =
        resolveFieldValue(field);

    }

  }


  return fieldMap;

};


// ================================================
// GET FIELD
// ================================================

const getExtractedField = (
  fieldMap = {},
  fieldName
) =>

  fieldMap[fieldName] ||

  {

    value: null,

    status: "MISSING",

    confidence: null,

    requiresVerification: true

  };

module.exports = {
  resolveFieldValue,
  resolveExtractedField,
  createExtractedFieldMap,
  getExtractedField
};