const { getNestedValue } = require("../utils/getNestedValue");

const {
  findFourthScheduleEntry
} = require("../utils/scheduleLookup");


// ==========================================
// FIELD PATH MAPPING
// ==========================================

const fieldPaths = {
  commodity_name: "product.commodity_name",
  PRODUCT_NAME: "product.commodity_name",

  net_quantity: "product.net_quantity",
  NET_QTY: "product.net_quantity",

  month_year: "product.month_year",
  DATE: "product.month_year",

  retail_sale_price: "product.retail_sale_price",
  MRP: "product.retail_sale_price",

  dimensions: "product.dimensions",

  consumer_care: "product.consumer_care",

  manufacturer: "product.manufacturer",
  MANUFACTURER: "product.manufacturer",

  packer: "product.packer",
  PACKER: "product.packer",

  importer: "product.importer",
  IMPORTER: "product.importer",

  address: "product.address",
  ADDRESS: "product.address",

  is_imported: "product.is_imported",

  package_capacity: "product.package_capacity",

  identifying_mark: "product.identifying_mark",

  measurement_type: "product.net_quantity.measurement_type",

  physical_form: "product.physical_form",

  sale_basis: "product.sale_basis",

  quantity_declaration: "product.quantity_declaration"
};


// ==========================================
// CHECK IF VALUE IS EMPTY
// ==========================================

const getActualValue = (value) => {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "value") &&
    (
      Object.prototype.hasOwnProperty.call(value, "confidence") ||
      Object.keys(value).length === 1
    )
  ) {
    return value.value;
  }

  return value;
};

const isEmpty = (value) => {
  value = getActualValue(value);

  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  return false;
};


// ==========================================
// NORMALIZE TEXT
// ==========================================

const normalize = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
};


// ==========================================
// FIELD_REQUIRED
// ==========================================

const evaluateFieldRequired = (check, productData) => {
  const fieldPath = fieldPaths[check.field];

  if (!fieldPath) {
    return {
      status: "REQUIRES_VERIFICATION",
      reason: `No field mapping exists for "${check.field}"`,
      observedValue: null,
      requiredValue: check.requirement || null
    };
  }

  const value = getNestedValue(productData, fieldPath);


  // ========================================
  // CONSUMER CARE SPECIAL VALIDATION
  // ========================================

  if (check.field === "consumer_care" && !isEmpty(value)) {
    const requiredFields = ["name", "address", "phone"];

    const missingFields = requiredFields.filter((field) =>
      isEmpty(value[field])
    );

    if (missingFields.length > 0) {
      return {
        status:
          check.on_missing === "FAIL"
            ? "FAIL"
            : "REQUIRES_VERIFICATION",

        reason: `consumer_care is missing: ${missingFields.join(", ")}`,

        observedValue: value,

        requiredValue: check.requirement || null
      };
    }
  }


  // ========================================
  // FIELD MISSING
  // ========================================

  if (isEmpty(value)) {
    return {
      status:
        check.on_missing === "FAIL"
          ? "FAIL"
          : "REQUIRES_VERIFICATION",

      reason: `${check.field} is missing`,

      observedValue: null,

      requiredValue: check.requirement || null
    };
  }


  // ========================================
  // FIELD PRESENT
  // ========================================

  return {
    status: "PASS",

    reason: `${check.field} is present`,

    observedValue: value,

    requiredValue: check.requirement || null
  };
};


// ==========================================
// CONDITIONAL_FIELD
// ==========================================

const evaluateConditionalField = (check, productData) => {
  const fieldPath = fieldPaths[check.field];

  if (!fieldPath) {
    return {
      status: "REQUIRES_VERIFICATION",
      reason: `No field mapping exists for "${check.field}"`,
      observedValue: null,
      requiredValue: check.requirement || null
    };
  }

  const value = getNestedValue(productData, fieldPath);

  if (!isEmpty(value)) {
    return {
      status: "PASS",
      reason: `${check.field} is present`,
      observedValue: value,
      requiredValue: check.requirement || null
    };
  }

  return {
    status: "REQUIRES_VERIFICATION",

    reason:
      `Cannot automatically determine whether ${check.field} is required`,

    observedValue: null,

    requiredValue: check.requirement || null
  };
};


// ==========================================
// RESPONSIBLE_PERSON
// ==========================================

