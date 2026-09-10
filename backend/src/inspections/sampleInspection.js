const sampleInspection = {
  inspectionId: "550e8400-e29b-41d4-a716-446655440000",

  product: {
    commodity_name: "Biscuits",

    physical_form: "solid",

    measurement_type: "WEIGHT",

    net_quantity: {
      value: 10,
      unit: "kg",
      raw_text: "Net Quantity: 10 kg"
    },

    quantity_declaration: "Net Quantity: 10 kg",

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

    identifying_mark: "ABC-FOODS-2026",

    month_year: "09/2026",

    retail_sale_price: {
      value: 50,
      currency: "INR"
    },

    dimensions: {
      length: 20,
      width: 10,
      height: 5,
      unit: "cm"
    },

    package_capacity: {
      value: 1000,
      unit: "cubic cm"
    },

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
      numeral_height_mm: 5,

      letter_height_mm: 5,

      letter_width_mm: 3,

      declaration_style: "normal",

      quantity_numeral_height_mm: 5,

      quantity_clearance: {
        top: 6,
        bottom: 6,
        left: 12,
        right: 12
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

      handwritten: false,

      outer_wrapper_present: false,

      outer_wrapper_declarations_present: false
    },

    package: {
      has_outer_wrapper: false,

      outer_wrapper_transparent: false
    }
  }
};

export default sampleInspection;