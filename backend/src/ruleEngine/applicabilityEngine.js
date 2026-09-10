import { getNestedValue } from "../utils/getNestedValue.js";


// ==========================================
// HELPER: GET VALUE FROM AI CONFIDENCE OBJECT
// ==========================================

const getAIValue = (productData, path) => {

  const data = getNestedValue(
    productData,
    path
  );

  // Example:
  // {
  //   value: "Shampoo",
  //   confidence: 0.95
  // }

  if (
    data &&
    typeof data === "object" &&
    "value" in data
  ) {
    return data.value;
  }

  return data;

};


// ==========================================
// QUANTITY THRESHOLD
// ==========================================

const evaluateQuantityThreshold = (
  condition,
  productData
) => {

  // NEW AI OUTPUT PATH
  const quantity = getNestedValue(
    productData,
    "product.netQuantity.value"
  );


  const unit = String(
    getNestedValue(
      productData,
      "product.netQuantity.unit"
    ) || ""
  )
    .toLowerCase()
    .trim();
  ;

  // Product name is used instead of old commodity_name
  const productName = String(
    getNestedValue(
      productData,
      "product.name.value"
    ) || ""
  )
    .toLowerCase()
    .trim();


  const category = String(
    getNestedValue(
      productData,
      "product.category.value"
    ) || ""
  )
    .toLowerCase()
    .trim();


  // ========================================
  // REQUIRED DATA CHECK
  // ========================================

  if (
    quantity === undefined ||
    quantity === null ||
    !unit
  ) {

    return {
      applicable: false,
      matched: false,
      status: "VERIFY",
      reason:
        "Quantity or unit information is missing"
    };

  }


  const quantityNumber = Number(quantity);


  if (!Number.isFinite(quantityNumber)) {

    return {
      applicable: false,
      matched: false,
      status: "VERIFY",
      reason:
        "Quantity is not a valid number"
    };

  }


  // ========================================
  // NORMALIZE UNIT
  // ========================================

  const normalizedUnit = unit
    .replace(/\s+/g, "")
    .toLowerCase();


  // ========================================
  // PRODUCT DESCRIPTION
  // ========================================

  const productDescription =
    `${productName} ${category}`.trim();


  // ========================================
  // CEMENT EXCEPTION
  // ========================================

  const isCementException =
    productDescription.includes("cement") &&
    normalizedUnit === "kg" &&
    quantityNumber <= 50;


  // ========================================
  // FERTILIZER EXCEPTION
  // ========================================

  const isFertilizerException =
    productDescription.includes("fertilizer") &&
    normalizedUnit === "kg" &&
    quantityNumber <= 50;


  if (
    isCementException ||
    isFertilizerException
  ) {

    return {
      applicable: true,
      matched: false,
      status: "PASS",
      reason:
        "Package falls under a specified exception"
    };

  }


  // ========================================
  // QUANTITY THRESHOLD
  // ========================================

  const exceedsThreshold =

    (
      normalizedUnit === "kg" &&
      quantityNumber > 25
    )

    ||

    (
      [
        "litre",
        "liter",
        "l"
      ].includes(normalizedUnit)

      &&

      quantityNumber > 25
    );


  if (exceedsThreshold) {

    return {
      applicable: false,
      matched: true,
      status: "NOT_APPLICABLE",
      reason:
        "Quantity is more than the applicable threshold"
    };

  }


  // ========================================
  // QUANTITY IS VALID
  // ========================================

  return {

    applicable: true,

    matched: false,

    status: "PASS",

    reason:
      "Quantity is within the applicable threshold"

  };

};



// ==========================================
// CONSUMER TYPE
// ==========================================

const evaluateConsumerType = (
  condition,
  productData
) => {

  /*
    IMPORTANT:

    Your NEW AI output schema does NOT currently
    contain:

    product.isIndustrialConsumer

    or

    product.isInstitutionalConsumer

    Therefore we should not use the old
    snake_case paths.
  */


  const isIndustrial = getNestedValue(
    productData,
    "product.isIndustrialConsumer"
  );


  const isInstitutional = getNestedValue(
    productData,
    "product.isInstitutionalConsumer"
  );


  // ========================================
  // DATA NOT PROVIDED
  // ========================================

  if (
    isIndustrial === undefined &&
    isInstitutional === undefined
  ) {

    return {
      applicable: true,
      matched: false,
      status: "PASS",
      reason:
        "Consumer type information is not provided; no consumer exclusion applied"
    };

  }


  // ========================================
  // INDUSTRIAL / INSTITUTIONAL
  // ========================================

  if (
    isIndustrial === true ||
    isInstitutional === true
  ) {

    return {

      applicable: false,

      matched: true,

      status: "NOT_APPLICABLE",

      reason:
        "Product is for an industrial or institutional consumer"

    };

  }


  return {

    applicable: true,

    matched: false,

    status: "PASS",

    reason:
      "Product is for a normal consumer"

  };

};



