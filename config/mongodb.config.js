const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose
    .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log("Database connection failed.", err));

module.exports = mongoose;
