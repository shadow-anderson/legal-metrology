const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const supabase = require("../db/supabase");
const requireAuth = require("../auth/auth.middleware");

const router = express.Router();

// =====================================================
// Convert database snake_case keys to API camelCase
// =====================================================

function snakeToCamel(value) {
  if (Array.isArray(value)) {
    return value.map(snakeToCamel);
  }

  if (value !== null && typeof value === "object") {
    return Object.keys(value).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      result[camelKey] = snakeToCamel(value[key]);

      return result;
    }, {});
  }

  return value;
}

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

      // =====================================================
      // 1. Get authenticated user's JWT
      // =====================================================

      const authHeader = req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
      ) {
        return res.status(401).json({
          error: "Missing authorization token",
        });
      }

      const token = authHeader.split(" ")[1];

      // Use authenticated user's JWT for RLS-protected queries
      const userSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      // =====================================================
      // 2. Get inspection
      // =====================================================

      const {
        data: inspection,
        error: inspectionError,
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
        .maybeSingle();

      if (inspectionError) {
        console.error(
          "RESULTS INSPECTION QUERY ERROR:",
          inspectionError
        );

        return res.status(500).json({
          error: "Inspection query failed",
        });
      }

      if (!inspection) {
        return res.status(404).json({
          error: "Inspection not found",
        });
      }

      // =====================================================
      // 3. Check internal officer
      // =====================================================

      const {
        data: officer,
        error: officerError,
      } = await userSupabase
        .from("users")
        .select("id, role")
        .eq("supabase_auth_id", req.user.id)
        .maybeSingle();

      if (officerError) {
        console.error(
          "Officer lookup error:",
          officerError
        );

        return res.status(500).json({
          error: "Officer lookup failed",
        });
      }

      if (!officer) {
        return res.status(403).json({
          error: "User is not registered as an officer",
        });
      }

      // =====================================================
      // 4. Check inspection ownership
      // =====================================================

      if (inspection.officer_id !== officer.id) {
        return res.status(403).json({
          error:
            "You are not authorized to view this inspection",
        });
      }

      // =====================================================
      // 5. Get product
      // =====================================================

      let product = null;

      if (inspection.product_id) {
        const {
          data: productData,
          error: productError,
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

        product = productData || null;
      }

      // =====================================================
      // 6. Get images
      // =====================================================

      const {
        data: images,
        error: imagesError,
      } = await userSupabase
        .from("product_images")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("uploaded_at", {
          ascending: true,
        });

      if (imagesError) {
        console.error(
          "Images lookup error:",
          imagesError
        );

        return res.status(500).json({
          error: "Images lookup failed",
        });
      }

      // =====================================================
      // 7. Get extracted AI fields
      // =====================================================

      const {
        data: extractedFields,
        error: fieldsError,
      } = await userSupabase
        .from("extracted_fields")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true,
        });

      if (fieldsError) {
        console.error(
          "Extracted fields lookup error:",
          fieldsError
        );

        return res.status(500).json({
          error: "AI findings lookup failed",
        });
      }

      // =====================================================
      // 8. Get applicability result
      // =====================================================

      const {
        data: applicability,
        error: applicabilityError,
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

        return res.status(500).json({
          error: "Applicability lookup failed",
        });
      }

      // =====================================================
      // 9. Get rule results
      // =====================================================

      const {
        data: ruleResults,
        error: ruleResultsError,
      } = await userSupabase
        .from("rule_results")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true,
        });

      if (ruleResultsError) {
        console.error(
          "Rule results lookup error:",
          ruleResultsError
        );

        return res.status(500).json({
          error: "Rule results lookup failed",
        });
      }

      // =====================================================
      // 10. Get evidence
      // =====================================================

      const {
        data: evidence,
        error: evidenceError,
      } = await userSupabase
        .from("evidence")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true,
        });

      if (evidenceError) {
        console.error(
          "Evidence lookup error:",
          evidenceError
        );

        return res.status(500).json({
          error: "Evidence lookup failed",
        });
      }

      // =====================================================
      // 11. Get measurements
      // =====================================================

      const {
        data: measurements,
        error: measurementsError,
      } = await userSupabase
        .from("measurements")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", {
          ascending: true,
        });

      if (measurementsError) {
        console.error(
          "Measurements lookup error:",
          measurementsError
        );

        return res.status(500).json({
          error: "Measurements lookup failed",
        });
      }

      // =====================================================
      // 12. Return complete inspection results
      // =====================================================

      return res.status(200).json({
        inspection: {
          id: inspection.id,

          productId: inspection.product_id || null,

          officerId: inspection.officer_id,

          inspectionType:
            inspection.inspection_type,

          status: inspection.status,

          overallResult:
            inspection.overall_result || null,

          context:
            inspection.context_json || {},

          createdAt:
            inspection.created_at,

          updatedAt:
            inspection.updated_at,
        },

        // Convert DB snake_case → API camelCase
        product: snakeToCamel(product),

        images: snakeToCamel(images || []),

        aiFindings:
          snakeToCamel(extractedFields || []),

        applicability:
          snakeToCamel(applicability || null),

        ruleResults:
          snakeToCamel(ruleResults || []),

        evidence:
          snakeToCamel(evidence || []),

        measurements:
          snakeToCamel(measurements || []),
      });

    } catch (error) {
      console.error(
        "Results API error:",
        error
      );

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

module.exports = router;