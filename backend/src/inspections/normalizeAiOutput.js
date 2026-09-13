// ==========================================
// NORMALIZE AI OUTPUT FOR RULE ENGINE
// ==========================================

const normalizeAiOutput = (aiOutput = {}) => {
  const product = aiOutput?.product || {};

  // ==========================================
  // HELPER: GET VALUE FROM CONFIDENT FIELD
  // ==========================================

  const getValue = (field) => {
    return product?.[field]?.value ?? null;
  };


  // ==========================================
  // HELPER: GET CONFIDENCE
  // ==========================================

  const getConfidence = (field) => {
    return product?.[field]?.confidence ?? null;
  };


  // ==========================================
  // PRODUCT BASIC DATA
  // ==========================================

  const netQuantity = product?.netQuantity || {};

  const mrp = product?.mrp || {};

  const consumerCare = product?.consumerCare || {};


  // ==========================================
  // IMPORT INFORMATION
  // ==========================================

  const importerValue = getValue("importer");

  const countryOfOriginValue =
    getValue("countryOfOrigin");


  // ==========================================
  // QUANTITY INFORMATION
  // ==========================================

  const quantityValue =
    netQuantity?.value ?? null;

  const quantityUnit =
    netQuantity?.unit ?? null;


  // ==========================================
  // MEASUREMENT TYPE
  // ==========================================

  const measurementType =
    getMeasurementType(quantityUnit);


  // ==========================================
  // SALE BASIS
  // ==========================================

  const saleBasis =
    getSaleBasis(measurementType);


  // ==========================================
  // PHYSICAL FORM
  // ==========================================

  const physicalForm =
    getPhysicalForm(
      getValue("name"),
      getValue("category"),
      measurementType
    );


  // ==========================================
  // RETURN NORMALIZED DATA
  // ==========================================

  return {

    // ========================================
    // PRODUCT
    // ========================================

    product: {


      // ======================================
      // ORIGINAL AI SCHEMA FIELDS
      // ======================================

      name: {
        value:
          product?.name?.value ?? null,

        confidence:
          product?.name?.confidence ?? null
      },


      category: {
        value:
          product?.category?.value ?? null,

        confidence:
          product?.category?.confidence ?? null
      },


      netQuantity: {
        value: quantityValue,

        unit: quantityUnit,

        confidence:
          netQuantity?.confidence ?? null
      },


      mrp: {
        value:
          mrp?.value ?? null,

        currency:
          mrp?.currency ?? null,

        confidence:
          mrp?.confidence ?? null
      },


      manufacturer: {
        value:
          product?.manufacturer?.value ?? null,

        confidence:
          product?.manufacturer?.confidence ?? null
      },


      packer: {
        value:
          product?.packer?.value ?? null,

        confidence:
          product?.packer?.confidence ?? null
      },


      importer: {
        value:
          product?.importer?.value ?? null,

        confidence:
          product?.importer?.confidence ?? null
      },


      manufactureDate: {
        value:
          product?.manufactureDate?.value ?? null,

        confidence:
          product?.manufactureDate?.confidence ?? null
      },


     consumerCare: {

  name: {
    value:
      consumerCare?.name?.value ?? null,

    confidence:
      consumerCare?.name?.confidence ?? null
  },

  address: {
    value:
      consumerCare?.address?.value ?? null,

    confidence:
      consumerCare?.address?.confidence ?? null
  },

  phone: {
    value:
      consumerCare?.phone?.value ?? null,

    confidence:
      consumerCare?.phone?.confidence ?? null
  },

  email: {
    value:
      consumerCare?.email?.value ?? null,

    confidence:
      consumerCare?.email?.confidence ?? null
  }

},


      countryOfOrigin: {
        value: countryOfOriginValue,

        confidence:
          product?.countryOfOrigin?.confidence ?? null
      },


      // ======================================
      // RULE ENGINE COMPATIBILITY FIELDS
      // ======================================


      // --------------------------------------
      // COMMODITY NAME
      // --------------------------------------

      commodity_name:
        getValue("name"),


      // --------------------------------------
      // PRODUCT CATEGORY
      // --------------------------------------

      product_category:
        getValue("category"),


      // --------------------------------------
      // NET QUANTITY
      // --------------------------------------

      net_quantity: {

        value: quantityValue,

        unit: quantityUnit,

        raw_text:
          getRegionText(
            aiOutput?.regions,
            "NET_QTY"
          ),

        measurement_type:
          measurementType

      },


      // --------------------------------------
      // MANUFACTURE DATE
      // --------------------------------------

      month_year:
        getValue("manufactureDate"),


      // --------------------------------------
      // RETAIL SALE PRICE
      // --------------------------------------

      retail_sale_price:
        mrp?.value ?? null,


      retail_sale_currency:
        mrp?.currency ?? null,


      // --------------------------------------
      // MANUFACTURER
      // --------------------------------------

      manufacturer_name:
        getValue("manufacturer"),


      // --------------------------------------
      // PACKER
      // --------------------------------------

      packer_name:
        getValue("packer"),


      // --------------------------------------
      // IMPORTER
      // --------------------------------------

      importer_name:
        importerValue,


      // ======================================
      // IMPORT STATUS
      // ======================================

      /*
        IMPORTANT:

        Do not assume imported just because
        countryOfOrigin exists.

        In the current schema we can safely
        identify imported status only when
        importer information is available.
      */

      is_imported:
        Boolean(importerValue),


      // ======================================
      // CONSUMER CARE
      // ======================================

      consumer_care: {

        name:
          consumerCare?.name?.value ?? null,

        address:
          consumerCare?.address?.value ?? null,

        name:
          consumerCare?.name?.value ?? null,

        address:
          consumerCare?.address?.value ?? null,

        phone:
          consumerCare?.phone?.value ?? null,


        email:
          consumerCare?.email?.value ?? null,


      },


      // ======================================
      // PHYSICAL INFORMATION
      // ======================================

      /*
        These values cannot be created
        because they are not present
        in your AI output schema.
      */

      dimensions: null,

      packageCapacity: null,

      package_capacity: null,


      // ======================================
      // DERIVED INFORMATION
      // ======================================

      physicalForm:
        physicalForm,

      physical_form:
        physicalForm,

      saleBasis:
        saleBasis,

      sale_basis:
        saleBasis,

      measurement_type:
        measurementType,


      // ======================================
      // INDUSTRIAL / INSTITUTIONAL
      // ======================================

      /*
        Not available in current AI schema
      */

      is_industrial_consumer: null,

      is_institutional_consumer: null

    },


    // ========================================
    // OCR REGIONS
    // ========================================

    regions:
      Array.isArray(aiOutput?.regions)
        ? aiOutput.regions
        : [],


    // ========================================
    // IMAGE QUALITY
    // ========================================

    imageQuality:
      Array.isArray(aiOutput?.imageQuality)
        ? aiOutput.imageQuality
        : [],


    // ========================================
    // SCALE INFORMATION
    // ========================================

    scale: {

      established:
        aiOutput?.scale?.established ?? false,

      pixelsPerMm:
        aiOutput?.scale?.pixelsPerMm ?? null,

      method:
        aiOutput?.scale?.method ?? null

    }

  };

};


