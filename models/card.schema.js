const mongoose = require("mongoose");

module.exports = mongoose.model(
    "QuestionCard",
    new mongoose.Schema(
        {
            question: {
                type: String,
                default: null,
                required: true,
            },
            type: {
                type: Number,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    ),
    // collection
    "QuestionCard"
);
