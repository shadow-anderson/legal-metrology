const express = require("express");
const crypto = require("crypto");

const supabase = require("../db/supabase");
const requireAuth = require("../auth/auth.middleware");
const { runComplianceCheck } = require("../ruleEngine/runComplianceCheck");
const { resolveProduct } = require("../products/productResolver");

const router = express.Router();

// =====================================================
// CREATE INSPECTION
// POST /api/inspections
// =====================================================

router.post("/inspections", requireAuth, async (req, res) => {
  try {
    const { inspectionType } = req.body;

    // 1. Validate request
    if (!inspectionType) {
      return res.status(400).json({
        error: "inspectionType is required",
      });
    }

    // 2. Validate inspection type
    if (
      inspectionType !== "LABEL_COMPLIANCE" &&
      inspectionType !== "PHYSICAL_QUANTITY"
    ) {
      return res.status(400).json({
        error: "Invalid inspectionType",
      });
    }

    // 3. Find internal user using Supabase Auth ID
    const { data: officer, error: officerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("supabase_auth_id", req.user.id)
      .single();

    if (officerError || !officer) {
      return res.status(403).json({
        error: "User is not registered as an officer",
      });
    }

    // 4. Check officer role
    if (officer.role !== "INSPECTOR" && officer.role !== "SUPERVISOR") {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    // 5. Create inspection
    // Product and context will be populated after
    // image/AI processing.
    const { data, error } = await supabase
      .from("inspections")
      .insert({
        officer_id: officer.id,
        inspection_type: inspectionType,
        status: "DRAFT",
        context_json: {},
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      return res.status(500).json({
        error: "Failed to create inspection",
      });
    }

    // 6. Return created inspection
    return res.status(201).json({
      message: "Inspection created successfully",

      inspection: {
        id: data.id,
        productId: data.product_id || null,
        officerId: data.officer_id,
        inspectionType: data.inspection_type,
        status: data.status,
        overallResult: data.overall_result || null,
        context: data.context_json,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error",
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

      const { viewType, fileExtension } = req.body;

      // 1. Validate request
      if (!viewType || !fileExtension) {
        return res.status(400).json({
          error: "viewType and fileExtension are required",
        });
      }

      // 2. Validate file extension
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

      const normalizedExtension = String(fileExtension).toLowerCase();

      if (!allowedExtensions.includes(normalizedExtension)) {
        return res.status(400).json({
          error: "Unsupported file extension",
        });
      }

      // 3. Check inspection exists
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .select("id")
        .eq("id", inspectionId)
        .single();

      if (inspectionError || !inspection) {
        return res.status(404).json({
          error: "Inspection not found",
        });
      }

      // 4. Generate unique file path
      const fileName = `${crypto.randomUUID()}.${normalizedExtension}`;

      const filePath = `${inspectionId}/${fileName}`;

      // 5. Generate signed upload URL
      const { data, error } = await supabase.storage
        .from("product-images")
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error("Supabase Storage error:", error);

        return res.status(500).json({
          error: "Failed to create upload URL",
        });
      }

      // 6. Return upload information
      return res.status(200).json({
        inspectionId,
        viewType,
        filePath,
        signedUrl: data.signedUrl,
        token: data.token,
      });
    } catch (error) {
      console.error("Server error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
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

      const { filePath, viewType, mimeType, fileSizeBytes, widthPx, heightPx } =
        req.body;

      // 1. Validate required metadata
      if (
        !filePath ||
        !viewType ||
        !mimeType ||
        fileSizeBytes === undefined ||
        widthPx === undefined ||
        heightPx === undefined
      ) {
        return res.status(400).json({
          error:
            "filePath, viewType, mimeType, fileSizeBytes, widthPx and heightPx are required",
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
          error: "Inspection not found",
        });
      }

      // 3. Verify that the file belongs to this inspection
      if (!filePath.startsWith(`${inspectionId}/`)) {
        return res.status(400).json({
          error: "Invalid filePath for this inspection",
        });
      }

      // 4. Save image metadata
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
          quality_status: "PENDING",
        })
        .select()
        .single();

      if (imageError) {
        console.error("Image metadata error:", imageError);

        return res.status(500).json({
          error: "Failed to save image metadata",
        });
      }

      // 5. Move inspection to PROCESSING
      // AI processing is handled by the /process endpoint.
      const { error: statusError } = await supabase
        .from("inspections")
        .update({
          status: "PROCESSING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", inspectionId);

      if (statusError) {
        console.error("Inspection status error:", statusError);

        return res.status(500).json({
          error: "Failed to update inspection status",
        });
      }

      // 6. Return confirmation
      return res.status(202).json({
        message: "Image confirmed successfully",
        inspectionId,
        image: {
          id: image.id,
          inspectionId: image.inspection_id,
          storagePath: image.storage_path,
          viewType: image.view_type,
          mimeType: image.mime_type,
          fileSizeBytes: image.file_size_bytes,
          widthPx: image.width_px,
          heightPx: image.height_px,
          qualityStatus: image.quality_status,
          uploadedAt: image.uploaded_at,
        },
        status: "PROCESSING",
      });
    } catch (error) {
      console.error("Server error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

// =====================================================
// PROCESS INSPECTION
// POST /api/inspections/:id/process
// =====================================================

router.post("/inspections/:id/process", requireAuth, async (req, res) => {
  try {
    const inspectionId = req.params.id;

    // 1. Get inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select(
        `
          id,
          product_id,
          officer_id,
          inspection_type,
          status,
          overall_result,
          context_json,
          created_at,
          updated_at
        `,
      )
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspection) {
      return res.status(404).json({
        error: "Inspection not found",
      });
    }

    // 2. Find authenticated internal officer
    const { data: officer, error: officerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("supabase_auth_id", req.user.id)
      .single();

    if (officerError || !officer) {
      return res.status(403).json({
        error: "User is not registered as an officer",
      });
    }

    // 3. Check officer role
    if (officer.role !== "INSPECTOR" && officer.role !== "SUPERVISOR") {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    // 4. Check inspection ownership
    if (inspection.officer_id !== officer.id) {
      return res.status(403).json({
        error: "You are not authorized to process this inspection",
      });
    }

    // 5. Get all confirmed images
    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select(
        `
          id,
          storage_path,
          view_type,
          mime_type,
          file_size_bytes,
          width_px,
          height_px,
          quality_status
        `,
      )
      .eq("inspection_id", inspectionId)
      .order("uploaded_at", {
        ascending: true,
      });

    if (imagesError) {
      console.error("Process images lookup error:", imagesError);

      return res.status(500).json({
        error: "Failed to get inspection images",
      });
    }

    // 6. Make sure there is at least one image
    if (!images || images.length === 0) {
      return res.status(400).json({
        error: "No confirmed images found for this inspection",
      });
    }

    // 7. Prevent duplicate active processing jobs
    const { data: existingJobs, error: existingJobsError } = await supabase
      .from("ai_jobs")
      .select("id, status")
      .eq("inspection_id", inspectionId)
      .in("status", ["PENDING", "PROCESSING"])
      .limit(1);

    if (existingJobsError) {
      console.error("AI job lookup error:", existingJobsError);

      return res.status(500).json({
        error: "Failed to check existing AI jobs",
      });
    }

    if (existingJobs && existingJobs.length > 0) {
      return res.status(409).json({
        error: "AI processing is already in progress",
        jobId: existingJobs[0].id,
        status: existingJobs[0].status,
      });
    }

    // 8. Prepare AI job payload
    const jobPayload = {
      inspectionId,
      inspectionType: inspection.inspection_type,
      images: images.map((image) => ({
        imageId: image.id,
        storagePath: image.storage_path,
        viewType: image.view_type,
        mimeType: image.mime_type,
        fileSizeBytes: image.file_size_bytes,
        widthPx: image.width_px,
        heightPx: image.height_px,
      })),
    };

    // TEMPORARY MOCK AI OUTPUT
    const mockAiOutput = {
      product: {
        name: {
          value: "Dove Shampoo",
          confidence: 0.98,
        },
        category: {
          value: "Shampoo",
          confidence: 0.95,
        },
        netQuantity: {
          value: 180,
          unit: "ml",
          confidence: 0.98,
        },
        mrp: {
          value: 220,
          currency: "INR",
          confidence: 0.99,
        },
        manufacturer: {
          value: "Hindustan Unilever Limited",
          confidence: 0.96,
        },
        packer: {
          value: null,
          confidence: null,
        },
        importer: {
          value: null,
          confidence: null,
        },
        manufactureDate: {
          value: "2026-08",
          confidence: 0.88,
        },
        consumerCare: {
          phone: {
            value: "1800-123-7890",
            confidence: 0.91,
          },
          email: {
            value: "care@example.com",
            confidence: 0.91,
          },
        },
        countryOfOrigin: {
          value: null,
          confidence: null,
        },
      },

      regions: [
        {
          field: "PRODUCT_NAME",
          bbox: [100, 100, 300, 150],
          ocrText: "Dove Shampoo",
          confidence: 0.98,
          sourceImageId: images[0].id,
        },
        {
          field: "NET_QTY",
          bbox: [100, 200, 250, 240],
          ocrText: "180 ml",
          confidence: 0.98,
          sourceImageId: images[0].id,
        },
        {
          field: "MRP",
          bbox: [100, 300, 250, 340],
          ocrText: "MRP ₹220",
          confidence: 0.99,
          sourceImageId: images[0].id,
        },
        {
          field: "MANUFACTURER",
          bbox: [100, 400, 350, 450],
          ocrText: "Hindustan Unilever Limited",
          confidence: 0.96,
          sourceImageId: images[0].id,
        },
        {
          field: "ADDRESS",
          bbox: [100, 500, 400, 560],
          ocrText: "Hindustan Unilever Limited",
          confidence: 0.9,
          sourceImageId: images[0].id,
        },
        {
          field: "DATE",
          bbox: [100, 600, 250, 640],
          ocrText: "2026-08",
          confidence: 0.88,
          sourceImageId: images[0].id,
        },
        {
          field: "CONSUMER_CARE",
          bbox: [100, 700, 400, 760],
          ocrText: "1800-123-7890 care@example.com",
          confidence: 0.91,
          sourceImageId: images[0].id,
        },
      ],

      imageQuality: [
        {
          imageId: images[0].id,
          blurScore: 0.95,
          glareFraction: 0.02,
          skewDegrees: 0.5,
          accepted: true,
        },
      ],

      scale: {
        established: true,
        pixelsPerMm: 10.8,
        method: "REFERENCE_MARKER",
      },
    };

    // Resolve product from AI output
    let productResolution;

    try {
      productResolution = await resolveProduct(mockAiOutput);

      console.log("PRODUCT RESOLVED:", productResolution);
    } catch (productError) {
      console.error("Product resolution error:", productError);

      return res.status(500).json({
        error: "Product resolution failed",
        details: productError.message,
      });
    }

    // Link resolved product to inspection
    const { error: productUpdateError } = await supabase
      .from("inspections")
      .update({
        product_id: productResolution.productId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inspectionId);

    if (productUpdateError) {
      console.error("Inspection product update error:", productUpdateError);

      return res.status(500).json({
        error: "Failed to link product to inspection",
        details: productUpdateError.message,
      });
    }

    // 9. Run Rule Engine using mock AI output
    let complianceResult;

    try {
      complianceResult = runComplianceCheck({
        inspectionId,
        aiOutput: mockAiOutput,
      });
    } catch (ruleEngineError) {
      console.error("Rule Engine error:", ruleEngineError);

      return res.status(500).json({
        error: "Rule Engine processing failed",
        details: ruleEngineError.message,
      });
    }

    // 10. Save applicability result
    const applicability = complianceResult.applicability;

    if (applicability) {
      const { error: applicabilityError } = await supabase
        .from("applicability_results")
        .update({
          status: applicability.status,
          context_snapshot: applicability.contextSnapshot,
          applicable_rules: applicability.applicableRules,
          applicable_schedules: applicability.applicableSchedules,
          exemptions: applicability.exemptions,
          reasons: applicability.reasons,
          confirmed_by_officer_id: applicability.confirmedByOfficerId,
          confirmed_at: applicability.confirmedAt,
          evaluated_at: applicability.evaluatedAt,
        })
        .eq("inspection_id", inspectionId);

      if (applicabilityError) {
        console.error("Applicability result save error:", applicabilityError);

        return res.status(500).json({
          error: "Failed to save applicability result",
          details: applicabilityError.message,
          code: applicabilityError.code,
          hint: applicabilityError.hint,
          detailsRaw: applicabilityError.details,
        });
      }
    }

    // 11. Save rule results
    const ruleResults = complianceResult.ruleResults || [];

    if (ruleResults.length > 0) {
      const ruleResultRows = ruleResults.map((result) => ({
        id: result.id,
        inspection_id: inspectionId,
        rule_id: result.ruleId,
        rule_version: result.ruleVersion,
        check_id: result.checkId,
        status: result.status,
        message: result.message,
        observed_value: result.observedValue ?? null,
        required_value: result.requiredValue ?? null,
        confidence: result.confidence,
        result_source: result.resultSource,
        verification_action: result.verificationAction ?? null,
        verified_by_officer_id: result.verifiedByOfficerId ?? null,
        verified_at: result.verifiedAt ?? null,
        created_at: result.createdAt,
      }));

      const { error: ruleResultsError } = await supabase
        .from("rule_results")
        .upsert(ruleResultRows, {
          onConflict: "inspection_id,rule_id,check_id",
        });

      if (ruleResultsError) {
        console.error("Rule results save error:", ruleResultsError);

        return res.status(500).json({
          error: "Failed to save rule results",
        });
      }
    }

    // 12. Update inspection with compliance result
    const overallStatus =
      complianceResult.complianceSummary?.overallStatus ||
      complianceResult.status ||
      "REQUIRES_VERIFICATION";

    const { error: inspectionUpdateError } = await supabase
      .from("inspections")
      .update({
        overall_result: overallStatus,
        status: "AI_EXTRACTED",
        context_json:
          complianceResult.normalizedInspection ||
          inspection.context_json ||
          {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", inspectionId);

    if (inspectionUpdateError) {
      console.error("Inspection result update error:", inspectionUpdateError);

      return res.status(500).json({
        error: "Failed to update inspection result",
      });
    }

    // 13. Return completed AI extraction result
    return res.status(200).json({
      message: "Inspection processed successfully",
      inspectionId,
      status: "AI_EXTRACTED",
    });
  } catch (error) {
    console.error("Process API error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// =====================================================
// VERIFY AI FINDING - HLD ROUTE
// POST /api/inspections/:id/verify
// =====================================================

router.post("/inspections/:id/verify", requireAuth, async (req, res) => {
  try {
    const inspectionId = req.params.id;

    const { findingId, verificationStatus, officerValue } = req.body;

    // 1. Validate request
    if (!findingId || !verificationStatus) {
      return res.status(400).json({
        error: "findingId and verificationStatus are required",
      });
    }

    // 2. Validate verification status
    const allowedStatuses = ["VERIFIED", "CORRECTED", "REJECTED"];

    if (!allowedStatuses.includes(verificationStatus)) {
      return res.status(400).json({
        error: "verificationStatus must be VERIFIED, CORRECTED or REJECTED",
      });
    }

    // 3. Find internal officer
    const { data: officer, error: officerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("supabase_auth_id", req.user.id)
      .single();

    if (officerError || !officer) {
      return res.status(403).json({
        error: "User is not registered as an officer",
      });
    }

    // 4. Check role
    if (officer.role !== "INSPECTOR" && officer.role !== "SUPERVISOR") {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    // 5. Check inspection ownership
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select("id, officer_id")
      .eq("id", inspectionId)
      .single();

    if (inspectionError || !inspection) {
      return res.status(404).json({
        error: "Inspection not found",
      });
    }

    if (inspection.officer_id !== officer.id) {
      return res.status(403).json({
        error: "You are not authorized to verify this inspection",
      });
    }

    // 6. Find AI finding
    const { data: finding, error: findingError } = await supabase
      .from("extracted_fields")
      .select(
        `
        id,
        inspection_id,
        field_name,
        ai_value,
        ai_confidence,
        officer_value,
        officer_id,
        verification_status
      `,
      )
      .eq("id", findingId)
      .eq("inspection_id", inspectionId)
      .single();

    if (findingError || !finding) {
      return res.status(404).json({
        error: "AI finding not found",
      });
    }

    // 7. Prepare update
    const updateData = {
      verification_status: verificationStatus,
      officer_id: officer.id,
      corrected_at: new Date().toISOString(),
    };

    if (verificationStatus === "CORRECTED" && officerValue !== undefined) {
      updateData.officer_value = officerValue;
    }

    if (verificationStatus === "VERIFIED") {
      updateData.officer_value = finding.ai_value;
    }

    // 8. Update verification
    const { data: updatedFinding, error: updateError } = await supabase
      .from("extracted_fields")
      .update(updateData)
      .eq("id", findingId)
      .eq("inspection_id", inspectionId)
      .select(
        `
        id,
        inspection_id,
        field_name,
        ai_value,
        ai_confidence,
        officer_value,
        officer_id,
        corrected_at,
        verification_status
      `,
      )
      .single();

    if (updateError) {
      console.error("Verification update error:", updateError);

      return res.status(500).json({
        error: "Failed to verify AI finding",
      });
    }

    // 9. Return verification
    return res.status(200).json({
      message: "AI finding verified successfully",
      verification: {
        id: updatedFinding.id,
        inspectionId: updatedFinding.inspection_id,
        fieldName: updatedFinding.field_name,
        aiValue: updatedFinding.ai_value,
        aiConfidence: updatedFinding.ai_confidence,
        officerValue: updatedFinding.officer_value,
        officerId: updatedFinding.officer_id,
        correctedAt: updatedFinding.corrected_at,
        verificationStatus: updatedFinding.verification_status,
      },
    });
  } catch (error) {
    console.error("Verification API error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;
