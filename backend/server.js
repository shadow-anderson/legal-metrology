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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});