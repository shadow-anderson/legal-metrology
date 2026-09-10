import Joi from "joi";


// ==========================================
// UUID SCHEMA
// ==========================================

const uuidSchema = Joi.string()
  .guid();


// ==========================================
// CONFIDENT STRING SCHEMA
// ==========================================

const confidentStringSchema = Joi.object({
  value: Joi.string().required(),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .required()

}).unknown(false);


// ==========================================
// CONFIDENT NULLABLE STRING SCHEMA
// ==========================================

const confidentStringNullableSchema = Joi.object({
  value: Joi.string()
    .allow(null)
    .required(),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .allow(null)
    .required()

}).unknown(false);


// ==========================================
// NET QUANTITY SCHEMA
// ==========================================

const netQuantitySchema = Joi.object({

  value: Joi.number()
    .allow(null)
    .required(),

  unit: Joi.string()
    .allow(null)
    .required(),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .allow(null)
    .required()

}).unknown(false);


// ==========================================
// MRP SCHEMA
// ==========================================

const mrpSchema = Joi.object({

  value: Joi.number()
    .min(0)
    .allow(null)
    .required(),

  currency: Joi.string()
    .allow(null)
    .required(),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .allow(null)
    .required()

}).unknown(false);


// ==========================================
// REGION SCHEMA
// ==========================================

const regionSchema = Joi.object({

  field: Joi.string()
    .valid(
      "PRODUCT_NAME",
      "MRP",
      "NET_QTY",
      "MANUFACTURER",
      "PACKER",
      "IMPORTER",
      "ADDRESS",
      "DATE",
      "CONSUMER_CARE",
      "ORIGIN",
      "DIMENSIONS",
      "OTHER_DECLARATIONS"
    )
    .required(),

  bbox: Joi.array()
    .items(
      Joi.number().min(0)
    )
    .length(4)
    .required(),

  ocrText: Joi.string()
    .allow(null),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .required(),

  sourceImageId: uuidSchema
    .required()

}).unknown(false);


// ==========================================
// IMAGE QUALITY SCHEMA
// ==========================================

const imageQualitySchema = Joi.object({

  imageId: uuidSchema
    .required(),

  blurScore: Joi.number()
    .min(0)
    .required(),

  glareFraction: Joi.number()
    .min(0)
    .max(1)
    .required(),

  skewDegrees: Joi.number()
    .required(),

  accepted: Joi.boolean()
    .required()

}).unknown(false);


// ==========================================
// SCALE SCHEMA
// ==========================================

const scaleSchema = Joi.object({

  established: Joi.boolean()
    .required(),

  pixelsPerMm: Joi.number()
    .positive()
    .allow(null)
    .required(),

  method: Joi.string()
    .valid(
      "REFERENCE_MARKER",
      "PACKAGE_DIMENSION",
      "MULTI_VIEW",
      "NONE"
    )
    .allow(null)
    .required()

}).unknown(false);


// ==========================================
// AI OUTPUT SCHEMA
// This matches the new AI service output
// ==========================================

export const aiOutputSchema = Joi.object({

  product: Joi.object({

    name: confidentStringSchema.required(),

    category: confidentStringSchema.required(),

    netQuantity: netQuantitySchema.required(),

    mrp: mrpSchema.required(),

    manufacturer: confidentStringNullableSchema.required(),

    packer: confidentStringNullableSchema.required(),

    importer: confidentStringNullableSchema.required(),

    manufactureDate: confidentStringNullableSchema.required(),

    consumerCare: Joi.object({
      phone: confidentStringNullableSchema.required(),

      email: confidentStringNullableSchema.required()

    })
      .unknown(false)
      .required(),

    countryOfOrigin:
      confidentStringNullableSchema.required()

  })
    .unknown(false)
    .required(),


  regions: Joi.array()
    .items(regionSchema)
    .required(),


  imageQuality: Joi.array()
    .items(imageQualitySchema)
    .required(),


  scale: scaleSchema
    .required()

}).unknown(false);


// ==========================================
// RULE ENGINE REQUEST SCHEMA
//
// inspectionId belongs to Rule Engine
// aiOutput belongs to AI Service
// ==========================================

export const ruleEngineRequestSchema = Joi.object({

  inspectionId: uuidSchema
    .required(),

  aiOutput: aiOutputSchema
    .required()

}).unknown(false);


// ==========================================
// VALIDATION FUNCTION
// ==========================================

export const validateRuleEngineRequest = (
  data
) => {

  const {
    error,
    value
  } = ruleEngineRequestSchema.validate(
    data,
    {
      abortEarly: false,
      convert: false
    }
  );


  if (error) {

    const messages =
      error.details
        .map(
          (item) => item.message
        )
        .join("; ");


    throw new Error(
      `Rule engine request validation failed: ${messages}`
    );

  }


  return value;

};