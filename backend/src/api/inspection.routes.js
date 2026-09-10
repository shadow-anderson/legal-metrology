const express = require("express");
const crypto = require("crypto");

const supabase = require("../db/supabase");
const requireAuth = require("../auth/auth.middleware");

const router = express.Router();


// =====================================================
// CREATE INSPECTION
// POST /api/inspections
// =====================================================

router.post("/inspections", requireAuth, async (req, res) => {
  try {
    const {
      productId,
      inspectionType,
      context
    } = req.body;

    // 1. Validate request
    if (!productId || !inspectionType || !context) {
      return res.status(400).json({
        error: "productId, inspectionType and context are required"
      });
    }

    // 2. Find internal user using Supabase Auth ID
    const { data: officer, error: officerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("supabase_auth_id", req.user.id)
      .single();

    if (officerError || !officer) {
      return res.status(403).json({
        error: "User is not registered as an officer"
      });
    }

    // 3. Check role
    if (
      officer.role !== "INSPECTOR" &&
      officer.role !== "SUPERVISOR"
    ) {
      return res.status(403).json({
        error: "Insufficient permissions"
      });
    }

    // 4. Verify product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    // 5. Create inspection
    const { data, error } = await supabase
      .from("inspections")
      .insert({
        product_id: productId,
        officer_id: officer.id,
        inspection_type: inspectionType,
        status: "DRAFT",
        context_json: context
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      return res.status(500).json({
        error: "Failed to create inspection"
      });
    }

    console.log("Created inspection:", data);

    // 6. Return created inspection
    return res.status(201).json({
      message: "Inspection created successfully",
      inspection: {
        id: data.id,
        productId: data.product_id,
        officerId: data.officer_id,
        inspectionType: data.inspection_type,
        status: data.status,
        overallResult: data.overall_result || null,
        context: data.context_json,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
});


// =====================================================
// GENERATE IMAGE UPLOAD URL
// POST /api/inspections/:id/images/upload-url
// =====================================================

router.post(
  "/inspections/:id/images/upload-url",
  requireAuth,
  async (req, res) => {
    try {
      const inspectionId = req.params.id;
      const {
        viewType,
        fileExtension
      } = req.body;

      // 1. Validate request
      if (!viewType || !fileExtension) {
        return res.status(400).json({
          error: "viewType and fileExtension are required"
        });
      }

      // 2. Check inspection exists
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .select("id")
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspection) {
        return res.status(404).json({
          error: "Inspection not found"
        });
      }

      // 3. Generate unique file path
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${inspectionId}/${fileName}`;

      // 4. Generate signed upload URL
      const { data, error } = await supabase.storage
        .from("product-images")
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error("Supabase Storage error:", error);

        return res.status(500).json({
          error: "Failed to create upload URL"
        });
      }

      return res.status(200).json({
        inspectionId,
        viewType,
        filePath,
        signedUrl: data.signedUrl,
        token: data.token
      });

    } catch (error) {
      console.error("Server error:", error);

      return res.status(500).json({
        error: "Internal server error"
      });
    }
  }
);


// =====================================================
// CONFIRM IMAGE
// POST /api/inspections/:id/images/confirm
// =====================================================

router.post(
  "/inspections/:id/images/confirm",
  requireAuth,
  async (req, res) => {
    try {
      const inspectionId = req.params.id;

      const {
        filePath,
        viewType,
        mimeType,
        fileSizeBytes,
        widthPx,
        heightPx
      } = req.body;

      // 1. Validate required metadata
      if (
        !filePath ||
        !viewType ||
        !mimeType ||
        !fileSizeBytes ||
        !widthPx ||
        !heightPx
      ) {
        return res.status(400).json({
          error:
            "filePath, viewType, mimeType, fileSizeBytes, widthPx and heightPx are required"
        });
      }

      // 2. Check inspection exists
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .select("id, status")
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspection) {
        return res.status(404).json({
          error: "Inspection not found"
        });
      }

      // 3. Save image metadata
      const { data: image, error: imageError } = await supabase
        .from("product_images")
        .insert({
          inspection_id: inspectionId,
          storage_path: filePath,
          view_type: viewType,
          mime_type: mimeType,
          file_size_bytes: fileSizeBytes,
          width_px: widthPx,
          height_px: heightPx,
          quality_status: "PENDING"
        })
        .select()
        .single();

      if (imageError) {
        console.error("Image metadata error:", imageError);

        return res.status(500).json({
          error: "Failed to save image metadata"
        });
      }

      // 4. Create AI job
      const { data: job, error: jobError } = await supabase
        .from("ai_jobs")
        .insert({
          inspection_id: inspectionId,
          status: "PENDING",
          payload: {
            inspectionId,
            imageId: image.id,
            imagePath: filePath,
            viewType
          }
        })
        .select()
        .single();

      if (jobError) {
        console.error("AI job error:", jobError);

        return res.status(500).json({
          error: "Failed to create AI job"
        });
      }

      // 5. Move inspection to PROCESSING
      const { error: statusError } = await supabase
        .from("inspections")
        .update({
          status: "PROCESSING",
          updated_at: new Date().toISOString()
        })
        .eq("id", inspectionId);

      if (statusError) {
        console.error("Inspection status error:", statusError);

        return res.status(500).json({
          error: "Failed to update inspection status"
        });
      }

      // 6. Return 202 because AI processing is asynchronous
      return res.status(202).json({
        message: "Image confirmed and AI job queued",
        inspectionId,
        image,
        job,
        status: "PROCESSING"
      });

    } catch (error) {
      console.error("Server error:", error);

      return res.status(500).json({
        error: "Internal server error"
      });
    }
  }
);

// =====================================================
// PROCESS INSPECTION
// POST /api/inspections/:id/process
// =====================================================

router.post(
  "/inspections/:id/process",
  requireAuth,
  async (req, res) => {
    try {
      const inspectionId = req.params.id;

      const authHeader = req.headers.authorization;
      const token = authHeader.split(" ")[1];

      const { createClient } = require("@supabase/supabase-js");

      const userSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      // Get inspection
      const { data: inspection, error: inspectionError } =
        await userSupabase
          .from("inspections")
          .select(`
            id,
            product_id,
            officer_id,
            inspection_type,
            status,
            overall_result,
            context_json,
            created_at,
            updated_at
          `)
          .eq("id", inspectionId)
          .limit(1);

      if (inspectionError) {
        console.error("Process inspection lookup error:", inspectionError);

        return res.status(500).json({
          error: "Inspection lookup failed",
          details: inspectionError.message
        });
      }

      const currentInspection = inspection?.[0];

      if (!currentInspection) {
        return res.status(404).json({
          error: "Inspection not found"
        });
      }

      // For MVP, processing is considered complete
      // using the already persisted AI findings.
      const { data: updatedRows, error: updateError } =
        await userSupabase
          .from("inspections")
          .update({
            status: "AI_EXTRACTED",
            updated_at: new Date().toISOString()
          })
          .eq("id", inspectionId)
          .select(`
            id,
            product_id,
            officer_id,
            inspection_type,
            status,
            overall_result,
            context_json,
            created_at,
            updated_at
          `);

      if (updateError) {
        console.error("Process update error:", updateError);

        return res.status(500).json({
          error: "Failed to process inspection",
          details: updateError.message
        });
      }

      const updatedInspection = updatedRows?.[0];

if (!updatedInspection) {
  return res.status(404).json({
    error: "Inspection could not be updated"
  });
}

return res.status(200).json({
  message: "Inspection processed successfully",
  inspection: {
    id: updatedInspection.id,
    productId: updatedInspection.product_id,
    officerId: updatedInspection.officer_id,
    inspectionType: updatedInspection.inspection_type,
    status: updatedInspection.status,
    overallResult: updatedInspection.overall_result,
    context: updatedInspection.context_json,
    createdAt: updatedInspection.created_at,
    updatedAt: updatedInspection.updated_at
  }
});

    } catch (error) {
      console.error("Process API error:", error);

      return res.status(500).json({
        error: "Internal server error"
      });
    }
  }
);
module.exports = router;