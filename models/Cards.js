const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema, "Cards");

const findByType = (type) => {
    return Card.find({ type: type });
};

module.exports = { Card, findByType };
