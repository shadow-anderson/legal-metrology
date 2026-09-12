const express = require("express");
const cors = require("cors");
require("dotenv/config");

const { PORT } = require("./src/db/config");
const { runComplianceCheck } = require("./src/ruleEngine/runComplianceCheck");

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.get("/health", (_request, response) => {
  response.json({ success: true });
});

app.post("/api/compliance/check", (request, response) => {
  try {
    const result = runComplianceCheck(request.body);
    response.json({
      success: true,
      inspectionId: result.inspectionId,
      applicabilityResult: result.applicability,
      ruleResults: result.ruleResults,
      complianceSummary: result.complianceSummary
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;