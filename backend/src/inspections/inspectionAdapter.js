const {
  createExtractedFieldMap,
  getExtractedField
} = require("./fieldResolver");


// ================================================
// HELPERS
// ================================================

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "";


// ================================================
// GET RESOLVED FIELD
// ================================================

const getField = (
  fieldMap,
  fieldName
) =>
  getExtractedField(
    fieldMap,
    fieldName
  );


const getValue = (
  fieldMap,
  fieldName
) =>
  getField(
    fieldMap,
    fieldName
  ).value;


// ================================================
// FIND ORIGINAL EXTRACTED FIELD
// ================================================

const getOriginalField = (
  extractedFields,
  fieldName
) => {

  if (!Array.isArray(extractedFields)) {
    return null;
  }

  return extractedFields.find(
    (field) =>
      field?.fieldName === fieldName
  ) || null;

};


// ================================================
// GET EFFECTIVE ORIGINAL VALUE
//
// Priority:
//
// CORRECTED / VERIFIED officerValue
//        ↓
// aiValue
// ================================================

const getOriginalEffectiveValue = (
  originalField
) => {

  if (!originalField) {
    return null;
  }

  const status =
    originalField.verificationStatus ||
    "UNVERIFIED";


  // Rejected values must not be used
  if (status === "REJECTED") {
    return null;
  }


  // Officer value has priority
  if (
    (
      status === "CORRECTED" ||
      status === "VERIFIED"
    ) &&
    hasValue(originalField.officerValue)
  ) {

    return originalField.officerValue;

  }


  const aiValue = originalField.aiValue ?? null;
  if (
    originalField.fieldName === "NET_QTY" &&
    isObject(aiValue) &&
    isObject(aiValue.value) &&
    Object.prototype.hasOwnProperty.call(aiValue.value, "unit")
  ) {
    return aiValue.value;
  }

  return aiValue;

};


// ================================================
// NORMALIZE NET QUANTITY
// ================================================

const normalizeNetQuantity = (
  resolvedValue,
  originalField
) => {

  // Get the complete original value so
  // unit/rawText are not lost.

  const originalValue =
    getOriginalEffectiveValue(
      originalField
    );


  const valueToUse =
    originalValue !== null &&
    originalValue !== undefined

      ? originalValue

      : resolvedValue;


  // ----------------------------------------------
  // OBJECT FORMAT
  // ----------------------------------------------

  if (isObject(valueToUse)) {

    const rawValue =
      valueToUse.value ??
      valueToUse.quantity ??
      null;


    let numericValue = rawValue;


    if (
      typeof rawValue === "string" &&
      rawValue.trim() !== ""
    ) {

      const converted =
        Number(rawValue);

      numericValue =
        Number.isNaN(converted)

          ? null

          : converted;

    }


    return {

      value:
        numericValue ?? null,


      unit:
        valueToUse.unit ??
        valueToUse.uom ??
        null,


      raw_text:

        originalField?.ocrText ??
        valueToUse.rawText ??

        valueToUse.raw_text ??

        valueToUse.declarationText ??

        valueToUse.declaration_text ??

        null,


      measurement_type:

        valueToUse.measurementType ??

        valueToUse.measurement_type ??

        "UNKNOWN"

    };

  }


  // ----------------------------------------------
  // PRIMITIVE FORMAT
  // ----------------------------------------------

  if (
    typeof valueToUse === "number"
  ) {

    return {

      value: valueToUse,

      unit: null,

      raw_text:
        String(valueToUse),

      measurement_type:
        "UNKNOWN"

    };

  }


  // ----------------------------------------------
  // STRING FORMAT
  // ----------------------------------------------

  if (
    typeof valueToUse === "string"
  ) {

    const trimmedValue =
      valueToUse.trim();


    const numericValue =
      Number(trimmedValue);


    return {

      value:

        trimmedValue !== "" &&
        !Number.isNaN(numericValue)

          ? numericValue

          : null,


      unit: null,


      raw_text:
        trimmedValue || null,


      measurement_type:
        "UNKNOWN"

    };

  }


  // ----------------------------------------------
  // MISSING VALUE
  // ----------------------------------------------

  return {

    value: null,

    unit: null,

    raw_text: null,

    measurement_type:
      "UNKNOWN"

  };

};


// ================================================
// NORMALIZE PRICE
// ================================================

const normalizePrice = (
  value
) => {

  if (
    isObject(value) &&
    Object.prototype.hasOwnProperty.call(
      value,
      "value"
    )
  ) {

    return value.value ?? null;

  }


  return value ?? null;

};

const unwrapAI = (field) => field?.value ?? null;

const getRegionText = (regions, fieldName) =>
  regions
    .filter((region) => region.field === fieldName)
    .map((region) => region.ocrText)
    .filter((text) => text !== null && text !== undefined && text !== "")
    .join(" | ") || null;