const evaluateResponsiblePerson = (check, productData) => {
  const isImported = getNestedValue(
    productData,
    "product.is_imported"
  );

  const manufacturer = getNestedValue(
    productData,
    "product.manufacturer"
  );

  const packer = getNestedValue(
    productData,
    "product.packer"
  );

  const importer = getNestedValue(
    productData,
    "product.importer"
  );


  // ========================================
  // IMPORTED PRODUCT
  // ========================================

  if (isImported === true) {
    if (!isEmpty(importer)) {
      return {
        status: "PASS",

        reason:
          "Importer information is present",

        observedValue: importer,

        requiredValue:
          check.requirement || null
      };
    }

    return {
      status: "FAIL",

      reason:
        "Importer information is missing for an imported product",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  // ========================================
  // NORMAL PRODUCT
  // ========================================

  if (
    !isEmpty(manufacturer) ||
    !isEmpty(packer)
  ) {
    return {
      status: "PASS",

      reason:
        "Manufacturer or packer information is present",

      observedValue:
        !isEmpty(manufacturer)
          ? manufacturer
          : packer,

      requiredValue:
        check.requirement || null
    };
  }

  if (isImported === null) {
    return {
      status: "REQUIRES_VERIFICATION",
      reason:
        "Import status and responsible party information cannot be determined",
      observedValue: {
        manufacturer,
        packer,
        importer
      },
      requiredValue: check.requirement || null
    };
  }


  return {
    status: "FAIL",

    reason:
      "Manufacturer and packer information are missing",

    observedValue: null,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// SOURCE_TEXT_COMPLIANCE
// ==========================================

const evaluateSourceTextCompliance = (check) => {
  return {
    status: "REQUIRES_VERIFICATION",

    reason:
      "This rule requires manual or advanced inspection against the legal source text",

    observedValue: null,

    requiredValue:
      check.requirement ||
      "Evaluate compliance according to the legal requirement"
  };
};


// ==========================================
// ADDRESS_OR_IDENTITY
// ==========================================

const evaluateAddressOrIdentity = (
  check,
  productData
) => {

  const isImported =
    getNestedValue(
      productData,
      "product.is_imported"
    );

  const manufacturer =
    getNestedValue(
      productData,
      "product.manufacturer"
    );

  const packer =
    getNestedValue(
      productData,
      "product.packer"
    );

  const importer =
    getNestedValue(
      productData,
      "product.importer"
    );

  const identifyingMark =
    getNestedValue(
      productData,
      "product.identifying_mark"
    );


  // ========================================
  // SMALL PACKAGE
  // ========================================

  if (
    check.check_id ===
    "R10_SMALL_PACKAGE"
  ) {

    if (!isEmpty(identifyingMark)) {
      return {
        status: "PASS",

        reason:
          "Identifying mark or inscription is present",

        observedValue:
          identifyingMark,

        requiredValue:
          check.requirement || null
      };
    }

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Cannot determine whether the small package exception applies",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  // ========================================
  // IMPORTED PACKAGED IN INDIA
  // ========================================

  if (
    check.check_id ===
    "R10_IMPORTED_PACKED_INDIA"
  ) {

    if (isImported !== true) {
      return {
        status:
          "NOT_APPLICABLE",

        reason:
          "Product is not imported",

        observedValue: {
          is_imported:
            isImported
        },

        requiredValue:
          check.requirement || null
      };
    }


    if (
      !isEmpty(packer) ||
      !isEmpty(importer)
    ) {
      return {
        status: "PASS",

        reason:
          "Packer or importer information is present",

        observedValue: {
          packer,
          importer
        },

        requiredValue:
          check.requirement || null
      };
    }


    return {
      status: "FAIL",

      reason:
        "Packer or importer information is missing",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  // ========================================
  // IMPORTED PRODUCT
  // ========================================

  if (isImported === true) {

    if (!isEmpty(importer)) {
      return {
        status: "PASS",

        reason:
          "Importer name and address information is present",

        observedValue:
          importer,

        requiredValue:
          check.requirement || null
      };
    }

    return {
      status: "FAIL",

      reason:
        "Importer information is missing for imported product",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  // ========================================
  // NORMAL PRODUCT
  // ========================================

  if (
    !isEmpty(manufacturer) ||
    !isEmpty(packer)
  ) {

    return {
      status: "PASS",

      reason:
        "Manufacturer or packer information is present",

      observedValue: {
        manufacturer,
        packer
      },

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status: "FAIL",

    reason:
      "Manufacturer and packer information are missing",

    observedValue: null,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// SI_UNIT_SYSTEM
// ==========================================

const evaluateSIUnitSystem = (
  check,
  productData
) => {

  const unit =
    getNestedValue(
      productData,
      "product.net_quantity.unit"
    );


  if (isEmpty(unit)) {
    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Net quantity unit is missing",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  const unitAliases = {
    MILLIGRAM: "MG",
    MILLIGRAMS: "MG",
    GRAM: "G",
    GRAMS: "G",
    KILOGRAM: "KG",
    KILOGRAMS: "KG",
    MILLILITRE: "ML",
    MILLILITER: "ML",
    LITRE: "L",
    LITER: "L",
    LITRES: "L",
    LITERS: "L",
    NUMBER: "NOS"
  };

  const validUnits = [

    "MG",
    "G",
    "KG",

    "ML",
    "L",

    "MM",
    "CM",
    "M",

    "SQ_CM",
    "SQ_M",

    "CUBIC_CM",
    "CUBIC_M",

    "NUMBER",
    "NOS"
  ];


  const normalizedUnit =
    unitAliases[normalize(unit)] || normalize(unit);


  if (
    validUnits.includes(
      normalizedUnit
    )
  ) {

    return {
      status: "PASS",

      reason:
        `Unit "${unit}" is a supported SI/standard unit`,

      observedValue:
        unit,

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status: "FAIL",

    reason:
      `Unit "${unit}" is not a supported SI/standard unit`,

    observedValue:
      unit,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// UNIT_MAPPING
// ==========================================

const evaluateUnitMapping = (
  check,
  productData
) => {

  const quantity =
    getNestedValue(
      productData,
      "product.net_quantity.value"
    );

  const unit =
    getNestedValue(
      productData,
      "product.net_quantity.unit"
    );


  if (
    isEmpty(quantity) ||
    isEmpty(unit)
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Quantity value or unit is missing",

      observedValue: {
        value: quantity,
        unit
      },

      requiredValue:
        check.requirement || null
    };
  }


  if (
    typeof quantity !== "number" ||
    quantity <= 0
  ) {

    return {
      status: "FAIL",

      reason:
        "Net quantity must be a positive number",

      observedValue: {
        value: quantity,
        unit
      },

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status: "PASS",

    reason:
      "Net quantity contains a valid value and unit",

    observedValue: {
      value: quantity,
      unit
    },

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// PROHIBITED_NUMBER_WORDS
// ==========================================

const evaluateProhibitedNumberWords = (
  check,
  productData
) => {

  const declaration =
    getNestedValue(
      productData,
      "product.net_quantity.raw_text"
    ) ??
    getNestedValue(
      productData,
      "product.quantity_declaration"
    );


  if (isEmpty(declaration)) {
    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Quantity declaration text is not available for inspection",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  const prohibitedWords = [
    "dozen",
    "score",
    "gross"
  ];


  const lowerCaseDeclaration =
    String(declaration).toLowerCase();


  const foundWord =
    prohibitedWords.find(
      (word) =>
        lowerCaseDeclaration.includes(word)
    );


  if (foundWord) {
    return {
      status: "FAIL",

      reason:
        `Prohibited number word "${foundWord}" was found`,

      observedValue:
        declaration,

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status: "PASS",

    reason:
      "No prohibited number words were found",

    observedValue:
      declaration,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// RULE 12
// MEASUREMENT TYPE
// ==========================================

const evaluateMeasurementType = (
  check,
  productData
) => {

  const physicalForm =
    getNestedValue(
      productData,
      "product.physical_form"
    );

  const saleBasis =
    getNestedValue(
      productData,
      "product.sale_basis"
    );

  const measurementType =
    getNestedValue(
      productData,
      "product.net_quantity.measurement_type"
    ) ??
    getNestedValue(
      productData,
      "product.measurement_type"
    );


  // ========================================
  // REQUIRED INFORMATION
  // ========================================

  if (
    isEmpty(physicalForm) &&
    isEmpty(saleBasis)
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Physical form or sale basis is required to determine measurement type",

      observedValue: {
        physicalForm,
        saleBasis,
        measurementType
      },

      requiredValue:
        check.requirement || null
    };
  }


  if (
    isEmpty(measurementType)
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Measurement type is missing",

      observedValue: {
        physicalForm,
        saleBasis
      },

      requiredValue:
        "Measurement type must match product form or sale basis"
    };
  }


  // ========================================
  // RULE 12 DEFAULT MAPPING
  // ========================================

  const mapping = {

    SOLID: "MASS",

    SEMI_SOLID: "MASS",

    VISCOUS: "MASS",

    MIXTURE_SOLID_LIQUID: "MASS",

    LIQUID: "VOLUME",

    CUBIC_MEASURE: "VOLUME",

    LINEAR_SALE: "LENGTH",

    AREA_SALE: "AREA",

    SOLD_BY_NUMBER: "NUMBER"
  };


  const normalizedPhysicalForm =
    normalize(physicalForm);

  const normalizedSaleBasis =
    normalize(saleBasis);

  const normalizedMeasurementType =
    normalize(measurementType);


  // ========================================
  // FIND EXPECTED TYPE
  // ========================================

  let expectedType =
    mapping[normalizedSaleBasis] ||
    mapping[normalizedPhysicalForm];


  if (!expectedType) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "No Rule 12 measurement mapping exists for the provided physical form or sale basis",

      observedValue: {
        physicalForm,
        saleBasis,
        measurementType
      },

      requiredValue:
        check.requirement || null
    };
  }


  // ========================================
  // ALLOW WEIGHT AS MASS
  // ========================================

  const matches =
    normalizedMeasurementType ===
      expectedType ||

    (
      expectedType === "MASS" &&
      normalizedMeasurementType ===
        "WEIGHT"
    );


  if (matches) {

    return {
      status: "PASS",

      reason:
        `Measurement type "${measurementType}" correctly matches Rule 12 requirement "${expectedType}"`,

      observedValue: {
        physicalForm,
        saleBasis,
        measurementType
      },

      requiredValue:
        expectedType
    };
  }


  return {
    status: "FAIL",

    reason:
      `Rule 12 requires measurement type "${expectedType}" but found "${measurementType}"`,

    observedValue: {
      physicalForm,
      saleBasis,
      measurementType
    },

    requiredValue:
      expectedType
  };
};


// ==========================================
// BACKWARD COMPATIBILITY
// MEASUREMENT_TYPE_MAPPING
// ==========================================

const evaluateMeasurementTypeMapping = (
  check,
  productData
) => {
  return evaluateMeasurementType(
    check,
    productData
  );
};


// ==========================================
// RULE 12
// ADDITIONAL QUANTITY REQUIREMENTS
// ==========================================

const evaluateAdditionalQuantityRequirements = (
  check,
  productData
) => {

  const quantity =
    getNestedValue(
      productData,
      "product.net_quantity"
    );

  const rawText =
    getNestedValue(
      productData,
      "product.net_quantity.raw_text"
    );

  const commodityName =
    getNestedValue(
      productData,
      "product.commodity_name"
    );


  if (
    isEmpty(quantity)
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Net quantity information is missing",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  // Basic automatic validation:
  // quantity must have value and unit.

  if (
    typeof quantity.value !== "number" ||
    quantity.value <= 0 ||
    isEmpty(quantity.unit)
  ) {

    return {
      status: "FAIL",

      reason:
        "Net quantity declaration is incomplete or invalid",

      observedValue:
        quantity,

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status: "PASS",

    reason:
      "Required quantity information is available",

    observedValue: {
      commodityName,
      value: quantity.value,
      unit: quantity.unit,
      rawText
    },

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// RULE 12
// SMALL PACKAGE EXCEPTION
// ==========================================

const evaluateSmallPackageException = (
  check,
  productData
) => {

  const capacity =
    getNestedValue(
      productData,
      "package.capacity_cm3"
    ) ??
    getNestedValue(
      productData,
      "product.package.capacity_cm3"
    ) ??
    getNestedValue(
      productData,
      "product.package_capacity.value"
    );


  if (
    isEmpty(capacity)
  ) {

    return {
      status:
        "NOT_APPLICABLE",

      reason:
        "Small package capacity information is not available",

      observedValue: null,

      requiredValue:
        "Capacity must be 5 cubic cm or less"
    };
  }


  if (
    typeof capacity !== "number"
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Package capacity is invalid",

      observedValue:
        capacity,

      requiredValue:
        "Capacity must be 5 cubic cm or less"
    };
  }


  if (
    capacity <= 5
  ) {

    const identifyingMark =
      getNestedValue(
        productData,
        "product.identifying_mark"
      );

    if (
      !isEmpty(identifyingMark)
    ) {

      return {
        status: "PASS",

        reason:
          "Small package exception applies and identifying mark is present",

        observedValue: {
          capacity_cm3:
            capacity,

          identifyingMark
        },

        requiredValue:
          "Non-removable identifying mark or inscription"
      };
    }


    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Small package exception applies but identifying mark information is missing",

      observedValue: {
        capacity_cm3:
          capacity
      },

      requiredValue:
        "Non-removable identifying mark or inscription"
    };
  }


  return {
    status:
      "NOT_APPLICABLE",

    reason:
      "Small package exception does not apply",

    observedValue: {
      capacity_cm3:
        capacity
    },

    requiredValue:
      "Capacity must be 5 cubic cm or less"
  };
};


// ==========================================
// RULE 12
// FOURTH SCHEDULE LOOKUP
// ==========================================

const evaluateScheduleLookup = (
  check,
  productData
) => {

  const commodityName =
    getNestedValue(
      productData,
      "product.commodity_name"
    );


  const measurementType =
    getNestedValue(
      productData,
      "product.net_quantity.measurement_type"
    ) ??
    getNestedValue(
      productData,
      "product.measurement_type"
    );


  // ========================================
  // COMMODITY MISSING
  // ========================================

  if (isEmpty(commodityName)) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Commodity name is required for Fourth Schedule lookup",

      observedValue:
        null,

      requiredValue:
        check.requirement ||
        "Fourth Schedule"
    };

  }


  // ========================================
  // FIND COMMODITY IN FOURTH SCHEDULE
  // ========================================

  const scheduleEntry =
    findFourthScheduleEntry(
      commodityName
    );


  // ========================================
  // COMMODITY NOT FOUND
  // ========================================

  if (!scheduleEntry) {

    return {
      status:
        "NOT_APPLICABLE",

      reason:
        `"${commodityName}" is not listed in the Fourth Schedule`,

      observedValue: {
        commodity:
          commodityName,

        measurementType:
          measurementType || null
      },

      requiredValue:
        "Fourth Schedule exception does not apply"
    };

  }


  // ========================================
  // MEASUREMENT TYPE MISSING
  // ========================================

  if (isEmpty(measurementType)) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        `"${commodityName}" is listed in the Fourth Schedule but measurement type is missing`,

      observedValue: {
        commodity:
          commodityName
      },

      requiredValue:
        scheduleEntry.allowed_declaration
    };

  }


  // ========================================
  // NORMALIZE VALUES
  // ========================================

  const normalizedMeasurementType =
    normalize(measurementType);


  const allowedDeclaration =
    normalize(
      scheduleEntry.allowed_declaration
    );


  // ========================================
  // CONVERT WEIGHT → MASS
  // ========================================

  const normalizedAllowed =
    allowedDeclaration
      .replace(
        /WEIGHT/g,
        "MASS"
      )
      .replace(
        /MEASURE/g,
        "VOLUME"
      );


  // ========================================
  // SPLIT ALLOWED OPTIONS
  // ========================================

  const allowedTypes =
    normalizedAllowed
      .split("_OR_");


  // ========================================
  // HANDLE AND DECLARATION
  // ========================================

  if (
    normalizedAllowed.includes("_AND_")
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        `"${commodityName}" requires a combined declaration rule that needs additional inspection`,

      observedValue: {
        commodity:
          commodityName,

        measurementType:
          measurementType
      },

      requiredValue:
        scheduleEntry.allowed_declaration
    };

  }


  // ========================================
  // CHECK IF MEASUREMENT TYPE IS ALLOWED
  // ========================================

  const pass =
    allowedTypes.includes(
      normalizedMeasurementType
    );


  if (pass) {

    return {
      status:
        "PASS",

      reason:
        `"${commodityName}" matches the Fourth Schedule declaration requirement`,

      observedValue: {
        commodity:
          commodityName,

        measurementType:
          measurementType
      },

      requiredValue:
        scheduleEntry.allowed_declaration
    };

  }


  // ========================================
  // FAIL
  // ========================================

  return {

    status:
      "FAIL",

    reason:
      `"${commodityName}" does not match the Fourth Schedule declaration requirement`,

    observedValue: {
      commodity:
        commodityName,

      measurementType:
        measurementType
    },

    requiredValue:
      scheduleEntry.allowed_declaration

  };

};


// ==========================================
// RULE 7
// NUMERAL HEIGHT
// ==========================================

const evaluateNumeralHeight = (
  check,
  productData
) => {

  const quantity =
    getNestedValue(
      productData,
      "product.net_quantity.value"
    );

  const unit =
    String(
      getNestedValue(
        productData,
        "product.net_quantity.unit"
      ) || ""
    ).toLowerCase();


  const measuredHeight =
    getNestedValue(
      productData,
      "product.measurements.numeral_height_mm"
    );


  const style =
    String(
      getNestedValue(
        productData,
        "product.measurements.declaration_style"
      ) || "normal"
    ).toLowerCase();


  if (
    typeof quantity !== "number" ||
    isEmpty(unit) ||
    typeof measuredHeight !== "number"
  ) {

    return evaluateManualInspectionCheck(
      check
    );
  }


  const isWeightOrVolume =
    [
      "mg",
      "g",
      "kg",
      "ml",
      "l",
      "litre",
      "liter"
    ].includes(unit);


  const comparableQuantity =
    unit === "kg"
      ? quantity * 1000

      : (
        unit === "l" ||
        unit === "litre" ||
        unit === "liter"
      )
        ? quantity * 1000
        : quantity;


  const rules =
    isWeightOrVolume

      ? check.parameters?.numeral_height_rules
          ?.weight_or_volume

      : check.parameters
          ?.numeral_height_rules
          ?.length_area_or_number_by_principal_display_panel_area;


  const applicableRule =
    rules?.find(
      (rule) =>
        comparableQuantity <=
          (rule.max ?? Infinity) &&

        comparableQuantity >
          (rule.min_exclusive ?? -Infinity)
    );


  if (!applicableRule) {
    return evaluateManualInspectionCheck(
      check
    );
  }


  const formed =
    [
      "formed",
      "molded",
      "moulded",
      "embossed"
    ].some(
      (word) =>
        style.includes(word)
    );


  const requiredHeight =
    formed
      ? applicableRule.formed_or_molded_mm
      : applicableRule.normal_mm;


  const pass =
    measuredHeight >= requiredHeight;


  return {
    status:
      pass
        ? "PASS"
        : "FAIL",

    reason:
      pass
        ? "Numeral height meets Rule 7 requirement"
        : "Numeral height is below the Rule 7 requirement",

    observedValue:
      measuredHeight,

    requiredValue:
      requiredHeight
  };
};


// ==========================================
// RULE 7
// LETTER HEIGHT
// ==========================================

const evaluateLetterHeight = (
  check,
  productData
) => {

  const height =
    getNestedValue(
      productData,
      "product.measurements.letter_height_mm"
    );

  const width =
    getNestedValue(
      productData,
      "product.measurements.letter_width_mm"
    );

  const style =
    String(
      getNestedValue(
        productData,
        "product.measurements.declaration_style"
      ) || "normal"
    ).toLowerCase();


  const minimum =
    [
      "formed",
      "molded",
      "moulded",
      "embossed",
      "perforated",
      "blown"
    ].some(
      (word) =>
        style.includes(word)
    )

      ? check.parameters
          ?.blown_formed_molded_embossed_perforated_min_height_mm

      : check.parameters
          ?.normal_min_height_mm;


  if (
    typeof height !== "number"
  ) {

    return evaluateManualInspectionCheck(
      check
    );
  }


  if (
    height < minimum ||

    (
      typeof width === "number" &&
      width < height / 3
    )
  ) {

    return {
      status: "FAIL",

      reason:
        "Letter height or width does not meet Rule 7 requirement",

      observedValue: {
        height,
        width
      },

      requiredValue: {
        minimum,
        minimumWidth:
          height / 3
      }
    };
  }


  return {
    status: "PASS",

    reason:
      "Letter dimensions meet Rule 7 requirement",

    observedValue: {
      height,
      width
    },

    requiredValue: {
      minimum,
      minimumWidth:
        height / 3
    }
  };
};


// ==========================================
// RULE 8
// PLACEMENT
// ==========================================

const evaluatePlacement = (
  check,
  productData
) => {

  const onPanel =
    getNestedValue(
      productData,
      "product.declaration.on_principal_display_panel"
    );


  const height =
    getNestedValue(
      productData,
      "product.measurements.quantity_numeral_height_mm"
    ) ??
    getNestedValue(
      productData,
      "product.measurements.numeral_height_mm"
    );


  const clearance =
    getNestedValue(
      productData,
      "product.measurements.quantity_clearance"
    );


  // ========================================
  // R8_1
  // ========================================

  if (
    check.check_id ===
    "R8_1"
  ) {

    if (
      typeof onPanel !== "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    return {
      status:
        onPanel
          ? "PASS"
          : "FAIL",

      reason:
        onPanel
          ? "Required declaration is on the principal display panel"
          : "Required declaration is not on the principal display panel",

      observedValue:
        onPanel,

      requiredValue:
        true
    };
  }


  // ========================================
  // R8 CLEARANCE
  // ========================================

  if (
    typeof height !== "number" ||
    !clearance ||

    typeof clearance.top !== "number" ||
    typeof clearance.bottom !== "number" ||
    typeof clearance.left !== "number" ||
    typeof clearance.right !== "number"
  ) {

    return evaluateManualInspectionCheck(
      check
    );
  }


  const horizontal =
    clearance.left >= height * 2 &&
    clearance.right >= height * 2;


  const vertical =
    clearance.top >= height &&
    clearance.bottom >= height;


  const pass =
    check.check_id ===
    "R8_2_TOP_BOTTOM"

      ? vertical
      : horizontal;


  return {
    status:
      pass
        ? "PASS"
        : "FAIL",

    reason:
      pass
        ? "Declaration clearance meets Rule 8 requirement"
        : "Declaration clearance is insufficient under Rule 8",

    observedValue:
      clearance,

    requiredValue: {
      top: height,
      bottom: height,
      left: height * 2,
      right: height * 2
    }
  };
};


// ==========================================
// RULE 9
// TEXT AND DISPLAY
// ==========================================

const evaluateTextAndDisplay = (
  check,
  productData
) => {

  const analysis =
    getNestedValue(
      productData,
      "product.analysis"
    ) || {};


  const legible =
    analysis.legible;

  const prominent =
    analysis.prominent;

  const contrast =
    typeof analysis.contrast === "boolean"
      ? analysis.contrast
      : analysis.mrp_contrast === null ||
          analysis.mrp_contrast === undefined ||
          analysis.net_quantity_contrast === null ||
          analysis.net_quantity_contrast === undefined
        ? null
        : analysis.mrp_contrast === true &&
          analysis.net_quantity_contrast === true;

  const languages =
    analysis.languages;

  const readThroughLiquid =
    analysis.read_through_liquid;


  // ========================================
  // LEGIBLE + PROMINENT
  // ========================================

  if (
    check.check_id ===
    "R9_1_A"
  ) {

    if (
      typeof legible !== "boolean" ||
      typeof prominent !== "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    const pass =
      legible &&
      prominent;


    return {
      status:
        pass
          ? "PASS"
          : "FAIL",

      reason:
        pass
          ? "Declaration is legible and prominent"
          : "Declaration is not legible and prominent",

      observedValue: {
        legible,
        prominent
      },

      requiredValue: {
        legible: true,
        prominent: true
      }
    };
  }


  // ========================================
  // CONTRAST
  // ========================================

  if (
    check.check_id ===
    "R9_1_B"
  ) {

    if (
      typeof contrast !== "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    return {
      status:
        contrast
          ? "PASS"
          : "FAIL",

      reason:
        contrast
          ? "Required numerals contrast with the background"
          : "Required numerals do not contrast with the background",

      observedValue:
        contrast,

      requiredValue:
        true
    };
  }


  // ========================================
  // LIQUID VISIBILITY
  // ========================================

  if (
    check.check_id ===
    "R9_2"
  ) {

    if (
      typeof readThroughLiquid !==
      "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    return {
      status:
        readThroughLiquid
          ? "FAIL"
          : "PASS",

      reason:
        readThroughLiquid
          ? "Declaration requires reading through the liquid commodity"
          : "Declaration does not require reading through the liquid commodity",

      observedValue:
        readThroughLiquid,

      requiredValue:
        false
    };
  }


  // ========================================
  // HANDWRITTEN
  // ========================================

  if (
    check.check_id ===
    "R9_1_HAND"
  ) {

    if (
      typeof analysis.handwritten !==
      "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    if (
      !analysis.handwritten
    ) {

      return {
        status:
          "NOT_APPLICABLE",

        reason:
          "Declaration is not handwritten",

        observedValue:
          false,

        requiredValue:
          false
      };
    }


    if (
      typeof analysis.handwritten_legible !==
      "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    return {
      status:
        analysis.handwritten_legible
          ? "PASS"
          : "FAIL",

      reason:
        analysis.handwritten_legible
          ? "Handwritten declaration is clear and legible"
          : "Handwritten declaration is not clear and legible",

      observedValue:
        analysis.handwritten_legible,

      requiredValue:
        true
    };
  }


  // ========================================
  // OUTER WRAPPER
  // ========================================

  if (
    check.check_id ===
    "R9_3"
  ) {

    if (
      typeof analysis.outer_wrapper_present !==
      "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    if (
      !analysis.outer_wrapper_present
    ) {

      return {
        status:
          "NOT_APPLICABLE",

        reason:
          "No outer wrapper is present",

        observedValue:
          false,

        requiredValue:
          false
      };
    }


    if (
      typeof analysis.outer_wrapper_declarations_present !==
      "boolean"
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    return {
      status:
        analysis.outer_wrapper_declarations_present
          ? "PASS"
          : "FAIL",

      reason:
        analysis.outer_wrapper_declarations_present
          ? "Outer wrapper carries required declarations"
          : "Outer wrapper is missing required declarations",

      observedValue:
        analysis.outer_wrapper_declarations_present,

      requiredValue:
        true
    };
  }


  // ========================================
  // LANGUAGE
  // ========================================

  if (
    check.check_id ===
    "R9_4"
  ) {

    if (
      !Array.isArray(languages) ||
      languages.length === 0
    ) {

      return evaluateManualInspectionCheck(
        check
      );
    }


    const valid =
      languages.some(
        (language) =>
          [
            "ENGLISH",
            "HINDI",
            "DEVANAGARI"
          ].includes(
            String(language).toUpperCase()
          )
      );


    return {
      status:
        valid
          ? "PASS"
          : "FAIL",

      reason:
        valid
          ? "Required declaration language is permitted"
          : "Required declaration language is not permitted",

      observedValue:
        languages,

      requiredValue:
        [
          "ENGLISH",
          "HINDI"
        ]
    };
  }


  return evaluateManualInspectionCheck(
    check
  );
};


// ==========================================
// SPECIAL_CASE
// ==========================================

const evaluateSpecialCase = (
  check,
  productData
) => {

  const packageCapacity =
    getNestedValue(
      productData,
      "product.package_capacity"
    );


  if (
    isEmpty(packageCapacity)
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Package capacity information is missing",

      observedValue: null,

      requiredValue:
        check.requirement || null
    };
  }


  const value =
    packageCapacity.value;

  const unit =
    packageCapacity.unit;


  if (
    typeof value !== "number"
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Package capacity value is invalid",

      observedValue:
        packageCapacity,

      requiredValue:
        check.requirement || null
    };
  }


  if (
    value <= 5 &&
    (
      unit === "cubic cm" ||
      unit === "cm3"
    )
  ) {

    return {
      status:
        "PASS",

      reason:
        "Package qualifies for the small-capacity special case",

      observedValue:
        packageCapacity,

      requiredValue:
        check.requirement || null
    };
  }


  return {
    status:
      "NOT_APPLICABLE",

    reason:
      "Small-capacity special case does not apply",

    observedValue:
      packageCapacity,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// MANUAL INSPECTION CHECK
// ==========================================

const evaluateManualInspectionCheck = (
  check
) => {

  return {
    status:
      "REQUIRES_VERIFICATION",

    reason:
      `Check type "${check.type}" requires inspection data that is not currently available`,

    observedValue: null,

    requiredValue:
      check.requirement || null
  };
};


// ==========================================
// MAIN CHECK EVALUATOR
// ==========================================

const evaluateCheck = (
  check,
  productData
) => {


  // ========================================
  // SAFETY CHECK
  // ========================================

  if (
    !check ||
    !check.type
  ) {

    return {
      status:
        "REQUIRES_VERIFICATION",

      reason:
        "Invalid check definition",

      observedValue: null,

      requiredValue: null
    };
  }


  // ========================================
  // CHECK TYPE SWITCH
  // ========================================

  switch (check.type) {


    // ======================================
    // BASIC RULES
    // ======================================

    case "RESPONSIBLE_PERSON":

      return evaluateResponsiblePerson(
        check,
        productData
      );


    case "FIELD_REQUIRED":

      return evaluateFieldRequired(
        check,
        productData
      );


    case "CONDITIONAL_FIELD":

      return evaluateConditionalField(
        check,
        productData
      );


    case "SOURCE_TEXT_COMPLIANCE":

      return evaluateSourceTextCompliance(
        check,
        productData
      );


    case "ADDRESS_OR_IDENTITY":

      return evaluateAddressOrIdentity(
        check,
        productData
      );


    // ======================================
    // RULE 12
    // ======================================

    case "MEASUREMENT_TYPE":

      return evaluateMeasurementType(
        check,
        productData
      );


    case "MEASUREMENT_TYPE_MAPPING":

      return evaluateMeasurementTypeMapping(
        check,
        productData
      );


    case "ADDITIONAL_QUANTITY_REQUIREMENTS":

      return evaluateAdditionalQuantityRequirements(
        check,
        productData
      );


    case "SMALL_PACKAGE_EXCEPTION":

      return evaluateSmallPackageException(
        check,
        productData
      );


    case "SCHEDULE_LOOKUP":

      return evaluateScheduleLookup(
        check,
        productData
      );


    // ======================================
    // RULE 13
    // ======================================

    case "SI_UNIT_SYSTEM":

      return evaluateSIUnitSystem(
        check,
        productData
      );


    case "UNIT_MAPPING":

      return evaluateUnitMapping(
        check,
        productData
      );


    case "PROHIBITED_NUMBER_WORDS":

      return evaluateProhibitedNumberWords(
        check,
        productData
      );


    // ======================================
    // RULE 7
    // ======================================

    case "MEASUREMENT_THRESHOLD_TABLE":

      return evaluateNumeralHeight(
        check,
        productData
      );


    case "LETTER_HEIGHT":

      return evaluateLetterHeight(
        check,
        productData
      );


    // ======================================
    // RULE 8
    // ======================================

    case "GEOMETRY_OR_PLACEMENT":

      return evaluatePlacement(
        check,
        productData
      );


    // ======================================
    // RULE 9
    // ======================================

    case "TEXT_AND_DISPLAY":

      return evaluateTextAndDisplay(
        check,
        productData
      );


    // ======================================
    // SPECIAL CASE
    // ======================================

    case "SPECIAL_CASE":

      return evaluateSpecialCase(
        check,
        productData
      );


    // ======================================
    // UNKNOWN CHECK TYPE
    // ======================================

    default:

      return {
        status:
          "REQUIRES_VERIFICATION",

        reason:
          `Unsupported check type: ${check.type}`,

        observedValue: null,

        requiredValue:
          check.requirement || null
      };

  }

};

module.exports = {
  evaluateCheck
};