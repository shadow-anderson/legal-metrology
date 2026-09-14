const supabase = require("./src/db/supabase");
const {PORT} = require("./src/db/config");
const express = require("express");
const cors = require("cors");
const inspectionRoutes = require("./src/api/inspection.routes");
const resultsRoutes = require("./src/api/results.routes");
const { runComplianceCheck } = require("./src/ruleEngine/runComplianceCheck");

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api", inspectionRoutes);
app.use("/api", resultsRoutes);

app.post("/api/compliance/check", (req, res) => {
  try {
    const result = runComplianceCheck(req.body);

    res.json({
      success: true,
      inspectionId: result.inspectionId,
      applicabilityResult: result.applicability,
      ruleResults: result.ruleResults,
      complianceSummary: result.complianceSummary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;