const inferMeasurementType = (unit) => {
  const normalized = String(unit || "").toLowerCase();
  if (["mg", "g", "kg", "gram", "grams", "kilogram", "kilograms"].includes(normalized)) {
    return "MASS";
  }
  if (["ml", "l", "litre", "liter", "litres", "liters"].includes(normalized)) {
    return "VOLUME";
  }
  if (["nos", "number", "count"].includes(normalized)) {
    return "NUMBER";
  }
  return null;
};

const normalizeAIOutput = (inspection) => {
  const { product: source, regions = [], imageQuality = [], scale } = inspection;
  const quantitySource = source.netQuantity || {};
  const quantityRegionText = getRegionText(regions, "NET_QTY");
  const address = getRegionText(regions, "ADDRESS");
  const quantity = {
    value: unwrapAI(quantitySource),
    unit: quantitySource.unit ?? null,
    raw_text: quantityRegionText,
    measurement_type: inferMeasurementType(quantitySource.unit)
  };
  const importer = unwrapAI(source.importer);

  const product = {
    commodity_name: unwrapAI(source.name),
    category: unwrapAI(source.category),
    physical_form: "UNKNOWN",
    manufacturer: unwrapAI(source.manufacturer),
    packer: unwrapAI(source.packer),
    importer,
    address,
    is_imported: importer !== null && importer !== "" ? true : null,
    is_industrial_consumer: null,
    is_institutional_consumer: null,
    origin: unwrapAI(source.countryOfOrigin),
    net_quantity: quantity,
    measurement_type: quantity.measurement_type,
    quantity_declaration: quantityRegionText,
    month_year: unwrapAI(source.manufactureDate),
    retail_sale_price: unwrapAI(source.mrp),
    dimensions: getRegionText(regions, "DIMENSIONS"),
    consumer_care: {
      phone: unwrapAI(source.consumerCare?.phone),
      email: unwrapAI(source.consumerCare?.email)
    },
    other_declarations: getRegionText(regions, "OTHER_DECLARATIONS"),
    sale_basis: null,
    identifying_mark: null,
    package_capacity: null,
    declaration: { on_principal_display_panel: null },
    measurements: {
      numeral_height_mm: null,
      letter_height_mm: null,
      letter_width_mm: null,
      quantity_numeral_height_mm: null,
      quantity_clearance: { top: null, bottom: null, left: null, right: null },
      declaration_style: null
    },
    analysis: {
      legible: null,
      prominent: null,
      mrp_contrast: null,
      net_quantity_contrast: null,
      read_through_liquid: null,
      handwritten: null,
      handwritten_legible: null,
      languages: [],
      outer_wrapper_present: null,
      outer_wrapper_declarations_present: null
    }
  };

  return {
    ...inspection,
    product,
    package: { has_outer_wrapper: null, outer_wrapper_transparent: null, package_type: "UNKNOWN" },
    quantity: {
      value: quantity.value,
      unit: quantity.unit,
      measurementType: quantity.measurement_type,
      declarationText: quantity.raw_text
    },
    dimensions: product.dimensions,
    regions,
    imageQuality,
    scale,
    exemptions: [],
    ruleEngineMetadata: { source: "AI_OUTPUT", requiresHumanVerification: false }
  };
};


// ================================================
// MAIN INSPECTION ADAPTER
// ================================================

