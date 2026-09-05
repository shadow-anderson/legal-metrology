const dotenv = require("dotenv");

dotenv.config();

if (!process.env.PORT) {
    throw new Error("PORT is not defined in environment variables");
}

module.exports = {
    PORT: process.env.PORT,
};