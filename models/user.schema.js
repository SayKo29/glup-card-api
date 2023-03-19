const mongoose = require("mongoose");

module.exports = mongoose.model(
    "User",
    new mongoose.Schema(
        {
            name: {
                type: String,
                default: null,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    ),
    // collection
    "users"
);