const normalizeInspectionData = (
  inspection
) => {

  // ==============================================
  // VALIDATE BASIC INPUT
  // ==============================================

  if (!inspection) {

    throw new Error(
      "Inspection data is required"
    );

  }

  if (
    inspection.product?.name &&
    inspection.product?.netQuantity &&
    Array.isArray(inspection.regions)
  ) {
    return normalizeAIOutput(inspection);
  }


  // ==============================================
  // GET EXTRACTED FIELDS
  // ==============================================

  const extractedFields =
    inspection.extractedFields ||
    inspection.fields;


  // ==============================================
  // COMPATIBILITY
  //
  // If already internal rule-engine format,
  // return as it is.
  // ==============================================

  if (!Array.isArray(extractedFields)) {

    return inspection;

  }


  // ==============================================
  // CREATE RESOLVED FIELD MAP
  // ==============================================

  const fieldMap =
    createExtractedFieldMap(
      extractedFields
    );


  // ==============================================
  // GET ORIGINAL IMPORTANT FIELDS
  // ==============================================

  const originalNetQuantityField =
    getOriginalField(
      extractedFields,
      "NET_QTY"
    );


  // ==============================================
  // NORMALIZE NET QUANTITY
  // ==============================================

  const netQuantity =
    normalizeNetQuantity(

      getValue(
        fieldMap,
        "NET_QTY"
      ),

      originalNetQuantityField

    );


  // ==============================================
  // BASIC PRODUCT INFORMATION
  // ==============================================

  const commodityName =
    getValue(
      fieldMap,
      "PRODUCT_NAME"
    );


  const importer =
    getValue(
      fieldMap,
      "IMPORTER"
    );


  const origin =
    getValue(
      fieldMap,
      "ORIGIN"
    );


  // ==============================================
  // IMPORT STATUS
  //
  // IMPORTANT:
  // ORIGIN existing does NOT automatically mean
  // the product is not imported.
  // ==============================================

  const isImported =
    hasValue(importer)

      ? true

      : null;


  // ==============================================
  // FIELD VERIFICATION METADATA
  // ==============================================

  const verification = {};


  for (
    const [fieldName, field]
    of Object.entries(fieldMap)
  ) {

    verification[fieldName] = {

      status:
        field.status,


      requiresHumanVerification:
        field.requiresVerification,


      confidence:
        field.confidence

    };

  }


  // ==============================================
  // INTERNAL PRODUCT OBJECT
  // ==============================================

  const product = {

    commodity_name:
      commodityName,


    physical_form:
      "UNKNOWN",


    manufacturer:

      getValue(
        fieldMap,
        "MANUFACTURER"
      ),


    packer:

      getValue(
        fieldMap,
        "PACKER"
      ),


    importer,


    address:

      getValue(
        fieldMap,
        "ADDRESS"
      ),


    is_imported:
      isImported,


    is_industrial_consumer:
      null,


    is_institutional_consumer:
      null,


    origin,


    // ============================================
    // QUANTITY
    // ============================================

    net_quantity:
      netQuantity,


    measurement_type:
      netQuantity.measurement_type,


    quantity_declaration:
      netQuantity.raw_text,


    // ============================================
    // DATE
    // ============================================

    month_year:

      getValue(
        fieldMap,
        "DATE"
      ),


    // ============================================
    // PRICE
    // ============================================

    retail_sale_price:

      normalizePrice(

        getValue(
          fieldMap,
          "MRP"
        )

      ),


    // ============================================
    // DIMENSIONS
    // ============================================

    dimensions:

      getValue(
        fieldMap,
        "DIMENSIONS"
      ),


    // ============================================
    // CONSUMER CARE
    // ============================================

    consumer_care:

      getValue(
        fieldMap,
        "CONSUMER_CARE"
      ),


    // ============================================
    // OTHER DECLARATIONS
    // ============================================

    other_declarations:

      getValue(
        fieldMap,
        "OTHER_DECLARATIONS"
      ),


    sale_basis:
      null,


    identifying_mark:
      null,


    package_capacity:
      null,


    declaration: {

      on_principal_display_panel:
        null

    },


    // ============================================
    // MEASUREMENTS
    // ============================================

    measurements: {

      numeral_height_mm:
        null,


      letter_height_mm:
        null,


      letter_width_mm:
        null,


      quantity_numeral_height_mm:
        null,


      quantity_clearance: {

        top: null,

        bottom: null,

        left: null,

        right: null

      },


      declaration_style:
        null

    },


    // ============================================
    // ANALYSIS
    // ============================================

    analysis: {

      legible:
        null,


      prominent:
        null,


      mrp_contrast:
        null,


      net_quantity_contrast:
        null,


      read_through_liquid:
        null,


      handwritten:
        null,


      handwritten_legible:
        null,


      languages:
        [],


      outer_wrapper_present:
        null,


      outer_wrapper_declarations_present:
        null

    }

  };


  // ==============================================
  // RETURN INTERNAL RULE ENGINE FORMAT
  // ==============================================

  return {

    ...inspection,


    // ============================================
    // FIELD DATA
    // ============================================

    extractedFieldMap:
      fieldMap,


    fieldVerification:
      verification,


    // ============================================
    // PRODUCT
    // ============================================

    product,


    // ============================================
    // PACKAGE
    // ============================================

    package: {

      has_outer_wrapper:
        null,


      outer_wrapper_transparent:
        null,


      package_type:
        "UNKNOWN"

    },


    // ============================================
    // QUANTITY
    // ============================================

    quantity: {

      value:
        netQuantity.value,


      unit:
        netQuantity.unit,


      measurementType:
        netQuantity.measurement_type,


      declarationText:
        netQuantity.raw_text

    },


    // ============================================
    // DIMENSIONS
    // ============================================

    dimensions:
      product.dimensions,


    // ============================================
    // EXEMPTIONS
    // ============================================

    exemptions:
      [],


    // ============================================
    // RULE ENGINE METADATA
    // ============================================

    ruleEngineMetadata: {

      source:
        "EXTRACTED_FIELDS",


      requiresHumanVerification:

        Object.values(
          verification
        ).some(

          (field) =>
            field.requiresHumanVerification

        )

    }

  };

};

module.exports = { normalizeInspectionData };