const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose.connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            console.log("Database connection failed.");
        }
        console.log("Successfully connected to MongoDB.");
    }
);

export default mongoose;
