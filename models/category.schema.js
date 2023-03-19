const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Category",
    new mongoose.Schema(
        {
            name: {
                type: String,
                default: null,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
                default: null,
                required: false,
            },
        },
        {
            timestamps: true,
        }
    ),
    // collection
    "categories"
);
