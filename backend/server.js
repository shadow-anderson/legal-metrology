require("dotenv").config();
const express = require("express")
const cors = require("cors");
const config = require("./src/config/config");
// const ConnectDB = require("./config/database.js")

//Step-1
const app = express()
console.log("Server is running...")

//Step-2
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

//Step-3
const PORT = config.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

//Step-4
// ConnectDB();