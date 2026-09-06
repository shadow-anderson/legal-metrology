const express = require("express");
const crypto = require("crypto");

const supabase = require("../db/supabase");

const router = express.Router();

router.post("/inspections", async (req, res) => {
  try {
    const { productId, officerId, inspectionType } = req.body;

    if (!productId || !officerId || !inspectionType) {
      return res.status(400).json({
        error: "productId, officerId and inspectionType are required"
      });
    }

    const { data, error } = await supabase
      .from("inspections")
      .insert({
        product_id: productId,
        officer_id: officerId,
        inspection_type: inspectionType,
        status: "DRAFT"
      })
      .select()
      .single();

      console.log("Created inspection:", data);
      console.log("Create error:", error);

    if (error) {
      console.error("Database error:", error);

      return res.status(500).json({
        error: "Failed to create inspection"
      });
    }

    res.status(201).json({
      message: "Inspection created successfully",
      inspection: data
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

router.post("/inspections/:id/images/upload-url", async (req, res) => {
  try {
    const inspectionId = req.params.id;
    const { viewType, fileExtension } = req.body;

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${inspectionId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .createSignedUploadUrl(filePath);

  if (error) {
  console.error("Supabase Storage error:", error);

  return res.status(500).json({
    error: "Failed to create upload URL"
  });
}

    res.json({
      inspectionId,
      viewType,
      filePath,
      signedUrl: data.signedUrl,
      token: data.token
    });

  } catch (error) {
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

router.post("/inspections/:id/images/", async (req, res) => {
  try {
    const inspectionId = req.params.id;

    const { data: inspection, error: inspectionError } = await supabase
  .from("inspections")
  .select("id")
  .eq("id", inspectionId)
  .single();

console.log("Inspection check:", inspection);
console.log("Inspection check error:", inspectionError);
    
    const { filePath, viewType } = req.body;

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        inspection_id: inspectionId,
        storage_path: filePath,
        view_type: viewType
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      return res.status(500).json({
        error: "Failed to save image metadata"
      });
    }

    res.status(201).json({
      message: "Image confirmed and metadata saved",
      image: data
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

module.exports = router;