const supabase = require("./src/db/supabase");
const express = require("express");
const inspectionRoutes = require("./src/api/inspection.routes");
const aiCallbackRoutes = require("./src/ai-orchestration/ai-callback.routes");
const resultsRoutes = require("./src/api/results.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api", inspectionRoutes);
app.use("/api", aiCallbackRoutes);
app.use("/api", resultsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});