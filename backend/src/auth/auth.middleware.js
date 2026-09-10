const supabase = require("../db/supabase");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid authorization token"
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Invalid or expired token"
      });
    }

    req.user = data.user;

    next();
  } catch (error) {
    console.error("Auth error:", error);

    return res.status(401).json({
      error: "Authentication failed"
    });
  }
};

module.exports = requireAuth;