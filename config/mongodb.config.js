const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log("Database connection failed.", err));

module.exports = mongoose;
