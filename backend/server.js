const supabase = require("./src/db/supabase");
const express = require("express");
const inspectionRoutes = require("./src/api/inspection.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use(inspectionRoutes);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});