// ==========================================
// GET OCR TEXT FROM REGION
// ==========================================

const getRegionText = (
  regions,
  fieldName
) => {

  if (!Array.isArray(regions)) {
    return null;
  }


  const region =
    regions.find(
      (item) =>
        item?.field === fieldName
    );


  return region?.ocrText ?? null;

};


// ==========================================
// DETECT MEASUREMENT TYPE
// ==========================================

const getMeasurementType = (
  unit
) => {

  if (!unit) {
    return "UNKNOWN";
  }


  const normalizedUnit =
    String(unit)
      .toLowerCase()
      .trim();


  // ========================================
  // WEIGHT
  // ========================================

  if (
    [
      "mg",
      "g",
      "gm",
      "kg",
      "kilogram",
      "kilograms"
    ].includes(normalizedUnit)
  ) {

    return "WEIGHT";

  }


  // ========================================
  // VOLUME
  // ========================================

  if (
    [
      "ml",
      "millilitre",
      "milliliter",
      "l",
      "litre",
      "liter",
      "litres",
      "liters"
    ].includes(normalizedUnit)
  ) {

    return "VOLUME";

  }


  // ========================================
  // NUMBER
  // ========================================

  if (
    [
      "pcs",
      "pc",
      "piece",
      "pieces",
      "nos",
      "no",
      "number"
    ].includes(normalizedUnit)
  ) {

    return "NUMBER";

  }


  return "UNKNOWN";

};


// ==========================================
// DETECT SALE BASIS
// ==========================================

const getSaleBasis = (
  measurementType
) => {

  switch (measurementType) {

    case "WEIGHT":

      return "WEIGHT";


    case "VOLUME":

      return "VOLUME";


    case "NUMBER":

      return "NUMBER";


    default:

      return null;

  }

};


// ==========================================
// DETECT PHYSICAL FORM
// ==========================================

const getPhysicalForm = (
  productName,
  category,
  measurementType
) => {

  const text =

    `${productName || ""} ${category || ""}`
      .toLowerCase()
      .trim();


  // ========================================
  // LIQUID PRODUCTS
  // ========================================

  if (
    measurementType === "VOLUME"
  ) {

    if (
      [
        "shampoo",
        "oil",
        "lotion",
        "liquid",
        "juice",
        "drink",
        "beverage",
        "water",
        "milk",
        "syrup"
      ].some(
        (word) => text.includes(word)
      )
    ) {

      return "LIQUID";

    }

  }


  // ========================================
  // SOLID PRODUCTS
  // ========================================

  if (
    measurementType === "WEIGHT"
  ) {

    return "SOLID";

  }


  // ========================================
  // DEFAULT
  // ========================================

  return "UNKNOWN";

};

module.exports = { normalizeAiOutput };