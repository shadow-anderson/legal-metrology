const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../db/supabase");
const requireAuth = require("../auth/auth.middleware");

const router = express.Router();

// =====================================================
// GET INSPECTION RESULTS
// GET /api/inspections/:id/results
// =====================================================

router.get(
  "/inspections/:id/results",
  requireAuth,
  async (req, res) => {
    try {
      const inspectionId = req.params.id;

      console.log("RESULTS ROUTE HIT");
      console.log("RESULTS USER:", req.user?.id);
      console.log("RESULTS INSPECTION ID:", inspectionId);

      // Use the authenticated user's JWT for database queries
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Missing authorization token"
        });
      }

      const token = authHeader.split(" ")[1];

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

      // =====================================================
      // 1. Get inspection
      // =====================================================

      const {
        data: inspectionRows,
        error: inspectionError
      } = await userSupabase
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
        console.error(
          "RESULTS INSPECTION QUERY ERROR:",
          inspectionError
        );

        return res.status(500).json({
          error: "Inspection query failed",
          details: inspectionError.message
        });
      }

      const inspection = inspectionRows?.[0];

      if (!inspection) {
        console.error(
          "RESULTS INSPECTION NULL:",
          inspectionId
        );

        return res.status(404).json({
          error: "Inspection not found"
        });
      }

      // =====================================================
      // 2. Get product
      // =====================================================

      const {
        data: product,
        error: productError
      } = await userSupabase
        .from("products")
        .select(`
          id,
          name,
          category,
          commodity_code,
          brand_name,
          created_at,
          updated_at
        `)
        .eq("id", inspection.product_id)
        .maybeSingle();

      if (productError) {
        console.error(
          "Product lookup error:",
          productError
        );
      }

      // =====================================================
      // 3. Get images
      // =====================================================

      const {
        data: images,
        error: imagesError
      } = await userSupabase
        .from("product_images")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("uploaded_at", {
          ascending: true
        });

      if (imagesError) {
        console.error(
          "Images lookup error:",
          imagesError
        );
      }

      // =====================================================
      // 4. Get extracted AI fields
      // =====================================================

      const {
        data: extractedFields,
        error: fieldsError
      } = await userSupabase
        .from("extracted_fields")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true
        });

      if (fieldsError) {
        console.error(
          "Extracted fields lookup error:",
          fieldsError
        );
      }

      // =====================================================
      // 5. Get applicability result
      // =====================================================

      const {
        data: applicability,
        error: applicabilityError
      } = await userSupabase
        .from("applicability_results")
        .select("*")
        .eq("inspection_id", inspectionId)
        .maybeSingle();

      if (applicabilityError) {
        console.error(
          "Applicability lookup error:",
          applicabilityError
        );
      }

      // =====================================================
      // 6. Get rule results
      // =====================================================

      const {
        data: ruleResults,
        error: ruleResultsError
      } = await userSupabase
        .from("rule_results")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true
        });

      if (ruleResultsError) {
        console.error(
          "Rule results lookup error:",
          ruleResultsError
        );
      }

      // =====================================================
      // 7. Get evidence
      // =====================================================

      const {
        data: evidence,
        error: evidenceError
      } = await userSupabase
        .from("evidence")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true
        });

      if (evidenceError) {
        console.error(
          "Evidence lookup error:",
          evidenceError
        );
      }

      // =====================================================
      // 8. Get measurements
      // =====================================================

      const {
        data: measurements,
        error: measurementsError
      } = await userSupabase
        .from("measurements")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true
        });

      if (measurementsError) {
        console.error(
          "Measurements lookup error:",
          measurementsError
        );
      }

      // =====================================================
      // 9. Return Results
      // =====================================================

      return res.status(200).json({
        inspection: {
          id: inspection.id,
          productId: inspection.product_id,
          officerId: inspection.officer_id,
          inspectionType: inspection.inspection_type,
          status: inspection.status,
          overallResult: inspection.overall_result || null,
          context: inspection.context_json,
          createdAt: inspection.created_at,
          updatedAt: inspection.updated_at
        },

        product: product || null,

        images: images || [],

        aiFindings: extractedFields || [],

        applicability: applicability || null,

        ruleResults: ruleResults || [],

        evidence: evidence || [],

        measurements: measurements || []
      });

    } catch (error) {
      console.error(
        "Results API error:",
        error
      );

      return res.status(500).json({
        error: "Internal server error"
      });
    }
  }
);

module.exports = router;