// ==========================================
// PRODUCT CATEGORY
// ==========================================

const evaluateProductCategory = (
  condition,
  productData
) => {

  // NEW AI OUTPUT:
  //
  // product.category = {
  //   value: "Shampoo",
  //   confidence: 0.95
  // }


  const category = String(
    getNestedValue(
      productData,
      "product.category.value"
    ) || ""
  )
    .toUpperCase()
    .trim();


  const allowedCategories =
    Array.isArray(
      condition.allowed_categories
    )
      ? condition.allowed_categories.map(
        (item) =>
          String(item)
            .toUpperCase()
            .trim()
      )
      : [];


  // ========================================
  // NO CATEGORY RESTRICTION
  // ========================================

  if (
    allowedCategories.length === 0
  ) {

    return {

      applicable: true,

      matched: false,

      status: "PASS",

      reason:
        "No category restriction configured"

    };

  }


  // ========================================
  // CATEGORY MISSING
  // ========================================

  if (!category) {

    return {

      applicable: false,

      matched: false,

      status: "VERIFY",

      reason:
        "Product category information is missing"

    };

  }


  // ========================================
  // CATEGORY MATCH
  // ========================================

  if (
    allowedCategories.includes(category)
  ) {

    return {

      applicable: true,

      matched: true,

      status: "PASS",

      reason:
        `Product category "${category}" is applicable`

    };

  }


  return {

    applicable: false,

    matched: false,

    status: "NOT_APPLICABLE",

    reason:
      `Rule does not apply to product category "${category}"`

  };

};



// ==========================================
// CONDITION EVALUATOR
// ==========================================

const evaluateCondition = (
  condition,
  productData
) => {

  if (!condition?.type) {

    return {

      applicable: false,

      matched: false,

      status: "VERIFY",

      reason:
        "Applicability condition type is missing"

    };

  }


  switch (condition.type) {


    case "QUANTITY_THRESHOLD":

      return evaluateQuantityThreshold(
        condition,
        productData
      );


    case "CONSUMER_TYPE":

      return evaluateConsumerType(
        condition,
        productData
      );


    case "PRODUCT_CATEGORY":

      return evaluateProductCategory(
        condition,
        productData
      );


    default:

      return {

        applicable: false,

        matched: false,

        status: "VERIFY",

        reason:
          `Unsupported applicability condition type: ${condition.type}`

      };

  }

};



// ==========================================
// MAIN APPLICABILITY EVALUATOR
// ==========================================

export const evaluateApplicability = (
  rule,
  productData
) => {


  // ========================================
  // RULE MUST EXIST
  // ========================================

  if (!rule) {

    return {

      applicable: false,

      status: "VERIFY",

      reason:
        "Rule definition is missing"

    };

  }


  // ========================================
  // NO APPLICABILITY CONFIGURATION
  // ========================================

  if (!rule.applicability) {

    return {

      applicable: true,

      status: "PASS",

      reason:
        "No rule-specific applicability restriction"

    };

  }


  // ========================================
  // ALWAYS APPLICABLE
  // ========================================

  if (
    rule.applicability.mode === "ALWAYS"
  ) {

    return {

      applicable: true,

      status: "PASS",

      reason:
        "Rule is always applicable"

    };

  }


  // ========================================
  // CONDITIONS
  // ========================================

  const conditions = Array.isArray(
    rule.applicability.conditions
  )
    ? rule.applicability.conditions
    : [];


  // ========================================
  // EMPTY CONDITIONS
  // ========================================

  if (
    conditions.length === 0
  ) {

    return {

      applicable: true,

      status: "PASS",

      reason:
        "No applicability conditions configured"

    };

  }


  // ========================================
  // EVALUATE CONDITIONS
  // ========================================

  for (const condition of conditions) {

    const result =
      evaluateCondition(
        condition,
        productData
      );


    // ======================================
    // VERIFICATION REQUIRED
    // ======================================

    if (
      result.status === "VERIFY"
    ) {

      return {

        applicable: false,

        status: "VERIFY",

        reason:
          result.reason,

        conditionId:
          condition.condition_id ||
          condition.conditionId

      };

    }


    // ======================================
    // RULE NOT APPLICABLE
    // ======================================

    if (
      result.status ===
      "NOT_APPLICABLE"
    ) {

      return {

        applicable: false,

        status: "NOT_APPLICABLE",

        reason:
          result.reason,

        conditionId:
          condition.condition_id ||
          condition.conditionId

      };

    }

  }


  // ========================================
  // ALL CONDITIONS PASSED
  // ========================================

  return {

    applicable: true,

    status: "PASS",

    reason:
      "All applicability conditions allow the rule to apply"

  };

};



// ==========================================
// BACKWARD COMPATIBILITY
// ==========================================

export const isRuleApplicable = (
  rule,
  productData
) => {

  const result =
    evaluateApplicability(
      rule,
      productData
    );


  return result.applicable;

};